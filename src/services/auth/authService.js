// src/services/auth/authService.js - CORREGIDO COMPLETAMENTE
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

// ===== 🔥 FUNCIONES HELPER FUERA DEL OBJETO =====
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ [AuthService] Error decodificando JWT:', error);
    throw new Error('Token de Google inválido');
  }
};

const mapUserData = (serverUser) => {
  // ✅ NORMALIZAR: Crear campos "name" y "lastName" SIEMPRE
  return {
    id: serverUser.id,
    email: serverUser.email,
    
    // ✅ CAMPOS NORMALIZADOS (los que usa el frontend)
    name: serverUser.nombres || serverUser.name,
    lastName: serverUser.apellidos || serverUser.lastName,
    phone: serverUser.telefonoCelular || serverUser.phone,
    phoneSecondary: serverUser.telefonoCelularSecundario || serverUser.phoneSecondary,
    nro: serverUser.nroIdentificacionCliente || serverUser.nro,
    birthday: serverUser.fechaNacimiento || serverUser.birthday,
    
    // ✅ TAMBIÉN MANTENER CAMPOS ORIGINALES (por compatibilidad)
    nombres: serverUser.nombres,
    apellidos: serverUser.apellidos,
    telefonoCelular: serverUser.telefonoCelular,
    telefonoCelularSecundario: serverUser.telefonoCelularSecundario,
    nroIdentificacionCliente: serverUser.nroIdentificacionCliente,
    fechaNacimiento: serverUser.fechaNacimiento,
    
    // ✅ OTROS CAMPOS
    idClienteTipoIdentificacion: serverUser.idClienteTipoIdentificacion,
    avatarId: serverUser.avatarId || '1',
    emailVerified: serverUser.emailVerified ?? serverUser.fromEmail ?? true,
    profileComplete: serverUser.profileComplete ?? false,
    clienteActivo: serverUser.clienteActivo ?? true,
    fromGoogle: serverUser.fromGoogle ?? false,
    fromEmail: serverUser.fromEmail ?? false,
    codCliente: serverUser.codCliente,
    idClienteTipo: serverUser.idClienteTipo
  };
};

// ===== OBJETO PRINCIPAL =====
export const authService = {
  // ===== LOGIN =====
  async login(credentials) {
    try {
      const response = await authAPI.post('/Users/login', {
        email: credentials.email,
        password: credentials.password
      });

      // console.log('✅ [AuthService] Login response completa:', response.data);

      if (response.data.success) {
        const userData = {
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
          nro: response.data.user.nroIdentificacionCliente,
          idClienteTipoIdentificacion: response.data.user.idClienteTipoIdentificacion,
          birthday: response.data.user.fechaNacimiento,
          fechaNacimiento: response.data.user.fechaNacimiento,
          avatarId: response.data.user.avatarId || '1',
          emailVerified: response.data.user.emailVerified ?? true,
          profileComplete: response.data.user.profileComplete ?? false,
          clienteActivo: response.data.user.clienteActivo ?? true,
          fromGoogle: response.data.user.fromGoogle ?? false,
          codCliente: response.data.user.codCliente,
          idClienteTipo: response.data.user.idClienteTipo
        };

        localStorage.setItem('userId', userData.id.toString());
        // console.log('✅ [AuthService] Usuario completo guardado:', userData);

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

      // console.log('✅ [AuthService] Register response:', response.data);

      if (response.data.success) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || userData.name,
          lastName: response.data.user.apellidos || userData.lastName,
          nombres: response.data.user.nombres,
          apellidos: response.data.user.apellidos,
          avatarId: response.data.user.avatarId || '1',
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
          avatarId: response.data.user.avatarId || '1',
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

  // ===== 🔥 GOOGLE AUTH - SIN THIS =====
  async loginWithGoogle(tokenOrCredential) {
  try {
    // console.log('🔵 [AuthService] Procesando Google auth...');
    
    let userEmail, firstName, lastName, userId;
    
    // Verificar si es un JWT (tiene 3 partes separadas por puntos)
    const isJWT = tokenOrCredential.includes('.') && tokenOrCredential.split('.').length === 3;
    
    if (isJWT) {
      // Es un ID Token JWT - decodificar
      // console.log('🔵 [AuthService] Procesando ID Token JWT...');
      const decoded = decodeJWT(tokenOrCredential);
      userEmail = decoded.email;
      firstName = decoded.given_name || decoded.name?.split(' ')[0] || decoded.name;
      lastName = decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || '';
      userId = decoded.sub;
    } else {
      // Es un Access Token - obtener info del usuario de Google
      // console.log('🔵 [AuthService] Procesando Access Token, obteniendo info del usuario...');
      
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenOrCredential}` },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('No se pudo obtener info del usuario de Google');
        }
        
        const userInfo = await userInfoResponse.json();
        // console.log('👤 [AuthService] Info del usuario obtenida:', userInfo.email);
        
        userEmail = userInfo.email;
        firstName = userInfo.given_name || userInfo.name?.split(' ')[0] || userInfo.name;
        lastName = userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '';
        userId = userInfo.sub;
      } catch (fetchError) {
        console.error('❌ [AuthService] Error obteniendo info del usuario:', fetchError);
        throw new Error('No se pudo obtener información del usuario de Google');
      }
    }

    const fakePassword = userId + '_google';

    // Intentar REGISTRO primero
    try {
      // console.log('🔵 [AuthService] Intentando REGISTRO con Google...');
      const registerResponse = await authAPI.post('/Users/google', {
        name: firstName,
        email: userEmail,
        password: fakePassword,
        last: lastName
      });

      if (registerResponse.data.success && registerResponse.data.token && registerResponse.data.user) {
        // console.log('✅ [AuthService] Usuario REGISTRADO con Google');
        
        const userData = mapUserData(registerResponse.data.user);
        localStorage.setItem('userId', userData.id.toString());
        
        return {
          success: true,
          token: registerResponse.data.token,
          user: userData
        };
      }
    } catch (registerError) {
      // console.log('⚠️ [AuthService] Registro falló, intentando LOGIN...');
    }

    // Si el registro falla, intentar LOGIN
    // console.log('🔵 [AuthService] Intentando LOGIN con Google...');
    const loginResponse = await authAPI.post('/Users/google', {
      name: firstName,
      email: userEmail,
      password: fakePassword,
      last: lastName
    });

    if (loginResponse.data.success && loginResponse.data.token && loginResponse.data.user) {
      // console.log('✅ [AuthService] Usuario LOGUEADO con Google');
      
      const userData = mapUserData(loginResponse.data.user);
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
      message: error.message || 'Error de conexión con Google'
    };
  }
},

  // ===== OTROS MÉTODOS =====
  async forgotPassword(email) {
    try {
      const response = await authAPI.post('/Users/forgot-password', { email });
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

  async resetPassword(token, newPassword) {
    try {
      const response = await authAPI.post('/Users/reset-password', {
        token,
        newPassword
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

  async resendVerificationEmail(email) {
    try {
      const response = await authAPI.post('/Users/resend-verification-email', { email });
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

  async logout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      return { success: true };
    } catch (error) {
      console.error('❌ [AuthService] Logout error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      return { success: true };
    }
  }
};