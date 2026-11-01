import { apiClient } from './apiClient';
import {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '../../../shared/types/expense';

export const expenseApi = {
  getAll: (params?: { companyId?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.companyId) query.set('companyId', String(params.companyId));
    if (params?.search) query.set('search', params.search);
    const suffix = query.toString();
    return apiClient.get<{ success: boolean; data: Expense[] }>(
      `/expenses${suffix ? `?${suffix}` : ''}`
    );
  },
  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: Expense }>(`/expenses/${id}`),
  create: (data: CreateExpenseInput) =>
    apiClient.post<{ success: boolean; data: Expense }>('/expenses', data),
  update: (id: number, data: UpdateExpenseInput) =>
    apiClient.put<{ success: boolean; data: Expense }>(`/expenses/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<{ success: boolean; message: string }>(`/expenses/${id}`),
};
