import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

// Pages
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import SoilRecords from './pages/SoilRecords';
import WeatherDashboard from './pages/WeatherDashboard';
import Marketplace from './pages/Marketplace';
import SellerPortal from './pages/SellerPortal';
import Cart from './pages/Cart';
import Expenses from './pages/Expenses';
import GovernmentSchemes from './pages/GovernmentSchemes';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toastMessage } = useCart();
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password';

  // Dedicated clean auth layout for Login, Register and Forgot Password
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Login initialForgotMode={true} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {toastMessage && <Toast message={toastMessage.msg} type={toastMessage.type} />}
      </div>
    );
  }

  // Full Farmer Dashboard layout after login
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farms"
              element={
                <ProtectedRoute>
                  <Farms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/soil"
              element={
                <ProtectedRoute>
                  <SoilRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crops"
              element={<Navigate to="/" replace />}
            />
            <Route path="/weather" element={<WeatherDashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route
              path="/marketplace/seller"
              element={
                <ProtectedRoute>
                  <SellerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schemes"
              element={
                <ProtectedRoute>
                  <GovernmentSchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <Footer />

      {toastMessage && <Toast message={toastMessage.msg} type={toastMessage.type} />}
    </div>
  );
}

export default App;
