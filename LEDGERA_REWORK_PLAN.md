# LEDGERA — Complete Application Rework Plan

## Based on Vyapar Reference Screenshots Analysis

---

## 1. Screenshot Analysis Summary

| # | Screenshot | Screen | Key Elements |
|---|-----------|--------|--------------|
| 1 | 212413 | **Home/Dashboard** | Dark sidebar, Total Receivable/Payable cards, Sales chart (This Month), Quick report links, "Add Sale" + "Add Purchase" header buttons |
| 2 | 212436 | **Parties (Customers/Suppliers)** | Master-detail layout: left panel with party list + search, right panel showing party detail + transaction history table |
| 3 | 212443 | **Items (Products)** | Tab navigation (Products/Services/Category/Units), left panel item list, right panel item detail + transaction history |
| 4 | 212449 | **Sale > Sale Invoices** | Expanded Sale sidebar submenu (Sale Invoices, Estimate/Quotation, Proforma Invoice, Payment-In, Sale Order, Delivery Challan, Sale Return/Credit Note), Filter bar (This Month, date range, All Firms), Summary card (Total Sales Amount), Transactions table |
| 5 | 212455 | **Purchase & Expense** | Expanded submenu (Purchase Bills, Payment-Out, Expenses, Purchase Order, Purchase Return/Dr. Note), Empty state with CTA |
| 6 | 212504 | **Grow Your Business** | Google Profile Manager, Marketing Tools, WhatsApp Marketing, Online Store, Smart Ads — *NOT relevant for Ledgera* |
| 7 | 212509 | **Cash & Bank** | Submenu (Bank Accounts, Cash In Hand, Cheques, Loan Accounts), Feature cards, "Add Bank Account" CTA |
| 8 | 212523 | **Reports** | Categorized report list: Transaction reports (Sale, Purchase, Day book, All Transactions, Profit and Loss, Bill Wise Profit, Cash flow, Trial Balance, Balance Sheet), Party reports, GST reports |
| 9 | 212539 | **Sync, Share & Backup** | Staff access, sync features — *NOT relevant for Ledgera v1* |
| 10 | 212547 | **Utilities** | Import Items, Set Up My Business, Accountant Access, Barcode Generator, Update Items In Bulk, Import/Export features |
| 11 | 212516 | **Settings** | Left vertical tabs (General, Transaction, Print, Taxes & GST, Transaction Message, Party, Item, Service Reminders, Accounting, Multi Currency), Application settings, Multi Firm, Backup & History, More Transactions toggles |

---

## 2. Current Ledgera State vs Required State

### Existing Modules (Functional)
| Module | Status | Notes |
|--------|--------|-------|
| Dashboard | ✅ Working | Needs Vyapar-style layout (Receivable/Payable cards + chart) |
| Customers | ✅ Working | Needs master-detail layout like Parties screen |
| Products | ✅ Working | Needs tabs (Products/Services/Category/Units) + master-detail |
| Invoices (Sale) | ✅ Working | Needs Vyapar-style Sale submenu, filters, summary card |
| Expenses | ✅ Working | Needs integration under Purchase & Expense |
| Companies | ✅ Working | Move under Settings > Business Information |
| Reports | ✅ Working | Needs categorized sidebar layout |
| Settings | ✅ Working | Needs Vyapar-style left-tab layout with more sections |
| Import Data | ✅ Working | Keep as utility |

### Missing Modules (To Add Based on Screenshots)
| Module | Priority | Complexity |
|--------|----------|------------|
| Purchase Bills | High | Medium — mirror invoice system |
| Payment-In / Payment-Out | High | Medium — new payment tracking |
| Cash & Bank | Medium | Medium — new module |
| Suppliers (under Parties) | High | Low — extend customer module |

---

## 3. Sidebar Navigation Rework

### Current Sidebar
```
Dashboard → Customers → Products → Invoices → Expenses → Reports → Import Data → Settings
```

### New Sidebar (Vyapar-Inspired)
```
Home (Dashboard)
Parties ▸
  ├── Party Details (Customers + Suppliers)
Items ▸
  ├── (direct to Items page with tabs)
Sale ▸
  ├── Sale Invoices
  ├── Estimate/Quotation [planned]
  ├── Payment-In [planned]
  ├── Sale Return [planned]
Purchase & Expense ▸
  ├── Purchase Bills [planned]
  ├── Payment-Out [planned]
  ├── Expenses
Cash & Bank ▸
  ├── Bank Accounts [planned]
  ├── Cash In Hand [planned]
Reports
Utilities ▸
  ├── Import Data
Settings
```

---

## 4. Design System Changes

