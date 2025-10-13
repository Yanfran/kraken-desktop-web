// src/services/payment/paymentService.js
import axiosInstance from '../axiosInstance';

/**
 * Procesa un pago móvil con Mercantil
 * @param {Object} paymentData
 * @param {string} paymentData.customerId - Cédula/RIF (ej: V12345678)
 * @param {string} paymentData.originMobileNumber - Teléfono completo (ej: 04141234567)
 * @param {string} paymentData.amount - Monto en VES
 * @param {number} paymentData.tasa - Tasa de cambio BCV
 * @param {number} [paymentData.idGuia] - ID de la guía (pago único)
 * @param {number[]} [paymentData.guiasIds] - IDs de las guías (pago múltiple)
 * @param {boolean} [paymentData.isMultiplePayment] - Flag para pago múltiple
 * @returns {Promise<Object>}
 */
export const processMercantilPayment = async (paymentData) => {
  try {
    console.log('💳 Procesando pago móvil Mercantil...');
    console.log('📦 Datos del pago:', paymentData);

    const response = await axiosInstance.post('/Payment/mercantil/comprar', paymentData);

    console.log('✅ Respuesta del pago:', response.data);

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

/**
 * Solicita autenticación de tarjeta (Paso 1 para pago con tarjeta)
 * @param {Object} authData
 * @param {string} authData.customerId - Cédula/RIF
 * @param {string} authData.cardNumber - Número de tarjeta sin espacios
 * @returns {Promise<Object>}
 */
export const getMercantilCardAuth = async (authData) => {
  try {
    console.log('🔐 Solicitando autenticación de tarjeta...');

    const response = await axiosInstance.post('/Payment/mercantil/card/auth', authData);

    console.log('✅ Respuesta de autenticación:', response.data);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Autenticación exitosa',
    };
  } catch (error) {
    console.error('❌ Error en getMercantilCardAuth:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Error en la autenticación',
      error: error.message,
    };
  }
};

/**
 * Procesa el pago con tarjeta de débito (Paso 2, después de autenticación)
 * @param {Object} paymentData
 * @param {string} paymentData.customerId - Cédula/RIF
 * @param {string} paymentData.cardNumber - Número de tarjeta
 * @param {string} paymentData.expirationDate - Fecha vencimiento MM/YY
 * @param {string} paymentData.cvv - CVV
 * @param {string} paymentData.twofactorAuth - Token de autenticación recibido
 * @param {string} paymentData.amount - Monto en VES
 * @param {number} paymentData.tasa - Tasa de cambio BCV
 * @param {number} [paymentData.idGuia] - ID de la guía (pago único)
 * @param {number[]} [paymentData.guiasIds] - IDs de las guías (pago múltiple)
 * @param {boolean} [paymentData.isMultiplePayment] - Flag para pago múltiple
 * @returns {Promise<Object>}
 */
export const processMercantilDebitCardPayment = async (paymentData) => {
  try {
    console.log('💳 Procesando pago con tarjeta de débito...');
    console.log('📦 Datos del pago:', {
      ...paymentData,
      cardNumber: `****${paymentData.cardNumber.slice(-4)}`,
      cvv: '***',
      twofactorAuth: '[ENCRYPTED]',
    });

    const response = await axiosInstance.post('/Payment/mercantil/card/comprar', paymentData);

    console.log('✅ Respuesta del pago:', response.data);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pago procesado exitosamente',
    };
  } catch (error) {
    console.error('❌ Error en processMercantilDebitCardPayment:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Error al procesar el pago',
      error: error.message,
    };
  }
};

/**
 * Obtiene información de pago para una guía
 * @param {number} guiaId - ID de la guía
 * @returns {Promise<Object>}
 */
export const getPaymentInfo = async (guiaId) => {
  try {
    console.log('📄 Obteniendo información de pago para guía:', guiaId);

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
    console.log('📊 Calculando pago múltiple para guías:', guiaIds);

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

// =================== FUNCIONES DE VALIDACIÓN ===================

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

// =================== ALIAS PARA RETROCOMPATIBILIDAD ===================

// Mantener los nombres antiguos para no romper código existente
export const processMobilPayment = processMercantilPayment;
export const processMercantilCardPayment = processMercantilDebitCardPayment;

// Export default
export default {
  // Nombres principales
  processMercantilPayment,
  getMercantilCardAuth,
  processMercantilDebitCardPayment,
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
  
  // Alias para retrocompatibilidad
  processMobilPayment,
  processMercantilCardPayment,
};