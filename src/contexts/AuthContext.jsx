// src/contexts/AuthContext.jsx - COMPLETO con Google Auth y todas las funciones
import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { authService } from '../services/auth/authService';
import { googleService } from '../services/auth/googleService';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import sharedTokenBridge from '../utils/SharedTokenBridge';

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

// ===== AUTH PROVIDER =====
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // =============================================
  // ✅ NUEVO: EFECTO INICIAL - Sincronizar desde URL si hay token
  // =============================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Verificar si hay token en URL (viene de Mobile)
        const currentUrl = window.location.href;
        if (currentUrl.includes('?token=')) {
          console.log('🔄 [Auth] Token en URL detectado, sincronizando...');
          
          const synced = await sharedTokenBridge.syncTokenFromUrl(currentUrl);
          
          if (synced) {
            const token = await sharedTokenBridge.getToken();
            const userData = await sharedTokenBridge.getUserData();
            
            if (token && userData) {
              console.log('✅ [Auth] Token sincronizado desde URL');
              dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
              
              // Limpiar URL
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
              return;
            }
          }
        }

        // 2. Si no hay token en URL, verificar localStorage
        const token = await sharedTokenBridge.getToken();
        if (token && await sharedTokenBridge.isTokenValid()) {
          const userData = await sharedTokenBridge.getUserData();
          if (userData) {
            console.log('✅ [Auth] Sesión previa encontrada');
            dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
            return;
          }
        }

        // 3. No hay sesión válida
        console.log('ℹ️ [Auth] No hay sesión previa');
        dispatch({ type: 'LOGOUT' });
        
      } catch (error) {
        console.error('❌ [Auth] Error al verificar autenticación:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // =============================================
  // ✅ NUEVO: LISTENER PARA CAMBIOS EN OTRAS PESTAÑAS
  // =============================================
  useEffect(() => {
    const cleanup = sharedTokenBridge.setupTokenListener(async (data) => {
      console.log('📡 [Auth] Evento recibido de otra pestaña:', data.type);
      
      if (data.type === 'LOGOUT') {
        console.log('🚪 [Auth] Logout detectado en otra pestaña');
        dispatch({ type: 'LOGOUT' });
      } 
      else if (data.type === 'TOKEN_UPDATED' && data.userData) {
        console.log('🔄 [Auth] Token actualizado en otra pestaña');
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.userData });
      }
    });

    return cleanup;
  }, []);

  // =============================================
  // ✅ ACTUALIZADO: SIGN IN - Usar SharedTokenBridge
  // =============================================
  const signIn = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('🔐 [Auth] Iniciando sesión con email...');
      
      const response = await authService.login({ email, password });
      
      if (response.success) {
        // ✅ GUARDAR CON SharedTokenBridge
        await sharedTokenBridge.saveToken(
          response.token, 
          response.user, 
          response.refreshToken
        );
        
        // También mantener localStorage directo para compatibilidad
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('userId', response.user.id);
        Cookies.set('authToken', response.token, { expires: 7 });
        
        queryClient.clear();
        
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
  }, [queryClient]);

  // =============================================
  // ✅ ACTUALIZADO: SIGN UP - Usar SharedTokenBridge
  // =============================================
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
        if (result.token) {
          // ✅ GUARDAR CON SharedTokenBridge
          await sharedTokenBridge.saveToken(
            result.token, 
            result.user, 
            result.refreshToken
          );
          
          // También mantener localStorage directo
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('userData', JSON.stringify(result.user));
          Cookies.set('authToken', result.token, { expires: 7 });
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        } else {
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
      // ✅ NORMALIZAR DATOS DEL USUARIO ANTES DE GUARDAR
      const normalizedUser = {
        id: response.user.id,
        email: response.user.email,
        
        // ✅ CAMPOS NORMALIZADOS
        name: response.user.nombres || response.user.name,
        lastName: response.user.apellidos || response.user.lastName,
        phone: response.user.telefonoCelular || response.user.phone,
        phoneSecundary: response.user.telefonoCelularSecundario || response.user.phoneSecondary,
        nro: response.user.nroIdentificacionCliente || response.user.nro,
        birthday: response.user.fechaNacimiento || response.user.birthday,
        
        // ✅ MANTENER TAMBIÉN LOS CAMPOS ORIGINALES
        nombres: response.user.nombres,
        apellidos: response.user.apellidos,
        telefonoCelular: response.user.telefonoCelular,
        telefonoCelularSecundario: response.user.telefonoCelularSecundario,
        nroIdentificacionCliente: response.user.nroIdentificacionCliente,
        fechaNacimiento: response.user.fechaNacimiento,
        
        // ✅ OTROS CAMPOS
        idClienteTipoIdentificacion: response.user.idClienteTipoIdentificacion,
        avatarId: response.user.avatarId || '1',
        emailVerified: response.user.emailVerified ?? response.user.fromEmail ?? true,
        profileComplete: response.user.profileComplete ?? false,
        clienteActivo: response.user.clienteActivo ?? true,
        fromGoogle: response.user.fromGoogle ?? true,
        fromEmail: response.user.fromEmail ?? false,
        codCliente: response.user.codCliente,
        idClienteTipo: response.user.idClienteTipo
      };
      
      // ✅ GUARDAR USUARIO NORMALIZADO
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      localStorage.setItem('userId', normalizedUser.id);
      Cookies.set('authToken', response.token, { expires: 7 });

      // ✅ LIMPIAR caché anterior
      queryClient.clear();
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: normalizedUser });
      console.log('✅ [Auth] Google login exitoso:', normalizedUser.email);
      console.log('✅ [Auth] Usuario normalizado:', { name: normalizedUser.name, lastName: normalizedUser.lastName });
      
      return { success: true, user: normalizedUser };
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
}, [queryClient]);

 // =============================================
  // ✅ ACTUALIZADO: SIGN OUT - Usar SharedTokenBridge
  // =============================================
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 [Auth] Cerrando sesión...');
      
      // Intentar logout en servidor
      try {
        await authService.logout();
      } catch (error) {
        console.warn('⚠️ [Auth] Error en logout del servidor:', error);
      }
      
      // ✅ LIMPIAR CON SharedTokenBridge
      await sharedTokenBridge.clearToken();
      
      // También limpiar localStorage directo
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      Cookies.remove('authToken');
      
      // Limpiar cache de React Query
      queryClient.clear();
      
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [Auth] Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ [Auth] Error al cerrar sesión:', error);
      // Forzar logout local de todas formas
      await sharedTokenBridge.clearToken();
      localStorage.clear();
      Cookies.remove('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  }, [queryClient]);

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

  // =============================================
  // ✅ ACTUALIZADO: SET USER STATE - Usar SharedTokenBridge
  // =============================================
  const setUserState = useCallback(async (userData, token = null) => {
    try {
      if (userData) {
        console.log('🔄 [Auth] Actualizando estado de usuario...');
        
        if (token) {
          // ✅ GUARDAR CON SharedTokenBridge
          await sharedTokenBridge.saveToken(token, userData);
          
          // También mantener localStorage directo
          localStorage.setItem('authToken', token);
          Cookies.set('authToken', token, { expires: 7 });
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        console.log('✅ [Auth] Estado actualizado:', userData.email);
      } else {
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
    user: state.user,
    isLoading: state.isLoading,
    isSignedIn: state.isSignedIn,
    loading: state.isLoading,
    
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    
    setUserState,
    setUser: setUserState,
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