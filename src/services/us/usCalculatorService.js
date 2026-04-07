// src/services/us/usCalculatorService.js
import axiosInstance from '../axiosInstance';

export const calculateUSShipping = async ({
  stateId,
  municipalityId = null,
  weight,
  declaredValue,
  weightUnit    = 'Kg',
  dimensionUnit = 'cm',
  length        = 0,
  width         = 0,
  height        = 0,
}) => {
  try {
    const payload = {
      stateId:        Number(stateId),
      municipalityId: municipalityId ? Number(municipalityId) : null,
      declaredValue:  parseFloat(declaredValue),
      currency:       'USD',
      content:        'General',
      paisOrigen:     'US',
      weight:         parseFloat(weight),
      weightUnit,
      dimensionUnit,
      dimensions: {
        length: parseFloat(length),
        width:  parseFloat(width),
        height: parseFloat(height),
      },
    };

    const response = await axiosInstance.post('/Calculator/calculate', payload);
    const api = response.data;

    if (!api.success) {
      return { success: false, data: null, message: api.message };
    }

    const raw = api.data;
    const breakdown = raw?.breakdowns?.oficina ?? raw?.breakdowns?.domicilio ?? null;

    // ✅ CalculatorController devuelve montoUSD en cada detalle
    // Step3Summary espera d.monto → remapeamos aquí para no tocar el componente
    const detallesNormalizados = (breakdown?.detalles ?? []).map(d => ({
      descripcionItem: d.descripcionItem,
      monto:           d.montoUSD ?? d.monto ?? 0,
      esDescuento:     d.esDescuento ?? false,
      categoria:       d.categoria  ?? '',
    }));

    const normalizedData = {
      detalles: detallesNormalizados,
      total:    breakdown?.total ?? raw?.cost ?? 0,
    };

    return {
      success:         true,
      data:            normalizedData,
      billedWeight:    raw?.weightLbVol ?? null,
      isVolumetric:    false,
      message:         'Cálculo completado',
      deliveryOptions: raw?.deliveryOptions ?? [],
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