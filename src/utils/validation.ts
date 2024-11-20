import { toast } from 'react-hot-toast';

export function validateDomain(domain: string): string | null {
  try {
    // Remove protocol and www
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/i, '');
    
    // Remove any paths, query parameters, or trailing slashes
    cleanDomain = cleanDomain.split(/[/?#]/)[0];
    
    // Basic domain validation regex
    // Allows for IDNs and new TLDs
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
    
    if (!domainRegex.test(cleanDomain)) {
      toast.error('Please enter a valid domain name (e.g., example.com)');
      return null;
    }
    
    // Validate length
    if (cleanDomain.length > 253) {
      toast.error('Domain name is too long');
      return null;
    }
    
    return cleanDomain;
  } catch (error) {
    console.error('Domain validation error:', error);
    toast.error('Invalid domain format');
    return null;
  }
}