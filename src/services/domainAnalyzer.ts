import { getDomainWhois } from './whoisService';
import { getTrafficEstimate } from './trafficService';
import { generateKeywordSuggestions } from './openaiService';
import type { DomainAnalysis, KeywordSuggestion } from '../types';

function getTldValue(domain: string): string {
  const tld = domain.split('.').pop()?.toLowerCase();
  const highValueTlds = ['com', 'net', 'org'];
  const mediumValueTlds = ['io', 'co', 'app', 'dev'];
  
  if (highValueTlds.includes(tld || '')) return `High (.${tld})`;
  if (mediumValueTlds.includes(tld || '')) return `Medium (.${tld})`;
  return `Standard (.${tld})`;
}

function calculateConfidenceScore(whoisData: any, trafficData: any): number {
  let score = 50; // Base score

  // Add confidence based on available data
  if (whoisData.domainAge !== 'Unknown') score += 15;
  if (trafficData.monthlyVisits !== 'Unknown') score += 15;
  if (whoisData.registrar) score += 10;
  if (whoisData.expiryDate) score += 10;

  return Math.min(score, 100);
}

function calculateDomainValue(domain: string, whoisData: any, trafficData: any): number {
  let value = 500; // Base value for any domain

  // Age factor
  if (whoisData.domainAge !== 'Unknown') {
    const years = parseInt(whoisData.domainAge);
    if (!isNaN(years)) {
      value += Math.min(years * 100, 2000); // Up to $2000 for age
    }
  }

  // TLD factor
  const tld = domain.split('.').pop()?.toLowerCase();
  if (tld === 'com') value *= 1.5;
  else if (['net', 'org'].includes(tld || '')) value *= 1.3;
  else if (['io', 'co', 'app', 'dev'].includes(tld || '')) value *= 1.2;

  // Length factor
  const name = domain.split('.')[0];
  if (name.length <= 4) value *= 1.5;
  else if (name.length <= 6) value *= 1.3;
  else if (name.length <= 8) value *= 1.1;

  // Traffic factor (if available)
  if (typeof trafficData.monthlyVisits === 'number') {
    value += Math.min(trafficData.monthlyVisits * 0.1, 5000);
  }

  return Math.round(value);
}

function generateDetailedAnalysis(domain: string, whoisData: any, trafficData: any): string {
  const tld = domain.split('.').pop()?.toLowerCase();
  const name = domain.split('.')[0];
  
  let analysis = `Domain Analysis for ${domain}:\n\n`;
  
  // Age analysis
  analysis += `• Age: ${whoisData.domainAge}\n`;
  if (whoisData.registrar) analysis += `• Registered with: ${whoisData.registrar}\n`;
  if (whoisData.expiryDate) analysis += `• Expires: ${new Date(whoisData.expiryDate).toLocaleDateString()}\n`;
  
  // Domain characteristics
  analysis += `\n• TLD Analysis: .${tld} ${getTldValue(domain).split(' ')[0].toLowerCase()} value TLD\n`;
  analysis += `• Length: ${name.length} characters\n`;
  
  // Traffic
  if (trafficData.monthlyVisits !== 'Unknown') {
    analysis += `• Monthly Traffic: ${trafficData.monthlyVisits.toLocaleString()} visits\n`;
  } else {
    analysis += `• Traffic data not available\n`;
  }
  
  return analysis;
}

export async function analyzeDomain(domain: string): Promise<DomainAnalysis> {
  try {
    if (!domain) {
      throw new Error('Domain is required');
    }

    // Get WHOIS data
    const whoisData = await getDomainWhois(domain);
    
    // Get traffic data
    const trafficData = await getTrafficEstimate(domain);
    
    // Generate keyword suggestions using ChatGPT
    let suggestedKeywords: KeywordSuggestion[] = [];
    try {
      suggestedKeywords = await generateKeywordSuggestions(domain);
    } catch (error) {
      console.error('Failed to generate keyword suggestions:', error);
      // Provide fallback suggestions based on domain name
      const words = domain.split('.')[0].split(/[^a-zA-Z0-9]+/);
      suggestedKeywords = words.map(word => ({
        keyword: word,
        searchVolume: 'Unknown',
        difficulty: 'Medium'
      }));
    }

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(whoisData, trafficData);
    
    // Calculate domain value
    const estimatedValue = calculateDomainValue(domain, whoisData, trafficData);

    return {
      domain,
      estimatedValue,
      confidenceScore,
      domainAge: whoisData.domainAge,
      monthlyTraffic: trafficData.monthlyVisits,
      seoScore: Math.floor(Math.random() * 20) + 60, // Random score between 60-80
      tldValue: getTldValue(domain),
      detailedAnalysis: generateDetailedAnalysis(domain, whoisData, trafficData),
      suggestedKeywords: suggestedKeywords.slice(0, 5), // Limit to 5 suggestions
      debug: {
        whois: whoisData.debug,
        traffic: trafficData.debug
      }
    };
  } catch (error) {
    console.error('Domain analysis failed:', error);
    throw error;
  }
}