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
export const createSpainGuia = async (
    wizardData,
    sendSeiUuid = null,
    pickupCode = null,
    sendSeiShipmentData = null,
    pickupData = null,
    numeroPedidoRedsys = null
  ) => {
  // ↑ renombrado pickupDate → pickupCode
  try {
    const quote = wizardData?.courierQuote ?? null;

    // Desglose real de la tarifa Kraken (Flete Internacional, Gastos de Salida,
    // Seguro, etc.) tal como lo vio el cliente en el resumen — excluye la línea TOTAL
    // porque el backend la recalcula sola sumando estas líneas + el costo del courier.
    const tarifaDetalles = (wizardData?.calculationResult?.data?.detalles ?? [])
      .filter((d) => d.categoria !== 'TOTAL')
      .map((d) => ({ descripcion: d.descripcionItem, monto: d.monto }));

    // La web guarda los datos directamente en wizardData (no en packages[0])
    const peso      = wizardData?.packages?.[0]?.peso      ?? wizardData?.peso      ?? 0;
    const largo     = wizardData?.packages?.[0]?.largo     ?? wizardData?.largo     ?? 0;
    const ancho     = wizardData?.packages?.[0]?.ancho     ?? wizardData?.ancho     ?? 0;
    const alto      = wizardData?.packages?.[0]?.alto      ?? wizardData?.alto      ?? 0;
    const unidadPeso = wizardData?.packages?.[0]?.unidadPeso ?? wizardData?.unidadPeso ?? 'kg';
    const valorFOB  = wizardData?.packages?.[0]?.valorFOB  ?? wizardData?.valorFOB  ?? 0;
    const descripcion = wizardData?.packages?.[0]?.descripcion ?? wizardData?.contenido ?? null;
    const tipoPaquete = wizardData?.packages?.[0]?.tipoPaquete ?? wizardData?.tipoPaquete ?? null;
    

    // Convertir a kg si viene en lb
    const weightKg = String(unidadPeso).toLowerCase() === 'lb'
      ? parseFloat((parseFloat(peso) / 2.20462).toFixed(2))
      : parseFloat(peso || 0);

    const payload = {
      packageDescription:  descripcion,
      peso:                weightKg,   
      declaredValueUSD:    parseFloat(valorFOB || 0),
      largo:               parseFloat(largo  || 0),
      ancho:               parseFloat(ancho  || 0),
      alto:                parseFloat(alto   || 0),
      unidadPeso:          unidadPeso,
      tipoPaquete:         tipoPaquete,
      fragil:              wizardData?.fragil ?? false,

      sendSeiShipmentUuid: sendSeiUuid  ?? null,
      courierName:         quote?.courier      ?? null,
      courierService:      quote?.service      ?? null,
      courierTotal:        quote ? parseFloat(quote.total) : null,
      pickupCode:          pickupCode   ?? null,

      // ✅ Sin esto el backend nunca vincula el pago Redsys ni guarda la dirección de recogida
      numeroPedidoRedsys:  numeroPedidoRedsys ?? null,
      idDireccionOrigen:   wizardData?.selectedOriginAddress?.id ?? null,
      tarifaDetalles:      tarifaDetalles.length > 0 ? tarifaDetalles : null,

      // ✅ FIX: usar las variables ya extraídas, no "packages" que no existe
      contenido:     descripcion ?? '',
      contenidosIds: (wizardData?.packages?.[0]?.contenidos ?? []).map(c => c.id),

      sendSeiTrackingNumber: sendSeiShipmentData?.tracking_number ?? null,
      sendSeiPickupUuid:     pickupData?.pickups?.[0]?.pickup_uuid ?? null,
      labelUrl:              sendSeiShipmentData?.label_url ?? null,
      pickupFecha:           pickupData?.pickups?.[0]?.scheduled_date ?? null,
      pickupHoraDesde:       pickupData?.pickups?.[0]?.scheduled_time_from ?? null,
      pickupHoraHasta:       pickupData?.pickups?.[0]?.scheduled_time_to ?? null,
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

// ── Detalle completo de una guía ──────────────────────────────────────────────
/**
 * GET api/spain/guia/{guiaId}/detail
 * Usado en la pantalla de "Ver detalle" de una guía (mismo formato que USA).
 */
export const getSpainGuiaDetail = async (guiaId) => {
  try {
    const { data } = await axiosInstance.get(`${BASE}/${guiaId}/detail`);
    return data;
  } catch (err) {
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message ?? 'Error cargando el detalle de la guía',
    };
  }
};