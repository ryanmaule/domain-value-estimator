import Stripe from 'stripe';
import db from '../db/index.js';
import { handleSubscriptionUpdated } from './handlers/subscription.js';
import { handlePaymentSucceeded, handlePaymentFailed } from './handlers/payment.js';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const WEBHOOK_HANDLERS = {
  'customer.subscription.created': handleSubscriptionUpdated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionUpdated,
  'invoice.paid': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed
};

export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret
    );

    // Check for duplicate events
    const existingEvent = await db('webhook_events')
      .where('stripe_event_id', event.id)
      .first();

    if (existingEvent) {
      console.log(`Duplicate webhook event: ${event.id}`);
      return res.json({ received: true });
    }

    // Store webhook event
    await db('webhook_events').insert({
      id: crypto.randomUUID(),
      stripe_event_id: event.id,
      type: event.type,
      data: event.data,
      processed: false
    });

    // Process event
    const handler = WEBHOOK_HANDLERS[event.type];
    if (handler) {
      await handler(event.data.object);
      
      // Mark event as processed
      await db('webhook_events')
        .where('stripe_event_id', event.id)
        .update({ processed: true });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}