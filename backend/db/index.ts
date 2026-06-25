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
  await client.execute(`DROP TABLE IF EXISTS companies`);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      gst_number TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      bank_name TEXT,
      account_holder TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      invoice_prefix TEXT NOT NULL DEFAULT 'INV',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      size TEXT NOT NULL,
      unit TEXT NOT NULL,
      selling_price REAL NOT NULL,
      manufacturing_cost REAL NOT NULL,
      gst_percentage REAL NOT NULL,
      hsn_code TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existingCompanies = await client.execute(`SELECT COUNT(*) as count FROM companies`);
  if (existingCompanies.rows[0].count === 0) {
    await client.execute(`
      INSERT INTO companies (company_name, invoice_prefix)
      VALUES ('Able Plastics', 'AP-'), ('Relative Plastics', 'RP-')
    `);
  }

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
