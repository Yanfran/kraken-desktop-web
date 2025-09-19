// src/services/payment/paymentService.js - Adaptado a tu backend
import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Interfaces TypeScript convertidas a JSDoc para mejor documentación
 */

/**
 * @typedef {Object} PaymentRequest
 * @property {string} customerId - Cédula/RIF del cliente
 * @property {string} originMobileNumber - Teléfono origen
 * @property {string} amount - Monto en VES
 * @property {string} [twofactorAuth] - Código 2FA (opcional)
 * @property {number} [tasa] - Tasa de cambio
 * @property {number} [idGuia] - ID de guía principal
 * @property {number[]} [guiasIds] - Array de IDs para pago múltiple
 * @property {boolean} [isMultiplePayment] - Flag para pago múltiple
 */

/**
 * @typedef {Object} DebitCardPaymentRequest
 * @property {string} customerId
 * @property {string} cardNumber
 * @property {string} expirationDate - MM/YY
 * @property {string} cvv
 * @property {string} amount
 * @property {string} twofactorAuth
 * @property {number} [tasa]
 * @property {number} [idGuia]
 * @property {number[]} [guiasIds]
 * @property {boolean} [isMultiplePayment]
 */

export class PaymentService {
  /**
   * Procesa pago móvil
   * @param {PaymentRequest} paymentData
   * @returns {Promise<Object>}
   */
  static async processMobilPayment(paymentData) {
    try {
      console.log('[PaymentService] Procesando pago móvil:', paymentData);
      
      const response = await apiClient.post(ENDPOINTS.PAYMENT.PROCESS_MOBILE, {
        customerId: paymentData.customerId,
        originMobileNumber: paymentData.originMobileNumber,
        amount: paymentData.amount,
        twofactorAuth: paymentData.twofactorAuth || '',
        tasa: paymentData.tasa,
        idGuia: paymentData.idGuia,
        guiasIds: paymentData.guiasIds,
        isMultiplePayment: paymentData.isMultiplePayment || false,
      });

      return {
        success: true,
        data: response.data,
        message: 'Pago procesado exitosamente'
      };
    } catch (error) {
      console.error('[PaymentService] Error en pago móvil:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error.response?.data
      };
    }
  }

  /**
   * Procesa pago con tarjeta de débito
   * @param {DebitCardPaymentRequest} paymentData
   * @returns {Promise<Object>}
   */
  static async processDebitCardPayment(paymentData) {
    try {
      console.log('[PaymentService] Procesando pago con tarjeta de débito');
      
      const response = await apiClient.post(ENDPOINTS.PAYMENT.PROCESS_DEBIT, {
        customerId: paymentData.customerId,
        cardNumber: paymentData.cardNumber,
        expirationDate: paymentData.expirationDate,
        cvv: paymentData.cvv,
        amount: paymentData.amount,
        twofactorAuth: paymentData.twofactorAuth,
        tasa: paymentData.tasa,
        idGuia: paymentData.idGuia,
        guiasIds: paymentData.guiasIds,
        isMultiplePayment: paymentData.isMultiplePayment || false,
      });

      return {
        success: true,
        data: response.data,
        message: 'Pago con tarjeta procesado exitosamente'
      };
    } catch (error) {
      console.error('[PaymentService] Error en pago con tarjeta:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error.response?.data
      };
    }
  }

  /**
   * Obtiene datos de pago para una guía
   * @param {number} paymentId - ID del pago/guía
   * @returns {Promise<Object>}
   */
  static async getPaymentData(paymentId) {
    try {
      console.log('[PaymentService] Obteniendo datos para ID:', paymentId);
      
      const response = await apiClient.get(ENDPOINTS.PAYMENT.GET_DATA(paymentId));

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error obteniendo datos de pago');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Datos obtenidos exitosamente'
      };
    } catch (error) {
      console.error('[PaymentService] Error obteniendo datos:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error.response?.data
      };
    }
  }

  /**
   * Obtiene datos para pago múltiple
   * @param {number[]} guiasIds - Array de IDs de guías
   * @returns {Promise<Object>}
   */
  static async getMultiplePaymentData(guiasIds) {
    try {
      console.log('[PaymentService] Obteniendo datos múltiples:', guiasIds);
      
      const response = await apiClient.post(ENDPOINTS.PAYMENT.GET_MULTIPLE_DATA, {
        guiasIds: guiasIds
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error obteniendo datos múltiples');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Datos múltiples obtenidos exitosamente'
      };
    } catch (error) {
      console.error('[PaymentService] Error obteniendo datos múltiples:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error.response?.data
      };
    }
  }

  /**
   * Extrae mensaje de error legible
   * @param {Error} error - Error capturado
   * @returns {string} Mensaje de error
   */
  static getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Error inesperado en el servicio';
  }

  /**
   * Valida número de tarjeta usando algoritmo de Luhn
   * @param {string} cardNumber - Número de tarjeta
   * @returns {boolean}
   */
  static validateCardNumber(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(number)) return false;

    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Formatea número de tarjeta con espacios
   * @param {string} cardNumber - Número de tarjeta
   * @returns {string}
   */
  static formatCardNumber(cardNumber) {
    return cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Detecta tipo de tarjeta
   * @param {string} cardNumber - Número de tarjeta
   * @returns {string}
   */
  static getCardType(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'MasterCard';
    if (/^3[47]/.test(number)) return 'American Express';
    
    return 'Desconocido';
  }
}