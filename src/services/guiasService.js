// src/services/guiasService.js
import axiosInstance from './axiosInstance';

/**
 * Service for Guias/Shipments operations
 * Adapted from React Native for web compatibility
 */

/**
 * @typedef {Object} Guia
 * @property {number} id
 * @property {string} nGuia
 * @property {string} estatus
 * @property {string} fecha
 * @property {string} origen
 * @property {string} contenido
 * @property {number} costoEnvio
 * @property {boolean} prealertado
 * @property {string[]} trackings
 * @property {number} valorFOB
 * @property {number} peso
 * @property {string} unidadPeso
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} data
 * @property {string[]} errors
 */

/**
 * Get all shipments/guias for the current user
 * @returns {Promise<ApiResponse>}
 */
export const getGuias = async () => {
  try {
    const response = await axiosInstance.get('/PostPreAlert/getGuias');
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Guías cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching guias:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar guías',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

/**
 * Get shipment/guia by ID
 * @param {number} id - Guia ID
 * @returns {Promise<ApiResponse>}
 */
export const getGuiaById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de guía inválido');
    }

    const response = await axiosInstance.get(`/Guias/getGuiaDetail/${id}`);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Guía cargada exitosamente'
    };
  } catch (error) {
    console.error('Error fetching guia by ID:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar guía',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Get last shipment for dashboard home
 * @returns {Promise<ApiResponse>}
 */
export const getLastShipment = async () => {
  try {
    const response = await getGuias();
    
    if (response.success && response.data && response.data.length > 0) {
      // Sort by date (most recent first) and get the first one
      const sortedGuias = response.data.sort((a, b) => {
        const dateA = new Date(a.fechaRaw || a.fecha);
        const dateB = new Date(b.fechaRaw || b.fecha);
        return dateB - dateA;
      });
      
      const lastGuia = sortedGuias[0];
      
      // Format the last shipment for Home component
      return {
        success: true,
        data: {
          id: lastGuia.id,
          trackingNumber: lastGuia.nGuia || lastGuia.trackings?.[0] || 'N/A',
          status: lastGuia.estatus || 'Desconocido',
          date: lastGuia.fecha || '',
          origin: lastGuia.origen || 'USA',
          cost: lastGuia.costoEnvio 
            ? `$${parseFloat(lastGuia.costoEnvio).toFixed(2)}` 
            : '$0.00',
          prealerted: lastGuia.prealertado || false,
          discount: lastGuia.prealertado ? null : '-10%',
          trackingNumbers: lastGuia.trackings || []
        },
        message: 'Último envío cargado'
      };
    }
    
    return {
      success: false,
      message: 'No hay envíos disponibles',
      data: null
    };
  } catch (error) {
    console.error('Error fetching last shipment:', error);
    
    return {
      success: false,
      message: error.message || 'Error al cargar último envío',
      data: null
    };
  }
};

/**
 * Calculate price for multiple guias
 * @param {number[]} guiaIds - Array of guia IDs
 * @returns {Promise<ApiResponse>}
 */
export const calculateMultipleGuiasPrice = async (guiaIds) => {
  try {
    const response = await axiosInstance.post('/Guias/calculateMultiplePrice', {
      guiaIds
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Cálculo realizado exitosamente'
    };
  } catch (error) {
    console.error('Error calculating guias price:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al calcular precio',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

// Export default object with all functions
export default {
  getGuias,
  getGuiaById,
  getLastShipment,
  calculateMultipleGuiasPrice
};