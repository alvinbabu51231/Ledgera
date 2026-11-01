import { buildApp } from './app';
import { initializeDatabase } from './db';

const DEFAULT_PORT = 3001;

export async function startBackend(port = DEFAULT_PORT) {
  await initializeDatabase();

  const app = buildApp();
  await app.listen({ port, host: '127.0.0.1' });
  console.log(`Backend running on http://127.0.0.1:${port}`);
  return app;
}

if (process.env.LEDGERA_EMBEDDED_BACKEND !== '1' && process.env.COMBERP_EMBEDDED_BACKEND !== '1') {
  startBackend().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
