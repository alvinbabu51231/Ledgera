# Ledgera — Simplified MVP Scope

> **Version:** 1.0
> **Date:** June 2026
> **Reference:** docs/software_blueprint.md
> **Audience:** Development team / Owner

---

## Table of Contents

1. [MVP Philosophy](#1-mvp-philosophy)
2. [Final MVP Modules](#2-final-mvp-modules)
3. [Development Phases](#3-development-phases)
4. [Simplified Database Tables](#4-simplified-database-tables)
5. [MVP Screen List](#5-mvp-screen-list)
6. [Features Postponed to Later](#6-features-postponed-to-later)
7. [Recommended Architecture](#7-recommended-architecture)
8. [Suggested Project Structure](#8-suggested-project-structure)
9. [Suggested API Modules](#9-suggested-api-modules)
10. [Suggested Desktop Application Modules](#10-suggested-desktop-application-modules)

---

## 1. MVP Philosophy

This MVP is designed for a **single owner managing two comb manufacturing companies** with 8 employees. The guiding principle is:

> **"Replace the paper register. Nothing more."**

### Core Constraints

| Constraint                  | Decision                                              |
|-----------------------------|-------------------------------------------------------|
| Primary user                | Owner only (no multi-user for MVP)                    |
| Platform                    | Desktop-first web app (Vyapar-style)                  |
| Complexity                  | No enterprise features, no automation in Phase 1      |
| Data entry                  | Manual — owner enters everything                      |
| Integrations                | None for MVP (no GST portal, no Tally, no WhatsApp)   |
| Production planning         | Status tracking only — no BOM, no auto stock deduction|
| Accounting                  | Basic ledger only — no double-entry bookkeeping       |

### What "Simple" Means Here

- Every screen must be usable by a non-technical owner within 2 minutes of first use.
- Forms should have 5–8 fields max. Avoid optional fields on the main form.
- No wizards. No multi-step flows for basic data entry.
- One click to get to any critical action (add order, record payment, view outstanding).

---

## 2. Final MVP Modules

Eight modules. No more, no less.

| # | Module                   | Purpose                                               | Priority |
|---|--------------------------|-------------------------------------------------------|----------|
| 1 | **Company & Settings**   | Switch between 2 companies; store basic info          | P0       |
| 2 | **Customer Management**  | Master list of customers with contact details         | P0       |
| 3 | **Supplier Management**  | Master list of suppliers with contact details         | P0       |
| 4 | **Products & Items**     | Finished goods and raw materials list with prices     | P0       |
| 5 | **Orders & Invoicing**   | Create orders → generate invoice → record payment     | P0       |
| 6 | **Production Jobs**      | Track what is being made and its current status       | P1       |
| 7 | **Expenses**             | Record daily business expenses by category            | P1       |
| 8 | **Dashboard & Reports**  | Summary view + 3 essential reports                    | P1       |

> **P0** = Must have at launch. **P1** = Must have within first month.

### What Each Module Does (Simplified)

#### Module 1 — Company & Settings
- Store name, address, GSTIN, logo for both companies.
- Switch active company from top navigation bar.
- Configure invoice number prefix (e.g., `INV-2026-`).
- Configure expense categories (editable list).

#### Module 2 — Customer Management
- Add / edit customers with: Name, Phone, Address, GSTIN, Credit Days.
- View a customer's total outstanding balance at a glance.
- View all orders and invoices linked to a customer.

#### Module 3 — Supplier Management
- Add / edit suppliers with: Name, Phone, Address, GSTIN.
- View a supplier's total outstanding payable at a glance.
- View all purchase bills linked to a supplier.

#### Module 4 — Products & Items
- Maintain a list of finished comb products: Name, Unit (Pcs/Dozen/Box), Sale Price, HSN Code, GST %.
- Maintain a list of raw materials: Name, Unit, Current Stock (manually entered).
- No automatic stock calculations in MVP — owner updates stock manually.

#### Module 5 — Orders & Invoicing
This is the **core module**. It covers the full sales cycle:
- Create a customer order with line items (product, qty, price).
- Update order status manually: Pending → In Production → Ready → Dispatched.
- Generate a sales invoice from an order with one click.
- Print / export invoice as PDF.
- Record payment against an invoice (amount, date, mode).
- View each customer's outstanding balance and payment history.
- Record supplier purchase bill and payment against it.

#### Module 6 — Production Jobs
- Create a production job linked to an order.
- Set planned quantity and target date.
- Update job status: Pending → In Progress → Done.
- No BOM, no automatic material deduction in MVP.
- Owner uses this as a visual tracker replacing the physical job register.

#### Module 7 — Expenses
- Record a business expense: Date, Category, Amount, Paid To, Payment Mode.
- Categories are configurable (Wages, Freight, Utilities, Consumables, Rent, Other).
- View a list of all expenses filtered by date range or category.

#### Module 8 — Dashboard & Reports
**Dashboard KPIs (always visible):**
- Today's collections
- Total customer outstanding (receivable)
- Total supplier outstanding (payable)
- Open orders count
- Expenses this month

**3 Essential Reports:**
1. **Sales Register** — All invoices in a date range with totals.
2. **Outstanding Report** — Customer-wise and supplier-wise balance with last payment date.
3. **Expense Summary** — Total by category for a selected month.

All reports must be printable / exportable as PDF.

---

## 3. Development Phases

### Phase 1 — Foundation (Weeks 1–4)
**Goal:** Get the owner off paper for daily sales operations.

| Task                                 | Description                                     |
|--------------------------------------|-------------------------------------------------|
| Project setup                        | Initialize tech stack, DB, auth                 |
| Company & Settings module            | Company info, switcher, settings                |
| Customer Management                  | Add/edit/list customers                         |
| Supplier Management                  | Add/edit/list suppliers                         |
| Products & Items                     | Add/edit/list products and raw materials        |
| Orders — Create & List               | New order with line items, order list view      |
| Invoicing — Generate & Print         | Invoice from order, PDF export                  |
| Payment Recording (Customer)         | Record payment against invoice                  |
| Customer Outstanding View            | Balance per customer, ledger view               |

**Deliverable:** Owner can create an order, generate an invoice, and see who owes money.

---

### Phase 2 — Purchase & Expenses (Weeks 5–6)
**Goal:** Track money going out — to suppliers and as expenses.

| Task                                 | Description                                     |
|--------------------------------------|-------------------------------------------------|
| Purchase Bill Entry                  | Add supplier bill with amount and due date      |
| Supplier Payment Recording           | Record payment against purchase bill            |
| Supplier Outstanding View            | Balance per supplier, ledger view               |
| Expense Entry                        | Add expense with category                       |
| Expense List                         | Filter by date and category                     |

**Deliverable:** Owner knows total payables and daily expenses.

---

### Phase 3 — Production & Dashboard (Weeks 7–8)
**Goal:** Track what is being made; give the owner a single-screen summary.

| Task                                 | Description                                     |
|--------------------------------------|-------------------------------------------------|
| Production Job — Create & Track      | Link job to order, update status                |
| Dashboard                            | KPI cards, open orders, outstanding totals      |
| Sales Register Report                | Date-range invoice list with PDF export         |
| Outstanding Report                   | Customer + supplier balances with PDF export    |
| Expense Summary Report               | Monthly totals by category with PDF export      |

**Deliverable:** Complete MVP. Owner can run the full business from the software.

---

### Phase 4 — Polish & Feedback (Weeks 9–10)
**Goal:** Fix usability issues found during real-world use.

- Number series configuration (per company, per financial year)
- Soft-delete / archive for customers, suppliers, products
- Basic search and filters on all list screens
- Delivery challan printout (separate from invoice)
- Data backup / export as CSV

---

## 4. Simplified Database Tables

### Design Philosophy
- Use **integer IDs** (auto-increment), not UUIDs, for simplicity in a small-scale app.
- All tables have a `company_id` column to support dual-company data separation.
- No complex polymorphic relationships in MVP.
- Avoid junction tables where a simple foreign key works.
- Stock is a manually maintained field on the product — no stock ledger in MVP.

---

### Table 1: companies

| Column       | Type         | Notes                          |
|--------------|--------------|--------------------------------|
| id           | INT (PK)     | Auto-increment                 |
| name         | VARCHAR(200) | Company legal name             |
| gstin        | VARCHAR(20)  |                                |
| address      | TEXT         |                                |
| phone        | VARCHAR(20)  |                                |
| email        | VARCHAR(100) |                                |
| logo_path    | VARCHAR(500) | File path to logo image        |
| invoice_prefix | VARCHAR(20)| e.g., "INV-2026-"             |
| order_prefix | VARCHAR(20)  | e.g., "ORD-2026-"             |
| created_at   | DATETIME     |                                |

---

### Table 2: customers

| Column       | Type         | Notes                          |
|--------------|--------------|--------------------------------|
| id           | INT (PK)     |                                |
| company_id   | INT (FK)     | → companies.id                 |
| name         | VARCHAR(200) |                                |
| phone        | VARCHAR(20)  |                                |
| address      | TEXT         |                                |
| gstin        | VARCHAR(20)  |                                |
| credit_days  | INT          | Default: 30                    |
| is_active    | BOOLEAN      | Default: true                  |
| created_at   | DATETIME     |                                |

---

### Table 3: suppliers

| Column       | Type         | Notes                          |
|--------------|--------------|--------------------------------|
| id           | INT (PK)     |                                |
| company_id   | INT (FK)     | → companies.id                 |
| name         | VARCHAR(200) |                                |
| phone        | VARCHAR(20)  |                                |
| address      | TEXT         |                                |
| gstin        | VARCHAR(20)  |                                |
| is_active    | BOOLEAN      | Default: true                  |
| created_at   | DATETIME     |                                |

---

### Table 4: products

| Column       | Type         | Notes                                      |
|--------------|--------------|--------------------------------------------|
| id           | INT (PK)     |                                            |
| company_id   | INT (FK)     | → companies.id                             |
| name         | VARCHAR(200) |                                            |
| type         | ENUM         | `FINISHED_GOOD`, `RAW_MATERIAL`            |
| unit         | VARCHAR(20)  | Pcs, Dozen, Box, Kg, etc.                  |
| sale_price   | DECIMAL(10,2)| For finished goods; 0 for raw materials    |
| hsn_code     | VARCHAR(10)  |                                            |
| gst_rate     | DECIMAL(5,2) | e.g., 18.00                                |
| stock_qty    | DECIMAL(10,2)| Manually maintained                        |
| is_active    | BOOLEAN      | Default: true                              |
| created_at   | DATETIME     |                                            |

> **Note:** Finished goods and raw materials share one table, separated by the `type` column. Keeps it simple.

---

### Table 5: orders

| Column        | Type         | Notes                                              |
|---------------|--------------|----------------------------------------------------|
| id            | INT (PK)     |                                                    |
| company_id    | INT (FK)     | → companies.id                                     |
| customer_id   | INT (FK)     | → customers.id                                     |
| order_number  | VARCHAR(30)  | Auto-generated (e.g., ORD-2026-0042)               |
| order_date    | DATE         |                                                    |
| delivery_date | DATE         | Expected delivery date                             |
| status        | ENUM         | `PENDING`, `IN_PRODUCTION`, `READY`, `DISPATCHED`  |
| notes         | TEXT         | Customer special instructions                      |
| total_amount  | DECIMAL(12,2)| Computed from order items                          |
| created_at    | DATETIME     |                                                    |

---

### Table 6: order_items

| Column       | Type         | Notes                                 |
|--------------|--------------|---------------------------------------|
| id           | INT (PK)     |                                       |
| order_id     | INT (FK)     | → orders.id                           |
| product_id   | INT (FK)     | → products.id                         |
| quantity     | DECIMAL(10,2)|                                       |
| unit_price   | DECIMAL(10,2)| Price captured at time of order       |
| gst_rate     | DECIMAL(5,2) | GST % captured at time of order       |
| line_total   | DECIMAL(12,2)| quantity × unit_price (before GST)    |

---

### Table 7: invoices

| Column         | Type         | Notes                                      |
|----------------|--------------|--------------------------------------------|
| id             | INT (PK)     |                                            |
| company_id     | INT (FK)     | → companies.id                             |
| order_id       | INT (FK)     | → orders.id (nullable for standalone)      |
| customer_id    | INT (FK)     | → customers.id                             |
| invoice_number | VARCHAR(30)  | Auto-generated                             |
| invoice_date   | DATE         |                                            |
| due_date       | DATE         | invoice_date + customer credit_days        |
| subtotal       | DECIMAL(12,2)|                                            |
| tax_amount     | DECIMAL(12,2)|                                            |
| total_amount   | DECIMAL(12,2)|                                            |
| paid_amount    | DECIMAL(12,2)| Sum of linked payments                     |
| status         | ENUM         | `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`     |
| notes          | TEXT         |                                            |
| created_at     | DATETIME     |                                            |

---

### Table 8: payments (customer receipts)

| Column       | Type         | Notes                                      |
|--------------|--------------|--------------------------------------------|
| id           | INT (PK)     |                                            |
| invoice_id   | INT (FK)     | → invoices.id                              |
| customer_id  | INT (FK)     | → customers.id                             |
| payment_date | DATE         |                                            |
| amount       | DECIMAL(12,2)|                                            |
| mode         | ENUM         | `CASH`, `UPI`, `BANK`, `CHEQUE`, `OTHER`   |
| reference    | VARCHAR(100) | Cheque number, UTR, etc.                   |
| notes        | TEXT         |                                            |
| created_at   | DATETIME     |                                            |

---

### Table 9: purchase_bills

| Column       | Type         | Notes                                      |
|--------------|--------------|--------------------------------------------|
| id           | INT (PK)     |                                            |
| company_id   | INT (FK)     | → companies.id                             |
| supplier_id  | INT (FK)     | → suppliers.id                             |
| bill_number  | VARCHAR(50)  | Supplier's own invoice number              |
| bill_date    | DATE         |                                            |
| due_date     | DATE         |                                            |
| total_amount | DECIMAL(12,2)|                                            |
| paid_amount  | DECIMAL(12,2)| Sum of linked supplier payments            |
| status       | ENUM         | `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`     |
| notes        | TEXT         |                                            |
| created_at   | DATETIME     |                                            |

---

### Table 10: supplier_payments

| Column       | Type         | Notes                                      |
|--------------|--------------|--------------------------------------------|
| id           | INT (PK)     |                                            |
| bill_id      | INT (FK)     | → purchase_bills.id                        |
| supplier_id  | INT (FK)     | → suppliers.id                             |
| payment_date | DATE         |                                            |
| amount       | DECIMAL(12,2)|                                            |
| mode         | ENUM         | `CASH`, `UPI`, `BANK`, `CHEQUE`, `OTHER`   |
| reference    | VARCHAR(100) |                                            |
| notes        | TEXT         |                                            |
| created_at   | DATETIME     |                                            |

---

### Table 11: production_jobs

| Column        | Type         | Notes                                          |
|---------------|--------------|------------------------------------------------|
| id            | INT (PK)     |                                                |
| company_id    | INT (FK)     | → companies.id                                 |
| order_id      | INT (FK)     | → orders.id                                    |
| job_number    | VARCHAR(30)  | Auto-generated (e.g., JOB-2026-0018)           |
| description   | TEXT         | What is being produced                         |
| quantity      | DECIMAL(10,2)| Planned production quantity                    |
| target_date   | DATE         |                                                |
| status        | ENUM         | `PENDING`, `IN_PROGRESS`, `DONE`, `CANCELLED`  |
| notes         | TEXT         |                                                |
| created_at    | DATETIME     |                                                |
| completed_at  | DATETIME     | Nullable — set when status = DONE              |

---

### Table 12: expenses

| Column       | Type         | Notes                                          |
|--------------|--------------|------------------------------------------------|
| id           | INT (PK)     |                                                |
| company_id   | INT (FK)     | → companies.id                                 |
| expense_date | DATE         |                                                |
| category     | VARCHAR(100) | From configurable category list                |
| description  | TEXT         |                                                |
| amount       | DECIMAL(12,2)|                                                |
| mode         | ENUM         | `CASH`, `UPI`, `BANK`, `OTHER`                 |
| paid_to      | VARCHAR(200) | Vendor / person name                           |
| created_at   | DATETIME     |                                                |

---

### Table 13: expense_categories

| Column     | Type         | Notes                            |
|------------|--------------|----------------------------------|
| id         | INT (PK)     |                                  |
| company_id | INT (FK)     | → companies.id                   |
| name       | VARCHAR(100) | e.g., Wages, Rent, Freight       |
| is_active  | BOOLEAN      | Default: true                    |

---

### Table 14: settings

| Column       | Type         | Notes                                          |
|--------------|--------------|------------------------------------------------|
| id           | INT (PK)     |                                                |
| company_id   | INT (FK)     | → companies.id                                 |
| key          | VARCHAR(100) | e.g., `invoice_next_number`, `financial_year`  |
| value        | TEXT         |                                                |

---

### Summary: 14 Tables, No Complexity

```
companies (1)
    ├── customers (2)
    ├── suppliers (3)
    ├── products (4)          [type = FINISHED_GOOD or RAW_MATERIAL]
    ├── orders (5)
    │       └── order_items (6)
    ├── invoices (7)
    │       └── payments (8)
    ├── purchase_bills (9)
    │       └── supplier_payments (10)
    ├── production_jobs (11)
    ├── expenses (12)
    ├── expense_categories (13)
    └── settings (14)
```

---

## 5. MVP Screen List

### Group A — Setup (one-time)

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| A01 | Login                   | Email + password; company selector on login         |
| A02 | Company Settings        | Name, GSTIN, address, logo, invoice prefix          |
| A03 | Expense Categories      | Add / edit / remove categories                      |

### Group B — Masters (ongoing maintenance)

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| B01 | Customer List           | Searchable table; outstanding balance shown inline  |
| B02 | Add / Edit Customer     | Name, phone, address, GSTIN, credit days            |
| B03 | Supplier List           | Searchable table; payable balance shown inline       |
| B04 | Add / Edit Supplier     | Name, phone, address, GSTIN                         |
| B05 | Product List            | Tabbed: Finished Goods / Raw Materials              |
| B06 | Add / Edit Product      | Name, type, unit, price, HSN, GST, stock qty        |

### Group C — Daily Sales Operations (used every day)

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| C01 | Order List              | All orders; filter by status; search by customer    |
| C02 | New / Edit Order        | Select customer → add items → save                  |
| C03 | Order Detail            | View order; change status; link to invoice/job      |
| C04 | Invoice List            | All invoices; filter by status / date               |
| C05 | Invoice Detail          | View invoice; payment history; print / PDF          |
| C06 | Create Invoice          | From order (one click) or standalone                |
| C07 | Record Payment          | Amount, date, mode, reference (modal / side panel)  |
| C08 | Delivery Challan Print  | Printable dispatch document (no financial details)  |

### Group D — Purchases & Payables

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| D01 | Purchase Bill List      | All bills; filter by supplier / status / date       |
| D02 | Add Purchase Bill       | Supplier, bill no., amount, due date                |
| D03 | Purchase Bill Detail    | View bill; payment history                          |
| D04 | Record Supplier Payment | Amount, date, mode, reference (modal / side panel)  |

### Group E — Production

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| E01 | Production Job List     | All jobs; filter by status / date                   |
| E02 | New / Edit Job          | Link to order, description, quantity, target date   |
| E03 | Job Detail              | View job status; update to In Progress / Done        |

### Group F — Expenses

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| F01 | Expense List            | All expenses; filter by category / date range       |
| F02 | Add / Edit Expense      | Date, category, amount, paid to, mode               |

### Group G — Dashboard & Reports

| ID  | Screen                  | Description                                         |
|-----|-------------------------|-----------------------------------------------------|
| G01 | Dashboard               | 5 KPI cards + open orders list + recent payments    |
| G02 | Sales Register          | Date range → invoice list → total; PDF export       |
| G03 | Outstanding Report      | Customer-wise + supplier-wise balances; PDF export  |
| G04 | Expense Summary         | Month selector → category totals; PDF export        |

---

### Total: 30 Screens

| Group     | Screens | Focus                      |
|-----------|---------|----------------------------|
| A — Setup | 3       | One-time configuration      |
| B — Masters | 6     | Customers, suppliers, items |
| C — Sales  | 8      | Orders, invoices, payments  |
| D — Purchase | 4    | Supplier bills & payments   |
| E — Production | 3  | Job tracking               |
| F — Expenses | 2    | Daily expense recording     |
| G — Dashboard | 4   | Summary & reports           |
| **Total** | **30**  |                             |

---

## 6. Features Postponed to Later

These features are **explicitly excluded from MVP**. They are not missing — they are deferred.

### Defer to Version 2 (Next quarter)

| Feature                     | Reason for Deferral                                             |
|-----------------------------|-----------------------------------------------------------------|
| Multi-user login & roles    | Owner is sole user in MVP; adds auth complexity unnecessarily   |
| GST Reports (GSTR-1/3B)     | Needs precise HSN/tax mapping; scope for a CA-assisted release  |
| Profit & Loss Report        | Needs raw material costs (BOM) to compute COGS accurately       |
| Bill of Materials (BOM)     | Complex; requires production cost discipline first              |
| Automated stock deduction   | Depends on BOM; manual stock update is fine for MVP             |
| Price lists (tiered pricing)| Single price per product is sufficient for MVP                  |
| Purchase Orders (formal PO) | Owner currently buys verbally; bill entry is enough for MVP     |
| Credit limit enforcement    | Owner knows customers; hard block adds friction                 |
| Partial delivery tracking   | Full order dispatch assumed in MVP                              |

### Defer to Version 3 (6+ months)

| Feature                     | Reason for Deferral                                             |
|-----------------------------|-----------------------------------------------------------------|
| WhatsApp / SMS notifications| Needs integration with external API; not core workflow          |
| Email notifications         | Low priority for small business                                 |
| Barcode / QR scanning       | Nice-to-have; manual entry fine at this scale                   |
| Mobile app (Android)        | Desktop-first; mobile web is sufficient for MVP                 |
| Offline mode                | Owner has stable connectivity; adds complexity                  |
| Tally / accounting export   | Owner has no accountant; add when needed                        |
| Employee attendance & wages | Wages tracked as expense category in MVP                        |
| Multi-warehouse / godown    | Single location assumed for MVP                                 |
| Customer portal             | Unnecessary at current scale                                    |
| Advanced analytics & charts | Basic reports are sufficient for MVP                            |
| Data sync across devices    | Single-machine use assumed for MVP                              |

---

## 7. Recommended Architecture

### Overview

```
┌───────────────────────────────────────────────────┐
│                 Desktop Application               │
│   (Electron shell wrapping a local web server)    │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────────┐  │
│  │   Frontend UI   │◄──►│   REST API Backend   │  │
│  │  (React / Vue)  │    │  (Node / Python)     │  │
│  └─────────────────┘    └──────────┬───────────┘  │
│                                    │              │
│                          ┌─────────▼──────────┐   │
│                          │  SQLite Database    │   │
│                          │  (local file)       │   │
│                          └────────────────────┘   │
└───────────────────────────────────────────────────┘
```

### Why This Stack?

| Decision              | Choice                  | Reason                                                      |
|-----------------------|-------------------------|-------------------------------------------------------------|
| **Application type**  | Desktop (Electron)      | Vyapar-style; works without internet; owner uses one PC     |
| **Database**          | SQLite                  | Zero setup; single file; easy backup; fine for < 100k rows  |
| **Backend**           | REST API (local)        | Separates UI from logic; easy to test; can go web later     |
| **Frontend**          | React or Vue            | Component-based; fast to build business UIs                 |
| **PDF generation**    | Server-side (PDFKit / WeasyPrint) | Consistent output; no browser print quirks        |
| **Data backup**       | Copy SQLite file        | Simple; owner can email the file to themselves              |

### Future Migration Path

```
MVP (Desktop / SQLite)
    │
    ▼
v2 (Desktop / SQLite + optional web access on LAN)
    │
    ▼
v3 (Web app with cloud DB — if business grows)
```

The API layer is the same in all three stages. Only the database and deployment change.

### Key Architecture Principles

1. **API-first** — All business logic lives in the API. The frontend never touches the DB directly.
2. **Company context on every request** — Every API call carries a `company_id`. The API enforces data isolation.
3. **No microservices** — Single monolithic API for MVP. Split only if necessary.
4. **PDF as server output** — PDFs are generated by the backend and returned as file downloads.
5. **Auto-increment sequential IDs** — Simpler than UUIDs for small-scale local app.

---

## 8. Suggested Project Structure

```
Ledgera/
├── app/                          # Electron desktop wrapper
│   ├── main.js                   # Electron main process
│   ├── preload.js                # Context bridge
│   └── package.json
│
├── backend/                      # REST API server
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # SQLite connection setup
│   │   │   └── app.js            # Express/FastAPI app setup
│   │   │
│   │   ├── modules/
│   │   │   ├── companies/
│   │   │   │   ├── companies.routes.js
│   │   │   │   ├── companies.controller.js
│   │   │   │   └── companies.service.js
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   ├── purchase-bills/
│   │   │   ├── production/
│   │   │   ├── expenses/
│   │   │   └── reports/
│   │   │
│   │   ├── shared/
│   │   │   ├── pdf.service.js    # PDF generation
│   │   │   ├── numbering.js      # Auto-generate order/invoice numbers
│   │   │   └── validators.js     # Shared input validation
│   │   │
│   │   └── middleware/
│   │       ├── company-context.js # Inject company_id on all routes
│   │       └── error-handler.js
│   │
│   ├── db/
│   │   ├── migrations/           # Schema versioning scripts
│   │   └── seeds/                # Sample data for development
│   │
│   └── package.json
│
├── frontend/                     # React / Vue UI
│   ├── src/
│   │   ├── layouts/
│   │   │   └── MainLayout.vue    # Sidebar + top bar + company switcher
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.vue
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── invoices/
│   │   │   ├── purchase-bills/
│   │   │   ├── production/
│   │   │   ├── expenses/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── components/
│   │   │   ├── ui/               # Buttons, inputs, modals, tables
│   │   │   ├── forms/            # Reusable form blocks
│   │   │   └── print/            # Invoice, challan print layouts
│   │   │
│   │   ├── api/
│   │   │   └── client.js         # Axios / Fetch wrapper for API calls
│   │   │
│   │   └── store/
│   │       └── company.js        # Active company state (Pinia / Vuex)
│   │
│   └── package.json
│
├── docs/
│   ├── software_blueprint.md
│   └── mvp_scope.md
│
└── README.md
```

---

## 9. Suggested API Modules

Each module maps to a route prefix and a set of CRUD + business action endpoints.

### Module 1: `/api/companies`

| Method | Endpoint                      | Action                          |
|--------|-------------------------------|---------------------------------|
| GET    | `/api/companies`              | List all companies              |
| GET    | `/api/companies/:id`          | Get company details             |
| PUT    | `/api/companies/:id`          | Update company settings         |
| GET    | `/api/companies/:id/summary`  | Dashboard KPIs for company      |

---

### Module 2: `/api/customers`

| Method | Endpoint                              | Action                                |
|--------|---------------------------------------|---------------------------------------|
| GET    | `/api/customers`                      | List customers (search, paginate)     |
| POST   | `/api/customers`                      | Create customer                       |
| GET    | `/api/customers/:id`                  | Get customer detail                   |
| PUT    | `/api/customers/:id`                  | Update customer                       |
| DELETE | `/api/customers/:id`                  | Soft-delete (set is_active = false)   |
| GET    | `/api/customers/:id/outstanding`      | Total balance due                     |
| GET    | `/api/customers/:id/ledger`           | All invoices + payments (ledger view) |

---

### Module 3: `/api/suppliers`

| Method | Endpoint                              | Action                                |
|--------|---------------------------------------|---------------------------------------|
| GET    | `/api/suppliers`                      | List suppliers                        |
| POST   | `/api/suppliers`                      | Create supplier                       |
| GET    | `/api/suppliers/:id`                  | Get supplier detail                   |
| PUT    | `/api/suppliers/:id`                  | Update supplier                       |
| DELETE | `/api/suppliers/:id`                  | Soft-delete                           |
| GET    | `/api/suppliers/:id/outstanding`      | Total payable                         |
| GET    | `/api/suppliers/:id/ledger`           | All bills + payments                  |

---

### Module 4: `/api/products`

| Method | Endpoint                      | Action                                    |
|--------|-------------------------------|-------------------------------------------|
| GET    | `/api/products`               | List products (filter by type)            |
| POST   | `/api/products`               | Create product / raw material             |
| GET    | `/api/products/:id`           | Get product detail                        |
| PUT    | `/api/products/:id`           | Update product                            |
| DELETE | `/api/products/:id`           | Soft-delete                               |
| PUT    | `/api/products/:id/stock`     | Manually update stock quantity            |

---

### Module 5: `/api/orders`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/orders`                     | List orders (filter by status, customer)     |
| POST   | `/api/orders`                     | Create order with line items                 |
| GET    | `/api/orders/:id`                 | Get order detail with line items             |
| PUT    | `/api/orders/:id`                 | Update order (items, status, notes)          |
| PATCH  | `/api/orders/:id/status`          | Change order status only                     |
| DELETE | `/api/orders/:id`                 | Cancel/soft-delete order                     |
| GET    | `/api/orders/:id/challan`         | Generate delivery challan PDF                |

---

### Module 6: `/api/invoices`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/invoices`                   | List invoices (filter by status, date range) |
| POST   | `/api/invoices`                   | Create standalone invoice                    |
| POST   | `/api/invoices/from-order/:orderId` | Create invoice from an order               |
| GET    | `/api/invoices/:id`               | Get invoice detail                           |
| PUT    | `/api/invoices/:id`               | Edit invoice (before payment)                |
| GET    | `/api/invoices/:id/pdf`           | Download invoice as PDF                      |

---

### Module 7: `/api/payments`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/payments`                   | List all customer payments                   |
| POST   | `/api/payments`                   | Record a payment against an invoice          |
| GET    | `/api/payments/:id`               | Get payment detail                           |
| DELETE | `/api/payments/:id`               | Cancel/reverse a payment                     |

---

### Module 8: `/api/purchase-bills`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/purchase-bills`             | List all purchase bills                      |
| POST   | `/api/purchase-bills`             | Record a new purchase bill                   |
| GET    | `/api/purchase-bills/:id`         | Get bill detail                              |
| PUT    | `/api/purchase-bills/:id`         | Edit bill                                    |

---

### Module 9: `/api/supplier-payments`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| POST   | `/api/supplier-payments`          | Record payment to supplier against a bill    |
| GET    | `/api/supplier-payments`          | List all supplier payments                   |
| DELETE | `/api/supplier-payments/:id`      | Cancel payment                               |

---

### Module 10: `/api/production`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/production`                 | List all production jobs                     |
| POST   | `/api/production`                 | Create a production job                      |
| GET    | `/api/production/:id`             | Get job detail                               |
| PUT    | `/api/production/:id`             | Update job details                           |
| PATCH  | `/api/production/:id/status`      | Update job status only                       |

---

### Module 11: `/api/expenses`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/expenses`                   | List expenses (filter by category, date)     |
| POST   | `/api/expenses`                   | Record a new expense                         |
| GET    | `/api/expenses/:id`               | Get expense detail                           |
| PUT    | `/api/expenses/:id`               | Edit expense                                 |
| DELETE | `/api/expenses/:id`               | Delete expense                               |
| GET    | `/api/expense-categories`         | List expense categories                      |
| POST   | `/api/expense-categories`         | Add new category                             |

---

### Module 12: `/api/reports`

| Method | Endpoint                          | Action                                       |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/reports/sales-register`     | Invoice list for date range (+ PDF)          |
| GET    | `/api/reports/outstanding`        | Customer + supplier outstanding (+ PDF)      |
| GET    | `/api/reports/expense-summary`    | Monthly expense totals by category (+ PDF)   |
| GET    | `/api/reports/dashboard`          | All KPIs for the dashboard                   |

> All report endpoints accept query parameters: `company_id`, `from_date`, `to_date`, `format=pdf|json`.

---

## 10. Suggested Desktop Application Modules

The desktop application is structured around a **left sidebar navigation**, matching the Vyapar-style layout familiar to Indian SME users.

### Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Company Logo]    Ledgera         [Company Switcher ▼] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │           MAIN CONTENT AREA                 │
│          │                                              │
│ ● Dashboard         (Changes based on selected item)   │
│                                                         │
│ SALES                                                   │
│ ○ Orders                                                │
│ ○ Invoices                                              │
│                                                         │
│ PURCHASE                                                │
│ ○ Purchase Bills                                        │
│                                                         │
│ PRODUCTION                                              │
│ ○ Production Jobs                                       │
│                                                         │
│ MASTER DATA                                             │
│ ○ Customers                                             │
│ ○ Suppliers                                             │
│ ○ Products                                              │
│                                                         │
│ EXPENSES                                                │
│ ○ Expenses                                              │
│                                                         │
│ REPORTS                                                 │
│ ○ Sales Register                                        │
│ ○ Outstanding                                           │
│ ○ Expense Summary                                       │
│                                                         │
│ ── ── ── ── ── ── ──                                   │
│ ○ Settings                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

### Desktop Module Definitions

#### DM-01: Shell & Navigation
- Electron main window with fixed sidebar.
- Top bar shows active company name and a switcher dropdown.
- Active menu item highlighted.
- Keyboard shortcuts for common actions (Ctrl+N = New Order, Ctrl+I = New Invoice).

#### DM-02: Dashboard Module
- Grid of 5 KPI cards (Today's Collection, Receivable, Payable, Open Orders, Month Expenses).
- List of last 5 open orders below the cards.
- List of last 5 unpaid/overdue invoices.
- Refreshes automatically when switching companies.

#### DM-03: Orders Module
- Filterable data table (status, date range, customer search).
- "New Order" button opens a full-page form.
- Inline status badge (colour-coded: Pending = orange, In Production = blue, Done = green).
- Row action: View → Change Status → Create Invoice → Create Production Job.

#### DM-04: Invoices Module
- Filterable data table (status, date, customer).
- Inline outstanding balance per invoice.
- Overdue invoices highlighted in red.
- "Record Payment" opens a modal without leaving the list.
- Print / PDF button on invoice detail page.

#### DM-05: Purchase Bills Module
- Filterable data table (status, date, supplier).
- Overdue bills highlighted in red.
- "Record Payment" modal.
- Total payable shown at top of list.

#### DM-06: Production Jobs Module
- Kanban-style status columns (Pending | In Progress | Done) OR simple data table.
- Linked order number shown on each job card.
- Status update with single click or button.

#### DM-07: Customers Module
- Data table with outstanding balance column.
- Click row to open Customer Detail: profile + invoice history + ledger.
- Quick "Add Customer" button.

#### DM-08: Suppliers Module
- Data table with payable balance column.
- Click row to open Supplier Detail: profile + bill history + ledger.

#### DM-09: Products Module
- Two tabs: Finished Goods and Raw Materials.
- Stock quantity column with manual edit in-place.
- Quick "Add Product" button.

#### DM-10: Expenses Module
- Chronological list of expenses, filterable by category and month.
- "Add Expense" is a minimal form (5 fields, one screen).
- Running monthly total shown at the top.

#### DM-11: Reports Module
- Three report tabs: Sales Register / Outstanding / Expense Summary.
- Date range picker for each report.
- "Generate" button loads the data table.
- "Export PDF" button triggers backend PDF generation and opens file.

#### DM-12: Settings Module
- Company profile (name, GSTIN, address, logo upload).
- Expense categories management (add/remove).
- Invoice and order number series configuration.
- Data backup: "Export Database" button copies SQLite file to a chosen folder.

---

## Summary Table

| Aspect                | MVP Decision                                               |
|-----------------------|------------------------------------------------------------|
| **Modules**           | 8 focused modules (no enterprise extras)                   |
| **Database tables**   | 14 tables (lean, no junction tables where avoidable)       |
| **Screens**           | 30 screens across 7 groups                                 |
| **Users**             | Single owner login (multi-user in v2)                      |
| **Platform**          | Electron desktop app (Vyapar-style)                        |
| **Database**          | SQLite (local file, zero setup)                            |
| **API**               | 12 REST API modules                                        |
| **Desktop modules**   | 12 desktop application modules                             |
| **Phases**            | 4 phases across 10 weeks                                   |
| **Deferred features** | 18 features moved to v2/v3                                 |

---

*End of Document*
