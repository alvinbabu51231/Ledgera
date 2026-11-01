import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_number: text('invoice_number').notNull().unique(),
  financial_year: text('financial_year').notNull(),
  company_id: integer('company_id').notNull(),
  customer_id: integer('customer_id').notNull(),
  invoice_date: text('invoice_date').notNull(),
  invoice_type: text('invoice_type').notNull(), // 'B2B' | 'B2C'
  status: text('status').notNull().default('Draft'), // 'Draft' | 'Sent' | 'Paid' | 'Cancelled'
  subtotal: integer('subtotal').notNull().default(0),
  cgst: integer('cgst').notNull().default(0),
  sgst: integer('sgst').notNull().default(0),
  grand_total: integer('grand_total').notNull().default(0),
  discount_type: text('discount_type').notNull().default('None'), // 'None' | 'Percentage' | 'Fixed' | 'GST'
  discount_value: integer('discount_value').notNull().default(0),
  discount_amount: integer('discount_amount').notNull().default(0),
  round_off: integer('round_off').notNull().default(0),
  notes: text('notes'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const invoice_items = sqliteTable('invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_id: integer('invoice_id').notNull(),
  product_id: integer('product_id').notNull(),
  product_name: text('product_name').notNull(),
  hsn_code: text('hsn_code'),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  rate: integer('rate').notNull(),
  gst_percentage: integer('gst_percentage').notNull(),
  gst_amount: integer('gst_amount').notNull(),
  total: integer('total').notNull(),
});

export const invoice_history = sqliteTable('invoice_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_id: integer('invoice_id').notNull(),
  action: text('action').notNull(),
  snapshot: text('snapshot').notNull(),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
