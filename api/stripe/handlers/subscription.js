import db from '../../db/index.js';

export async function handleSubscriptionUpdated(subscription) {
  const trx = await db.transaction();

  try {
    // Get user by customer ID
    const user = await trx('users')
      .where('stripe_customer_id', subscription.customer)
      .first();

    if (!user) {
      throw new Error(`No user found for customer: ${subscription.customer}`);
    }

    // Update subscription record
    await trx('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .update({
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date()
      })
      .onConflict('stripe_subscription_id')
      .merge();

    // Update user's pro status
    await trx('users')
      .where('id', user.id)
      .update({
        is_pro: subscription.status === 'active',
        updated_at: new Date()
      });

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}