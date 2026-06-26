import { productRepository } from './product.repository';
import { CreateProductInput, UpdateProductInput, createProductSchema, updateProductSchema } from '../../../shared/types/product';

export const productService = {
  getAllProducts: async (search?: string) => {
    return productRepository.findAll(search);
  },

  getProductById: async (id: number) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  createProduct: async (data: CreateProductInput) => {
    const validatedData = createProductSchema.parse(data);
    try {
      return await productRepository.create(validatedData);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Product code already exists');
      }
      throw error;
    }
  },

  updateProduct: async (id: number, data: UpdateProductInput) => {
    const validatedData = updateProductSchema.parse(data);
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    try {
      return await productRepository.update(id, validatedData);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Product code already exists');
      }
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    await productRepository.softDelete(id);
  }
};
