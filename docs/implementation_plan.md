# Ledgera — Implementation Plan

> **Version:** 1.0
> **Date:** June 2026
> **Source of Truth:** docs/database_schema.md, docs/mvp_scope.md
> **Developer Profile:** Solo developer with AI assistance
> **Target:** Desktop-first business application (Vyapar-style)

---

## Table of Contents

1. [Recommended Technology Stack](#1-recommended-technology-stack)
2. [Backend Architecture](#2-backend-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Development Order](#5-development-order)
6. [Milestones](#6-milestones)
7. [What to Build First](#7-what-to-build-first)
8. [What AI Should Generate](#8-what-ai-should-generate)
9. [What Requires Manual Review](#9-what-requires-manual-review)
10. [Deployment Strategy](#10-deployment-strategy)

---

## 1. Recommended Technology Stack

### Decision Criteria

| Criterion                   | Reasoning                                                              |
|-----------------------------|------------------------------------------------------------------------|
| Solo developer               | Stack must minimize boilerplate; each layer should be well-documented |
| AI-assisted development      | Well-known, mainstream frameworks get better AI code suggestions       |
| Desktop-first, web-later     | Must run locally without internet; same codebase should work on web   |
| Small business scale         | No need for distributed systems, queues, or microservices             |
| Indian SME context           | GST-aware; PDF output required; UPI/cash/bank payment modes           |

---

### Final Stack

#### Runtime & Language

| Layer       | Choice             | Reason                                                                      |
|-------------|--------------------|-----------------------------------------------------------------------------|
| Language    | **TypeScript**     | Single language across backend and frontend; excellent AI support; type safety catches bugs early |
| Runtime     | **Node.js (LTS)**  | Same language as frontend; huge ecosystem; works inside Electron           |

---

#### Backend

| Component          | Choice                   | Reason                                                                        |
|--------------------|--------------------------|-------------------------------------------------------------------------------|
| Framework          | **Fastify**              | Faster than Express; built-in TypeScript support; schema-based validation     |
| ORM / Query        | **Drizzle ORM**          | Lightweight, TypeScript-native; schema defined in code; easy migration story |
| Database           | **SQLite** (via better-sqlite3) | Zero setup; single file; easy backup; portable to PostgreSQL later    |
| Validation         | **Zod**                  | Schema validation shared between frontend and backend                         |
| PDF Generation     | **PDFKit** (Node.js)     | Programmatic PDF; no browser dependency; works inside Electron                |
| Authentication     | **Simple JWT** (jsonwebtoken) | Stateless; works on desktop and web; single owner = minimal auth complexity |

---

#### Frontend

| Component          | Choice                   | Reason                                                                        |
|--------------------|--------------------------|-------------------------------------------------------------------------------|
| Framework          | **React 18**             | Dominant; best AI support; huge component ecosystem                           |
| Language           | **TypeScript**           | Same as backend; shared types possible                                        |
| Build Tool         | **Vite**                 | Extremely fast dev server; works with Electron; minimal config                |
| UI Component Library | **shadcn/ui**          | Unstyled base components + Tailwind; customisable; no lock-in                 |
| Styling            | **Tailwind CSS**         | Utility-first; fast to build business UIs; works well with shadcn/ui         |
| State Management   | **Zustand**              | Minimal boilerplate; easier than Redux for solo dev; AI generates it well    |
| Data Fetching      | **TanStack Query**       | Server state, caching, and refetch out of the box; pairs perfectly with Fastify |
| Routing            | **React Router v6**      | Standard; well-supported                                                      |
| Tables             | **TanStack Table**       | Headless; powerful filter/sort/pagination; works with shadcn/ui               |
| Forms              | **React Hook Form + Zod**| Same Zod schemas from backend; minimal re-renders; easy validation            |
| Charts             | **Recharts**             | Simple; React-native; sufficient for MVP dashboard KPI charts                 |
| Icons              | **Lucide React**         | Used natively by shadcn/ui; consistent set                                   |

---

#### Desktop Wrapper

| Component          | Choice                   | Reason                                                                        |
|--------------------|--------------------------|-------------------------------------------------------------------------------|
| Desktop shell      | **Electron**             | Bundles Node.js backend + React frontend; single installer; Vyapar-like UX   |
| Electron builder   | **electron-builder**     | Produces .exe installer for Windows; cross-platform if needed later           |
| IPC / Bridge       | **Electron contextBridge** | Secure channel between frontend and local backend                          |

---

#### Tooling

| Tool               | Choice                   | Reason                                                                        |
|--------------------|--------------------------|-------------------------------------------------------------------------------|
| Package manager    | **pnpm**                 | Faster than npm; monorepo-friendly with workspaces                            |
| Monorepo           | **pnpm workspaces**      | Shared types package; single `pnpm install`; no Lerna/Turborepo complexity   |
| Testing            | **Vitest**               | Same config as Vite; fast; works for both frontend and backend unit tests     |
| Linting            | **ESLint + Prettier**    | Standard; AI tools know the config patterns                                   |
| Git                | **Git + GitHub**         | Source control; backup; AI tools can read repo context                        |

---

### Stack Summary (One View)

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON SHELL                              │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │     REACT FRONTEND       │  │    FASTIFY BACKEND       │    │
│  │  TypeScript + Vite       │  │    TypeScript + Node     │    │
│  │  shadcn/ui + Tailwind    │  │    Drizzle ORM           │    │
│  │  TanStack Query          │◄─►    Zod validation        │    │
│  │  React Hook Form + Zod   │  │    PDFKit (PDF gen)      │    │
│  │  Zustand (state)         │  │    JWT auth              │    │
│  └──────────────────────────┘  └──────────┬───────────────┘    │
│                                           │                    │
│                               ┌───────────▼─────────────┐     │
│                               │    SQLite Database       │     │
│                               │    (Drizzle schema)      │     │
│                               └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture

### 2.1 Pattern: Modular Monolith

The backend is a single Fastify application organized into feature modules. Each module owns its routes, service logic, and data access. There are no microservices in MVP.

```
Request
  → Fastify route
    → Zod validation middleware
      → Controller (thin — delegates to service)
        → Service (business logic lives here)
          → Drizzle query (database access)
            → Response
```

---

### 2.2 Module Structure (per feature)

Each of the 12 API modules follows the same internal structure:

| File                  | Responsibility                                                     |
|-----------------------|--------------------------------------------------------------------|
| `*.routes.ts`         | Declare HTTP routes; attach schema validation; call controller      |
| `*.controller.ts`     | Parse request; call service; format response                        |
| `*.service.ts`        | All business logic: computations, status transitions, rule checks  |
| `*.schema.ts`         | Zod schemas for request body, query params, and response shape     |

---

### 2.3 Shared Backend Services

| Service              | File                       | Purpose                                                       |
|----------------------|----------------------------|---------------------------------------------------------------|
| Database connection  | `db/index.ts`              | Single Drizzle client instance; SQLite file path config       |
| Database schema      | `db/schema.ts`             | All 14 Drizzle table definitions (source of truth)            |
| Number generator     | `shared/numbering.ts`      | Reads + increments `settings` table for invoice/order numbers |
| PDF service          | `shared/pdf.service.ts`    | Invoice PDF and delivery challan PDF templates                |
| Company middleware   | `middleware/company.ts`    | Injects `company_id` from JWT into every request context      |
| Auth middleware      | `middleware/auth.ts`       | Validates JWT; blocks unauthenticated requests                |
| Error handler        | `middleware/errors.ts`     | Centralized error response formatting                         |

---

### 2.4 API Design Conventions

- **Base URL:** `http://localhost:3001/api`
- **All routes prefixed:** `/api/v1/`
- **Company context:** Injected from JWT — frontend never sends `company_id` manually
- **Soft deletes:** `DELETE` endpoints set `is_active = 0`, never remove rows
- **Pagination:** All list endpoints accept `page` and `limit` query params (default: page=1, limit=50)
- **Date format:** ISO 8601 (`YYYY-MM-DD`) for all date fields
- **Response envelope:**

```
Success:  { "data": {...}, "meta": { "page": 1, "total": 42 } }
Error:    { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

---

### 2.5 Business Rule Enforcement Location

All business rules from `database_schema.md §5` are enforced in the **service layer**, not in routes or the database:

| Rule                                         | Enforced in                           |
|----------------------------------------------|---------------------------------------|
| Payment cannot exceed invoice balance        | `payments.service.ts`                 |
| Invoice status auto-transition (OVERDUE)     | `invoices.service.ts` (on read/update)|
| paid_amount update on invoice                | `payments.service.ts` (transactional) |
| Invoice number uniqueness per company/year   | `numbering.ts` + `invoices.service.ts`|
| Soft delete check before archive             | Each `*.service.ts`                   |

---

### 2.6 Transaction Handling

Operations that touch multiple tables must run in a single SQLite transaction:

| Operation                    | Tables Modified                                |
|------------------------------|------------------------------------------------|
| Record customer payment      | `payments` (insert) + `invoices` (update paid_amount + status) |
| Record supplier payment      | `supplier_payments` (insert) + `purchase_bills` (update) |
| Create order with items      | `orders` (insert) + `order_items` (insert N)  |
| Generate invoice from order  | `invoices` (insert) + `settings` (increment counter) |

---

## 3. Frontend Architecture

### 3.1 Pattern: Feature-Based Component Organization

Components are grouped by feature (not by type). Each feature folder is self-contained.

```
Feature folder structure:
  orders/
    ├── OrderList.tsx         (page — shows table of orders)
    ├── OrderForm.tsx         (page — create/edit order)
    ├── OrderDetail.tsx       (page — view order, actions)
    ├── OrderStatusBadge.tsx  (component — reusable status pill)
    ├── useOrders.ts          (hook — TanStack Query wrapper)
    └── orders.types.ts       (TypeScript types for this feature)
```

---

### 3.2 Layout Structure

```
App
  └── AuthProvider (checks JWT; redirects to Login if absent)
       └── CompanyProvider (stores active company_id in Zustand)
            └── MainLayout
                 ├── Sidebar (navigation menu)
                 ├── TopBar (company switcher, page title)
                 └── <Outlet /> (current page renders here)
                      ├── Dashboard
                      ├── Orders/*
                      ├── Invoices/*
                      ├── Customers/*
                      ├── Suppliers/*
                      ├── Products/*
                      ├── PurchaseBills/*
                      ├── Production/*
                      ├── Expenses/*
                      ├── Reports/*
                      └── Settings/*
```

---

### 3.3 Data Fetching Pattern

All API calls go through TanStack Query hooks. No direct `fetch()` calls in components.

```
Component
  → useOrders() hook (TanStack Query)
    → apiClient.get('/orders')     (Axios wrapper in api/client.ts)
      → Backend API
        → Response cached in TanStack Query cache
          → Component re-renders with data
```

- **Mutations** (create/update/delete) use `useMutation()` and invalidate relevant queries on success
- **Optimistic updates** only where UX demands it (not for MVP)
- **Error boundaries** wrap each page to catch and display API errors gracefully

---

### 3.4 Form Pattern

All forms use React Hook Form with Zod resolver. Validation schemas are imported from a shared `schemas/` folder.

```
Form Component
  → useForm({ resolver: zodResolver(createOrderSchema) })
    → <Input />, <Select />, <DatePicker /> (shadcn/ui components)
      → onSubmit → useMutation → API call → toast notification
```

---

### 3.5 State Management (Zustand Stores)

| Store                | Contents                                                         |
|----------------------|------------------------------------------------------------------|
| `useCompanyStore`    | `activeCompanyId`, `companies[]`, `switchCompany(id)`           |
| `useAuthStore`       | `token`, `user`, `login()`, `logout()`                          |
| `useUIStore`         | `sidebarOpen`, `activeRoute` (UI-only state)                    |

No server data in Zustand — all server data lives in TanStack Query cache.

---

### 3.6 PDF / Print Strategy

- **Invoice PDF:** Triggered by a button → calls `GET /api/v1/invoices/:id/pdf` → backend generates PDF → frontend receives blob → opens in new window / triggers download.
- **Delivery Challan PDF:** Same pattern via `GET /api/v1/orders/:id/challan`.
- **Report PDFs:** Same pattern via `/api/v1/reports/*?format=pdf`.
- **No browser `window.print()`** — all PDFs are generated server-side for consistent formatting.

---

## 4. Folder Structure

```
Ledgera/                              ← root of the monorepo
│
├── package.json                      ← pnpm workspace root
├── pnpm-workspace.yaml               ← declares packages/
├── .gitignore
├── README.md
│
├── docs/                             ← all planning documents
│   ├── software_blueprint.md
│   ├── mvp_scope.md
│   ├── database_schema.md
│   └── implementation_plan.md
│
├── packages/
│   └── shared/                       ← shared TypeScript types & Zod schemas
│       ├── package.json
│       └── src/
│           ├── types/
│           │   ├── company.types.ts
│           │   ├── customer.types.ts
│           │   ├── order.types.ts
│           │   ├── invoice.types.ts
│           │   └── ...               ← one file per domain entity
│           └── schemas/
│               ├── customer.schema.ts
│               ├── order.schema.ts
│               └── ...               ← Zod schemas shared by FE and BE
│
├── apps/
│   │
│   ├── backend/                      ← Fastify API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── main.ts               ← entry point; starts Fastify server
│   │   │   ├── app.ts                ← Fastify app setup; plugin registration
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── index.ts          ← Drizzle client + SQLite connection
│   │   │   │   ├── schema.ts         ← ALL 14 table definitions (Drizzle)
│   │   │   │   └── migrations/       ← Drizzle migration files
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   └── auth.service.ts
│   │   │   │   ├── companies/
│   │   │   │   ├── customers/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── purchase-bills/
│   │   │   │   ├── supplier-payments/
│   │   │   │   ├── production/
│   │   │   │   ├── expenses/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           ← JWT verification
│   │   │   │   ├── company.ts        ← inject company_id into request
│   │   │   │   └── errors.ts         ← global error handler
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── numbering.ts      ← invoice/order number generation
│   │   │       ├── pdf.service.ts    ← PDFKit templates
│   │   │       └── date.utils.ts     ← date helpers (overdue calc, FY logic)
│   │   │
│   │   └── data/
│   │       └── Ledgera.db            ← SQLite database file (gitignored)
│   │
│   ├── frontend/                     ← React application
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx              ← React entry point
│   │       ├── App.tsx               ← Router setup; providers
│   │       │
│   │       ├── api/
│   │       │   └── client.ts         ← Axios instance; base URL; auth header
│   │       │
│   │       ├── stores/
│   │       │   ├── auth.store.ts
│   │       │   ├── company.store.ts
│   │       │   └── ui.store.ts
│   │       │
│   │       ├── layouts/
│   │       │   ├── MainLayout.tsx
│   │       │   ├── Sidebar.tsx
│   │       │   └── TopBar.tsx
│   │       │
│   │       ├── pages/
│   │       │   ├── auth/
│   │       │   │   └── LoginPage.tsx
│   │       │   ├── dashboard/
│   │       │   │   └── DashboardPage.tsx
│   │       │   ├── customers/
│   │       │   │   ├── CustomerListPage.tsx
│   │       │   │   ├── CustomerFormPage.tsx
│   │       │   │   └── CustomerDetailPage.tsx
│   │       │   ├── suppliers/
│   │       │   ├── products/
│   │       │   ├── orders/
│   │       │   │   ├── OrderListPage.tsx
│   │       │   │   ├── OrderFormPage.tsx
│   │       │   │   └── OrderDetailPage.tsx
│   │       │   ├── invoices/
│   │       │   ├── purchase-bills/
│   │       │   ├── production/
│   │       │   ├── expenses/
│   │       │   ├── reports/
│   │       │   │   ├── SalesRegisterPage.tsx
│   │       │   │   ├── OutstandingReportPage.tsx
│   │       │   │   └── ExpenseSummaryPage.tsx
│   │       │   └── settings/
│   │       │       ├── CompanySettingsPage.tsx
│   │       │       └── ExpenseCategoriesPage.tsx
│   │       │
│   │       ├── components/
│   │       │   ├── ui/               ← shadcn/ui base components (Button, Input, etc.)
│   │       │   ├── data-table/       ← reusable TanStack Table wrapper
│   │       │   ├── forms/            ← reusable form field components
│   │       │   ├── status-badge/     ← colour-coded status pills
│   │       │   └── pdf-button/       ← print/export PDF trigger button
│   │       │
│   │       └── hooks/
│   │           ├── useCustomers.ts
│   │           ├── useOrders.ts
│   │           ├── useInvoices.ts
│   │           └── ...               ← one hook file per API module
│   │
│   └── desktop/                      ← Electron shell
│       ├── package.json
│       ├── electron-builder.yml      ← build config for .exe installer
│       ├── main.js                   ← Electron main process
│       ├── preload.js                ← contextBridge setup
│       └── resources/
│           ├── icon.ico
│           └── icon.png
│
└── scripts/
    ├── seed.ts                       ← seed companies + categories + settings
    └── backup.ts                     ← copy SQLite file to backup folder
```

---

## 5. Development Order

### Guiding Logic

Build the **data foundation → backend modules → frontend screens** in the same order that a business transaction flows through the system:

```
Foundation → Masters → Core Sales Cycle → Purchases → Production → Dashboard/Reports
```

Each step should be complete (backend + frontend) before moving to the next. This allows the owner to use the software incrementally and give real feedback.

---

### Order of Development

#### Stage 0 — Project Bootstrap (Day 1–2)
| Task                                       | Why First                                      |
|--------------------------------------------|------------------------------------------------|
| Initialize pnpm monorepo                   | All future work depends on this structure      |
| Set up `packages/shared` (types + schemas) | Shared Zod schemas prevent duplication         |
| Set up Fastify backend with basic routing  | All modules need a running server              |
| Set up Drizzle schema (all 14 tables)      | Define the schema once; generate migrations    |
| Run first migration; verify SQLite file    | Confirm DB works before writing any logic      |
| Set up Vite + React frontend scaffold      | Needed for all UI work                         |
| Set up Electron shell (connect to backend) | Verify the desktop wrapper works early         |
| Configure ESLint, Prettier, TypeScript     | Set standards before any feature code is written |
| Write seed script (companies + categories) | Enables testing all features from Day 1        |

---

#### Stage 1 — Authentication & Company Switching (Day 3)
| Task                                       | Screens                    |
|--------------------------------------------|----------------------------|
| Auth backend (login, JWT issue/verify)     | —                          |
| Auth frontend (Login page, token storage)  | A01 — Login                |
| Company switcher in Zustand + TopBar       | —                          |
| Company middleware on all protected routes | —                          |

---

#### Stage 2 — Master Data (Days 4–6)
| Task                                       | Screens                          |
|--------------------------------------------|----------------------------------|
| Customers CRUD (backend + frontend)        | B01, B02                         |
| Suppliers CRUD (backend + frontend)        | B03, B04                         |
| Products CRUD — finished goods             | B05, B06                         |
| Products CRUD — raw materials              | B05, B06 (same pages, type tab)  |
| Company settings screen                    | A02                              |
| Expense categories management             | A03                              |

---

#### Stage 3 — Orders & Invoicing (Days 7–12)
| Task                                           | Screens        |
|------------------------------------------------|----------------|
| Orders — list, create, edit, status update     | C01, C02, C03  |
| Order items — inline line item table in form   | C02            |
| Invoice — generate from order (1-click)        | C06            |
| Invoice — standalone create                    | C06            |
| Invoice — list, detail view                    | C04, C05       |
| Invoice — PDF generation (backend + download)  | C05            |
| Customer payment recording                     | C07            |
| Delivery challan PDF                           | C08            |

---

#### Stage 4 — Purchases & Payables (Days 13–16)
| Task                                           | Screens        |
|------------------------------------------------|----------------|
| Purchase bills — list, add, detail             | D01, D02, D03  |
| Supplier payment recording                     | D04            |
| Customer ledger (invoices + payments list)     | B01 → detail   |
| Supplier ledger (bills + payments list)        | B03 → detail   |

---

#### Stage 5 — Production Tracking (Days 17–19)
| Task                                           | Screens        |
|------------------------------------------------|----------------|
| Production jobs — list, create, detail         | E01, E02, E03  |
| Status update (PENDING → IN_PROGRESS → DONE)   | E03            |
| Link production job to order on order detail   | C03            |

---

#### Stage 6 — Expenses (Days 20–21)
| Task                                           | Screens        |
|------------------------------------------------|----------------|
| Expense list with category + date filter       | F01            |
| Add / edit expense form                        | F02            |

---

#### Stage 7 — Dashboard & Reports (Days 22–26)
| Task                                           | Screens        |
|------------------------------------------------|----------------|
| Dashboard KPI API endpoint                     | —              |
| Dashboard page (5 KPI cards + recent lists)    | G01            |
| Sales Register report (backend + PDF)          | G02            |
| Outstanding Report (backend + PDF)             | G03            |
| Expense Summary report (backend + PDF)         | G04            |

---

#### Stage 8 — Polish & Settings (Days 27–30)
| Task                                           | Screens        |
|------------------------------------------------|----------------|
| Number series configuration in settings        | Settings        |
| Search on all list screens                     | All list pages  |
| Overdue invoice highlighting                   | C04, G03        |
| SQLite backup export button                    | Settings        |
| Electron installer build (Windows .exe)        | —              |
| End-to-end flow test with real data            | —              |

---

## 6. Milestones

### Milestone 1 — "I can create an order and generate an invoice"
**Target:** End of Week 2 (Day 14)
**What works:**
- Owner can log in
- Switch between 2 companies
- Add customers, suppliers, products
- Create an order with line items
- Generate and print/PDF an invoice
- Record a customer payment

**Business value:** The paper invoice register is replaced.

---

### Milestone 2 — "I can track what I owe and what I'm owed"
**Target:** End of Week 3 (Day 21)
**What works:** Everything in Milestone 1, plus:
- Add supplier purchase bills
- Record supplier payments
- View customer ledger (total outstanding per customer)
- View supplier ledger (total payable per supplier)
- Record daily expenses with categories

**Business value:** Owner knows their receivables and payables without paper.

---

### Milestone 3 — "I can track production and see my business summary"
**Target:** End of Week 4 (Day 28)
**What works:** Everything in Milestone 2, plus:
- Create and track production jobs
- Dashboard with 5 KPI cards
- Sales Register report (PDF)
- Outstanding Report (PDF)
- Expense Summary report (PDF)
- Windows .exe installer

**Business value:** Complete MVP. Full paper-to-digital replacement. Owner can install and use independently.

---

### Milestone 4 — "It's stable and backed up"
**Target:** End of Week 5 (Day 35)
**What works:** Everything in Milestone 3, plus:
- Search and filter on all list screens
- Overdue invoice/bill highlighting
- SQLite backup export
- Number series per financial year
- Basic error messages for all failure cases
- Owner-facing user guide (1-page PDF)

**Business value:** Production-ready for daily use.

---

## 7. What to Build First

### Priority Order for the First Week

The single most valuable thing to get working is the **invoice generation flow**. Everything else supports or follows from it.

| Day | Build                                          | Reason                                                    |
|-----|------------------------------------------------|-----------------------------------------------------------|
| 1   | Monorepo setup + DB schema + seed              | Foundation that everything else requires                  |
| 2   | Fastify server + Drizzle running + Electron shell | Confirm the full stack connects before any features    |
| 3   | Login + Company switcher                       | All features need company context                         |
| 4   | Customer CRUD (backend only)                   | Orders cannot exist without customers                     |
| 5   | Customer CRUD (frontend list + form)           | Validates UI patterns used for all other masters          |
| 6   | Product CRUD (both backend and frontend)       | Orders need products                                      |
| 7   | Order create (backend + frontend form)         | Core of the entire system                                 |
| 8   | Invoice generate from order + PDF              | This is the first deliverable that replaces paper         |

### The "Killer Feature" Principle

When in doubt, ask: *"Does this let the owner do something faster than paper?"*

If yes → build it now.
If no → defer it.

The killer feature for Ledgera is: **Create Order → Generate Invoice → Record Payment → See Outstanding Balance.**

Everything else is secondary.

---

## 8. What AI Should Generate

AI assistance (Cursor, GitHub Copilot, Claude, etc.) is most effective for high-volume, low-variance tasks. Use it heavily for:

### 8.1 High-Confidence AI Generation

| Task                                         | AI Effectiveness | Notes                                               |
|----------------------------------------------|-----------------|-----------------------------------------------------|
| Drizzle table schema (from database_schema.md) | ★★★★★         | Provide the markdown table; AI produces schema.ts perfectly |
| Zod validation schemas                       | ★★★★★           | Derive directly from DB column types               |
| CRUD route + controller + service stubs      | ★★★★★           | Generate all 12 modules with the same prompt pattern |
| TanStack Query hooks (useCustomers, etc.)    | ★★★★★           | Repetitive pattern; AI does this well              |
| React list pages with TanStack Table         | ★★★★☆           | Provide column definitions; AI builds the table   |
| React form pages with React Hook Form + Zod  | ★★★★☆           | Provide schema; AI generates the form              |
| shadcn/ui component setup commands           | ★★★★★           | Just ask for the component name                   |
| TypeScript type definitions (from schema)    | ★★★★★           | Direct conversion from Drizzle schema             |
| Zustand store boilerplate                    | ★★★★☆           | Simple pattern; AI generates correctly            |
| Error handler middleware                     | ★★★★★           | Standard pattern                                  |
| Seed data script                             | ★★★★☆           | Provide example records from docs                 |
| ESLint + Prettier config                     | ★★★★★           | Standard configs                                  |
| Electron main.js boilerplate                 | ★★★★☆           | Well-documented; AI knows the pattern             |
| Report SQL queries (via Drizzle)             | ★★★☆☆           | Review carefully; join logic needs checking       |

---

### 8.2 What to Prompt AI With

For best results, always provide the AI with:
1. The relevant section of `database_schema.md` (the table definition)
2. The relevant section of `mvp_scope.md` (the API module endpoint table)
3. An example of a similar, already-built module in the codebase (as context)

**Example prompt pattern:**
> "Using the customers module as a template, generate the complete suppliers module — routes, controller, service, and Zod schema. Here is the database table definition: [paste table]. Here are the required API endpoints: [paste endpoint table]."

---

## 9. What Requires Manual Review

These areas require the developer's own judgment. AI output should be treated as a **first draft** — not production-ready — for these categories.

### 9.1 Business Logic — Must Manually Verify

| Area                                          | Risk if Wrong                                             |
|-----------------------------------------------|-----------------------------------------------------------|
| `paid_amount` update on payment insert        | Incorrect outstanding balances across the app             |
| Invoice status transition logic (OVERDUE)     | Owner sees wrong payment status                           |
| GST calculation (subtotal → tax → total)      | Wrong invoice amounts sent to customers                   |
| Number sequence generation (per company/year) | Duplicate or skipped invoice/order numbers               |
| Soft delete — ensuring linked records still display | Archived customer disappears from old invoices     |
| Financial year boundary (April 1st in India) | Number sequence resets at wrong time                      |
| Payment cannot exceed invoice total           | Overpayment recorded silently                             |
| Order `total_amount` update when items change | Stale total on order if items are edited                  |

### 9.2 PDF Output — Must Manually Test

| Area                                          | Reason                                                     |
|-----------------------------------------------|------------------------------------------------------------|
| Invoice PDF layout                            | Numbers, alignment, and GST breakup must look professional |
| Delivery challan PDF                          | Must not show financial amounts (challan ≠ invoice)        |
| Report PDFs                                   | Column alignment, page breaks, totals placement            |
| Company logo rendering in PDF                 | File path handling differs between dev and production      |

### 9.3 Security — Must Manually Audit

| Area                                          | Risk                                                       |
|-----------------------------------------------|------------------------------------------------------------|
| Company data isolation                        | Owner of Company 1 must never see Company 2 data           |
| JWT expiry and refresh handling               | Stale tokens must not allow access                         |
| SQLite file location and permissions          | DB file must not be accessible outside the app             |
| Input sanitization                            | Even for a single-user app; prevents injection via import  |

### 9.4 UX Flows — Must Test with Real Owner

| Area                                          | Reason                                                     |
|-----------------------------------------------|------------------------------------------------------------|
| Company switching — does context reset cleanly?| Cached query data from Company 1 must not bleed to Company 2 |
| Invoice PDF font and number formatting        | Indian number format (₹1,23,456.00) vs Western            |
| Date pickers — do they default to today?      | Owner expects today's date pre-filled                      |
| Form validation messages — are they clear?    | Error messages must make sense without technical knowledge |
| Save & New vs Save & Close buttons            | Owner needs to enter 20 orders quickly; UX matters here    |

---

## 10. Deployment Strategy

### 10.1 MVP Deployment: Local Desktop App

The MVP is deployed as a Windows desktop application installed on the owner's PC. No internet required.

**Packaging:**
- `electron-builder` produces a `.exe` installer for Windows
- The installer bundles: Electron runtime + Node.js backend + React frontend + empty SQLite DB + seed data
- First-run wizard: sets up Company 1 and Company 2 (name, GSTIN)

**Update Strategy (MVP):**
- Manual update: developer provides a new `.exe` installer
- Owner replaces the old installation; SQLite DB is preserved in a known folder (`%APPDATA%\Ledgera\`)

**Data Backup (MVP):**
- Settings page → "Backup Database" button → copies `Ledgera.db` to a chosen folder
- Owner can email the `.db` file to themselves or copy to a USB drive
- Restore: developer provides a "restore" tool (or manual file copy)

---

### 10.2 v2 Deployment: LAN Web App (Optional)

If the owner wants to access Ledgera from multiple devices (phone, tablet, second PC) within the same Wi-Fi network:

- Run the Fastify backend as a background service on the owner's PC (using `pm2` or Windows Task Scheduler)
- Frontend served as a static web app (Nginx on the same PC)
- Other devices access via `http://192.168.x.x:3001` (local IP)
- SQLite database remains on the owner's PC
- No cloud costs; no internet dependency

**Changes required from MVP:**
- CORS configuration on Fastify (allow LAN IPs)
- Static frontend build served by backend or Nginx
- Backend runs as a Windows Service (not inside Electron)

---

### 10.3 v3 Deployment: Cloud Web App (Future)

When the business outgrows a single PC (multiple branches, cloud backup, remote access):

- Migrate SQLite → **PostgreSQL** (Drizzle ORM makes this straightforward — only the connection config changes)
- Deploy Fastify backend on **Railway / Render / DigitalOcean** (low-cost VPS)
- Deploy React frontend on **Vercel / Netlify** (free tier)
- Database backups via managed PostgreSQL snapshots
- HTTPS via Let's Encrypt (Caddy or Nginx proxy)

**Migration effort:**
- Drizzle schema: change `sqlite` to `pg` driver — column types are compatible
- No application logic changes needed (Drizzle abstracts the DB)
- Data migration: export SQLite → import to PostgreSQL (one-time, scripted)

---

### 10.4 Deployment Environment Summary

| Stage | Platform         | Database   | Access         | Cost       | When               |
|-------|------------------|------------|----------------|------------|--------------------|
| MVP   | Windows Desktop  | SQLite     | Single PC      | ₹0         | Now                |
| v2    | LAN server       | SQLite     | Local network  | ₹0         | When needed        |
| v3    | Cloud (VPS)      | PostgreSQL | Anywhere       | ~₹500/month| If business grows  |

---

### 10.5 Development Environment Setup Checklist

| Step | Action                                                              |
|------|---------------------------------------------------------------------|
| 1    | Install Node.js LTS (v20+)                                          |
| 2    | Install pnpm (`npm install -g pnpm`)                                |
| 3    | Install Git                                                         |
| 4    | Clone repository                                                    |
| 5    | `pnpm install` (installs all workspaces)                            |
| 6    | Copy `.env.example` to `.env` in `apps/backend/`                   |
| 7    | `pnpm db:migrate` (runs Drizzle migrations; creates SQLite file)    |
| 8    | `pnpm db:seed` (seeds 2 companies + default categories + settings)  |
| 9    | `pnpm dev` (starts backend + frontend + Electron simultaneously)    |
| 10   | Login with default owner credentials from seed data                 |

---

### 10.6 Build & Release Checklist (MVP .exe)

| Step | Action                                                              |
|------|---------------------------------------------------------------------|
| 1    | `pnpm build:frontend` (Vite production build)                       |
| 2    | `pnpm build:backend` (TypeScript compile)                           |
| 3    | `pnpm build:desktop` (electron-builder → produces `.exe`)           |
| 4    | Test installer on a clean Windows machine                           |
| 5    | Verify SQLite DB is created in `%APPDATA%\Ledgera\` on first run    |
| 6    | Verify seed data creates 2 companies                                |
| 7    | Verify PDF invoice renders correctly                                |
| 8    | Hand installer `.exe` to the owner                                  |

---

## Summary

| Aspect                 | Decision                                         |
|------------------------|--------------------------------------------------|
| Language               | TypeScript (full stack)                          |
| Backend                | Fastify + Drizzle ORM + SQLite                   |
| Frontend               | React 18 + Vite + shadcn/ui + Tailwind           |
| Desktop                | Electron                                         |
| Forms                  | React Hook Form + Zod                            |
| Data fetching          | TanStack Query                                   |
| State                  | Zustand (UI/auth state only)                     |
| PDF                    | PDFKit (server-side)                             |
| Monorepo               | pnpm workspaces                                  |
| Dev duration (MVP)     | ~5 weeks (solo + AI-assisted)                    |
| Milestones             | 4 milestones; first usable build at Day 14       |
| Deployment (MVP)       | Windows .exe installer; SQLite local file        |
| Migration path         | SQLite → PostgreSQL (Drizzle makes this easy)    |

---

*End of Document*
