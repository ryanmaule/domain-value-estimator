import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import Stripe from 'stripe';
import { createCheckoutSession } from './stripe.js';
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
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Regular middleware
app.use(cors({
  origin: process.env.VITE_APP_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Serve static files in production
if (!DEV_MODE) {
  app.use(express.static(join(__dirname, '../dist')));
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (DEV_MODE) {
      const { user, token } = await debugLogin(email);
      setAuthCookie(res, token);
      return res.json({ user });
    }

    const magicLink = await createMagicLink(email);
    await sendLoginEmail(email, magicLink);
    
    res.json({ message: 'Magic link sent' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const sessionToken = await createSession(decoded.userId);
    setAuthCookie(res, sessionToken);
    
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Protected routes
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Existing routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/keywords', requireAuth, async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Generate relevant keyword suggestions for a domain name."
        },
        {
          role: "user",
          content: `Generate 5 keyword suggestions for the domain: ${domain}. Return ONLY a JSON array of objects with this exact format, with NO markdown or code blocks:
[
  {
    "keyword": "example keyword",
    "searchVolume": "High|Medium|Low",
    "difficulty": "Easy|Medium|Hard"
  }
]`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const suggestions = JSON.parse(content);
    res.json(suggestions);
  } catch (error) {
    console.error('Keywords generation failed:', error);
    res.status(500).json({ error: 'Failed to generate keywords' });
  }
});

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { successUrl, cancelUrl, email } = req.body;
    
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ 
        message: 'Missing required parameters'
      });
    }

    const session = await createCheckoutSession({
      successUrl,
      cancelUrl,
      email
    });

    res.json({ 
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create checkout session'
    });
  }
});

app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

  try {
    if (!webhookSecret) {
      throw new Error('Webhook secret is not configured');
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Handle all other routes in production by serving index.html
if (!DEV_MODE) {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});