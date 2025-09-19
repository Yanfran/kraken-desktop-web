// src/App.jsx - CON ROUTER
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.styles.scss';

// AuthContext simplificado
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

// Dashboard simple
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🐙 Dashboard Kraken</h1>
      <p>¡Bienvenido, {user?.name}!</p>
      <button 
        onClick={logout}
        style={{
          padding: '12px 24px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
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
    <AuthProvider>
      <Router>
        <div className="app">
          <React.Suspense fallback={<div>Cargando...</div>}>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </React.Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;