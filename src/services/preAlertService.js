// src/services/preAlertService.js
import apiClient from '@services/apiClient';

/**
 * Service for Pre-Alert operations
 * Adapted from React Native app-kraken for web compatibility
 */

// Types and interfaces (for JSDoc)
/**
 * @typedef {Object} PreAlerta
 * @property {number} id
 * @property {string|string[]} trackings
 * @property {string} contenido
 * @property {number} valor
 * @property {number} peso
 * @property {number} cantidad
 * @property {string} tipoEnvio
 * @property {number|null} IdGuia
 * @property {string} fechaCreacion
 * @property {string} fechaActualizacion
 * @property {Object} direccion
 */

/**
 * @typedef {Object} PreAlertaPayload
 * @property {string[]} trackings
 * @property {number[]} contenidos
 * @property {number} valor
 * @property {number} peso
 * @property {number} cantidad
 * @property {string} tipoEnvio
 * @property {boolean} useNewAddress
 * @property {number|null} addressId
 * @property {Object|null} newAddress
 * @property {File[]} facturas
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} data
 * @property {string[]} errors
 */

/**
 * Get all pending pre-alerts for the current user
 * @returns {Promise<ApiResponse>}
 */
export const getPreAlertasPendientes = async () => {
  try {
    const response = await apiClient.get('/PreAlert/getPreAlertasPendientes');
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Pre-alertas cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching pending pre-alerts:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar pre-alertas',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

/**
 * Get pre-alert by ID
 * @param {number} id - Pre-alert ID
 * @returns {Promise<ApiResponse>}
 */
export const getPreAlertaById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    const response = await apiClient.get(`/PreAlert/getPreAlertaById/${id}`);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Pre-alerta cargada exitosamente'
    };
  } catch (error) {
    console.error('Error fetching pre-alert by ID:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Create a new pre-alert
 * @param {PreAlertaPayload} payload - Pre-alert data
 * @returns {Promise<ApiResponse>}
 */
export const createPreAlerta = async (payload) => {
  try {
    // Validate required fields
    if (!payload.trackings || payload.trackings.length === 0) {
      throw new Error('Debe proporcionar al menos un número de tracking');
    }

    if (!payload.contenidos || payload.contenidos.length === 0) {
      throw new Error('Debe seleccionar al menos un contenido');
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    
    // Add basic fields
    payload.trackings.forEach((tracking, index) => {
      formData.append(`trackings[${index}]`, tracking);
    });
    
    payload.contenidos.forEach((contenido, index) => {
      formData.append(`contenidos[${index}]`, contenido);
    });
    
    formData.append('valor', payload.valor?.toString() || '0');
    formData.append('peso', payload.peso?.toString() || '0');
    formData.append('cantidad', payload.cantidad?.toString() || '1');
    formData.append('tipoEnvio', payload.tipoEnvio || 'maritimo');
    formData.append('useNewAddress', payload.useNewAddress ? 'true' : 'false');
    
    if (payload.useNewAddress && payload.newAddress) {
      // Add new address fields
      Object.entries(payload.newAddress).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(`newAddress.${key}`, value.toString());
        }
      });
    } else if (payload.addressId) {
      formData.append('addressId', payload.addressId.toString());
    }
    
    // Add files
    if (payload.facturas && payload.facturas.length > 0) {
      payload.facturas.forEach((file, index) => {
        formData.append(`facturas`, file);
      });
    }

    const response = await apiClient.post('/PreAlert/createPreAlerta', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta creada exitosamente'
    };
  } catch (error) {
    console.error('Error creating pre-alert:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al crear pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Update an existing pre-alert
 * @param {number} id - Pre-alert ID
 * @param {PreAlertaPayload} payload - Updated pre-alert data
 * @returns {Promise<ApiResponse>}
 */
export const updatePreAlerta = async (id, payload) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    
    // Add basic fields
    payload.trackings.forEach((tracking, index) => {
      formData.append(`trackings[${index}]`, tracking);
    });
    
    payload.contenidos.forEach((contenido, index) => {
      formData.append(`contenidos[${index}]`, contenido);
    });
    
    formData.append('valor', payload.valor?.toString() || '0');
    formData.append('peso', payload.peso?.toString() || '0');
    formData.append('cantidad', payload.cantidad?.toString() || '1');
    formData.append('tipoEnvio', payload.tipoEnvio || 'maritimo');
    formData.append('useNewAddress', payload.useNewAddress ? 'true' : 'false');
    
    if (payload.useNewAddress && payload.newAddress) {
      Object.entries(payload.newAddress).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(`newAddress.${key}`, value.toString());
        }
      });
    } else if (payload.addressId) {
      formData.append('addressId', payload.addressId.toString());
    }
    
    // Add files
    if (payload.facturas && payload.facturas.length > 0) {
      payload.facturas.forEach((file, index) => {
        formData.append(`facturas`, file);
      });
    }

    const response = await apiClient.put(`/PreAlert/updatePreAlerta/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error updating pre-alert:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Delete a pre-alert
 * @param {number} id - Pre-alert ID
 * @returns {Promise<ApiResponse>}
 */
export const deletePreAlerta = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    const response = await apiClient.delete(`/PreAlert/deletePreAlerta/${id}`);
    
    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'Pre-alerta eliminada exitosamente'
    };
  } catch (error) {
    console.error('Error deleting pre-alert:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Get package contents for dropdown
 * @returns {Promise<ApiResponse>}
 */
export const getPaquetesContenidos = async () => {
  try {
    const response = await apiClient.get('/PaqueteContenidos/getPaquetesContenidos');
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Contenidos cargados exitosamente'
    };
  } catch (error) {
    console.error('Error fetching package contents:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar contenidos',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

/**
 * Upload invoice files for pre-alert
 * @param {number} preAlertId - Pre-alert ID
 * @param {File[]} files - Invoice files
 * @returns {Promise<ApiResponse>}
 */
export const uploadInvoiceFiles = async (preAlertId, files) => {
  try {
    if (!preAlertId || isNaN(preAlertId)) {
      throw new Error('ID de pre-alerta inválido');
    }

    if (!files || files.length === 0) {
      throw new Error('No se proporcionaron archivos');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await apiClient.post(
      `/PreAlert/uploadInvoices/${preAlertId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Archivos subidos exitosamente'
    };
  } catch (error) {
    console.error('Error uploading invoice files:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al subir archivos',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Get pre-alert statistics for the current user
 * @returns {Promise<ApiResponse>}
 */
export const getPreAlertStats = async () => {
  try {
    const response = await apiClient.get('/PreAlert/getStats');
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Estadísticas cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching pre-alert stats:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar estadísticas',
      errors: error.response?.data?.errors || [error.message],
      data: {
        total: 0,
        pending: 0,
        processed: 0
      }
    };
  }
};

/**
 * Search pre-alerts by tracking number
 * @param {string} trackingNumber - Tracking number to search
 * @returns {Promise<ApiResponse>}
 */
export const searchPreAlertByTracking = async (trackingNumber) => {
  try {
    if (!trackingNumber || trackingNumber.trim() === '') {
      throw new Error('Número de tracking requerido');
    }

    const response = await apiClient.get(`/PreAlert/searchByTracking`, {
      params: { tracking: trackingNumber.trim() }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Búsqueda completada exitosamente'
    };
  } catch (error) {
    console.error('Error searching pre-alert by tracking:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error en la búsqueda',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

// Export default object with all functions
export default {
  getPreAlertasPendientes,
  getPreAlertaById,
  createPreAlerta,
  updatePreAlerta,
  deletePreAlerta,
  getPaquetesContenidos,
  uploadInvoiceFiles,
  getPreAlertStats,
  searchPreAlertByTracking
};