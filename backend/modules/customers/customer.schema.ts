import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_code: text('customer_code').notNull().unique(),
  customer_name: text('customer_name').notNull(),
  phone_number: text('phone_number').notNull(),
  whatsapp_number: text('whatsapp_number'),
  email: text('email'),
  gst_number: text('gst_number'),
  billing_address: text('billing_address').notNull(),
  delivery_address: text('delivery_address'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
