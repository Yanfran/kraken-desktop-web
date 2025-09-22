// src/App.jsx - Actualizado con ThemeProvider
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext'; // Nuevo ThemeProvider
import './App.styles.scss';

// AuthContext simplificado (tu código actual)
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
    <AuthContext.Provider value={{ user, isSignedIn, isLoading, signIn, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

// Importar Login page
const Login = React.lazy(() => import('./pages/auth/Login/Login'));

// Dashboard simple con toggle de tema
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { colors, actualTheme, toggleTheme } = React.useContext(
    React.createContext() // Esto se reemplazará por el ThemeContext real
  );
  
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: colors?.background || '#FFFFFF',
      color: colors?.textPrimary || '#000000',
      minHeight: '100vh',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Toggle de tema en dashboard */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
          }}
        >
          {actualTheme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      
      <h1>🐙 Dashboard Kraken</h1>
      <p>¡Bienvenido, {user?.name}!</p>
      <p style={{ opacity: 0.7, marginBottom: '20px' }}>
        Tema actual: {actualTheme === 'light' ? 'Claro' : 'Oscuro'}
      </p>
      
      <button 
        onClick={logout}
        style={{
          padding: '12px 24px',
          backgroundColor: colors?.error || '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

// Rutas protegidas
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
                
                {/* Rutas protegidas */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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