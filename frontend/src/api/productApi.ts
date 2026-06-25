import { apiClient } from './apiClient';
import { Product, CreateProductInput, UpdateProductInput } from '../../../shared/types/product';

export const productApi = {
  getAll: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<{ success: boolean; data: Product[] }>(`/products${query}`);
  },
  
  getById: (id: number) => {
    return apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
  },

  create: (data: CreateProductInput) => {
    return apiClient.post<{ success: boolean; data: Product }>('/products', data);
  },

  update: (id: number, data: UpdateProductInput) => {
    return apiClient.put<{ success: boolean; data: Product }>(`/products/${id}`, data);
  },

  delete: (id: number) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/products/${id}`);
  }
};
