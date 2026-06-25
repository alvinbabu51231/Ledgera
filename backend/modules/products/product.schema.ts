import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  product_code: text('product_code').notNull().unique(),
  product_name: text('product_name').notNull(),
  category: text('category').notNull(),
  size: text('size').notNull(),
  unit: text('unit').notNull(),
  selling_price: real('selling_price').notNull(),
  manufacturing_cost: real('manufacturing_cost').notNull(),
  gst_percentage: real('gst_percentage').notNull(),
  hsn_code: text('hsn_code'),
  description: text('description'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
