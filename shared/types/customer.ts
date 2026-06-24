import { z } from 'zod';

export const createCustomerSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  whatsapp_number: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  gst_number: z.string().optional().nullable(),
  billing_address: z.string().min(1, "Billing address is required"),
  delivery_address: z.string().min(1, "Delivery address is required"),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  phone_number: string;
  whatsapp_number: string | null;
  email: string | null;
  gst_number: string | null;
  billing_address: string;
  delivery_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
