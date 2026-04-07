// src/services/us/upsService.js
import axiosInstance from '../axiosInstance';

const BASE = '/us/ups';

export const fetchUpsQuotes = async (originZip, weight, length, width, height, unitSystem = 'IMPERIAL') => {
  try {
    const res = await axiosInstance.post(`${BASE}/quotes`, {
      originZip,
      weight:     parseFloat(weight)  || 0,
      length:     parseFloat(length)  || 0,
      width:      parseFloat(width)   || 0,
      height:     parseFloat(height)  || 0,
      unitSystem,
    });
    return { success: true, data: res.data.data ?? [] };
  } catch (err) {
    return { success: false, message: err.response?.data?.message ?? 'Error consultando UPS.' };
  }
};