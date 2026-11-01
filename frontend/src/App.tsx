import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';

// Customers & Parties (Master-Detail)
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';
import { CustomerDetail } from './pages/customers/CustomerDetail';

// Products & Items (Master-Detail)
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';

// Companies (accessed via Settings)
import { CompanyList } from './pages/companies/CompanyList';
import { CompanyForm } from './pages/companies/CompanyForm';

// Invoices & Sales
import { InvoiceList } from './pages/invoices/InvoiceList';
import { InvoiceForm } from './pages/invoices/InvoiceForm';
import { InvoiceView } from './pages/invoices/InvoiceView';

// Purchases & Expenses
import { PurchaseList } from './pages/purchases/PurchaseList';
import { ExpenseList } from './pages/expenses/ExpenseList';
import { ExpenseForm } from './pages/expenses/ExpenseForm';

// Cash & Bank
import { CashBank } from './pages/cashbank/CashBank';

// Import
import { ImportData } from './pages/import/ImportData';

// Reports
import { Reports } from './pages/reports/Reports';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard (Home) */}
          <Route index element={<Dashboard />} />

          {/* Parties / Customers */}
          <Route path="parties" element={<CustomerList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/add" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
          <Route path="customers/view/:id" element={<CustomerDetail />} />

          {/* Items / Products */}
          <Route path="items" element={<ProductList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />

          {/* Settings & Companies */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/edit/:id" element={<CompanyForm />} />

          {/* Sale Invoices */}
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/edit/:id" element={<InvoiceForm />} />
          <Route path="invoices/view/:id" element={<InvoiceView />} />

          {/* Purchase Bills & Expenses */}
          <Route path="purchases" element={<PurchaseList />} />
          <Route path="expenses" element={<ExpenseList />} />
          <Route path="expenses/new" element={<ExpenseForm />} />
          <Route path="expenses/edit/:id" element={<ExpenseForm />} />

          {/* Cash & Bank */}
          <Route path="cash-bank" element={<CashBank />} />

          {/* Import & Utilities */}
          <Route path="import" element={<ImportData />} />
          <Route path="utilities" element={<ImportData />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
