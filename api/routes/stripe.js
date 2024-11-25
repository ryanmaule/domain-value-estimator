import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../auth.js';
import { handleWebhook } from '../stripe/webhooks.js';
import db from '../db/index.js';

const router = express.Router();
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Create checkout session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { email } = req.user;
    const { successUrl, cancelUrl } = req.body;

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

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Get subscription details
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const subscription = await db('subscriptions')
      .where('user_id', req.user.id)
      .first();

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json({
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.amount,
      currency: subscription.currency
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', requireAuth, async (req, res) => {
  const trx = await db.transaction();

  try {
    const subscription = await trx('subscriptions')
      .where('user_id', req.user.id)
      .first();

    if (!subscription) {
      await trx.rollback();
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update local record
    await trx('subscriptions')
      .where('id', subscription.id)
      .update({
        cancel_at_period_end: true,
        updated_at: new Date()
      });

    await trx.commit();
    res.json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    await trx.rollback();
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;