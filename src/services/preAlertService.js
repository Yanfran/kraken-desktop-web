// src/services/preAlertService.js
import axiosInstance from './axiosInstance';

/**
 * ✅ CORREGIDO: Convertir archivo File a Base64 CON prefijo data:
 * @param {File} file - Archivo del navegador
 * @returns {Promise<string>} Base64 string con prefijo "data:tipo;base64,..."
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // ✅ IMPORTANTE: Retornar CON el prefijo "data:image/png;base64,..."
      const result = reader.result;
      
      if (!result || typeof result !== 'string') {
        reject(new Error('Error al leer el archivo'));
        return;
      }
      
      // Validar que el resultado sea válido
      if (result.length < 50) {
        reject(new Error('Archivo demasiado pequeño o corrupto'));
        return;
      }
      
      // console.log(`✅ Archivo leído: ${file.name} (${result.length} caracteres)`);
      // console.log(`📋 Preview: ${result.substring(0, 50)}...`);
      
      resolve(result); // ✅ Incluye "data:image/png;base64,..." automáticamente
    };
    
    reader.onerror = (error) => {
      console.error('❌ Error en FileReader:', error);
      reject(new Error(`Error al leer el archivo: ${error.message || 'Desconocido'}`));
    };
    
    // ✅ readAsDataURL automáticamente agrega el prefijo "data:tipo;base64,"
    reader.readAsDataURL(file);
  });
};

/**
 * Obtener MIME type desde extensión del archivo
 * @param {string} fileName - Nombre del archivo
 * @returns {string} MIME type
 */
