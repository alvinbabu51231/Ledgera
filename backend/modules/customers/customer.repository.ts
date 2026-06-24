import { eq, like, or, and } from 'drizzle-orm';
import { db } from '../../db';
import { customers } from './customer.schema';
import { CreateCustomerInput, UpdateCustomerInput } from '../../../shared/types/customer';

export class CustomerRepository {
  async create(data: CreateCustomerInput & { customer_code: string }) {
    const result = await db.insert(customers).values(data).returning();
    return result[0];
  }

  async findById(id: number) {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0] || null;
  }

  async findAll(searchQuery?: string) {
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      return await db.select().from(customers).where(
        or(
          like(customers.customer_name, searchPattern),
          like(customers.phone_number, searchPattern),
          like(customers.gst_number, searchPattern)
        )
      );
    }
    return await db.select().from(customers);
  }

  async findByCustomerCode(code: string) {
    const result = await db.select().from(customers).where(eq(customers.customer_code, code));
    return result[0] || null;
  }

  async findByExactDetails(name: string, phone: string) {
    const result = await db.select().from(customers).where(
      and(
        eq(customers.customer_name, name),
        eq(customers.phone_number, phone)
      )
    );
    return result[0] || null;
  }

  async update(id: number, data: UpdateCustomerInput) {
    const result = await db
      .update(customers)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(customers.id, id))
      .returning();
    return result[0] || null;
  }

  async softDelete(id: number) {
    const result = await db
      .update(customers)
      .set({ is_active: false, updated_at: new Date().toISOString() })
      .where(eq(customers.id, id))
      .returning();
    return result[0] || null;
  }
}

export const customerRepository = new CustomerRepository();
