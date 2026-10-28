import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Home from './pages/Home';
import Cart from './pages/Cart';
import CustomerDashboard from './pages/CustomerDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminMenuManagement from './pages/AdminMenuManagement';
import StaffDashboard from './pages/StaffDashboard';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

const dashboardByRole = {
  ADMIN: '/dashboard/admin',
  STAFF: '/dashboard/staff',
  KITCHEN: '/dashboard/kitchen',
  CUSTOMER: '/dashboard/customer',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardByRole[user.role] || '/'} replace />;
  }

  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Redirect any legacy admin login URLs to unified /login */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/login/admin" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/kitchen"
            element={
              <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN']}>
                <KitchenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/menu"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMenuManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
