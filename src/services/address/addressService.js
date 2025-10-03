import axiosInstance from '../axiosInstance';

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
      message: response.data.message || 'Error al obtener datos de delivery'
    };
  } catch (error) {
    console.error('Error en getDeliveryData:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error de conexión al obtener datos de delivery',
      error: error.message
    };
  }
};

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

export default {
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality,
  getDeliveryData,
  registerPersonalData,
};