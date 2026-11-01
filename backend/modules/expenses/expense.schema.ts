import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company_id: integer('company_id').notNull(),
  expense_date: text('expense_date').notNull(),
  amount: integer('amount').notNull(),
  category: text('category').notNull(),
  payment_method: text('payment_method').notNull(),
  notes: text('notes'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
