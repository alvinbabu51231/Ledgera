import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { CreateProductInput, UpdateProductInput } from '../../../../shared/types/product';
import { ArrowLeft, Save } from 'lucide-react';
import { getErrorMessage } from '../../utils/errors';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<CreateProductInput>({
    product_code: '',
    product_name: '',
    category: '',
    size: '',
    unit: 'Gross',
    selling_price: 0,
    manufacturing_cost: 0,
    gst_percentage: 18,
    hsn_code: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      productApi.getById(Number(id))
        .then(res => {
          setFormData({
            product_code: res.data.product_code,
            product_name: res.data.product_name,
            category: res.data.category,
            size: res.data.size,
            unit: res.data.unit as CreateProductInput['unit'],
            selling_price: res.data.selling_price,
            manufacturing_cost: res.data.manufacturing_cost,
            gst_percentage: res.data.gst_percentage,
            hsn_code: res.data.hsn_code || '',
            description: res.data.description || '',
          });
          setLoading(false);
        })
        .catch((err: unknown) => {
          setError(getErrorMessage(err, 'Failed to load product'));
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let parsedValue: string | number = value;

    if (
      type === 'number' ||
      name === 'gst_percentage'
    ) {
      parsedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await productApi.update(Number(id), formData as UpdateProductInput);
      } else {
        await productApi.create(formData);
      }
      navigate('/products');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save product'));
      setLoading(false);
    }
  };

  if (loading && isEdit && !formData.product_name) {
    return <div className="loading-state" style={{ height: '300px' }}>Loading product…</div>;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/products" className="btn btn-ghost btn-icon" title="Back to Products">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1>{isEdit ? 'Edit Product' : 'New Product'}</h1>
            <p>{isEdit ? 'Update product details in the catalogue' : 'Add a new product to the comb catalogue'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="btn btn-primary" disabled={loading}>
            <Save size={15} />
            {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit}>
        {/* Section: Identity */}
        <div className="card card-padded" style={{ marginBottom: '16px' }}>
          <div className="section-title">Product Identity</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Product Code <span className="required">*</span></label>
              <input
                required
                className="form-input"
                name="product_code"
                placeholder="e.g. COMB-001"
                value={formData.product_code}
                onChange={handleChange}
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
              />
              <span className="form-hint">Must be unique across all products</span>
            </div>

            <div className="form-group">
              <label className="form-label">Product Name <span className="required">*</span></label>
              <input
                required
                className="form-input"
                name="product_name"
                placeholder="e.g. Fine Tooth Comb 7 inch"
                value={formData.product_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category <span className="required">*</span></label>
              <input
                required
                className="form-input"
                name="category"
                placeholder="e.g. Fine Tooth, Wide Tooth…"
                value={formData.category}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Size <span className="required">*</span></label>
              <input
                required
                className="form-input"
                name="size"
                placeholder="e.g. 7 inch, Small, Medium…"
                value={formData.size}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit <span className="required">*</span></label>
              <select
                required
                className="form-select"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="Gross">Gross</option>
                <option value="Dozen">Dozen</option>
                <option value="Piece">Piece</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">HSN Code</label>
              <input
                className="form-input"
                name="hsn_code"
                placeholder="e.g. 96151900"
                value={formData.hsn_code || ''}
                onChange={handleChange}
                style={{ fontFamily: 'monospace' }}
              />
              <span className="form-hint">Required for GST invoicing</span>
            </div>
          </div>
        </div>

        {/* Section: Pricing */}
        <div className="card card-padded" style={{ marginBottom: '16px' }}>
          <div className="section-title">Pricing & Tax</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Selling Price (₹) <span className="required">*</span></label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturing Cost (₹) <span className="required">*</span></label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                name="manufacturing_cost"
                value={formData.manufacturing_cost}
                onChange={handleChange}
              />
              {formData.selling_price > 0 && formData.manufacturing_cost > 0 && (
                <span className="form-hint">
                  Margin: {(((formData.selling_price - formData.manufacturing_cost) / formData.selling_price) * 100).toFixed(1)}%
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">GST % <span className="required">*</span></label>
              <select
                required
                className="form-select"
                name="gst_percentage"
                value={formData.gst_percentage}
                onChange={handleChange}
              >
                {[0, 5, 12, 18, 28].map(r => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Description */}
        <div className="card card-padded">
          <div className="section-title">Additional Details</div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              placeholder="Optional notes about this product…"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
