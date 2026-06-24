import Fastify from 'fastify';
import cors from '@fastify/cors';
import customerRoutes from './modules/customers/customer.routes';

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: '*' // Allow all for dev
  });

  app.get('/api/health', async () => {
    return { status: 'ok', message: 'Fastify backend is running' };
  });

  app.register(customerRoutes, { prefix: '/api/customers' });

  return app;
}
