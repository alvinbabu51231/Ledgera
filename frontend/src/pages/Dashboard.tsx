import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock, IndianRupee, Receipt, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

import { expenseApi } from '../api/expenseApi';
import { invoiceApi } from '../api/invoiceApi';
import { useCompanyStore } from '../store/companyStore';
import { getErrorMessage } from '../utils/errors';
import { Expense } from '../../../shared/types/expense';
import { InvoiceWithDetails } from '../../../shared/types/invoice';

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2,
  }).format(value);
}

export const Dashboard: React.FC = () => {
  const { selectedCompany, selectedCompanyId } = useCompanyStore();
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const [invoiceResponse, expenseResponse] = await Promise.all([
          invoiceApi.getAll({ companyId: selectedCompanyId }),
          expenseApi.getAll({ companyId: selectedCompanyId }),
        ]);
        setInvoices(invoiceResponse.data);
        setExpenses(expenseResponse.data);
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError, 'Failed to load dashboard data'));
      } finally { setLoading(false); }
    };
    load();
  }, [selectedCompanyId]);

  const metrics = useMemo(() => {
    const today = localDateKey();
    const month = today.slice(0, 7);
    const salesInvoices = invoices.filter(invoice => invoice.status !== 'Cancelled');
    const todaySales = salesInvoices.filter(invoice => invoice.invoice_date.slice(0, 10) === today)
      .reduce((sum, invoice) => sum + invoice.grand_total, 0);
    const monthSales = salesInvoices.filter(invoice => invoice.invoice_date.slice(0, 7) === month)
      .reduce((sum, invoice) => sum + invoice.grand_total, 0);
    const todayExpenses = expenses.filter(expense => expense.expense_date === today)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const monthExpenses = expenses.filter(expense => expense.expense_date.slice(0, 7) === month)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const outstanding = invoices.filter(invoice => !['Paid', 'Cancelled'].includes(invoice.status))
      .reduce((sum, invoice) => sum + invoice.grand_total, 0);
    return {
      todaySales, todayExpenses, todayNet: todaySales - todayExpenses,
      monthSales, monthExpenses, monthNet: monthSales - monthExpenses, outstanding,
    };
  }, [expenses, invoices]);

  const cards = [
    { label: "Today's Sales", value: metrics.todaySales, icon: <TrendingUp size={19} />, color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
    { label: "Today's Expenses", value: metrics.todayExpenses, icon: <TrendingDown size={19} />, color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
    { label: "Today's Net Income", value: metrics.todayNet, icon: <IndianRupee size={19} />, color: metrics.todayNet >= 0 ? '#16a34a' : '#dc2626', bg: 'var(--gray-100)' },
    { label: 'Monthly Sales', value: metrics.monthSales, icon: <Receipt size={19} />, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
    { label: 'Monthly Expenses', value: metrics.monthExpenses, icon: <WalletCards size={19} />, color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Monthly Net Income', value: metrics.monthNet, icon: <IndianRupee size={19} />, color: metrics.monthNet >= 0 ? '#16a34a' : '#dc2626', bg: 'var(--gray-100)' },
    { label: 'Outstanding Receivables', value: metrics.outstanding, icon: <Clock size={19} />, color: '#7c3aed', bg: 'rgba(139,92,246,0.1)' },
  ];

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Dashboard</h1><p>{selectedCompany?.company_name ?? 'Select a company'} financial overview</p></div></div>
      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
      {loading && <div className="loading-state" style={{ minHeight: '80px' }}>Refreshing financial data...</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {cards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value" style={{ color: card.value < 0 ? '#dc2626' : undefined }}>{currency(card.value)}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid-2" style={{ marginTop: '16px' }}>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}><div className="text-section-title">Recent Invoices</div><Link to="/invoices" className="btn btn-ghost btn-sm">View all <ArrowRight size={13} /></Link></div>
          <div style={{ overflowX: 'auto' }}><table className="data-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>
            {invoices.slice(0, 5).map(invoice => <tr key={invoice.id}><td className="col-mono"><Link to={`/invoices/view/${invoice.id}`}>{invoice.invoice_number}</Link></td><td>{invoice.customer_name}</td><td>{invoice.status}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{currency(invoice.grand_total)}</td></tr>)}
            {invoices.length === 0 && <tr><td colSpan={4} className="col-muted" style={{ textAlign: 'center', padding: '24px' }}>No invoices for this company.</td></tr>}
          </tbody></table></div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}><div className="text-section-title">Recent Expenses</div><Link to="/expenses" className="btn btn-ghost btn-sm">View all <ArrowRight size={13} /></Link></div>
          <div style={{ overflowX: 'auto' }}><table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Method</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>
            {expenses.slice(0, 5).map(expense => <tr key={expense.id}><td>{new Date(`${expense.expense_date}T00:00:00`).toLocaleDateString('en-IN')}</td><td>{expense.category}</td><td>{expense.payment_method}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{currency(expense.amount)}</td></tr>)}
            {expenses.length === 0 && <tr><td colSpan={4} className="col-muted" style={{ textAlign: 'center', padding: '24px' }}>No expenses for this company.</td></tr>}
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
};