### Sidebar
- **Current**: Dark sidebar (#0d1117), 220px wide, flat items
- **Required**: Dark navy sidebar (#1a1a2e / #16213e), ~215px, expandable/collapsible groups with chevrons, active item highlight with left yellow/green accent bar, "+" icons for quick-add on submenu items

### Header
- **Current**: White header with company selector, breadcrumb, Help/Bell/Avatar
- **Required**: Business name display area (center-left), prominent "Add Sale" (red) + "Add Purchase" (blue) action buttons (top-right), keep company selector

### Color Palette Update
- Primary action (Add Sale): Red/Coral (#e74c3c)
- Secondary action (Add Purchase): Blue (#3498db) 
- Sidebar bg: Dark navy (#1a1a2e)
- Sidebar active: Left accent bar + highlight background
- Keep existing neutral grays and form styling

### Layout Patterns
- **Master-Detail**: For Parties, Items — left list panel (30-40%), right detail panel (60-70%)
- **List with Summary**: For Sale Invoices — filter bar → summary card → transactions table
- **Categorized List**: For Reports — sidebar categories with clickable report names
- **Tab Navigation**: For Items (Products/Services/Category/Units)

---

## 5. Implementation Order

### Phase 3A — Application Shell (Layout, Sidebar, Header)
1. Rework sidebar with collapsible menu groups
2. Rework header with prominent action buttons
3. Update CSS design tokens for Vyapar-like colors
4. Add collapsible sidebar group component

### Phase 3B — Dashboard Rework
1. Receivable/Payable summary cards (top)
2. Sales chart with period selector (This Month dropdown)
3. Quick report links section (bottom)

### Phase 4A — Parties Module (Customers → Parties)
1. Create master-detail layout
2. Left panel: search + party list with amounts
3. Right panel: party detail + transactions table
4. Maintain existing customer CRUD backend

### Phase 4B — Items Module (Products → Items)
1. Add tab navigation (Products / Services / Category / Units)
2. Create master-detail layout
3. Left panel: search + item list with quantities
4. Right panel: item detail (prices, stock) + transactions table

### Phase 4C — Sale Module Rework
1. Expand sidebar submenu for Sale
2. Sale Invoices page with filter bar + summary card + table
3. Preserve existing invoice CRUD

### Phase 4D — Purchase & Expense Module
1. Create Purchase & Expense sidebar group
2. Expenses page rework with Vyapar-style layout
3. Purchase Bills structure (initially with empty state CTA)

### Phase 4E — Reports Rework
1. Create categorized report sidebar
2. Transaction Reports section
3. Party Reports section
4. Maintain existing report data

### Phase 4F — Settings Rework
1. Left vertical tab navigation
2. General settings section
3. Transaction settings section
4. Business Information (Companies) integration
5. Additional settings sections

### Phase 5 — Integration & Testing
1. Verify all navigation routes
2. Test all forms and CRUD operations
3. Verify database operations
4. Fix any UI inconsistencies

---

## 6. Database Changes

### No Destructive Changes Required
All existing tables and data will be preserved:
- `companies` — no changes
- `customers` — no changes  
- `products` — no changes
- `invoices` + `invoice_items` + `invoice_history` — no changes
- `expenses` — no changes

### Future Additive Changes (When Features Are Implemented)
- `suppliers` table (or add `party_type` to customers)
- `payments` table (for Payment-In/Payment-Out)
- `bank_accounts` table
- `purchase_bills` + `purchase_items` tables

*These will be added only when the corresponding features are actively implemented.*

---

## 7. Files to Modify

### Core Layout Files
- `frontend/src/components/Layout.tsx` — Complete sidebar + header rework
- `frontend/src/index.css` — Updated design tokens + new component styles
- `frontend/src/App.tsx` — Updated routes for new navigation structure

### Page Files to Rework
- `frontend/src/pages/Dashboard.tsx` — Vyapar-style dashboard
- `frontend/src/pages/customers/CustomerList.tsx` → Master-detail "Parties" layout
- `frontend/src/pages/products/ProductList.tsx` → Tabbed "Items" layout  
- `frontend/src/pages/invoices/InvoiceList.tsx` → Sale Invoices with filters
- `frontend/src/pages/expenses/ExpenseList.tsx` → Under Purchase & Expense
- `frontend/src/pages/reports/Reports.tsx` → Categorized report list
- `frontend/src/pages/Settings.tsx` → Vyapar-style tabbed settings

### Files to Preserve (No Changes Needed)
- All backend files (routes, services, repositories, schemas)
- All API files
- All store files
- All shared types
- Database schema and initialization
- Invoice form and view functionality
- Customer/Product/Expense forms
- Import data functionality
- PDF generation

---

## 8. Key Design Decisions

1. **Parties = Customers + Suppliers**: Single module with type filter, matching Vyapar
2. **Items = Products**: Rename for consistency, add tabs for future Services/Category/Units
3. **Sale submenu**: Sale Invoices is the active page, other items shown as planned
4. **Purchase & Expense grouped**: Single sidebar section, matching Vyapar
5. **Reports with categories**: Left panel categorized list, right panel report display
6. **Settings with vertical tabs**: Left tab navigation, not top tabs
7. **No "Grow Your Business"**: Not relevant for Ledgera
8. **No "Sync & Backup"**: Not relevant for Ledgera v1
9. **Utilities simplified**: Import Data only for now

---

*Plan created: November 1, 2026*
*Ready for Phase 3 implementation*
