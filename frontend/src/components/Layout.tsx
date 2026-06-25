import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
  ChevronDown,
  Bell,
  HelpCircle,
  Layers
} from 'lucide-react';

// --- Nav Items ---
const primaryNavItems = [
  { name: 'Dashboard',  path: '/',          icon: <LayoutDashboard size={16} /> },
  { name: 'Customers',  path: '/customers', icon: <Users size={16} /> },
  { name: 'Products',   path: '/products',  icon: <Package size={16} /> },
];

const transactionNavItems = [
  { name: 'Quotations', path: '/quotations', icon: <FileText size={16} />,    soon: true },
  { name: 'Invoices',   path: '/invoices',   icon: <Receipt size={16} />,     soon: true },
  { name: 'Payments',   path: '/payments',   icon: <CreditCard size={16} />,  soon: true },
  { name: 'Reports',    path: '/reports',    icon: <BarChart3 size={16} />,    soon: true },
];

const COMPANIES = ['Able Plastics', 'Relative Plastics'];

export const Layout: React.FC = () => {
  const location = useLocation();
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const getPageTitle = () => {
    const all = [...primaryNavItems, ...transactionNavItems];
    const found = all.find(i => {
      if (i.path === '/') return location.pathname === '/';
      return location.pathname.startsWith(i.path);
    });
    return found?.name ?? 'Dashboard';
  };

  const isItemActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">
            <span>LEDGER</span>A
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <span className="sidebar-section-label">Main</span>
          </div>

          {primaryNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={() => `sidebar-item ${isItemActive(item.path) ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}

          <div className="sidebar-section" style={{ marginTop: '16px' }}>
            <span className="sidebar-section-label">Transactions</span>
          </div>

          {transactionNavItems.map(item => (
            <button
              key={item.path}
              className="sidebar-item"
              disabled
              style={{ opacity: 0.6, cursor: 'default' }}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.name}
              <span className="sidebar-item-soon">Soon</span>
            </button>
          ))}
        </nav>

        {/* Footer: Settings */}
        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={() => `sidebar-item ${isItemActive('/settings') ? 'active' : ''}`}
          >
            <span className="sidebar-item-icon"><Settings size={16} /></span>
            Settings
          </NavLink>
        </div>
      </aside>

      {/* ── Body ── */}
      <div className="app-body">
        {/* Top Header */}
        <header className="app-header">
          {/* Company Selector */}
          <div style={{ position: 'relative' }}>
            <button
              className="header-company-selector"
              onClick={() => setShowCompanyMenu(v => !v)}
            >
              <Building2 size={14} style={{ color: 'var(--primary-600)' }} />
              <span>{selectedCompany}</span>
              <ChevronDown size={13} style={{ opacity: 0.6 }} />
            </button>

            {showCompanyMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowCompanyMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: '#fff',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                  minWidth: '200px',
                  padding: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '6px 10px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: 'var(--gray-400)'
                  }}>
                    Switch Company
                  </div>
                  {COMPANIES.map(co => (
                    <button
                      key={co}
                      onClick={() => { setSelectedCompany(co); setShowCompanyMenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        background: selectedCompany === co ? 'var(--primary-50)' : 'transparent',
                        color: selectedCompany === co ? 'var(--primary-600)' : 'var(--gray-700)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: selectedCompany === co ? 600 : 400,
                        textAlign: 'left',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      <Layers size={14} />
                      {co}
                      {selectedCompany === co && (
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--primary-600)' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Page breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>/</span>
            <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--gray-700)' }}>{getPageTitle()}</span>
          </div>

          <div className="header-spacer" />

          <button className="header-icon-btn" title="Help">
            <HelpCircle size={18} />
          </button>
          <button className="header-icon-btn" title="Notifications">
            <Bell size={18} />
          </button>
          <div className="header-avatar" title="Profile">
            A
          </div>
        </header>

        {/* Main content area */}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
