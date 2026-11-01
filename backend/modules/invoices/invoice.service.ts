import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { companies } from '../companies/company.schema';
import { customers } from '../customers/customer.schema';
import { invoiceRepository } from './invoice.repository';
import {
  CreateInvoiceInput,
  DiscountType,
  InvoiceItemInput,
  UpdateInvoiceInput,
  createInvoiceSchema,
  updateInvoiceSchema,
} from '../../../shared/types/invoice';

export function deriveFinancialYear(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) throw new Error('Invoice date must use YYYY-MM-DD format');

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new Error('Invoice date is invalid');
  }

  if (month >= 4) {
    return `${String(year).slice(-2)}${String(year + 1).slice(-2)}`;
  }
  return `${String(year - 1).slice(-2)}${String(year).slice(-2)}`;
}

async function generateInvoiceNumber(
  companyId: number,
  financialYear: string,
  excludeInvoiceId?: number,
  tx: any = db
): Promise<string> {
  const companyResult = await tx.select().from(companies).where(eq(companies.id, companyId));
  const company = companyResult[0];
  if (!company || !company.is_active) throw new Error('Company not found');

  const sequence = await invoiceRepository.getNextInvoiceSequence(
    companyId,
    financialYear,
    company.invoice_prefix,
    excludeInvoiceId,
    tx
  );
  return `${company.invoice_prefix}${financialYear}-${String(sequence).padStart(4, '0')}`;
}

function calculateInvoice(
  items: InvoiceItemInput[],
  discountType: DiscountType = 'None',
  discountValue: number = 0
) {
  const calculatedItems = items.map(item => {
    const taxable = Math.round(item.quantity * item.rate);
    const gst_amount = Math.round((taxable * item.gst_percentage) / 100);
    return { ...item, gst_amount, total: taxable + gst_amount };
  });
  
  const subtotal = calculatedItems.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.rate),
    0
  );
  const gst = calculatedItems.reduce((sum, item) => sum + item.gst_amount, 0);
  
  const cgst = Math.round(gst / 2);
  const sgst = gst - cgst;

  // --- Discount calculation ---
  let discount_amount = 0;
  if (discountType === 'Percentage') {
    // discount_value stores the integer percentage (e.g. 5 = 5%, 18 = 18%)
    discount_amount = Math.round((subtotal + gst) * discountValue / 100);
  } else if (discountType === 'Fixed') {
    discount_amount = discountValue; // stored in paisa
  } else if (discountType === 'GST') {
    discount_amount = cgst + sgst; // waive the full GST amount
  }

  // Ensure discount does not exceed subtotal + gst
  discount_amount = Math.min(discount_amount, subtotal + gst);

  const beforeRound = subtotal + gst - discount_amount;
  const rounded = Math.round(beforeRound); // round to nearest rupee (already integer paisa, so this is a no-op)
  const round_off = rounded - beforeRound; // will be 0 since we're already in integer paisa

  return {
    items: calculatedItems,
    subtotal,
    cgst,
    sgst,
    discount_amount,
    round_off: 0, // paisa is already integer; round_off reserved for future
    grand_total: subtotal + gst - discount_amount,
  };
}

async function assertCustomerExists(customerId: number, tx: any = db) {
  const result = await tx.select().from(customers).where(eq(customers.id, customerId));
  if (!result[0] || !result[0].is_active) throw new Error('Customer not found');
}

export class InvoiceService {
  async createInvoice(data: CreateInvoiceInput) {
    const validated = createInvoiceSchema.parse(data);

    return db.transaction(async (tx) => {
      await assertCustomerExists(validated.customer_id, tx);

      const financialYear = deriveFinancialYear(validated.invoice_date);
      const invoice_number = await generateInvoiceNumber(validated.company_id, financialYear, undefined, tx);
      const { items, discount_type, discount_value, ...header } = validated;
      const calculated = calculateInvoice(items, discount_type, discount_value ?? 0);

      const created = await invoiceRepository.create(
        {
          ...header,
          financial_year: financialYear,
          invoice_number,
          subtotal: calculated.subtotal,
          cgst: calculated.cgst,
          sgst: calculated.sgst,
          discount_type: discount_type ?? 'None',
          discount_value: discount_value ?? 0,
          discount_amount: calculated.discount_amount,
          round_off: calculated.round_off,
          grand_total: calculated.grand_total,
        },
        calculated.items,
        tx
      );
      if (!created) throw new Error('Failed to create invoice');

      await invoiceRepository.addHistory(created, 'Created', tx);
      return created;
    });
  }

  async getInvoiceById(id: number) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async getAllInvoices(companyId?: number, search?: string, status?: string, limit?: number, offset?: number) {
    return invoiceRepository.findAll(companyId, search, status, limit, offset);
  }

  async getInvoiceHistory(id: number) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new Error('Invoice not found');
    return invoiceRepository.getHistory(id);
  }

  async updateInvoice(id: number, data: UpdateInvoiceInput) {
    const validated = updateInvoiceSchema.parse(data);
    
    return db.transaction(async (tx) => {
      const existing = await invoiceRepository.findById(id, tx);
      if (!existing) throw new Error('Invoice not found');
      if (existing.status === 'Paid') throw new Error('Cannot modify a paid invoice');

      const { items, ...requestHeader } = validated;
      const companyId = requestHeader.company_id ?? existing.company_id;
      const customerId = requestHeader.customer_id ?? existing.customer_id;
      const invoiceDate = requestHeader.invoice_date ?? existing.invoice_date;
      const financialYear = deriveFinancialYear(invoiceDate);
      await assertCustomerExists(customerId, tx);

      const header: Omit<UpdateInvoiceInput, 'items'> & {
        financial_year: string;
        invoice_number?: string;
        subtotal?: number;
        cgst?: number;
        sgst?: number;
        grand_total?: number;
      } = { ...requestHeader, financial_year: financialYear };

      if (companyId !== existing.company_id || financialYear !== existing.financial_year) {
        header.invoice_number = await generateInvoiceNumber(companyId, financialYear, id, tx);
      }

      let calculatedItems = items;
      if (items) {
        const dType = requestHeader.discount_type ?? existing.discount_type ?? 'None';
        const dVal = requestHeader.discount_value ?? existing.discount_value ?? 0;
        const calculated = calculateInvoice(items, dType, dVal);
        calculatedItems = calculated.items;
        header.subtotal = calculated.subtotal;
        header.cgst = calculated.cgst;
        header.sgst = calculated.sgst;
        header.discount_amount = calculated.discount_amount;
        header.round_off = calculated.round_off;
        header.grand_total = calculated.grand_total;
      }

      const updated = await invoiceRepository.update(id, header, calculatedItems, tx);
      if (!updated) throw new Error('Failed to update invoice');
      await invoiceRepository.addHistory(updated, 'Updated', tx);
      return updated;
    });
  }

  async deleteInvoice(id: number) {
    return db.transaction(async (tx) => {
      const existing = await invoiceRepository.findById(id, tx);
      if (!existing) throw new Error('Invoice not found');
      if (existing.status === 'Paid') throw new Error('Cannot delete a paid invoice');
      
      await invoiceRepository.addHistory(existing, 'Deleted', tx);
      return invoiceRepository.softDelete(id, tx);
    });
  }
}

export const invoiceService = new InvoiceService();
