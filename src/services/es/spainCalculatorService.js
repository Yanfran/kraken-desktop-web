// src/services/es/spainCalculatorService.js
// ARCHIVO NUEVO — créalo en src/services/es/
import axiosInstance from '../axiosInstance';

/**
 * Calcula tarifa España → Venezuela.
 * POST /api/Calculator/calculate  (endpoint público, sin JWT)
 * PaisOrigen = "ES" (requiere el fix en ValidateRequest del CalculatorController)
 */
export const calculateSpainShipping = async ({
  stateId,
  municipalityId = null,
  declaredValue,
  weight,
  weightUnit    = 'Lb',
  dimensionUnit = 'cm',
  dimensions    = null,
  content       = '',
}) => {
  try {
    const payload = {
      stateId:        Number(stateId),
      municipalityId: municipalityId ? Number(municipalityId) : null,
      declaredValue:  parseFloat(declaredValue),
      currency:       'USD',
      content:        content || 'General',
      paisOrigen:     'ES',
      weight:         parseFloat(weight),
      weightUnit,
      dimensionUnit,
      dimensions:     dimensions ?? null,
    };

    console.log('🇪🇸 [SpainCalculator] payload →', payload);

    const response = await axiosInstance.post('/Calculator/calculate', payload);
    const api = response.data;

    return {
      success: api.success,
      data:    api.data    ?? null,
      message: api.message ?? 'Cálculo completado',
    };
  } catch (error) {
    console.error('❌ [SpainCalculator] Error:', error);
    return {
      success: false,
      data:    null,
      message: error.response?.data?.message ?? 'Error al calcular tarifa',
    };
  }
};