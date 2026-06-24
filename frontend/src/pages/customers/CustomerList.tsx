import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '../../store/customerStore';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

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
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Customers</h1>
        <Link 
          to="/customers/add"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0284c7', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative', width: '300px' }}>
        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search name, phone, or GST..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
        />
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>{error}</div>}

      {loading && customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading customers...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          No customers found. Click "Add Customer" to create one.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Code</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Phone</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>GST Number</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{customer.customer_code}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{customer.customer_name}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{customer.phone_number}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{customer.gst_number || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link to={`/customers/edit/${customer.id}`} style={{ color: '#0284c7', marginRight: '16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Edit size={16} /> Edit
                    </Link>
                    <button 
                      onClick={() => setDeleteConfirmId(customer.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '1rem', padding: 0 }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#0f172a' }}>Confirm Deletion</h3>
            <p style={{ color: '#475569', marginBottom: '24px' }}>Are you sure you want to delete this customer? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                style={{ padding: '8px 16px', border: 'none', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
