import React, { useEffect, useState } from 'react';
import {
  Building2,
  CalendarDays,
  Percent,
  Receipt,
  Database,
  Info,
  ChevronRight,
  Save,
  Upload
} from 'lucide-react';
import { UpdateCompanyInput } from '../../../shared/types/company';
import { useCompanyStore } from '../store/companyStore';
import { getErrorMessage } from '../utils/errors';

const settingsTabs = [
  { name: 'Business Information', path: '/settings/business', icon: <Building2 size={15} /> },
  { name: 'Financial Year', path: '/settings/fiscal', icon: <CalendarDays size={15} /> },
  { name: 'GST Settings', path: '/settings/gst', icon: <Percent size={15} /> },
  { name: 'Invoice Settings', path: '/settings/invoice', icon: <Receipt size={15} /> },
  { name: 'Backup & Restore', path: '/settings/backup', icon: <Database size={15} /> },
  { name: 'Import Data', path: '/settings/import', icon: <Upload size={15} /> },
  { name: 'About Ledgera', path: '/settings/about', icon: <Info size={15} /> },
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

const AboutPanel: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div>
      <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '2px', color: 'var(--gray-900)' }}>
        LEDGER<span style={{ color: 'var(--primary-600)' }}>A</span>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
        Run Your Business Smarter
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {[
        { label: 'Version', value: '1.0.0' },
        { label: 'Build', value: 'Phase 4' },
        { label: 'Platform', value: 'Electron + React' },
        { label: 'Database', value: 'SQLite (Local)' },
      ].map(row => (
        <div key={row.label} style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: '4px' }}>{row.label}</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-800)' }}>{row.value}</div>
        </div>
      ))}
    </div>
    <div style={{ padding: '14px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', fontSize: '13px', color: 'var(--primary-600)' }}>
      Built for Able Plastics and Relative Plastics. All data is stored locally on this device.
    </div>
  </div>
);

const PlaceholderPanel: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: '12px', textAlign: 'center' }}>
    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)' }}>
      <Info size={24} />
    </div>
    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-600)' }}>{name}</div>
    <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>This section will be available in a future update.</div>
  </div>
);

const ImportDataPanel: React.FC = () => (
  <div style={{ padding: '24px 0' }}>
    <div className="card card-padded" style={{ boxShadow: 'none' }}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-800)' }}>EqSoft Import (Coming Soon)</div>
      <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '6px' }}>The importer is intentionally not enabled in this release.</div>
    </div>
  </div>
);

const BusinessInformationPanel: React.FC = () => {
  const { companies, loading, error, fetchCompanies, updateCompany } = useCompanyStore();
  const [drafts, setDrafts] = useState<Record<number, UpdateCompanyInput>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  if (loading && companies.length === 0) {
    return <div className="loading-state" style={{ minHeight: '260px' }}>Loading business information...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(error || formError) && (
        <div className="alert alert-error">
          {formError || error}
        </div>
      )}

      {companies.map(company => {
        const draft = drafts[company.id] ?? toCompanyDraft(company);
        return (
          <div key={company.id} className="card card-padded" style={{ boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-100)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)' }}>{company.company_name}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>Business profile and invoice footer details</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={savingId === company.id}
                onClick={() => saveCompany(company.id)}
              >
                <Save size={15} />
                {savingId === company.id ? 'Saving...' : savedId === company.id ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Company Name <span className="required">*</span></label>
                <input
                  required
                  className="form-input"
                  value={draft.company_name ?? ''}
                  onChange={event => updateDraft(company.id, 'company_name', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input
                  className="form-input"
                  value={draft.gst_number ?? ''}
                  onChange={event => updateDraft(company.id, 'gst_number', event.target.value)}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={draft.phone ?? ''}
                  onChange={event => updateDraft(company.id, 'phone', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={draft.email ?? ''}
                  onChange={event => updateDraft(company.id, 'email', event.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  value={draft.address ?? ''}
                  onChange={event => updateDraft(company.id, 'address', event.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Prefix <span className="required">*</span></label>
                <input
                  required
                  className="form-input"
                  value={draft.invoice_prefix ?? ''}
                  onChange={event => updateDraft(company.id, 'invoice_prefix', event.target.value)}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  className="form-input"
                  value={draft.bank_name ?? ''}
                  onChange={event => updateDraft(company.id, 'bank_name', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Holder</label>
                <input
                  className="form-input"
                  value={draft.account_holder ?? ''}
                  onChange={event => updateDraft(company.id, 'account_holder', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  className="form-input"
                  value={draft.account_number ?? ''}
                  onChange={event => updateDraft(company.id, 'account_number', event.target.value)}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  className="form-input"
                  value={draft.ifsc_code ?? ''}
                  onChange={event => updateDraft(company.id, 'ifsc_code', event.target.value)}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/settings/business');

  const activeItem = settingsTabs.find(tab => tab.path === activeTab) ?? settingsTabs[0];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your business configuration and preferences</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', overflow: 'hidden', minHeight: '480px' }}>
        <div style={{ width: '220px', borderRight: '1px solid var(--gray-200)', padding: '8px', flexShrink: 0, background: 'var(--gray-50)' }}>
          {settingsTabs.map(tab => (
            <button
              key={tab.path}
              onClick={() => setActiveTab(tab.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13.5px',
                fontWeight: activeTab === tab.path ? 500 : 400,
                color: activeTab === tab.path ? 'var(--primary-600)' : 'var(--gray-600)',
                background: activeTab === tab.path ? 'var(--primary-50)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-family)',
                transition: 'all var(--transition-fast)',
                marginBottom: '1px',
              }}
            >
              <span style={{ opacity: activeTab === tab.path ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.name}
              {activeTab === tab.path && <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '24px', minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '20px' }}>
            {activeItem.name}
          </div>
          {activeTab === '/settings/business' && <BusinessInformationPanel />}
          {activeTab === '/settings/about' && <AboutPanel />}
          {activeTab === '/settings/import' && <ImportDataPanel />}
          {activeTab !== '/settings/business' && activeTab !== '/settings/about' && activeTab !== '/settings/import' && <PlaceholderPanel name={activeItem.name} />}
        </div>
      </div>
    </div>
  );
};
