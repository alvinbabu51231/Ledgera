import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { UpdateCompanyInput } from '../../../../shared/types/company';
import { ArrowLeft, Save } from 'lucide-react';

export const CompanyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateCompanyInput>({
    company_name: '',
    gst_number: '',
    address: '',
    phone: '',
    email: '',
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc_code: '',
    invoice_prefix: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      companyApi.getById(Number(id))
        .then(res => {
          setFormData({
            company_name: res.data.company_name,
            gst_number: res.data.gst_number || '',
            address: res.data.address || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            bank_name: res.data.bank_name || '',
            account_holder: res.data.account_holder || '',
            account_number: res.data.account_number || '',
            ifsc_code: res.data.ifsc_code || '',
            invoice_prefix: res.data.invoice_prefix,
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Failed to load company');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) await companyApi.update(Number(id), formData);
      navigate('/settings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save company');
      setLoading(false);
    }
  };

  if (loading && id && !formData.company_name) {
    return <div className="loading-state" style={{ height: '300px' }}>Loading company…</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/settings" className="btn btn-ghost btn-icon" title="Back to Settings">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1>Edit Company</h1>
            <p>Update business information for {formData.company_name || 'this company'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/settings')}>
            Cancel
          </button>
          <button type="submit" form="company-form" className="btn btn-primary" disabled={loading}>
            <Save size={15} />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      <form id="company-form" onSubmit={handleSubmit}>
        {/* Section: Business Profile */}
        <div className="card card-padded" style={{ marginBottom: '16px' }}>
          <div className="section-title">Business Profile</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Company Name <span className="required">*</span></label>
              <input
                required
                className="form-input"
                name="company_name"
                placeholder="e.g. Able Plastics"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                className="form-input"
                name="gst_number"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={formData.gst_number || ''}
                onChange={handleChange}
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                name="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                name="email"
                placeholder="office@company.com"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Registered Address</label>
              <textarea
                className="form-textarea"
                name="address"
                placeholder="Full registered business address"
                value={formData.address || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Section: Invoice */}
        <div className="card card-padded" style={{ marginBottom: '16px' }}>
          <div className="section-title">Invoice Settings</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Invoice Prefix <span className="required">*</span></label>
              <input
                required
                className="form-input"
                name="invoice_prefix"
                placeholder="e.g. AP- or INV-"
                value={formData.invoice_prefix}
                onChange={handleChange}
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
              />
              <span className="form-hint">Used to prefix invoice numbers (e.g. AP-2026-0001)</span>
            </div>
          </div>
        </div>

        {/* Section: Bank Details */}
        <div className="card card-padded">
          <div className="section-title">Bank Account Details</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                className="form-input"
                name="bank_name"
                placeholder="e.g. State Bank of India"
                value={formData.bank_name || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Holder Name</label>
              <input
                className="form-input"
                name="account_holder"
                placeholder="Name as per bank records"
                value={formData.account_holder || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                className="form-input"
                name="account_number"
                placeholder="Bank account number"
                value={formData.account_number || ''}
                onChange={handleChange}
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                className="form-input"
                name="ifsc_code"
                placeholder="e.g. SBIN0001234"
                value={formData.ifsc_code || ''}
                onChange={handleChange}
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
