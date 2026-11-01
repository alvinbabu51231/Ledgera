import { create } from 'zustand';
import { InvoiceWithDetails } from '../../../shared/types/invoice';
import { invoiceApi } from '../api/invoiceApi';
import { getErrorMessage } from '../utils/errors';

interface InvoiceState {
  invoices: InvoiceWithDetails[];
  loading: boolean;
  error: string | null;
  fetchInvoices: (params?: { companyId?: number; search?: string; status?: string; limit?: number; offset?: number }) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async (params) => {
    set({ loading: true, error: null });
    try {
      // Default to 50 items if limit is not provided
      const finalParams = { ...params, limit: params?.limit ?? 50 };
      const response = await invoiceApi.getAll(finalParams);
      set({ invoices: response.data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch invoices'), loading: false });
    }
  },

  deleteInvoice: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await invoiceApi.delete(id);
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        loading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to delete invoice'), loading: false });
    }
  },
}));
