import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../auth.js';
import db from '../db/index.js';

const router = express.Router();
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Resume canceled subscription
router.post('/resume', requireAuth, async (req, res) => {
  const trx = await db.transaction();

  try {
    const subscription = await trx('subscriptions')
      .where('user_id', req.user.id)
      .first();

    if (!subscription) {
      await trx.rollback();
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Remove cancellation
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false
    });

    // Update local record
    await trx('subscriptions')
      .where('id', subscription.id)
      .update({
        cancel_at_period_end: false,
        updated_at: new Date()
      });

    await trx.commit();
    res.json({ message: 'Subscription resumed successfully' });
  } catch (error) {
    await trx.rollback();
    console.error('Subscription resume error:', error);
    res.status(500).json({ message: 'Failed to resume subscription' });
  }
});

// Get transaction history
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const payments = await db('payments')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .limit(50);

    res.json(payments.map(payment => ({
      id: payment.id,
      date: payment.created_at,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: 'Domain Value Pro Subscription'
    })));
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
});

export default router;