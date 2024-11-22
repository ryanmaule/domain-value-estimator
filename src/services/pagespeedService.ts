import type { PageSpeedResult } from '../types';

const API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY;
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

export async function getPageSpeedScore(domain: string): Promise<PageSpeedResult> {
  const startTime = performance.now();
  console.log(`[PageSpeed] Starting analysis for ${domain}`);

  try {
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
      }).catch(error => {
        // Silently handle abort errors
        if (error.name === 'AbortError') {
          return null;
        }
        throw error;
      });
      
      if (!response?.ok) {
        throw new Error('Direct API call failed');
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      if (!data?.lighthouseResult?.categories?.performance?.score) {
        throw new Error('No performance score in response');
      }

      const mobileScore = data.lighthouseResult.categories.performance.score;
      const score = Math.round(mobileScore * 100);

      const duration = performance.now() - startTime;
      console.log(`[PageSpeed] Direct API call succeeded in ${duration.toFixed(0)}ms with score:`, score);

      return {
        score: score,
        mobileScore: score,
        desktopScore: score,
        debug: {
          data,
          timing: {
            total: Math.round(duration),
            score
          }
        }
      };
    } catch (directError) {
      // Only log if it's not an abort error
      if (directError.name !== 'AbortError') {
        console.log('[PageSpeed] Direct API call failed, trying proxy:', directError);
      }

      // Try through proxy
      const proxyResponse = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).catch(error => {
        // Silently handle abort errors
        if (error.name === 'AbortError') {
          return null;
        }
        throw error;
      });

      if (!proxyResponse?.ok) {
        throw new Error(`Proxy API call failed: ${proxyResponse?.status}`);
      }

      const proxyData = await proxyResponse.json();
      clearTimeout(timeoutId);

      if (!proxyData?.lighthouseResult?.categories?.performance?.score) {
        throw new Error('No performance score in proxy response');
      }

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
    
    // Only log non-abort errors
    if (error.name !== 'AbortError') {
      console.log(`[PageSpeed] Analysis failed after ${duration.toFixed(0)}ms, using default score`);
    }

    // Return a default score on error
    const defaultScore = 50;
    
    return {
      score: defaultScore,
      mobileScore: defaultScore,
      desktopScore: defaultScore,
      debug: { 
        error: error.name === 'AbortError' ? 'timeout' : error.message,
        timing: {
          total: Math.round(duration)
        }
      }
    };
  }
}