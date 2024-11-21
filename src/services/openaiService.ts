import OpenAI from 'openai';
import type { KeywordSuggestion, ValuationInput } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
console.log('OpenAI initialization:', {
  hasKey: !!API_KEY,
  keyLength: API_KEY?.length,
  keyPrefix: API_KEY?.substring(0, 7),
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE
});

let lastDebugResponse: any = null;
let openai: OpenAI | null = null;

try {
  if (API_KEY) {
    openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OpenAI API key missing from environment');
  }
} catch (error) {
  console.error('OpenAI initialization error:', error);
}

export function getLastDebugResponse() {
  return lastDebugResponse;
}

function generateFallbackSuggestions(domain: string): KeywordSuggestion[] {
  const baseDomain = domain.split('.')[0].toLowerCase();
  return [
    {
      keyword: baseDomain,
      searchVolume: 'Unknown',
      difficulty: 'Medium'
    },
    {
      keyword: `buy ${baseDomain}`,
      searchVolume: 'Unknown',
      difficulty: 'Medium'
    },
    {
      keyword: `${baseDomain} online`,
      searchVolume: 'Unknown',
      difficulty: 'Medium'
    },
    {
      keyword: `${baseDomain} service`,
      searchVolume: 'Unknown',
      difficulty: 'Medium'
    },
    {
      keyword: `${baseDomain} website`,
      searchVolume: 'Unknown',
      difficulty: 'Easy'
    }
  ];
}

function parseKeywordResponse(content: string, domain: string): KeywordSuggestion[] {
  try {
    console.log('[OpenAI] Parsing keyword response:', content);
    const keywords: KeywordSuggestion[] = [];
    
    // First try parsing as JSON array
    try {
      const jsonArray = JSON.parse(`[${content.replace(/}\s*{/g, '},{')}]`);
      for (const item of jsonArray) {
        if (item.keyword) {
          keywords.push({
            keyword: item.keyword,
            searchVolume: item.searchVolume || 'Unknown',
            difficulty: item.difficulty || 'Medium'
          });
        }
      }
      if (keywords.length > 0) {
        console.log('[OpenAI] Successfully parsed JSON array:', keywords);
        return keywords.slice(0, 5);
      }
    } catch (e) {
      console.log('[OpenAI] Failed to parse as JSON array, trying line-by-line');
    }

    // Try line by line parsing
    const lines = content.split('\n').filter(line => line.trim());
    for (const line of lines) {
      // Try to extract JSON objects from the line
      const jsonMatches = line.match(/\{[^}]+\}/g);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            if (parsed.keyword) {
              keywords.push({
                keyword: parsed.keyword,
                searchVolume: parsed.searchVolume || 'Unknown',
                difficulty: parsed.difficulty || 'Medium'
              });
            }
          } catch (e) {
            console.log('[OpenAI] Failed to parse JSON object:', match);
          }
        }
      } else {
        // Try extracting keyword from plain text
        const keywordMatch = line.match(/["']([^"']+)["']/);
        if (keywordMatch) {
          keywords.push({
            keyword: keywordMatch[1],
            searchVolume: 'Unknown',
            difficulty: 'Medium'
          });
        }
      }

      // Stop if we have 5 keywords
      if (keywords.length >= 5) {
        break;
      }
    }

    console.log('[OpenAI] Parsed keywords:', keywords);
    return keywords.length > 0 ? keywords : generateFallbackSuggestions(domain);
  } catch (error) {
    console.error('[OpenAI] Failed to parse keyword response:', error);
    return generateFallbackSuggestions(domain);
  }
}

