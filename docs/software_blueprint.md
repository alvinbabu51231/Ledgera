# CombERP — Software Blueprint

> **Version:** 1.0
> **Date:** June 2026
> **Prepared for:** Comb Manufacturing Business
> **Inspired by:** Vyapar

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Modules](#2-modules)
3. [User Roles](#3-user-roles)
4. [Business Workflows](#4-business-workflows)
5. [Database Entities](#5-database-entities)
6. [Screen List](#6-screen-list)
7. [MVP Scope](#7-mvp-scope)
8. [Future Scope](#8-future-scope)

---

## 1. System Overview

### 1.1 Business Context

| Attribute         | Detail                                      |
|-------------------|---------------------------------------------|
| Business Type     | Comb Manufacturing                          |
| No. of Companies  | 2 (managed under a single platform)         |
| Employees         | 8                                           |
| Production Model  | Make-to-Order (customer-order driven)       |
| Management        | Owner-operated                              |
| Current State     | Paper-based; billing-only software in use   |

### 1.2 Goals

CombERP aims to digitise the end-to-end operations of the comb manufacturing business — from capturing a customer order to dispatching the finished goods and collecting payment. It will replace paper registers with structured data, provide real-time visibility into production status and financial health, and eliminate manual reconciliation of outstanding balances.

### 1.3 Design Principles

- **Simplicity first** — The owner and a small team must be able to use the system with minimal training.
- **Mobile-friendly** — Key workflows (order entry, payment collection) must work on a smartphone.
- **Dual-company support** — Data for both companies is stored separately but accessible from a single login with company switching.
- **Offline resilience** — Core data entry should work offline and sync when connectivity is restored (Future Scope).
- **Audit trail** — Every financial transaction must be immutable and traceable.

### 1.4 Technology Considerations (Implementation-Agnostic)

- Web application (responsive, works on desktop and mobile browsers)
- Role-based access control (RBAC)
- PDF export for invoices, challans, and reports
- WhatsApp / SMS notification hooks (Future Scope)

---

## 2. Modules

### Module 1 — Customer Management
Maintain a master list of customers with contact details, address, GSTIN, credit terms, and payment history. Supports search, filter, and tagging (e.g., wholesale, retail).

### Module 2 — Product Management
Catalogue of finished comb products and raw materials. Each product has an SKU, description, unit of measure (UOM), sale price, and HSN/SAC code. Supports multiple price lists per customer tier.

### Module 3 — Order Tracking
Capture and manage customer orders from creation through delivery. Tracks order status: **Draft → Confirmed → In Production → Ready → Dispatched → Closed**. Supports partial deliveries.

### Module 4 — Production Tracking
Converts confirmed orders into production jobs. Tracks raw material consumption, machine assignment (if applicable), work-in-progress (WIP) quantities, and completion milestones.

### Module 5 — Customer Outstanding Tracking
Ledger of all amounts receivable from customers. Auto-populated from sales invoices; updated when payments are recorded. Provides aging analysis (0–30, 31–60, 61–90, 90+ days).

### Module 6 — Supplier Outstanding Tracking
Ledger of all amounts payable to suppliers. Auto-populated from purchase bills; updated when payments are made. Provides aging analysis mirroring customer outstanding.

### Module 7 — Expense Tracking
Record business expenses (wages, utilities, freight, consumables, etc.) with category, date, amount, and payment mode. Supports recurring expense templates.

### Module 8 — Sales Tracking
Consolidated view of all sales invoices, credit notes, and cash receipts. Provides daily, weekly, monthly, and custom-date-range summaries broken down by product, customer, and company.

### Module 9 — Dashboard
Single-screen executive summary visible immediately after login. Shows today's sales, pending orders, outstanding receivables, outstanding payables, and low-stock alerts.

### Module 10 — Reports
Printable and exportable (PDF / Excel) reports covering all modules. Covers: Profit & Loss summary, Stock Summary, Order Fulfilment, Outstanding Ageing, Expense Summary, and Sales Register.

---

## 3. User Roles

| Role                 | Description                                                                              | Accessible Modules                                           |
|----------------------|------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **Owner / Admin**    | Full access. Can switch between both companies. Can create/modify/delete any record.     | All modules                                                  |
| **Manager**          | Day-to-day operations. Can create and edit records but cannot delete or view P&L.        | Orders, Production, Customers, Products, Expenses            |
| **Production Staff** | View production jobs assigned to them; update WIP progress only.                         | Production Tracking (limited)                                |
| **Accountant**       | Full financial access; cannot modify production or order records.                        | Sales, Expenses, Outstanding (Customer & Supplier), Reports  |
| **Viewer**           | Read-only access to dashboard and reports.                                               | Dashboard, Reports                                           |

> **Note:** The Owner is the primary user for MVP. Additional roles are defined here for future onboarding of staff.

---

## 4. Business Workflows

### 4.1 Order-to-Dispatch Workflow

```
Customer Places Order
        │
        ▼
[Order Entry] ──► Order saved as DRAFT
        │
        ▼ (Owner confirms)
[Order Confirmed] ──► Stock check performed
        │
        ├─ Stock Available ──────────────────────────────► Skip to Dispatch
        │
        └─ Stock Not Available ──► [Production Job Created]
                                            │
                                            ▼
                                   [Raw Material Check]
                                            │
                                 ┌──────────┴──────────┐
                      Available  │                      │  Short
                                 ▼                      ▼
                        Production Begins    [Purchase Order to Supplier]
                                                        │
                                                        ▼
                                               Materials Received
                                                        │
                                                        ▼
                                               Production Begins
                                            │
                                            ▼
                                [WIP Tracked Daily]
                                            │
                                            ▼
                                [Production Complete]
                                            │
                                            ▼
                                [Finished Goods Added to Stock]
        │
        ▼
[Dispatch / Delivery Challan Created]
        │
        ▼
[Sales Invoice Generated] ──► Customer Outstanding Updated
        │
        ▼
[Payment Collected] ──► Outstanding Cleared
```

### 4.2 Purchase Workflow

```
Raw Material Requirement Identified
        │
        ▼
[Supplier Selected from Master]
        │
        ▼
[Purchase Order Created]
        │
        ▼
[Goods Received] ──► Stock Updated
        │
        ▼
[Purchase Bill Recorded] ──► Supplier Outstanding Updated
        │
        ▼
[Payment Made to Supplier] ──► Outstanding Cleared
```

### 4.3 Payment Collection Workflow

```
Invoice Due / Owner Follows Up
        │
        ▼
[Payment Receipt Recorded]
  (Amount, Date, Mode: Cash / Bank / UPI)
        │
        ▼
[Customer Outstanding Reduced]
        │
        ▼
[Ledger Entry Posted]
```

### 4.4 Expense Recording Workflow

```
Expense Incurred (Wages, Rent, Freight, etc.)
        │
        ▼
[Expense Entry Created]
  (Category, Amount, Payment Mode, Date)
        │
        ▼
[Expense Reflected in P&L Report]
```

---

## 5. Database Entities

### 5.1 Entity Relationship Summary

```
Company ──< Customer
Company ──< Supplier
Company ──< Product
Company ──< Order
Order ──< OrderLineItem ──> Product
Order ──> ProductionJob
ProductionJob ──< ProductionJobMaterial ──> RawMaterial
Order ──< Invoice
Invoice ──< Payment (Customer)
Supplier ──< PurchaseBill
PurchaseBill ──< PurchasePayment
Company ──< Expense
Product / RawMaterial ──< StockLedger
```

---

### 5.2 Entity Definitions

#### Company

| Field       | Type      | Description                        |
|-------------|-----------|------------------------------------|
| company_id  | UUID (PK) | Unique identifier                  |
| name        | String    | Legal company name                 |
| gstin       | String    | GST Identification Number          |
| address     | Text      | Registered address                 |
| phone       | String    |                                    |
| email       | String    |                                    |
| logo_url    | String    | Company logo for invoice header    |
| created_at  | DateTime  |                                    |

---

#### Customer

| Field          | Type      | Description                             |
|----------------|-----------|-----------------------------------------|
| customer_id    | UUID (PK) |                                         |
| company_id     | UUID (FK) | Belongs to which company                |
| name           | String    |                                         |
| contact_person | String    |                                         |
| phone          | String    |                                         |
| email          | String    |                                         |
| address        | Text      |                                         |
| gstin          | String    |                                         |
| credit_days    | Integer   | Default credit period in days           |
| credit_limit   | Decimal   | Maximum outstanding allowed             |
| customer_tag   | String    | e.g., Wholesale, Retail, Export         |
| is_active      | Boolean   |                                         |
| created_at     | DateTime  |                                         |

---

#### Supplier

| Field          | Type      | Description               |
|----------------|-----------|---------------------------|
| supplier_id    | UUID (PK) |                           |
| company_id     | UUID (FK) |                           |
| name           | String    |                           |
| contact_person | String    |                           |
| phone          | String    |                           |
| email          | String    |                           |
| address        | Text      |                           |
| gstin          | String    |                           |
| payment_terms  | String    | e.g., "Net 30"            |
| is_active      | Boolean   |                           |
| created_at     | DateTime  |                           |

---

#### Product (Finished Good)

| Field         | Type      | Description                         |
|---------------|-----------|-------------------------------------|
| product_id    | UUID (PK) |                                     |
| company_id    | UUID (FK) |                                     |
| sku           | String    | Stock Keeping Unit code             |
| name          | String    |                                     |
| description   | Text      |                                     |
| uom           | String    | Unit of Measure (Pcs, Dozen, etc.)  |
| hsn_code      | String    | HSN code for GST                    |
| sale_price    | Decimal   | Default sale price                  |
| gst_rate      | Decimal   | GST % (e.g., 18.0)                  |
| current_stock | Decimal   | Computed from stock ledger          |
| is_active     | Boolean   |                                     |
| created_at    | DateTime  |                                     |

---

#### RawMaterial

| Field          | Type      | Description                 |
|----------------|-----------|-----------------------------|
| material_id    | UUID (PK) |                             |
| company_id     | UUID (FK) |                             |
| name           | String    |                             |
| uom            | String    |                             |
| current_stock  | Decimal   |                             |
| reorder_level  | Decimal   | Alert threshold             |
| cost_per_unit  | Decimal   | Latest purchase cost        |
| is_active      | Boolean   |                             |

---

#### Order

| Field         | Type      | Description                                                |
|---------------|-----------|------------------------------------------------------------|
| order_id      | UUID (PK) |                                                            |
| company_id    | UUID (FK) |                                                            |
| customer_id   | UUID (FK) |                                                            |
| order_number  | String    | Auto-generated, human-readable (e.g., ORD-2026-0042)      |
| order_date    | Date      |                                                            |
| delivery_date | Date      | Expected delivery                                          |
| status        | Enum      | DRAFT, CONFIRMED, IN_PRODUCTION, READY, DISPATCHED, CLOSED |
| special_notes | Text      | Customer instructions                                      |
| total_amount  | Decimal   | Computed from line items                                   |
| created_by    | UUID (FK) | User who created the order                                 |
| created_at    | DateTime  |                                                            |
| updated_at    | DateTime  |                                                            |

---

#### OrderLineItem

| Field              | Type      | Description                        |
|--------------------|-----------|------------------------------------|
| line_item_id       | UUID (PK) |                                    |
| order_id           | UUID (FK) |                                    |
| product_id         | UUID (FK) |                                    |
| quantity_ordered   | Decimal   |                                    |
| quantity_delivered | Decimal   | Updated on each dispatch           |
| unit_price         | Decimal   | Price at time of order             |
| discount_pct       | Decimal   |                                    |
| line_total         | Decimal   | Computed                           |

---

#### ProductionJob

| Field          | Type      | Description                               |
|----------------|-----------|-------------------------------------------|
| job_id         | UUID (PK) |                                           |
| order_id       | UUID (FK) |                                           |
| company_id     | UUID (FK) |                                           |
| job_number     | String    | e.g., JOB-2026-0018                       |
| planned_start  | Date      |                                           |
| planned_end    | Date      |                                           |
| actual_start   | Date      |                                           |
| actual_end     | Date      |                                           |
| status         | Enum      | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED|
| notes          | Text      |                                           |
| created_at     | DateTime  |                                           |

---

#### ProductionJobMaterial

| Field            | Type      | Description                          |
|------------------|-----------|--------------------------------------|
| pjm_id           | UUID (PK) |                                      |
| job_id           | UUID (FK) |                                      |
| material_id      | UUID (FK) |                                      |
| quantity_planned | Decimal   |                                      |
| quantity_used    | Decimal   | Updated as production progresses     |

---

#### Invoice

| Field          | Type      | Description                               |
|----------------|-----------|-------------------------------------------|
| invoice_id     | UUID (PK) |                                           |
| company_id     | UUID (FK) |                                           |
| order_id       | UUID (FK) |                                           |
| customer_id    | UUID (FK) |                                           |
| invoice_number | String    | e.g., INV-2026-0087                       |
| invoice_date   | Date      |                                           |
| due_date       | Date      | invoice_date + credit_days                |
| subtotal       | Decimal   |                                           |
| tax_amount     | Decimal   |                                           |
| total_amount   | Decimal   |                                           |
| paid_amount    | Decimal   | Computed from payments                    |
| balance_due    | Decimal   | Computed                                  |
| status         | Enum      | UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED |
| created_at     | DateTime  |                                           |

---

#### Payment (Customer)

| Field        | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| payment_id   | UUID (PK) |                                          |
| invoice_id   | UUID (FK) |                                          |
| customer_id  | UUID (FK) |                                          |
| payment_date | Date      |                                          |
| amount       | Decimal   |                                          |
| payment_mode | Enum      | CASH, BANK_TRANSFER, CHEQUE, UPI, OTHER  |
| reference_no | String    | Cheque / UTR number                      |
| notes        | Text      |                                          |
| created_at   | DateTime  |                                          |

---

#### PurchaseBill

| Field        | Type      | Description                    |
|--------------|-----------|--------------------------------|
| bill_id      | UUID (PK) |                                |
| company_id   | UUID (FK) |                                |
| supplier_id  | UUID (FK) |                                |
| bill_number  | String    | Supplier's invoice number      |
| bill_date    | Date      |                                |
| due_date     | Date      |                                |
| total_amount | Decimal   |                                |
| paid_amount  | Decimal   |                                |
| balance_due  | Decimal   |                                |
| status       | Enum      | UNPAID, PARTIAL, PAID, OVERDUE |
| created_at   | DateTime  |                                |

---

#### PurchasePayment

| Field        | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| ppayment_id  | UUID (PK) |                                          |
| bill_id      | UUID (FK) |                                          |
| supplier_id  | UUID (FK) |                                          |
| payment_date | Date      |                                          |
| amount       | Decimal   |                                          |
| payment_mode | Enum      | CASH, BANK_TRANSFER, CHEQUE, UPI, OTHER  |
| reference_no | String    |                                          |
| notes        | Text      |                                          |

---

#### Expense

| Field        | Type      | Description                                        |
|--------------|-----------|----------------------------------------------------|
| expense_id   | UUID (PK) |                                                    |
| company_id   | UUID (FK) |                                                    |
| expense_date | Date      |                                                    |
| category     | String    | Wages, Rent, Freight, Utilities, Consumables, etc. |
| description  | Text      |                                                    |
| amount       | Decimal   |                                                    |
| payment_mode | Enum      | CASH, BANK_TRANSFER, UPI, OTHER                    |
| paid_to      | String    | Vendor / person name                               |
| receipt_url  | String    | Attached receipt image / PDF                       |
| created_by   | UUID (FK) |                                                    |
| created_at   | DateTime  |                                                    |

---

#### User

| Field         | Type      | Description                                           |
|---------------|-----------|-------------------------------------------------------|
| user_id       | UUID (PK) |                                                       |
| name          | String    |                                                       |
| email         | String    | Login identifier                                      |
| phone         | String    |                                                       |
| password_hash | String    |                                                       |
| role          | Enum      | OWNER, MANAGER, PRODUCTION, ACCOUNTANT, VIEWER        |
| company_ids   | Array     | Companies this user can access                        |
| is_active     | Boolean   |                                                       |
| last_login    | DateTime  |                                                       |

---

#### StockLedger

| Field            | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| ledger_id        | UUID (PK) |                                                  |
| company_id       | UUID (FK) |                                                  |
| item_id          | UUID      | References Product or RawMaterial                |
| item_type        | Enum      | PRODUCT, RAW_MATERIAL                            |
| transaction_date | Date      |                                                  |
| transaction_type | Enum      | IN (purchase/production), OUT (sale/consumption) |
| quantity         | Decimal   |                                                  |
| reference_type   | String    | INVOICE, PURCHASE_BILL, PRODUCTION_JOB           |
| reference_id     | UUID      | FK to the source document                        |
| balance          | Decimal   | Running stock balance                            |

---

## 6. Screen List

### 6.1 Authentication

| ID  | Screen Name       | Description                                  |
|-----|-------------------|----------------------------------------------|
| S01 | Login             | Email + Password login with company selector |
| S02 | Forgot Password   | OTP-based password reset                     |

### 6.2 Dashboard

| ID  | Screen Name       | Description                                   |
|-----|-------------------|-----------------------------------------------|
| S03 | Main Dashboard    | KPI cards, pending orders, recent activity    |

### 6.3 Customer Management

| ID  | Screen Name          | Description                                |
|-----|----------------------|--------------------------------------------|
| S04 | Customer List        | Searchable, filterable table of customers  |
| S05 | Customer Detail      | Profile, order history, ledger             |
| S06 | Add / Edit Customer  | Form to create or update a customer        |

### 6.4 Product Management

| ID  | Screen Name              | Description                               |
|-----|--------------------------|-------------------------------------------|
| S07 | Product List             | Finished goods catalogue with stock       |
| S08 | Product Detail           | Product info, stock history, price lists  |
| S09 | Add / Edit Product       | Form with UOM, HSN, GST rate              |
| S10 | Raw Material List        | Raw material catalogue with stock levels  |
| S11 | Add / Edit Raw Material  | Form with reorder level                   |

### 6.5 Order Tracking

| ID  | Screen Name           | Description                                       |
|-----|-----------------------|---------------------------------------------------|
| S12 | Order List            | All orders with status filter and search          |
| S13 | Order Detail          | Line items, production link, dispatch history     |
| S14 | Create / Edit Order   | Customer + product selection, quantities, dates   |
| S15 | Delivery Challan      | Printable challan for goods dispatch              |

### 6.6 Production Tracking

| ID  | Screen Name                  | Description                                  |
|-----|------------------------------|----------------------------------------------|
| S16 | Production Job List          | All jobs with status filters                 |
| S17 | Production Job Detail        | Materials, timeline, WIP updates             |
| S18 | Create / Edit Production Job | Link to order, material allocation           |
| S19 | WIP Update                   | Quick-update screen for production staff     |

### 6.7 Sales & Invoicing

| ID  | Screen Name           | Description                                  |
|-----|-----------------------|----------------------------------------------|
| S20 | Invoice List          | All invoices with status and date filters    |
| S21 | Invoice Detail        | Line items, tax breakup, payment history     |
| S22 | Create Invoice        | From order or standalone                     |
| S23 | Invoice Print / PDF   | Formatted invoice for sharing / printing     |
| S24 | Record Payment        | Enter payment against an invoice             |

### 6.8 Customer Outstanding

| ID  | Screen Name                  | Description                             |
|-----|------------------------------|-----------------------------------------|
| S25 | Customer Outstanding List    | All customers with total due            |
| S26 | Customer Ledger              | Statement of invoices & payments        |
| S27 | Aging Report (Customer)      | Buckets: 0–30, 31–60, 61–90, 90+ days  |

### 6.9 Supplier Management & Outstanding

| ID  | Screen Name               | Description                           |
|-----|---------------------------|---------------------------------------|
| S28 | Supplier List             | Searchable supplier master            |
| S29 | Add / Edit Supplier       | Form                                  |
| S30 | Purchase Bill List        | All bills with status filter          |
| S31 | Purchase Bill Detail      | Bill items, payment history           |
| S32 | Add Purchase Bill         | Record supplier invoice               |
| S33 | Record Supplier Payment   | Enter payment against a bill          |
| S34 | Supplier Ledger           | Statement of bills & payments         |
| S35 | Aging Report (Supplier)   | Payable aging buckets                 |

### 6.10 Expense Tracking

| ID  | Screen Name          | Description                                  |
|-----|----------------------|----------------------------------------------|
| S36 | Expense List         | All expenses with category & date filters    |
| S37 | Add / Edit Expense   | Quick-entry form with category picker        |
| S38 | Expense Summary      | Grouped by category and period               |

### 6.11 Reports

| ID  | Screen Name               | Description                                  |
|-----|---------------------------|----------------------------------------------|
| S39 | Sales Register            | Day/week/month sales with totals             |
| S40 | Stock Summary             | Current stock of products & raw materials    |
| S41 | Order Fulfilment Report   | Orders by status, delivery performance       |
| S42 | Profit & Loss Summary     | Revenue – COGS – Expenses                    |
| S43 | Outstanding Summary       | Combined receivables + payables at a glance  |

### 6.12 Settings

| ID  | Screen Name          | Description                                  |
|-----|----------------------|----------------------------------------------|
| S44 | Company Settings     | Logo, address, GST details                   |
| S45 | User Management      | Add/edit users, assign roles                 |
| S46 | Expense Categories   | Manage list of expense categories            |
| S47 | Number Series        | Configure invoice/order numbering formats    |

---

## 7. MVP Scope

The MVP targets the **Owner** as the sole user and focuses on replacing the current paper-based process with a functional digital workflow.

### 7.1 In Scope for MVP

| Module                        | MVP Features                                                                         |
|-------------------------------|--------------------------------------------------------------------------------------|
| **Authentication**            | Single user login; company switcher                                                  |
| **Customer Management**       | Add, edit, list customers; search by name/phone                                      |
| **Product Management**        | Add, edit, list finished products and raw materials with basic stock tracking        |
| **Order Tracking**            | Create order, add line items, update status manually, print delivery challan         |
| **Production Tracking**       | Create production job from order; update job status (Planned → In Progress → Done)  |
| **Sales & Invoicing**         | Generate invoice from order; PDF export; record payment receipt                      |
| **Customer Outstanding**      | View total outstanding per customer; view ledger per customer                        |
| **Supplier Outstanding**      | Add purchase bill; record payment; view supplier ledger                              |
| **Expense Tracking**          | Add expenses with category; view expense list                                        |
| **Dashboard**                 | Today's sales, total receivables, total payables, count of open orders               |
| **Reports**                   | Sales Register; Stock Summary; Outstanding Summary (PDF export)                      |

### 7.2 Out of Scope for MVP

- Multi-user access and role management
- Profit & Loss report (requires full cost data)
- Automated stock deduction from production
- GST filing integration
- Notifications (WhatsApp / SMS / Email)
- Offline mode
- Advanced analytics and charts

---

## 8. Future Scope

| Feature                            | Description                                                                 | Priority |
|------------------------------------|-----------------------------------------------------------------------------|----------|
| **Multi-user & Role-based Access** | Onboard manager, accountant, production staff with controlled access        | High     |
| **Automated Stock Management**     | Auto-deduct raw materials on production completion; auto-add finished goods | High     |
| **GST Reports**                    | GSTR-1, GSTR-3B summary reports for CA / tax filing                        | High     |
| **Profit & Loss Report**           | Full P&L with COGS (raw material costs) and operating expenses              | High     |
| **Bill of Materials (BOM)**        | Define raw material recipe per product for automated production planning    | High     |
| **WhatsApp Notifications**         | Send invoice PDF and payment reminders via WhatsApp Business API            | Medium   |
| **Email Notifications**            | Automated overdue reminders to customers                                    | Medium   |
| **Barcode / QR Scanning**          | Scan product SKUs during order entry or dispatch                            | Medium   |
| **Mobile App (Android)**           | Native Android app for the owner and production staff                       | Medium   |
| **Offline Mode**                   | Local-first data entry that syncs when online                               | Medium   |
| **Price Lists**                    | Customer-tier-based pricing (wholesale vs. retail vs. export)               | Medium   |
| **Purchase Orders**                | Formal PO workflow before receiving goods from suppliers                    | Medium   |
| **Tally / Accounting Integration** | Export transactions to Tally ERP for full accounting                        | Low      |
| **Employee Management**            | Track 8 employees' attendance, wages, and advances                          | Low      |
| **Multi-warehouse / Godown**       | Track stock across multiple storage locations                               | Low      |
| **Advanced Dashboard Analytics**   | Charts, trends, top customers, seasonal demand patterns                     | Low      |
| **Customer Portal**                | Self-service portal for customers to view orders and invoices               | Low      |

---

## Appendix A — Status Enumerations Reference

| Entity          | Status Values                                                    |
|-----------------|------------------------------------------------------------------|
| Order           | DRAFT, CONFIRMED, IN_PRODUCTION, READY, DISPATCHED, CLOSED      |
| Production Job  | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED                       |
| Invoice         | UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED                        |
| Purchase Bill   | UNPAID, PARTIAL, PAID, OVERDUE                                   |

---

## Appendix B — Key Business Rules

1. An Order can only move to IN_PRODUCTION if it is CONFIRMED.
2. An Invoice is auto-marked OVERDUE if `due_date < today` and `balance_due > 0`.
3. A Production Job must reference an Order; standalone jobs are not permitted in MVP.
4. Payment (customer or supplier) cannot exceed the outstanding balance.
5. Stock quantity cannot go negative; the system must warn on insufficient stock before dispatch.
6. Each company maintains a completely independent set of master data and transactions.
7. Deleted records are soft-deleted (archived) to preserve the audit trail.
8. Invoice numbers and Order numbers must be sequential within a company per financial year.

---

*End of Document*
