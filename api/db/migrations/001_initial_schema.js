import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function up(knex) {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('email').unique().notNullable();
    table.string('display_name');
    table.boolean('is_pro').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Sessions table
  await knex.schema.createTable('sessions', (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable();
    table.string('token').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('user_id').references('users.id');
    table.index(['token']);
  });

  // Magic links table
  await knex.schema.createTable('magic_links', (table) => {
    table.string('id').primary();
    table.string('email').notNullable();
    table.string('token').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['token']);
    table.index(['email']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('magic_links');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('users');
}