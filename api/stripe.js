import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY;
const stripePriceId = process.env.VITE_STRIPE_PRICE_ID;

if (!stripeSecretKey) {
  console.error('Missing VITE_STRIPE_SECRET_KEY environment variable');
  throw new Error('Missing VITE_STRIPE_SECRET_KEY environment variable');
}

if (!stripePriceId) {
  console.error('Missing VITE_STRIPE_PRICE_ID environment variable');
  throw new Error('Missing VITE_STRIPE_PRICE_ID environment variable');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  timeout: 10000 // 10 second timeout
});

export async function createCheckoutSession(data) {
  console.log('Creating checkout session with data:', {
    successUrl: data.successUrl,
    cancelUrl: data.cancelUrl,
    priceId: stripePriceId
  });

  try {
    // Convert relative URLs to absolute URLs using Stripe's own domain
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Let Stripe handle the full URL
      success_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}${data.successUrl}`,
      cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}${data.cancelUrl}`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: data.email,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      subscription_data: {
        trial_period_days: 7
      }
    });

    console.log('Stripe session created successfully:', {
      sessionId: session.id,
      url: session.url
    });

    return session;
  } catch (error) {
    console.error('Stripe session creation error:', {
      error: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      detail: error.detail || error.raw?.message
    });

    // Re-throw with more context
    throw new Error(`Stripe session creation failed: ${error.message}`);
  }
}