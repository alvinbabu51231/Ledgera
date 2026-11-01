import { apiClient } from './apiClient';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../../../shared/types/customer';

export const customerApi = {
  getAll: (search?: string, limit?: number, offset?: number) => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (limit !== undefined) query.set('limit', String(limit));
    if (offset !== undefined) query.set('offset', String(offset));
    const qs = query.toString();
    return apiClient.get<{ success: boolean; data: Customer[] }>(`/customers${qs ? `?${qs}` : ''}`);
  },
  
  getById: (id: number) => {
    return apiClient.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
  },

  getLedger: (id: number) => {
    return apiClient.get<{ success: boolean; data: { company_id: number; company_name: string; total_invoiced: number; invoice_count: number }[] }>(`/customers/${id}/ledger`);
  },

  create: (data: CreateCustomerInput) => {
    return apiClient.post<{ success: boolean; data: Customer }>('/customers', data);
  },

  update: (id: number, data: UpdateCustomerInput) => {
    return apiClient.put<{ success: boolean; data: Customer }>(`/customers/${id}`, data);
  },

  delete: (id: number) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/customers/${id}`);
  }
};
