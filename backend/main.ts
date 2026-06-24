import { buildApp } from './app';
import { initializeDatabase } from './db';

const PORT = 3001;

async function start() {
  try {
    // Initialize SQLite
    await initializeDatabase();

    const app = buildApp();
    
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Backend running on http://localhost:${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
