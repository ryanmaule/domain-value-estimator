import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import Stripe from 'stripe';
import { createCheckoutSession } from './stripe.js';
import { sanitizeInput } from './utils/sanitize.js';
import {
  createMagicLink,
  sendLoginEmail,
  verifyToken,
  createSession,
  validateSession,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  debugLogin
} from './auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_MODE = process.env.VITE_DEV_MODE === 'true';

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Special handling for Stripe webhooks
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Regular middleware
app.use(cors({
  origin: process.env.VITE_APP_URL || 'http://localhost:5173',
  credentials: true
}));

// Only use cookie parser in production
if (!DEV_MODE) {
  app.use(cookieParser());
}

app.use(express.json());

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'api.stripe.com', 'api.openai.com'],
      frameSrc: ["'self'", 'js.stripe.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      manifestSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Input sanitization middleware
app.use((req, res, next) => {
  if (req.body) {
    req.sanitizedBody = sanitizeInput(req.body);
  }
  if (req.query) {
    req.sanitizedQuery = sanitizeInput(req.query);
  }
  if (req.params) {
    req.sanitizedParams = sanitizeInput(req.params);
  }
  next();
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.sanitizedBody;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (DEV_MODE) {
      console.log('Dev mode login attempt:', email);
      const result = await debugLogin(email);
      console.log('Dev mode login result:', result);
      return res.json(result);
    }

    const magicLink = await createMagicLink(email);
    await sendLoginEmail(email, magicLink);
    
    res.json({ message: 'Magic link sent' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  if (!DEV_MODE) {
    clearAuthCookie(res);
  }
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/user', (req, res) => {
  if (DEV_MODE) {
    return res.json({ 
      user: {
        id: 'dev-user',
        email: 'dev@example.com',
        isPro: true
      }
    });
  }
  
  // In production, use requireAuth middleware
  requireAuth(req, res, () => {
    res.json({ user: req.user });
  });
});

// Stripe routes
app.get('/api/stripe/subscription', requireAuth, async (req, res) => {
  if (DEV_MODE) {
    return res.json({
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      amount: 1995,
      currency: 'usd'
    });
  }

  try {
    const customer = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });

    if (!customer.data.length) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.data[0].id,
      limit: 1
    });

    if (!subscriptions.data.length) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const subscription = subscriptions.data[0];

    res.json({
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.items.data[0].price.unit_amount,
      currency: subscription.currency
    });
  } catch (error) {
    console.error('Failed to get subscription:', error);
    res.status(500).json({ message: 'Failed to get subscription details' });
  }
});

app.get('/api/stripe/transactions', requireAuth, async (req, res) => {
  if (DEV_MODE) {
    return res.json([{
      id: 'dev_tx_1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 1995,
      currency: 'usd',
      status: 'succeeded',
      description: 'Domain Value Estimator Pro Subscription'
    }]);
  }

  try {
    const customer = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });

    if (!customer.data.length) {
      return res.json([]);
    }

    const charges = await stripe.charges.list({
      customer: customer.data[0].id,
      limit: 10
    });

    const transactions = charges.data.map(charge => ({
      id: charge.id,
      date: new Date(charge.created * 1000).toISOString(),
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      description: charge.description || 'Domain Value Estimator Pro Subscription'
    }));

    res.json(transactions);
  } catch (error) {
    console.error('Failed to get transactions:', error);
    res.status(500).json({ message: 'Failed to get transaction history' });
  }
});

app.post('/api/stripe/subscription/cancel', requireAuth, async (req, res) => {
  if (DEV_MODE) {
    return res.json({ message: 'Subscription canceled successfully' });
  }

  try {
    const customer = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });

    if (!customer.data.length) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.data[0].id,
      limit: 1
    });

    if (!subscriptions.data.length) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true
    });

    res.json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Dev mode: ${DEV_MODE}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});