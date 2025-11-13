// src/services/tracking/trackingService.js - SERVICIO COMPLETO PARA TRACKING WEB

import axiosInstance from './axiosInstance';

/**
 * Busca una guía por su número de tracking
 * @param {string} trackingNumber - Número de tracking a buscar
 * @returns {Promise<Object>} Resultado de la búsqueda
 */
export const searchTrackingNumber = async (trackingNumber) => {
  try {
    // console.log('🔍 Buscando tracking:', trackingNumber);

    // Limpiar el tracking number
    const cleanTrackingNumber = trackingNumber.trim().toUpperCase();

    const response = await axiosInstance.get(
      `/Tracking/search/${encodeURIComponent(cleanTrackingNumber)}`
    );

    // console.log('✅ Respuesta de búsqueda de tracking:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en searchTrackingNumber:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error de conexión al buscar el tracking',
    };
  }
};

/**
 * Busca una guía por número de tracking usando el endpoint existente de guías
 * (Fallback en caso de que no exista endpoint específico)
 * @param {string} trackingNumber - Número de tracking a buscar
 * @returns {Promise<Object>} Resultado de la búsqueda
 */
export const searchTrackingInGuias = async (trackingNumber) => {
  try {
    // console.log('🔍 Buscando en guías existentes:', trackingNumber);

    // Importar el servicio de guías existente
    const { getGuias } = await import('./packages/packagesService');
    
    const response = await getGuias();
    
    if (response.success && response.data) {
      // Buscar la guía que coincida con el tracking
      const foundGuia = response.data.find(guia => 
        guia.nGuia?.toLowerCase() === trackingNumber.toLowerCase() ||
        guia.tracking?.toLowerCase() === trackingNumber.toLowerCase() ||
        (Array.isArray(guia.trackings) && 
         guia.trackings.some(t => t.toLowerCase() === trackingNumber.toLowerCase()))
      );

      if (foundGuia) {
        return {
          success: true,
          message: 'Guía encontrada',
          data: {
            id: foundGuia.id,
            nGuia: foundGuia.nGuia,
            tracking: foundGuia.tracking,
            estatus: foundGuia.estatus,
            contenido: foundGuia.contenido,
            fecha: foundGuia.fecha,
            origen: 'USA', // Valor por defecto
            trackings: foundGuia.trackings,
            // Mapear campos adicionales si existen
            idGuia: foundGuia.idGuia,
            valorFOB: foundGuia.valorFOB,
            peso: foundGuia.peso,
            fechaRecepcion: foundGuia.fechaRecepcion,
          }
        };
      } else {
        return {
          success: false,
          message: 'No se encontró el número de tracking',
        };
      }
    } else {
      return {
        success: false,
        message: 'Error al cargar las guías',
      };
    }
  } catch (error) {        
    return {
      success: false,
      message: error.message || 'Error de conexión',
    };
  }
};

/**
 * Busca múltiples trackings (para uso futuro)
 * @param {Array<string>} trackingNumbers - Array de números de tracking
 * @returns {Promise<Object>} Resultados de la búsqueda
 */
export const searchMultipleTrackings = async (trackingNumbers) => {
  try {
    // console.log('🔍 Buscando múltiples trackings:', trackingNumbers);

    const response = await axiosInstance.post('/Tracking/search-multiple', {
      trackingNumbers
    });

    // console.log('✅ Respuesta de búsqueda múltiple:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en searchMultipleTrackings:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error de conexión al buscar los trackings',
    };
  }
};

/**
 * Función auxiliar para validar formato de tracking
 * @param {string} trackingNumber - Número de tracking a validar
 * @returns {Object} Resultado de la validación
 */
export const validateTrackingNumber = (trackingNumber) => {
  if (!trackingNumber || trackingNumber.trim() === '') {
    return {
      isValid: false,
      message: 'Por favor, ingresa un número de rastreo.'
    };
  }

  const cleaned = trackingNumber.trim();
  
  if (cleaned.length < 3) {
    return {
      isValid: false,
      message: 'El número de rastreo es demasiado corto.'
    };
  }

  if (cleaned.length > 50) {
    return {
      isValid: false,
      message: 'El número de rastreo es demasiado largo.'
    };
  }

  // Validar que contenga al menos algunos caracteres alfanuméricos
  const hasAlphanumeric = /[a-zA-Z0-9]/.test(cleaned);
  if (!hasAlphanumeric) {
    return {
      isValid: false,
      message: 'El número de rastreo debe contener letras o números.'
    };
  }

  return {
    isValid: true
  };
};

/**
 * Función auxiliar para generar pasos del timeline desde el historial
 * @param {string} estatusActual - Estado actual del paquete
 * @param {Array} historial - Historial de estados
 * @returns {Array} Array de pasos para el timeline
 */
export const generateStepsFromStatus = (estatusActual, historial) => {
  if (!historial || historial.length === 0) {
    return [{
      name: estatusActual || 'En proceso',
      date: 'Estado actual',
      completed: true,
      current: true
    }];
  }

  const processedHistorial = [];
  let lastProcessedEntry = null;

  // Procesar el historial para agrupar estados "procesado"
  for (const entry of historial) {
    const estatusLower = entry.estatus?.toLowerCase();

    if (estatusLower === 'procesado') {
      lastProcessedEntry = entry;
    } else {
      if (lastProcessedEntry) {
        processedHistorial.push({
          ...lastProcessedEntry,
          name: 'Procesado'
        });
        lastProcessedEntry = null;
      }
      processedHistorial.push({
        ...entry,
        name: entry.estatus
      });
    }
  }

  // Agregar el último "procesado" si existe
  if (lastProcessedEntry) {
    processedHistorial.push({
      ...lastProcessedEntry,
      name: 'Procesado'
    });
  }

  // Convertir a formato de pasos
  const steps = processedHistorial.map((entry, index) => {
    const isLast = index === processedHistorial.length - 1;
    return {
      name: entry.name,
      date: entry.fecha,
      completed: true,
      current: isLast
    };
  });

  return steps;
};