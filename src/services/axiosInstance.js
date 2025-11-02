// src/services/axiosInstance.js - CONFIGURACIÓN MEJORADA CON TIMEOUTS APROPIADOS

import axios from 'axios';
import { API_URL } from '../utils/config';

// ============================================================
// 📌 CONFIGURACIÓN DE TIMEOUTS POR TIPO DE OPERACIÓN
// ============================================================
const TIMEOUTS = {
  DEFAULT: 60000,      // 60 segundos - operaciones normales
  PAYMENT: 120000,     // 120 segundos - pagos con tarjeta
  UPLOAD: 180000,      // 180 segundos - subida de archivos
  LONG: 300000         // 300 segundos - operaciones muy largas
};

// ============================================================
// INSTANCIA PRINCIPAL (para operaciones normales)
// ============================================================
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUTS.DEFAULT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// INSTANCIA PARA PAGOS (timeout extendido)
// ============================================================
export const axiosPaymentInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUTS.PAYMENT, // ✅ 120 segundos para pagos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// INTERCEPTOR DE REQUEST (aplicado a todas las instancias)
// ============================================================
const requestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Agregar ClientId automáticamente para ciertas rutas
  if (config.url === '/Addresses/user-addresses' && userId) {
    config.data = {
      ...config.data,
      ClientId: parseInt(userId)
    };
  }
  
  // Log para debugging
  // console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
  
  return config;
};

// ============================================================
// INTERCEPTOR DE RESPONSE (manejo de errores)
// ============================================================
const responseInterceptor = (response) => {
  // console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
  return response;
};

// ============================================================
// INTERCEPTOR DE ERRORES (manejo mejorado)
// ============================================================
const errorInterceptor = (error) => {
  // 1. Error de timeout
  if (error.code === 'ECONNABORTED') {
    // console.error('⏱️ TIMEOUT:', error.config?.url);
    
    // Crear error personalizado con información útil
    const customError = new Error('La operación tardó demasiado. Por favor, intenta nuevamente.');
    customError.code = 'TIMEOUT';
    customError.config = error.config;
    customError.isTimeout = true;
    
    return Promise.reject(customError);
  }
  
  // 2. Error de red (sin conexión)
  if (error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
    // console.error('🌐 ERROR DE RED:', error.message);
    
    const customError = new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    customError.code = 'NETWORK_ERROR';
    customError.isNetworkError = true;
    
    return Promise.reject(customError);
  }
  
  // 3. Error del servidor (respuesta con código de error)
  if (error.response) {
    const { status, data } = error.response;
    
    // console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`);
    // console.error('Respuesta:', data);
    
    // Crear error personalizado con información del servidor
    const customError = new Error(data?.message || `Error del servidor: ${status}`);
    customError.status = status;
    customError.data = data;
    customError.isServerError = true;
    
    // Manejar errores específicos
    switch (status) {
      case 401:
        // No autorizado - limpiar sesión y redirigir
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        break;
        
      case 403:
        customError.message = 'No tienes permisos para realizar esta acción.';
        break;
        
      case 404:
        customError.message = 'Recurso no encontrado.';
        break;
        
      case 500:
        customError.message = 'Error interno del servidor. Intenta más tarde.';
        break;
    }
    
    return Promise.reject(customError);
  }
  
  // 4. Error desconocido
  console.error('❌ ERROR DESCONOCIDO:', error.message);
  return Promise.reject(error);
};

// ============================================================
// APLICAR INTERCEPTORES A LA INSTANCIA PRINCIPAL
// ============================================================
axiosInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);

// ============================================================
// APLICAR INTERCEPTORES A LA INSTANCIA DE PAGOS
// ============================================================
axiosPaymentInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosPaymentInstance.interceptors.response.use(responseInterceptor, errorInterceptor);

// ============================================================
// HELPER: Crear instancia con timeout personalizado
// ============================================================
export const createCustomAxios = (customTimeout) => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: customTimeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Aplicar los mismos interceptores
  instance.interceptors.request.use(requestInterceptor, errorInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
  
  return instance;
};

// ============================================================
// EXPORTACIONES
// ============================================================
export { TIMEOUTS };
export default axiosInstance;