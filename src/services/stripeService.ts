import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

export async function redirectToCheckout() {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize payment system');
    }

    const requestBody = {
      successUrl: `${appUrl}/account?success=true`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
    };

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
  } catch (error) {
    console.error('Stripe checkout error:', error);
    toast.error('Failed to start checkout. Please try again.');
    throw error;
  }
}