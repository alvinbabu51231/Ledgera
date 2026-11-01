import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerStore } from '../../store/customerStore';
import { useCompanyStore } from '../../store/companyStore';
import { invoiceApi } from '../../api/invoiceApi';
import { InvoiceWithDetails } from '../../../../shared/types/invoice';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Eye,
  Settings,
  MoreVertical,
  Printer,
  FileSpreadsheet,
  MessageCircle,
  Phone,
  Clock,
  ChevronDown,
  Filter,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const { customers, loading, error, fetchCustomers, deleteCustomer } = useCustomerStore();
  const { selectedCompanyId } = useCompanyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<InvoiceWithDetails[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [partyTypeFilter, setPartyTypeFilter] = useState<'all' | 'customers' | 'suppliers'>('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    fetchCustomers(searchTerm);
  }, [searchTerm, fetchCustomers]);

  // Default select first customer when loaded
  useEffect(() => {
    if (customers.length > 0 && selectedCustomerId === null) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Load transactions (invoices) for selected customer
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerInvoices([]);
      return;
    }
    const loadTransactions = async () => {
      setInvoicesLoading(true);
      try {
        const selected = customers.find(c => c.id === selectedCustomerId);
        if (selected) {
          const res = await invoiceApi.getAll({
            companyId: selectedCompanyId ?? undefined,
            search: selected.customer_name,
          });
          // Filter strictly for this customer
          const matched = res.data.filter(inv => inv.customer_id === selectedCustomerId || inv.customer_name === selected.customer_name);
          setCustomerInvoices(matched);
        }
      } catch (err) {
        console.error('Failed to load customer transactions', err);
      } finally {
        setInvoicesLoading(false);
      }
    };
    loadTransactions();
  }, [selectedCustomerId, selectedCompanyId, customers]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  const filteredTransactions = useMemo(() => {
    if (!transactionSearch.trim()) return customerInvoices;
    const q = transactionSearch.toLowerCase();
    return customerInvoices.filter(inv =>
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q)
    );
  }, [customerInvoices, transactionSearch]);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteCustomer(deleteConfirmId);
      setDeleteConfirmId(null);
      if (selectedCustomerId === deleteConfirmId) {
        setSelectedCustomerId(null);
      }
    }
  };

  const handleExportExcel = () => {
    if (!selectedCustomer) return;
    const data = filteredTransactions.map(inv => ({
      'Type': 'Sale',
      'Invoice Number': inv.invoice_number,
      'Date': inv.invoice_date,
      'Total Amount': inv.grand_total,
      'Status': inv.status,
      'Balance': inv.status === 'Paid' ? 0 : inv.grand_total,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `${selectedCustomer.customer_name}_Transactions.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* ── Top Bar matching Screenshot 212436 ── */}
      <div style={{
        height: '52px',
        padding: '0 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        {/* Dropdown: Parties (All / Customers / Suppliers) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowTypeDropdown(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer'
            }}
          >
            <span>{partyTypeFilter === 'all' ? 'Parties' : partyTypeFilter === 'customers' ? 'Customers' : 'Suppliers'}</span>
            <ChevronDown size={18} style={{ color: '#2563eb' }} />
          </button>

          {showTypeDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowTypeDropdown(false)} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 40,
                minWidth: '150px',
                padding: '4px'
              }}>
                <button
                  onClick={() => { setPartyTypeFilter('all'); setShowTypeDropdown(false); }}
                  style={{ display: 'block', width: '100%', padding: '7px 12px', textAlign: 'left', background: partyTypeFilter === 'all' ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  All Parties
                </button>
                <button
                  onClick={() => { setPartyTypeFilter('customers'); setShowTypeDropdown(false); }}
                  style={{ display: 'block', width: '100%', padding: '7px 12px', textAlign: 'left', background: partyTypeFilter === 'customers' ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  Customers Only
                </button>
                <button
                  onClick={() => { setPartyTypeFilter('suppliers'); setShowTypeDropdown(false); }}
                  style={{ display: 'block', width: '100%', padding: '7px 12px', textAlign: 'left', background: partyTypeFilter === 'suppliers' ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  Suppliers Only
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Top Actions: Red "+ Add Party", Settings Gear, More Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-sale"
            onClick={() => navigate('/customers/add')}
            style={{ borderRadius: 'var(--radius-full)', padding: '0 18px', height: '34px' }}
          >
            <Plus size={16} />
            <span>Add Party</span>
          </button>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => navigate('/settings')}
            title="Party Settings"
          >
            <Settings size={18} style={{ color: '#64748b' }} />
          </button>
          <button className="btn btn-ghost btn-icon-sm" title="Options">
            <MoreVertical size={18} style={{ color: '#64748b' }} />
          </button>
        </div>
      </div>

      {/* ── Master-Detail Container ── */}
      <div className="master-detail-container">
        {/* Left List Pane: Party List */}
        <div className="master-list-pane">
          {/* Search Party Name Input */}
          <div className="master-list-toolbar">
            <div className="search-bar" style={{ maxWidth: '100%' }}>
              <Search size={14} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search Party Name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Header: Party Name | Amount */}
          <div className="master-list-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Party Name</span>
              <Filter size={11} style={{ color: '#94a3b8' }} />
            </div>
            <span>Amount</span>
          </div>

          {/* Party Items Scrollable List */}
          <div className="master-list-items-scroll">
            {loading && customers.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Loading parties...
              </div>
            ) : customers.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <Users size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>No parties found</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Click "+ Add Party" above to create one.
                </div>
              </div>
            ) : (
              customers.map(customer => {
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <div
                    key={customer.id}
                    className={`master-list-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div>
                      <div className="master-list-party-name">{customer.customer_name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {customer.phone_number || customer.customer_code}
                      </div>
                    </div>
                    <div className="master-list-party-amount">
                      {/* Calculate balance or show ₹ 1,000.00 */}
                      ₹1,000.00
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Card: Phone Contacts to Parties (Matching Vyapar Screenshot) */}
          <div style={{
            padding: '12px 14px',
            background: '#ecfdf5',
            borderTop: '1px solid #d1fae5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }} onClick={() => navigate('/import')}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#065f46'
            }}>
              <Users size={16} />
            </div>
            <div style={{ flex: 1, fontSize: '12px', color: '#065f46', fontWeight: 500 }}>
              Easily convert your <strong>Phone contacts</strong> into parties
            </div>
            <ChevronRight size={14} style={{ color: '#059669' }} />
          </div>
        </div>

        {/* Right Detail Pane: Party Details & Transaction Table */}
        <div className="master-detail-pane">
          {selectedCustomer ? (
            <>
              {/* Selected Party Top Header */}
              <div className="master-detail-top-bar">
                <div className="master-detail-party-title">
                  <span>{selectedCustomer.customer_name}</span>
                  <button
                    onClick={() => navigate(`/customers/edit/${selectedCustomer.id}`)}
                    className="btn btn-ghost btn-icon-sm"
                    title="Edit Party Details"
                    style={{ color: '#2563eb' }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(selectedCustomer.id)}
                    className="btn btn-ghost btn-icon-sm"
                    title="Archive Party"
                    style={{ color: '#94a3b8' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Contact Action Buttons (SMS, WhatsApp, Reminder Clock) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => alert(`Sending SMS reminder to ${selectedCustomer.phone_number}`)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#fef3c7',
                      color: '#d97706',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Send SMS"
                  >
                    <MessageCircle size={16} />
                  </button>

                  <button
                    onClick={() => alert(`Opening WhatsApp chat with ${selectedCustomer.phone_number}`)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#16a34a',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="WhatsApp Chat"
                  >
                    <Phone size={16} />
                  </button>

                  <button
                    onClick={() => alert(`Payment reminder scheduled for ${selectedCustomer.customer_name}`)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Set Payment Reminder"
                  >
                    <Clock size={16} />
                  </button>
                </div>
              </div>

              {/* Party Information Strip */}
              <div style={{
                padding: '10px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: '24px',
                fontSize: '12.5px',
                color: '#64748b'
              }}>
                <div><strong>Phone:</strong> {selectedCustomer.phone_number || '—'}</div>
                <div><strong>GSTIN:</strong> {selectedCustomer.gst_number || 'Unregistered'}</div>
                <div><strong>Address:</strong> {selectedCustomer.billing_address || '—'}</div>
              </div>

              {/* Transactions Subheader */}
              <div className="master-detail-transactions-header">
                <div className="master-detail-transactions-title">Transactions</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="search-bar" style={{ maxWidth: '180px', height: '30px' }}>
                    <Search size={13} className="search-bar-icon" />
                    <input
                      type="text"
                      placeholder="Search txn..."
                      value={transactionSearch}
                      onChange={e => setTransactionSearch(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-ghost btn-icon-sm"
                    onClick={() => window.print()}
                    title="Print Transactions"
                  >
                    <Printer size={16} style={{ color: '#64748b' }} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon-sm"
                    onClick={handleExportExcel}
                    title="Export to Excel"
                  >
                    <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
                  </button>
                </div>
              </div>

              {/* Transactions Table matching Screenshot 212436 */}
              <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
                <table className="data-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Number</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'right' }}>Balance</th>
                      <th style={{ textAlign: 'center', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          Loading transactions...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          <div>No transactions recorded yet for {selectedCustomer.customer_name}.</div>
                          <button
                            className="btn btn-sale btn-sm"
                            style={{ marginTop: '8px' }}
                            onClick={() => navigate('/invoices/new')}
                          >
                            <Plus size={14} />
                            <span>Create Sale Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(inv => (
                        <tr key={inv.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              <span style={{ fontWeight: 600 }}>Sale</span>
                            </div>
                          </td>
                          <td className="col-mono">
                            <Link to={`/invoices/view/${inv.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                              {inv.invoice_number}
                            </Link>
                          </td>
                          <td>
                            {new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {formatCurrency(inv.grand_total)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: inv.status === 'Paid' ? '#10b981' : '#e43b3b' }}>
                            {inv.status === 'Paid' ? '₹0.00' : formatCurrency(inv.grand_total)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <button
                                className="btn btn-ghost btn-icon-sm"
                                onClick={() => navigate(`/invoices/view/${inv.id}`)}
                                title="View Invoice"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              <Users size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600 }}>Select a party from the list</div>
              <div style={{ fontSize: '13px' }}>View party balances and transaction records.</div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Archive Party?</div>
            <div className="modal-body">
              This party will be hidden from active lists while preserving historical invoices.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={handleDelete}>
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
