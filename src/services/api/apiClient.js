// src/services/auth/authService.js - Adaptado de tu sistema React Native
import apiClient from '../api/apiClient';

export const authService = {
  // ===== LOGIN =====
  async login(credentials) {
    try {
      const response = await apiClient.post('/users/login', {
        email: credentials.email,
        password: credentials.password
      });

      if (response.data.success) {
        return {
          success: true,
          token: response.data.token,
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.firstName || response.data.user.nombres,
            lastName: response.data.user.lastName || response.data.user.apellidos,
            emailVerified: response.data.user.emailVerified || true, // Por defecto true en web
            profileComplete: response.data.user.profileComplete || false,
            clienteActivo: response.data.user.clienteActivo || true
          }
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en el login'
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      
      // Manejo de errores específicos de tu backend
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

  // ===== REGISTRO =====
  async register(userData) {
    try {
      const response = await apiClient.post('/users/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.name,
        lastName: userData.lastName
      });

      if (response.data.success) {
        return {
          success: true,
          message: 'Registro exitoso. Verifica tu email.'
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en el registro'
      };
    } catch (error) {
      console.error('[AuthService] Register error:', error);
      
      if (error.response?.data?.code) {
        const errorCode = error.response.data.code;
        
        const errorMessages = {
          'EMAIL_EXISTS': 'El email ya está registrado',
          'REQUIRED_FIELDS': 'Todos los campos son requeridos',
          'INVALID_EMAIL': 'Email inválido',
          'WEAK_PASSWORD': 'La contraseña debe tener al menos 8 caracteres'
        };
        
        return {
          success: false,
          message: errorMessages[errorCode] || 'Error en el registro',
          field: error.response.data.field
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo.'
      };
    }
  },

  // ===== VALIDAR TOKEN =====
  async validateToken(token) {
    try {
      const response = await apiClient.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.firstName || response.data.user.nombres,
        lastName: response.data.user.lastName || response.data.user.apellidos,
        emailVerified: response.data.user.emailVerified || true,
        profileComplete: response.data.user.profileComplete || false,
        clienteActivo: response.data.user.clienteActivo || true
      };
    } catch (error) {
      console.error('[AuthService] Token validation error:', error);
      throw new Error('Token inválido o expirado');
    }
  },

  // ===== GOOGLE AUTH =====
  async loginWithGoogle(googleToken) {
    try {
      const response = await apiClient.post('/users/google-auth', {
        googleToken: googleToken
      });

      if (response.data.success) {
        return {
          success: true,
          token: response.data.token,
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.firstName || response.data.user.nombres,
            lastName: response.data.user.lastName || response.data.user.apellidos,
            emailVerified: true, // Google siempre viene verificado
            profileComplete: response.data.user.profileComplete || false,
            fromGoogle: true
          }
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error con Google Auth'
      };
    } catch (error) {
      console.error('[AuthService] Google auth error:', error);
      return {
        success: false,
        message: 'Error de autenticación con Google'
      };
    }
  },

  // ===== RECUPERAR CONTRASEÑA =====
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/users/forgot-password', { email });
      return {
        success: true,
        message: 'Revisa tu email para resetear la contraseña'
      };
    } catch (error) {
      console.error('[AuthService] Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar email'
      };
    }
  },

  // ===== REENVIAR VERIFICACIÓN =====
  async resendVerificationEmail(email) {
    try {
      const response = await apiClient.post('/users/resend-verification', { email });
      return {
        success: true,
        message: 'Email de verificación enviado'
      };
    } catch (error) {
      console.error('[AuthService] Resend verification error:', error);
      return {
        success: false,
        message: 'Error al reenviar verificación'
      };
    }
  },

  // ===== LOGOUT =====
  async logout() {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      console.warn('[AuthService] Logout error:', error);
      // No lanzamos error en logout, siempre debe funcionar localmente
    }
  }
};