import validator from 'validator';
import { toast } from 'react-hot-toast';

interface ValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowUnderscores?: boolean;
  requireTld?: boolean;
}

const DEFAULT_DOMAIN_OPTIONS: ValidationOptions = {
  minLength: 1,
  maxLength: 253,
  allowUnderscores: false,
  requireTld: true
};

export function validateDomain(
  domain: string, 
  options: ValidationOptions = DEFAULT_DOMAIN_OPTIONS
): string | null {
  try {
    // Remove protocol and www
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/i, '');
    
    // Remove any paths, query parameters, or trailing slashes
    cleanDomain = cleanDomain.split(/[/?#]/)[0];
    
    // Length validation
    if (options.maxLength && cleanDomain.length > options.maxLength) {
      toast.error(`Domain name cannot be longer than ${options.maxLength} characters`);
      return null;
    }

    if (options.minLength && cleanDomain.length < options.minLength) {
      toast.error(`Domain name must be at least ${options.minLength} characters`);
      return null;
    }
    
    // Validate domain using validator.js
    if (!validator.isFQDN(cleanDomain, {
      require_tld: options.requireTld ?? true,
      allow_underscores: options.allowUnderscores ?? false,
      allow_trailing_dot: false
    })) {
      toast.error('Please enter a valid domain name (e.g., example.com)');
      return null;
    }
    
    // Escape any special characters
    return validator.escape(cleanDomain);
  } catch (error) {
    console.error('Domain validation error:', error);
    toast.error('Invalid domain format');
    return null;
  }
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function validateApiKey(apiKey: string): boolean {
  return validator.matches(apiKey, /^dve_[a-zA-Z0-9]{32,}$/);
}

export function sanitizeString(input: string): string {
  return validator.escape(input);
}