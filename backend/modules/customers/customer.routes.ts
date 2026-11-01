import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { customerService } from './customer.service';
import { CreateCustomerInput, UpdateCustomerInput } from '../../../shared/types/customer';
import { ZodError } from 'zod';

export default async function customerRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { search } = request.query as { search?: string };
    try {
      const customers = await customerService.getAllCustomers(search);
      return reply.send({ success: true, data: customers });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const customer = await customerService.getCustomerById(Number(id));
      return reply.send({ success: true, data: customer });
    } catch (error: any) {
      return reply.status(404).send({ success: false, message: error.message });
    }
  });

  fastify.get('/:id/ledger', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const ledger = await customerService.getCustomerLedger(Number(id));
      return reply.send({ success: true, data: ledger });
    } catch (error: any) {
      return reply.status(404).send({ success: false, message: error.message });
    }
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as CreateCustomerInput;
      const customer = await customerService.createCustomer(data);
      return reply.status(201).send({ success: true, data: customer });
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
      const data = request.body as UpdateCustomerInput;
      const customer = await customerService.updateCustomer(Number(id), data);
      return reply.send({ success: true, data: customer });
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
      await customerService.deleteCustomer(Number(id));
      return reply.send({ success: true, message: 'Customer archived successfully' });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });
}
