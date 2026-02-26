// src/services/es/spainGuiaService.js
// ✅ Crea la guía en el backend después del pago exitoso (wizard España)

import axiosInstance from '../axiosInstance';

const BASE = '/spain/guia';

// ── Crear guía post-pago ──────────────────────────────────────────────────────
/**
 * Llama a POST api/spain/guia/create después de confirmar el pago.
 *
 * @param {object} wizardData   Estado completo del wizard al finalizar
 * @param {string} [sendSeiUuid] UUID del shipment devuelto por SendSei (si ya se creó)
 * @param {string} [pickupDate]  Fecha de recogida agendada
 * @returns {{ success: boolean, nGuia: string, guiaId: number }}
 */
export const createSpainGuia = async (wizardData, sendSeiUuid = null, pickupDate = null) => {
  try {
    const pkg   = wizardData?.packages?.[0] ?? {};
    const quote = wizardData?.courierQuote  ?? null;

    // Peso siempre en kg para el backend
    const weightKg = pkg.unidadPeso?.toLowerCase() === 'lb'
      ? parseFloat((parseFloat(pkg.peso || 0) / 2.20462).toFixed(2))
      : parseFloat(pkg.peso || 0);

    const payload = {
      // Paquete
      packageDescription: pkg.descripcion   ?? null,
      weightKg,
      declaredValueUSD:   parseFloat(pkg.valorFOB || 0),

      // SendSei
      sendSeiShipmentUuid: sendSeiUuid                     ?? null,
      courierName:         quote?.courier                  ?? null,
      courierService:      quote?.service                  ?? null,
      courierTotal:        quote ? parseFloat(quote.total) : null,
      pickupDate:          pickupDate                      ?? null,
    };

    const res = await axiosInstance.post(`${BASE}/create`, payload);

    return {
      success: true,
      nGuia:   res.data.nGuia,
      guiaId:  res.data.guiaId,
      message: res.data.message,
    };

  } catch (err) {
    console.error('[spainGuiaService] createSpainGuia error:', err);
    return {
      success: false,
      nGuia:   null,
      guiaId:  null,
      error:   err?.response?.data?.message ?? err.message,
    };
  }
};

// ── Consultar guía por NGuia ──────────────────────────────────────────────────
/**
 * GET api/spain/guia/{nGuia}
 * Usado en la pantalla de confirmación para mostrar el estado.
 */
export const getSpainGuia = async (nGuia) => {
  try {
    const res = await axiosInstance.get(`${BASE}/${encodeURIComponent(nGuia)}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, data: null, error: err?.response?.data?.message ?? err.message };
  }
};