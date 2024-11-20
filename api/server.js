import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import { createCheckoutSession } from './stripe.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

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
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  try {
    const { successUrl, cancelUrl, email } = req.body;
    
    if (!successUrl || !cancelUrl) {
      console.error('Missing required parameters:', { successUrl, cancelUrl });
      return res.status(400).json({ 
        message: 'Missing required parameters',
        error: 'Missing successUrl or cancelUrl'
      });
    }

    console.log('Creating Stripe checkout session...', {
      successUrl,
      cancelUrl,
      email
    });

    const session = await createCheckoutSession({
      successUrl,
      cancelUrl,
      email
    });

    console.log('Session created successfully:', {
      sessionId: session.id,
      url: session.url
    });

    res.json({ 
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout session creation failed:', {
      error: error.message,
      stack: error.stack
    });
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