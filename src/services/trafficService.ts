import type { TrafficData } from '../types';

// Traffic estimation service configuration
const CONFIG = {
  provider: 'none', // Options: 'semrush', 'similarweb', 'none'
  similarweb: {
    enabled: false,
    apiKey: 'c308478ef2ce40488aadac3f6b553062',
    baseUrl: 'https://api.similarweb.com/v1/website'
  },
  semrush: {
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.semrush.com'
  }
};

async function getSimilarWebTraffic(domain: string): Promise<TrafficData> {
  try {
    const response = await fetch(
      `${CONFIG.similarweb.baseUrl}/${domain}/total-traffic-and-engagement/visits?country=999&granularity=monthly&main_domain_only=false&format=json`,
      {
        headers: {
          'api-key': CONFIG.similarweb.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`SimilarWeb API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.visits || !data.visits.length) {
      throw new Error('No traffic data available');
    }

    const latestVisits = data.visits[data.visits.length - 1].visits;
    let trend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';

    if (data.visits.length >= 3) {
      const last3Months = data.visits.slice(-3);
      const firstMonth = last3Months[0].visits;
      const lastMonth = last3Months[2].visits;
      const percentChange = ((lastMonth - firstMonth) / firstMonth) * 100;

      if (percentChange > 10) trend = 'up';
      else if (percentChange < -10) trend = 'down';
      else trend = 'stable';
    }

    return {
      monthlyVisits: Math.round(latestVisits),
      trafficTrend: trend,
      trafficConfidence: 80,
      debug: { provider: 'similarweb', data }
    };
  } catch (error) {
    throw error;
  }
}

async function getSemrushTraffic(domain: string): Promise<TrafficData> {
  try {
    const response = await fetch(
      `${CONFIG.semrush.baseUrl}/analytics/traffic/summary/${domain}`,
      {
        headers: {
          'api-key': CONFIG.semrush.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`SEMrush API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      monthlyVisits: Math.round(data.visits),
      trafficTrend: data.trend || 'unknown',
      trafficConfidence: 75,
      debug: { provider: 'semrush', data }
    };
  } catch (error) {
    throw error;
  }
}

export async function getTrafficEstimate(domain: string): Promise<TrafficData> {
  const errors: any[] = [];

  // Try SimilarWeb if enabled
  if (CONFIG.similarweb.enabled) {
    try {
      return await getSimilarWebTraffic(domain);
    } catch (error) {
      console.error('SimilarWeb estimation failed:', error);
      errors.push({ provider: 'similarweb', error });
    }
  }

  // Try SEMrush if enabled
  if (CONFIG.semrush.enabled) {
    try {
      return await getSemrushTraffic(domain);
    } catch (error) {
      console.error('SEMrush estimation failed:', error);
      errors.push({ provider: 'semrush', error });
    }
  }

  // Return unknown if no provider is available or working
  return {
    monthlyVisits: 'Unknown',
    trafficTrend: 'unknown',
    trafficConfidence: 0,
    debug: { 
      provider: CONFIG.provider,
      errors: errors.length ? errors : undefined
    }
  };
}