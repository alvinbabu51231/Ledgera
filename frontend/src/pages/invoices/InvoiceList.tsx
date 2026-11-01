import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useCompanyStore } from '../../store/companyStore';
import { InvoiceWithDetails } from '../../../../shared/types/invoice';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Settings,
  Printer,
  Share2,
  FileSpreadsheet,
  BarChart2,
  Calendar,
  ChevronDown,
  Filter,
  MoreVertical
} from 'lucide-react';
import * as XLSX from 'xlsx';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, loading, error, fetchInvoices, deleteInvoice } = useInvoiceStore();
  const { companies, selectedCompanyId, setSelectedCompanyId } = useCompanyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'This Month' | 'Today' | 'This Week' | 'This Year' | 'All'>('This Month');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showFirmMenu, setShowFirmMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Load invoices
  const load = useCallback(() => {
    fetchInvoices({
      companyId: selectedCompanyId ?? undefined,
      search: searchTerm || undefined,
    });
  }, [fetchInvoices, selectedCompanyId, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  // Filter invoices by date range / period
  const filteredInvoices = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);

    return invoices.filter(inv => {
      if (inv.status === 'Cancelled') return false;
      if (periodFilter === 'Today') {
        return inv.invoice_date.slice(0, 10) === today;
      }
      if (periodFilter === 'This Month') {
        return inv.invoice_date.slice(0, 7) === month;
      }
      return true;
    });
  }, [invoices, periodFilter]);

  // Metrics for Summary Box
  const summary = useMemo(() => {
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
    const received = filteredInvoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.grand_total, 0);
    const balance = totalSales - received;
    return { totalSales, received, balance };
  }, [filteredInvoices]);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteInvoice(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleExportExcel = () => {
    const data = filteredInvoices.map(inv => ({
      'Date': inv.invoice_date,
      'Invoice No': inv.invoice_number,
      'Party Name': inv.customer_name,
      'Transaction': 'Sale',
      'Payment Type': inv.status === 'Paid' ? 'Cash' : 'Credit',
      'Amount': inv.grand_total,
      'Balance': inv.status === 'Paid' ? 0 : inv.grand_total,
      'Status': inv.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sale Invoices');
    XLSX.writeFile(wb, `Sale_Invoices_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Date range display string
  const dateRangeStr = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const fmt = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${d.getFullYear()}`;
    };
    return `${fmt(firstDay)} To ${fmt(lastDay)}`;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflowY: 'auto' }}>
      {/* ── Top Bar matching Screenshot 212449 ── */}
      <div style={{
        height: '52px',
        padding: '0 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        {/* Title: Sale Invoices */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Sale Invoices</span>
          <ChevronDown size={18} style={{ color: '#2563eb' }} />
        </div>

        {/* Right Top Actions: Red "+ Add Sale", Settings Gear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-sale"
            onClick={() => navigate('/invoices/new')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0 18px', height: '34px' }}
          >
            <Plus size={16} />
            <span>Add Sale</span>
          </button>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => navigate('/settings')}
            title="Invoice Settings"
          >
            <Settings size={18} style={{ color: '#64748b' }} />
          </button>
        </div>
      </div>

      {/* ── Filter Bar matching Screenshot 212449 ── */}
      <div className="vyapar-filter-bar">
        <span className="filter-label">Filter by :</span>

        {/* Period Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="filter-select-pill"
            onClick={() => setShowPeriodMenu(v => !v)}
          >
            <span>{periodFilter}</span>
            <ChevronDown size={14} />
          </button>
          {showPeriodMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowPeriodMenu(false)} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 40,
                minWidth: '130px',
                padding: '4px'
              }}>
                {(['Today', 'This Week', 'This Month', 'This Year', 'All'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriodFilter(p); setShowPeriodMenu(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '7px 12px',
                      textAlign: 'left',
                      background: periodFilter === p ? '#eff6ff' : 'transparent',
                      color: periodFilter === p ? '#2563eb' : '#334155',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
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

        {/* Date Range Badge */}
        <div className="filter-date-pill">
          <Calendar size={13} style={{ opacity: 0.7 }} />
          <span>{dateRangeStr}</span>
        </div>

        {/* Firm / Company Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="filter-select-pill"
            onClick={() => setShowFirmMenu(v => !v)}
          >
            <span>{companies.find(c => c.id === selectedCompanyId)?.company_name || 'All Firms'}</span>
            <ChevronDown size={14} />
          </button>
          {showFirmMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowFirmMenu(false)} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 40,
                minWidth: '180px',
                padding: '4px'
              }}>
                <button
                  onClick={() => { setSelectedCompanyId(null); setShowFirmMenu(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '7px 12px',
                    textAlign: 'left',
                    background: selectedCompanyId === null ? '#eff6ff' : 'transparent',
                    color: selectedCompanyId === null ? '#2563eb' : '#334155',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  All Firms
                </button>
                {companies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCompanyId(c.id); setShowFirmMenu(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '7px 12px',
                      textAlign: 'left',
                      background: selectedCompanyId === c.id ? '#eff6ff' : 'transparent',
                      color: selectedCompanyId === c.id ? '#2563eb' : '#334155',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {c.company_name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Summary Card Box matching Screenshot 212449 ── */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: '#fffbfb',
          border: '1px solid #fed7d7',
          borderRadius: '12px',
          padding: '16px 20px',
          maxWidth: '360px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Sales Amount</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#16a34a',
              background: '#dcfce7',
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              100% ↗ vs last month
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
            {formatCurrency(summary.totalSales)}
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
            <span>Received: <strong>{formatCurrency(summary.received)}</strong></span>
            <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
            <span>Balance: <strong>{formatCurrency(summary.balance)}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Transactions Section matching Screenshot 212449 ── */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Transactions
          </div>

          {/* Right Toolbar: Search, Chart toggle, Excel, Print */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="search-bar" style={{ maxWidth: '200px', height: '32px' }}>
              <Search size={14} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-ghost btn-icon-sm"
              onClick={() => navigate('/')}
              title="View Sales Chart"
            >
              <BarChart2 size={16} style={{ color: '#64748b' }} />
            </button>
            <button
              className="btn btn-ghost btn-icon-sm"
              onClick={handleExportExcel}
              title="Export to Excel"
            >
              <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
            </button>
            <button
              className="btn btn-ghost btn-icon-sm"
              onClick={() => window.print()}
              title="Print Table"
            >
              <Printer size={16} style={{ color: '#64748b' }} />
            </button>
          </div>
        </div>

        {/* Transactions Data Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Invoice no</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Party Name</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Transaction</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Payment Type</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>Amount</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>Balance</span>
                    <Filter size={11} style={{ opacity: 0.6 }} />
                  </div>
                </th>
                <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Loading sale invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>No sale invoices found</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px' }}>
                      Create your first invoice to start tracking sales.
                    </div>
                    <button
                      className="btn btn-sale"
                      onClick={() => navigate('/invoices/new')}
                    >
                      <Plus size={15} />
                      <span>Add First Sale</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      {new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="col-mono" style={{ fontWeight: 600, color: '#0f172a' }}>
                      <Link to={`/invoices/view/${inv.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="col-primary">
                      {inv.customer_name}
                    </td>
                    <td>Sale</td>
                    <td>{inv.status === 'Paid' ? 'Cash' : 'Credit'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: inv.status === 'Paid' ? '#10b981' : '#e43b3b' }}>
                      {inv.status === 'Paid' ? '₹0' : formatCurrency(inv.grand_total)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          className="btn btn-ghost btn-icon-sm"
                          onClick={() => navigate(`/invoices/view/${inv.id}`)}
                          title="Print / View"
                        >
                          <Printer size={14} style={{ color: '#64748b' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon-sm"
                          onClick={() => alert(`Direct link to share invoice ${inv.invoice_number}`)}
                          title="Share"
                        >
                          <Share2 size={14} style={{ color: '#64748b' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon-sm"
                          onClick={() => navigate(`/invoices/edit/${inv.id}`)}
                          title="Edit"
                        >
                          <Pencil size={14} style={{ color: '#64748b' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon-sm"
                          onClick={() => setDeleteConfirmId(inv.id)}
                          title="Archive"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Archive Invoice?</div>
            <div className="modal-body">
              This invoice will be removed from active sales while preserving audit history.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626' }}
                onClick={handleDelete}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
