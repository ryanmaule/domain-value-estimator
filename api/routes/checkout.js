import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    // Authentication not required for checkout session creation
    const { email } = req.body; // Assuming email is passed in the request body
    const { successUrl, cancelUrl } = req.body;

    console.log('[Stripe - Backend] Creating checkout session:', { email, successUrl, cancelUrl }); // Added logging

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.VITE_STRIPE_PRICE_ID,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true }
    });

    console.log('[Stripe - Backend] Checkout session created successfully:', session); // Added logging

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('[Stripe - Backend] Checkout session error:', error); // Modified logging
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

export default router;