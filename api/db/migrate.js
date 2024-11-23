import knex from 'knex';
import config from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function migrate() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();