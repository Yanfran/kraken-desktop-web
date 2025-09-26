// src/utils/config.js - Configuración general del proyecto
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7031/api',
  TIMEOUT: 30000,
  
  // Endpoints principales (basados en tu backend C#)
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      LOGOUT: '/users/logout',
      PROFILE: '/users/profile',
      FORGOT_PASSWORD: '/users/forgot-password',
      RESET_PASSWORD: '/users/reset-password',
      VERIFY_EMAIL: '/users/verify-email',
      RESEND_VERIFICATION: '/users/resend-verification',
      GOOGLE_AUTH: '/users/google-auth',
    },
    
    // Calculator
    CALCULATOR: {
      CALCULATE: '/calculator/calculate',
      RATES: '/calculator/rates',
    },
    
    // Address
    ADDRESS: {
      COUNTRIES: '/address/countries',
      STATES: (countryId) => `/address/states/${countryId}`,
      MUNICIPALITIES: (stateId) => `/address/municipalities/${stateId}`,
      PARISHES: (municipalityId) => `/address/parishes/${municipalityId}`,
    },
    
    // Pre-alerts (basado en tu React Native)
    PRE_ALERTS: {
      GET_ALL: (userId) => `/PostPreAlert/getPreAlertas/${userId}`,
      GET_PENDING: '/PostPreAlert/getPreAlertasPendientes',
      CREATE: '/PostPreAlert/create',
      UPDATE: (id) => `/PostPreAlert/update/${id}`,
      DELETE: (id) => `/PostPreAlert/delete/${id}`,
    },
    
    // Packages
    PACKAGES: {
      LIST: '/packages',
      DETAIL: (id) => `/packages/${id}`,
      CONTENTS: '/packages/contents',
    },
    
    // Payment (basado en tu PaymentController)
    PAYMENT: {
      MERCANTIL_AUTH: '/payment/mercantil/auth',
      MERCANTIL_PAY: '/payment/mercantil/card/pay',
      MOBILE_PAYMENT: '/payment/mobile',
    }
  }
};

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

// ===== FUNCIÓN PARA OBTENER URL COMPLETA =====
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// ===== FUNCIÓN PARA LOGGING EN DESARROLLO =====
export const isDevelopment = () => APP_CONFIG.ENVIRONMENT === 'development';

export const log = (...args) => {
  if (isDevelopment()) {
    console.log('[Kraken]', ...args);
  }
};

export const logError = (...args) => {
  console.error('[Kraken Error]', ...args);
};