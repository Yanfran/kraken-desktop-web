// src/services/us/usAddressService.js
import axiosInstance from '../axiosInstance';

export const addUsaOriginAddress = async (payload) => {
  try {
    const body = { ...payload, clientId: Number(payload.clientId) };
    const { data } = await axiosInstance.post('/spain/addresses/originUSA/add', body);
    return { success: data.success, data: data.data ?? null, message: data.message };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al crear dirección de origen USA',
    };
  }
};

export const fetchUsaOriginAddresses = async (clientId) => {
  try {
    const { data } = await axiosInstance.get(`/spain/addresses/originUSA?clientId=${Number(clientId)}`);
    return { success: data.success, data: data.data ?? [] };
  } catch {
    return { success: false, data: [] };
  }
};

export const deleteUsaOriginAddress = async (clientId, addressId) => {
  try {
    const { data } = await axiosInstance.delete(`/spain/addresses/originUSA/delete?clientId=${Number(clientId)}&addressId=${Number(addressId)}`);
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error al eliminar dirección' };
  }
};

export const setUsaOriginDefault = async (clientId, addressId) => {
  try {
    const { data } = await axiosInstance.post('/spain/addresses/originUSA/set-default', {
      clientId: Number(clientId),
      addressId: Number(addressId),
    });
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error al establecer predeterminada' };
  }
};

export const fetchUsaDestinationAddresses = async (clientId) => {
  try {
    const { data } = await axiosInstance.get(`/spain/addresses/destinationUSA?clientId=${Number(clientId)}`);
    return { success: data.success, data: data.data ?? [] };
  } catch {
    return { success: false, data: [] };
  }
};

export const deleteUsaDestinationAddress = async (clientId, addressId) => {
  try {
    const { data } = await axiosInstance.delete(`/spain/addresses/destinationUSA/delete?clientId=${Number(clientId)}&addressId=${Number(addressId)}`);
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error al eliminar dirección' };
  }
};

export const setUsaDestinationDefault = async (clientId, addressId) => {
  try {
    const { data } = await axiosInstance.post('/spain/addresses/destinationUSA/set-default', {
      clientId: Number(clientId),
      addressId: Number(addressId),
    });
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error al establecer predeterminada' };
  }
};
