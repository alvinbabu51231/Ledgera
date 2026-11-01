import { z } from 'zod';

// --- Enums ---
export const INVOICE_TYPES = ['B2B', 'B2C'] as const;
export const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Cancelled'] as const;
export const DISCOUNT_TYPES = ['None', 'Percentage', 'Fixed', 'GST'] as const;

export type InvoiceType = typeof INVOICE_TYPES[number];
export type InvoiceStatus = typeof INVOICE_STATUSES[number];
export type DiscountType = typeof DISCOUNT_TYPES[number];

// --- Invoice Item Schemas ---
export const invoiceItemSchema = z.object({
  product_id: z.number().int().positive('Product is required'),
  product_name: z.string().min(1, 'Product name is required'),
  hsn_code: z.string().optional().nullable(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().int().min(0, 'Rate must be non-negative'),
  gst_percentage: z.number().int().min(0).max(100, 'GST must be between 0 and 100'),
  gst_amount: z.number().int().min(0),
  total: z.number().int().min(0),
});

// --- Invoice Schemas ---
export const createInvoiceSchema = z.object({
  company_id: z.number().int().positive('Company is required'),
  customer_id: z.number().int().positive('Customer is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  invoice_type: z.enum(INVOICE_TYPES, { errorMap: () => ({ message: 'Invalid invoice type' }) }),
  status: z.enum(INVOICE_STATUSES, { errorMap: () => ({ message: 'Invalid status' }) }).default('Draft'),
  discount_type: z.enum(DISCOUNT_TYPES).default('None'),
  discount_value: z.number().int().min(0).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').optional(),
  is_active: z.boolean().optional(),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

// --- Runtime Types (returned from DB) ---
export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  product_name: string;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  rate: number;
  gst_percentage: number;
  gst_amount: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  financial_year: string;
  company_id: number;
  customer_id: number;
  invoice_date: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  cgst: number;
  sgst: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  round_off: number;
  grand_total: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithDetails extends Invoice {
  items: InvoiceItem[];
  customer_name: string;
  company_name: string;
}

export interface InvoiceHistoryEntry {
  id: number;
  invoice_id: number;
  action: 'Created' | 'Updated' | 'Deleted';
  snapshot: InvoiceWithDetails;
  created_at: string;
}
