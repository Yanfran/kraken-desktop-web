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
export const processMercantilPayment = async (paymentData) => {
  try {
    // console.log('💳 Procesando pago móvil Mercantil...');
    // console.log('📦 Datos del pago:', paymentData);

    const response = await axiosInstance.post('/Payment/mercantil/comprar', paymentData);

    // console.log('✅ Respuesta del pago:', response.data);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pago procesado exitosamente',
    };
  } catch (error) {
    console.error('❌ Error en processMercantilPayment:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Error al procesar el pago',
      error: error.message,
    };
  }
};

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
export const processMercantilDebitCardPayment = async (paymentData) => {
  try {
    // console.log('💳 Procesando pago con tarjeta (auth integrada en backend)...');
    // console.log('📦 Datos del pago:', {
    //   customerId: paymentData.customerId,
    //   cardNumber: `****${paymentData.cardNumber.slice(-4)}`,
    //   expirationDate: paymentData.expirationDate,
    //   cvv: '***',
    //   amount: paymentData.amount,
    //   hasIdGuia: !!paymentData.idGuia,
    //   hasGuiasIds: !!paymentData.guiasIds,
    //   guiasCount: paymentData.guiasIds?.length || 0,
    //   isMultiple: paymentData.isMultiplePayment
    // });

    // ✅ ENDPOINT UNIFICADO - El backend maneja auth + pago internamente
    const response = await axiosPaymentInstance.post('/PaymentTDD/mercantil/card/pay', {
      customerId: paymentData.customerId,
      cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
      expirationDate: paymentData.expirationDate,
      cvv: paymentData.cvv,
      amount: parseFloat(paymentData.amount),
      paymentMethod: 'tdd', // Siempre TDD para débito
      tasa: paymentData.tasa,
      idGuia: paymentData.idGuia,
      guiasIds: paymentData.guiasIds,
      isMultiplePayment: paymentData.isMultiplePayment || false,
    });

    // console.log('✅ Respuesta del servidor:', response.data);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pago procesado exitosamente',
    };
  } catch (error) {
    console.error('❌ Error en processMercantilDebitCardPayment:', error);

    // Manejar timeout específicamente
    if (error.isTimeout || error.code === 'TIMEOUT') {
      return {
        success: false,
        message: 'El pago tardó demasiado. Verifica el estado de tu pago en "Mis Guías" antes de reintentar.',
        error: 'TIMEOUT',
        isTimeout: true
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Error al procesar el pago con tarjeta',
      error: error.message,
    };
  }
};

// ============================================================
// ⚠️ FUNCIONES DEPRECADAS (mantener para compatibilidad)
// ============================================================

/**
 * @deprecated Usar processMercantilDebitCardPayment en su lugar
 * El backend ahora maneja la autenticación internamente
 */
export const getMercantilCardAuth = async (authData) => {
  console.warn('⚠️ getMercantilCardAuth está deprecada. Usar processMercantilDebitCardPayment directamente.');
  
  try {
    const response = await axiosPaymentInstance.post('/PaymentTDD/mercantil/card/auth', authData);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Autenticación exitosa',
    };
  } catch (error) {
    console.error('❌ Error en getMercantilCardAuth:', error);

    if (error.isTimeout || error.code === 'TIMEOUT') {
      return {
        success: false,
        message: 'La autenticación tardó demasiado. Por favor, intenta nuevamente.',
        error: 'TIMEOUT',
        isTimeout: true
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Error en la autenticación',
      error: error.message,
    };
  }
};

/**
 * @deprecated Usar processMercantilDebitCardPayment en su lugar
 */
export const processCardPaymentUnified = async (paymentData) => {
  console.warn('⚠️ processCardPaymentUnified está deprecada. Usar processMercantilDebitCardPayment directamente.');
  return processMercantilDebitCardPayment(paymentData);
};

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

export const processMobilPayment = processMercantilPayment;
export const processMercantilCardPayment = processMercantilDebitCardPayment; // Alias actualizado

// ============================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================

export default {
  // Funciones principales
  processMercantilPayment,
  processMercantilDebitCardPayment, // ✅ FUNCIÓN PRINCIPAL UNIFICADA
  
  // Funciones deprecadas (mantener para compatibilidad)
  getMercantilCardAuth,
  processCardPaymentUnified,
  
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