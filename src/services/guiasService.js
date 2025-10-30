// src/services/guiasService.js
import axiosInstance from './axiosInstance';

/**
 * Get all guias for the current user
 * @returns {Promise<ApiResponse>}
 */
export const getGuias = async () => {
  try {
    const response = await axiosInstance.get('/PostPreAlert/getGuias');
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      data: Array.isArray(apiResponse.data) ? apiResponse.data : [],
      message: apiResponse.message || 'Guías cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching guias:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar guías',
      errors: error.response?.data?.errors || [error.message],
    };
  }
};

/**
 * Fetch guias (alternative version)
 * @returns {Promise<Array>}
 */
export const fetchGuias = async () => {
  const response = await axiosInstance.get('/PostPreAlert/getGuias');
  const apiResponse = response.data;

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Error al cargar las guías.');
  }

  return Array.isArray(apiResponse.data) ? apiResponse.data : [];
};

/**
 * Get guia by ID
 * @param {number} id - Guia ID
 * @returns {Promise<ApiResponse>}
 */
export const getGuiaById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de guía inválido');
    }
    const response = await axiosInstance.get(`/Guias/getGuiaDetail/${id}`);
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Guía cargada exitosamente'
    };
  } catch (error) {
    console.error('Error fetching guia by ID:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar guía',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * ✅ NUEVA: Calculate price for a single guia using the calculator endpoint
 * @param {number} guiaId - Guia ID
 * @returns {Promise<ApiResponse>}
 */
export const calculateSingleGuiaPrice = async (guiaId) => {
  try {
    console.log('💰 Calculando precio para guía:', guiaId);
    const response = await axiosInstance.get(`/Guias/getGuiaDetail/${guiaId}`);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Precio calculado exitosamente'
    };
  } catch (error) {
    console.error('Error calculating single guia price:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al calcular precio',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * ✅ ACTUALIZADA: Get last shipment with calculated price
 * @returns {Promise<ApiResponse>}
 */
export const getLastShipment = async () => {
  try {
    const response = await getGuias();
    console.log('Fetched guias for last shipment:', response);
    
    if (response.success && response.data && response.data.length > 0) {
      const sortedGuias = response.data.sort((a, b) => 
        new Date(b.fechaRaw || b.fecha) - new Date(a.fechaRaw || a.fecha)
      );
      const lastGuia = sortedGuias[0];
      
      console.log('📦 Last guia data:', lastGuia);
      
      // ✅ Extraer solo el string 'contenido' del primer objeto
      const primerContenido = Array.isArray(lastGuia.contenidos) && lastGuia.contenidos.length > 0
        ? lastGuia.contenidos[0].contenido
        : 'Sin descripción';
      
      // ✅ NUEVO: Calcular el precio real usando el CalculatorController
      let costoEnvio = '$0.00';
      let costoCalculado = null;
      
      try {
        const calculationResponse = await calculateSingleGuiaPrice(lastGuia.idGuia);
        
        if (calculationResponse.success && calculationResponse.data) {
          // El endpoint retorna { totalOficina, totalDomicilio, breakdown }
          const precioOficina = calculationResponse.data.detalleFactura.precioBaseUSD || 0;
          costoEnvio = `$${parseFloat(precioOficina).toFixed(2)}`;
          costoCalculado = calculationResponse.data; // Guardar datos completos por si se necesitan
          
          console.log('💵 Precio calculado:', costoEnvio);
        } else {
          console.warn('⚠️ No se pudo calcular el precio, usando valor por defecto');
          // Fallback al valorFOB si falla el cálculo
          costoEnvio = lastGuia.valorFOB 
            ? `$${parseFloat(lastGuia.valorFOB).toFixed(2)}` 
            : '$0.00';
        }
      } catch (calcError) {
        console.error('❌ Error al calcular precio:', calcError);
        // Fallback al valorFOB si hay error
        costoEnvio = lastGuia.valorFOB 
          ? `$${parseFloat(lastGuia.valorFOB).toFixed(2)}` 
          : '$0.00';
      }
      
      return {
        success: true,
        data: {
          id: lastGuia.idGuia,
          trackingNumber: lastGuia.nGuia || lastGuia.trackings?.[0] || 'N/A',
          status: lastGuia.estatus || 'Desconocido',
          date: lastGuia.fecha || '',
          origin: lastGuia.origen || 'USA',
          cost: costoEnvio,
          prealerted: lastGuia.prealertado || false,
          discount: lastGuia.prealertado ? null : '-10%',
          trackingNumbers: lastGuia.trackings || [],
          contenido: primerContenido,
          calculationData: costoCalculado // Datos adicionales del cálculo si se necesitan
        },
        message: 'Último envío cargado'
      };
    }
    
    return { 
      success: false, 
      message: 'No hay envíos disponibles', 
      data: null 
    };
  } catch (error) {
    console.error('Error fetching last shipment:', error);
    return { 
      success: false, 
      message: error.message || 'Error al cargar último envío', 
      data: null 
    };
  }
};

/**
 * Calculate price for multiple guias
 * @param {number[]} guiaIds - Array of Guia IDs
 * @returns {Promise<ApiResponse>}
 */
export const calculateMultipleGuiasPrice = async (guiaIds) => {
  try {
    const response = await axiosInstance.post('/Guias/calculateMultiplePrice', { guiaIds });
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Cálculo realizado exitosamente'
    };
  } catch (error) {
    console.error('Error calculating guias price:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al calcular precio',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Get invoices for a specific guia
 * @param {number} guiaId - Guia ID
 * @returns {Promise<ApiResponse>}
 */
export const getGuiaInvoices = async (guiaId) => {
  try {
    const response = await axiosInstance.get(`/Guias/getInvoices/${guiaId}`);
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Facturas cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching guia invoices:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar facturas',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

/**
 * Download a specific invoice file
 * @param {number} facturaId - Invoice ID
 * @param {string} nombreArchivo - The desired file name
 * @returns {Promise<boolean>} - True if download was initiated
 */
export const downloadInvoice = async (facturaId, nombreArchivo) => {
  try {
    const response = await axiosInstance.get(`/Guias/downloadInvoice/${facturaId}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return false;
  }
};

/**
 * Download all invoices for a guia
 * @param {number} guiaId - Guia ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const downloadAllInvoices = async (guiaId) => {
  try {
    const facturasResponse = await getGuiaInvoices(guiaId);
    
    if (!facturasResponse.success || !facturasResponse.data?.facturas) {
      return { success: false, message: facturasResponse.message || 'No se pudieron obtener las facturas' };
    }

    const { facturas } = facturasResponse.data;
    if (facturas.length === 0) {
      return { success: false, message: 'No hay facturas para descargar' };
    }

    let descargasExitosas = 0;
    for (const factura of facturas) {
      const success = await downloadInvoice(factura.id, factura.nombre);
      if (success) {
        descargasExitosas++;
      }
    }

    if (descargasExitosas === facturas.length) {
      return { success: true, message: `Se iniciaron las descargas de ${descargasExitosas} factura(s).` };
    } else {
      return { success: false, message: `Se pudo iniciar la descarga de solo ${descargasExitosas} de ${facturas.length} facturas.` };
    }
  } catch (error) {
    console.error('Error downloading all invoices:', error);
    return { success: false, message: error.message || 'Error descargando todas las facturas' };
  }
};

/**
 * Upload invoice for a specific guia
 * @param {number} guiaId - Guia ID
 * @param {File} file - Invoice file to upload
 * @returns {Promise<ApiResponse>}
 */
export const uploadGuiaInvoice = async (guiaId, file) => {
  try {
    // Convert file to base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const payload = {
      guiaId: guiaId,
      facturas: [{
        nombre: file.name,
        uri: `data:${file.type};base64,${base64Data}`,
        tipo: file.type,
        tamaño: file.size
      }]
    };

    const response = await axiosInstance.post('/Guias/uploadInvoice', payload);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Factura subida exitosamente'
    };
  } catch (error) {
    console.error('Error uploading invoice:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al subir factura',
      errors: error.response?.data?.errors || [error.message],
      data: null
    };
  }
};

// Export default object with all functions
export default {
  getGuias,
  getGuiaById,
  getLastShipment,
  calculateSingleGuiaPrice,
  calculateMultipleGuiasPrice,
  getGuiaInvoices,
  downloadInvoice,
  downloadAllInvoices,
  uploadGuiaInvoice
};