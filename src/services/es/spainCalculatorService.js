// src/services/es/spainCalculatorService.js
// ARCHIVO NUEVO — créalo en src/services/es/
import axiosInstance from '../axiosInstance';

/**
 * Calcula tarifa España → Venezuela.
 * POST /api/Calculator/calculate  (endpoint público, sin JWT)
 * PaisOrigen = "ES" (requiere el fix en ValidateRequest del CalculatorController)
 */
/*export const calculateSpainShipping = async ({
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
};*/


/**
 * Calcula tarifa de Encomienda exclusiva para España.
 * POST /api/ESP/SpainCalculator/calculate-encomienda
 * Este endpoint aplica el divisor 5000 y lógica en Euros.
 */
export const calculateSpainShipping = async ({
  weight,
  length,
  width,
  height,
  declaredValue,
}) => {
  try {
    const payload = {
      weight: parseFloat(weight),
      length: parseFloat(length),
      width: parseFloat(width),
      height: parseFloat(height),
      declaredValue: parseFloat(declaredValue)
    };

    // Llamada al nuevo controlador especializado
    const response = await axiosInstance.post('/ESP/SpainCalculator/calculate-encomienda', payload);
    const api = response.data;

    if (api.success) {
      return {
        success: true,
        // El objeto 'data' contiene los 'Detalles' (Flete, Combustible, etc.) 
        // tal como se ve en el Paso 5 del Admin
        data: api.data, 
        billedWeight: api.billedWeight,
        isVolumetric: api.isVolumetric,
        message: 'Cálculo completado'
      };
    }
    
    return { success: false, message: api.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message ?? 'Error en la conexión con el calculador de España',
    };
  }
};