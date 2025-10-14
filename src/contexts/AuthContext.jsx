// src/contexts/AuthContext.jsx - CORREGIDO con persistencia de sesión
import React, { createContext, useContext, useEffect, useReducer, useRef, useMemo, useCallback } from 'react';
import { authService } from '../services/auth/authService';
import { googleService } from '../services/auth/googleService';
import Cookies from 'js-cookie';

// ===== ESTADO INICIAL =====
const initialState = {
  user: null,
  isLoading: true, // ✅ Comienza en true para verificar sesión
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
  confirmEmail: () => {},
  resendVerificationEmail: async () => ({ success: false, message: 'Not implemented' })
});

// ===== PROVIDER =====
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const googleAuthState = useRef({
    isProcessing: false,
    resolver: null,
    userInfo: null
  });

  // ===== 🔥 VERIFICAR TOKEN AL CARGAR - CRÍTICO =====
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔍 [Auth] Verificando sesión...');
        dispatch({ type: 'LOADING' });
        
        // Buscar token en localStorage Y cookies
        const token = localStorage.getItem('authToken') || Cookies.get('authToken');
        const userDataStr = localStorage.getItem('userData');

        if (token && userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            
            // ✅ VALIDAR TOKEN CON EL SERVIDOR
            const validatedUser = await authService.validateToken(token);
            
            console.log('✅ [Auth] Sesión válida restaurada:', validatedUser.email);
            dispatch({ type: 'LOGIN_SUCCESS', payload: validatedUser });
          } catch (error) {
            console.warn('⚠️ [Auth] Token inválido, limpiando storage');
            // Limpiar storage si el token es inválido
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
  }, []); // ✅ Solo ejecutar una vez al montar

  // ===== FUNCIONES MEMOIZADAS =====
  const signIn = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await authService.login({ email, password });
      
      if (response.success) {
        // Guardar en localStorage Y cookies
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        Cookies.set('authToken', response.token, { expires: 7 });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        console.log('✅ [Auth] Login exitoso');
        return { success: true };
      } else {
        dispatch({ type: 'ERROR', payload: response.message });
        return response;
      }
    } catch (error) {
      const errorMessage = 'Error de conexión. Intenta de nuevo.';
      dispatch({ type: 'ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authService.register({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password
      });

      if (result.success && result.token) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.user));
        Cookies.set('authToken', result.token, { expires: 7 });

        dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        return { success: true };
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: 'Error de conexión. Intenta de nuevo.' };
    }
  }, []);

  // ===== 🔥 SIGN IN CON GOOGLE =====
  const signInWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('🔵 [Auth] Iniciando Google Sign-In...');
      
      // Paso 1: Obtener credencial de Google
      const googleResponse = await googleService.signIn();
      
      if (!googleResponse.success || !googleResponse.credential) {
        dispatch({ type: 'ERROR' });
        return { success: false, message: 'Error con autenticación de Google' };
      }

      console.log('✅ [Auth] Credencial de Google obtenida');

      // Paso 2: Decodificar el JWT para obtener info del usuario
      const decoded = googleService.decodeJWT(googleResponse.credential);
      console.log('👤 [Auth] Usuario de Google:', decoded.email);

      // Paso 3: Enviar el token al backend
      const authResponse = await authService.loginWithGoogle(googleResponse.credential);
      
      if (authResponse.success) {
        localStorage.setItem('authToken', authResponse.token);
        localStorage.setItem('userData', JSON.stringify(authResponse.user));
        Cookies.set('authToken', authResponse.token, { expires: 7 });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: authResponse.user });
        console.log('✅ [Auth] Google login exitoso');
        
        return { success: true, user: authResponse.user };
      } else {
        dispatch({ type: 'ERROR' });
        return { success: false, message: authResponse.message };
      }
    } catch (error) {
      console.error('❌ [Auth] Google sign in error:', error);
      dispatch({ type: 'ERROR' });
      return { success: false, message: 'Error con Google. Intenta nuevamente.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('⚠️ [Auth] Error en logout del servidor:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      Cookies.remove('authToken');
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [Auth] Logout exitoso');
    }
  }, []);

  const confirmEmail = useCallback(() => {
    if (state.user) {
      const updatedUser = { ...state.user, emailVerified: true, fromEmail: true };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: { emailVerified: true, fromEmail: true } });
      console.log('✅ [AuthContext] Email confirmado');
    }
  }, [state.user]);

  const setUserState = useCallback(async (userData, token = null) => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('authToken', token);
        Cookies.set('authToken', token, { expires: 7 });
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    } else {
      await signOut();
    }
  }, [signOut]);

  const resendVerificationEmail = useCallback(async (email) => {
    try {
      return await authService.resendVerificationEmail(email);
    } catch (error) {
      console.error('[AuthContext] Resend verification error:', error);
      return { success: false, message: 'Error al reenviar email de verificación' };
    }
  }, []);

  // ===== VALOR DEL CONTEXTO MEMOIZADO =====
  const value = useMemo(() => ({
    user: state.user,
    isLoading: state.isLoading,
    isSignedIn: state.isSignedIn,
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    confirmEmail,
    setUserState,
    setUser: setUserState,
    resendVerificationEmail
  }), [state.user, state.isLoading, state.isSignedIn, signIn, signOut, signUp, signInWithGoogle, confirmEmail, setUserState, resendVerificationEmail]);

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};