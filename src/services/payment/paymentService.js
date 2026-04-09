// src/services/payment/paymentService.js - ✅ ACTUALIZADO CON AUTH INTEGRADA EN BACKEND
import axios from 'axios';
import { API_URL } from '../../utils/config';

// ============================================================
// ✅ CONFIGURACIÓN DE TIMEOUTS DIFERENCIADOS
// ============================================================
const TIMEOUTS = {
  DEFAULT: 60000,   // 60 segundos - operaciones normales
  PAYMENT: 120000,  // 120 segundos - pagos con tarjeta
};

// ============================================================
// INSTANCIA PRINCIPAL (60s para operaciones normales)
// ============================================================
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUTS.DEFAULT,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// ✅ INSTANCIA PARA PAGOS (120s para pagos con tarjeta)
// ============================================================
const axiosPaymentInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUTS.PAYMENT,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// INTERCEPTOR DE REQUEST (aplicar a ambas instancias)
// ============================================================
const requestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.url === '/Addresses/user-addresses' && userId) {
    config.data = {
      ...config.data,
      ClientId: parseInt(userId)
    };
  }
  
  return config;
};

// ============================================================
// INTERCEPTOR DE ERRORES (manejar timeout específicamente)
// ============================================================
const errorInterceptor = (error) => {
  if (error.code === 'ECONNABORTED') {
    console.error('⏱️ TIMEOUT:', error.config?.url);
    const customError = new Error('La operación tardó demasiado. Por favor, intenta nuevamente.');
    customError.code = 'TIMEOUT';
    customError.isTimeout = true;
    return Promise.reject(customError);
  }
  
  return Promise.reject(error);
};

// Aplicar interceptores a ambas instancias
axiosInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosInstance.interceptors.response.use(null, errorInterceptor);

axiosPaymentInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosPaymentInstance.interceptors.response.use(null, errorInterceptor);

// ============================================================
// FUNCIONES DE PAGO MÓVIL (usar instancia normal - 60s)
// ============================================================

/**
 * Procesa un pago móvil con Mercantil
 * @param {Object} paymentData
 * @param {string} paymentData.customerId - Cédula/RIF (ej: V12345678)
 * @param {string} paymentData.originMobileNumber - Teléfono completo (ej: 584141234567)
 * @param {string} paymentData.amount - Monto en VES
 * @param {number} paymentData.tasa - Tasa de cambio BCV
 * @param {number} [paymentData.idGuia] - ID de la guía (pago único)
 * @param {number[]} [paymentData.guiasIds] - IDs de las guías (pago múltiple)
 * @param {boolean} [paymentData.isMultiplePayment] - Flag para pago múltiple
 * @returns {Promise<Object>}
 */


// ============================================================
// ✅ NUEVO: FUNCIÓN UNIFICADA PARA PAGO CON TARJETA
// Auth + Pago en una sola llamada (el backend maneja auth internamente)
// ============================================================

/**
 * ✅ NUEVO: Procesa pago con tarjeta (autenticación integrada en backend)
 * @param {Object} paymentData
 * @param {string} paymentData.customerId - Cédula/RIF
 * @param {string} paymentData.cardNumber - Número de tarjeta sin espacios
 * @param {string} paymentData.expirationDate - Fecha vencimiento MM/YY
 * @param {string} paymentData.cvv - CVV
 * @param {string} paymentData.amount - Monto en VES (como string)
 * @param {number} paymentData.tasa - Tasa de cambio BCV
 * @param {number} [paymentData.idGuia] - ID de la guía (pago único)
 * @param {number[]} [paymentData.guiasIds] - IDs de las guías (pago múltiple)
 * @param {boolean} [paymentData.isMultiplePayment] - Flag para pago múltiple
 * @returns {Promise<Object>}
 */


// ============================================================
// ⚠️ FUNCIONES DEPRECADAS (mantener para compatibilidad)
// ============================================================





// ============================================================
// FUNCIONES DE INFORMACIÓN (usar instancia normal - 60s)
// ============================================================

/**
 * Obtiene información de pago para una guía
 * @param {number} guiaId - ID de la guía
 * @returns {Promise<Object>}
 */
export const getPaymentInfo = async (guiaId) => {
  try {
    // console.log('📄 Obteniendo información de pago para guía:', guiaId);

    const response = await axiosInstance.get(`/Payment/getPaymentInfo/${guiaId}`);

    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Información de pago obtenida',
    };
  } catch (error) {
    console.error('❌ Error en getPaymentInfo:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener información',
      error: error.message,
    };
  }
};

/**
 * Calcula el precio total para múltiples guías
 * @param {number[]} guiaIds - Array de IDs de guías
 * @returns {Promise<Object>}
 */
export const calculateMultiplePayment = async (guiaIds) => {
  try {
    // console.log('📊 Calculando pago múltiple para guías:', guiaIds);

    const response = await axiosInstance.post('/Guias/calculateMultiplePrice', { guiaIds });

    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Cálculo realizado exitosamente',
    };
  } catch (error) {
    console.error('❌ Error en calculateMultiplePayment:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Error al calcular precio',
      error: error.message,
    };
  }
};

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

/**
 * Validar número de tarjeta con algoritmo Luhn
 */
export const validateCardNumber = (cardNumber) => {
  const clean = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validar CVV (3-4 dígitos)
 */
export const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Validar fecha de expiración MM/YY
 */
export const validateExpirationDate = (expDate) => {
  if (!/^\d{2}\/\d{2}$/.test(expDate)) return false;
  
  const [month, year] = expDate.split('/').map(Number);
  if (month < 1 || month > 12) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

/**
 * Validar cédula/RIF venezolano
 */
export const validateCustomerId = (customerId) => {
  return /^[VEJPGvejpg]\d{7,9}$/.test(customerId);
};

/**
 * Detecta el tipo de tarjeta basado en el número
 */
export const getCardType = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  const patterns = {
    'Visa': /^4/,
    'Mastercard': /^5[1-5]|^2[2-7]/,
    'American Express': /^3[47]/,
    'Discover': /^6(?:011|5)/,
    'Diners Club': /^3[068]/,
    'JCB': /^35/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  
  return 'Desconocida';
};

/**
 * Formatear número de tarjeta para mostrar
 */
export const formatCardNumber = (cardNumber, hideMiddle = false) => {
  const clean = cardNumber.replace(/\s/g, '');
  
  if (hideMiddle && clean.length >= 8) {
    const first = clean.slice(0, 4);
    const last = clean.slice(-4);
    const middle = '*'.repeat(Math.max(0, clean.length - 8));
    return `${first} ${middle.match(/.{1,4}/g)?.join(' ') || ''} ${last}`.trim();
  } else {
    return clean.replace(/(.{4})/g, '$1 ').trim();
  }
};

/**
 * Formatear fecha de expiración MM/YY
 */
export const formatExpirationDate = (value) => {
  const clean = value.replace(/\D/g, '');
  if (clean.length >= 2) {
    return clean.slice(0, 2) + '/' + clean.slice(2, 4);
  }
  return clean;
};

// ============================================================
// ALIAS PARA RETROCOMPATIBILIDAD
// ============================================================




// ============================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================

export default {
 
  
  // Información
  getPaymentInfo,
  calculateMultiplePayment,
  
  // Validaciones
  validateCardNumber,
  validateCVV,
  validateExpirationDate,
  validateCustomerId,
  getCardType,
  formatCardNumber,
  formatExpirationDate,
  
  // Alias
  processMobilPayment,
  processMercantilCardPayment,
};