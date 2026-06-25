import { apiClient } from './apiClient';
import { Company, UpdateCompanyInput } from '../../../shared/types/company';

export const companyApi = {
  getAll: () => {
    return apiClient.get<{ success: boolean; data: Company[] }>('/companies');
  },
  
  getById: (id: number) => {
    return apiClient.get<{ success: boolean; data: Company }>(`/companies/${id}`);
  },

  update: (id: number, data: UpdateCompanyInput) => {
    return apiClient.put<{ success: boolean; data: Company }>(`/companies/${id}`, data);
  }
};
