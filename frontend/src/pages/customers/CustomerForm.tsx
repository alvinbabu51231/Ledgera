import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomerSchema, updateCustomerSchema } from '../../../../shared/types/customer';
import { customerApi } from '../../api/customerApi';
import { ZodError } from 'zod';

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
        .then((res) => {
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
        .catch((err) => setGlobalError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);

    try {
      // Validate with Zod
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
    } catch (err: any) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setGlobalError(err.message || 'An error occurred during submission.');
      }
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.customer_name) {
    return <div style={{ padding: '24px' }}>Loading customer details...</div>;
  }

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', 
    fontSize: '0.95rem', marginTop: '4px', boxSizing: 'border-box' as const
  };
  const labelStyle = { display: 'block', fontWeight: 500, color: '#334155', marginBottom: '4px' };
  const errorStyle = { color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block' };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#0f172a' }}>
        {isEditMode ? 'Edit Customer' : 'Add New Customer'}
      </h1>

      {globalError && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '6px', marginBottom: '24px' }}>
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Customer Name *</label>
            <input name="customer_name" value={formData.customer_name} onChange={handleChange} style={inputStyle} />
            {errors.customer_name && <span style={errorStyle}>{errors.customer_name}</span>}
          </div>
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input name="phone_number" value={formData.phone_number} onChange={handleChange} style={inputStyle} />
            {errors.phone_number && <span style={errorStyle}>{errors.phone_number}</span>}
          </div>
          <div>
            <label style={labelStyle}>WhatsApp Number</label>
            <input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} style={inputStyle} />
            {errors.whatsapp_number && <span style={errorStyle}>{errors.whatsapp_number}</span>}
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>
          <div>
            <label style={labelStyle}>GST Number</label>
            <input name="gst_number" value={formData.gst_number} onChange={handleChange} style={inputStyle} />
            {errors.gst_number && <span style={errorStyle}>{errors.gst_number}</span>}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Billing Address *</label>
          <textarea name="billing_address" value={formData.billing_address} onChange={handleChange} rows={3} style={{...inputStyle, resize: 'vertical'}} />
          {errors.billing_address && <span style={errorStyle}>{errors.billing_address}</span>}
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={labelStyle}>Delivery Address *</label>
          <textarea name="delivery_address" value={formData.delivery_address} onChange={handleChange} rows={3} style={{...inputStyle, resize: 'vertical'}} />
          {errors.delivery_address && <span style={errorStyle}>{errors.delivery_address}</span>}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#475569' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Save Customer')}
          </button>
        </div>
      </form>
    </div>
  );
};
