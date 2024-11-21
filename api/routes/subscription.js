import express from 'express';
import Stripe from 'stripe';
import { getSubscription, updateSubscriptionStatus } from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Get subscription details
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const subscription = getSubscription(req.user.email);
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Failed to get subscription:', error);
    res.status(500).json({ message: 'Failed to get subscription details' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', requireAuth, async (req, res) => {
  try {
    const subscription = getSubscription(req.user.email);
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    updateSubscriptionStatus(req.user.email, true);

    res.json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Resume canceled subscription
router.post('/subscription/resume', requireAuth, async (req, res) => {
  try {
    const subscription = getSubscription(req.user.email);
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false
    });

    updateSubscriptionStatus(req.user.email, false);

    res.json({ message: 'Subscription resumed successfully' });
  } catch (error) {
    console.error('Failed to resume subscription:', error);
    res.status(500).json({ message: 'Failed to resume subscription' });
  }
});

export default router;