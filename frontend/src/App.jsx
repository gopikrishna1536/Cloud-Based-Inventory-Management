import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Dashboard / SaaS Application Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';
import Subscription from './pages/Subscription';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public SaaS Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Application Routes */}
          <Route path="/app" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'STAFF']} />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sales" element={<Sales />} />

              {/* Manager & Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                <Route path="categories" element={<Categories />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="purchases" element={<Purchases />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="users" element={<UsersPage />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