export async function generateKeywordSuggestions(domain: string): Promise<KeywordSuggestion[]> {
  const startTime = performance.now();
  console.log(`[OpenAI] Starting keyword generation for ${domain}`);

  if (!openai) {
    console.warn('[OpenAI] Client not initialized, using fallback suggestions');
    return generateFallbackSuggestions(domain);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a domain name and SEO expert. Generate 5 relevant keyword suggestions for domain names.
Each suggestion should be in this exact format:
{
  "keyword": "example term",
  "searchVolume": "estimated monthly searches",
  "difficulty": "Easy|Medium|Hard"
}

Provide exactly 5 suggestions, one per line.
Do not include any other text or formatting.`
        },
        {
          role: "user",
          content: `Generate 5 relevant keywords for the domain: ${domain}`
        }
      ]
    });

    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Keyword generation completed in ${duration.toFixed(0)}ms`);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('[OpenAI] Empty response, using fallback suggestions');
      return generateFallbackSuggestions(domain);
    }

    lastDebugResponse = {
      content,
      timing: Math.round(duration)
    };

    return parseKeywordResponse(content, domain);
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[OpenAI] Keyword generation failed after ${duration.toFixed(0)}ms:`, error);
    lastDebugResponse = {
      error,
      timing: Math.round(duration)
    };
    return generateFallbackSuggestions(domain);
  }
}

export async function generateDomainValuation(input: ValuationInput) {
  const startTime = performance.now();
  console.log(`[OpenAI] Starting valuation for ${input.domain}`);

  if (!openai) {
    console.warn('[OpenAI] Client not initialized, using fallback valuation');
    return {
      estimatedValue: 500,
      confidenceScore: 60,
      detailedAnalysis: 'Unable to generate analysis at this time.'
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a domain name valuation expert. Follow these guidelines:

1. Consider these key factors when determining value:
   - Domain length (shorter domains are worth significantly more)
   - Domain age (older domains are generally more valuable)
   - TLD value (.com domains typically command higher values)
   - Traffic (higher traffic indicates more value)
   - Brand potential (memorable, brandable domains are worth more)
   - Hyphens (domains with hyphens are worth less)

2. Important considerations:
   - Premium TLDs (.com, .net, .org) typically command higher values
   - Established domains (>5 years) are generally worth more
   - Higher traffic domains deserve significant value increase
   - Short, memorable domains are particularly valuable
   - Each hyphen reduces value by ~40%
   - Single-word .com domains start at $10,000 minimum
   - Two-letter .com domains start at $50,000 minimum
   - Three-letter .com domains start at $25,000 minimum

3. Confidence score factors:
   - Complete registration data increases confidence
   - Known traffic data increases confidence
   - Premium TLDs increase confidence
   - Shorter domains increase confidence

CRITICAL: 
- Be very specific with valuations
- Avoid rounding to nearest thousand
- Consider each factor carefully
- Keep analysis focused on value factors only
- DO NOT discuss confidence scores in the analysis
- Limit analysis to 2-3 concise paragraphs
- Provide detailed reasoning for the valuation

Format:
Estimated Value: $X
Confidence Score: Y%
Analysis: [2-3 paragraphs about value factors only]`
        },
        {
          role: "user",
          content: `Please analyze this domain and provide a detailed valuation:

Domain: ${input.domain}
Age: ${input.domainAge}
TLD: ${input.tld}
Monthly Traffic: ${input.monthlyTraffic}
Registrar: ${input.registrar || 'Unknown'}
Expiry: ${input.expiryDate ? new Date(input.expiryDate).toLocaleDateString() : 'Unknown'}`
        }
      ]
    });

    const response = completion.choices[0]?.message?.content || '';
    const duration = performance.now() - startTime;
    console.log(`[OpenAI] Valuation completed in ${duration.toFixed(0)}ms`);

    lastDebugResponse = {
      response,
      timing: Math.round(duration)
    };

    // Parse the response
    const valueMatch = response.match(/Estimated Value: \$([0-9,]+)/);
    const confidenceMatch = response.match(/Confidence Score: (\d+)%/);
    const analysisMatch = response.match(/Analysis: ([\s\S]+)$/);

    return {
      estimatedValue: valueMatch ? parseInt(valueMatch[1].replace(/,/g, '')) : 500,
      confidenceScore: confidenceMatch ? parseInt(confidenceMatch[1]) : 60,
      detailedAnalysis: analysisMatch ? analysisMatch[1].trim() : 'Analysis not available'
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[OpenAI] Valuation failed after ${duration.toFixed(0)}ms:`, error);
    lastDebugResponse = {
      error,
      timing: Math.round(duration)
    };
    return {
      estimatedValue: 500,
      confidenceScore: 60,
      detailedAnalysis: 'Unable to generate analysis at this time.'
    };
  }
}