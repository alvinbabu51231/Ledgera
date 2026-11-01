import { create } from 'zustand';
import { Customer } from '../../../shared/types/customer';
import { customerApi } from '../api/customerApi';
import { getErrorMessage } from '../utils/errors';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: (search?: string, limit?: number, offset?: number) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,
  
  fetchCustomers: async (search?: string, limit: number = 50, offset?: number) => {
    set({ loading: true, error: null });
    try {
      const response = await customerApi.getAll(search, limit, offset);
      // Filter out soft-deleted customers on frontend to be safe, or assume backend doesn't return them if we modified it.
      // Wait, backend repository currently returns all customers including soft-deleted if we didn't add a filter.
      // Let's filter here for safety.
      set({ customers: response.data.filter(c => c.is_active), loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch customers'), loading: false });
    }
  },

  deleteCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await customerApi.delete(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to delete customer'), loading: false });
    }
  }
}));
