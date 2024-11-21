import type { PageSpeedResult } from '../types';

const API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY;
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Proxy URL to avoid CORS issues
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

export async function getPageSpeedScore(domain: string): Promise<PageSpeedResult> {
  const startTime = performance.now();
  console.log(`[PageSpeed] Starting analysis for ${domain}`);

  try {
    // Only request performance category and minimal fields for mobile only
    const params = new URLSearchParams({
      url: `https://${domain}`,
      key: API_KEY,
      strategy: 'mobile',
      category: 'PERFORMANCE',
      fields: 'lighthouseResult.categories.performance.score'
    });

    const apiUrl = `${API_URL}?${params.toString()}`;
    const proxyUrl = `${PROXY_URL}${encodeURIComponent(apiUrl)}`;
    
    console.log('[PageSpeed] Starting mobile test with URL:', apiUrl.replace(API_KEY, '[REDACTED]'));

    // Use AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // First try direct API call
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error('Direct API call failed');
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      if (!data?.lighthouseResult?.categories?.performance?.score) {
        throw new Error('No performance score in response');
      }

      // Extract score
      const mobileScore = data.lighthouseResult.categories.performance.score;
      const score = Math.round(mobileScore * 100);

      const duration = performance.now() - startTime;
      console.log(`[PageSpeed] Direct API call succeeded in ${duration.toFixed(0)}ms with score:`, score);

      return {
        score: score,
        mobileScore: score,
        desktopScore: score, // Use mobile score for both since we're only testing mobile
        debug: {
          data,
          timing: {
            total: Math.round(duration),
            score
          }
        }
      };
    } catch (directError) {
      console.log('[PageSpeed] Direct API call failed, trying proxy:', directError);

      // If direct call fails, try through proxy
      const proxyResponse = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      if (!proxyResponse.ok) {
        throw new Error(`Proxy API call failed: ${proxyResponse.status}`);
      }

      const proxyData = await proxyResponse.json();
      clearTimeout(timeoutId);

      if (!proxyData?.lighthouseResult?.categories?.performance?.score) {
        throw new Error('No performance score in proxy response');
      }

      // Extract score from proxy response
      const proxyMobileScore = proxyData.lighthouseResult.categories.performance.score;
      const proxyScore = Math.round(proxyMobileScore * 100);

      const duration = performance.now() - startTime;
      console.log(`[PageSpeed] Proxy API call succeeded in ${duration.toFixed(0)}ms with score:`, proxyScore);

      return {
        score: proxyScore,
        mobileScore: proxyScore,
        desktopScore: proxyScore,
        debug: {
          data: proxyData,
          timing: {
            total: Math.round(duration),
            score: proxyScore
          }
        }
      };
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[PageSpeed] Analysis failed after ${duration.toFixed(0)}ms:`, {
      error: error.message || error,
      name: error.name,
      stack: error.stack,
      domain
    });

    // Return a default score on error
    const defaultScore = 50;
    
    return {
      score: defaultScore,
      mobileScore: defaultScore,
      desktopScore: defaultScore,
      debug: { 
        error: {
          message: error.message || 'Unknown error',
          name: error.name,
          stack: error.stack
        },
        timing: {
          total: Math.round(duration)
        }
      }
    };
  }
}