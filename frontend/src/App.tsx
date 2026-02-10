import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import ItemForm from './pages/ItemForm';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Rentals from './pages/Rentals';
import StartRental from './pages/StartRental';
import EndRental from './pages/EndRental';
import Sales from './pages/Sales';
import SaleForm from './pages/SaleForm';
import Users from './pages/Users';
import Categories from './pages/Categories';

function AppRoutes() {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/new" element={<StartRental />} />
          <Route path="/rentals/:id/end" element={<EndRental />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SaleForm />} />
          <Route path="/sales/:id/edit" element={<SaleForm />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </AuthProvider>
  );
}
