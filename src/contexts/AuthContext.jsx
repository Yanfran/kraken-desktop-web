// src/contexts/AuthContext.jsx - Adaptado completo de tu React Native
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { authService } from '../services/auth/authService';
import { googleService } from '../services/auth/googleService';
import Cookies from 'js-cookie';

// ===== TIPOS (adaptados de tu TypeScript) =====
const UserType = {
  id: '',
  email: '',
  name: '',
  lastName: '',
  emailVerified: false,
  fromGoogle: false,
  profileComplete: false,
  clienteActivo: false,
  phone: '',
  nro: '',
  codCliente: '',
  birthday: null,
  phoneSecondary: '',
  avatarId: ''
};

// ===== ESTADO INICIAL =====
const initialState = {
  user: null,
  isLoading: true,
  isSignedIn: false,
  error: null
};

// ===== REDUCER (igual que React Native) =====
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
    
    default:
      return state;
  }
}

// ===== CONTEXTO =====
const AuthContext = createContext({
  user: null,
  isLoading: true,
  isSignedIn: false,
  signIn: async () => ({ success: false, message: 'Not implemented' }),
  signOut: async () => {},
  signUp: async () => ({ success: false, message: 'Not implemented' }),
  signInWithGoogle: async () => ({ success: false, message: 'Not implemented' }),
  setUserState: async () => {},
  resendVerificationEmail: async () => ({ success: false, message: 'Not implemented' })
});

// ===== PROVIDER =====
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // REF para manejo de Google Auth (como en React Native)
  const googleAuthState = useRef({
    isProcessing: false,
    resolver: null,
    userInfo: null
  });

  // ===== VERIFICAR TOKEN AL CARGAR =====
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: 'LOADING' });
        
        const token = localStorage.getItem('authToken') || Cookies.get('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          // Validar token con el servidor
          try {
            const validatedUser = await authService.validateToken(token);
            dispatch({ type: 'LOGIN_SUCCESS', payload: validatedUser });
            console.log('✅ [Auth] Usuario autenticado desde storage');
          } catch (error) {
            console.warn('⚠️ [Auth] Token inválido, limpiando storage');
            await signOut();
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('❌ [Auth] Error al verificar autenticación:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // ===== FUNCIÓN DE LOGIN =====
  const signIn = async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await authService.login({ email, password });
      
      if (response.success) {
        // Guardar en storage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        Cookies.set('authToken', response.token, { expires: 7 }); // 7 días
        
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
  };

  // ===== FUNCIÓN DE REGISTRO =====
  const signUp = async (userData) => {
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
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo.'
      };
    }
  };

  

  // ===== FUNCIÓN DE GOOGLE SIGN IN =====
  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'LOADING' });
      
      // Inicializar Google Auth si no está disponible
      if (!window.google) {
        await googleService.loadGoogleScript();
      }

      const googleResponse = await googleService.signIn();
      
      if (googleResponse.success) {
        const authResponse = await authService.loginWithGoogle(googleResponse.token);
        
        if (authResponse.success) {
          // Guardar en storage
          localStorage.setItem('authToken', authResponse.token);
          localStorage.setItem('userData', JSON.stringify(authResponse.user));
          Cookies.set('authToken', authResponse.token, { expires: 7 });
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: authResponse.user });
          console.log('✅ [Auth] Google login exitoso');
          
          return { success: true };
        }
      }
      
      dispatch({ type: 'ERROR', payload: 'Error con autenticación de Google' });
      return { success: false, message: 'Error con autenticación de Google' };
    } catch (error) {
      console.error('❌ [Auth] Google sign in error:', error);
      dispatch({ type: 'ERROR', payload: 'Error con Google' });
      return { success: false, message: 'Error con Google' };
    }
  };

  // ===== FUNCIÓN DE LOGOUT =====
  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('⚠️ [Auth] Error en logout del servidor:', error);
    } finally {
      // Limpiar storage siempre
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      Cookies.remove('authToken');
      
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [Auth] Logout exitoso');
    }
  };

  const confirmEmail = () => {
    console.log('✅ [AuthContext] Confirmando email...');
    
    if (state.user) {
      const updatedUser = {
        ...state.user,
        emailVerified: true,
        fromEmail: true
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: { emailVerified: true, fromEmail: true } });
      
      console.log('✅ [AuthContext] Email confirmado');
    }
  };


  // ===== FUNCIÓN PARA ACTUALIZAR USUARIO =====
  const setUserState = async (userData, token = null) => {
    if (userData) {
      console.log('🔄 [AuthContext] setUserState - Actualizando usuario:', userData);
      
      // Guardar en localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      if (token) {
        localStorage.setItem('authToken', token);
        Cookies.set('authToken', token, { expires: 7 });
      }
      
      // ✅ SIEMPRE despachar al reducer para actualizar el contexto
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      
      console.log('✅ [AuthContext] Usuario actualizado en el contexto');
    } else {
      await signOut();
    }
  };

  // ===== REENVIAR EMAIL DE VERIFICACIÓN =====
  const resendVerificationEmail = async (email) => {
    try {
      const response = await authService.resendVerificationEmail(email);
      return response;
    } catch (error) {
      console.error('[AuthContext] Resend verification error:', error);
      return {
        success: false,
        message: 'Error al reenviar email de verificación'
      };
    }
  };

  // ===== VALOR DEL CONTEXTO =====
  const value = {
    user: state.user,
    isLoading: state.isLoading,
    isSignedIn: state.isSignedIn,
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    confirmEmail,
    setUserState,
    resendVerificationEmail  
  };

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