import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Percent,
  Receipt,
  Database,
  Info,
  ChevronRight,
  Save,
  Upload,
  Check,
  Pencil,
  Plus,
  Sliders,
  DollarSign,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';
import { UpdateCompanyInput } from '../../../shared/types/company';
import { useCompanyStore } from '../store/companyStore';
import { getErrorMessage } from '../utils/errors';

const settingsTabs = [
  { id: 'general', name: 'GENERAL' },
  { id: 'business', name: 'BUSINESS INFORMATION' },
  { id: 'transaction', name: 'TRANSACTION' },
  { id: 'print', name: 'PRINT' },
  { id: 'taxes', name: 'TAXES & GST' },
  { id: 'message', name: 'TRANSACTION MESSAGE' },
  { id: 'party', name: 'PARTY' },
  { id: 'item', name: 'ITEM' },
  { id: 'reminders', name: 'SERVICE REMINDERS' },
  { id: 'accounting', name: 'ACCOUNTING' },
  { id: 'currency', name: 'MULTI CURRENCY' },
  { id: 'about', name: 'ABOUT LEDGERA' },
];

const emptyCompanyDraft: UpdateCompanyInput = {
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
};

const toCompanyDraft = (company: UpdateCompanyInput): UpdateCompanyInput => ({
  company_name: company.company_name ?? '',
  gst_number: company.gst_number ?? '',
  address: company.address ?? '',
  phone: company.phone ?? '',
  email: company.email ?? '',
  bank_name: company.bank_name ?? '',
  account_holder: company.account_holder ?? '',
  account_number: company.account_number ?? '',
  ifsc_code: company.ifsc_code ?? '',
  invoice_prefix: company.invoice_prefix ?? '',
});

