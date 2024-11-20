import { parseISO, differenceInYears, differenceInMonths } from 'date-fns';

export interface WhoisData {
  domainAge: string;
  creationDate: string | null;
  expiryDate: string | null;
  registrar: string | null;
  isAvailable: boolean;
  debug?: any;
}

export async function getDomainWhois(domain: string): Promise<WhoisData> {
  try {
    const response = await fetch(`https://who-dat.as93.net/${encodeURIComponent(domain)}`);
    
    if (!response.ok) {
      throw new Error(`WHOIS API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.domain?.created_date) {
      return {
        domainAge: 'Unknown',
        creationDate: null,
        expiryDate: null,
        registrar: null,
        isAvailable: false,
        debug: { error: 'No creation date found', data }
      };
    }

    const creationDate = data.domain.created_date;
    const createDate = parseISO(creationDate);
    const now = new Date();
    const years = differenceInYears(now, createDate);
    const months = differenceInMonths(now, createDate) % 12;
    
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
      debug: { data }
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return {
      domainAge: 'Unknown',
      creationDate: null,
      expiryDate: null,
      registrar: null,
      isAvailable: false,
      debug: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}