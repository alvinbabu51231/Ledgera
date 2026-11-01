import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { invoiceService } from './invoice.service';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../../../shared/types/invoice';
import { ZodError } from 'zod';

export default async function invoiceRoutes(fastify: FastifyInstance) {
  // GET /api/invoices?companyId=&search=&status=
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { companyId, search, status, limit, offset } = request.query as {
      companyId?: string;
      search?: string;
      status?: string;
      limit?: string;
      offset?: string;
    };
    try {
      const invoices = await invoiceService.getAllInvoices(
        companyId ? Number(companyId) : undefined,
        search,
        status,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined
      );
      return reply.send({ success: true, data: invoices });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  fastify.get('/:id/history', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const history = await invoiceService.getInvoiceHistory(Number(id));
      return reply.send({ success: true, data: history });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load invoice history';
      return reply.status(404).send({ success: false, message });
    }
  });

  // GET /api/invoices/:id
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const invoice = await invoiceService.getInvoiceById(Number(id));
      return reply.send({ success: true, data: invoice });
    } catch (error: any) {
      return reply.status(404).send({ success: false, message: error.message });
    }
  });

  // POST /api/invoices
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as CreateInvoiceInput;
      const invoice = await invoiceService.createInvoice(data);
      return reply.status(201).send({ success: true, data: invoice });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ success: false, message: 'Validation Error', errors: error.errors });
      }
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // PUT /api/invoices/:id
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const data = request.body as UpdateInvoiceInput;
      const invoice = await invoiceService.updateInvoice(Number(id), data);
      return reply.send({ success: true, data: invoice });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ success: false, message: 'Validation Error', errors: error.errors });
      }
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // DELETE /api/invoices/:id
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      await invoiceService.deleteInvoice(Number(id));
      return reply.send({ success: true, message: 'Invoice archived successfully' });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });
}
