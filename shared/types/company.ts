import { z } from 'zod';

export const createCompanySchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  gst_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  bank_name: z.string().optional().nullable(),
  account_holder: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  ifsc_code: z.string().optional().nullable(),
  invoice_prefix: z.string().min(1, "Invoice prefix is required"),
  is_active: z.boolean().optional(),
});

export const updateCompanySchema = createCompanySchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export interface Company {
  id: number;
  company_name: string;
  gst_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  invoice_prefix: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