const normalizeCompanyDraft = (draft: UpdateCompanyInput): UpdateCompanyInput => ({
  company_name: draft.company_name?.trim() ?? '',
  gst_number: draft.gst_number?.trim() || null,
  address: draft.address?.trim() || null,
  phone: draft.phone?.trim() || null,
  email: draft.email?.trim() || null,
  bank_name: draft.bank_name?.trim() || null,
  account_holder: draft.account_holder?.trim() || null,
  account_number: draft.account_number?.trim() || null,
  ifsc_code: draft.ifsc_code?.trim() || null,
  invoice_prefix: draft.invoice_prefix?.trim() ?? '',
});

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get('tab') || 'general';

  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    loading,
    error,
    fetchCompanies,
    updateCompany
  } = useCompanyStore();

  const [drafts, setDrafts] = useState<Record<number, UpdateCompanyInput>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // General Settings Checkbox States (matching Screenshot 212516)
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [gstinEnabled, setGstinEnabled] = useState(true);
  const [stopSaleNegative, setStopSaleNegative] = useState(false);
  const [blockNewItems, setBlockNewItems] = useState(false);
  const [blockNewParties, setBlockNewParties] = useState(false);

  // More Transactions States
  const [txnEstimate, setTxnEstimate] = useState(true);
  const [txnProforma, setTxnProforma] = useState(true);
  const [txnSaleOrder, setTxnSaleOrder] = useState(true);
  const [txnOtherIncome, setTxnOtherIncome] = useState(false);
  const [txnFixedAssets, setTxnFixedAssets] = useState(false);
  const [txnDeliveryChallan, setTxnDeliveryChallan] = useState(true);
  const [txnGoodsReturn, setTxnGoodsReturn] = useState(true);

  // Backup & Audit States
  const [autoBackup, setAutoBackup] = useState(false);
  const [auditTrail, setAuditTrail] = useState(true);

  // Zoom / Scale State
  const [zoomScale, setZoomScale] = useState(100);

  useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length, fetchCompanies]);

  useEffect(() => {
    const nextDrafts = companies.reduce<Record<number, UpdateCompanyInput>>((acc, company) => {
      acc[company.id] = toCompanyDraft(company);
      return acc;
    }, {});
    setDrafts(nextDrafts);
  }, [companies]);

  const updateDraft = (companyId: number, field: keyof UpdateCompanyInput, value: string) => {
    setSavedId(null);
    setDrafts(prev => ({
      ...prev,
      [companyId]: {
        ...(prev[companyId] ?? emptyCompanyDraft),
        [field]: value
      }
    }));
  };

  const saveCompany = async (companyId: number) => {
    const payload = normalizeCompanyDraft(drafts[companyId] ?? emptyCompanyDraft);
    setSavingId(companyId);
    setFormError(null);
    setSavedId(null);
    try {
      await updateCompany(companyId, payload);
      setSavedId(companyId);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Failed to save company'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#ffffff', overflow: 'hidden' }}>
      {/* ── Left Vertical Navigation matching Screenshot 212516 ── */}
      <aside style={{
        width: '210px',
        minWidth: '210px',
        borderRight: '1px solid #e2e8f0',
        background: '#13182c',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0'
      }}>
        <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #232840', color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>
          Settings
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {settingsTabs.map(tab => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 16px',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? '#ffffff' : '#9aa1bc',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #e43b3b' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.6px',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Right Content Area ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#f8fafc' }}>
        {/* TAB 1: GENERAL (Exact Layout from Screenshot 212516) */}
        {activeTabId === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1080px' }}>
            {/* Row 1: Application, Multi Firm, Backup & History */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              {/* Box 1: Application */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                  Application
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#334155' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={passcodeEnabled}
                      onChange={e => setPasscodeEnabled(e.target.checked)}
                    />
                    <span>Enable Passcode</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Business Currency</span>
                    <select
                      value={currencySymbol}
                      onChange={e => setCurrencySymbol(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="₹">₹ (INR)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div>Amount</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>(upto Decimal Places)</div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={decimalPlaces}
                      onChange={e => setDecimalPlaces(Number(e.target.value))}
                      style={{ width: '50px', padding: '4px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={gstinEnabled}
                      onChange={e => setGstinEnabled(e.target.checked)}
                    />
                    <span>GSTIN Number</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={stopSaleNegative}
                      onChange={e => setStopSaleNegative(e.target.checked)}
                    />
                    <span>Stop Sale on Negative Stock</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={blockNewItems}
                      onChange={e => setBlockNewItems(e.target.checked)}
                    />
                    <span>Block New Items from Txn Form</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={blockNewParties}
                      onChange={e => setBlockNewParties(e.target.checked)}
                    />
                    <span>Block New Parties from Txn Form</span>
                  </label>
                </div>
              </div>

              {/* Box 2: Multi Firm (Company Management) */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#1e293b', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Multi Firm</span>
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {companies.map(c => {
                    const isSelected = selectedCompanyId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCompanyId(c.id)}
                        style={{
                          padding: '12px 14px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedCompanyId(c.id)}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            {c.company_name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                            DEFAULT
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSearchParams({ tab: 'business' }); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                            title="Edit Business Details"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setSearchParams({ tab: 'business' })}
                    style={{
                      marginTop: '6px',
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      color: '#2563eb',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Manage Business Details</span>
                  </button>
                </div>
              </div>

              {/* Box 3: Backup & History */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                  Backup & History
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#334155' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoBackup}
                      onChange={e => setAutoBackup(e.target.checked)}
                    />
                    <span>Auto Backup</span>
                  </label>

                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Last Backup: <strong>{new Date().toLocaleDateString('en-IN')} | 09:11 PM</strong>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={auditTrail}
                      onChange={e => setAuditTrail(e.target.checked)}
                    />
                    <span>Audit Trail (Enabled)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 2: More Transactions, Stock Transfer, Customize Your View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              {/* Box 4: More Transactions */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                  More Transactions
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#334155' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnEstimate}
                      onChange={e => setTxnEstimate(e.target.checked)}
                    />
                    <span>Estimate/Quotation</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnProforma}
                      onChange={e => setTxnProforma(e.target.checked)}
                    />
                    <span>Proforma Invoice</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnSaleOrder}
                      onChange={e => setTxnSaleOrder(e.target.checked)}
                    />
                    <span>Sale/Purchase Order</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnOtherIncome}
                      onChange={e => setTxnOtherIncome(e.target.checked)}
                    />
                    <span>Other Income</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnFixedAssets}
                      onChange={e => setTxnFixedAssets(e.target.checked)}
                    />
                    <span>Fixed Assets (FA)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnDeliveryChallan}
                      onChange={e => setTxnDeliveryChallan(e.target.checked)}
                    />
                    <span>Delivery Challan</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={txnGoodsReturn}
                      onChange={e => setTxnGoodsReturn(e.target.checked)}
                    />
                    <span>Goods return on Delivery Challan</span>
                  </label>
                </div>
              </div>

              {/* Box 5: Stock Transfer Between Godowns */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                  <span>Stock Transfer Between Godowns</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                </div>

                <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
                  Manage all your stores/godowns and transfer stock seamlessly between them. Using this feature, you can transfer stock between stores/godowns and manage your inventory more efficiently.
                </p>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>Godown management & Stock transfer</span>
                </label>
              </div>

              {/* Box 6: Customize Your View */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                  Customize Your View
                </div>

                <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
                  Choose Your Screen Zoom/Scale:
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    Resize the Ledgera screen, making it larger or smaller to fit your preferences.
                  </div>
                </div>

                <input
                  type="range"
                  min="70"
                  max="130"
                  step="5"
                  value={zoomScale}
                  onChange={e => setZoomScale(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '8px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '16px' }}>
                  <span>70%</span>
                  <span>100%</span>
                  <span>130%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{zoomScale}%</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => alert(`View scale set to ${zoomScale}%`)}
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS INFORMATION (Company Management) */}
        {activeTabId === 'business' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Business Information</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Configure company legal credentials, bank account, and invoice prefixes.
              </p>
            </div>

            {formError && (
              <div className="alert alert-error">
                {formError}
              </div>
            )}

            {companies.map(company => {
              const draft = drafts[company.id] ?? toCompanyDraft(company);
              return (
                <div key={company.id} className="card" style={{ padding: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{company.company_name}</div>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>Prefix: {company.invoice_prefix}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sale btn-sm"
                      disabled={savingId === company.id}
                      onClick={() => saveCompany(company.id)}
                    >
                      <Save size={14} />
                      <span>{savingId === company.id ? 'Saving...' : savedId === company.id ? 'Saved ✓' : 'Save Changes'}</span>
                    </button>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Company Name *</label>
                      <input
                        className="form-input"
                        value={draft.company_name ?? ''}
                        onChange={e => updateDraft(company.id, 'company_name', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GST Number</label>
                      <input
                        className="form-input"
                        value={draft.gst_number ?? ''}
                        onChange={e => updateDraft(company.id, 'gst_number', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-input"
                        value={draft.phone ?? ''}
                        onChange={e => updateDraft(company.id, 'phone', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={draft.email ?? ''}
                        onChange={e => updateDraft(company.id, 'email', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={draft.address ?? ''}
                        onChange={e => updateDraft(company.id, 'address', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Invoice Prefix *</label>
                      <input
                        className="form-input"
                        value={draft.invoice_prefix ?? ''}
                        onChange={e => updateDraft(company.id, 'invoice_prefix', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <input
                        className="form-input"
                        value={draft.bank_name ?? ''}
                        onChange={e => updateDraft(company.id, 'bank_name', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Account Holder</label>
                      <input
                        className="form-input"
                        value={draft.account_holder ?? ''}
                        onChange={e => updateDraft(company.id, 'account_holder', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input
                        className="form-input"
                        value={draft.account_number ?? ''}
                        onChange={e => updateDraft(company.id, 'account_number', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">IFSC Code</label>
                      <input
                        className="form-input"
                        value={draft.ifsc_code ?? ''}
                        onChange={e => updateDraft(company.id, 'ifsc_code', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: ABOUT LEDGERA */}
        {activeTabId === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '1px', color: '#0f172a' }}>
                LEDGER<span style={{ color: '#e43b3b' }}>A</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Run Your Business Smarter
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>VERSION</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>1.0.0 (Commercial Edition)</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>DATABASE</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>SQLite Local High-Performance</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e40af' }}>
                Ledgera is designed for seamless retail, wholesale, distribution, and manufacturing businesses. All financial records and invoices are securely stored offline on this machine.
              </div>
            </div>
          </div>
        )}

        {/* OTHER TABS FALLBACK */}
        {activeTabId !== 'general' && activeTabId !== 'business' && activeTabId !== 'about' && (
          <div className="card" style={{ padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <Sliders size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              {settingsTabs.find(t => t.id === activeTabId)?.name} Settings
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              Preferences and rules for {settingsTabs.find(t => t.id === activeTabId)?.name.toLowerCase()} are currently set to standard defaults.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
