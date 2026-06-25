import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Clock,
  FileCheck,
  Users,
  Package,
  ArrowRight,
  BarChart2
} from 'lucide-react';

// ── Placeholder data ──────────────────────────────────────────────

const statCards = [
  {
    label: "Today's Sales",
    value: '₹0',
    sub: '0 invoices',
    trend: 'No data',
    up: true,
    icon: <IndianRupee size={20} />,
    iconBg: 'rgba(59,130,246,0.1)',
    iconColor: 'var(--primary-600)',
  },
  {
    label: 'Monthly Sales',
    value: '₹0',
    sub: '0 invoices this month',
    trend: 'No data',
    up: true,
    icon: <TrendingUp size={20} />,
    iconBg: 'rgba(34,197,94,0.1)',
    iconColor: '#16a34a',
  },
  {
    label: 'Pending Collections',
    value: '₹0',
    sub: '0 overdue invoices',
    trend: 'No data',
    up: false,
    icon: <Clock size={20} />,
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#d97706',
  },
  {
    label: 'Invoices Today',
    value: '0',
    sub: '0 unpaid · 0 paid',
    trend: 'No data',
    up: true,
    icon: <FileCheck size={20} />,
    iconBg: 'rgba(139,92,246,0.1)',
    iconColor: '#7c3aed',
  },
];

const recentInvoices: any[] = [];
const recentPayments: any[] = [];
const topCustomers: any[] = [];

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    paid:    { cls: 'badge-success', label: 'Paid' },
    unpaid:  { cls: 'badge-danger',  label: 'Unpaid' },
    partial: { cls: 'badge-warning', label: 'Partial' },
    overdue: { cls: 'badge-danger',  label: 'Overdue' },
  };
  const { cls, label } = map[status] ?? { cls: 'badge-neutral', label: status };
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

// ── Chart Placeholder ─────────────────────────────────────────────
function ChartPlaceholder() {
  const bars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const months = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];

  return (
    <div style={{ padding: '0 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '100%',
                height: `${h}%`,
                background: i === 11
                  ? 'var(--primary-600)'
                  : 'var(--gray-200)',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: i === 11 ? 'var(--primary-600)' : 'var(--gray-400)', fontWeight: i === 11 ? 600 : 400 }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back — here's what's happening today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>FY 2026–27</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div
              className="stat-card-icon"
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-sub">{card.sub}</div>
            <div className={`stat-card-trend ${card.up ? 'up' : 'down'}`}>
              {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="dashboard-grid-2">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Sales Chart */}
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="text-section-title">Sales Overview</div>
                <div className="text-caption" style={{ marginTop: '2px' }}>Monthly revenue — last 12 months</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-500)' }}>
                <BarChart2 size={14} />
                ₹0 this month
              </div>
            </div>
            <ChartPlaceholder />
          </div>

          {/* Recent Invoices */}
          <div className="card">
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)' }}>
              <div className="text-section-title">Recent Invoices</div>
              <button className="btn btn-ghost btn-sm" style={{ gap: '4px', fontSize: '12.5px' }}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="col-mono" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>{inv.id}</td>
                    <td className="col-primary">{inv.customer}</td>
                    <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td className="col-muted">{inv.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Recent Payments */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-section-title">Recent Payments</div>
              <button className="btn btn-ghost btn-sm" style={{ gap: '4px', fontSize: '12.5px' }}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            <div style={{ padding: '4px 0' }}>
              {recentPayments.map((pay, i) => (
                <div
                  key={pay.ref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    borderBottom: i < recentPayments.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--success-bg)',
                    color: 'var(--success-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    flexShrink: 0,
                  }}>
                    {pay.customer[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pay.customer}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px' }}>
                      {pay.mode} · {pay.date}
                    </div>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#16a34a', flexShrink: 0 }}>
                    +{pay.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={15} style={{ color: 'var(--gray-400)' }} />
              <div className="text-section-title">Top Customers</div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {topCustomers.map((c, i) => (
                <div
                  key={c.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    borderBottom: i < topCustomers.length - 1 ? '1px solid var(--gray-100)' : 'none',
                    gap: '12px'
                  }}
                >
                  <span style={{ width: '18px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-400)', textAlign: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px' }}>
                      {c.invoices} invoices
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', flexShrink: 0 }}>
                    {c.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Orders placeholder */}
          <div className="card card-padded" style={{ textAlign: 'center' }}>
            <Package size={24} style={{ color: 'var(--gray-300)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--gray-600)' }}>Pending Orders</div>
            <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>Available when Orders module is enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
};
