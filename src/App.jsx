// src/App.jsx - Actualizado con AuthContext robusto
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.styles.scss';

// Importar componentes con lazy loading
const Login = React.lazy(() => import('./pages/auth/Login/Login'));
const Register = React.lazy(() => import('./pages/auth/Register/Register'));
const EmailConfirmation = React.lazy(() => import('./pages/auth/EmailConfirmation/EmailConfirmation'));
const CompleteProfile = React.lazy(() => import('./pages/auth/CompleteProfile/CompleteProfile'));
const PersonalData = React.lazy(() => import('./pages/auth/PersonalData/PersonalData'));
const DeliveryOption = React.lazy(() => import('./pages/auth/DeliveryOption/DeliveryOption'));
const Welcome = React.lazy(() => import('./pages/auth/Welcome/Welcome'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard/Dashboard'));

// Loading component mejorado
const LoadingSpinner = ({ message = "Cargando..." }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    gap: '20px',
    backgroundColor: 'var(--color-background, #ffffff)',
    color: 'var(--color-text-primary, #000000)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #f0f0f0',
      borderTop: '3px solid #ff4500',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    {message}
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Componente que maneja las rutas según el estado del usuario
const AppRoutes = () => {
  const { user, isLoading, isSignedIn } = useAuth();

  // Mostrar loading mientras se carga el contexto de auth
  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  // Determinar el estado del usuario para redirecciones inteligentes
  const getUserState = () => {
    if (!isSignedIn) return 'unauthenticated';
    if (!user?.emailVerified) return 'unverified';
    if (!user?.profileComplete) return 'incomplete';
    return 'complete';
  };

  const userState = getUserState();

  return (
    <Routes>
      {/* Ruta raíz - redirección inteligente */}
      <Route path="/" element={
        <Navigate to={
          userState === 'complete' ? '/dashboard' :
          userState === 'incomplete' ? '/complete-profile' :
          userState === 'unverified' ? '/email-confirmation' :
          '/login'
        } replace />
      } />

      {/* Rutas de autenticación */}
      <Route path="/login" element={
        userState === 'unauthenticated' ? <Login /> : 
        <Navigate to={
          userState === 'complete' ? '/dashboard' :
          userState === 'incomplete' ? '/complete-profile' :
          '/email-confirmation'
        } replace />
      } />
      
      <Route path="/register" element={
        userState === 'unauthenticated' ? <Register /> : 
        <Navigate to={
          userState === 'complete' ? '/dashboard' :
          userState === 'incomplete' ? '/complete-profile' :
          '/email-confirmation'
        } replace />
      } />
      
      {/* Rutas del flujo de registro */}
      <Route path="/email-confirmation" element={
        userState === 'unverified' ? <EmailConfirmation /> :
        userState === 'unauthenticated' ? <Navigate to="/login" replace /> :
        userState === 'incomplete' ? <Navigate to="/complete-profile" replace /> :
        <Navigate to="/dashboard" replace />
      } />

      <Route path="/complete-profile" element={
        userState === 'incomplete' ? <CompleteProfile /> :
        userState === 'unverified' ? <Navigate to="/email-confirmation" replace /> :
        userState === 'unauthenticated' ? <Navigate to="/login" replace /> :
        <Navigate to="/dashboard" replace />
      } />

      <Route path="/personal-data" element={
        userState === 'incomplete' ? <PersonalData /> :
        userState === 'unverified' ? <Navigate to="/email-confirmation" replace /> :
        userState === 'unauthenticated' ? <Navigate to="/login" replace /> :
        <Navigate to="/dashboard" replace />
      } />

      <Route path="/delivery-option" element={
        userState === 'incomplete' ? <DeliveryOption /> :
        userState === 'unverified' ? <Navigate to="/email-confirmation" replace /> :
        userState === 'unauthenticated' ? <Navigate to="/login" replace /> :
        <Navigate to="/dashboard" replace />
      } />

      <Route path="/welcome" element={
        userState === 'incomplete' ? <Welcome /> :
        userState === 'unverified' ? <Navigate to="/email-confirmation" replace /> :
        userState === 'unauthenticated' ? <Navigate to="/login" replace /> :
        <Navigate to="/dashboard" replace />
      } />
      
      {/* Ruta del dashboard - protegida */}
      <Route path="/dashboard" element={
        userState === 'complete' ? <Dashboard /> :
        userState === 'incomplete' ? <Navigate to="/complete-profile" replace /> :
        userState === 'unverified' ? <Navigate to="/email-confirmation" replace /> :
        <Navigate to="/login" replace />
      } />
      
      {/* Página 404 */}
      <Route path="*" element={
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--color-background, #ffffff)',
          color: 'var(--color-text-primary, #000000)'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ff4500' }}>404</h1>
          <p style={{ marginBottom: '30px', fontSize: '18px' }}>
            La página que buscas no existe.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#FF4500',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e63e00';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FF4500';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Volver
          </button>
        </div>
      } />
    </Routes>
  );
};

// Componente principal de la aplicación
function App() {
  return (
    <ThemeProvider initialTheme="system">
      <AuthProvider>
        <Router>
          <div className="App">
            <React.Suspense fallback={<LoadingSpinner />}>
              <AppRoutes />
            </React.Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;