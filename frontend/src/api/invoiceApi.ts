import { apiClient } from './apiClient';
import {
  InvoiceWithDetails,
  InvoiceHistoryEntry,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../../../shared/types/invoice';


export const invoiceApi = {
  getAll: (params?: { companyId?: number; search?: string; status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.companyId) query.set('companyId', String(params.companyId));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    const qs = query.toString();
    return apiClient.get<{ success: boolean; data: InvoiceWithDetails[] }>(
      `/invoices${qs ? `?${qs}` : ''}`
    );
  },

  getById: (id: number) => {
    return apiClient.get<{ success: boolean; data: InvoiceWithDetails }>(`/invoices/${id}`);
  },

  getHistory: (id: number) => {
    return apiClient.get<{ success: boolean; data: InvoiceHistoryEntry[] }>(
      `/invoices/${id}/history`
    );
  },

  create: (data: CreateInvoiceInput) => {
    return apiClient.post<{ success: boolean; data: InvoiceWithDetails }>('/invoices', data);
  },

  update: (id: number, data: UpdateInvoiceInput) => {
    return apiClient.put<{ success: boolean; data: InvoiceWithDetails }>(`/invoices/${id}`, data);
  },

  delete: (id: number) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/invoices/${id}`);
  },
};
