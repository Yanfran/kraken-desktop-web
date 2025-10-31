// src/hooks/useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // ===== FUNCIÓN DE LOGIN CON REDIRECCIÓN =====
  const loginWithRedirect = useCallback(async (credentials, redirectTo = '/home') => {
    const result = await context.signIn(credentials.email, credentials.password);
    
    if (result.success) {
      toast.success('¡Bienvenido de vuelta!');
      navigate(redirectTo, { replace: true });
    }
    
    return result;
  }, [context.signIn, navigate]);

  // ===== FUNCIÓN DE LOGOUT CON REDIRECCIÓN =====
  const logoutWithRedirect = useCallback(async (redirectTo = '/login') => {
    await context.signOut();
    toast.success('Sesión cerrada correctamente');
    navigate(redirectTo, { replace: true });
  }, [context.signOut, navigate]);

  // ===== VERIFICAR SI EL USUARIO ESTÁ COMPLETAMENTE AUTENTICADO =====
  const isFullyAuthenticated = useCallback(() => {
    const { user, isSignedIn } = context;
    return isSignedIn && user?.emailVerified && user?.profileComplete;
  }, [context.user, context.isSignedIn]);

  // ===== VERIFICAR PERMISOS =====
  const hasPermission = useCallback((permission) => {
    const { user } = context;
    if (!user) return false;
    
    switch (permission) {
      case 'admin':
        return user.role === 'admin';
      case 'active':
        return user.clienteActivo;
      default:
        return true;
    }
  }, [context.user]);

  // ===== REFRESCAR DATOS DEL USUARIO =====
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const { authService } = await import('../services/auth/authService');
        const userData = await authService.validateToken(token);
        context.setUserState(userData, token);
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      await context.signOut();
    }
  }, [context]);

  // ===== ACTUALIZAR PERFIL DEL USUARIO =====
  const updateProfile = useCallback(async (updatedData) => {
    try {
      console.log('🔄 Actualizando usuario en contexto...', updatedData);
      
      // Actualizar el usuario en localStorage
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const mergedUser = { ...currentUser, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(mergedUser));
      
      // Actualizar el estado del contexto
      if (context.setUserState) {
        await context.setUserState(mergedUser);
      }
      
      console.log('✅ Usuario actualizado en contexto');
      return { success: true, user: mergedUser };
    } catch (error) {
      console.error('❌ Error updating profile in context:', error);
      return { success: false, message: error.message };
    }
  }, [context]);

  return {
    // Estados básicos del contexto
    ...context,
    
    // Funciones adicionales
    loginWithRedirect,
    logoutWithRedirect,
    isFullyAuthenticated,
    hasPermission,
    refreshUser,
    updateProfile,
  };
};