import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Percent,
  Download,
  Printer,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  CheckCircle2,
  Receipt,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react';
import { reportApi, MonthlySummaryData } from '../../api/reportApi';
import { invoiceApi } from '../../api/invoiceApi';
import { expenseApi } from '../../api/expenseApi';
import { useCompanyStore } from '../../store/companyStore';
import { getErrorMessage } from '../../utils/errors';
import { InvoiceWithDetails } from '../../../../shared/types/invoice';
import { Expense } from '../../../../shared/types/expense';
import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

export const Reports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReport = searchParams.get('tab') || 'sale';

  const { companies, selectedCompanyId } = useCompanyStore();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, invRes, expRes] = await Promise.all([
        reportApi.getMonthlySummary({
          companyId: selectedCompanyId ?? undefined,
          year,
          month,
        }),
        invoiceApi.getAll({ companyId: selectedCompanyId ?? undefined }),
        expenseApi.getAll({ companyId: selectedCompanyId ?? undefined })
      ]);
      setData(summaryRes.data.data);
      setInvoices(invRes.data);
      setExpenses(expRes.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load report data'));
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectReport = (reportKey: string) => {
    setSearchParams({ tab: reportKey });
  };

  const handleExportExcel = () => {
    if (!data) return;
    const rows = [
      { 'Metric': 'Total Sales', 'Amount': data.sales.total },
      { 'Metric': 'Tax Collected (GST)', 'Amount': data.sales.cgst + data.sales.sgst },
      { 'Metric': 'Total Expenses', 'Amount': data.expenses.total },
      { 'Metric': 'Net Profit', 'Amount': data.profit },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    XLSX.writeFile(wb, `Report_${activeReport}_${year}_${month}.xlsx`);
  };

  return (
    <div className="reports-wrapper">
      {/* ── Left Category Navigation Sidebar matching Screenshot 212523 ── */}
      <aside className="reports-sidebar">
        {/* Transaction report category */}
        <div className="reports-category-title">Transaction report</div>
        <button
          className={`reports-item-btn ${activeReport === 'sale' ? 'active' : ''}`}
          onClick={() => handleSelectReport('sale')}
        >
          <span>Sale</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'purchase' ? 'active' : ''}`}
          onClick={() => handleSelectReport('purchase')}
        >
          <span>Purchase</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'daybook' ? 'active' : ''}`}
          onClick={() => handleSelectReport('daybook')}
        >
          <span>Day book</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'all' ? 'active' : ''}`}
          onClick={() => handleSelectReport('all')}
        >
          <span>All Transactions</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'profit-loss' ? 'active' : ''}`}
          onClick={() => handleSelectReport('profit-loss')}
        >
          <span>Profit And Loss</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'bill-wise' ? 'active' : ''}`}
          onClick={() => handleSelectReport('bill-wise')}
        >
          <span>Bill Wise Profit</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'cashflow' ? 'active' : ''}`}
          onClick={() => handleSelectReport('cashflow')}
        >
          <span>Cash flow</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'trial-balance' ? 'active' : ''}`}
          onClick={() => handleSelectReport('trial-balance')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Trial Balance Report</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          </div>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'balance-sheet' ? 'active' : ''}`}
          onClick={() => handleSelectReport('balance-sheet')}
        >
          <span>Balance Sheet</span>
        </button>

        {/* Party report category */}
        <div className="reports-category-title" style={{ marginTop: '14px' }}>Party report</div>
        <button
          className={`reports-item-btn ${activeReport === 'party' ? 'active' : ''}`}
          onClick={() => handleSelectReport('party')}
        >
          <span>Party Statement</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'party-profit' ? 'active' : ''}`}
          onClick={() => handleSelectReport('party-profit')}
        >
          <span>Party wise Profit & Loss</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'all-parties' ? 'active' : ''}`}
          onClick={() => handleSelectReport('all-parties')}
        >
          <span>All parties</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'party-item' ? 'active' : ''}`}
          onClick={() => handleSelectReport('party-item')}
        >
          <span>Party Report By Item</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'sale-purchase-party' ? 'active' : ''}`}
          onClick={() => handleSelectReport('sale-purchase-party')}
        >
          <span>Sale Purchase By Party</span>
        </button>

        {/* GST reports category */}
        <div className="reports-category-title" style={{ marginTop: '14px' }}>GST reports</div>
        <button
          className={`reports-item-btn ${activeReport === 'gstr1' ? 'active' : ''}`}
          onClick={() => handleSelectReport('gstr1')}
        >
          <span>GSTR 1</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'gstr2' ? 'active' : ''}`}
          onClick={() => handleSelectReport('gstr2')}
        >
          <span>GSTR 2</span>
        </button>
        <button
          className={`reports-item-btn ${activeReport === 'gstr3b' ? 'active' : ''}`}
          onClick={() => handleSelectReport('gstr3b')}
        >
          <span>GSTR 3 B</span>
        </button>
      </aside>

      {/* ── Right Content Pane ── */}
      <main className="reports-content-pane">
        {/* Top Header & Period Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
              {activeReport.replace('-', ' ')} Report
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {MONTH_NAMES[month - 1]} {year} data for {companies.find(c => c.id === selectedCompanyId)?.company_name || 'All Companies'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Month Selector */}
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="form-select"
              style={{ width: '130px', height: '34px' }}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="form-select"
              style={{ width: '90px', height: '34px' }}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Excel Export Button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExportExcel}
              style={{ height: '34px', gap: '6px' }}
            >
              <FileSpreadsheet size={15} style={{ color: '#16a34a' }} />
              <span>Export</span>
            </button>

            {/* Print Button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              style={{ height: '34px', gap: '6px' }}
            >
              <Printer size={15} style={{ color: '#64748b' }} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Generating report data...
          </div>
        ) : !data ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            No report data available for this period.
          </div>
        ) : (
          <div>
            {/* Summary Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Sales</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{fmt(data.sales.total)}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{data.sales.invoiceCount} invoices</div>
              </div>

              <div className="card" style={{ padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Tax Collected (GST)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{fmt(data.sales.cgst + data.sales.sgst)}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>CGST + SGST</div>
              </div>

              <div className="card" style={{ padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Expenses</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{fmt(data.expenses.total)}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{data.expenses.count} entries</div>
              </div>

              <div className="card" style={{ padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Net Margin / Profit</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: data.profit >= 0 ? '#16a34a' : '#ef4444', marginTop: '4px' }}>{fmt(data.profit)}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Sales - Expenses</div>
              </div>
            </div>

            {/* Report Specific Tables */}
            {(activeReport === 'sale' || activeReport === 'all' || activeReport === 'gstr1') && (
              <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                  Sales Invoices ({MONTH_NAMES[month - 1]} {year})
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>Taxable Amt</th>
                        <th style={{ textAlign: 'right' }}>GST Amt</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No sales records found.</td></tr>
                      ) : (
                        invoices.map(inv => (
                          <tr key={inv.id}>
                            <td className="col-mono" style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                            <td>{inv.invoice_date}</td>
                            <td className="col-primary">{inv.customer_name}</td>
                            <td>{inv.invoice_type}</td>
                            <td style={{ textAlign: 'right' }}>{fmt(inv.subtotal)}</td>
                            <td style={{ textAlign: 'right' }}>{fmt(inv.cgst + inv.sgst)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(inv.grand_total)}</td>
                            <td>
                              <span className="badge badge-success">{inv.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(activeReport === 'purchase' || activeReport === 'all') && (
              <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                  Expenses & Purchases
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Payment Method</th>
                        <th>Notes</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No expense records found.</td></tr>
                      ) : (
                        expenses.map(exp => (
                          <tr key={exp.id}>
                            <td>{exp.expense_date}</td>
                            <td className="col-primary">{exp.category}</td>
                            <td>{exp.payment_method}</td>
                            <td style={{ color: '#64748b' }}>{exp.notes || '—'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(exp.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Customers & Top Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                  Top Customers by Revenue
                </div>
                {data.topCustomers.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>No customer data for this period.</div>
                ) : (
                  data.topCustomers.map(c => (
                    <div key={c.customer_name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{c.customer_name}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(c.total)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                  Top Products by Quantity Sold
                </div>
                {data.topProducts.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>No product sales recorded for this period.</div>
                ) : (
                  data.topProducts.map(p => (
                    <div key={p.product_name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{p.product_name}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.quantity} units ({fmt(p.revenue)})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
