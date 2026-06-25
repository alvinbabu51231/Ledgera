import { companyRepository } from './company.repository';
import { UpdateCompanyInput, updateCompanySchema } from '../../../shared/types/company';

export const companyService = {
  getAllCompanies: async () => {
    return companyRepository.findAll();
  },

  getCompanyById: async (id: number) => {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  },

  updateCompany: async (id: number, data: UpdateCompanyInput) => {
    const validatedData = updateCompanySchema.parse(data);
    const existingCompany = await companyRepository.findById(id);
    if (!existingCompany) {
      throw new Error('Company not found');
    }
    return companyRepository.update(id, validatedData);
  }
};
