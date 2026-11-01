import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Plus,
  MessageCircle,
  Globe,
  Lightbulb,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { expenseApi } from '../api/expenseApi';
import { invoiceApi } from '../api/invoiceApi';
import { useCompanyStore } from '../store/companyStore';
import { getErrorMessage } from '../utils/errors';
import { Expense } from '../../../shared/types/expense';
import { InvoiceWithDetails } from '../../../shared/types/invoice';

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCompany, selectedCompanyId } = useCompanyStore();
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'This Month' | 'Today' | 'This Week' | 'This Year'>('This Month');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [invoiceResponse, expenseResponse] = await Promise.all([
          invoiceApi.getAll({ companyId: selectedCompanyId }),
          expenseApi.getAll({ companyId: selectedCompanyId }),
        ]);
        setInvoices(invoiceResponse.data);
        setExpenses(expenseResponse.data);
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError, 'Failed to load dashboard data'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCompanyId]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);

    const activeInvoices = invoices.filter(inv => inv.status !== 'Cancelled');

    // Total Receivable: Unpaid or Sent invoices
    const outstandingInvoices = activeInvoices.filter(inv => inv.status !== 'Paid');
    const totalReceivable = outstandingInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
    const uniqueDebtorParties = new Set(outstandingInvoices.map(inv => inv.customer_id)).size;

    // Total Payable (from pending expenses or purchases)
    const totalPayable = 0; // Ledgera current expenses are recorded directly

    // Period Sales
    let periodSales = 0;
    if (timePeriod === 'Today') {
      periodSales = activeInvoices
        .filter(inv => inv.invoice_date.slice(0, 10) === today)
        .reduce((sum, inv) => sum + inv.grand_total, 0);
    } else if (timePeriod === 'This Month') {
      periodSales = activeInvoices
        .filter(inv => inv.invoice_date.slice(0, 7) === month)
        .reduce((sum, inv) => sum + inv.grand_total, 0);
    } else {
      periodSales = activeInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
    }

    // Chart points calculation (30 days of the month)
    const daysInMonth = 30;
    const chartData: { day: number; label: string; amount: number }[] = [];
    const now = new Date();
    const currentMonthNum = now.getMonth();
    const monthPrefix = `${now.getFullYear()}-${String(currentMonthNum + 1).padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
      const daySum = activeInvoices
        .filter(inv => inv.invoice_date.slice(0, 10) === dayStr)
        .reduce((s, inv) => s + inv.grand_total, 0);
      chartData.push({ day: d, label: `${d} Nov`, amount: daySum });
    }

    return {
      totalReceivable,
      uniqueDebtorParties: uniqueDebtorParties || (totalReceivable > 0 ? 1 : 0),
      totalPayable,
      periodSales,
      chartData,
    };
  }, [invoices, timePeriod]);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 220;
  const maxVal = Math.max(...metrics.chartData.map(d => d.amount), 1000);

  const points = metrics.chartData.map((d, i) => {
    const x = (i / (metrics.chartData.length - 1)) * (chartWidth - 60) + 40;
    const y = chartHeight - 40 - (d.amount / maxVal) * (chartHeight - 70);
    return { x, y, ...d };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPathStr = `M ${points[0].x},${chartHeight - 40} ` +
    points.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${chartHeight - 40} Z`;

  return (
    <div style={{ padding: '16px 20px', background: '#f8fafc', minHeight: '100%', overflowY: 'auto' }}>
      {/* Top Banner Message / Status */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Main 2-Column Dashboard Layout (Left: Primary Financials, Right: Action Widgets) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '20px' }}>
        {/* Left Column (Vyapar Financials) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Receivable & Payable Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Total Receivable Card */}
            <div className="card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    Total Receivable
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {currency(metrics.totalReceivable)}
                  </div>
                </div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowDownLeft size={22} />
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '12px' }}>
                {metrics.totalReceivable > 0
                  ? `From ${metrics.uniqueDebtorParties} ${metrics.uniqueDebtorParties === 1 ? 'Party' : 'Parties'}`
                  : 'You don’t have any receivables as of now.'}
              </div>
            </div>

            {/* Total Payable Card */}
            <div className="card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    Total Payable
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {currency(metrics.totalPayable)}
                  </div>
                </div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffe4e6',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowUpRight size={22} />
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '12px' }}>
                {metrics.totalPayable > 0
                  ? `To ${metrics.totalPayable} Suppliers`
                  : 'You don’t have any payables as of now.'}
              </div>
            </div>
          </div>

          {/* 2. Total Sale Chart Card */}
          <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  Total Sale
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {currency(metrics.periodSales)}
                </div>
              </div>

              {/* Period Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="filter-select-pill"
                  onClick={() => setShowPeriodMenu(v => !v)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                >
                  <span>{timePeriod}</span>
                  <ChevronDown size={14} />
                </button>
                {showPeriodMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowPeriodMenu(false)} />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 4px)',
                      background: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      zIndex: 40,
                      minWidth: '130px',
                      padding: '4px'
                    }}>
                      {(['Today', 'This Week', 'This Month', 'This Year'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => { setTimePeriod(p); setShowPeriodMenu(false); }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '6px 10px',
                            textAlign: 'left',
                            background: timePeriod === p ? '#eff6ff' : 'transparent',
                            color: timePeriod === p ? '#2563eb' : '#334155',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SVG Interactive Area Chart */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', maxHeight: '220px' }}>
                <defs>
                  <linearGradient id="saleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="40" x2={chartWidth - 20} y2="40" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2={chartWidth - 20} y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="40" y1="140" x2={chartWidth - 20} y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="40" y1={chartHeight - 40} x2={chartWidth - 20} y2={chartHeight - 40} stroke="#cbd5e1" />

                {/* Y-Axis Labels */}
                <text x="32" y="44" fill="#94a3b8" fontSize="10" textAnchor="end">₹{Math.round(maxVal)}</text>
                <text x="32" y="104" fill="#94a3b8" fontSize="10" textAnchor="end">₹{Math.round(maxVal / 2)}</text>
                <text x="32" y={chartHeight - 38} fill="#94a3b8" fontSize="10" textAnchor="end">₹0</text>

                {/* Area Gradient Fill */}
                <path d={areaPathStr} fill="url(#saleGradient)" />

                {/* Line Path */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  points={polylineStr}
                />

                {/* Highlight Points */}
                {points.map((p, idx) => {
                  if (idx % 3 === 0 || p.amount > 0) {
                    return (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r={p.amount > 0 ? 4.5 : 2} fill={p.amount > 0 ? '#1d4ed8' : '#3b82f6'} />
                        {/* X-Axis Day Labels */}
                        {idx % 3 === 0 && (
                          <text x={p.x} y={chartHeight - 20} fill="#94a3b8" fontSize="9.5" textAnchor="middle">
                            {p.day} Nov
                          </text>
                        )}
                      </g>
                    );
                  }
                  return null;
                })}
              </svg>
            </div>
          </div>

          {/* 3. Most Used Reports Box */}
          <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                Most Used Reports
              </div>
              <Link to="/reports" style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { name: 'Sale Report', path: '/reports?tab=sale' },
                { name: 'All Transactions', path: '/reports?tab=all' },
                { name: 'Daybook Report', path: '/reports?tab=daybook' },
                { name: 'Party Statement', path: '/reports?tab=party' },
              ].map(rep => (
                <div
                  key={rep.name}
                  onClick={() => navigate(rep.path)}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: '#ffffff',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{rep.name}</span>
                  <ChevronRight size={15} style={{ color: '#2563eb' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Vyapar Marketing & Online Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Widget 1: WhatsApp Connect */}
          <div className="card" style={{ padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>WhatsApp Connect</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                READY
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '10px 0', fontSize: '12px', color: '#64748b' }}>
              <Lightbulb size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <span>Share clean PDF invoices and payment reminders to customer WhatsApp.</span>
            </div>
            <button
              onClick={() => alert('WhatsApp integration is configured. You can share invoices from the invoice view.')}
              style={{
                width: '100%',
                padding: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Connect WhatsApp
            </button>
          </div>

          {/* Widget 2: Google Profile Manager */}
          <div className="card" style={{ padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: '#ea4335' }} />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>Google Profile Manager</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '10px 0', fontSize: '12px', color: '#64748b' }}>
              <Lightbulb size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <span>90% of customers read online reviews before visiting a business.</span>
            </div>
            <button
              onClick={() => navigate('/settings?tab=business')}
              style={{
                width: '100%',
                padding: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Connect Now
            </button>
          </div>

          {/* Widget 3: Add Widget of Your Choice */}
          <div
            onClick={() => alert('Custom dashboard widgets can be pinned here.')}
            style={{
              padding: '24px 16px',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f8fafc'
            }}
          >
            <span>Add Widget of Your Choice</span>
            <Plus size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
