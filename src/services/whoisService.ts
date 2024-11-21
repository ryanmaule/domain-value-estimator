import type { WhoisData } from '../types';

const MAX_RETRIES = 1;
const RETRY_DELAY = 2000;

async function fetchWithRetry(domain: string, retries = 0): Promise<WhoisData> {
  const startTime = performance.now();
  console.log(`[WHOIS] Starting lookup for ${domain}`);

  try {
    const response = await fetch(`https://who-dat.as93.net/${encodeURIComponent(domain)}`);
    
    if (!response.ok) {
      throw new Error(`WHOIS API error: ${response.status}`);
    }

    const data = await response.json();
    const duration = performance.now() - startTime;
    console.log(`[WHOIS] Lookup completed in ${duration.toFixed(0)}ms`);

    if (!data.domain?.created_date) {
      return {
        domainAge: 'Unknown',
        creationDate: null,
        expiryDate: null,
        registrar: null,
        isAvailable: false,
        debug: { 
          error: 'No creation date found', 
          data,
          timing: Math.round(duration)
        }
      };
    }

    const creationDate = data.domain.created_date;
    const createDate = new Date(creationDate);
    const now = new Date();
    const years = now.getFullYear() - createDate.getFullYear();
    const months = now.getMonth() - createDate.getMonth();
    
    let domainAge = 'Unknown';
    if (years > 0) {
      domainAge = `${years} year${years > 1 ? 's' : ''}`;
      if (months > 0) {
        domainAge += ` ${months} month${months > 1 ? 's' : ''}`;
      }
    } else if (months > 0) {
      domainAge = `${months} month${months > 1 ? 's' : ''}`;
    } else {
      domainAge = 'Less than a month';
    }

    return {
      domainAge,
      creationDate: data.domain.created_date || null,
      expiryDate: data.domain.expiration_date || null,
      registrar: data.registrar?.name || null,
      isAvailable: false,
      debug: { 
        data,
        timing: Math.round(duration)
      }
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[WHOIS] Lookup failed after ${duration.toFixed(0)}ms:`, error);

    if (retries < MAX_RETRIES) {
      console.log(`[WHOIS] Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(domain, retries + 1);
    }

    return {
      domainAge: 'Unknown',
      creationDate: null,
      expiryDate: null,
      registrar: null,
      isAvailable: false,
      debug: { 
        error,
        timing: Math.round(duration)
      }
    };
  }
}

export async function getDomainWhois(domain: string): Promise<WhoisData> {
  return fetchWithRetry(domain);
}