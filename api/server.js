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

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  console.log('Login request received:', {
    body: req.body,
    headers: req.headers,
    devMode: DEV_MODE
  });

  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('Login failed: No email provided');
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Processing login for:', email);

    if (DEV_MODE) {
      console.log('Attempting debug login in dev mode');
      try {
        const { user, token } = await debugLogin(email);
        console.log('Debug login successful:', { user, token });
        setAuthCookie(res, token);
        return res.json({ user });
      } catch (debugError) {
        console.error('Debug login failed:', {
          error: debugError.message,
          stack: debugError.stack,
          email
        });
        throw debugError;
      }
    }

    const magicLink = await createMagicLink(email);
    await sendLoginEmail(email, magicLink);
    
    console.log('Login process completed successfully');
    res.json({ message: 'Magic link sent' });
  } catch (error) {
    console.error('Login route error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      email: req.body?.email,
      devMode: DEV_MODE
    });
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message,
      devMode: DEV_MODE 
    });
  }
});

// Rest of the server.js code remains unchanged...