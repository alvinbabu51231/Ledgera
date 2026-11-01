import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'Raw Material',
  'Utilities',
  'Transport',
  'Salary',
  'Rent',
  'Maintenance',
  'Office',
  'Tax',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'UPI',
  'Card',
  'Cheque',
  'Other',
] as const;

export const createExpenseSchema = z.object({
  company_id: z.number().int().positive('Company is required'),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format'),
  amount: z.number().int().positive('Amount must be greater than zero'),
  category: z.enum(EXPENSE_CATEGORIES),
  payment_method: z.enum(PAYMENT_METHODS),
  notes: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface Expense {
  id: number;
  company_id: number;
  company_name: string;
  expense_date: string;
  amount: number;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
