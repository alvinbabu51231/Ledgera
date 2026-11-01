import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  product_code: text('product_code').notNull().unique(),
  product_name: text('product_name').notNull(),
  category: text('category').notNull(),
  size: text('size').notNull(),
  unit: text('unit').notNull(),
  selling_price: integer('selling_price').notNull(),
  manufacturing_cost: integer('manufacturing_cost').notNull(),
  gst_percentage: integer('gst_percentage').notNull(),
  hsn_code: text('hsn_code'),
  description: text('description'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
