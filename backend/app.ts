import Fastify from 'fastify';
import cors from '@fastify/cors';
import customerRoutes from './modules/customers/customer.routes';
import companyRoutes from './modules/companies/company.routes';
import productRoutes from './modules/products/product.routes';

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
  app.register(companyRoutes, { prefix: '/api/companies' });
  app.register(productRoutes, { prefix: '/api/products' });

  return app;
}
