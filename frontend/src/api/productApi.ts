import { apiClient } from './apiClient';
import { Product, CreateProductInput, UpdateProductInput } from '../../../shared/types/product';

export const productApi = {
  getAll: (search?: string, limit?: number, offset?: number) => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (limit !== undefined) query.set('limit', String(limit));
    if (offset !== undefined) query.set('offset', String(offset));
    const qs = query.toString();
    return apiClient.get<{ success: boolean; data: Product[] }>(`/products${qs ? `?${qs}` : ''}`);
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
