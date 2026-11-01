import { create } from 'zustand';

import { Expense } from '../../../shared/types/expense';
import { expenseApi } from '../api/expenseApi';
import { getErrorMessage } from '../utils/errors';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: (params?: { companyId?: number; search?: string }) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>(set => ({
  expenses: [],
  loading: false,
  error: null,
  fetchExpenses: async params => {
    set({ loading: true, error: null });
    try {
      const response = await expenseApi.getAll(params);
      set({ expenses: response.data, loading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to load expenses'), loading: false });
    }
  },
  deleteExpense: async id => {
    set({ loading: true, error: null });
    try {
      await expenseApi.delete(id);
      set(state => ({
        expenses: state.expenses.filter(expense => expense.id !== id),
        loading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to archive expense'), loading: false });
    }
  },
}));
