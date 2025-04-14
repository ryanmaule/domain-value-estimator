import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';

export interface SubscriptionDetails {
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timing?: number;
}

let stripePromise: Promise<any> | null = null;

// Lazy loading of Stripe
function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key missing');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export async function redirectToCheckout(): Promise<void> {
  const startTime = performance.now();
  console.log('[Stripe] Starting checkout process');

  if (DEV_MODE) {
    console.log('[Stripe] Dev mode: Skipping checkout');
    toast.success('Dev mode: Skipping checkout process');
    return;
  }

  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Failed to initialize payment system');
    }

    const successUrl = `${appUrl}/account?success=true`;
    const cancelUrl = `${appUrl}/pricing?canceled=true`;

    console.log('[Stripe - Frontend] Creating checkout session:', { successUrl, cancelUrl }); // Added logging

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    if (!sessionId) {
      throw new Error('Invalid response: missing session ID');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }

    const duration = performance.now() - startTime;
    console.log(`[Stripe] Checkout process completed in ${duration.toFixed(0)}ms`);
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Stripe] Checkout failed after ${duration.toFixed(0)}ms:`, error);
    toast.error('Failed to start checkout. Please try again.');
    throw error;
  }
}

export async function getSubscriptionDetails(): Promise<SubscriptionDetails> {
  const startTime = performance.now();
  console.log('[Stripe] Fetching subscription details');

  if (DEV_MODE) {
    const duration = performance.now() - startTime;
    console.log(`[Stripe] Dev mode: Returning mock subscription after ${duration.toFixed(0)}ms`);
    return {
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      amount: 1995,
      currency: 'usd'
    };
  }

  try {
    const response = await fetch('/api/stripe/subscription', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription details');
    }

    const data = await response.json();
    const duration = performance.now() - startTime;
    console.log(`[Stripe] Subscription details fetched in ${duration.toFixed(0)}ms`);
    return data;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Stripe] Failed to fetch subscription after ${duration.toFixed(0)}ms:`, error);
    throw error;
  }
}

export async function getTransactionHistory(): Promise<Transaction[]> {
  const startTime = performance.now();
  console.log('[Stripe] Fetching transaction history');

  if (DEV_MODE) {
    const duration = performance.now() - startTime;
    console.log(`[Stripe] Dev mode: Returning mock transactions after ${duration.toFixed(0)}ms`);
    return [{
      id: 'dev_tx_1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 1995,
      currency: 'usd',
      status: 'succeeded',
      description: 'Domain Value Estimator Pro Subscription'
    }];
  }

  try {
    const response = await fetch('/api/stripe/transactions', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transaction history');
    }

    const data = await response.json();
    const duration = performance.now() - startTime;
    console.log(`[Stripe] Transaction history fetched in ${duration.toFixed(0)}ms`);
    return data;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Stripe] Failed to fetch transactions after ${duration.toFixed(0)}ms:`, error);
    throw error;
  }
}

export async function cancelSubscription(): Promise<boolean> {
  const startTime = performance.now();
  console.log('[Stripe] Starting subscription cancellation');

  if (DEV_MODE) {
    const duration = performance.now() - startTime;
    console.log(`[Stripe] Dev mode: Simulated cancellation after ${duration.toFixed(0)}ms`);
    toast.success('Dev mode: Subscription cancellation simulated');
    return true;
  }

  try {
    const response = await fetch('/api/stripe/subscription/cancel', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    const result = await response.json() as ApiResponse<{ message: string }>;
    const duration = performance.now() - startTime;
    console.log(`[Stripe] Subscription cancelled in ${duration.toFixed(0)}ms`);
    toast.success(result.data?.message ?? 'Subscription canceled successfully');
    return true;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Stripe] Cancellation failed after ${duration.toFixed(0)}ms:`, error);
    throw error;
  }
}

const stripeService = {
  redirectToCheckout,
  getSubscriptionDetails,
  getTransactionHistory,
  cancelSubscription
};

export default stripeService;