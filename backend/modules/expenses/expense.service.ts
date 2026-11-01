import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { companies } from '../companies/company.schema';
import { expenseRepository } from './expense.repository';
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  createExpenseSchema,
  updateExpenseSchema,
} from '../../../shared/types/expense';

async function assertCompany(companyId: number) {
  const result = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!result[0] || !result[0].is_active) throw new Error('Company not found');
}

export class ExpenseService {
  async getAll(companyId?: number, search?: string) {
    return expenseRepository.findAll(companyId, search);
  }

  async getById(id: number) {
    const expense = await expenseRepository.findById(id);
    if (!expense) throw new Error('Expense not found');
    return expense;
  }

  async create(data: CreateExpenseInput) {
    const validated = createExpenseSchema.parse(data);
    await assertCompany(validated.company_id);
    return expenseRepository.create(validated);
  }

  async update(id: number, data: UpdateExpenseInput) {
    const existing = await this.getById(id);
    const validated = updateExpenseSchema.parse(data);
    await assertCompany(validated.company_id ?? existing.company_id);
    return expenseRepository.update(id, validated);
  }

  async delete(id: number) {
    await this.getById(id);
    return expenseRepository.softDelete(id);
  }
}

export const expenseService = new ExpenseService();
