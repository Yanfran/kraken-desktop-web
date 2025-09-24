// src/services/auth/authService.js
import axios from 'axios';
import { API_URL } from '../../utils/config';

// Configurar axios instance para auth
const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir token en requests
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login de usuario
  async login(credentials) {
    try {
      const response = await authAPI.post('/login', credentials);
      return {
        token: response.data.token,
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          emailVerified: response.data.user.emailVerified || false,
          profileComplete: response.data.user.profileComplete || false,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName
        }
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  },

  // Registro de usuario
  async register(userData) {
    try {
      const response = await authAPI.post('/register', userData);
      return {
        message: response.data.message || 'Registro exitoso. Verifica tu email.',
        user: response.data.user
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al registrar usuario. Intenta de nuevo.'
      );
    }
  },

  // Validar token
  async validateToken(token) {
    try {
      const response = await authAPI.get('/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        id: response.data.user.id,
        email: response.data.user.email,
        emailVerified: response.data.user.emailVerified || false,
        profileComplete: response.data.user.profileComplete || false,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName
      };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  },

  // Verificar email
  async verifyEmail(token) {
    try {
      const response = await authAPI.post('/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al verificar email.'
      );
    }
  },

  // Reenviar email de verificación
  async resendVerification(email) {
    try {
      const response = await authAPI.post('/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al reenviar email de verificación.'
      );
    }
  },

  // Recuperar contraseña
  async forgotPassword(email) {
    try {
      const response = await authAPI.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al solicitar recuperación de contraseña.'
      );
    }
  },

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    try {
      const response = await authAPI.post('/reset-password', { 
        token, 
        password: newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al resetear contraseña.'
      );
    }
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await authAPI.put('/profile', profileData);
      return response.data.user;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar perfil.'
      );
    }
  },

  // Completar perfil
  async completeProfile(profileData) {
    try {
      const response = await authAPI.post('/complete-profile', profileData);
      return response.data.user;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Error al completar perfil.'
      );
    }
  },

  // Logout
  async logout() {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      // Log error but don't throw - logout should always succeed locally
      console.error('Error en logout del servidor:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }
};