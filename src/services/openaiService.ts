import type { KeywordSuggestion } from '../types';

let lastDebugResponse: any = null;

export function getLastDebugResponse() {
  return lastDebugResponse;
}

function generateFallbackSuggestions(domain: string): KeywordSuggestion[] {
  // Remove TLD and special characters
  const domainName = domain.split('.')[0].toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  
  // Split into words and filter out empty strings
  const words = domainName.split(/\s+/).filter(word => word.length > 0);
  
  // If no words are found, return generic suggestions
  if (words.length === 0) {
    return [
      { keyword: domain, searchVolume: 'Unknown', difficulty: 'Medium' },
      { keyword: `buy ${domain}`, searchVolume: 'Unknown', difficulty: 'Medium' },
      { keyword: `${domain} price`, searchVolume: 'Unknown', difficulty: 'Medium' },
      { keyword: `${domain} website`, searchVolume: 'Unknown', difficulty: 'Medium' },
      { keyword: `${domain} online`, searchVolume: 'Unknown', difficulty: 'Medium' }
    ];
  }

  // Generate variations using the domain words
  const suggestions: KeywordSuggestion[] = [];
  
  // Add the main domain name
  suggestions.push({
    keyword: domainName,
    searchVolume: 'Unknown',
    difficulty: 'Medium'
  });

  // Add variations with common prefixes/suffixes
  const variations = [
    'buy',
    'best',
    'online',
    'review',
    'price'
  ];

  for (const variation of variations) {
    if (suggestions.length < 5) {
      suggestions.push({
        keyword: `${variation} ${domainName}`,
        searchVolume: 'Unknown',
        difficulty: 'Medium'
      });
    }
  }

  return suggestions.slice(0, 5);
}

export async function generateKeywordSuggestions(domain: string): Promise<KeywordSuggestion[]> {
  try {
    const response = await fetch('/api/keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain })
    });

    if (!response.ok) {
      throw new Error('Failed to generate keywords');
    }

    const suggestions = await response.json();
    lastDebugResponse = suggestions;
    return suggestions;
  } catch (error) {
    console.warn('Keyword generation failed:', error);
    lastDebugResponse = { error };
    return generateFallbackSuggestions(domain);
  }
}