function getMimeTypeFromExtension(filename) {
  if (!filename) return 'application/octet-stream';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

/**
 * ✅ CORREGIDO: Convertir archivos File a formato esperado por el backend
 * @param {File[]} files - Array de archivos del navegador
 * @returns {Promise<Array>} Array de archivos procesados con base64
 */
const convertFilesToBase64 = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  const convertedFiles = [];
  
  for (const file of files) {
    try {
      // ✅ Validar que el archivo sea válido
      if (!(file instanceof File)) {
        // console.error('❌ No es un archivo File válido:', file);
        throw new Error('Objeto no es un archivo válido');
      }

      const fileName = file.name;
      const fileSize = file.size;
      const fileMimeType = file.type;
      
      // Validaciones
      if (!fileName) {
        throw new Error('Archivo sin nombre');
      }
      
      if (fileSize === 0) {
        throw new Error(`${fileName}: Archivo vacío`);
      }
      
      // Validar tamaño máximo (5MB)
      if (fileSize > 5 * 1024 * 1024) {
        throw new Error(`${fileName}: Máximo 5MB (tamaño: ${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
      }
      
      // console.log(`🔄 Convirtiendo archivo: ${fileName} (${fileSize} bytes)`);
      
      // ✅ Convertir a Base64 CON prefijo
      const base64String = await fileToBase64(file);
      
      // ✅ VALIDAR que el base64 no esté vacío
      if (!base64String || base64String.length < 50) {
        throw new Error(`${fileName}: Base64 resultante inválido o vacío`);
      }
      
      // ✅ VALIDAR que empiece con "data:"
      if (!base64String.startsWith('data:')) {
        // console.warn(`⚠️ Base64 sin prefijo "data:", agregándolo...`);
        const mimeType = fileMimeType || getMimeTypeFromExtension(fileName);
        // Este caso no debería ocurrir, pero por si acaso
        throw new Error(`${fileName}: Base64 sin prefijo data:`);
      }
      
      const mimeType = fileMimeType || getMimeTypeFromExtension(fileName);
      
      convertedFiles.push({
        nombre: fileName,
        uri: base64String, // ✅ Incluye "data:image/png;base64,..."
        tipo: mimeType,
        tamaño: fileSize,
      });
      
      // console.log(`✅ Archivo convertido: ${fileName} (${fileSize} bytes, base64: ${base64String.length} chars)`);
    } catch (error) {
      console.error(`❌ Error convirtiendo archivo ${file.name}:`, error);
      throw new Error(`Error procesando ${file.name}: ${error.message}`);
    }
  }
  
  return convertedFiles;
};

/**
 * Procesar payload para backend (convertir archivos a base64)
 * @param {Object} payload - Payload original
 * @returns {Promise<Object>} Payload procesado
 */
const processPayloadForBackend = async (payload) => {
  const processedPayload = { ...payload };
  
  if (payload.facturas && payload.facturas.length > 0) {
    // console.log('📁 Procesando archivos...');
    
    const archivosExistentes = [];
    const archivosNuevos = [];
    
    payload.facturas.forEach((file) => {
      // Detectar si es archivo existente
      const isExistingFile = !(file instanceof File) && (
        !file.uri || 
        file.uri === null || 
        (file.tamaño === 0 || file.size === 0) ||
        ((file.nombre || file.name) && (file.nombre || file.name).startsWith('arch_'))
      );
      
      if (isExistingFile) {
        // console.log(`📄 Archivo existente: ${file.nombre || file.name}`);
        
        // ✅ FIX: Obtener tipo de archivo de la extensión si no existe
        const fileName = file.nombre || file.name;
        const tipoArchivo = file.tipo || file.type || getMimeTypeFromExtension(fileName);
        
        archivosExistentes.push({
          nombre: fileName,
          uri: '',  // ✅ Cadena vacía en lugar de null
          tipo: tipoArchivo,  // ✅ SIEMPRE enviar tipo válido
          tamaño: 0
        });
      } else {
        // console.log(`📄 Archivo nuevo: ${file.name || file.nombre}`);
        archivosNuevos.push(file);
      }
    });
    
    // ✅ Convertir solo archivos nuevos a base64
    let archivosNuevosConvertidos = [];
    if (archivosNuevos.length > 0) {
      // console.log(`🔄 Convirtiendo ${archivosNuevos.length} archivo(s) nuevo(s)...`);
      
      const todosFile = archivosNuevos.every(f => f instanceof File);
      
      if (todosFile) {
        archivosNuevosConvertidos = await convertFilesToBase64(archivosNuevos);
      } else {
        // console.log('⚠️ Archivos ya procesados, usando formato existente');
        archivosNuevosConvertidos = archivosNuevos.map(f => ({
          nombre: f.nombre || f.name,
          uri: f.uri,
          tipo: f.tipo || f.type || getMimeTypeFromExtension(f.nombre || f.name),
          tamaño: f.tamaño || f.size
        }));
      }
    }
    
    processedPayload.facturas = [...archivosExistentes, ...archivosNuevosConvertidos];
    
    // console.log(`✅ Archivos procesados: ${archivosExistentes.length} existentes + ${archivosNuevosConvertidos.length} nuevos`);
  }
  
  return processedPayload;
};


/**
 * Obtener todas las pre-alertas del usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>}
 */
export const getPreAlertas = async (userId) => {
  try {
    if (!userId || isNaN(userId)) {
      throw new Error('ID de usuario inválido');
    }

    // console.log(`📦 Obteniendo pre-alertas del usuario ${userId}...`);
    
    const response = await axiosInstance.get(`/PostPreAlert/getPreAlertas/${userId}`);
    
    // console.log('✅ Pre-alertas obtenidas:', response.data);
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Pre-alertas cargadas exitosamente'
    };
  } catch (error) {
    console.error('❌ Error fetching pre-alerts:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar pre-alertas',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

/**
 * Obtener pre-alertas pendientes
 * @returns {Promise<Object>}
 */
export const getPreAlertasPendientes = async () => {
  try {
    // console.log('📦 Obteniendo pre-alertas pendientes...');
    
    const response = await axiosInstance.get('/PostPreAlert/getPreAlertasPendientes');
    
    // console.log('✅ Pre-alertas pendientes obtenidas:', response.data);
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Pre-alertas pendientes cargadas'
    };
  } catch (error) {
    console.error('❌ Error fetching pending pre-alerts:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar pre-alertas pendientes',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

/**
 * Obtener pre-alerta por ID
 * @param {number} id - ID de la pre-alerta
 * @returns {Promise<Object>}
 */
export const getPreAlertaById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    // console.log(`📦 Obteniendo pre-alerta ID: ${id}...`);
    
    const response = await axiosInstance.get(`/PostPreAlert/${id}`);
    
    // console.log('✅ Pre-alerta obtenida:', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta cargada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error fetching pre-alert detail:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Crear nueva pre-alerta
 * @param {Object} payload - Datos de la pre-alerta
 * @returns {Promise<Object>}
 */
export const createPreAlerta = async (payload) => {
  try {
    // console.log('📤 Creando pre-alerta...', payload);
    
    // Validar campos requeridos
    if (!payload.trackings || payload.trackings.length === 0) {
      throw new Error('Debe proporcionar al menos un número de tracking');
    }

    if (!payload.contenidos || payload.contenidos.length === 0) {
      throw new Error('Debe seleccionar al menos un contenido');
    }

    // ✅ Procesar archivos a base64
    const processedPayload = await processPayloadForBackend(payload);
    
    // console.log('📋 Payload procesado:', {
    //   ...processedPayload,
    //   facturas: processedPayload.facturas?.map(f => ({
    //     nombre: f.nombre,
    //     tipo: f.tipo,
    //     tamaño: f.tamaño,
    //     base64Length: f.uri?.length || 0
    //   }))
    // });

    // ✅ Enviar como JSON (NO FormData)
    const response = await axiosInstance.post('/PostPreAlert/create', processedPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success === false) {
      const errMsg = response.data.message || 'Error al crear pre-alerta';
      throw new Error(errMsg);
    }

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta creada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error creating pre-alert:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error al crear pre-alerta');
  }
};

/**
 * Actualizar pre-alerta existente
 * @param {number} id - ID de la pre-alerta
 * @param {Object} payload - Datos actualizados
 * @returns {Promise<Object>}
 */
export const updatePreAlerta = async (id, payload) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    // console.log(`📤 Actualizando pre-alerta ID: ${id}`, payload);

    // ✅ Procesar archivos a base64
    const processedPayload = await processPayloadForBackend(payload);

    // ✅ Enviar como JSON (NO FormData)
    const response = await axiosInstance.post(`/PostPreAlert/update/${id}`, processedPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success === false) {
      const errMsg = response.data.message || 'Error al actualizar pre-alerta';
      throw new Error(errMsg);
    }

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Pre-alerta actualizada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error updating pre-alert:', error);
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar pre-alerta');
  }
};

/**
 * Eliminar pre-alerta
 * @param {number} id - ID de la pre-alerta
 * @returns {Promise<Object>}
 */
export const deletePreAlerta = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de pre-alerta inválido');
    }

    // console.log(`🗑️ Eliminando pre-alerta ID: ${id}`);

    const response = await axiosInstance.post('/PostPreAlert/delete', { id });
    
    // console.log('✅ Pre-alerta eliminada:', response.data);
    
    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'Pre-alerta eliminada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error deleting pre-alert:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar pre-alerta',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Obtener contenidos de paquetes
 * @returns {Promise<Object>}
 */
export const getPaquetesContenidos = async () => {
  try {
    // console.log('📦 Obteniendo contenidos de paquetes...');
    
    const response = await axiosInstance.get('/PaqueteContenidos/getContent');
    
    // console.log('✅ Contenidos obtenidos:', response.data);
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Contenidos cargados exitosamente'
    };
  } catch (error) {
    console.error('❌ Error fetching package contents:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar contenidos',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};