// src/services/us/usGuiasService.js
import axiosInstance from '../axiosInstance';

export const getNextNGuia = async () => {
  try {
    const { data } = await axiosInstance.get('/usa/guia/next-nguia');
    return data?.nGuia ?? null;
  } catch {
    return null;
  }
};

export const getUsaMyShipments = async () => {
  try {
    const { data } = await axiosInstance.get('/usa/guia/my-shipments');
    return data;
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message ?? 'Error loading shipments',
    };
  }
};

export const getUsaGuiaDetail = async (guiaId) => {
  try {
    const { data } = await axiosInstance.get(`/usa/guia/${guiaId}/detail`);
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message ?? 'Error loading shipment details',
    };
  }
};
