import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company_name: text('company_name').notNull(),
  gst_number: text('gst_number'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  bank_name: text('bank_name'),
  account_holder: text('account_holder'),
  account_number: text('account_number'),
  ifsc_code: text('ifsc_code'),
  invoice_prefix: text('invoice_prefix').notNull().default('INV'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
