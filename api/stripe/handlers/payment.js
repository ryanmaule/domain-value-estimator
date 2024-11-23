import db from '../../db/index.js';
import { sendPaymentFailedEmail } from '../../email/templates.js';

export async function handlePaymentSucceeded(invoice) {
  const trx = await db.transaction();

  try {
    // Record successful payment
    await trx('payments').insert({
      id: crypto.randomUUID(),
      user_id: invoice.customer,
      stripe_payment_intent_id: invoice.payment_intent,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded'
    });

    // Update subscription status if needed
    if (invoice.subscription) {
      await trx('subscriptions')
        .where('stripe_subscription_id', invoice.subscription)
        .update({
          status: 'active',
          updated_at: new Date()
        });
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function handlePaymentFailed(invoice) {
  const trx = await db.transaction();

  try {
    // Record failed payment
    await trx('payments').insert({
      id: crypto.randomUUID(),
      user_id: invoice.customer,
      stripe_payment_intent_id: invoice.payment_intent,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed'
    });

    // Get user email
    const user = await trx('users')
      .where('stripe_customer_id', invoice.customer)
      .first();

    if (user) {
      // Send payment failed email
      await sendPaymentFailedEmail(user.email, {
        amount: invoice.amount_due,
        currency: invoice.currency,
        nextAttempt: invoice.next_payment_attempt
      });
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}