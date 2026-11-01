import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useCompanyStore } from '../../store/companyStore';
import { INVOICE_STATUSES, InvoiceStatus } from '../../../../shared/types/invoice';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Receipt,
  ChevronDown,
} from 'lucide-react';

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  Draft: 'badge badge-neutral',
  Sent: 'badge badge-info',
  Paid: 'badge badge-success',
  Cancelled: 'badge badge-danger',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, loading, error, fetchInvoices, deleteInvoice } = useInvoiceStore();
  const { selectedCompanyId } = useCompanyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const load = useCallback(() => {
    fetchInvoices({
      companyId: selectedCompanyId ?? undefined,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    });
  }, [fetchInvoices, selectedCompanyId, searchTerm, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteInvoice(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const deleteTarget = invoices.find(inv => inv.id === deleteConfirmId);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Invoices</h1>
          <p>Manage B2B and B2C invoices for the selected company</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary">
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Toolbar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div className="search-bar">
            <Search size={15} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search invoice # or customer…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowStatusMenu(v => !v)}
              style={{ gap: '6px' }}
            >
              {statusFilter || 'All Statuses'}
              <ChevronDown size={13} />
            </button>
            {showStatusMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowStatusMenu(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    background: '#fff',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 50,
                    minWidth: '140px',
                    padding: '4px',
                  }}
                >
                  {['', ...INVOICE_STATUSES].map(s => (
                    <button
                      key={s || '__all'}
                      onClick={() => { setStatusFilter(s); setShowStatusMenu(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '7px 12px',
                        textAlign: 'left',
                        background: statusFilter === s ? 'var(--primary-50)' : 'transparent',
                        color: statusFilter === s ? 'var(--primary-600)' : 'var(--gray-700)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: 'var(--font-family)',
                        fontWeight: statusFilter === s ? 500 : 400,
                      }}
                    >
                      {s || 'All Statuses'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--gray-400)' }}>
            {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ margin: '16px 20px' }}>
            {error}
          </div>
        )}

        {/* States */}
        {loading && invoices.length === 0 ? (
          <div className="loading-state">
            <div>Loading invoices…</div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Receipt size={24} />
            </div>
            <h3>No invoices yet</h3>
            <p>Create your first invoice for the selected company.</p>
            <Link to="/invoices/new" className="btn btn-primary" style={{ marginTop: '4px' }}>
              <Plus size={16} />
              New Invoice
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'right' }}>GST</th>
                  <th style={{ textAlign: 'right' }}>Grand Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="col-mono" style={{ color: 'var(--gray-700)', fontWeight: 500 }}>
                      {invoice.invoice_number}
                    </td>
                    <td style={{ color: 'var(--gray-600)' }}>
                      {new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="col-primary">{invoice.customer_name}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: invoice.invoice_type === 'B2B' ? 'var(--primary-50)' : 'var(--gray-100)',
                          color: invoice.invoice_type === 'B2B' ? 'var(--primary-700)' : 'var(--gray-600)',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {invoice.invoice_type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.subtotal)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>
                      {formatCurrency(invoice.cgst + invoice.sgst)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gray-900)' }}>
                      {formatCurrency(invoice.grand_total)}
                    </td>
                    <td>
                      <span className={STATUS_BADGE[invoice.status]}>
                        <span className="badge-dot" />
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                          className="btn btn-ghost btn-icon-sm"
                          title="View invoice"
                        >
                          <Eye size={14} />
                        </button>
                        <Link
                          to={`/invoices/edit/${invoice.id}`}
                          className="btn btn-ghost btn-icon-sm"
                          title="Edit invoice"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(invoice.id)}
                          className="btn btn-ghost btn-icon-sm"
                          title="Delete invoice"
                          style={{ color: 'var(--gray-400)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Archive Invoice?</div>
            <div className="modal-body">
              Invoice <strong>{deleteTarget?.invoice_number}</strong> will be removed from active
              financial views while its audit record remains preserved.
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
