import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCustomerSchema, updateCustomerSchema } from '../../../../shared/types/customer';
import { customerApi } from '../../api/customerApi';
import { ZodError } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { getErrorMessage } from '../../utils/errors';

export const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    gst_number: '',
    billing_address: '',
    delivery_address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      customerApi.getById(Number(id))
        .then(res => {
          if (res.data) {
            setFormData({
              customer_name: res.data.customer_name,
              phone_number: res.data.phone_number,
              whatsapp_number: res.data.whatsapp_number || '',
              email: res.data.email || '',
              gst_number: res.data.gst_number || '',
              billing_address: res.data.billing_address,
              delivery_address: res.data.delivery_address,
            });
          }
        })
        .catch(err => setGlobalError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);

    try {
      const payload = {
        ...formData,
        whatsapp_number: formData.whatsapp_number || null,
        email: formData.email || null,
        gst_number: formData.gst_number || null,
      };

      if (isEditMode) {
        updateCustomerSchema.parse(payload);
        setLoading(true);
        await customerApi.update(Number(id), payload);
      } else {
        createCustomerSchema.parse(payload);
        setLoading(true);
        await customerApi.create(payload);
      }
      navigate('/customers');
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setGlobalError(getErrorMessage(err, 'An error occurred during submission.'));
      }
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.customer_name) {
    return (
      <div className="loading-state" style={{ height: '300px' }}>
        Loading customer details…
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/customers" className="btn btn-ghost btn-icon" title="Back to Customers">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1>{isEditMode ? 'Edit Customer' : 'New Customer'}</h1>
            <p>{isEditMode ? 'Update the customer record details' : 'Add a new customer to your master list'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            className="btn btn-primary"
            disabled={loading}
          >
            <Save size={15} />
            {loading ? 'Saving…' : isEditMode ? 'Update Customer' : 'Save Customer'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {globalError && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {globalError}
        </div>
      )}

      {/* Form Card */}
      <form id="customer-form" onSubmit={handleSubmit}>
        {/* Section: Basic Info */}
        <div className="card card-padded" style={{ marginBottom: '16px' }}>
          <div className="section-title">Basic Information</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Customer Name <span className="required">*</span></label>
              <input
                className={`form-input ${errors.customer_name ? 'is-error' : ''}`}
                name="customer_name"
                placeholder="e.g. Ravi Enterprises"
                value={formData.customer_name}
                onChange={handleChange}
              />
              {errors.customer_name && <span className="form-error">{errors.customer_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number <span className="required">*</span></label>
              <input
                className={`form-input ${errors.phone_number ? 'is-error' : ''}`}
                name="phone_number"
                placeholder="e.g. 9876543210"
                value={formData.phone_number}
                onChange={handleChange}
              />
              {errors.phone_number && <span className="form-error">{errors.phone_number}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input
                className={`form-input ${errors.whatsapp_number ? 'is-error' : ''}`}
                name="whatsapp_number"
                placeholder="If different from phone"
                value={formData.whatsapp_number}
                onChange={handleChange}
              />
              {errors.whatsapp_number && <span className="form-error">{errors.whatsapp_number}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'is-error' : ''}`}
                name="email"
                placeholder="customer@company.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                className={`form-input ${errors.gst_number ? 'is-error' : ''}`}
                name="gst_number"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={formData.gst_number}
                onChange={handleChange}
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
              />
              {errors.gst_number && <span className="form-error">{errors.gst_number}</span>}
            </div>
          </div>
        </div>

        {/* Section: Addresses */}
        <div className="card card-padded">
          <div className="section-title">Address Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Billing Address <span className="required">*</span></label>
              <textarea
                className={`form-textarea ${errors.billing_address ? 'is-error' : ''}`}
                name="billing_address"
                placeholder="Full billing address"
                value={formData.billing_address}
                onChange={handleChange}
                rows={3}
              />
              {errors.billing_address && <span className="form-error">{errors.billing_address}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address <span className="required">*</span></label>
              <textarea
                className={`form-textarea ${errors.delivery_address ? 'is-error' : ''}`}
                name="delivery_address"
                placeholder="Full delivery address"
                value={formData.delivery_address}
                onChange={handleChange}
                rows={3}
              />
              {errors.delivery_address && <span className="form-error">{errors.delivery_address}</span>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
