// src/services/payment/paymentService.js - ✅ MEGASOFT C2P + P2C + DI + CI
import axios from 'axios';
import { API_URL } from '../../utils/config';

// ============================================================
// ✅ CONFIGURACIÓN DE TIMEOUTS DIFERENCIADOS
// ============================================================
const TIMEOUTS = {
  DEFAULT: 60000, // 60 segundos - operaciones normales
  PAYMENT: 120000, // 120 segundos - pagos con tarjeta / DI / CI
};

// ============================================================
// INSTANCIAS AXIOS
// ============================================================
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUTS.DEFAULT,
  headers: { 'Content-Type': 'application/json' },
});

const axiosPaymentInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUTS.PAYMENT,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// INTERCEPTORES
// ============================================================
const requestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url === '/Addresses/user-addresses' && userId) {
    config.data = { ...config.data, ClientId: parseInt(userId) };
  }

  return config;
};

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

axiosInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosInstance.interceptors.response.use(null, errorInterceptor);
axiosPaymentInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
axiosPaymentInstance.interceptors.response.use(null, errorInterceptor);

// ============================================================
// 🐙 MEGASOFT C2P
// ============================================================
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
// 🐙 MEGASOFT P2C
// ============================================================
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
// 🐙 MEGASOFT DÉBITO INMEDIATO — FASE 1 (Autorizar)
// ============================================================
/**
 * Solicita la autorización del pago. Megasoft envía un OTP por SMS al cliente.
 * @returns {Promise<{ success, data: { control, pagoId, requiereOtp, montoTotal } }>}
 */
export const processMegasoftDIAutorizar = async (paymentData) => {
  try {
    console.log('🐙 [Megasoft DI Fase 1] Autorizando:', {
      ...paymentData,
      cuentaCliente: paymentData.cuentaCliente
        ? `***${paymentData.cuentaCliente.slice(-4)}`
        : null,
    });

    const response = await axiosPaymentInstance.post(
      '/Payment/megasoft/debito-inmediato/autorizar',
      paymentData
    );

    console.log('✅ [Megasoft DI Fase 1] Respuesta:', response.data);

    return {
      success: response.data?.success ?? false,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Autorización enviada',
    };
  } catch (error) {
    console.error('❌ [Megasoft DI Autorizar] Error:', error);
    const backendData = error.response?.data;
    if (backendData) {
      return {
        success: false,
        data: backendData.data || null,
        message: backendData.message || 'Error al autorizar el pago',
      };
    }
    return {
      success: false,
      message: error.message || 'Error de conexión',
    };
  }
};

// ============================================================
// 🐙 MEGASOFT DÉBITO INMEDIATO — FASE 2 (Confirmar con OTP)
// ============================================================
/**
 * Confirma el pago con el código OTP que el cliente recibió por SMS.
 */
export const processMegasoftDIConfirmar = async ({
  control,
  pagoId,
  codigoOtp,
  customerId,
  telefonoCliente,
}) => {
  try {
    console.log('🐙 [Megasoft DI Fase 2] Confirmando OTP');

    const response = await axiosPaymentInstance.post(
      '/Payment/megasoft/debito-inmediato/confirmar',
      { control, pagoId, codigoOtp, customerId, telefonoCliente }
    );

    console.log('✅ [Megasoft DI Fase 2] Respuesta:', response.data);

    return {
      success: response.data?.success ?? false,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Pago confirmado',
      factura: response.data?.factura,
    };
  } catch (error) {
    console.error('❌ [Megasoft DI Confirmar] Error:', error);
    const backendData = error.response?.data;
    if (backendData) {
      return {
        success: false,
        data: backendData.data || null,
        message: backendData.message || 'Error al confirmar el OTP',
      };
    }
    return {
      success: false,
      message: error.message || 'Error de conexión',
    };
  }
};

// ============================================================
// 🐙 MEGASOFT CRÉDITO INMEDIATO
// ============================================================
export const processMegasoftCreditoInmediato = async (paymentData) => {
  try {
    console.log('🐙 [Megasoft CI] Enviando pago:', {
      ...paymentData,
      cuentaCliente: paymentData.cuentaCliente
        ? `***${paymentData.cuentaCliente.slice(-4)}`
        : null,
    });

    const response = await axiosPaymentInstance.post(
      '/Payment/megasoft/credito-inmediato/comprar',
      paymentData
    );

    console.log('✅ [Megasoft CI] Respuesta:', response.data);

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
    console.error('❌ [Megasoft CI] Error:', error);
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
    };
  }
};

// ============================================================
// ⚠️ MERCANTIL - DEPRECADO (mantener por rollback)
// ============================================================
export const processMercantilPayment = async (paymentData) => {
  console.warn('⚠️ processMercantilPayment está deprecada.');
  try {
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
    return {
      success: false,
      message: error.response?.data?.message || 'Error al procesar el pago',
      error: error.message,
    };
  }
};

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
        error.response?.data?.message || 'Error al procesar el pago con tarjeta',
      error: error.message,
    };
  }
};

export const processCardPaymentUnified = processMercantilDebitCardPayment;
export const getMercantilCardAuth = async () => {
  console.warn('⚠️ getMercantilCardAuth deprecada.');
};

// ============================================================
// FUNCIONES DE INFORMACIÓN
// ============================================================
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
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener información',
      error: error.message,
    };
  }
};

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
    return {
      success: false,
      message: error.response?.data?.message || 'Error al calcular precio',
      error: error.message,
    };
  }
};

// ============================================================
// VALIDACIONES
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

export const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);

export const validateExpirationDate = (expDate) => {
  if (!/^\d{2}\/\d{2}$/.test(expDate)) return false;
  const [month, year] = expDate.split('/').map(Number);
  if (month < 1 || month > 12) return false;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  return !(year < currentYear || (year === currentYear && month < currentMonth));
};

export const validateCustomerId = (customerId) =>
  /^[VEJPGvejpg]\d{7,9}$/.test(customerId);

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
    if (pattern.test(cleanNumber)) return type;
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
  }
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

export const formatExpirationDate = (value) => {
  const clean = value.replace(/\D/g, '');
  if (clean.length >= 2) {
    return clean.slice(0, 2) + '/' + clean.slice(2, 4);
  }
  return clean;
};

// ============================================================
// ALIAS Y EXPORTACIÓN POR DEFECTO
// ============================================================
export const processMobilPayment = processMegasoftC2PPayment;
export const processMercantilCardPayment = processMercantilDebitCardPayment;

export default {
  processMegasoftC2PPayment,
  processMegasoftP2CPayment,
  processMegasoftDIAutorizar,
  processMegasoftDIConfirmar,
  processMegasoftCreditoInmediato,
  processMercantilDebitCardPayment,
  processMercantilPayment,
  getMercantilCardAuth,
  processCardPaymentUnified,
  getPaymentInfo,
  calculateMultiplePayment,
  validateCardNumber,
  validateCVV,
  validateExpirationDate,
  validateCustomerId,
  getCardType,
  formatCardNumber,
  formatExpirationDate,
  processMobilPayment,
  processMercantilCardPayment,
};