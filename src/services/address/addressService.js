// src/services/addressService.js
import apiClient from './apiClient';

/**
 * Service for address-related operations
 * Adapted from React Native app-kraken for web compatibility
 */

/**
 * @typedef {Object} UserAddress
 * @property {number} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} telefono
 * @property {string} cedula
 * @property {string} email
 * @property {string} direccion
 * @property {number} estadoId
 * @property {number} municipioId
 * @property {number} parroquiaId
 * @property {string} codigoPostal
 * @property {string} estado
 * @property {string} municipio
 * @property {string} parroquia
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} data
 * @property {string[]} errors
 */

/**
 * Get user addresses
 * @returns {Promise<ApiResponse>}
 */
export const getUserAddresses = async () => {
  try {
    const response = await apiClient.get('/Address/getUserAddresses');
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: 'Direcciones cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    
    return {
      success: false,
      message: error.message || 'Error al cargar direcciones',
      errors: error.errors || [error.message],
      data: []
    };
  }
};

/**
 * Get states by country
 * @param {number} countryId - Country ID (1 for Venezuela)
 * @returns {Promise<ApiResponse>}
 */
export const getStatesByCountry = async (countryId = 1) => {
  try {
    const response = await apiClient.get(`/Address/getStatesByCountry/${countryId}`);
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: 'Estados cargados exitosamente'
    };
  } catch (error) {
    console.error('Error fetching states:', error);
    
    return {
      success: false,
      message: error.message || 'Error al cargar estados',
      errors: error.errors || [error.message],
      data: []
    };
  }
};

/**
 * Get municipalities by state
 * @param {number} stateId - State ID
 * @returns {Promise<ApiResponse>}
 */
export const getMunicipalitiesByState = async (stateId) => {
  try {
    if (!stateId) {
      throw new Error('State ID es requerido');
    }

    const response = await apiClient.get(`/Address/getMunicipalitiesByState/${stateId}`);
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: 'Municipios cargados exitosamente'
    };
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    
    return {
      success: false,
      message: error.message || 'Error al cargar municipios',
      errors: error.errors || [error.message],
      data: []
    };
  }
};

/**
 * Get parishes by municipality
 * @param {number} municipalityId - Municipality ID
 * @returns {Promise<ApiResponse>}
 */
export const getParishesByMunicipality = async (municipalityId) => {
  try {
    if (!municipalityId) {
      throw new Error('Municipality ID es requerido');
    }

    const response = await apiClient.get(`/Address/getParishesByMunicipality/${municipalityId}`);
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: 'Parroquias cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching parishes:', error);
    
    return {
      success: false,
      message: error.message || 'Error al cargar parroquias',
      errors: error.errors || [error.message],
      data: []
    };
  }
};

/**
 * Create new address
 * @param {Object} addressData - Address data
 * @returns {Promise<ApiResponse>}
 */
export const createAddress = async (addressData) => {
  try {
    const response = await apiClient.post('/Address/createAddress', addressData);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Dirección creada exitosamente'
    };
  } catch (error) {
    console.error('Error creating address:', error);
    
    return {
      success: false,
      message: error.message || 'Error al crear dirección',
      errors: error.errors || [error.message],
      data: null
    };
  }
};

/**
 * Update address
 * @param {number} addressId - Address ID
 * @param {Object} addressData - Updated address data
 * @returns {Promise<ApiResponse>}
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    if (!addressId) {
      throw new Error('Address ID es requerido');
    }

    const response = await apiClient.put(`/Address/updateAddress/${addressId}`, addressData);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Dirección actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error updating address:', error);
    
    return {
      success: false,
      message: error.message || 'Error al actualizar dirección',
      errors: error.errors || [error.message],
      data: null
    };
  }
};

/**
 * Delete address
 * @param {number} addressId - Address ID
 * @returns {Promise<ApiResponse>}
 */
export const deleteAddress = async (addressId) => {
  try {
    if (!addressId) {
      throw new Error('Address ID es requerido');
    }

    const response = await apiClient.delete(`/Address/deleteAddress/${addressId}`);
    
    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'Dirección eliminada exitosamente'
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    
    return {
      success: false,
      message: error.message || 'Error al eliminar dirección',
      errors: error.errors || [error.message],
      data: null
    };
  }
};

/**
 * Get delivery data (casilleros, oficinas, etc.)
 * @returns {Promise<ApiResponse>}
 */
export const getDeliveryData = async () => {
  try {
    const response = await apiClient.get('/Address/getDeliveryOptions');
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: 'Opciones de entrega cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    
    return {
      success: false,
      message: error.message || 'Error al cargar opciones de entrega',
      errors: error.errors || [error.message],
      data: []
    };
  }
};

/**
 * Validate address
 * @param {Object} addressData - Address data to validate
 * @returns {Promise<ApiResponse>}
 */
export const validateAddress = async (addressData) => {
  try {
    const response = await apiClient.post('/Address/validateAddress', addressData);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Dirección validada exitosamente'
    };
  } catch (error) {
    console.error('Error validating address:', error);
    
    return {
      success: false,
      message: error.message || 'Error al validar dirección',
      errors: error.errors || [error.message],
      data: null
    };
  }
};

// Export all functions as default
export default {
  getUserAddresses,
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality,
  createAddress,
  updateAddress,
  deleteAddress,
  getDeliveryData,
  validateAddress,
};