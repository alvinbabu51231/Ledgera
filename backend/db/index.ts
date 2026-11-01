import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import os from 'os';
import * as schema from './schema';

export let db: ReturnType<typeof drizzle>;

/**
 * Resolves the production-safe database directory.
 * Priority:
 *   1. LEDGERA_DATA_DIR / COMBERP_DATA_DIR env var (set by Electron in packaged mode)
 *   2. OS app-data folder: %APPDATA%/Ledgera/database  (Windows)
 *                          ~/Library/Application Support/Ledgera/database (macOS)
 *                          ~/.local/share/Ledgera/database (Linux)
 * NEVER falls back to the project directory — that would be wiped on update.
 */
function resolveDbDir(): string {
  if (process.env.LEDGERA_DATA_DIR) {
    return path.resolve(process.env.LEDGERA_DATA_DIR);
  }
  if (process.env.COMBERP_DATA_DIR) {
    return path.resolve(process.env.COMBERP_DATA_DIR);
  }
  // Determine OS-appropriate app-data root
  let appData: string;
  if (process.platform === 'win32') {
    appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  } else if (process.platform === 'darwin') {
    appData = path.join(os.homedir(), 'Library', 'Application Support');
  } else {
    appData = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  }
  return path.join(appData, 'Ledgera', 'database');
}

/**
 * One-time migration: if the old database exists (either comberp.db in app-data or in project root)
 * and the new location is empty, copy it to the new location so no data is lost on update.
 */
function migrateOldDatabaseIfNeeded(newDbPath: string, dbDir: string) {
  if (fs.existsSync(newDbPath)) return; // New DB already exists — never overwrite

  // Old locations might be comberp.db in the new app-data dbDir or in project root
  const candidates = [
    path.join(dbDir, 'comberp.db'),
    path.resolve(process.cwd(), 'database', 'ledgera.db'),
    path.resolve(process.cwd(), 'database', 'comberp.db'),
    path.resolve(__dirname, '..', '..', 'database', 'comberp.db'),
    path.resolve(__dirname, '..', 'database', 'comberp.db'),
  ];

  for (const oldPath of candidates) {
    if (fs.existsSync(oldPath)) {
      console.log(`[Migration] Moving database from ${oldPath} to ${newDbPath}`);
      try {
        fs.copyFileSync(oldPath, newDbPath);
        // Rename original so we don't migrate again, but keep it as backup
        fs.renameSync(oldPath, oldPath + '.bak');
        console.log('[Migration] Database moved successfully. Old file kept as .bak');
      } catch (err) {
        console.error('[Migration] Failed to migrate database:', err);
      }
      return;
    }
  }
}

