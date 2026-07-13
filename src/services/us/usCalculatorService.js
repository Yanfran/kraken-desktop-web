// src/services/us/usCalculatorService.js
// Calcula tarifa Encomiendas USA (Prime Box / Family Box) en USD.
// Endpoint: POST api/usa/tarifa/calcular
import axiosInstance from '../axiosInstance';

export const calculateUSShipping = async ({
  stateId,
  municipalityId = null,
  lockerId       = null,
  weight,
  declaredValue,
  weightUnit     = 'Kg',
}) => {
  try {
    const { data: api } = await axiosInstance.post('/usa/tarifa/calcular', {
      stateId:        stateId        ? Number(stateId)        : null,
      municipalityId: municipalityId ? Number(municipalityId) : null,
      lockerId:       lockerId       ? Number(lockerId)       : null,
      weight:         parseFloat(weight),
      weightUnit,
      declaredValue:  parseFloat(declaredValue) || 0,
    });

    if (!api.success) {
      return { success: false, data: null, message: api.message };
    }

    const raw = api.data;

    const normalizedData = {
      detalles: (raw.detalles ?? []).map(d => ({
        descripcionItem: d.descripcionItem,
        monto:           d.monto,
        esDescuento:     d.esDescuento ?? false,
        categoria:       d.categoria   ?? '',
      })),
      total: raw.totalUSD,
    };

    return {
      success:  true,
      data:     normalizedData,
      tipoBox:  raw.tipoBox,
      pesoLbs:  raw.pesoLbs,
      message:  'Cálculo completado',
    };

  } catch (error) {
    console.error('❌ [USCalculator] Error:', error);
    return {
      success: false,
      data:    null,
      message: error.response?.data?.message ?? 'Error al calcular tarifa',
    };
  }
};

export const calculateUSDocumentShipping = async ({
  stateId,
  municipalityId = null,
  lockerId       = null,
  weight,
  declaredValue,
  weightUnit     = 'Kg',
}) => {
  try {
    const { data: api } = await axiosInstance.post('/usa/documento/tarifa/calcular', {
      stateId:        stateId        ? Number(stateId)        : null,
      municipalityId: municipalityId ? Number(municipalityId) : null,
      lockerId:       lockerId       ? Number(lockerId)       : null,
      weight:         parseFloat(weight),
      weightUnit,
      declaredValue:  parseFloat(declaredValue) || 0,
    });

    if (!api.success) {
      return { success: false, data: null, message: api.message };
    }

    const raw = api.data;
    const normalizedData = {
      detalles: (raw.detalles ?? []).map(d => ({
        descripcionItem: d.descripcionItem ?? d.DescripcionItem,
        monto:           d.monto ?? d.Monto,
        esDescuento:     d.esDescuento ?? false,
        categoria:       d.categoria   ?? d.Categoria ?? '',
      })),
      total: raw.totalUSD,
    };

    return {
      success: true,
      data:    normalizedData,
      tipoBox: 'DOCUMENTO',
      pesoLbs: raw.pesoLbs,
      message: 'Cálculo completado',
    };
  } catch (error) {
    console.error('❌ [USDocumentCalculator] Error:', error);
    return {
      success: false,
      data:    null,
      message: error.response?.data?.message ?? 'Error al calcular tarifa',
    };
  }
};

export const fetchUsaDescuentos = async () => {
  try {
    const { data: api } = await axiosInstance.get('/usa/tarifa/descuentos');
    if (!api.success) return { success: false, data: null };
    return { success: true, data: api.data };
  } catch {
    return { success: false, data: null };
  }
};
