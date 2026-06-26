// src/services/us/upsService.js
import axiosInstance, { createCustomAxios, TIMEOUTS } from '../axiosInstance';

// Timeout extendido para llamadas UPS que pueden tardar (sandbox puede ser lento)
const axiosUPS = createCustomAxios(TIMEOUTS.LONG); // 300 segundos

const BASE = '/us/ups';

// pickupType: '03' = Customer Counter (drop-off) | '06' = One Time Pickup
export const fetchUpsQuotes = async (originZip, weight, length, width, height, unitSystem = 'IMPERIAL', pickupType = '03', originState = '', originCity = '') => {
  try {
    const res = await axiosInstance.post(`${BASE}/quotes`, {
      originZip,
      originState,
      originCity,
      weight:     parseFloat(weight)  || 0,
      length:     parseFloat(length)  || 0,
      width:      parseFloat(width)   || 0,
      height:     parseFloat(height)  || 0,
      unitSystem,
      PickupType: pickupType,
    });
    return { success: true, data: res.data.data ?? [] };
  } catch (err) {
    return { success: false, message: err.response?.data?.message ?? 'Error consultando UPS.' };
  }
};

export const fetchPickupRate = async ({ addressLine, city, stateProvince, postalCode, residentialIndicator, pickupDate, readyTime, closeTime }) => {
  try {
    const res = await axiosInstance.post(`${BASE}/pickup/rate`, {
      addressLine, city, stateProvince, postalCode,
      residentialIndicator: residentialIndicator ?? 'N',
      pickupDate, readyTime, closeTime,
    });
    return { success: true, rate: parseFloat(res.data.rate) || 0, currency: res.data.currency ?? 'USD' };
  } catch (err) {
    return { success: false, rate: 0, message: err.response?.data?.message ?? 'Error consultando tarifa de pickup.' };
  }
};

export const createUpsPickup = async (pickupData) => {
  try {
    const res = await axiosUPS.post(`${BASE}/pickup/create`, pickupData);
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message ?? err?.message ?? 'Error creando pickup UPS.',
    };
  }
};

export const createUpsShipment = async (shipmentData) => {
  try {
    const res = await axiosUPS.post(`${BASE}/shipment/create`, shipmentData);
    const json = res.data;
    if (!json.success) return { success: false, data: null, message: json.message };
    return {
      success: true,
      data: {
        trackingNumber: json.trackingNumber ?? json.data?.trackingNumber ?? '',
        labelBase64:    json.labelBase64    ?? json.data?.labelBase64    ?? null,
        labelUrl:       json.labelUrl       ?? json.data?.labelUrl       ?? null,
        shipmentId:     json.shipmentId     ?? json.data?.shipmentId     ?? null,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      message: err.response?.data?.message ?? err?.message ?? 'Error creando envío UPS.',
    };
  }
};

export const getUpsTracking = async (trackingNumber) => {
  try {
    const res = await axiosInstance.get(`${BASE}/tracking/${trackingNumber}`);
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message ?? 'Error consultando tracking UPS.',
    };
  }
};