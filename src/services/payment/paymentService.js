// src/services/payment/paymentService.js - ✅ ACTUALIZADO CON MEGASOFT C2P
import axios from 'axios';
import { API_URL } from '../../utils/config';

// ============================================================
// ✅ CONFIGURACIÓN DE TIMEOUTS DIFERENCIADOS
// ============================================================
const TIMEOUTS = {
  DEFAULT: 60000, // 60 segundos - operaciones normales
  PAYMENT: 120000, // 120 segundos - pagos con tarjeta
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
      ClientId: parseInt(userId),
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
    const customError = new Error(
      'La operación tardó demasiado. Por favor, intenta nuevamente.'
    );
    customError.code = 'TIMEOUT';
    customError.isTimeout = true;
    return Promise.reject(customError);
  }

  return Promise.reject(error);
};

// Aplicar interceptores a ambas instancias
axiosInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosInstance.interceptors.response.use(null, errorInterceptor);

axiosPaymentInstance.interceptors.request.use(
  requestInterceptor,
  errorInterceptor
);
axiosPaymentInstance.interceptors.response.use(null, errorInterceptor);

// ============================================================
// 🐙 MEGASOFT C2P - Pago Móvil vía Megasoft Tokenizador
// ============================================================

/**
 * Procesa un pago móvil C2P con Megasoft
 * @param {Object} paymentData
 * @param {string} paymentData.customerId - Cédula/RIF (ej: V12345678)
 * @param {string} paymentData.nombreCompleto - Nombre del cliente (para registrarlo en Megasoft si no existe)
 * @param {string} paymentData.originMobileNumber - Teléfono completo (ej: 584141234567 o 04141234567)
 * @param {string} paymentData.destinationBankId - Código de 4 dígitos del banco pagador (ej: "0134")
 * @param {string} paymentData.amount - Monto en VES (ej: "15.00")
 * @param {string} paymentData.codigoC2P - Clave C2P de 8 dígitos que proporciona el banco al cliente
 * @param {number} paymentData.tasa - Tasa de cambio BCV
 * @param {number} [paymentData.idGuia] - ID de la guía (pago único)
 * @param {number[]} [paymentData.guiasIds] - IDs de las guías (pago múltiple)
 * @param {boolean} [paymentData.isMultiplePayment] - Flag para pago múltiple
 * @returns {Promise<Object>}
 */
export const processMegasoftC2PPayment = async (paymentData) => {
  try {
    console.log('🐙 [Megasoft C2P] Enviando pago:', {
      ...paymentData,
      codigoC2P: paymentData.codigoC2P
        ? `${paymentData.codigoC2P.substring(0, 2)}******`
        : '',
    });

    const response = await axiosInstance.post(
      '/Payment/megasoft/c2p/comprar',
      paymentData
    );

    console.log('✅ [Megasoft C2P] Respuesta:', response.data);

    return {
      success: response.data?.success ?? false,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Pago procesado exitosamente',
      paymentId: response.data?.paymentId,
      guiasPagadas: response.data?.guiasPagadas,
      montoTotal: response.data?.montoTotal,
      factura: response.data?.factura,
    };
  } catch (error) {
    console.error('❌ [Megasoft C2P] Error:', error);

    // El backend devuelve 400 con { success: false, message, data } cuando Megasoft rechaza
    const backendData = error.response?.data;
    if (backendData) {
      return {
        success: false,
        data: backendData.data || null,
        message: backendData.message || 'Pago rechazado por Megasoft',
      };
    }

    return {
      success: false,
      message: error.message || 'Error de conexión al procesar el pago',
      error: error.message,
    };
  }
};

// ============================================================
// 🐙 MEGASOFT P2C - Pago Móvil Persona a Comercio
// ============================================================

/**
 * Procesa un pago móvil P2C con Megasoft
 * El usuario ya realizó el pago móvil desde su banco y ahora envía
 * la referencia bancaria para que Megasoft confirme la recepción.
 *
 * @param {Object} paymentData
 * @param {string} paymentData.customerId - Cédula/RIF del pagador (ej: V12345678)
 * @param {string} paymentData.nombreCompleto - Nombre del cliente
 * @param {string} paymentData.originMobileNumber - Teléfono del pagador (ej: 04121234567)
 * @param {string} paymentData.destinationBankId - Banco del pagador (ej: "0138")
 * @param {string} paymentData.amount - Monto en VES (ej: "15.00")
 * @param {string} paymentData.referencia - Referencia bancaria del pago realizado
 * @param {number} paymentData.tasa - Tasa de cambio BCV
 * @param {number} [paymentData.idGuia] - ID de la guía
 * @param {number[]} [paymentData.guiasIds] - IDs de las guías (múltiple)
 * @param {boolean} [paymentData.isMultiplePayment] - Flag para pago múltiple
 * @returns {Promise<Object>}
 */
