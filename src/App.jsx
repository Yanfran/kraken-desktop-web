// src/App.jsx - Actualizado con rutas de Pre-Alertas ✅
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext'; // ✅ CORRECTO
import './App.styles.scss';

// AuthContext simplificado (tu código actual que funciona)
const AuthContext = React.createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUser({ email, name: 'Usuario Kraken' });
      setIsSignedIn(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Credenciales inválidas' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, name, lastName) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // No estableces el usuario como logueado después del registro
      // Solo retorna success para redirigir a email confirmation
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Error al registrarse' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ email: 'google@user.com', name: 'Usuario Google' });
      setIsSignedIn(true);
      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isSignedIn, isLoading, signIn, signUp, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook exportado que usan tus componentes
export const useAuth = () => React.useContext(AuthContext);

// Importar componentes con lazy loading ✅
const Login = React.lazy(() => import('./pages/auth/Login/Login'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword/ForgotPassword'));
const Register = React.lazy(() => import('./pages/auth/Register/Register'));
const EmailConfirmation = React.lazy(() => import('./pages/auth/EmailConfirmation/EmailConfirmation'));
const CompleteProfile = React.lazy(() => import('./pages/auth/CompleteProfile/CompleteProfile'));
const PersonalData = React.lazy(() => import('./pages/auth/PersonalData/PersonalData'));
const DeliveryOption = React.lazy(() => import('./pages/auth/DeliveryOption/DeliveryOption'));
const Welcome = React.lazy(() => import('./pages/auth/Welcome/Welcome'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));

// 🆕 NUEVOS COMPONENTES DE PRE-ALERTAS
const PreAlert = React.lazy(() => import('./pages/PreAlert/PreAlert'));
const PreAlertList = React.lazy(() => import('./pages/PreAlert/PreAlertList'));
const PreAlertDetail = React.lazy(() => import('./pages/PreAlert/PreAlertDetail'));

// Dashboard con tema integrado
const DashboardWithTheme = () => {
  return <Dashboard />;
};

// Rutas protegidas ✅
const ProtectedRoute = ({ children }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider initialTheme="system">
      <AuthProvider>
        <Router>
          <div className="App">
            <React.Suspense fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px'
              }}>
                Cargando...
              </div>
            }>
              <Routes>
                {/* Rutas públicas */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/forgot"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                
                <Route
                  path="/email-confirmation"
                  element={
                    <PublicRoute>
                      <EmailConfirmation />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/complete-profile"
                  element={
                    <PublicRoute>
                      <CompleteProfile />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/personal-data"
                  element={
                    <PublicRoute>
                      <PersonalData />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/delivery-option"
                  element={
                    <PublicRoute>
                      <DeliveryOption />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/welcome"
                  element={
                    <PublicRoute>
                      <Welcome />
                    </PublicRoute>
                  }
                />
                
                {/* Rutas protegidas principales */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardWithTheme />
                    </ProtectedRoute>
                  }
                />

                {/* 🆕 NUEVAS RUTAS DE PRE-ALERTAS */}
                <Route
                  path="/pre-alerts"
                  element={
                    <ProtectedRoute>
                      <PreAlertList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pre-alerts/create"
                  element={
                    <ProtectedRoute>
                      <PreAlert />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pre-alerts/:id"
                  element={
                    <ProtectedRoute>
                      <PreAlertDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pre-alerts/edit/:id"
                  element={
                    <ProtectedRoute>
                      <PreAlert />
                    </ProtectedRoute>
                  }
                />
                
                {/* Redirección por defecto */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 - Página no encontrada */}
                <Route path="*" element={
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <h1>404 - Página no encontrada</h1>
                    <p style={{ marginBottom: '20px' }}>La página que buscas no existe.</p>
                    <button
                      onClick={() => window.history.back()}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#FF4500',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Volver
                    </button>
                  </div>
                } />
              </Routes>
            </React.Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;