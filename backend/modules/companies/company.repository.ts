import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { companies } from './company.schema';
import { UpdateCompanyInput } from '../../../shared/types/company';

export const companyRepository = {
  findAll: async () => {
    return db.select().from(companies).where(eq(companies.is_active, true)).all();
  },

  findById: async (id: number) => {
    const result = await db.select().from(companies).where(and(eq(companies.id, id), eq(companies.is_active, true))).all();
    return result[0] || null;
  },

  update: async (id: number, data: UpdateCompanyInput) => {
    const result = await db.update(companies).set({
      ...data,
      updated_at: new Date().toISOString()
    }).where(and(eq(companies.id, id), eq(companies.is_active, true))).returning().all();
    return result[0];
  }
};
