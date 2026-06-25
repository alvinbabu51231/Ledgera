import { eq, or, like } from 'drizzle-orm';
import { db } from '../../db';
import { products } from './product.schema';
import { CreateProductInput, UpdateProductInput } from '../../../shared/types/product';

export const productRepository = {
  findAll: async (search?: string) => {
    if (search) {
      return db.select().from(products)
        .where(
          or(
            like(products.product_code, `%${search}%`),
            like(products.product_name, `%${search}%`),
            like(products.hsn_code, `%${search}%`)
          )
        ).all();
    }
    return db.select().from(products).all();
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

  delete: async (id: number) => {
    await db.delete(products).where(eq(products.id, id)).execute();
  }
};
