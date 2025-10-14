// src/services/auth/authService.js - SERVICIO DE AUTENTICACIÓN COMPLETO
import axios from 'axios';
import { API_URL } from '../../utils/config';

// Configurar axios instance
const authAPI = axios.create({
  baseURL: API_URL,
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
  // ===== LOGIN - CON TODOS LOS CAMPOS DEL USUARIO =====
  async login(credentials) {
    try {
      const response = await authAPI.post('/Users/login', {
        email: credentials.email,
        password: credentials.password
      });

      console.log('✅ [AuthService] Login response completa:', response.data);

      if (response.data.success) {
        // ✅ GUARDAR TODOS LOS CAMPOS DEL USUARIO
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          
          // Nombres (mapear ambos formatos)
          name: response.data.user.nombres || response.data.user.name,
          lastName: response.data.user.apellidos || response.data.user.lastName,
          nombres: response.data.user.nombres,
          apellidos: response.data.user.apellidos,
          
          // Teléfonos
          phone: response.data.user.telefonoCelular,
          phoneSecondary: response.data.user.telefonoCelularSecundario,
          telefonoCelular: response.data.user.telefonoCelular,
          telefonoCelularSecundario: response.data.user.telefonoCelularSecundario,
          
          // Documento de identidad
          idNumber: response.data.user.nroIdentificacionCliente,
          nroIdentificacionCliente: response.data.user.nroIdentificacionCliente,
          nro: response.data.user.nroIdentificacionCliente,
          idClienteTipoIdentificacion: response.data.user.idClienteTipoIdentificacion,
          
          // Fecha de nacimiento
          birthday: response.data.user.fechaNacimiento,
          fechaNacimiento: response.data.user.fechaNacimiento,
          
          // Avatar
          avatarId: response.data.user.avatarId,
          
          // Estados
          emailVerified: response.data.user.emailVerified ?? true,
          profileComplete: response.data.user.profileComplete ?? false,
          clienteActivo: response.data.user.clienteActivo ?? true,
          fromGoogle: response.data.user.fromGoogle ?? false,
          
          // Código de cliente
          codCliente: response.data.user.codCliente,
          idClienteTipo: response.data.user.idClienteTipo
        };

        localStorage.setItem('userId', userData.id.toString());
        console.log('✅ [AuthService] Usuario completo guardado:', userData);

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
  
  // ===== REGISTER =====
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
          nombres: response.data.user.nombres,
          apellidos: response.data.user.apellidos,
          emailVerified: false,
          profileComplete: false,
          clienteActivo: false
        };

        localStorage.setItem('userId', user.id.toString());
        
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

  // ===== VALIDAR TOKEN =====
  async validateToken(token) {
    try {
      const response = await authAPI.get('/Users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.user) {
        // Retornar todos los campos del usuario
        return {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || response.data.user.name,
          lastName: response.data.user.apellidos || response.data.user.lastName,
          nombres: response.data.user.nombres,
          apellidos: response.data.user.apellidos,
          phone: response.data.user.telefonoCelular,
          phoneSecondary: response.data.user.telefonoCelularSecundario,
          telefonoCelular: response.data.user.telefonoCelular,
          telefonoCelularSecundario: response.data.user.telefonoCelularSecundario,
          idNumber: response.data.user.nroIdentificacionCliente,
          nroIdentificacionCliente: response.data.user.nroIdentificacionCliente,
          idClienteTipoIdentificacion: response.data.user.idClienteTipoIdentificacion,
          birthday: response.data.user.fechaNacimiento,
          fechaNacimiento: response.data.user.fechaNacimiento,
          avatarId: response.data.user.avatarId,
          emailVerified: response.data.user.emailVerified ?? true,
          profileComplete: response.data.user.profileComplete ?? false,
          clienteActivo: response.data.user.clienteActivo ?? true,
          fromGoogle: response.data.user.fromGoogle ?? false,
          codCliente: response.data.user.codCliente,
          idClienteTipo: response.data.user.idClienteTipo
        };
      }
      
      throw new Error('Token inválido');
    } catch (error) {
      console.error('❌ [AuthService] Token validation error:', error);
      throw new Error('Token inválido o expirado');
    }
  },

  // ===== 🔥 GOOGLE AUTH - ACTUALIZADO PARA COINCIDIR CON TU BACKEND =====
  async loginWithGoogle(idToken) {
    try {
      console.log('🔵 [AuthService] Enviando ID Token a backend...');
      
      // 🔥 PASO 1: Decodificar el JWT de Google para obtener info del usuario
      const decoded = this.decodeJWT(idToken);
      console.log('👤 [AuthService] Usuario de Google decodificado:', decoded.email);

      // 🔥 PASO 2: Crear password falso basado en el ID de Google
      const fakePassword = decoded.sub + '_google';
      const firstName = decoded.given_name || decoded.name?.split(' ')[0] || decoded.name;
      const lastName = decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || '';

      // 🔥 PASO 3: Intentar REGISTRO primero (igual que en tu app móvil)
      try {
        console.log('🔵 [AuthService] Intentando REGISTRO con Google...');
        const registerResponse = await authAPI.post('/Users/google', {
          name: firstName,
          email: decoded.email,
          password: fakePassword,
          last: lastName
        });

        if (registerResponse.data.success && registerResponse.data.token && registerResponse.data.user) {
          console.log('✅ [AuthService] Usuario REGISTRADO con Google');
          
          const userData = this.mapUserData(registerResponse.data.user);
          localStorage.setItem('userId', userData.id.toString());
          
          return {
            success: true,
            token: registerResponse.data.token,
            user: userData
          };
        }
      } catch (registerError) {
        console.log('⚠️ [AuthService] Registro falló (probablemente usuario ya existe), intentando LOGIN...');
      }

      // 🔥 PASO 4: Si el registro falla, intentar LOGIN (igual que en tu app)
      console.log('🔵 [AuthService] Intentando LOGIN con Google...');
      const loginResponse = await authAPI.post('/Users/google', {
        name: firstName,
        email: decoded.email,
        password: fakePassword,
        last: lastName
      });

      if (loginResponse.data.success && loginResponse.data.token && loginResponse.data.user) {
        console.log('✅ [AuthService] Usuario LOGUEADO con Google');
        
        const userData = this.mapUserData(loginResponse.data.user);
        localStorage.setItem('userId', userData.id.toString());
        
        return {
          success: true,
          token: loginResponse.data.token,
          user: userData
        };
      }

      return {
        success: false,
        message: loginResponse.data.message || 'Error con Google Auth'
      };

    } catch (error) {
      console.error('❌ [AuthService] Google auth error:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Error de autenticación con Google'
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión con Google'
      };
    }
  },

  // ===== FORGOT PASSWORD =====
  async forgotPassword(email) {
    try {
      const response = await authAPI.post('/Users/forgot-password', {
        email: email
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [AuthService] Forgot password error:', error);
      return {
        success: false,
        message: 'Error al enviar email de recuperación'
      };
    }
  },

  // ===== RESET PASSWORD =====
  async resetPassword(token, newPassword) {
    try {
      const response = await authAPI.post('/Users/reset-password', {
        token: token,
        newPassword: newPassword
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [AuthService] Reset password error:', error);
      return {
        success: false,
        message: 'Error al restablecer contraseña'
      };
    }
  },

  // ===== RESEND VERIFICATION EMAIL =====
  async resendVerificationEmail(email) {
    try {
      const response = await authAPI.post('/Users/resend-verification', {
        email: email
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [AuthService] Resend verification error:', error);
      return {
        success: false,
        message: 'Error al reenviar email de verificación'
      };
    }
  },

  // ===== LOGOUT =====
  async logout() {
    try {
      // Si tu backend tiene endpoint de logout, úsalo aquí
      // await authAPI.post('/Users/logout');
      
      // Limpiar storage local
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [AuthService] Logout error:', error);
      // Igualmente limpiar storage aunque falle el servidor
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      return { success: true };
    }
  }
};