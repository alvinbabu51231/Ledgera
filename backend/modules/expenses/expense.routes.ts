import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { expenseService } from './expense.service';
import { CreateExpenseInput, UpdateExpenseInput } from '../../../shared/types/expense';

function errorReply(reply: FastifyReply, error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return reply.status(status).send({ success: false, message: 'Validation Error', errors: error.errors });
  }
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return reply.status(status).send({ success: false, message });
}

export default async function expenseRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { companyId?: string; search?: string };
    try {
      const data = await expenseService.getAll(
        query.companyId ? Number(query.companyId) : undefined,
        query.search
      );
      return reply.send({ success: true, data });
    } catch (error: unknown) {
      return errorReply(reply, error, 500);
    }
  });

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      return reply.send({ success: true, data: await expenseService.getById(Number(id)) });
    } catch (error: unknown) {
      return errorReply(reply, error, 404);
    }
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await expenseService.create(request.body as CreateExpenseInput);
      return reply.status(201).send({ success: true, data });
    } catch (error: unknown) {
      return errorReply(reply, error);
    }
  });

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = await expenseService.update(Number(id), request.body as UpdateExpenseInput);
      return reply.send({ success: true, data });
    } catch (error: unknown) {
      return errorReply(reply, error);
    }
  });

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await expenseService.delete(Number(id));
      return reply.send({ success: true, message: 'Expense archived successfully' });
    } catch (error: unknown) {
      return errorReply(reply, error);
    }
  });
}
