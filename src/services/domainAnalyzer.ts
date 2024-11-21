import { getDomainWhois } from './whoisService';
import { getTrafficEstimate } from './trafficService';
import { generateKeywordSuggestions, generateDomainValuation } from './openaiService';
import { getPageSpeedScore } from './pagespeedService';
import type { DomainAnalysis, AnalysisStage } from '../types';

function getTldValue(domain: string): string {
  const tld = domain.split('.').pop()?.toLowerCase();
  const highValueTlds = ['com', 'ai', 'io'];
  const mediumValueTlds = ['net', 'org', 'co', 'app', 'dev'];
  
  if (highValueTlds.includes(tld || '')) return `High (.${tld})`;
  if (mediumValueTlds.includes(tld || '')) return `Medium (.${tld})`;
  return `Standard (.${tld})`;
}

// Track ongoing operations to prevent duplicates
const ongoingOperations = new Map<string, Map<AnalysisStage, Promise<any>>>();

// Track current stage for each domain
const currentStages = new Map<string, AnalysisStage>();

// Updated stage order to put keywords before SEO
const stageOrder: AnalysisStage[] = ['whois', 'traffic', 'keywords', 'seo', 'valuation'];

async function runStageOnce<T>(
  domain: string,
  stage: AnalysisStage,
  operation: () => Promise<T>,
  onStageChange?: (stage: AnalysisStage, retryCount?: number) => void
): Promise<T> {
  // Get or create operations map for this domain
  let domainOperations = ongoingOperations.get(domain);
  if (!domainOperations) {
    domainOperations = new Map();
    ongoingOperations.set(domain, domainOperations);
  }

  // Check if operation is already in progress
  let existingOperation = domainOperations.get(stage);
  if (existingOperation) {
    console.log(`[Analysis] Stage ${stage} already in progress for ${domain}, waiting...`);
    return existingOperation;
  }

  // Only update stage if it's the next one in order
  const currentStage = currentStages.get(domain);
  const currentIndex = currentStage ? stageOrder.indexOf(currentStage) : -1;
  const newIndex = stageOrder.indexOf(stage);
  
  if (!currentStage || newIndex > currentIndex) {
    console.log(`[Analysis] Progressing to stage ${stage} for ${domain}`);
    currentStages.set(domain, stage);
    onStageChange?.(stage);
  } else {
    console.log(`[Analysis] Running stage ${stage} without updating progress (current: ${currentStage})`);
  }

  // Start new operation
  console.log(`[Analysis] Starting stage ${stage} for ${domain}`);
  
  const operationPromise = operation().finally(() => {
    // Clean up after operation completes
    domainOperations?.delete(stage);
    if (domainOperations?.size === 0) {
      ongoingOperations.delete(domain);
      currentStages.delete(domain);
    }
  });

  // Store operation promise
  domainOperations.set(stage, operationPromise);

  return operationPromise;
}

export async function analyzeDomain(
  domain: string,
  onStageChange?: (stage: AnalysisStage, retryCount?: number) => void
): Promise<DomainAnalysis> {
  const startTime = performance.now();
  console.log(`[Analysis] Starting analysis for ${domain}`);

  try {
    if (!domain) {
      throw new Error('Domain is required');
    }

    // Reset current stage for this domain
    currentStages.delete(domain);

    // Sequential API calls with duplicate prevention
    const whoisData = await runStageOnce(domain, 'whois', 
      () => getDomainWhois(domain), 
      onStageChange
    );

    const trafficData = await runStageOnce(domain, 'traffic',
      () => getTrafficEstimate(domain),
      onStageChange
    );

    // Get keywords before SEO analysis
    const suggestedKeywords = await runStageOnce(domain, 'keywords',
      () => generateKeywordSuggestions(domain),
      onStageChange
    );

    const pageSpeedData = await runStageOnce(domain, 'seo',
      () => getPageSpeedScore(domain),
      onStageChange
    );

    // Valuation uses data from previous stages
    const valuation = await runStageOnce(domain, 'valuation',
      () => generateDomainValuation({
        domain,
        domainAge: whoisData.domainAge,
        tld: domain.split('.').pop() || '',
        monthlyTraffic: trafficData.monthlyVisits,
        registrar: whoisData.registrar,
        expiryDate: whoisData.expiryDate
      }),
      onStageChange
    );

    const duration = performance.now() - startTime;
    console.log(`[Analysis] Completed in ${duration.toFixed(0)}ms`);

    return {
      domain,
      estimatedValue: valuation.estimatedValue,
      confidenceScore: valuation.confidenceScore,
      domainAge: whoisData.domainAge,
      monthlyTraffic: trafficData.monthlyVisits,
      seoScore: pageSpeedData.score,
      tldValue: getTldValue(domain),
      detailedAnalysis: valuation.detailedAnalysis,
      suggestedKeywords: suggestedKeywords || [],
      debug: {
        whois: whoisData.debug,
        traffic: trafficData.debug,
        pageSpeed: pageSpeedData.debug,
        timing: Math.round(duration)
      }
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Analysis] Failed after ${duration.toFixed(0)}ms:`, error);
    
    // Clean up ongoing operations for this domain
    ongoingOperations.delete(domain);
    currentStages.delete(domain);
    
    throw error;
  }
}