import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { invoiceApi } from '../../api/invoiceApi';
import { customerApi } from '../../api/customerApi';
import { productApi } from '../../api/productApi';
import { useCompanyStore } from '../../store/companyStore';
import {
  INVOICE_TYPES,
  INVOICE_STATUSES,
  DISCOUNT_TYPES,
  DiscountType,
  InvoiceItemInput,
  CreateInvoiceInput,
} from '../../../../shared/types/invoice';
import { Customer } from '../../../../shared/types/customer';
import { Product } from '../../../../shared/types/product';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '../../utils/errors';

// ---------- helpers ----------
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

interface LineItem {
  product_id: number | '';
  product_name: string;
  hsn_code: string | null;
  quantity: string;
  unit: string;
  rate: string;
  gst_percentage: string;
  gst_amount: number;
  total: number;
}

const emptyLine = (): LineItem => ({
  product_id: '',
  product_name: '',
  hsn_code: null,
  quantity: '1',
  unit: '',
  rate: '',
  gst_percentage: '0',
  gst_amount: 0,
  total: 0,
});

function calcLine(line: LineItem): LineItem {
  const qty = parseFloat(line.quantity) || 0;
  const rate = parseFloat(line.rate) || 0;
  const gstPct = parseFloat(line.gst_percentage) || 0;
  const taxable = qty * rate;
  const gst_amount = round2(taxable * (gstPct / 100));
  const total = round2(taxable + gst_amount);
  return { ...line, gst_amount, total };
}

function calcTotals(lines: LineItem[], discountType: DiscountType, discountValue: string) {
  const subtotal = round2(lines.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.rate) || 0), 0));
  const totalGst = round2(lines.reduce((s, l) => s + l.gst_amount, 0));
  const cgst = round2(totalGst / 2);
  const sgst = round2(totalGst / 2);
  const preDiscount = subtotal + totalGst;

  let discount_amount = 0;
  const dv = parseFloat(discountValue) || 0;
  if (discountType === 'Percentage') {
    discount_amount = round2(preDiscount * dv / 100);
  } else if (discountType === 'Fixed') {
    discount_amount = dv;
  } else if (discountType === 'GST') {
    discount_amount = round2(totalGst);
  }
  discount_amount = Math.min(discount_amount, preDiscount);

  const grand_total = round2(preDiscount - discount_amount);
  return { subtotal, cgst, sgst, totalGst, discount_amount, grand_total };
}

