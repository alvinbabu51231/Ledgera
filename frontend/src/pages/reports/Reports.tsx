import React, { useEffect, useState, useCallback } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Percent, Award, Package, Download } from 'lucide-react';
import { reportApi, MonthlySummaryData } from '../../api/reportApi';
import { useCompanyStore } from '../../store/companyStore';
import { getErrorMessage } from '../../utils/errors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function fmt(paisa: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(paisa);
}

function getCurrentFinancialYears() {
  const now = new Date();
  const years: number[] = [];
  // Show last 3 financial years
  for (let y = now.getFullYear() + 1; y >= now.getFullYear() - 2; y--) {
    years.push(y);
  }
  return years;
}

function StatCard({
  icon: Icon, label, value, sub, color
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="card card-padded" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
      <div style={{
        width: 42, height: 42, borderRadius: '10px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: color, color: '#fff',
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)' }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function exportCsv(data: MonthlySummaryData, month: number, year: number) {
  const rows: string[] = [];
  rows.push(`Ledgera Monthly Report — ${MONTH_NAMES[month - 1]} ${year}`);
  rows.push('');
  rows.push('SALES SUMMARY');
  rows.push(`Total Sales,${fmt(data.sales.total)}`);
  rows.push(`Subtotal,${fmt(data.sales.subtotal)}`);
  rows.push(`CGST,${fmt(data.sales.cgst)}`);
  rows.push(`SGST,${fmt(data.sales.sgst)}`);
  rows.push(`Total Discount,${fmt(data.sales.discount)}`);
  rows.push(`Invoices,${data.sales.invoiceCount}`);
  rows.push(`Paid,${data.sales.paidCount}`);
  rows.push(`Sent,${data.sales.sentCount}`);
  rows.push(`Draft,${data.sales.draftCount}`);
  rows.push('');
  rows.push('EXPENSES');
  rows.push(`Total Expenses,${fmt(data.expenses.total)}`);
  rows.push(`Expense Count,${data.expenses.count}`);
  for (const [cat, amt] of Object.entries(data.expenses.byCategory)) {
    rows.push(`  ${cat},${fmt(amt)}`);
  }
  rows.push('');
  rows.push(`NET PROFIT,${fmt(data.profit)}`);
  rows.push('');
  rows.push('TOP CUSTOMERS');
  rows.push('Customer,Total Sales,Invoice Count');
  for (const c of data.topCustomers) {
    rows.push(`${c.customer_name},${fmt(c.total)},${c.count}`);
  }
  rows.push('');
  rows.push('TOP PRODUCTS');
  rows.push('Product,Quantity,Revenue,GST Collected');
  for (const p of data.topProducts) {
    rows.push(`${p.product_name},${p.quantity},${fmt(p.revenue)},${fmt(p.gst_amount)}`);
  }

  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Ledgera_Report_${year}_${String(month).padStart(2, '0')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const Reports: React.FC = () => {
  const { companies, selectedCompanyId } = useCompanyStore();
  const now = new Date();

  const [companyFilter, setCompanyFilter] = useState<number | 'all'>('all');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportApi.getMonthlySummary({
        companyId: companyFilter !== 'all' ? companyFilter : undefined,
        year,
        month,
      });
      setData(res.data.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load report'));
    } finally {
      setLoading(false);
    }
  }, [companyFilter, year, month]);

  useEffect(() => { load(); }, [load]);

  const profit = data?.profit ?? 0;
  const profitColor = profit >= 0 ? '#16a34a' : '#dc2626';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Monthly Reports</h1>
          <p>Sales, expenses, profit, and GST summary</p>
        </div>
        {data && (
          <button className="btn btn-secondary" onClick={() => exportCsv(data, month, year)}>
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card card-padded" style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Company</label>
          <select
            className="form-select"
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Year</label>
          <select className="form-select" value={year} onChange={e => setYear(Number(e.target.value))}>
            {getCurrentFinancialYears().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Month</label>
          <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {loading && <div className="loading-state" style={{ height: '200px' }}>Loading report…</div>}

      {!loading && data && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <StatCard
              icon={TrendingUp}
              label="Total Sales"
              value={fmt(data.sales.total)}
              sub={`${data.sales.invoiceCount} invoice(s)`}
              color="#2563eb"
            />
            <StatCard
              icon={TrendingDown}
              label="Total Expenses"
              value={fmt(data.expenses.total)}
              sub={`${data.expenses.count} expense(s)`}
              color="#f59e0b"
            />
            <StatCard
              icon={BarChart2}
              label="Net Profit"
              value={fmt(profit)}
              sub={profit >= 0 ? 'Positive' : 'Loss'}
              color={profit >= 0 ? '#16a34a' : '#dc2626'}
            />
            <StatCard
              icon={Percent}
              label="Total GST Collected"
              value={fmt(data.sales.cgst + data.sales.sgst)}
              sub={`CGST ${fmt(data.sales.cgst)} + SGST ${fmt(data.sales.sgst)}`}
              color="#7c3aed"
            />
          </div>

          {/* GST + Discount Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="card card-padded">
              <div className="section-title">GST Summary</div>
              {[
                ['Taxable (Subtotal)', fmt(data.sales.subtotal)],
                ['CGST', fmt(data.sales.cgst)],
                ['SGST', fmt(data.sales.sgst)],
                ['Total GST', fmt(data.sales.cgst + data.sales.sgst)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '13.5px' }}>
                  <span>{label}</span><span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="card card-padded">
              <div className="section-title">Invoice Status & Discounts</div>
              {[
                ['Paid Invoices', String(data.sales.paidCount)],
                ['Sent (Unpaid)', String(data.sales.sentCount)],
                ['Draft', String(data.sales.draftCount)],
                ['Total Discounts Given', fmt(data.sales.discount)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '13.5px' }}>
                  <span>{label}</span><span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers + Top Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="card card-padded">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={15} /> Top Customers
              </div>
              {data.topCustomers.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--gray-400)', paddingTop: '8px' }}>No sales this month</div>
              )}
              {data.topCustomers.map((c, i) => (
                <div key={c.customer_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-400)', minWidth: '20px' }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500 }}>{c.customer_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{c.count} invoice(s)</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{fmt(c.total)}</span>
                </div>
              ))}
            </div>

            <div className="card card-padded">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={15} /> Top Products
              </div>
              {data.topProducts.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--gray-400)', paddingTop: '8px' }}>No sales this month</div>
              )}
              {data.topProducts.map((p, i) => (
                <div key={p.product_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-400)', minWidth: '20px' }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500 }}>{p.product_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Qty: {p.quantity}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{fmt(p.revenue)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>GST: {fmt(p.gst_amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          {Object.keys(data.expenses.byCategory).length > 0 && (
            <div className="card card-padded" style={{ marginBottom: '20px' }}>
              <div className="section-title">Expense Breakdown by Category</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
                {Object.entries(data.expenses.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amt]) => (
                    <div key={cat} style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{cat}</div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{fmt(amt)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
