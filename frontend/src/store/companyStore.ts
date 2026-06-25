import { create } from 'zustand';
import { Company } from '../../../shared/types/company';
import { companyApi } from '../api/companyApi';

interface CompanyState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  loading: false,
  error: null,
  
  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const response = await companyApi.getAll();
      set({ companies: response.data.filter(c => c.is_active), loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch companies', loading: false });
    }
  },
}));
