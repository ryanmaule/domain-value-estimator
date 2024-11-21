import sanitizeHtml from 'sanitize-html';
import validator from 'validator';
import xss from 'xss';

const sanitizeOptions = {
  allowedTags: [], // No HTML tags allowed
  allowedAttributes: {}, // No attributes allowed
  disallowedTagsMode: 'recursiveEscape'
};

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remove any HTML
  let cleaned = sanitizeHtml(str, sanitizeOptions);
  
  // Prevent XSS
  cleaned = xss(cleaned);
  
  // Escape special characters
  cleaned = validator.escape(cleaned);
  
  return cleaned;
}

export function sanitizeInput(input) {
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  
  return input;
}

export function validateEmail(email) {
  return validator.isEmail(email);
}

export function validateDomain(domain) {
  // Remove protocol and www
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/i, '');
  
  // Basic domain validation
  return validator.isFQDN(domain, {
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false
  }) ? domain : null;
}

export function validateApiKey(apiKey) {
  return validator.matches(apiKey, /^dve_[a-zA-Z0-9]{32,}$/);
}

export function sanitizeHtmlContent(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt']
    },
    allowedSchemes: ['http', 'https', 'data']
  });
}