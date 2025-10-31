// src/components/auth/ProtectedRoute.jsx - Sistema de rutas protegidas
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading/Loading';

// ===== RUTA PROTEGIDA =====
export const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !user.emailVerified && !user.fromEmail) {
    return <Navigate to="/email-confirmation" replace />;
  }

  if (user && !user.profileComplete) {
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
    return <Navigate to="/home" replace />;
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