import { and, eq, or, like } from 'drizzle-orm';
import { db } from '../../db';
import { products } from './product.schema';
import { CreateProductInput, UpdateProductInput } from '../../../shared/types/product';

export const productRepository = {
  findAll: async (search?: string, limit?: number, offset?: number) => {
    let query = db.select().from(products).where(eq(products.is_active, true));
    
    if (search) {
      query = db.select().from(products)
        .where(
          and(
            eq(products.is_active, true),
            or(
              like(products.product_code, `%${search}%`),
              like(products.product_name, `%${search}%`),
              like(products.hsn_code, `%${search}%`)
            )
          )
        );
    }

    if (limit !== undefined) query = query.limit(limit) as any;
    if (offset !== undefined) query = query.offset(offset) as any;

    return query.all();
  },

  findById: async (id: number) => {
    const result = await db.select().from(products).where(eq(products.id, id)).all();
    return result[0] || null;
  },

  create: async (data: CreateProductInput) => {
    const result = await db.insert(products).values(data).returning().all();
    return result[0];
  },

  update: async (id: number, data: UpdateProductInput) => {
    const result = await db.update(products).set({
      ...data,
      updated_at: new Date().toISOString()
    }).where(eq(products.id, id)).returning().all();
    return result[0];
  },

  softDelete: async (id: number) => {
    const result = await db.update(products).set({
      is_active: false,
      updated_at: new Date().toISOString()
    }).where(eq(products.id, id)).returning().all();
    return result[0] || null;
  }
};
