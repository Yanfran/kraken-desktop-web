// src/services/guiasService.js
import axiosInstance from './axiosInstance';

// ... (JSDoc comments remain the same)

export const getGuias = async () => {
  try {
    const response = await axiosInstance.get('/PostPreAlert/getGuias');
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Guías cargadas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching guias:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar guías',
      errors: error.response?.data?.errors || [error.message],
      data: []
    };
  }
};

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

export const getLastShipment = async () => {
  try {
    const response = await getGuias();
    if (response.success && response.data && response.data.length > 0) {
      const sortedGuias = response.data.sort((a, b) => new Date(b.fechaRaw || b.fecha) - new Date(a.fechaRaw || a.fecha));
      const lastGuia = sortedGuias[0];
      return {
        success: true,
        data: {
          id: lastGuia.idGuia,
          trackingNumber: lastGuia.nGuia || lastGuia.trackings?.[0] || 'N/A',
          status: lastGuia.estatus || 'Desconocido',
          date: lastGuia.fecha || '',
          origin: lastGuia.origen || 'USA',
          cost: lastGuia.costoEnvio ? `$${parseFloat(lastGuia.costoEnvio).toFixed(2)}` : '$0.00',
          prealerted: lastGuia.prealertado || false,
          discount: lastGuia.prealertado ? null : '-10%',
          trackingNumbers: lastGuia.trackings || []
        },
        message: 'Último envío cargado'
      };
    }
    return { success: false, message: 'No hay envíos disponibles', data: null };
  } catch (error) {
    console.error('Error fetching last shipment:', error);
    return { success: false, message: error.message || 'Error al cargar último envío', data: null };
  }
};

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
      responseType: 'blob', // Important for file downloads
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


// Export default object with all functions
export default {
  getGuias,
  getGuiaById,
  getLastShipment,
  calculateMultipleGuiasPrice,
  getGuiaInvoices,
  downloadInvoice,
  downloadAllInvoices,
};
