import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Building2,
  BarChart3,
  RefreshCw,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Check,
  MoreVertical,
  Phone,
  MessageCircle,
  ExternalLink,
  Crown,
  Layers
} from 'lucide-react';
import { useCompanyStore } from '../store/companyStore';

interface NavGroupState {
  parties: boolean;
  items: boolean;
  sale: boolean;
  purchase: boolean;
  grow: boolean;
  cashBank: boolean;
  sync: boolean;
  utilities: boolean;
}

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState(false);
  const [openAnythingSearch, setOpenAnythingSearch] = useState('');

  const [expandedGroups, setExpandedGroups] = useState<NavGroupState>({
    parties: true,
    items: true,
    sale: true,
    purchase: false,
    grow: false,
    cashBank: false,
    sync: false,
    utilities: false,
  });

  const toggleGroup = (key: keyof NavGroupState) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    companies,
    selectedCompany,
    selectedCompanyId,
    fetchCompanies,
    setSelectedCompanyId
  } = useCompanyStore();

  useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length, fetchCompanies]);

  const isPathActive = (path: string, exact = false) => {
    if (exact || path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleOpenAnything = (e: React.FormEvent) => {
    e.preventDefault();
    const query = openAnythingSearch.trim().toLowerCase();
    if (!query) return;

    if (query.includes('sale') || query.includes('inv')) {
      navigate('/invoices');
    } else if (query.includes('party') || query.includes('cust')) {
      navigate('/customers');
    } else if (query.includes('item') || query.includes('prod')) {
      navigate('/products');
    } else if (query.includes('exp') || query.includes('purch')) {
      navigate('/expenses');
    } else if (query.includes('rep')) {
      navigate('/reports');
    } else if (query.includes('set') || query.includes('comp')) {
      navigate('/settings');
    } else {
      navigate(`/customers?search=${encodeURIComponent(query)}`);
    }
    setOpenAnythingSearch('');
  };

  return (
    <div className="app-shell">
      {/* ── Vyapar-Style Sidebar ── */}
      <aside className="sidebar" style={{ width: '228px', minWidth: '228px' }}>
        {/* Brand Header */}
        <div className="sidebar-brand" style={{ height: '52px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Ledgera Logo / Icon */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #e43b3b, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              boxShadow: '0 2px 5px rgba(228, 59, 59, 0.4)'
            }}>
              L
            </div>
            <div>
              <span className="sidebar-brand-name" style={{ fontSize: '16px', letterSpacing: '1px' }}>
                LEDGER<span>A</span>
              </span>
            </div>
          </div>
        </div>

        {/* Global Search: "Open Anything (Ctrl+F)" */}
        <div className="sidebar-search">
          <form onSubmit={handleOpenAnything}>
            <div className="sidebar-search-inner">
              <Search size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
              <input
                type="text"
                placeholder="Open Anything (Ctrl+F)"
                value={openAnythingSearch}
                onChange={e => setOpenAnythingSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Navigation Accordion */}
        <nav className="sidebar-nav" style={{ padding: '4px 8px 12px' }}>
          {/* 1. Home / Dashboard */}
          <NavLink
            to="/"
            end
            className={() => `sidebar-item ${isPathActive('/', true) ? 'active' : ''}`}
            style={{ marginBottom: '2px', padding: '8px 10px', fontSize: '13px' }}
          >
            <span className="sidebar-item-icon"><Home size={15} /></span>
            <span>Home</span>
          </NavLink>

          {/* 2. Parties */}
          <div className="sidebar-group">
            <button
              className={`sidebar-group-header ${isPathActive('/customers') || isPathActive('/parties') ? 'active' : ''}`}
              onClick={() => toggleGroup('parties')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={15} style={{ opacity: 0.8 }} />
                <span>Parties</span>
              </div>
              {expandedGroups.parties ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.parties && (
              <div className="sidebar-group-sublist">
                <NavLink
                  to="/customers"
                  className={() => `sidebar-sub-item ${isPathActive('/customers') || isPathActive('/parties') ? 'active' : ''}`}
                >
                  <span>Party Details</span>
                </NavLink>
                <div
                  className="sidebar-sub-item"
                  style={{ opacity: 0.75, cursor: 'pointer' }}
                  onClick={() => alert('WhatsApp Connect enables direct PDF invoice sharing with customers.')}
                >
                  <span>WhatsApp Connect</span>
                  <span className="sidebar-sub-badge-new">NEW</span>
                </div>
                <div
                  className="sidebar-sub-item"
                  style={{ opacity: 0.6, cursor: 'default' }}
                >
                  <span>Ledgera Network</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Items */}
          <div className="sidebar-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                className={`sidebar-group-header ${isPathActive('/products') ? 'active' : ''}`}
                onClick={() => toggleGroup('items')}
                style={{ flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={15} style={{ opacity: 0.8 }} />
                  <span>Items</span>
                </div>
                {expandedGroups.items ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/products/add'); }}
                title="Add Item"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9aa1bc',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            {expandedGroups.items && (
              <div className="sidebar-group-sublist">
                <NavLink
                  to="/products"
                  className={() => `sidebar-sub-item ${isPathActive('/products') ? 'active' : ''}`}
                >
                  <span>Products</span>
                </NavLink>
                <NavLink
                  to="/products?tab=services"
                  className="sidebar-sub-item"
                >
                  <span>Services</span>
                </NavLink>
                <NavLink
                  to="/products?tab=category"
                  className="sidebar-sub-item"
                >
                  <span>Category</span>
                </NavLink>
                <NavLink
                  to="/products?tab=units"
                  className="sidebar-sub-item"
                >
                  <span>Units</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. Sale */}
          <div className="sidebar-group">
            <button
              className={`sidebar-group-header ${isPathActive('/invoices') ? 'active' : ''}`}
              onClick={() => toggleGroup('sale')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={15} style={{ opacity: 0.8 }} />
                <span>Sale</span>
              </div>
              {expandedGroups.sale ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.sale && (
              <div className="sidebar-group-sublist">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
                  <NavLink
                    to="/invoices"
                    className={() => `sidebar-sub-item ${isPathActive('/invoices') ? 'active' : ''}`}
                    style={{ flex: 1 }}
                  >
                    <span>Sale Invoices</span>
                  </NavLink>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/invoices/new'); }}
                    title="Add Sale Invoice"
                    style={{ background: 'transparent', border: 'none', color: '#9aa1bc', cursor: 'pointer' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Estimate / Quotation</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Payment-In</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Sale Order</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Delivery Challan</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Sale Return / Cr. Note</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Ledgera POS</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Purchase & Expense */}
          <div className="sidebar-group">
            <button
              className={`sidebar-group-header ${isPathActive('/expenses') || isPathActive('/purchases') ? 'active' : ''}`}
              onClick={() => toggleGroup('purchase')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={15} style={{ opacity: 0.8 }} />
                <span>Purchase & Expense</span>
              </div>
              {expandedGroups.purchase ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.purchase && (
              <div className="sidebar-group-sublist">
                <NavLink
                  to="/purchases"
                  className={() => `sidebar-sub-item ${isPathActive('/purchases') ? 'active' : ''}`}
                >
                  <span>Purchase Bills</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </NavLink>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Payment-Out</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <NavLink
                  to="/expenses"
                  className={() => `sidebar-sub-item ${isPathActive('/expenses') ? 'active' : ''}`}
                >
                  <span>Expenses</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </NavLink>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Purchase Order</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Purchase Return / Dr. Note</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
              </div>
            )}
          </div>

          {/* 6. Grow Your Business */}
          <div className="sidebar-group">
            <button
              className="sidebar-group-header"
              onClick={() => toggleGroup('grow')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={15} style={{ opacity: 0.8 }} />
                <span>Grow Your Business</span>
              </div>
              {expandedGroups.grow ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.grow && (
              <div className="sidebar-group-sublist">
                <div className="sidebar-sub-item" style={{ opacity: 0.75, cursor: 'pointer' }} onClick={() => navigate('/settings?tab=business')}>
                  <span>Google Profile Manager</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  <span>Marketing Tools</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  <span>WhatsApp Marketing</span>
                </div>
              </div>
            )}
          </div>

          {/* 7. Cash & Bank */}
          <div className="sidebar-group">
            <button
              className={`sidebar-group-header ${isPathActive('/cash-bank') ? 'active' : ''}`}
              onClick={() => toggleGroup('cashBank')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={15} style={{ opacity: 0.8 }} />
                <span>Cash & Bank</span>
              </div>
              {expandedGroups.cashBank ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.cashBank && (
              <div className="sidebar-group-sublist">
                <NavLink
                  to="/cash-bank"
                  className={() => `sidebar-sub-item ${isPathActive('/cash-bank') ? 'active' : ''}`}
                >
                  <span>Bank Accounts</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </NavLink>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Cash In Hand</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Cheques</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.65, cursor: 'default' }}>
                  <span>Loan Accounts</span>
                  <Plus size={12} style={{ opacity: 0.5 }} />
                </div>
              </div>
            )}
          </div>

          {/* 8. Reports */}
          <NavLink
            to="/reports"
            className={() => `sidebar-item ${isPathActive('/reports') ? 'active' : ''}`}
            style={{ padding: '8px 10px', fontSize: '13px' }}
          >
            <span className="sidebar-item-icon"><BarChart3 size={15} /></span>
            <span>Reports</span>
          </NavLink>

          {/* 9. Sync, Share & Backup */}
          <div className="sidebar-group">
            <button
              className="sidebar-group-header"
              onClick={() => toggleGroup('sync')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={15} style={{ opacity: 0.8 }} />
                <span>Sync, Share & Backup</span>
              </div>
              {expandedGroups.sync ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.sync && (
              <div className="sidebar-group-sublist">
                <div className="sidebar-sub-item" style={{ opacity: 0.75, cursor: 'pointer' }} onClick={() => navigate('/settings?tab=backup')}>
                  <span>Auto Backup</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.75, cursor: 'pointer' }} onClick={() => navigate('/settings?tab=backup')}>
                  <span>Backup To Computer</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.75, cursor: 'pointer' }} onClick={() => navigate('/settings?tab=backup')}>
                  <span>Restore Backup</span>
                </div>
              </div>
            )}
          </div>

          {/* 10. Utilities */}
          <div className="sidebar-group">
            <button
              className={`sidebar-group-header ${isPathActive('/import') || isPathActive('/utilities') ? 'active' : ''}`}
              onClick={() => toggleGroup('utilities')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wrench size={15} style={{ opacity: 0.8 }} />
                <span>Utilities</span>
              </div>
              {expandedGroups.utilities ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.utilities && (
              <div className="sidebar-group-sublist">
                <NavLink
                  to="/import"
                  className={() => `sidebar-sub-item ${isPathActive('/import') ? 'active' : ''}`}
                >
                  <span>Import Items</span>
                </NavLink>
                <div className="sidebar-sub-item" style={{ opacity: 0.75, cursor: 'pointer' }} onClick={() => navigate('/settings?tab=business')}>
                  <span>Set Up My Business</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  <span>Barcode Generator</span>
                </div>
                <div className="sidebar-sub-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  <span>Close Financial Year</span>
                </div>
              </div>
            )}
          </div>

          {/* 11. Settings */}
          <NavLink
            to="/settings"
            className={() => `sidebar-item ${isPathActive('/settings') ? 'active' : ''}`}
            style={{ padding: '8px 10px', fontSize: '13px' }}
          >
            <span className="sidebar-item-icon"><Settings size={15} /></span>
            <span>Settings</span>
          </NavLink>

          {/* 12. Plans & Pricing */}
          <div
            className="sidebar-item"
            style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer' }}
            onClick={() => navigate('/settings?tab=about')}
          >
            <span className="sidebar-item-icon"><Crown size={15} style={{ color: '#fbbf24' }} /></span>
            <span>Plans & Pricing</span>
          </div>
        </nav>

        {/* Sidebar Footer Card: Commercial Edition */}
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="sidebar-plan-card" style={{ margin: '0 0 8px 0' }}>
            <div className="sidebar-plan-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Commercial License</span>
              <span style={{ fontSize: '10px', color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: '4px' }}>Active</span>
            </div>
            <div className="sidebar-progress-bar">
              <div className="sidebar-progress-fill" style={{ width: '100%' }} />
            </div>
            <button
              className="sidebar-btn-premium"
              onClick={() => navigate('/settings?tab=about')}
            >
              <span>Ledgera v1.0.0</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Bottom Company Selector Pill */}
          <button
            className="sidebar-company-footer-btn"
            onClick={() => setShowCompanyMenu(v => !v)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Building2 size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {selectedCompany?.company_name ?? 'My Company'}
              </span>
            </div>
            <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
          </button>
        </div>
      </aside>

      {/* ── Main Application Body ── */}
      <div className="app-body">
        {/* Vyapar-Style Top Header Bar */}
        <header className="vyapar-top-header">
          {/* Company Name with Live Indicator Dot */}
          <div style={{ position: 'relative' }}>
            <div
              className="header-company-name-indicator"
              onClick={() => setShowCompanyMenu(v => !v)}
              title="Click to Switch Company"
            >
              <div className="header-live-dot" />
              <span>{selectedCompany?.company_name || 'Select Business'}</span>
              <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </div>

            {/* Company Dropdown Menu */}
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
                  background: '#ffffff',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 50,
                  minWidth: '220px',
                  padding: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '8px 12px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: 'var(--gray-400)'
                  }}>
                    Select Active Company
                  </div>
                  {companies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => { setSelectedCompanyId(company.id); setShowCompanyMenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '9px 12px',
                        background: selectedCompanyId === company.id ? 'var(--primary-50)' : 'transparent',
                        color: selectedCompanyId === company.id ? 'var(--primary-600)' : 'var(--gray-700)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: selectedCompanyId === company.id ? 600 : 400,
                        textAlign: 'left',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      <Layers size={14} />
                      <span style={{ flex: 1 }}>{company.company_name}</span>
                      {selectedCompanyId === company.id && (
                        <Check size={14} style={{ color: 'var(--primary-600)' }} />
                      )}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => { navigate('/settings?tab=business'); setShowCompanyMenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        color: 'var(--primary-600)',
                        fontWeight: 600
                      }}
                    >
                      <Plus size={13} />
                      <span>Manage Companies in Settings</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Customer Support Pill */}
          <div className="header-support-info" style={{ marginLeft: '12px' }}>
            <span>Customer Support :</span>
            <span className="header-support-phone">📞 +91-9333911911</span>
            <span style={{ color: 'var(--gray-400)' }}>|</span>
            <span
              className="header-support-pill"
              onClick={() => alert('Ledgera Live Support is ready to assist you. Documentation and helpdesk are built in.')}
            >
              Get Instant Online Support
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Action Buttons: Red "Add Sale" & Blue "Add Purchase" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-sale"
              onClick={() => navigate('/invoices/new')}
            >
              <Plus size={15} />
              <span>Add Sale</span>
            </button>

            <button
              className="btn btn-purchase"
              onClick={() => navigate('/expenses/new')}
            >
              <Plus size={15} />
              <span>Add Purchase</span>
            </button>

            {/* Quick Action (+) Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary btn-icon-sm"
                style={{ borderRadius: 'var(--radius-full)', width: '32px', height: '32px' }}
                onClick={() => setShowQuickCreateMenu(v => !v)}
                title="Quick Add"
              >
                <Plus size={16} />
              </button>

              {showQuickCreateMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowQuickCreateMenu(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50,
                    minWidth: '180px',
                    padding: '6px'
                  }}>
                    <button
                      onClick={() => { navigate('/invoices/new'); setShowQuickCreateMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <Receipt size={14} style={{ color: '#e43b3b' }} />
                      <span>New Sale Invoice</span>
                    </button>
                    <button
                      onClick={() => { navigate('/customers/add'); setShowQuickCreateMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <Users size={14} style={{ color: '#1e60db' }} />
                      <span>New Customer / Party</span>
                    </button>
                    <button
                      onClick={() => { navigate('/products/add'); setShowQuickCreateMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <Package size={14} style={{ color: '#10b981' }} />
                      <span>New Item / Product</span>
                    </button>
                    <button
                      onClick={() => { navigate('/expenses/new'); setShowQuickCreateMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <ShoppingCart size={14} style={{ color: '#d97706' }} />
                      <span>New Expense Record</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Settings Gear */}
            <button
              className="btn btn-ghost btn-icon-sm"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="app-main" style={{ padding: location.pathname === '/' || location.pathname.startsWith('/customers') || location.pathname.startsWith('/products') || location.pathname === '/reports' ? 0 : '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
