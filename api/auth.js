// Simulated API key validation
// In production, this would validate against a database
const API_KEYS = {
  'test_free': 'free',
  'test_pro': 'pro'
};

export function validateApiKey(apiKey) {
  return API_KEYS[apiKey] || null;
}