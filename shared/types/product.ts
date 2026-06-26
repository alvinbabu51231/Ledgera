import { z } from 'zod';

export const createProductSchema = z.object({
  product_code: z.string().min(1, "Product code is required"),
  product_name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  size: z.string().min(1, "Size is required"),
  unit: z.enum(["Gross", "Dozen", "Piece"]),
  selling_price: z.number().min(0, "Selling price must be positive"),
  manufacturing_cost: z.number().min(0, "Manufacturing cost must be positive"),
  gst_percentage: z.number().min(0).max(100, "GST must be between 0 and 100"),
  hsn_code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  category: string;
  size: string;
  unit: string;
  selling_price: number;
  manufacturing_cost: number;
  gst_percentage: number;
  hsn_code: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
