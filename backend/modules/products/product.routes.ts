import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { productService } from './product.service';
import { CreateProductInput, UpdateProductInput } from '../../../shared/types/product';
import { ZodError } from 'zod';

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { search, limit, offset } = request.query as { search?: string, limit?: string, offset?: string };
    try {
      const products = await productService.getAllProducts(search, limit ? Number(limit) : undefined, offset ? Number(offset) : undefined);
      return reply.send({ success: true, data: products });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const product = await productService.getProductById(Number(id));
      return reply.send({ success: true, data: product });
    } catch (error: any) {
      return reply.status(404).send({ success: false, message: error.message });
    }
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as CreateProductInput;
      const product = await productService.createProduct(data);
      return reply.status(201).send({ success: true, data: product });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ success: false, message: 'Validation Error', errors: error.errors });
      }
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const data = request.body as UpdateProductInput;
      const product = await productService.updateProduct(Number(id), data);
      return reply.send({ success: true, data: product });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ success: false, message: 'Validation Error', errors: error.errors });
      }
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      await productService.deleteProduct(Number(id));
      return reply.send({ success: true, message: 'Product archived successfully' });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });
}