export async function initializeDatabase() {
  const dbDir = resolveDbDir();
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'ledgera.db');
  migrateOldDatabaseIfNeeded(dbPath, dbDir);


  const client = createClient({
    url: `file:${dbPath}`
  });

  await client.execute('PRAGMA foreign_keys = ON;');

  db = drizzle(client, { schema });

  // Helper to ensure columns exist in an existing table (Automatic additive migration)
  const ensureColumnsExist = async (tableName: string, requiredColumns: Record<string, string>) => {
    try {
      const existingColumnsResult = await client.execute(`PRAGMA table_info(${tableName})`);
      const existingColumnNames = existingColumnsResult.rows.map(row => row.name as string);
      
      for (const [colName, colDef] of Object.entries(requiredColumns)) {
        if (!existingColumnNames.includes(colName)) {
          console.log(`Migrating: Adding column ${colName} to ${tableName}`);
          await client.execute(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colDef}`);
        }
      }
    } catch (err) {
      console.error(`Error ensuring columns for ${tableName}:`, err);
    }
  };

  // Ensure tables exist on startup without dropping user data.
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

  await ensureColumnsExist('companies', {
    company_name: 'TEXT NOT NULL DEFAULT ""',
    gst_number: 'TEXT',
    address: 'TEXT',
    phone: 'TEXT',
    email: 'TEXT',
    bank_name: 'TEXT',
    account_holder: 'TEXT',
    account_number: 'TEXT',
    ifsc_code: 'TEXT',
    invoice_prefix: 'TEXT NOT NULL DEFAULT "INV"',
    is_active: 'INTEGER NOT NULL DEFAULT 1',
    created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      size TEXT NOT NULL,
      unit TEXT NOT NULL,
      selling_price INTEGER NOT NULL,
      manufacturing_cost INTEGER NOT NULL,
      gst_percentage INTEGER NOT NULL,
      hsn_code TEXT,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureColumnsExist('products', {
    product_code: 'TEXT NOT NULL DEFAULT ""',
    product_name: 'TEXT NOT NULL DEFAULT ""',
    category: 'TEXT NOT NULL DEFAULT ""',
    size: 'TEXT NOT NULL DEFAULT ""',
    unit: 'TEXT NOT NULL DEFAULT ""',
    selling_price: 'INTEGER NOT NULL DEFAULT 0',
    manufacturing_cost: 'INTEGER NOT NULL DEFAULT 0',
    gst_percentage: 'INTEGER NOT NULL DEFAULT 0',
    hsn_code: 'TEXT',
    description: 'TEXT',
    is_active: 'INTEGER NOT NULL DEFAULT 1',
    created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
  });

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

  await ensureColumnsExist('customers', {
    customer_code: 'TEXT NOT NULL DEFAULT ""',
    customer_name: 'TEXT NOT NULL DEFAULT ""',
    phone_number: 'TEXT NOT NULL DEFAULT ""',
    whatsapp_number: 'TEXT',
    email: 'TEXT',
    gst_number: 'TEXT',
    billing_address: 'TEXT NOT NULL DEFAULT ""',
    delivery_address: 'TEXT NOT NULL DEFAULT ""',
    is_active: 'INTEGER NOT NULL DEFAULT 1',
    created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      financial_year TEXT NOT NULL,
      company_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      invoice_date TEXT NOT NULL,
      invoice_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft',
      subtotal INTEGER NOT NULL DEFAULT 0,
      cgst INTEGER NOT NULL DEFAULT 0,
      sgst INTEGER NOT NULL DEFAULT 0,
      grand_total INTEGER NOT NULL DEFAULT 0,
      discount_type TEXT NOT NULL DEFAULT 'None',
      discount_value INTEGER NOT NULL DEFAULT 0,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      round_off INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  await ensureColumnsExist('invoices', {
    invoice_number: 'TEXT NOT NULL DEFAULT ""',
    financial_year: 'TEXT NOT NULL DEFAULT ""',
    company_id: 'INTEGER NOT NULL DEFAULT 0',
    customer_id: 'INTEGER NOT NULL DEFAULT 0',
    invoice_date: 'TEXT NOT NULL DEFAULT ""',
    invoice_type: 'TEXT NOT NULL DEFAULT ""',
    status: 'TEXT NOT NULL DEFAULT "Draft"',
    subtotal: 'INTEGER NOT NULL DEFAULT 0',
    cgst: 'INTEGER NOT NULL DEFAULT 0',
    sgst: 'INTEGER NOT NULL DEFAULT 0',
    grand_total: 'INTEGER NOT NULL DEFAULT 0',
    discount_type: 'TEXT NOT NULL DEFAULT "None"',
    discount_value: 'INTEGER NOT NULL DEFAULT 0',
    discount_amount: 'INTEGER NOT NULL DEFAULT 0',
    round_off: 'INTEGER NOT NULL DEFAULT 0',
    notes: 'TEXT',
    is_active: 'INTEGER NOT NULL DEFAULT 1',
    created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      rate INTEGER NOT NULL,
      gst_percentage INTEGER NOT NULL,
      gst_amount INTEGER NOT NULL,
      total INTEGER NOT NULL,
      hsn_code TEXT,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  await ensureColumnsExist('invoice_items', {
    invoice_id: 'INTEGER NOT NULL DEFAULT 0',
    product_id: 'INTEGER NOT NULL DEFAULT 0',
    product_name: 'TEXT NOT NULL DEFAULT ""',
    quantity: 'REAL NOT NULL DEFAULT 0',
    unit: 'TEXT NOT NULL DEFAULT ""',
    rate: 'INTEGER NOT NULL DEFAULT 0',
    gst_percentage: 'INTEGER NOT NULL DEFAULT 0',
    gst_amount: 'INTEGER NOT NULL DEFAULT 0',
    total: 'INTEGER NOT NULL DEFAULT 0',
    hsn_code: 'TEXT'
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS invoice_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  await ensureColumnsExist('invoice_history', {
    invoice_id: 'INTEGER NOT NULL DEFAULT 0',
    action: 'TEXT NOT NULL DEFAULT ""',
    snapshot: 'TEXT NOT NULL DEFAULT ""',
    created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      expense_date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  await ensureColumnsExist('expenses', {
    company_id: 'INTEGER NOT NULL DEFAULT 0',
    expense_date: 'TEXT NOT NULL DEFAULT ""',
    amount: 'INTEGER NOT NULL DEFAULT 0',
    category: 'TEXT NOT NULL DEFAULT ""',
    payment_method: 'TEXT NOT NULL DEFAULT ""',
    notes: 'TEXT',
    is_active: 'INTEGER NOT NULL DEFAULT 1',
    created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
  });

  console.log(`SQLite database initialized at ${dbPath}`);
}
