import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

export let db: ReturnType<typeof drizzle>;

export async function initializeDatabase() {
  const dbDir = path.resolve(process.cwd(), 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'comberp.db');

  const client = createClient({
    url: `file:${dbPath}`
  });

  db = drizzle(client, { schema });

  // Ensure tables exist on startup
  await client.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      whatsapp_number TEXT,
      email TEXT,
      gst_number TEXT,
      billing_address TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log(`SQLite database initialized at ${dbPath}`);
}
