import { create } from 'zustand';
import { Product } from '../../../shared/types/product';
import { productApi } from '../api/productApi';
import { getErrorMessage } from '../utils/errors';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (search?: string) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  
  fetchProducts: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await productApi.getAll(search);
      set({ products: response.data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch products'), loading: false });
    }
  },

  deleteProduct: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await productApi.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to delete product'), loading: false });
    }
  }
}));
