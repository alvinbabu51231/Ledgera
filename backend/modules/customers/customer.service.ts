import { customerRepository } from './customer.repository';
import { CreateCustomerInput, UpdateCustomerInput, createCustomerSchema, updateCustomerSchema } from '../../../shared/types/customer';

export class CustomerService {
  async createCustomer(data: CreateCustomerInput) {
    // Validate payload
    const validatedData = createCustomerSchema.parse(data);

    // Duplicate check
    const existing = await customerRepository.findByExactDetails(validatedData.customer_name, validatedData.phone_number);
    if (existing) {
      throw new Error('Customer with the same name and phone number already exists.');
    }

    // Generate customer code
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    const timeStr = Date.now().toString().slice(-4);
    const customer_code = `CUST-${timeStr}${randomStr}`;

    return await customerRepository.create({ ...validatedData, customer_code });
  }

  async getCustomerById(id: number) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async getAllCustomers(search?: string) {
    return await customerRepository.findAll(search);
  }

  async updateCustomer(id: number, data: UpdateCustomerInput) {
    const validatedData = updateCustomerSchema.parse(data);
    
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return await customerRepository.update(id, validatedData);
  }

  async deleteCustomer(id: number) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return await customerRepository.softDelete(id);
  }
}

export const customerService = new CustomerService();