// ---------- component ----------
export const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { companies, selectedCompanyId } = useCompanyStore();

  // --- master data ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // --- form header ---
  const [companyId, setCompanyId] = useState<number | ''>(selectedCompanyId ?? '');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceType, setInvoiceType] = useState<'B2B' | 'B2C'>('B2B');
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Paid' | 'Cancelled'>('Draft');
  const [notes, setNotes] = useState('');

  // --- discount ---
  const [discountType, setDiscountType] = useState<DiscountType>('None');
  const [discountValue, setDiscountValue] = useState('0');

  // --- invoice number (display only when editing) ---
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // --- line items ---
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);

  // --- UI state ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditMode && !companyId && selectedCompanyId) {
      setCompanyId(selectedCompanyId);
    }
  }, [companyId, isEditMode, selectedCompanyId]);

  // ── Load master data ──
  useEffect(() => {
    customerApi.getAll().then(r => setCustomers(r.data.filter(c => c.is_active))).catch(() => {});
    productApi.getAll().then(r => setProducts(r.data.filter(p => p.is_active))).catch(() => {});
  }, []);

  // ── Load invoice in edit mode ──
  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    invoiceApi
      .getById(Number(id))
      .then(res => {
        const inv = res.data;
        setCompanyId(inv.company_id);
        setCustomerId(inv.customer_id);
        setInvoiceDate(inv.invoice_date.slice(0, 10));
        setInvoiceType(inv.invoice_type);
        setStatus(inv.status);
        setNotes(inv.notes ?? '');
        setInvoiceNumber(inv.invoice_number);
        setDiscountType(inv.discount_type ?? 'None');
        // Restore discount value — percentage is stored as integer (e.g. 5 for 5%), fixed in paisa
        setDiscountValue(String(inv.discount_value ?? 0));
        setLines(
          inv.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            hsn_code: item.hsn_code,
            quantity: String(item.quantity),
            unit: item.unit,
            rate: String(item.rate),
            gst_percentage: String(item.gst_percentage),
            gst_amount: item.gst_amount,
            total: item.total,
          }))
        );
      })
      .catch(err => setGlobalError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  // ── Recalc when lines or discount change ──
  const totals = calcTotals(lines, discountType, discountValue);

  // ── Line item handlers ──
  const updateLine = useCallback((idx: number, patch: Partial<LineItem>) => {
    setLines(prev => {
      const next = [...prev];
      next[idx] = calcLine({ ...next[idx], ...patch });
      return next;
    });
  }, []);

  const handleProductChange = useCallback(
    (idx: number, productId: number | '') => {
      if (!productId) {
        setLines(prev => {
          const next = [...prev];
          next[idx] = calcLine({ ...next[idx], product_id: '', product_name: '', hsn_code: null, unit: '', rate: '', gst_percentage: '0' });
          return next;
        });
        return;
      }
      const product = products.find(p => p.id === productId);
      if (product) {
        setLines(prev => {
          const next = [...prev];
          next[idx] = calcLine({
            ...next[idx],
            product_id: product.id,
            product_name: product.product_name,
            hsn_code: product.hsn_code,
            unit: product.unit,
            rate: String(product.selling_price),
            gst_percentage: String(product.gst_percentage),
          });
          return next;
        });
      }
    },
    [products]
  );

  const addLine = () => setLines(prev => [...prev, emptyLine()]);

  const removeLine = (idx: number) => {
    setLines(prev => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  // When discount type changes to GST, lock the value to the GST total
  const handleDiscountTypeChange = (newType: DiscountType) => {
    setDiscountType(newType);
    if (newType === 'GST') {
      setDiscountValue('0'); // value not used for GST type
    } else if (newType === 'None') {
      setDiscountValue('0');
    }
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!companyId) errors.company_id = 'Company is required';
    if (!customerId) errors.customer_id = 'Customer is required';
    if (!invoiceDate) errors.invoice_date = 'Invoice date is required';
    if (lines.some(l => !l.product_id)) errors.items = 'All items must have a product selected';
    if (lines.some(l => !l.quantity || parseFloat(l.quantity) <= 0)) errors.items = 'All quantities must be positive';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const validLines: InvoiceItemInput[] = lines.map(l => ({
      product_id: l.product_id as number,
      product_name: l.product_name,
      hsn_code: l.hsn_code,
      quantity: parseFloat(l.quantity),
      unit: l.unit,
      rate: parseFloat(l.rate) || 0,
      gst_percentage: parseFloat(l.gst_percentage) || 0,
      gst_amount: l.gst_amount,
      total: l.total,
    }));

    // Convert discount_value: percentage stays as entered (integer), fixed comes in as rupees → convert to paisa
    const discountValueInt = discountType === 'Fixed'
      ? Math.round((parseFloat(discountValue) || 0) * 100)
      : Math.round(parseFloat(discountValue) || 0);

    const payload: CreateInvoiceInput = {
      company_id: companyId as number,
      customer_id: customerId as number,
      invoice_date: invoiceDate,
      invoice_type: invoiceType,
      status,
      discount_type: discountType,
      discount_value: discountValueInt,
      notes: notes || null,
      items: validLines,
    };

    setSaving(true);
    try {
      if (isEditMode) {
        await invoiceApi.update(Number(id), payload);
      } else {
        await invoiceApi.create(payload);
      }
      navigate('/invoices');
    } catch (err: unknown) {
      setGlobalError(getErrorMessage(err, 'An error occurred. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-state" style={{ height: '300px' }}>Loading invoice…</div>;
  }

  const showDiscountValueInput = discountType === 'Percentage' || discountType === 'Fixed';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/invoices" className="btn btn-ghost btn-icon" title="Back to Invoices">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1>{isEditMode ? `Edit Invoice` : 'New Invoice'}</h1>
            <p>
              {isEditMode
                ? `Editing ${invoiceNumber}`
                : 'Invoice number will be auto-generated on save'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </button>
          <button
            type="submit"
            form="invoice-form"
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={15} />
            {saving ? 'Saving…' : isEditMode ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {globalError}
        </div>
      )}

      <form id="invoice-form" onSubmit={handleSubmit}>
        {/* ── Section: Invoice Header ── */}
        <div className="card card-padded" style={{ marginBottom: '16px' }}>
          <div className="section-title">Invoice Details</div>
          <div className="form-grid-3">
            {/* Company */}
            <div className="form-group">
              <label className="form-label">
                Company <span className="required">*</span>
              </label>
              <select
                className={`form-select ${fieldErrors.company_id ? 'is-error' : ''}`}
                value={companyId}
                onChange={e => setCompanyId(Number(e.target.value))}
              >
                <option value="">Select company…</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
              {fieldErrors.company_id && <span className="form-error">{fieldErrors.company_id}</span>}
            </div>

            {/* Customer */}
            <div className="form-group">
              <label className="form-label">
                Customer <span className="required">*</span>
              </label>
              <select
                className={`form-select ${fieldErrors.customer_id ? 'is-error' : ''}`}
                value={customerId}
                onChange={e => setCustomerId(Number(e.target.value))}
              >
                <option value="">Select customer…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
              {fieldErrors.customer_id && <span className="form-error">{fieldErrors.customer_id}</span>}
            </div>

            {/* Invoice Date */}
            <div className="form-group">
              <label className="form-label">
                Invoice Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className={`form-input ${fieldErrors.invoice_date ? 'is-error' : ''}`}
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
              />
              {fieldErrors.invoice_date && <span className="form-error">{fieldErrors.invoice_date}</span>}
            </div>

            {/* Invoice Type */}
            <div className="form-group">
              <label className="form-label">
                Invoice Type <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={invoiceType}
                onChange={e => setInvoiceType(e.target.value as 'B2B' | 'B2C')}
              >
                {INVOICE_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t} — {t === 'B2B' ? 'Business to Business' : 'Business to Consumer'}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as typeof status)}
              >
                {INVOICE_STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Number (read-only, edit mode only) */}
            {isEditMode && (
              <div className="form-group">
                <label className="form-label">Invoice Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceNumber}
                  disabled
                  style={{ fontFamily: 'monospace', color: 'var(--gray-500)' }}
                />
                <span className="form-hint">Auto-generated, cannot be changed</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Optional notes or payment terms…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* ── Section: Line Items ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="section-title" style={{ marginBottom: 0 }}>
              Line Items
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}>
              <Plus size={14} />
              Add Item
            </button>
          </div>

          {fieldErrors.items && (
            <div className="alert alert-error" style={{ margin: '12px 20px 0' }}>
              {fieldErrors.items}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '200px' }}>Product</th>
                  <th style={{ minWidth: '80px' }}>Qty</th>
                  <th style={{ minWidth: '100px' }}>Unit</th>
                  <th style={{ minWidth: '110px' }}>Rate (₹)</th>
                  <th style={{ minWidth: '80px' }}>GST %</th>
                  <th style={{ minWidth: '110px', textAlign: 'right' }}>GST Amt (₹)</th>
                  <th style={{ minWidth: '120px', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    {/* Product */}
                    <td>
                      <select
                        className="form-select"
                        style={{ minWidth: '180px' }}
                        value={line.product_id}
                        onChange={e =>
                          handleProductChange(idx, e.target.value ? Number(e.target.value) : '')
                        }
                      >
                        <option value="">Select product…</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.product_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Quantity */}
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        min="0.01"
                        step="0.01"
                        value={line.quantity}
                        onChange={e => updateLine(idx, { quantity: e.target.value })}
                        style={{ width: '80px' }}
                      />
                    </td>

                    {/* Unit */}
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={line.unit}
                        onChange={e => updateLine(idx, { unit: e.target.value })}
                        style={{ width: '90px' }}
                        placeholder="Unit"
                      />
                    </td>

                    {/* Rate */}
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        step="0.01"
                        value={line.rate}
                        onChange={e => updateLine(idx, { rate: e.target.value })}
                        style={{ width: '100px' }}
                      />
                    </td>

                    {/* GST % */}
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        max="100"
                        step="0.01"
                        value={line.gst_percentage}
                        onChange={e => updateLine(idx, { gst_percentage: e.target.value })}
                        style={{ width: '72px' }}
                      />
                    </td>

                    {/* GST Amount (read-only) */}
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--gray-600)', fontSize: '13.5px' }}>
                        {line.gst_amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Total (read-only) */}
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {line.total.toFixed(2)}
                      </span>
                    </td>

                    {/* Remove */}
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon-sm"
                        onClick={() => removeLine(idx)}
                        disabled={lines.length === 1}
                        style={{ color: 'var(--gray-400)' }}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section: Discount & Totals ── */}
        <div className="card card-padded">
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {/* Discount Controls */}
            <div style={{ minWidth: '260px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Discount</div>
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select
                  className="form-select"
                  value={discountType}
                  onChange={e => handleDiscountTypeChange(e.target.value as DiscountType)}
                >
                  {DISCOUNT_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t === 'None' ? 'No Discount' :
                       t === 'Percentage' ? 'Percentage (%)' :
                       t === 'Fixed' ? 'Fixed Amount (₹)' :
                       'GST Discount (waive CGST + SGST)'}
                    </option>
                  ))}
                </select>
              </div>
              {showDiscountValueInput && (
                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label className="form-label">
                    {discountType === 'Percentage' ? 'Discount %' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    max={discountType === 'Percentage' ? '100' : undefined}
                    step="0.01"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                  />
                </div>
              )}
              {discountType === 'GST' && (
                <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '8px', padding: '8px 10px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
                  GST discount waives the full tax amount (CGST + SGST = ₹{totals.totalGst.toFixed(2)})
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ minWidth: '320px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Invoice Totals</div>
              <div>
                {[
                  { label: 'Subtotal', value: totals.subtotal, muted: false },
                  { label: 'CGST', value: totals.cgst, muted: true },
                  { label: 'SGST', value: totals.sgst, muted: true },
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--gray-100)',
                      fontSize: '13.5px',
                      color: row.muted ? 'var(--gray-500)' : 'var(--gray-700)',
                    }}
                  >
                    <span>{row.label}</span>
                    <span>₹{row.value.toFixed(2)}</span>
                  </div>
                ))}
                {discountType !== 'None' && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--gray-100)',
                      fontSize: '13.5px',
                      color: '#dc2626',
                    }}
                  >
                    <span>
                      Discount
                      {discountType === 'GST' ? ' (GST)' :
                       discountType === 'Percentage' ? ` (${discountValue}%)` : ''}
                    </span>
                    <span>− ₹{totals.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0 4px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--gray-900)',
                  }}
                >
                  <span>Grand Total</span>
                  <span>₹{totals.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
