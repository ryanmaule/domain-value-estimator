import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'subscriptions.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    user_email TEXT PRIMARY KEY,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    plan_name TEXT,
    price_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT,
    current_period_start INTEGER,
    current_period_end INTEGER,
    cancel_at_period_end BOOLEAN,
    created_at INTEGER,
    updated_at INTEGER
  );
`);

export function getSubscription(email) {
  const stmt = db.prepare('SELECT * FROM subscriptions WHERE user_email = ?');
  return stmt.get(email);
}

export function upsertSubscription(data) {
  const stmt = db.prepare(`
    INSERT INTO subscriptions (
      user_email, stripe_subscription_id, stripe_customer_id,
      plan_name, price_id, amount, currency,
      current_period_start, current_period_end,
      cancel_at_period_end, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_email) DO UPDATE SET
      stripe_subscription_id=excluded.stripe_subscription_id,
      stripe_customer_id=excluded.stripe_customer_id,
      plan_name=excluded.plan_name,
      price_id=excluded.price_id,
      amount=excluded.amount,
      currency=excluded.currency,
      current_period_start=excluded.current_period_start,
      current_period_end=excluded.current_period_end,
      cancel_at_period_end=excluded.cancel_at_period_end,
      updated_at=excluded.updated_at
  `);

  return stmt.run(
    data.user_email,
    data.stripe_subscription_id,
    data.stripe_customer_id,
    data.plan_name,
    data.price_id,
    data.amount,
    data.currency,
    data.current_period_start,
    data.current_period_end,
    data.cancel_at_period_end ? 1 : 0,
    Date.now(),
    Date.now()
  );
}

export function updateSubscriptionStatus(email, cancel_at_period_end) {
  const stmt = db.prepare(`
    UPDATE subscriptions 
    SET cancel_at_period_end = ?, updated_at = ?
    WHERE user_email = ?
  `);
  return stmt.run(cancel_at_period_end ? 1 : 0, Date.now(), email);
}

export default db;