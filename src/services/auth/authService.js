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

// authAPI is only used for auth endpoints (login, register, validateToken, etc.)
// Each caller handles errors themselves — no automatic redirect or storage clear here.
authAPI.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
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
      
      // Usuario nuevo con correo sin verificar: tokenVerify presente → redirigir a confirmación
      if (response.data.tokenVerify) {
        return {
          success: false,
          tokenVerify: response.data.tokenVerify,
          message: response.data.message || 'Verifica tu correo electrónico',
        };
      }

      // Cuenta deshabilitada por el administrador: sin tokenVerify + clienteActivo false
      if (response.data.user?.clienteActivo === false) {
        return {
          success: false,
          message: 'Tu cuenta ha sido deshabilitada. Contacta al administrador.',
          code: 'ACCOUNT_INACTIVE',
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error en el login',
      };
    } catch (error) {
      // console.error('❌ [AuthService] Login error:', error);
      
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
        message: 'Sin conexión. Intenta de nuevo.'
      };
    }
  },
  
  // ===== CHECK EMAIL =====
  async checkEmailExists(email) {
    try {
      const response = await authAPI.get(`/Users/check-email?email=${encodeURIComponent(email)}`);
      return {
        exists: response.data?.exists ?? false,
        isKU:   response.data?.isKU   ?? false,
      };
    } catch {
      return { exists: false, isKU: false };
    }
  },

  // ===== REGISTER =====
  async register(userData) {
    try {
      const response = await authAPI.post('/Users/register', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        last: userData.lastName,
        clientPrefix: userData.clientPrefix ?? 'KV',
        fromWizard: userData.fromWizard ?? false,
      });

      // console.log('✅ [AuthService] Register response:', response.data);

      if (response.data.success) {
        const serverUser = response.data.user;
        const user = {
          id: serverUser.id,
          email: serverUser.email,
          name: serverUser.nombres || userData.name,
          lastName: serverUser.apellidos || userData.lastName,
          nombres: serverUser.nombres,
          apellidos: serverUser.apellidos,
          avatarId: serverUser.avatarId || '1',
          emailVerified: userData.fromWizard ? true : (serverUser.emailVerified ?? false),
          profileComplete: serverUser.profileComplete ?? false,
          clienteActivo: serverUser.clienteActivo ?? (userData.fromWizard ? true : false),
          codCliente: serverUser.codCliente ?? null,
          idClienteTipo: serverUser.idClienteTipo ?? null,
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
        message: 'Sin conexión. Intenta de nuevo.'
      };
    }
  },

  // ===== VALIDAR TOKEN =====
  async validateToken(token) {
    try {
      // Use [AllowAnonymous] endpoint — inactive users return 404 (not 401),
      // so the interceptor never fires and initAuth falls back to cached userData.
      const response = await authAPI.post('/Users/validate-token', { token });

      if (response.data.success && response.data.user) {
        return {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.nombres || response.data.user.name,
          lastName: response.data.user.apellidos || response.data.user.lastName,
          nombres: response.data.user.nombres,
          apellidos: response.data.user.apellidos,
          phone: response.data.user.telefonoCelular,
          telefonoCelular: response.data.user.telefonoCelular,
          idNumber: response.data.user.nroIdentificacionCliente,
          nroIdentificacionCliente: response.data.user.nroIdentificacionCliente,
          idClienteTipoIdentificacion: response.data.user.idClienteTipoIdentificacion,
          avatarId: response.data.user.avatarId || '1',
          emailVerified: response.data.user.emailVerified ?? response.data.user.fromEmail ?? true,
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
  // El backend verifica el token con Google (id token o access token) y decide según intent:
  // 'register' crea la cuenta o inicia sesión si ya existe; 'login' solo inicia sesión.
  async loginWithGoogle(tokenOrCredential, clientPrefix = 'KV', intent = 'register') {
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

    // Una sola llamada: el backend verifica el token con Google y, según intent,
    // crea la cuenta (registro) o solo inicia sesión (login).
    const response = await authAPI.post('/Users/google', {
      name: firstName,
      email: userEmail,
      password: fakePassword,
      last: lastName,
      clientPrefix,
      intent,
      // El botón propio (useGoogleLogin) entrega access token; el botón oficial, id token (JWT)
      ...(isJWT ? { idToken: tokenOrCredential } : { accessToken: tokenOrCredential }),
    });

    if (response.data.success && response.data.token && response.data.user) {
      const userData = mapUserData(response.data.user);
      localStorage.setItem('userId', userData.id.toString());

      return {
        success: true,
        token: response.data.token,
        user: userData
      };
    }

    return {
      success: false,
      message: response.data.message || 'Error con Google Auth',
      code: response.data.code
    };

  } catch (error) {
    console.error('❌ [AuthService] Google auth error:', error);

    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Error de autenticación con Google',
        code: error.response.data.code
      };
    }
    
    return {
      success: false,
      message: error.message || 'Sin conexión con Google'
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
        message: 'No pudimos enviar el email de recuperación'
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
        message: 'No pudimos restablecer la contraseña'
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
        message: 'No pudimos reenviar el email de verificación'
      };
    }
  },

  // Pide un token nuevo con la sesión actual (aún válida) para que no caduque.
  // Si falla (sin conexión, token ya caducado) no hace nada: se reintenta más tarde.
  async renewToken() {
    try {
      const response = await authAPI.post('/Users/renovar-token');
      return response.data;
    } catch {
      return { success: false };
    }
  },

  async logout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenRenewedAt');
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