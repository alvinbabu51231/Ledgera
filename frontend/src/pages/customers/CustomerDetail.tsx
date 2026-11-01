import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Receipt } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { Customer } from '../../../../shared/types/customer';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<{ company_id: number; company_name: string; total_invoiced: number; invoice_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('No ID provided');
        
        const [customerRes, ledgerRes] = await Promise.all([
          customerApi.getById(Number(id)),
          customerApi.getLedger(Number(id))
        ]);
        
        setCustomer(customerRes.data);
        setLedger(ledgerRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading customer details...</div>;
  }

  if (error || !customer) {
    return (
      <div className="alert alert-error" style={{ margin: '20px' }}>
        {error || 'Customer not found'}
      </div>
    );
  }

  const overallTotal = ledger.reduce((sum, item) => sum + item.total_invoiced, 0);
  const overallCount = ledger.reduce((sum, item) => sum + item.invoice_count, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/customers" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', textDecoration: 'none', marginBottom: '8px', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to Customers
          </Link>
          <h1>{customer.customer_name}</h1>
          <p className="col-mono">{customer.customer_code}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '0 20px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px' }}>
            <div style={{ color: 'var(--gray-500)' }}>Phone:</div>
            <div>{customer.phone_number}</div>
            <div style={{ color: 'var(--gray-500)' }}>GSTIN:</div>
            <div className="col-mono">{customer.gst_number || '—'}</div>
            <div style={{ color: 'var(--gray-500)' }}>Billing:</div>
            <div>{customer.billing_address}</div>
            <div style={{ color: 'var(--gray-500)' }}>Delivery:</div>
            <div>{customer.delivery_address}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>Financial Overview</h3>
          
          <div style={{ marginBottom: '20px', background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>Overall Total Invoiced</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-600)' }}>
              ₹{(overallTotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
              Across {overallCount} {overallCount === 1 ? 'invoice' : 'invoices'}
            </div>
          </div>

          <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--gray-600)' }}>Breakdown by Company</h4>
          {ledger.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '14px', fontStyle: 'italic' }}>No invoices found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ledger.map(l => (
                <div key={l.company_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--gray-100)', padding: '8px', borderRadius: '4px' }}>
                      <Building2 size={16} color="var(--gray-600)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{l.company_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        <Receipt size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        {l.invoice_count} invoices
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '15px' }}>
                    ₹{(l.total_invoiced / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
