import { and, eq, like, or, inArray, desc, SQL } from 'drizzle-orm';

import { db } from '../../db';
import { companies } from '../companies/company.schema';
import { customers } from '../customers/customer.schema';
import { invoice_history, invoice_items, invoices } from './invoice.schema';
import {
  CreateInvoiceInput,
  InvoiceHistoryEntry,
  InvoiceWithDetails,
  UpdateInvoiceInput,
} from '../../../shared/types/invoice';

type PersistedInvoiceInput = Omit<CreateInvoiceInput, 'items'> & {
  invoice_number: string;
  financial_year: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  round_off: number;
  grand_total: number;
};

type InvoiceHeaderChanges = Omit<UpdateInvoiceInput, 'items'> &
  Partial<Pick<
    PersistedInvoiceInput,
    'invoice_number' | 'financial_year' | 'subtotal' | 'cgst' | 'sgst' | 'discount_amount' | 'round_off' | 'grand_total'
  >>;

export class InvoiceRepository {
  async findAll(companyId?: number, search?: string, status?: string, limit?: number, offset?: number): Promise<InvoiceWithDetails[]> {
    const conditions: (SQL<unknown> | undefined)[] = [eq(invoices.is_active, true)];
    if (companyId) conditions.push(eq(invoices.company_id, companyId));
    if (status) conditions.push(eq(invoices.status, status));

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(invoices.invoice_number, searchPattern),
          like(customers.customer_name, searchPattern)
        )
      );
    }

    let query = db
      .select({
        invoice: invoices,
        customer_name: customers.customer_name,
        company_name: companies.company_name
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customer_id, customers.id))
      .leftJoin(companies, eq(invoices.company_id, companies.id))
      .where(and(...conditions))
      .orderBy(desc(invoices.id));

    // Limit and Offset might be 0, which is valid, but usually we pass undefined when no limit
    if (limit !== undefined) query = query.limit(limit) as any;
    if (offset !== undefined) query = query.offset(offset) as any;

    const invoiceRows = await query;
    if (invoiceRows.length === 0) return [];

    const invoiceIds = invoiceRows.map(row => row.invoice.id);
    const allItems = await db.select().from(invoice_items).where(inArray(invoice_items.invoice_id, invoiceIds));

    return invoiceRows.map(row => ({
      ...row.invoice,
      invoice_type: row.invoice.invoice_type as InvoiceWithDetails['invoice_type'],
      status: row.invoice.status as InvoiceWithDetails['status'],
      customer_name: row.customer_name ?? 'Unknown',
      company_name: row.company_name ?? 'Unknown',
      items: allItems.filter(item => item.invoice_id === row.invoice.id)
    }));
  }

  async findById(id: number, tx: any = db): Promise<InvoiceWithDetails | null> {
    const invoiceResult = await tx
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.is_active, true)));
    const invoice = invoiceResult[0];
    if (!invoice) return null;

    const items = await tx.select().from(invoice_items).where(eq(invoice_items.invoice_id, id));
    const customerResult = await tx
      .select()
      .from(customers)
      .where(eq(customers.id, invoice.customer_id));
    const companyResult = await tx
      .select()
      .from(companies)
      .where(eq(companies.id, invoice.company_id));

    return {
      ...invoice,
      invoice_type: invoice.invoice_type as InvoiceWithDetails['invoice_type'],
      status: invoice.status as InvoiceWithDetails['status'],
      customer_name: customerResult[0]?.customer_name ?? 'Unknown',
      company_name: companyResult[0]?.company_name ?? 'Unknown',
      items,
    };
  }

  async getNextInvoiceSequence(
    companyId: number,
    financialYear: string,
    prefix: string,
    excludeInvoiceId?: number,
    tx: any = db
  ): Promise<number> {
    const result = await tx
      .select()
      .from(invoices)
      .where(and(eq(invoices.company_id, companyId), eq(invoices.financial_year, financialYear)));

    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escapedPrefix}${financialYear}-(\\d+)$`);
    const maxSequence = result.reduce((max: number, invoice: any) => {
      if (invoice.id === excludeInvoiceId) return max;
      const match = pattern.exec(invoice.invoice_number);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return maxSequence + 1;
  }

  async getHistory(invoiceId: number): Promise<InvoiceHistoryEntry[]> {
    const rows = await db
      .select()
      .from(invoice_history)
      .where(eq(invoice_history.invoice_id, invoiceId));

    return rows
      .map(row => ({
        id: row.id,
        invoice_id: row.invoice_id,
        action: row.action as InvoiceHistoryEntry['action'],
        snapshot: JSON.parse(row.snapshot) as InvoiceWithDetails,
        created_at: row.created_at,
      }))
      .sort((a, b) => b.id - a.id);
  }

  async addHistory(invoice: InvoiceWithDetails, action: InvoiceHistoryEntry['action'], tx: any = db) {
    await tx.insert(invoice_history).values({
      invoice_id: invoice.id,
      action,
      snapshot: JSON.stringify(invoice),
      created_at: new Date().toISOString(),
    });
  }

  async create(data: PersistedInvoiceInput, items: CreateInvoiceInput['items'], tx: any = db) {
    const invoiceResult = await tx
      .insert(invoices)
      .values({
        ...data,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning();
    const newInvoice = invoiceResult[0];

    await tx.insert(invoice_items).values(
      items.map(item => ({ ...item, invoice_id: newInvoice.id }))
    );

    return this.findById(newInvoice.id, tx);
  }

  async update(id: number, data: InvoiceHeaderChanges, items?: UpdateInvoiceInput['items'], tx: any = db) {
    await tx
      .update(invoices)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(and(eq(invoices.id, id), eq(invoices.is_active, true)));

    if (items) {
      await tx.delete(invoice_items).where(eq(invoice_items.invoice_id, id));
      await tx.insert(invoice_items).values(items.map(item => ({ ...item, invoice_id: id })));
    }

    return this.findById(id, tx);
  }

  async softDelete(id: number, tx: any = db) {
    const result = await tx
      .update(invoices)
      .set({ is_active: false, updated_at: new Date().toISOString() })
      .where(and(eq(invoices.id, id), eq(invoices.is_active, true)))
      .returning();
    return result[0] ?? null;
  }
}

export const invoiceRepository = new InvoiceRepository();
