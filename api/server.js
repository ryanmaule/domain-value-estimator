import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import Stripe from 'stripe';
import { createCheckoutSession } from './stripe.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Basic middleware
app.use(cors());
app.use(express.json());

// Special handling for Stripe webhooks
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Keywords generation endpoint
app.post('/api/keywords', async (req, res) => {
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

    // Remove any markdown code block syntax
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleanContent);

    res.json(suggestions);
  } catch (error) {
    console.error('Keywords generation failed:', error);
    res.status(500).json({ error: 'Failed to generate keywords' });
  }
});

// Stripe checkout endpoint
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { successUrl, cancelUrl, email } = req.body;
    
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ 
        message: 'Missing required parameters',
        error: 'Missing successUrl or cancelUrl'
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
      message: error.message || 'Failed to create checkout session',
      error: {
        message: error.message,
        type: error.type,
        code: error.code
      }
    });
  }
});

// Stripe webhook endpoint
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

    console.log('Webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout completed:', {
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_details?.email
        });
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription canceled:', {
          customerId: subscription.customer,
          subscriptionId: subscription.id
        });
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
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});