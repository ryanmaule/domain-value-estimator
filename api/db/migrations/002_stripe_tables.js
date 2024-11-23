export async function up(knex) {
  // Subscriptions table
  await knex.schema.createTable('subscriptions', (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable();
    table.string('stripe_subscription_id').notNullable();
    table.string('stripe_customer_id').notNullable();
    table.string('plan_name').notNullable();
    table.string('price_id').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency').notNullable();
    table.bigInteger('current_period_start').notNullable();
    table.bigInteger('current_period_end').notNullable();
    table.boolean('cancel_at_period_end').defaultTo(false);
    table.string('status').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('user_id').references('users.id');
    table.index(['stripe_subscription_id']);
    table.index(['stripe_customer_id']);
  });

  // Payment history table
  await knex.schema.createTable('payments', (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable();
    table.string('stripe_payment_intent_id').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency').notNullable();
    table.string('status').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('user_id').references('users.id');
    table.index(['stripe_payment_intent_id']);
  });

  // Webhook events table for idempotency
  await knex.schema.createTable('webhook_events', (table) => {
    table.string('id').primary();
    table.string('stripe_event_id').notNullable().unique();
    table.string('type').notNullable();
    table.jsonb('data');
    table.boolean('processed').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['stripe_event_id']);
    table.index(['type']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('webhook_events');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('subscriptions');
}