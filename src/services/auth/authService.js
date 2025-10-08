// src/services/auth/authService.js - ADAPTADO A TU BACKEND REAL
import axios from 'axios';
import { API_URL } from '../../utils/config';

// Configurar axios instance
const authAPI = axios.create({
  baseURL: API_URL, // ✅ USA tu API_URL directamente
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir token en requests
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // ===== LOGIN - EXACTAMENTE COMO TU REACT NATIVE =====
   async login(credentials) {
    try {
      const response = await authAPI.post('/Users/login', {
        email: credentials.email,
        password: credentials.password
      });

      console.log('✅ [AuthService] Login response:', response.data);

      if (response.data.success) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || response.data.user.firstName,
          lastName: response.data.user.apellidos || response.data.user.lastName,
          emailVerified: response.data.user.emailVerified || true,
          profileComplete: response.data.user.profileComplete || false,
          clienteActivo: response.data.user.clienteActivo || true
        };

        // ✅ NUEVO: Guardar también el userId por separado
        localStorage.setItem('userId', userData.id.toString());
        console.log('✅ userId guardado en localStorage:', userData.id);

        return {
          success: true,
          token: response.data.token,
          user: userData
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en el login'
      };
    } catch (error) {
      console.error('❌ [AuthService] Login error:', error);
      
      if (error.response?.data?.code) {
        const errorCode = error.response.data.code;
        const errorField = error.response.data.field;
        
        const errorMessages = {
          'REQUIRED_FIELDS': 'Todos los campos son requeridos',
          'USER_NOT_FOUND': 'Email no encontrado',
          'INVALID_CREDENTIALS': 'Contraseña incorrecta',
          'ACCOUNT_INACTIVE': 'Cuenta inactiva. Contacta soporte.'
        };
        
        return {
          success: false,
          message: errorMessages[errorCode] || 'Error desconocido',
          field: errorField
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo.'
      };
    }
  },
  
  // ===== REGISTER - NUEVO MÉTODO =====
 async register(userData) {
    try {
      const response = await authAPI.post('/Users/register', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        last: userData.lastName
      });

      console.log('✅ [AuthService] Register response:', response.data);

      if (response.data.success) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || userData.name,
          lastName: response.data.user.apellidos || userData.lastName,
          emailVerified: false,
          profileComplete: false,
          clienteActivo: false
        };

        // ✅ NUEVO: Guardar también el userId por separado
        localStorage.setItem('userId', user.id.toString());
        console.log('✅ userId guardado en localStorage:', user.id);
        
        return {
          success: true,
          token: response.data.token,
          user: user
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en el registro'
      };
    } catch (error) {
      console.error('❌ [AuthService] Register error:', error);
      
      if (error.response?.data?.code) {
        const errorCode = error.response.data.code;
        const errorField = error.response.data.field;
        
        const errorMessages = {
          'USER_ALREADY_EXISTS': 'El email ya está registrado',
          'EMAIL_ALREADY_EXISTS': 'El email ya está registrado',
          'REQUIRED_FIELDS': 'Todos los campos son requeridos',
          'INVALID_EMAIL': 'Email inválido'
        };
        
        return {
          success: false,
          message: errorMessages[errorCode] || 'Error en el registro',
          field: errorField
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo.'
      };
    }
  },

  // En authService.js, agregar este método:
  async resendVerificationEmail(email) {
    try {
      const response = await authAPI.post('/Users/resend-verification-email', {
        email
      });

      return {
        success: response.data.success,
        message: response.data.message || 'Email de verificación enviado'
      };
    } catch (error) {
      console.error('❌ [AuthService] Resend verification error:', error);
      return {
        success: false,
        message: 'Error al reenviar email de verificación'
      };
    }
  },

  // ===== VALIDAR TOKEN (si tienes este endpoint) =====
  async validateToken(token) {
    try {
      const response = await authAPI.get('/Users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || response.data.user.firstName,
          lastName: response.data.user.apellidos || response.data.user.lastName,
          emailVerified: response.data.user.emailVerified || true,
          profileComplete: response.data.user.profileComplete || false,
          clienteActivo: response.data.user.clienteActivo || true
        };

        // ✅ NUEVO: Guardar también el userId por separado
        localStorage.setItem('userId', user.id.toString());
        console.log('✅ userId guardado en localStorage:', user.id);

        return user;
      }
      throw new Error(response.data.message || 'Token validation failed');
    } catch (error) {
      console.error('❌ [AuthService] Token validation error:', error);
      throw new Error('Token inválido o expirado');
    }
  },

  // ===== GOOGLE AUTH - COMO TU REACT NATIVE =====
  async loginWithGoogle(googleToken) {
    try {
      const response = await authAPI.post('/Users/google', {
        name: 'Usuario',
        email: 'google@temp.com',
        password: 'temp',
        last: 'Google'
      });

      if (response.data.success) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || response.data.user.firstName,
          lastName: response.data.user.apellidos || response.data.user.lastName,
          emailVerified: true,
          profileComplete: response.data.user.profileComplete || false,
          fromGoogle: true
        };

        // ✅ NUEVO: Guardar también el userId por separado
        localStorage.setItem('userId', user.id.toString());
        console.log('✅ userId guardado en localStorage:', user.id);
        
        return {
          success: true,
          token: response.data.token,
          user: user
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error con Google Auth'
      };
    } catch (error) {
      console.error('❌ [AuthService] Google auth error:', error);
      return {
        success: false,
        message: 'Error de autenticación con Google'
      };
    }
  },

  // ===== RECUPERAR CONTRASEÑA =====
  async forgotPassword(email) {
    try {
      const response = await authAPI.post('/Users/forgot-password', { email });
      return {
        success: true,
        message: 'Revisa tu email para resetear la contraseña'
      };
    } catch (error) {
      console.error('❌ [AuthService] Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar email'
      };
    }
  },

  // ===== LOGOUT =====
  async logout() {
    try {
      await authAPI.post('/Users/logout');
    } catch (error) {
      console.warn('⚠️ [AuthService] Logout error:', error);
    } finally {
      // ✅ NUEVO: Limpiar también el userId
      localStorage.removeItem('userId');
      console.log('✅ userId eliminado del localStorage');
    }
  },
};