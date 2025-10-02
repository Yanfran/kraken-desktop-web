// src/App.jsx - ACTUALIZADO con autenticación completa
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // ✅ NUEVO AuthContext
import { ThemeProvider } from './contexts/ThemeContext'; // ✅ TU ThemeContext existente
import { ProtectedRoute, PublicRoute, SemiProtectedRoute } from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading/Loading';
import { Toaster } from 'react-hot-toast';
import './App.styles.scss';

import DashboardLayout from './components/common/Layout/DashboardLayout';

// ===== LAZY LOADING DE COMPONENTES =====
// Auth pages - TUS COMPONENTES EXISTENTES
const Login = React.lazy(() => import('./pages/auth/Login/Login'));
const Register = React.lazy(() => import('./pages/auth/Register/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword/ForgotPassword'));
const EmailConfirmation = React.lazy(() => import('./pages/auth/EmailConfirmation/EmailConfirmation'));
const CompleteProfile = React.lazy(() => import('./pages/auth/CompleteProfile/CompleteProfile'));
const PersonalData = React.lazy(() => import('./pages/auth/PersonalData/PersonalData'));
const DeliveryOption = React.lazy(() => import('./pages/auth/DeliveryOption/DeliveryOption'));
const EmailVerify = React.lazy(() => import('./pages/auth/EmailVerify/EmailVerify'));
const Welcome = React.lazy(() => import('./pages/auth/Welcome/Welcome'));

// Protected pages - TUS COMPONENTES EXISTENTES
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Calculator = React.lazy(() => import('./pages/calculator/Calculator/Calculator'));
const PreAlert = React.lazy(() => import('./pages/PreAlert/PreAlert'));
const PreAlertList = React.lazy(() => import('./pages/PreAlert/PreAlertList'));
const PreAlertDetail = React.lazy(() => import('./pages/PreAlert/PreAlertDetail'));
const PreAlertEdit = React.lazy(() => import('./pages/PreAlert/PreAlertEdit'));
const ShipmentsList = React.lazy(() => import('./pages/dashboard/ShipmentsList/ShipmentsList'));
const Profile = React.lazy(() => import('./pages/profile/Profile/Profile'));
const Billing = React.lazy(() => import('./pages/Billing/Billing'));
const Security = React.lazy(() => import('./pages/Security/Security'));
const Rastrear = React.lazy(() => import('./pages/Rastrear/Rastrear'));
const MyGuides = React.lazy(() => import('./pages/MyGuides/MyGuides'));
const GuideDetail = React.lazy(() => import('./pages/GuideDetail/GuideDetail'));

// Hook simplificado para compatibilidad con tu código existente
export const useAuth = () => {
  const { useAuth: useNewAuth } = require('./contexts/AuthContext');
  return useNewAuth();
};

function App() {
  return (
    <Router>
      <ThemeProvider> {/* ✅ TU ThemeProvider existente */}
        <AuthProvider> {/* ✅ NUEVO AuthProvider */}
          <div className="app">
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-card-background)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: 'var(--color-success)',
                    color: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: 'var(--color-error)',
                    color: '#fff',
                  },
                },
              }}
            />

            {/* Rutas principales */}
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* ===== RUTA RAÍZ ===== */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* ===== RUTAS PÚBLICAS (solo para no autenticados) ===== */}
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

                {/* ===== RUTAS SEMI-PROTEGIDAS ===== */}
                <Route path="/email-confirmation" element={
                  <SemiProtectedRoute>
                    <EmailConfirmation />
                  </SemiProtectedRoute>
                } />

                <Route path="/email-verify" element={
                  <SemiProtectedRoute>
                    <EmailVerify />
                  </SemiProtectedRoute>
                } />

                <Route path="/complete-profile" element={
                  <SemiProtectedRoute requireAuth={true}>
                    <CompleteProfile />
                  </SemiProtectedRoute>
                } />

                <Route path="/personal-data" element={
                  <SemiProtectedRoute requireAuth={true}>
                    <PersonalData />
                  </SemiProtectedRoute>
                } />

                <Route path="/delivery-option" element={
                  <SemiProtectedRoute requireAuth={true}>
                    <DeliveryOption />
                  </SemiProtectedRoute>
                } />

                <Route path="/welcome" element={
                  <SemiProtectedRoute requireAuth={true}>
                    <Welcome />
                  </SemiProtectedRoute>
                } />

                {/* ===== RUTAS PROTEGIDAS ===== */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/calculator" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Calculator />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/pre-alert" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PreAlert />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/pre-alert/list" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PreAlertList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/pre-alert/:id" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PreAlertDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/pre-alert/edit/:id" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PreAlertEdit />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/dashboard/mis-envios" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ShipmentsList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/billing" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Billing />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/security" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Security />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/rastrear" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Rastrear />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/my-guides" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyGuides />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/guide/detail/:idGuia" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <GuideDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ===== RUTA 404 ===== */}
                <Route path="*" element={
                  <div className="error-page">
                    <h1>404 - Página no encontrada</h1>
                    <p>La página que buscas no existe.</p>
                    <button onClick={() => window.history.back()}>
                      Volver atrás
                    </button>
                  </div>
                } />
              </Routes>
            </Suspense>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;