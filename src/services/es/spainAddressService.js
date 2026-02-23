// src/services/es/spainAddressService.js
// ✅ Servicio para gestión de direcciones del wizard España (KE)
//    Patrón idéntico a guiasService.js — usa axiosInstance

import axiosInstance from '../axiosInstance';

// ════════════════════════════════════════════════════════════
// ██  ORIGEN — España (spa_tbClienteDireccionOrigen)
// ════════════════════════════════════════════════════════════

export const fetchOriginAddresses = async (clientId) => {
  try {
    const response = await axiosInstance.get(`/spain/addresses/origin?clientId=${clientId}`);
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      data: Array.isArray(apiResponse.data) ? apiResponse.data : [],
      message: apiResponse.message || 'Direcciones de origen cargadas',
    };
  } catch (error) {
    console.error('Error fetching origin addresses:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al cargar direcciones de origen',
      errors: error.response?.data?.errors || [error.message],
    };
  }
};

export const addOriginAddress = async (payload) => {
  try {
    const body = { ...payload, clientId: Number(payload.clientId) };
    const response = await axiosInstance.post('/spain/addresses/origin/add', body);
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      data: apiResponse.data || null,
      message: apiResponse.message || 'Dirección de origen creada',
    };
  } catch (error) {
    console.error('Error adding origin address:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al crear dirección de origen',
      errors: error.response?.data?.errors || [error.message],
    };
  }
};

export const setOriginDefault = async (clientId, addressId) => {
  try {
    const response = await axiosInstance.post('/spain/addresses/origin/set-default', {
      clientId: Number(clientId),
      addressId: Number(addressId),
    });
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      message: apiResponse.message || 'Predeterminada de origen actualizada',
    };
  } catch (error) {
    console.error('Error setting origin default:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al establecer predeterminada de origen',
    };
  }
};

export const deleteOriginAddress = async (clientId, addressId) => {
  try {
    const response = await axiosInstance.delete('/spain/addresses/origin/delete', {
      data: { clientId: Number(clientId), addressId: Number(addressId) },
    });
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      message: apiResponse.message || 'Dirección de origen eliminada',
    };
  } catch (error) {
    console.error('Error deleting origin address:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar dirección de origen',
    };
  }
};

// ════════════════════════════════════════════════════════════
// ██  DESTINO — Venezuela (spa_tbClienteDirecciones existente)
// ════════════════════════════════════════════════════════════

export const fetchDestinationAddresses = async (clientId) => {
  try {
    const response = await axiosInstance.get(`/spain/addresses/destination?clientId=${clientId}`);
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      data: Array.isArray(apiResponse.data) ? apiResponse.data : [],
      message: apiResponse.message || 'Direcciones de destino cargadas',
    };
  } catch (error) {
    console.error('Error fetching destination addresses:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al cargar direcciones de destino',
    };
  }
};

export const addDestinationAddress = async (payload) => {
  try {
    const body = { ...payload, clientId: Number(payload.clientId) };
    const response = await axiosInstance.post('/spain/addresses/destination/add', body);
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      data: apiResponse.data || null,
      message: apiResponse.message || 'Dirección de destino creada',
    };
  } catch (error) {
    console.error('Error adding destination address:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al crear dirección de destino',
    };
  }
};

export const setDestinationDefault = async (clientId, addressId) => {
  try {
    const response = await axiosInstance.post('/spain/addresses/destination/set-default', {
      clientId: Number(clientId),
      addressId: Number(addressId),
    });
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      message: apiResponse.message || 'Predeterminada de destino actualizada',
    };
  } catch (error) {
    console.error('Error setting destination default:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al establecer predeterminada de destino',
    };
  }
};

export const deleteDestinationAddress = async (clientId, addressId) => {
  try {
    const response = await axiosInstance.delete('/spain/addresses/destination/delete', {
      data: { clientId: Number(clientId), addressId: Number(addressId) },
    });
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      message: apiResponse.message || 'Dirección de destino eliminada',
    };
  } catch (error) {
    console.error('Error deleting destination address:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar dirección de destino',
    };
  }
};

// ════════════════════════════════════════════════════════════
// ██  GEO — Venezuela
//     Misma lógica que DeliveryOption.jsx
// ════════════════════════════════════════════════════════════

/**
 * Carga ciudades disponibles Y todas las tiendas en una sola llamada.
 * Endpoint: GET /Addresses/delivery-data
 * Respuesta: { ciudadesDisponibles: [{id, name}], tiendas: [{id, nombre, idZonaCiudad, idEstado, ...}] }
 * @returns {Promise<{ ciudades: Array, tiendas: Array }>}
 */
export const fetchDeliveryData = async () => {
  try {
    const response = await axiosInstance.get('/Addresses/delivery-data');
    const apiResponse = response.data;
    if (!apiResponse.success) return { ciudades: [], tiendas: [] };

    const { ciudadesDisponibles = [], ciudad, tiendas = [] } = apiResponse.data;

    // ciudadesDisponibles tiene prioridad; si no, usar ciudad única como fallback
    const ciudades = ciudadesDisponibles.length > 0
      ? ciudadesDisponibles                   // [{ id, name }]
      : ciudad ? [ciudad] : [];

    return { ciudades, tiendas };
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    return { ciudades: [], tiendas: [] };
  }
};

/**
 * Carga estados de Venezuela.
 * Endpoint: GET /Addresses/location-data?countryId=1
 * @returns {Promise<Array>} [{ id, name }]
 */
export const fetchVenezuelaStates = async () => {
  try {
    const response = await axiosInstance.get('/Addresses/location-data?countryId=1');
    const apiResponse = response.data;
    return apiResponse.success && Array.isArray(apiResponse.data)
      ? apiResponse.data      // [{ id, name }]
      : [];
  } catch (error) {
    console.error('Error fetching Venezuela states:', error);
    return [];
  }
};

/**
 * Carga municipios de un estado.
 * Endpoint: GET /Addresses/location-data?stateId=X
 * @returns {Promise<Array>} [{ id, name }]
 */
export const fetchMunicipios = async (stateId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/location-data?stateId=${stateId}`);
    const apiResponse = response.data;
    return apiResponse.success && Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];
  } catch (error) {
    console.error('Error fetching municipios:', error);
    return [];
  }
};

/**
 * Carga parroquias de un municipio.
 * Endpoint: GET /Addresses/location-data?municipalityId=X
 * @returns {Promise<Array>} [{ id, name }]
 */
export const fetchParroquias = async (municipioId) => {
  try {
    const response = await axiosInstance.get(`/Addresses/location-data?municipalityId=${municipioId}`);
    const apiResponse = response.data;
    return apiResponse.success && Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];
  } catch (error) {
    console.error('Error fetching parroquias:', error);
    return [];
  }
};

// ════════════════════════════════════════════════════════════
// ██  EXPORT DEFAULT
// ════════════════════════════════════════════════════════════
export default {
  fetchOriginAddresses,
  addOriginAddress,
  setOriginDefault,
  deleteOriginAddress,
  fetchDestinationAddresses,
  addDestinationAddress,
  setDestinationDefault,
  deleteDestinationAddress,
  fetchDeliveryData,
  fetchVenezuelaStates,
  fetchMunicipios,
  fetchParroquias,
};