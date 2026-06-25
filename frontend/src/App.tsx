import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';

// Customers
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';

// Products
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';

// Companies (accessed via Settings)
import { CompanyList } from './pages/companies/CompanyList';
import { CompanyForm } from './pages/companies/CompanyForm';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Customers */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/add" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />

          {/* Products */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />

          {/* Settings (Companies accessed through settings) */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/edit/:id" element={<CompanyForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
