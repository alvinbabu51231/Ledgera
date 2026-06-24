import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';

// A simple dashboard component since we are only implementing customers
const Dashboard = () => (
  <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <h1 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Dashboard</h1>
    <p style={{ color: '#475569' }}>Welcome to CombERP MVP. Navigate to Customers to manage the customer master.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/add" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
