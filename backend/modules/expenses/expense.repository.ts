import { and, eq } from 'drizzle-orm';

import { db } from '../../db';
import { companies } from '../companies/company.schema';
import { expenses } from './expense.schema';
import {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '../../../shared/types/expense';

export class ExpenseRepository {
  async findAll(companyId?: number, search?: string): Promise<Expense[]> {
    const rows = await db.select().from(expenses).where(eq(expenses.is_active, true));
    const allCompanies = await db.select().from(companies);
    const companyMap = new Map(allCompanies.map(company => [company.id, company.company_name]));
    const query = search?.toLowerCase();

    return rows
      .filter(expense => !companyId || expense.company_id === companyId)
      .filter(expense => !query ||
        expense.category.toLowerCase().includes(query) ||
        expense.payment_method.toLowerCase().includes(query) ||
        expense.notes?.toLowerCase().includes(query)
      )
      .map(expense => ({
        ...expense,
        category: expense.category as Expense['category'],
        payment_method: expense.payment_method as Expense['payment_method'],
        company_name: companyMap.get(expense.company_id) ?? 'Unknown',
      }))
      .sort((a, b) => b.expense_date.localeCompare(a.expense_date) || b.id - a.id);
  }

  async findById(id: number): Promise<Expense | null> {
    const result = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.is_active, true)));
    const expense = result[0];
    if (!expense) return null;
    const companyResult = await db.select().from(companies).where(eq(companies.id, expense.company_id));
    return {
      ...expense,
      category: expense.category as Expense['category'],
      payment_method: expense.payment_method as Expense['payment_method'],
      company_name: companyResult[0]?.company_name ?? 'Unknown',
    };
  }

  async create(data: CreateExpenseInput) {
    const result = await db.insert(expenses).values({
      ...data,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).returning();
    return this.findById(result[0].id);
  }

  async update(id: number, data: UpdateExpenseInput) {
    await db.update(expenses).set({
      ...data,
      updated_at: new Date().toISOString(),
    }).where(and(eq(expenses.id, id), eq(expenses.is_active, true)));
    return this.findById(id);
  }

  async softDelete(id: number) {
    const result = await db.update(expenses).set({
      is_active: false,
      updated_at: new Date().toISOString(),
    }).where(and(eq(expenses.id, id), eq(expenses.is_active, true))).returning();
    return result[0] ?? null;
  }
}

export const expenseRepository = new ExpenseRepository();
