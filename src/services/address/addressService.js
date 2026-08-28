// src/services/address/addressService.js
import axiosInstance from '../axiosInstance';

/**
 * Obtener estados por país
 * @param {number} countryId - ID del país
 * @returns {Promise<Object>}
 */
export const getStatesByCountry = async (countryId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/location-data?countryId=${countryId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'No pudimos obtener los estados',
      data: []
    };
  } catch (error) {
    console.error('Error en getStatesByCountry:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      error: error.message,
      data: []
    };
  }
};

/**
 * Obtener municipios por estado
 * @param {number} stateId - ID del estado
 * @returns {Promise<Object>}
 */
export const getMunicipalitiesByState = async (stateId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/location-data?stateId=${stateId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'No pudimos obtener los municipios',
      data: []
    };
  } catch (error) {
    console.error('Error en getMunicipalitiesByState:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      error: error.message,
      data: []
    };
  }
};

/**
 * Obtener parroquias por municipio
 * @param {number} municipalityId - ID del municipio
 * @returns {Promise<Object>}
 */
export const getParishesByMunicipality = async (municipalityId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/location-data?municipalityId=${municipalityId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'No pudimos obtener las parroquias',
      data: []
    };
  } catch (error) {
    console.error('Error en getParishesByMunicipality:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      error: error.message,
      data: []
    };
  }
};

/**
 * Obtener datos de delivery (tiendas/lockers)
 * @returns {Promise<Object>}
 */
export const getDeliveryData = async () => {
  try {
    const response = await axiosInstance.get('/Addresses/delivery-data');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'No pudimos obtener los datos de entrega',
      data: null
    };
  } catch (error) {
    console.error('Error en getDeliveryData:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      error: error.message,
      data: null
    };
  }
};

/**
 * Obtener direcciones guardadas del usuario
 * @returns {Promise<Object>}
 */
export const getUserAddresses = async () => {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.error('❌ No hay userId en localStorage');
      return {
        success: false,
        message: 'Usuario no autenticado',
        data: []
      };
    }

    const response = await axiosInstance.post('/Addresses/user-addresses', {
      ClientId: parseInt(userId)
    });
    
    if (response.data.success) {
      const addresses = response.data.data || [];
      
      return {
        success: true,
        data: addresses,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'No pudimos obtener las direcciones',
      data: []
    };

  } catch (error) {
    console.error('❌ Error en getUserAddresses:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      data: []
    };
  }
};

/**
 * ✅ NUEVA: Registrar una nueva dirección
 * @param {Object} payload - Datos de la dirección
 * @returns {Promise<Object>}
 */
export const registerAddress = async (payload) => {
  // try {
    const response = await axiosInstance.post('/Addresses/register-address', payload);
    
    return {
      success: response.data.success || false,
      message: response.data.message || 'Dirección registrada',
      requiresDefaultSelection: response.data.requiresDefaultSelection || false,
      data: response.data
    };
  // } catch (error) {
  //   console.error('❌ Error en registerAddress:', error);
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || 'Error al registrar dirección',
  //     requiresDefaultSelection: false
  //   };
  // }
};

/**
 * Obtener casilleros (USA/CHINA)
 * @returns {Promise<Object>}
 */
export const getCasilleros = async () => {
  try {
    const response = await axiosInstance.get('/Casilleros/list');
    return {
      success: response.data.success || false,
      data: response.data.data || [],
      message: response.data.message
    };
  } catch (error) {
    console.error('❌ Error en getCasilleros:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      data: []
    };
  }
};

/**
 * Registrar datos personales/dirección
 * @param {Object} data - Datos de la dirección
 * @returns {Promise<Object>}
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
      message: response.data.message || 'No pudimos registrar los datos personales'
    };
  } catch (error) {
    console.error('Error en registerPersonalData:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      error: error.message
    };
  }
};

/**
 * Establecer dirección como predeterminada
 * @param {number} addressId - ID de la dirección
 * @returns {Promise<Object>}
 */
export const setDefaultAddress = async (addressId) => {
  try {
    const userId = localStorage.getItem('userId');
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const userEmail = userData.email;

    // ✅ ENDPOINT CORRECTO: /set-default-address (no /set-default)
    const response = await axiosInstance.post('/Addresses/set-default-address', {
      ClientId: parseInt(userId),
      AddressId: parseInt(addressId),
      Email: userEmail
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error en setDefaultAddress:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'No pudimos establecer la dirección predeterminada',
      error: error.message
    };
  }
};

/**
 * Eliminar dirección
 * @param {number} addressId - ID de la dirección
 * @returns {Promise<Object>}
 */
export const deleteAddress = async (addressId) => {
  try {
    const userId = localStorage.getItem('userId');
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const userEmail = userData.email;

    const response = await axiosInstance.post('/Addresses/delete-address', {
      ClientId: parseInt(userId),
      AddressId: parseInt(addressId),
      Email: userEmail
    });
    
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error en deleteAddress:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'No pudimos eliminar la dirección',
      error: error.message
    };
  }
};

/**
 * ✅ NUEVA: Obtener lista de direcciones (casilleros) para la página de direcciones
 * @returns {Promise<Object>}
 */
export const getAddresses = async () => {
  try {
    const response = await axiosInstance.get('/Casilleros/list');
    return {
      success: response.data.success || false,
      data: response.data.data || [],
      message: response.data.message
    };
  } catch (error) {
    console.error('❌ Error en getAddresses:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sin conexión',
      data: []
    };
  }
};

// Export default para compatibilidad
export default {
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality,
  getDeliveryData,
  getUserAddresses,
  registerAddress, // ✅ NUEVO
  registerPersonalData,
  setDefaultAddress,
  deleteAddress,
  getCasilleros,
  getAddresses, // ✅ NUEVO
};