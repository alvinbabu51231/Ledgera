import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Minimal schema to bootstrap the project.
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
});

export * from '../modules/customers/customer.schema';
