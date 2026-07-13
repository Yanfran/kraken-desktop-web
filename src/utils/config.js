// src/utils/config.js - CONFIGURACIÓN CENTRALIZADA WEB
// 🎯 Cambia este valor para alternar entre desarrollo y producción

const USE_PRODUCTION = false; // 👈 true para producción, false para desarrollo

// ═══════════════════════════════════════
// 📡 URLs DEL BACKEND API
// ═══════════════════════════════════════
const getApiUrl = () => {
  if (USE_PRODUCTION) {
    return 'https://api.krakencourier.com/api'; // ✅ Producción
    // return 'https://api-backup.krakencourier.com/api'; // ✅ Producción
  }
  
  // Desarrollo - Backend local
  return 'http://localhost:7031/api';
};

// ═══════════════════════════════════════
// 🌐 URLs DE LAS APLICACIONES
// ═══════════════════════════════════════
const getAppUrls = () => {
  if (USE_PRODUCTION) {
    return {
      WEB: 'https://app.krakencourier.com',      // ✅ App Web en producción
      MOBILE: 'https://m.krakencourier.com',     // ✅ App Móvil en producción
      API: 'https://api.krakencourier.com/api',  // ✅ API en producción
    };
  }
  
  // Desarrollo - URLs locales
  return {
    WEB: 'http://localhost:3000',     // Web local (puerto 3000)
    MOBILE: 'http://localhost:8081',  // Mobile local (puerto 8081)
    API: 'http://localhost:7031/api', // Backend local
  };
};

// ═══════════════════════════════════════
// 📤 EXPORTS PRINCIPALES
// ═══════════════════════════════════════
export const API_URL = getApiUrl();
export const APP_URLS = getAppUrls();

// Para compatibilidad con código existente
export const WEB_URL = APP_URLS.WEB;
export const MOBILE_URL = APP_URLS.MOBILE;

export const API_CONFIG = {
  BASE_URL: API_URL,
  TIMEOUT: 30000,
  
  // ✅ ENDPOINTS REALES DE TU BACKEND
  ENDPOINTS: {
    // Auth
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
    
    // Address
    ADDRESS: {
      LIST: '/Casilleros/list',
      USER_ADDRESSES: '/Addresses/user-addresses',
      STATES: (countryId) => `/Addresses/states/${countryId}`,
      MUNICIPALITIES: (stateId) => `/Addresses/municipalities/${stateId}`,
      PARISHES: (municipalityId) => `/Addresses/parishes/${municipalityId}`,
      DELIVERY_DATA: '/Addresses/delivery-data',
    },
    
    // Pre-alerts
    PRE_ALERTS: {
      GET_ALL: (userId) => `/PostPreAlert/getPreAlertas/${userId}`,
      GET_PENDING: '/PostPreAlert/getPreAlertasPendientes',
      CREATE: '/PostPreAlert/create',
      UPDATE: (id) => `/PostPreAlert/update/${id}`,
      DELETE: (id) => `/PostPreAlert/delete/${id}`,
    },
    
    // Packages
    PACKAGES: {
      CONTENTS: '/PaqueteContenidos/getContent',
    },
    
    // Novedades
    NEWS: {
      LIST: '/Novedades/list',
    },
    
    // Guides
    GUIDES: {
      LIST: '/guias',
      DETAIL: (id) => `/guias/${id}`,
      UPLOAD_INVOICE: (id) => `/guias/${id}/upload-invoice`,
      INVOICES: (id) => `/guias/${id}/invoices`,
      DOWNLOAD_INVOICE: (invoiceId) => `/guias/invoices/${invoiceId}/download`,
      DOWNLOAD_ALL: (id) => `/guias/${id}/invoices/download-all`,
    },
    
    // Payment
    PAYMENT: {
      MERCANTIL_AUTH: '/payment/mercantil/auth',
      MERCANTIL_PAY: '/payment/mercantil/card/pay',
      MOBILE_PAYMENT: '/payment/mobile',
      GET_DATA: (id) => `/payment/${id}/data`,
      GET_MULTIPLE: '/payment/multiple/data',
      CALCULATE_SINGLE: (id) => `/guias/${id}/calculate-price`,
      CALCULATE_MULTIPLE: '/guias/calculate-multiple-price',
    },
    
    // Build Info
    BUILD_INFO: '/buildinfo',
  }
};

export const GOOGLE_CONFIG = {
  CLIENT_ID: '916873587215-1tnv72lh39rd411i1ugrfo6fuglg7ob9.apps.googleusercontent.com',
  SCOPES: ['email', 'profile'],
};

export const APP_CONFIG = {
  NAME: USE_PRODUCTION ? 'Kraken Courier' : 'Kraken Web (Dev)',
  VERSION: '1.0.0',
  ENVIRONMENT: USE_PRODUCTION ? 'production' : 'development',
  
  // Configuraciones de almacenamiento
  STORAGE: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'userData',
    REFRESH_TOKEN_KEY: 'refreshToken',
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

// ═══════════════════════════════════════
// 🛠️ FUNCIONES ÚTILES
// ═══════════════════════════════════════
export const validateConfig = () => {
  const required = [
    { key: 'API_URL', value: API_URL },
    { key: 'WEB_URL', value: WEB_URL },
    { key: 'MOBILE_URL', value: MOBILE_URL },
  ];
  
  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables de configuración faltantes:', missing.map(({ key }) => key));
  }
  
  return missing.length === 0;
};

export const isDevelopment = () => !USE_PRODUCTION;
export const isProduction = () => USE_PRODUCTION;

export const log = (...args) => {
  if (isDevelopment()) {
    // console.log('🔗 [Kraken]', ...args);
  }
};

export const logError = (...args) => {
  console.error('❌ [Kraken Error]', ...args);
};

// ═══════════════════════════════════════
// 📊 DEBUG INFO (solo en desarrollo)
// ═══════════════════════════════════════
if (isDevelopment()) {
  // console.log('═══════════════════════════════════════');
  // console.log('🚀 CONFIGURACIÓN DE KRAKEN WEB');
  // console.log('═══════════════════════════════════════');
  // console.log('🔗 API_URL:', API_URL);
  // console.log('🌐 WEB_URL:', WEB_URL);
  // console.log('📱 MOBILE_URL:', MOBILE_URL);
  // console.log('🎯 Modo:', USE_PRODUCTION ? '🟢 PRODUCCIÓN' : '🔵 DESARROLLO');
  // console.log('📱 App Name:', APP_CONFIG.NAME);
  // console.log('📦 Version:', APP_CONFIG.VERSION);
  // console.log('═══════════════════════════════════════');
  // console.log('💡 TIP: Para cambiar a producción, modifica USE_PRODUCTION = true');
}

if (isProduction()) {
  // console.log('⚠️ ADVERTENCIA: Modo PRODUCCIÓN activo');
  // console.log('📡 API:', API_URL);
  // console.log('🌐 Web:', WEB_URL);
  // console.log('📱 Mobile:', MOBILE_URL);
}