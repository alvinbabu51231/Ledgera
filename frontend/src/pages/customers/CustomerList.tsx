import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '../../store/customerStore';
import { Plus, Search, Pencil, Trash2, Users, Eye } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { customers, loading, error, fetchCustomers, deleteCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers(searchTerm);
  }, [searchTerm, fetchCustomers]);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteCustomer(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Customers</h1>
          <p>Manage your customer master records</p>
        </div>
        <Link to="/customers/add" className="btn btn-primary">
          <Plus size={16} />
          New Customer
        </Link>
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="search-bar">
            <Search size={15} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search name, phone, or GST..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--gray-400)' }}>
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ margin: '16px 20px' }}>
            {error}
          </div>
        )}

        {/* States */}
        {loading && customers.length === 0 ? (
          <div className="loading-state">
            <div>Loading customers…</div>
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={24} /></div>
            <h3>No customers yet</h3>
            <p>Get started by adding your first customer record.</p>
            <Link to="/customers/add" className="btn btn-primary" style={{ marginTop: '4px' }}>
              <Plus size={16} />
              Add Customer
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>GST Number</th>
                  <th>Billing Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td className="col-mono" style={{ color: 'var(--gray-500)' }}>{customer.customer_code}</td>
                    <td className="col-primary">{customer.customer_name}</td>
                    <td>{customer.phone_number}</td>
                    <td>
                      {customer.gst_number ? (
                        <span className="col-mono" style={{ fontSize: '12.5px' }}>{customer.gst_number}</span>
                      ) : (
                        <span className="col-muted">—</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-600)' }}>
                      {customer.billing_address}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/customers/view/${customer.id}`}
                          className="btn btn-ghost btn-icon-sm"
                          title="View customer"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to={`/customers/edit/${customer.id}`}
                          className="btn btn-ghost btn-icon-sm"
                          title="Edit customer"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(customer.id)}
                          className="btn btn-ghost btn-icon-sm"
                          title="Delete customer"
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
            <div className="modal-title">Archive Customer?</div>
            <div className="modal-body">
              This customer will be hidden from active customer lists while preserving its history.
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
