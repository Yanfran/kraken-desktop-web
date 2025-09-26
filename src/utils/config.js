// src/utils/config.js - CONFIGURACIÓN CON TU BACKEND REAL
export const API_CONFIG = {
  // ✅ USA LA MISMA URL QUE TU REACT NATIVE
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7031/api',
  TIMEOUT: 30000,
  
  // ✅ ENDPOINTS REALES DE TU BACKEND
  ENDPOINTS: {
    // Auth - EXACTOS DE TU BACKEND
    AUTH: {
      LOGIN: '/Users/login',
      REGISTER: '/Users/register',
      GOOGLE: '/Users/google',
      FORGOT_PASSWORD: '/Users/forgot-password',
      RESET_PASSWORD: '/Users/reset-password',
      VERIFY_EMAIL: '/Users/verify-email',
      UPDATE_PROFILE: '/Users/update-profile',
      RESET_PASSWORD_PROFILE: '/Users/reset-password-profile',
    },
    
    // Calculator
    CALCULATOR: {
      CALCULATE: '/calculator/calculate',
      RATES: '/calculator/rates',
    },
    
    // Address - BASADO EN TU addressService
    ADDRESS: {
      LIST: '/Casilleros/list',
    },
    
    // Pre-alerts - BASADO EN TU preAlertService
    PRE_ALERTS: {
      GET_ALL: (userId) => `/PostPreAlert/getPreAlertas/${userId}`,
      GET_PENDING: '/PostPreAlert/getPreAlertasPendientes',
      CREATE: '/PostPreAlert/create',
      UPDATE: (id) => `/PostPreAlert/update/${id}`,
      DELETE: (id) => `/PostPreAlert/delete/${id}`,
    },
    
    // Packages - BASADO EN TU packegeContentService
    PACKAGES: {
      CONTENTS: '/PaqueteContenidos/getContent',
    },
    
    // Novedades - BASADO EN TU novedadesService
    NEWS: {
      LIST: '/Novedades/list',
    },
    
    // Guides - BASADO EN TU guiasService
    GUIDES: {
      LIST: '/guias',
      DETAIL: (id) => `/guias/${id}`,
      UPLOAD_INVOICE: (id) => `/guias/${id}/upload-invoice`,
    },
    
    // Payment - BASADO EN TU PaymentController
    PAYMENT: {
      MERCANTIL_AUTH: '/payment/mercantil/auth',
      MERCANTIL_PAY: '/payment/mercantil/card/pay',
      MOBILE_PAYMENT: '/payment/mobile',
      GET_DATA: (id) => `/payment/${id}/data`,
      GET_MULTIPLE: '/payment/multiple/data',
    },
    
    // Build Info
    BUILD_INFO: '/buildinfo',
  }
};

// ✅ EXPORT DIRECTO DE API_URL (REQUERIDO)
export const API_URL = API_CONFIG.BASE_URL;

export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  SCOPES: ['email', 'profile'],
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Kraken Desktop',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Configuraciones de almacenamiento
  STORAGE: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'userData',
    LANGUAGE_KEY: 'userLanguage',
    THEME_KEY: 'userTheme',
  },
  
  // Configuraciones de UI
  UI: {
    TOAST_DURATION: 4000,
    LOADING_DELAY: 300,
    DEBOUNCE_DELAY: 500,
  },
  
  // Validaciones
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  },
  
  // Límites de archivos
  FILE_LIMITS: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  }
};

// ===== FUNCIÓN PARA VERIFICAR CONFIGURACIÓN =====
export const validateConfig = () => {
  const required = [
    { key: 'VITE_API_BASE_URL', value: API_CONFIG.BASE_URL },
  ];
  
  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes:', missing.map(({ key }) => key));
  }
  
  return missing.length === 0;
};

// ===== LOGGING =====
export const isDevelopment = () => APP_CONFIG.ENVIRONMENT === 'development';

export const log = (...args) => {
  if (isDevelopment()) {
    console.log('🔗 [Kraken]', ...args);
  }
};

export const logError = (...args) => {
  console.error('❌ [Kraken Error]', ...args);
};

// ===== DEBUG INFO =====
console.log('🔗 API_URL configurada:', API_URL);
console.log('🎯 Modo:', isDevelopment() ? 'DESARROLLO' : 'PRODUCCIÓN');