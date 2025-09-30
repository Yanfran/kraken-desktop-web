// src/components/auth/ProtectedRoute.jsx - Sistema de rutas protegidas
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading/Loading';

// ===== RUTA PROTEGIDA =====
export const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuth();
  const location = useLocation();
  const [localUser, setLocalUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  // Leer usuario desde localStorage (fuente de verdad)
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setLocalUser(parsed);
        console.log('🔍 [ProtectedRoute] Usuario desde localStorage:', {
          email: parsed.email,
          emailVerified: parsed.emailVerified,
          fromEmail: parsed.fromEmail,
          profileComplete: parsed.profileComplete
        });
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    setCheckingUser(false);
  }, [location.pathname]);

  if (isLoading || checkingUser) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usar localUser (localStorage) en lugar de user (contexto)
  if (localUser && !localUser.emailVerified && !localUser.fromEmail) {
    console.log('⚠️ [ProtectedRoute] Email no verificado, redirigiendo...');
    return <Navigate to="/email-confirmation" replace />;
  }

  if (localUser && !localUser.profileComplete) {
    console.log('⚠️ [ProtectedRoute] Perfil incompleto, redirigiendo...');
    return <Navigate to="/complete-profile" replace />;
  }

  console.log('✅ [ProtectedRoute] Acceso permitido');
  return children;
};

// ===== RUTA PÚBLICA (solo para no autenticados) =====
export const PublicRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuth();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        setLocalUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (isSignedIn && localUser?.emailVerified && localUser?.profileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isSignedIn && localUser && !localUser.emailVerified && !localUser.fromEmail) {
    return <Navigate to="/email-confirmation" replace />;
  }

  if (isSignedIn && localUser && !localUser.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

// ===== RUTA SEMI-PROTEGIDA (para procesos de verificación) =====
export const SemiProtectedRoute = ({ children, requireAuth = false }) => {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (requireAuth && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};