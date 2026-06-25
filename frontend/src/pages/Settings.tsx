import React, { useState } from 'react';
import {
  Building2,
  CalendarDays,
  Percent,
  Receipt,
  Database,
  Info,
  ChevronRight
} from 'lucide-react';

const settingsTabs = [
  { name: 'Business Information', path: '/settings/business',  icon: <Building2 size={15} /> },
  { name: 'Financial Year',       path: '/settings/fiscal',    icon: <CalendarDays size={15} /> },
  { name: 'GST Settings',         path: '/settings/gst',       icon: <Percent size={15} /> },
  { name: 'Invoice Settings',     path: '/settings/invoice',   icon: <Receipt size={15} /> },
  { name: 'Backup & Restore',     path: '/settings/backup',    icon: <Database size={15} /> },
  { name: 'About Ledgera',        path: '/settings/about',     icon: <Info size={15} /> },
];

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
        { label: 'Version',  value: '1.0.0' },
        { label: 'Build',    value: 'Phase 3' },
        { label: 'Platform', value: 'Electron + React' },
        { label: 'Database', value: 'SQLite (Local)' },
      ].map(r => (
        <div key={r.label} style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: '4px' }}>{r.label}</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-800)' }}>{r.value}</div>
        </div>
      ))}
    </div>
    <div style={{ padding: '14px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', fontSize: '13px', color: 'var(--primary-600)' }}>
      Built for Able Plastics and Relative Plastics · All data is stored locally on this device.
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

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/settings/about');

  const activeItem = settingsTabs.find(t => t.path === activeTab) ?? settingsTabs[settingsTabs.length - 1];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your business configuration and preferences</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', overflow: 'hidden', minHeight: '480px' }}>
        {/* Sidebar Tabs */}
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

        {/* Panel */}
        <div style={{ flex: 1, padding: '24px', minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '20px' }}>
            {activeItem.name}
          </div>
          {activeTab === '/settings/about' ? <AboutPanel /> : <PlaceholderPanel name={activeItem.name} />}
        </div>
      </div>
    </div>
  );
};
