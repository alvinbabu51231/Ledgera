import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';

// Customers
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';
import { CustomerDetail } from './pages/customers/CustomerDetail';

// Products
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';

// Companies (accessed via Settings)
import { CompanyList } from './pages/companies/CompanyList';
import { CompanyForm } from './pages/companies/CompanyForm';

// Invoices
import { InvoiceList } from './pages/invoices/InvoiceList';
import { InvoiceForm } from './pages/invoices/InvoiceForm';
import { InvoiceView } from './pages/invoices/InvoiceView';
// Expenses
import { ExpenseList } from './pages/expenses/ExpenseList';
import { ExpenseForm } from './pages/expenses/ExpenseForm';

// Import
import { ImportData } from './pages/import/ImportData';

// Reports
import { Reports } from './pages/reports/Reports';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Customers */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/add" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
          <Route path="customers/view/:id" element={<CustomerDetail />} />

          {/* Products */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />

          {/* Settings (Companies accessed through settings) */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/edit/:id" element={<CompanyForm />} />

          {/* Invoices */}
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/edit/:id" element={<InvoiceForm />} />
          <Route path="invoices/view/:id" element={<InvoiceView />} />

          {/* Expenses */}
          <Route path="expenses" element={<ExpenseList />} />
          <Route path="expenses/new" element={<ExpenseForm />} />
          <Route path="expenses/edit/:id" element={<ExpenseForm />} />

          {/* Import */}
          <Route path="import" element={<ImportData />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
