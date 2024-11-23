import { getDomainWhois } from './whoisService';
import { getTrafficEstimate } from './trafficService';
import { generateKeywordSuggestions, generateDomainValuation } from './openaiService';
import { getPageSpeedScore } from './pagespeedService';
import type { DomainAnalysis, AnalysisStage } from '../types';

interface AnalysisResult {
  whois?: any;
  traffic?: any;
  keywords?: any;
  seo?: any;
  timing: number;
}

const MAX_RETRIES = 1;
const RETRY_DELAY = 2000; // 2 seconds

// Track ongoing analyses to prevent duplicates
const ongoingAnalyses = new Map<string, Promise<any>>();

// Helper function to get TLD value
function getTldValue(domain: string): string {
  const tld = domain.split('.').pop()?.toLowerCase();
  const highValueTlds = ['com', 'ai', 'io'];
  const mediumValueTlds = ['net', 'org', 'co', 'app', 'dev'];
  
  if (highValueTlds.includes(tld || '')) return `High (.${tld})`;
  if (mediumValueTlds.includes(tld || '')) return `Medium (.${tld})`;
  return `Standard (.${tld})`;
}

// Helper function to run a stage with retry
async function runStage<T>(
  domain: string,
  stageName: string,
  action: () => Promise<T>
): Promise<T> {
  const key = `${domain}:${stageName}`;
  
  // Check if analysis is already running
  if (ongoingAnalyses.has(key)) {
    console.log(`[Analysis] Reusing existing ${stageName} analysis for ${domain}`);
    return ongoingAnalyses.get(key);
  }

  const startTime = performance.now();
  let retries = MAX_RETRIES;
  let lastError: Error | null = null;

  const analysisPromise = (async () => {
    while (retries >= 0) {
      try {
        const result = await action();
        console.log(`[Analysis] ${stageName} completed in ${(performance.now() - startTime).toFixed(0)}ms`);
        return result;
      } catch (error) {
        lastError = error;
        if (retries > 0) {
          console.log(`[Analysis] ${stageName} failed, retrying in ${RETRY_DELAY}ms. Attempts remaining: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          retries--;
        } else {
          console.error(`[Analysis] ${stageName} failed after all retries:`, error);
          throw error;
        }
      }
    }
    throw lastError;
  })();

  // Store the promise
  ongoingAnalyses.set(key, analysisPromise);

  // Clean up after completion
  analysisPromise.finally(() => {
    ongoingAnalyses.delete(key);
  });

  return analysisPromise;
}

export async function analyzeDomain(
  domain: string,
  onStageComplete?: (stage: AnalysisStage) => void
): Promise<DomainAnalysis> {
  if (!domain) {
    throw new Error('Domain is required');
  }

  const startTime = performance.now();
  console.log(`[Analysis] Starting analysis for ${domain}`);

  const results: AnalysisResult = {
    timing: 0
  };

  try {
    // Run initial analyses in parallel
    const [whois, traffic, keywords, seo] = await Promise.all([
      // WHOIS Analysis
      runStage(domain, 'whois', () => getDomainWhois(domain))
        .then(result => {
          onStageComplete?.('whois');
          return result;
        }),

      // Traffic Analysis
      runStage(domain, 'traffic', () => getTrafficEstimate(domain))
        .then(result => {
          onStageComplete?.('traffic');
          return result;
        }),

      // Keyword Analysis
      runStage(domain, 'keywords', () => generateKeywordSuggestions(domain))
        .then(result => {
          onStageComplete?.('keywords');
          return result;
        }),

      // SEO Analysis
      runStage(domain, 'seo', () => getPageSpeedScore(domain))
        .then(result => {
          onStageComplete?.('seo');
          return result;
        })
    ]);

    // Store results
    results.whois = whois;
    results.traffic = traffic;
    results.keywords = keywords;
    results.seo = seo;

    // Run valuation with collected data
    const valuationKey = `${domain}:valuation`;
    let valuation;

    // Check if a valuation is already in progress
    if (ongoingAnalyses.has(valuationKey)) {
      console.log(`[Analysis] Reusing existing valuation for ${domain}`);
      valuation = await ongoingAnalyses.get(valuationKey);
    } else {
      // Start new valuation
      const valuationPromise = runStage(domain, 'valuation', () => 
        generateDomainValuation({
          domain,
          domainAge: whois?.domainAge || 'Unknown',
          tld: domain.split('.').pop() || '',
          monthlyTraffic: traffic?.monthlyVisits || 'Unknown',
          registrar: whois?.registrar || null,
          expiryDate: whois?.expiryDate || null
        })
      ).then(result => {
        onStageComplete?.('valuation');
        return result;
      });

      valuation = await valuationPromise;
    }

    results.timing = Math.round(performance.now() - startTime);

    return {
      domain,
      estimatedValue: valuation.estimatedValue,
      confidenceScore: valuation.confidenceScore,
      domainAge: whois?.domainAge || 'Unknown',
      monthlyTraffic: traffic?.monthlyVisits || 'Unknown',
      seoScore: seo?.score || 50,
      tldValue: getTldValue(domain),
      detailedAnalysis: valuation.detailedAnalysis,
      suggestedKeywords: keywords || [],
      debug: {
        whois: whois?.debug,
        traffic: traffic?.debug,
        seo: seo?.debug,
        timing: results.timing
      }
    };
  } catch (error) {
    console.error('[Analysis] Analysis failed:', error);
    throw error;
  }
}