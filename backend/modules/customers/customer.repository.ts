import { eq, like, or, and, sql } from 'drizzle-orm';
import { db } from '../../db';
import { customers } from './customer.schema';
import { invoices } from '../invoices/invoice.schema';
import { companies } from '../companies/company.schema';
import { CreateCustomerInput, UpdateCustomerInput } from '../../../shared/types/customer';

export class CustomerRepository {
  async create(data: CreateCustomerInput & { customer_code: string }) {
    const result = await db.insert(customers).values(data).returning();
    return result[0];
  }

  async findById(id: number) {
    const result = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.is_active, true)));
    return result[0] || null;
  }

  async findAll(searchQuery?: string) {
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      return await db.select().from(customers).where(
        and(
          eq(customers.is_active, true),
          or(
            like(customers.customer_name, searchPattern),
            like(customers.phone_number, searchPattern),
            like(customers.gst_number, searchPattern)
          )
        )
      );
    }
    return await db.select().from(customers).where(eq(customers.is_active, true));
  }

  async findByCustomerCode(code: string) {
    const result = await db.select().from(customers).where(and(eq(customers.customer_code, code), eq(customers.is_active, true)));
    return result[0] || null;
  }

  async findByExactDetails(name: string, phone: string) {
    const result = await db.select().from(customers).where(
      and(
        eq(customers.customer_name, name),
        eq(customers.phone_number, phone),
        eq(customers.is_active, true)
      )
    );
    return result[0] || null;
  }

  async update(id: number, data: UpdateCustomerInput) {
    const result = await db
      .update(customers)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(and(eq(customers.id, id), eq(customers.is_active, true)))
      .returning();
    return result[0] || null;
  }

  async softDelete(id: number) {
    const result = await db
      .update(customers)
      .set({ is_active: false, updated_at: new Date().toISOString() })
      .where(and(eq(customers.id, id), eq(customers.is_active, true)))
      .returning();
    return result[0] || null;
  }

  async getLedger(id: number) {
    const result = await db
      .select({
        company_id: companies.id,
        company_name: companies.company_name,
        total_invoiced: sql<number>`SUM(${invoices.grand_total})`.as('total_invoiced'),
      })
      .from(invoices)
      .innerJoin(companies, eq(invoices.company_id, companies.id))
      .where(and(eq(invoices.customer_id, id), eq(invoices.is_active, true)))
      .groupBy(companies.id, companies.company_name);
      
    return result.map(row => ({
      company_id: row.company_id,
      company_name: row.company_name,
      total_invoiced: row.total_invoiced || 0
    }));
  }
}

export const customerRepository = new CustomerRepository();
