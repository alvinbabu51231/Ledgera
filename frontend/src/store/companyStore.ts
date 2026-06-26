import { create } from 'zustand';
import { Company, UpdateCompanyInput } from '../../../shared/types/company';
import { companyApi } from '../api/companyApi';
import { getErrorMessage } from '../utils/errors';

interface CompanyState {
  companies: Company[];
  selectedCompanyId: number | null;
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  setSelectedCompanyId: (id: number) => void;
  updateCompany: (id: number, data: UpdateCompanyInput) => Promise<Company>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  selectedCompanyId: null,
  selectedCompany: null,
  loading: false,
  error: null,
  
  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const response = await companyApi.getAll();
      const activeCompanies = response.data.filter(c => c.is_active);
      const currentSelectedId = get().selectedCompanyId;
      const selectedCompany =
        activeCompanies.find(c => c.id === currentSelectedId) ??
        activeCompanies[0] ??
        null;

      set({
        companies: activeCompanies,
        selectedCompanyId: selectedCompany?.id ?? null,
        selectedCompany,
        loading: false
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch companies'), loading: false });
    }
  },

  setSelectedCompanyId: (id: number) => {
    const selectedCompany = get().companies.find(company => company.id === id) ?? null;
    set({ selectedCompanyId: selectedCompany?.id ?? null, selectedCompany });
  },

  updateCompany: async (id: number, data: UpdateCompanyInput) => {
    set({ loading: true, error: null });
    try {
      const response = await companyApi.update(id, data);
      const updatedCompany = response.data;
      const companies = get().companies.map(company =>
        company.id === id ? updatedCompany : company
      );
      const selectedCompany =
        get().selectedCompanyId === id ? updatedCompany : get().selectedCompany;

      set({
        companies,
        selectedCompany,
        loading: false
      });
      return updatedCompany;
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to update company'), loading: false });
      throw err;
    }
  },
}));
