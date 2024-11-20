import express from 'express';
import rateLimit from 'express-rate-limit';
import { validateApiKey } from './auth.js';

// Rate limiting for free tier
const freeTierLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  message: { error: 'Daily limit exceeded. Please upgrade to Pro for unlimited access.' }
});

// Rate limiting for Pro tier
const proTierLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Rate limit exceeded. Please try again later.' }
});

export function setupMiddleware(app) {
  // Stripe webhook raw body parser
  app.use('/api/webhook', express.raw({ type: 'application/json' }));
  
  // Regular JSON parser for other routes
  app.use(express.json());

  // API key validation and rate limiting
  app.use('/api/v1/*', (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const tier = validateApiKey(apiKey);
    
    if (!tier) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (tier === 'free') {
      freeTierLimiter(req, res, next);
    } else {
      proTierLimiter(req, res, next);
    }
  });
}