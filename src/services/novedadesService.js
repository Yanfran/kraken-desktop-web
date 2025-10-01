// src/services/novedadesService.js
import axiosInstance from './axiosInstance';

/**
 * Service for News/Novedades operations
 * Adapted from React Native (services/novedadesService.ts) for web compatibility
 * 
 * Backend endpoint: /api/Novedades/list
 */

/**
 * @typedef {Object} Novedad
 * @property {number} id - ID de la novedad
 * @property {string} titulo - Título de la novedad
 * @property {string} descripcion - Descripción/contenido
 * @property {string} [icono] - Nombre del icono
 * @property {string} [colorFondo] - Color de fondo en formato hex
 * @property {string} [colorTexto] - Color del texto en formato hex
 * @property {string} [fechaCreacion] - Fecha de creación
 * @property {boolean} [activo] - Si está activa o no
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {string} message - Mensaje descriptivo
 * @property {Novedad[]} data - Array de novedades
 */

/**
 * Get all active news/novedades from the backend
 * @returns {Promise<ApiResponse>}
 */
export const getNovedades = async () => {
  try {
    console.log('📰 Obteniendo novedades desde el backend...');
    
    const response = await axiosInstance.get('/Novedades/list');
    
    console.log('✅ Respuesta del backend:', response.data);
    
    // El backend retorna: { success: true, message: "...", data: [...] }
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Novedades cargadas exitosamente'
      };
    }
    
    // Si success es false
    return {
      success: false,
      message: response.data.message || 'Error al obtener novedades',
      data: []
    };
    
  } catch (error) {
    console.error('❌ Error fetching novedades:', error);
    
    // Manejo de errores detallado
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Error de conexión al cargar novedades';
    
    return {
      success: false,
      message: errorMessage,
      data: []
    };
  }
};

/**
 * Get a specific novedad by ID
 * @param {number} id - ID de la novedad
 * @returns {Promise<ApiResponse>}
 */
export const getNovedadById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de novedad inválido');
    }

    console.log(`📰 Obteniendo novedad con ID: ${id}`);
    
    const response = await axiosInstance.get(`/Novedades/${id}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Novedad cargada exitosamente'
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Error al cargar novedad',
      data: null
    };
    
  } catch (error) {
    console.error('❌ Error fetching novedad by ID:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error al cargar novedad',
      data: null
    };
  }
};

/**
 * Format novedades for the NewsCarousel component
 * Transforms backend data to the format expected by the carousel
 * @param {Novedad[]} novedades - Array of novedades from backend
 * @returns {Object[]} Formatted novedades for carousel
 */
export const formatNovedadesForCarousel = (novedades) => {
  if (!Array.isArray(novedades)) {
    console.warn('⚠️ formatNovedadesForCarousel: Input is not an array');
    return [];
  }
  
  return novedades.map(item => ({
    id: item.id,
    title: item.titulo || item.title || 'Novedad',
    text: item.descripcion || item.text || item.contenido || '',
    iconName: item.icono || item.iconName || 'information-circle',
    backgroundColor: item.colorFondo || item.backgroundColor || '#f0f8ff',
    textColor: item.colorTexto || item.textColor || '#333'
  }));
};

/**
 * Get formatted novedades ready for display in carousel
 * @returns {Promise<Object[]>}
 */
export const getNovedadesForCarousel = async () => {
  try {
    const response = await getNovedades();
    
    if (response.success && response.data) {
      return formatNovedadesForCarousel(response.data);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting novedades for carousel:', error);
    return [];
  }
};

// Export individual functions
export default {
  getNovedades,
  getNovedadById,
  formatNovedadesForCarousel,
  getNovedadesForCarousel
};