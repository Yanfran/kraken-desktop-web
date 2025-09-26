// src/components/auth/ProtectedRoute.jsx - Sistema de rutas protegidas
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading/Loading';

// ===== RUTA PROTEGIDA =====
export const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <Loading />;
  }

  // Si no está autenticado, redirigir a login
  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero el email no está verificado
  if (user && !user.emailVerified) {
    return <Navigate to="/email-confirmation" replace />;
  }

  // Si está autenticado pero el perfil no está completo
  if (user && !user.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Todo correcto, mostrar el componente
  return children;
};

// ===== RUTA PÚBLICA (solo para no autenticados) =====
export const PublicRoute = ({ children }) => {
  const { isSignedIn, isLoading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <Loading />;
  }

  // Si está autenticado, redirigir al dashboard
  if (isSignedIn && user?.emailVerified && user?.profileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si está autenticado pero falta verificar email
  if (isSignedIn && user && !user.emailVerified) {
    return <Navigate to="/email-confirmation" replace />;
  }

  // Si está autenticado pero falta completar perfil
  if (isSignedIn && user && !user.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // No está autenticado, mostrar el componente público
  return children;
};

// ===== RUTA SEMI-PROTEGIDA (para procesos de verificación) =====
export const SemiProtectedRoute = ({ children, requireAuth = false }) => {
  const { isSignedIn, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <Loading />;
  }

  // Si requiere autenticación y no está autenticado
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Permitir acceso (útil para email-confirmation, complete-profile, etc.)
  return children;
};