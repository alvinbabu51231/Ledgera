import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../../db';
import { invoices, invoice_items } from '../invoices/invoice.schema';
import { expenses } from '../expenses/expense.schema';
import { customers } from '../customers/customer.schema';
import { companies } from '../companies/company.schema';
import { and, eq, gte, lte, sql, desc, ne } from 'drizzle-orm';

function errorReply(reply: FastifyReply, error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return reply.status(status).send({ success: false, message });
}

export default async function reportRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/reports/monthly-summary
   * Query params: companyId (required), year (YYYY), month (1-12)
   * Returns: sales, expenses, profit, GST summary, discount summary, top customers, top products
   */
  fastify.get('/monthly-summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        companyId?: string;
        year?: string;
        month?: string;
      };

      const companyId = query.companyId ? Number(query.companyId) : undefined;
      const year = query.year ? Number(query.year) : new Date().getFullYear();
      const month = query.month ? Number(query.month) : new Date().getMonth() + 1;

      // Build date range for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Build company filter conditions
      const invoiceConditions = [
        eq(invoices.is_active, true),
        ne(invoices.status, 'Cancelled'),
        gte(invoices.invoice_date, startDate),
        lte(invoices.invoice_date, endDate),
      ];
      if (companyId) invoiceConditions.push(eq(invoices.company_id, companyId));

      const expenseConditions = [
        eq(expenses.is_active, true),
        gte(expenses.expense_date, startDate),
        lte(expenses.expense_date, endDate),
      ];
      if (companyId) expenseConditions.push(eq(expenses.company_id, companyId));

      // ─── Fetch invoices for the month ──────────────────────────────────────
      const monthInvoices = await db
        .select()
        .from(invoices)
        .where(and(...invoiceConditions));

      // ─── Sales summary ─────────────────────────────────────────────────────
      const totalSales = monthInvoices.reduce((s, inv) => s + inv.grand_total, 0);
      const totalSubtotal = monthInvoices.reduce((s, inv) => s + inv.subtotal, 0);
      const totalCgst = monthInvoices.reduce((s, inv) => s + inv.cgst, 0);
      const totalSgst = monthInvoices.reduce((s, inv) => s + inv.sgst, 0);
      const totalDiscount = monthInvoices.reduce((s, inv) => s + ((inv as any).discount_amount || 0), 0);
      const invoiceCount = monthInvoices.length;
      const paidCount = monthInvoices.filter(inv => inv.status === 'Paid').length;
      const draftCount = monthInvoices.filter(inv => inv.status === 'Draft').length;
      const sentCount = monthInvoices.filter(inv => inv.status === 'Sent').length;

      // ─── Expenses ─────────────────────────────────────────────────────────
      const monthExpenses = await db
        .select()
        .from(expenses)
        .where(and(...expenseConditions));

      const totalExpenses = monthExpenses.reduce((s, exp) => s + exp.amount, 0);

      // Expense by category
      const expenseByCategory: Record<string, number> = {};
      for (const exp of monthExpenses) {
        expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
      }

      // ─── Top customers ─────────────────────────────────────────────────────
      const customerTotals: Record<number, { customer_id: number; customer_name: string; total: number; count: number }> = {};
      for (const inv of monthInvoices) {
        if (!customerTotals[inv.customer_id]) {
          customerTotals[inv.customer_id] = { customer_id: inv.customer_id, customer_name: '', total: 0, count: 0 };
        }
        customerTotals[inv.customer_id].total += inv.grand_total;
        customerTotals[inv.customer_id].count += 1;
      }
      // Resolve customer names
      if (Object.keys(customerTotals).length > 0) {
        const custIds = Object.keys(customerTotals).map(Number);
        const custRows = await db.select().from(customers).where(
          custIds.length === 1
            ? eq(customers.id, custIds[0])
            : sql`${customers.id} IN (${sql.join(custIds.map(id => sql`${id}`), sql`, `)})`
        );
        for (const c of custRows) {
          if (customerTotals[c.id]) customerTotals[c.id].customer_name = c.customer_name;
        }
      }
      const topCustomers = Object.values(customerTotals)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      // ─── Top products ──────────────────────────────────────────────────────
      const invoiceIds = monthInvoices.map(inv => inv.id);
      let topProducts: { product_name: string; quantity: number; revenue: number; gst_amount: number }[] = [];

      if (invoiceIds.length > 0) {
        const itemRows = await db.select().from(invoice_items).where(
          sql`${invoice_items.invoice_id} IN (${sql.join(invoiceIds.map(id => sql`${id}`), sql`, `)})`
        );
        const productTotals: Record<string, { product_name: string; quantity: number; revenue: number; gst_amount: number }> = {};
        for (const item of itemRows) {
          if (!productTotals[item.product_name]) {
            productTotals[item.product_name] = { product_name: item.product_name, quantity: 0, revenue: 0, gst_amount: 0 };
          }
          productTotals[item.product_name].quantity += item.quantity;
          productTotals[item.product_name].revenue += item.total;
          productTotals[item.product_name].gst_amount += item.gst_amount;
        }
        topProducts = Object.values(productTotals)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);
      }

      return reply.send({
        success: true,
        data: {
          period: { year, month, startDate, endDate },
          sales: {
            total: totalSales,
            subtotal: totalSubtotal,
            cgst: totalCgst,
            sgst: totalSgst,
            discount: totalDiscount,
            invoiceCount,
            paidCount,
            sentCount,
            draftCount,
          },
          expenses: {
            total: totalExpenses,
            count: monthExpenses.length,
            byCategory: expenseByCategory,
          },
          profit: totalSales - totalExpenses,
          topCustomers,
          topProducts,
        },
      });
    } catch (error: unknown) {
      return errorReply(reply, error);
    }
  });
}
