// src/services/addressService.js
// Servicio completo para manejo de direcciones, países y tipos de documento

import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de países con códigos telefónicos
 * @returns {Promise<Object>} Respuesta con lista de países
 */
export const getAddress = async () => {
  try {
    const response = await axiosInstance.get('/Addresses/countries');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener países'
    };
  } catch (error) {
    console.error('Error en getAddress:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener países',
      error: error.message
    };
  }
};

/**
 * Obtiene los tipos de documento disponibles
 * @returns {Promise<Object>} Respuesta con lista de tipos de documento
 */
export const getDocumentTypes = async () => {
  try {
    const response = await axiosInstance.get('/Addresses/document-types');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener tipos de documento'
    };
  } catch (error) {
    console.error('Error en getDocumentTypes:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener tipos de documento',
      error: error.message
    };
  }
};

/**
 * Obtiene los estados de un país
 * @param {string|number} countryId - ID del país
 * @returns {Promise<Object>} Respuesta con lista de estados
 */
export const getStatesByCountry = async (countryId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/states/${countryId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener estados'
    };
  } catch (error) {
    console.error('Error en getStatesByCountry:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener estados',
      error: error.message
    };
  }
};

/**
 * Obtiene los municipios de un estado
 * @param {string|number} stateId - ID del estado
 * @returns {Promise<Object>} Respuesta con lista de municipios
 */
export const getMunicipalitiesByState = async (stateId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/municipalities/${stateId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener municipios'
    };
  } catch (error) {
    console.error('Error en getMunicipalitiesByState:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener municipios',
      error: error.message
    };
  }
};

/**
 * Obtiene las parroquias de un municipio
 * @param {string|number} municipalityId - ID del municipio
 * @returns {Promise<Object>} Respuesta con lista de parroquias
 */
export const getParishesByMunicipality = async (municipalityId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/parishes/${municipalityId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener parroquias'
    };
  } catch (error) {
    console.error('Error en getParishesByMunicipality:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener parroquias',
      error: error.message
    };
  }
};

/**
 * Obtiene las tiendas/lockers disponibles
 * @returns {Promise<Object>} Respuesta con lista de tiendas
 */
export const getStores = async () => {
  try {
    const response = await axiosInstance.get('/Addresses/stores');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener tiendas'
    };
  } catch (error) {
    console.error('Error en getStores:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener tiendas',
      error: error.message
    };
  }
};

/**
 * Registra los datos personales y dirección del usuario
 * @param {Object} data - Datos del formulario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const registerPersonalData = async (data) => {
  try {
    const response = await axiosInstance.post('/Addresses/register-address-profile', data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        token: response.data.token
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al registrar datos personales'
    };
  } catch (error) {
    console.error('Error en registerPersonalData:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al registrar datos',
      error: error.message
    };
  }
};

/**
 * Obtiene las direcciones del usuario
 * @param {string|number} clientId - ID del cliente (opcional)
 * @returns {Promise<Object>} Respuesta con lista de direcciones
 */
export const getUserAddresses = async (clientId = null) => {
  try {
    const endpoint = clientId 
      ? `/Addresses/user-addresses?clientId=${clientId}`
      : '/Addresses/user-addresses';
      
    const response = await axiosInstance.get(endpoint);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al obtener direcciones del usuario'
    };
  } catch (error) {
    console.error('Error en getUserAddresses:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener direcciones',
      error: error.message
    };
  }
};

/**
 * Establece una dirección como predeterminada
 * @param {number} clientId - ID del cliente
 * @param {number} addressId - ID de la dirección
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const setDefaultAddress = async (clientId, addressId) => {
  try {
    const response = await axiosInstance.post('/Addresses/set-default-address', {
      clientId,
      addressId
    });
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al establecer dirección predeterminada'
    };
  } catch (error) {
    console.error('Error en setDefaultAddress:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión',
      error: error.message
    };
  }
};

/**
 * Elimina una dirección del usuario
 * @param {number} addressId - ID de la dirección a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteAddress = async (addressId) => {
  try {
    const response = await axiosInstance.delete(`/Addresses/${addressId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al eliminar dirección'
    };
  } catch (error) {
    console.error('Error en deleteAddress:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al eliminar dirección',
      error: error.message
    };
  }
};

/**
 * Actualiza una dirección existente
 * @param {number} addressId - ID de la dirección
 * @param {Object} data - Datos actualizados
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateAddress = async (addressId, data) => {
  try {
    const response = await axiosInstance.put(`/Addresses/${addressId}`, data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al actualizar dirección'
    };
  } catch (error) {
    console.error('Error en updateAddress:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al actualizar dirección',
      error: error.message
    };
  }
};

// Exportación por defecto de todas las funciones
export default {
  getAddress,
  getDocumentTypes,
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality,
  getStores,
  registerPersonalData,
  getUserAddresses,
  setDefaultAddress,
  deleteAddress,
  updateAddress
};