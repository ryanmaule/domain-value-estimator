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
const PROD_URL = process.env.VITE_APP_URL || 'https://domainvalue.dev';

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

// CORS configuration
const corsOptions = {
  origin: DEV_MODE ? 'http://localhost:5173' : PROD_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'images.unsplash.com'],
      connectSrc: [
        "'self'",
        'api.stripe.com',
        'api.openai.com',
        'who-dat.as93.net',
        'www.googleapis.com',
        'api.allorigins.win',
        'api.similarweb.com',
        'api.semrush.com',
        'pagespeed.googleapis.com',
        'images.unsplash.com',
        DEV_MODE ? 'http://localhost:5173' : PROD_URL
      ],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'self'", 'js.stripe.com'],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Serve static files in production
if (!DEV_MODE) {
  app.use(express.static(join(__dirname, '../dist')));
}

// API Routes
app.get('/api/user', async (req, res) => {
  try {
    if (DEV_MODE) {
      return res.json({
        user: {
          id: 'dev-user',
          email: 'dev@example.com',
          displayName: 'Dev User',
          isPro: true
        }
      });
    }

    const token = req.cookies.auth_token;
    const user = await validateSession(token);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = sanitizeInput(req.body);

    if (DEV_MODE) {
      const { user } = await debugLogin(email);
      return res.json({ user });
    }

    const magicLink = await createMagicLink(email);
    await sendLoginEmail(email, magicLink);

    res.json({ message: 'Magic link sent', magicLink });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to process login' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const sessionToken = await createSession(decoded.email);
    setAuthCookie(res, sessionToken);

    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Failed to verify token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Handle all other routes in production
if (!DEV_MODE) {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});