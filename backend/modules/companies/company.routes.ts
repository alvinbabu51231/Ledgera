import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { companyService } from './company.service';
import { UpdateCompanyInput } from '../../../shared/types/company';
import { ZodError } from 'zod';

export default async function companyRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const companies = await companyService.getAllCompanies();
      return reply.send({ success: true, data: companies });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const company = await companyService.getCompanyById(Number(id));
      return reply.send({ success: true, data: company });
    } catch (error: any) {
      return reply.status(404).send({ success: false, message: error.message });
    }
  });

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const data = request.body as UpdateCompanyInput;
      const company = await companyService.updateCompany(Number(id), data);
      return reply.send({ success: true, data: company });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ success: false, message: 'Validation Error', errors: error.errors });
      }
      return reply.status(400).send({ success: false, message: error.message });
    }
  });
}
