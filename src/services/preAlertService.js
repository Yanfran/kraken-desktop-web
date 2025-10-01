// src/services/preAlertService.js
import axiosInstance from './axiosInstance';

/**
 * Service for Pre-Alert operations
 * Adapted from React Native app-kraken for web compatibility
 * 
 * Backend endpoints:
 * - GET /PostPreAlert/getPreAlertasPendientes
 * - GET /PostPreAlert/{id}
 * - POST /PostPreAlert/create
 * - POST /PostPreAlert/update/{id}
 * - POST /PostPreAlert/delete
 * - GET /PaqueteContenidos/getContent
 */

/**
 * @typedef {Object} PreAlerta
 * @property {number} id
 * @property {string|string[]} trackings - Array de números de tracking
 * @property {string} tracking - Primer tracking (para mostrar)
 * @property {string} contenido - Contenido concatenado
 * @property {Object[]} contenidos - Array de objetos {id, contenido}
 * @property {number} valor - Valor declarado
 * @property {number} peso - Peso del paquete
 * @property {number} cantidad - Cantidad de items
 * @property {string} tipoEnvio - Tipo de envío
 * @property {number|null} idGuia - ID de guía asociada (null si es pre-alerta)
 * @property {string} estatus - Estado de la pre-alerta
 * @property {string} fecha - Fecha formateada
 * @property {string} fechaRaw - Fecha sin formatear
 * @property {string} fechaCreacion - Fecha de creación
 * @property {Object} direccion - Información de dirección
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} data
 * @property {string[]} [errors]
 */

/**
 * Get all pending pre-alerts for the current user
 * @returns {Promise<ApiResponse>}
 */
export const getPreAlertasPendientes = async () => {
  try {
    console.log('📋 Obteniendo pre-alertas pendientes...');
    
    const response = await axiosInstance.get('/PostPreAlert/getPreAlertasPendientes');
    
    console.log('✅ Pre-alertas obtenidas:', response.data);
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Pre-alertas cargadas exitosamente'
    };
  } catch (error) {
    console.error('❌ Error fetching pending pre-alerts:', error);
    
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

    console.log(`📋 Obteniendo pre-alerta ID: ${id}`);
    
    const response = await axiosInstance.get(`/PostPreAlert/${id}`);
    
    console.log('✅ Pre-alerta obtenida:', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Pre-alerta cargada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error fetching pre-alert by ID:', error);
    
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
 * @param {Object} payload - Pre-alert data
 * @returns {Promise<ApiResponse>}
 */
export const createPreAlerta = async (payload) => {
  try {
    console.log('📤 Creando pre-alerta...', payload);
    
    // Validate required fields
    if (!payload.trackings || payload.trackings.length === 0) {
      throw new Error('Debe proporcionar al menos un número de tracking');
    }

    if (!payload.contenidos || payload.contenidos.length === 0) {
      throw new Error('Debe seleccionar al menos un contenido');
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    
    // Add trackings array
    payload.trackings.forEach((tracking, index) => {
      formData.append(`trackings[${index}]`, tracking);
    });
    
    // Add contenidos array
    payload.contenidos.forEach((contenido, index) => {
      formData.append(`contenidos[${index}]`, contenido);
    });
    
    // Add other fields
    formData.append('valor', payload.valor?.toString() || '0');
    formData.append('peso', payload.peso?.toString() || '0');
    formData.append('cantidad', payload.cantidad?.toString() || '1');
    formData.append('tipoEnvio', payload.tipoEnvio || 'maritimo');
    formData.append('useNewAddress', payload.useNewAddress ? 'true' : 'false');
    
    // Address handling
    if (payload.useNewAddress && payload.newAddress) {
      Object.entries(payload.newAddress).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(`newAddress.${key}`, value.toString());
        }
      });
    } else if (payload.addressId) {
      formData.append('addressId', payload.addressId.toString());
    }
    
    // Add invoice files
    if (payload.facturas && payload.facturas.length > 0) {
      payload.facturas.forEach((file) => {
        formData.append('facturas', file);
      });
    }

    const response = await axiosInstance.post('/PostPreAlert/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Pre-alerta creada:', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta creada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error creating pre-alert:', error);
    
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
 * @param {Object} payload - Updated pre-alert data
 * @returns {Promise<ApiResponse>}
 */
export const updatePreAlerta = async (id, payload) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    console.log(`📤 Actualizando pre-alerta ID: ${id}`, payload);

    // Prepare FormData
    const formData = new FormData();
    
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
    
    if (payload.facturas && payload.facturas.length > 0) {
      payload.facturas.forEach((file) => {
        formData.append('facturas', file);
      });
    }

    const response = await axiosInstance.post(`/PostPreAlert/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Pre-alerta actualizada:', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta actualizada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error updating pre-alert:', error);
    
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

    console.log(`🗑️ Eliminando pre-alerta ID: ${id}`);

    const response = await axiosInstance.post('/PostPreAlert/delete', { id });
    
    console.log('✅ Pre-alerta eliminada:', response.data);
    
    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'Pre-alerta eliminada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error deleting pre-alert:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Get package contents for dropdown (from PaqueteContenidos controller)
 * @returns {Promise<ApiResponse>}
 */
export const getPaquetesContenidos = async () => {
  try {
    console.log('📦 Obteniendo contenidos de paquetes...');
    
    const response = await axiosInstance.get('/PaqueteContenidos/getContent');
    
    console.log('✅ Contenidos obtenidos:', response.data);
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Contenidos cargados exitosamente'
    };
  } catch (error) {
    console.error('❌ Error fetching package contents:', error);
    
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

    console.log(`📤 Subiendo ${files.length} archivo(s) para pre-alerta ${preAlertId}`);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await axiosInstance.post(
      `/PostPreAlert/uploadInvoices/${preAlertId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('✅ Archivos subidos:', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Archivos subidos exitosamente'
    };
  } catch (error) {
    console.error('❌ Error uploading invoice files:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al subir archivos',
      errors: error.response?.data?.errors || [error.message],
      data: null
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

    console.log(`🔍 Buscando pre-alerta con tracking: ${trackingNumber}`);

    const response = await axiosInstance.get('/PostPreAlert/searchByTracking', {
      params: { tracking: trackingNumber.trim() }
    });
    
    console.log('✅ Resultado de búsqueda:', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Búsqueda completada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error searching pre-alert by tracking:', error);
    
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
  searchPreAlertByTracking
};