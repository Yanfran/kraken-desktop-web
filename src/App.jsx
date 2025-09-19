// src/App.jsx - Componente principal
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from '@hooks/useAuth';
import Layout from '@components/common/Layout';
import Loading from '@components/common/Loading';

// Pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import Dashboard from '@pages/dashboard/Dashboard';
import Calculator from '@pages/calculator/Calculator';
import PaymentPage from '@pages/payment/PaymentPage';
import PackagesList from '@pages/packages/PackagesList';
import PackageDetail from '@pages/packages/PackageDetail';
import Profile from '@pages/profile/Profile';

// Styles
import './App.styles.scss';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return isSignedIn ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return !isSignedIn ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/payment/:id" element={<PaymentPage />} />
                  <Route path="/packages" element={<PackagesList />} />
                  <Route path="/packages/:id" element={<PackageDetail />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--white)',
            color: 'var(--gray-800)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success-color)',
              secondary: 'var(--white)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error-color)',
              secondary: 'var(--white)',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;