export const processMegasoftP2CPayment = async (paymentData) => {
  try {
    console.log('🐙 [Megasoft P2C] Enviando pago:', {
      ...paymentData,
      referencia: paymentData.referencia
        ? `***${paymentData.referencia.slice(-4)}`
        : '',
    });

    const response = await axiosInstance.post(
      '/Payment/megasoft/p2c/comprar',
      paymentData
    );

    console.log('✅ [Megasoft P2C] Respuesta:', response.data);

    return {
      success: response.data?.success ?? false,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Pago procesado exitosamente',
      paymentId: response.data?.paymentId,
      guiasPagadas: response.data?.guiasPagadas,
      montoTotal: response.data?.montoTotal,
      factura: response.data?.factura,
    };
  } catch (error) {
    console.error('❌ [Megasoft P2C] Error:', error);

    const backendData = error.response?.data;
    if (backendData) {
      return {
        success: false,
        data: backendData.data || null,
        message: backendData.message || 'Pago rechazado por Megasoft',
      };
    }

    return {
      success: false,
      message: error.message || 'Error de conexión al procesar el pago',
      error: error.message,
    };
  }
};

// ============================================================
// ⚠️ MERCANTIL C2P - DEPRECADO (mantener por rollback)
// ============================================================

/**
 * @deprecated Usar processMegasoftC2PPayment en su lugar.
 * Se mantiene temporalmente por si se requiere rollback rápido.
 */
export const processMercantilPayment = async (paymentData) => {
  try {
    console.warn(
      '⚠️ processMercantilPayment está deprecada. Usar processMegasoftC2PPayment.'
    );

    const response = await axiosInstance.post(
      '/Payment/mercantil/comprar',
      paymentData
    );

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
// ✅ PAGO CON TARJETA DE DÉBITO MERCANTIL
// Auth + Pago en una sola llamada (el backend maneja auth internamente)
// ============================================================

/**
 * Procesa pago con tarjeta débito Mercantil (autenticación integrada en backend)
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
    const response = await axiosPaymentInstance.post(
      '/PaymentTDD/mercantil/card/pay',
      {
        customerId: paymentData.customerId,
        cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
        expirationDate: paymentData.expirationDate,
        cvv: paymentData.cvv,
        amount: parseFloat(paymentData.amount),
        paymentMethod: 'tdd',
        tasa: paymentData.tasa,
        idGuia: paymentData.idGuia,
        guiasIds: paymentData.guiasIds,
        isMultiplePayment: paymentData.isMultiplePayment || false,
      }
    );

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pago procesado exitosamente',
    };
  } catch (error) {
    console.error('❌ Error en processMercantilDebitCardPayment:', error);

    if (error.isTimeout || error.code === 'TIMEOUT') {
      return {
        success: false,
        message:
          'El pago tardó demasiado. Verifica el estado de tu pago en "Mis Guías" antes de reintentar.',
        error: 'TIMEOUT',
        isTimeout: true,
      };
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Error al procesar el pago con tarjeta',
      error: error.message,
    };
  }
};

// ============================================================
// ⚠️ FUNCIONES DEPRECADAS (mantener para compatibilidad)
// ============================================================

/**
 * @deprecated Usar processMercantilDebitCardPayment en su lugar
 */
export const getMercantilCardAuth = async (authData) => {
  console.warn(
    '⚠️ getMercantilCardAuth está deprecada. Usar processMercantilDebitCardPayment directamente.'
  );

  try {
    const response = await axiosPaymentInstance.post(
      '/PaymentTDD/mercantil/card/auth',
      authData
    );

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
        message:
          'La autenticación tardó demasiado. Por favor, intenta nuevamente.',
        error: 'TIMEOUT',
        isTimeout: true,
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
  console.warn(
    '⚠️ processCardPaymentUnified está deprecada. Usar processMercantilDebitCardPayment directamente.'
  );
  return processMercantilDebitCardPayment(paymentData);
};

// ============================================================
// FUNCIONES DE INFORMACIÓN (usar instancia normal - 60s)
// ============================================================

/**
 * Obtiene información de pago para una guía
 */
export const getPaymentInfo = async (guiaId) => {
  try {
    const response = await axiosInstance.get(
      `/Payment/getPaymentInfo/${guiaId}`
    );

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
 */
export const calculateMultiplePayment = async (guiaIds) => {
  try {
    const response = await axiosInstance.post('/Guias/calculateMultiplePrice', {
      guiaIds,
    });

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

export const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

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

export const validateCustomerId = (customerId) => {
  return /^[VEJPGvejpg]\d{7,9}$/.test(customerId);
};

export const getCardType = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');

  const patterns = {
    Visa: /^4/,
    Mastercard: /^5[1-5]|^2[2-7]/,
    'American Express': /^3[47]/,
    Discover: /^6(?:011|5)/,
    'Diners Club': /^3[068]/,
    JCB: /^35/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }

  return 'Desconocida';
};

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

export const processMobilPayment = processMegasoftC2PPayment;
export const processMercantilCardPayment = processMercantilDebitCardPayment;

// ============================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================

export default {
  // 🐙 Funciones principales nuevas
  processMegasoftC2PPayment,
  processMegasoftP2CPayment,

  // Tarjeta de débito (sigue con Mercantil)
  processMercantilDebitCardPayment,

  // Deprecadas
  processMercantilPayment,
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
