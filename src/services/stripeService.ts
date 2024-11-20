import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function redirectToCheckout() {
  try {
    console.log('Initializing Stripe checkout...');
    
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize payment system');
    }

    // Use relative URLs instead of absolute URLs
    const requestBody = {
      successUrl: '/account?success=true',
      cancelUrl: '/pricing?canceled=true',
    };

    console.log('POST Request to /api/stripe/create-checkout-session:', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody
    });

    console.log('Creating checkout session...');
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();
    if (!sessionId) {
      throw new Error('Invalid response: missing session ID');
    }

    console.log('Redirecting to checkout...', { sessionId, url });
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Stripe checkout error:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    toast.error(error.message || 'Failed to start checkout. Please try again.');
    throw error;
  }
}