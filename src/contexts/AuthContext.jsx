// src/contexts/AuthContext.jsx - COMPLETO con Google Auth y todas las funciones
import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { authService } from '../services/auth/authService';
import { googleService } from '../services/auth/googleService';
import Cookies from 'js-cookie';

// ===== ESTADO INICIAL =====
const initialState = {
  user: null,
  isLoading: true,
  isSignedIn: false,
  error: null
};

// ===== REDUCER =====
function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isSignedIn: true,
        error: null
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isSignedIn: false,
        error: null
      };
    
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isLoading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    default:
      return state;
  }
}

// ===== CONTEXTO =====
export const AuthContext = createContext({
  user: null,
  isLoading: true,
  isSignedIn: false,
  signIn: async () => ({ success: false, message: 'Not implemented' }),
  signOut: async () => {},
  signUp: async () => ({ success: false, message: 'Not implemented' }),
  signInWithGoogle: async () => ({ success: false, message: 'Not implemented' }),
  setUserState: async () => {},
  setUser: () => {},
  confirmEmail: () => {},
  resendVerificationEmail: async () => ({ success: false, message: 'Not implemented' })
});

// ===== PROVIDER =====
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ===== VERIFICAR TOKEN AL CARGAR =====
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔍 [Auth] Verificando sesión existente...');
        
        const token = localStorage.getItem('authToken') || Cookies.get('authToken');
        const userDataStr = localStorage.getItem('userData');

        if (token && userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            
            // Validar token con el servidor (opcional pero recomendado)
            try {
              const validatedUser = await authService.validateToken(token);
              console.log('✅ [Auth] Sesión válida:', validatedUser.email);
              dispatch({ type: 'LOGIN_SUCCESS', payload: validatedUser });
            } catch (error) {
              // Si falla la validación, usar datos del localStorage
              console.warn('⚠️ [Auth] No se pudo validar token, usando datos locales');
              dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
            }
          } catch (error) {
            console.warn('⚠️ [Auth] Token inválido, limpiando sesión');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            Cookies.remove('authToken');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          console.log('ℹ️ [Auth] No hay sesión previa');
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('❌ [Auth] Error al verificar autenticación:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // ===== SIGN IN (Email/Password) =====
  const signIn = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('🔐 [Auth] Iniciando sesión con email...');
      
      const response = await authService.login({ email, password });
      
      if (response.success) {
        // Guardar en localStorage y cookies
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        Cookies.set('authToken', response.token, { expires: 7 });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        console.log('✅ [Auth] Login exitoso:', response.user.email);
        return { success: true };
      } else {
        dispatch({ type: 'ERROR', payload: response.message });
        return response;
      }
    } catch (error) {
      console.error('❌ [Auth] Error en login:', error);
      const errorMessage = error.message || 'Error de conexión. Intenta de nuevo.';
      dispatch({ type: 'ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, []);

  // ===== SIGN UP =====
  const signUp = useCallback(async (userData) => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('📝 [Auth] Registrando nuevo usuario...');
      
      const result = await authService.register({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password
      });

      if (result.success) {
        // Si el registro incluye token, guardar sesión
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('userData', JSON.stringify(result.user));
          Cookies.set('authToken', result.token, { expires: 7 });
          dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        } else {
          // Si no hay token, solo detener loading
          dispatch({ type: 'SET_LOADING', payload: false });
        }
        
        console.log('✅ [Auth] Registro exitoso:', result.user?.email);
        return { success: true, user: result.user };
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      console.error('❌ [Auth] Error en registro:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { 
        success: false, 
        message: error.message || 'Error de conexión. Intenta de nuevo.' 
      };
    }
  }, []);

  // ===== SIGN IN CON GOOGLE =====
  const signInWithGoogle = useCallback(async (credentialResponse) => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('🔵 [Auth] Iniciando Google Sign-In...');
      
      // Si recibimos el objeto completo de Google
      let credential = credentialResponse;
      
      // Si es un objeto con la propiedad credential
      if (credentialResponse?.credential) {
        credential = credentialResponse.credential;
      }

      if (!credential) {
        throw new Error('No se recibió credencial de Google');
      }

      console.log('✅ [Auth] Credencial de Google obtenida');

      // Enviar credencial al backend
      const response = await authService.loginWithGoogle(credential);
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        Cookies.set('authToken', response.token, { expires: 7 });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        console.log('✅ [Auth] Google login exitoso:', response.user.email);
        
        return { success: true, user: response.user };
      } else {
        dispatch({ type: 'ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('❌ [Auth] Error en Google Sign-In:', error);
      dispatch({ type: 'ERROR', payload: error.message });
      return { 
        success: false, 
        message: error.message || 'Error con Google. Intenta nuevamente.' 
      };
    }
  }, []);

  // ===== SIGN OUT =====
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 [Auth] Cerrando sesión...');
      await authService.logout();
    } catch (error) {
      console.warn('⚠️ [Auth] Error en logout del servidor:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      Cookies.remove('authToken');
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [Auth] Sesión cerrada');
    }
  }, []);

  // ===== CONFIRM EMAIL =====
  const confirmEmail = useCallback(() => {
    if (state.user) {
      const updatedUser = { 
        ...state.user, 
        emailVerified: true, 
        fromEmail: true 
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { emailVerified: true, fromEmail: true } 
      });
      console.log('✅ [Auth] Email confirmado');
    }
  }, [state.user]);

  // ===== SET USER STATE - FUNCIÓN CRÍTICA =====
  const setUserState = useCallback(async (userData, token = null) => {
    try {
      if (userData) {
        console.log('🔄 [Auth] Actualizando estado de usuario...');
        
        // Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Si se proporciona token, guardarlo también
        if (token) {
          localStorage.setItem('authToken', token);
          Cookies.set('authToken', token, { expires: 7 });
        }
        
        // Actualizar estado
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        console.log('✅ [Auth] Estado actualizado:', userData.email);
      } else {
        // Si userData es null, hacer logout
        await signOut();
      }
    } catch (error) {
      console.error('❌ [Auth] Error al actualizar estado:', error);
    }
  }, [signOut]);

  // ===== RESEND VERIFICATION EMAIL =====
  const resendVerificationEmail = useCallback(async (email) => {
    try {
      console.log('📧 [Auth] Reenviando email de verificación...');
      const result = await authService.resendVerificationEmail(email);
      
      if (result.success) {
        console.log('✅ [Auth] Email reenviado exitosamente');
      }
      
      return result;
    } catch (error) {
      console.error('❌ [Auth] Error al reenviar email:', error);
      return { 
        success: false, 
        message: error.message || 'Error al reenviar email de verificación' 
      };
    }
  }, []);

  // ===== VALOR DEL CONTEXTO MEMOIZADO =====
  const value = useMemo(() => ({
    // Estado
    user: state.user,
    isLoading: state.isLoading,
    isSignedIn: state.isSignedIn,
    loading: state.isLoading, // Alias para compatibilidad
    
    // Funciones de autenticación
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    
    // Funciones de gestión de usuario
    setUserState,
    setUser: setUserState, // Alias
    confirmEmail,
    resendVerificationEmail
  }), [
    state.user, 
    state.isLoading, 
    state.isSignedIn, 
    signIn, 
    signOut, 
    signUp, 
    signInWithGoogle, 
    confirmEmail, 
    setUserState, 
    resendVerificationEmail
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== HOOK PERSONALIZADO =====
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};