import { apiClient } from './apiClient';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../../../shared/types/customer';

export const customerApi = {
  getAll: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<{ success: boolean; data: Customer[] }>(`/customers${query}`);
  },
  
  getById: (id: number) => {
    return apiClient.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
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
