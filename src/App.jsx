// src/App.jsx - ACTUALIZADO SIN BrowserRouter (ya está en main.jsx)
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute, SemiProtectedRoute } from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading/Loading';
import { Toaster } from 'react-hot-toast';
import './App.styles.scss';

// ✅ NUEVO: Smart Platform Detector (reemplaza MobileBlock)
import SmartPlatformDetector from './components/SmartPlatformDetector';

import DashboardLayout from './components/common/Layout/DashboardLayout';

// ✅ MULTI-TENANT IMPORTS
import { TenantProvider } from './core/context/TenantContext';
import TenantRouter from './router/TenantRouter';
import DynamicLayout from './layout/DynamicLayout';

// ===== LAZY LOADING DE COMPONENTES =====
// Auth pages
const Login = React.lazy(() => import('./pages/auth/Login/Login'));
const Register = React.lazy(() => import('./pages/auth/Register/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword/ResetPassword'));
const EmailConfirmation = React.lazy(() => import('./pages/auth/EmailConfirmation/EmailConfirmation'));
const CompleteProfile = React.lazy(() => import('./pages/auth/CompleteProfile/CompleteProfile'));
const PersonalData = React.lazy(() => import('./pages/auth/PersonalData/PersonalData'));
const DeliveryOption = React.lazy(() => import('./pages/auth/DeliveryOption/DeliveryOption'));
const EmailVerify = React.lazy(() => import('./pages/auth/EmailVerify/EmailVerify'));
const Welcome = React.lazy(() => import('./pages/auth/Welcome/Welcome'));

// ✅ PÁGINAS LEGALES
const Terms = React.lazy(() => import('./pages/legal/Terms/Terms'));
const Privacy = React.lazy(() => import('./pages/legal/Privacy/Privacy'));

// Protected pages
const Home = React.lazy(() => import('./pages/Home/Home'));
const Calculator = React.lazy(() => import('./pages/calculator/Calculator/Calculator'));
const PreAlertCreate = React.lazy(() => import('./pages/PreAlert/Create/PreAlertCreate'));
const PreAlertList = React.lazy(() => import('./pages/PreAlert/List/PreAlertList'));
const PreAlertDetail = React.lazy(() => import('./pages/PreAlert/Detail/PreAlertDetail'));
const PreAlertEdit = React.lazy(() => import('./pages/PreAlert/Edit/PreAlertEdit'));
// const Profile = React.lazy(() => import('./pages/profile/Profile/Profile'));
const Billing = React.lazy(() => import('./pages/Billing/Billing'));
const Security = React.lazy(() => import('./pages/Security/Security'));
const Tracking = React.lazy(() => import('./pages/Tracking/Tracking'));
const Guides = React.lazy(() => import('./pages/Guide/Guides'));
const GuideDetail = React.lazy(() => import('./pages/GuideDetail/GuideDetail'));
const AddressesPage = React.lazy(() => import('./pages/addresses/Addresses'));
const PaymentPage = React.lazy(() => import('./pages/payment/PaymentPage'));

// ✅ RUTAS DE PERFIL
const PersonalDataProfile = React.lazy(() => import('./pages/profile/Profile/PersonalData/PersonalData'));
const Addresses = React.lazy(() => import('./pages/profile/Profile/Addresses/Addresses'));
const ChangePassword = React.lazy(() => import('./pages/profile/Profile/ChangePassword/ChangePassword'));

// Hook simplificado para compatibilidad
export { useAuth } from './contexts/AuthContext';

function App() {
  return (
    // ⚠️ NO USAR BrowserRouter AQUÍ - Ya está en main.jsx
    <TenantProvider>
      <SmartPlatformDetector>
        <ThemeProvider>
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
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* ===== RUTAS PÚBLICAS ===== */}
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

                <Route path="/reset-password" element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                } />

                <Route path="/terms" element={
                  <PublicRoute>
                    <Terms />
                  </PublicRoute>
                } />

                <Route path="/privacy" element={
                  <PublicRoute>
                    <Privacy />
                  </PublicRoute>
                } />

                {/* ===== RUTAS SEMI-PROTEGIDAS (Flow de Registro) ===== */}
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

                {/* =========================================================
                  🏁 ARQUITECTURA MULTI-TENANT (Rutas Protegidas)
                  Todas las rutas restantes son manejadas por el TenantRouter
                  dentro del DynamicLayout (Sidebar/TopNav dinámicos)
                 ========================================================= */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <DynamicLayout>
                      <TenantRouter />
                    </DynamicLayout>
                  </ProtectedRoute>
                } />

              </Routes>
            </Suspense>
          </div>
        </ThemeProvider>
      </SmartPlatformDetector>
    </TenantProvider >
  );
}

export default App;