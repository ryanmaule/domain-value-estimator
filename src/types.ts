export interface RankingKeyword {
  term: string;
  position: number;
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface TrafficData {
  monthlyVisits: number | 'Unknown';
  trafficTrend: 'up' | 'down' | 'stable' | 'unknown';
  trafficConfidence: number;
  debug?: any;
}

export interface DomainAnalysis {
  domain: string;
  estimatedValue: number;
  confidenceScore: number;
  domainAge: string;
  monthlyTraffic: number | 'Unknown';
  seoScore: number;
  tldValue: string;
  detailedAnalysis: string;
  suggestedKeywords: KeywordSuggestion[];
  debug?: any;
}