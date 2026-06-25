import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyStore } from '../../store/companyStore';
import { Pencil, Building2 } from 'lucide-react';

export const CompanyList: React.FC = () => {
  const { companies, loading, error, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  if (loading) {
    return <div className="loading-state" style={{ height: '300px' }}>Loading companies…</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ margin: '24px 0' }}>{error}</div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Company Master</h1>
          <p>Business profiles used for invoicing and reports</p>
        </div>
      </div>

      {/* Company cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {companies.map(company => (
          <div
            key={company.id}
            className="card card-padded"
            style={{ position: 'relative' }}
          >
            {/* Active indicator */}
            {company.is_active && (
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <span className="badge badge-success">
                  <span className="badge-dot" />
                  Active
                </span>
              </div>
            )}

            {/* Company Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-600)',
              }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {company.company_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>
                  Invoice prefix: <strong style={{ color: 'var(--gray-600)' }}>{company.invoice_prefix}</strong>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'GST Number',      value: company.gst_number },
                { label: 'Phone',           value: company.phone },
                { label: 'Email',           value: company.email },
                { label: 'Bank',            value: company.bank_name },
                { label: 'Account Holder', value: company.account_holder },
                { label: 'IFSC Code',       value: company.ifsc_code },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: '3px' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: '13.5px', color: row.value ? 'var(--gray-700)' : 'var(--gray-300)', fontWeight: row.value ? 400 : 300 }}>
                    {row.value || '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Address */}
            {company.address && (
              <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '13px', color: 'var(--gray-600)', marginBottom: '20px', lineHeight: '1.5' }}>
                {company.address}
              </div>
            )}

            {/* Account Number */}
            {company.account_number && (
              <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: '3px' }}>
                  Account Number
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.5px', color: 'var(--gray-800)', fontWeight: 500 }}>
                  {company.account_number}
                </div>
              </div>
            )}

            {/* Action */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
              <Link
                to={`/companies/edit/${company.id}`}
                className="btn btn-secondary btn-sm"
              >
                <Pencil size={13} />
                Edit Company
              </Link>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="empty-state" style={{ gridColumn: 'span 2' }}>
            <div className="empty-state-icon"><Building2 size={24} /></div>
            <h3>No companies found</h3>
            <p>Companies are seeded automatically on startup.</p>
          </div>
        )}
      </div>
    </div>
  );
};
