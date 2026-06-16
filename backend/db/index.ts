import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

export let db: ReturnType<typeof drizzle>;

export function initializeDatabase() {
  const dbDir = path.resolve(process.cwd(), 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'comberp.db');

  const client = createClient({
    url: `file:${dbPath}`
  });

  db = drizzle(client, { schema });
  console.log(`SQLite database initialized at ${dbPath}`);
}
