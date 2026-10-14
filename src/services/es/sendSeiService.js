// src/services/es/sendSeiService.js
// ✅ Servicio front-end para consumir los endpoints proxy de SendSei
//    en el wizard de envíos de España (KE)
//
// NUNCA llames a SendSei directamente desde el front — el API Token
// debe mantenerse en el back. Este servicio habla SÓLO con tu propia API.

import axiosInstance from '../axiosInstance';

const BASE = '/spain/sensei';

// ── 1. QUOTES ────────────────────────────────────────────────────────────────
/**
 * Obtiene las tarifas de mensajería disponibles.
 *
 * @param {string} postalCodeFrom  CP del cliente (origen)
 * @param {string} postalCodeTo    CP del almacén Kraken (destino)
 * @param {number|string} weightKg Peso del paquete en kg (ej: 2.5)
 * @returns {{ success: boolean, data: Array }}
 */
export const fetchSendSeiQuotes = async (postalCodeFrom, postalCodeTo, weightKg, pkg = {}) => {
  try {
    const res = await axiosInstance.post(`${BASE}/quotes`, {
      postalCodeFrom,
      postalCodeTo,
      weight:   String(Number(weightKg).toFixed(2)),
      // ✅ Dimensiones del paquete
      lengthCm: String(parseFloat(pkg.largo  || 30)),
      widthCm:  String(parseFloat(pkg.ancho  || 20)),
      heightCm: String(parseFloat(pkg.alto   || 15)),
    });
    return { success: true, data: res.data?.results ?? res.data };
  } catch (err) {
    console.error('[sendSeiService] quotes error:', err);
    return { success: false, data: [], error: err?.response?.data ?? err.message };
  }
};

// ── 2. SHIPMENTS ─────────────────────────────────────────────────────────────
/**
 * Crea el envío con el courier elegido y obtiene la etiqueta PDF.
 *
 * @param {object} payload
 * @param {object} payload.origin          Datos del remitente (cliente)
 * @param {object} payload.destination     Datos del destinatario (almacén Kraken)
 * @param {number} payload.courierId       ID del courier (ej: 3 = Zeleris)
 * @param {number} payload.courierServiceId ID del servicio (ej: 4)
 * @param {Array}  payload.packages        Lista de paquetes
 * @param {string} [payload.insuredAmount] Importe asegurado (opcional)
 * @param {string} [payload.originPickupPointCode] Drop-off: pudo_id del punto SEUR
 * @returns {{ success: boolean, data: object }}
 */
export const createSendSeiShipment = async (payload) => {
  try {
    const res = await axiosInstance.post(`${BASE}/shipments`, {
      courierId:        payload.courierId,
      courierServiceId: payload.courierServiceId,
      insuredAmount:    payload.insuredAmount ?? null,
      origin:           mapAddress(payload.origin),
      destination:      mapAddress(payload.destination),
      packages:         (payload.packages ?? []).map(mapPackage),
      originPickupPointCode: payload.originPickupPointCode ?? null,
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error('[sendSeiService] shipments error:', err);
    return { success: false, data: null, error: err?.response?.data ?? err.message };
  }
};

// ── 3. PICKUPS ───────────────────────────────────────────────────────────────
/**
 * Agenda la recogida de uno o varios envíos.
 *
 * @param {string}   scheduledDate      Fecha de recogida (YYYY-MM-DD)
 * @param {string}   scheduledTimeFrom  Inicio de la franja (HH:mm)
 * @param {string}   scheduledTimeTo    Fin de la franja (HH:mm)
 * @param {string[]} shipmentUuids      UUIDs obtenidos al crear los envíos
 * @param {string}   [notes]            Notas adicionales para el mensajero
 * @returns {{ success: boolean, data: object }}
 */
export const createSendSeiPickup = async (
  scheduledDate,
  scheduledTimeFrom,
  scheduledTimeTo,
  shipmentUuids,
  notes = ''
) => {
  try {
    const res = await axiosInstance.post(`${BASE}/pickups`, {
      scheduledDate,
      scheduledTimeFrom,
      scheduledTimeTo,
      shipmentUuids,
      notes: notes || undefined,
    });
    // La respuesta del backend envuelve en { success, data }
    // pero también puede devolver directamente el objeto de SendSei
    const responseData = res.data?.data ?? res.data;
    return {
      success: true,
      data: responseData,
    };
  } catch (err) {
    console.error('[sendSeiService] pickups error:', err);
    return { success: false, data: null, error: err?.response?.data ?? err.message };
  }
};

// ── 3b. REAGENDAR RECOGIDA ───────────────────────────────────────────────────
/**
 * Reagenda una recogida que quedó pendiente después del pago
 * (equivalente a rescheduleUpsPickup de USA).
 *
 * @returns {{ success: boolean, pickupCode?: string, message?: string }}
 */
export const rescheduleSendSeiPickup = async (nGuia, scheduledDate, scheduledTimeFrom, scheduledTimeTo) => {
  try {
    const res = await axiosInstance.post(
      `${BASE}/pickup/reschedule/${encodeURIComponent(nGuia)}`,
      { scheduledDate, scheduledTimeFrom, scheduledTimeTo }
    );
    return { success: res.data?.success !== false, ...res.data };
  } catch (err) {
    console.error('[sendSeiService] reschedule error:', err);
    return { success: false, message: err?.response?.data?.message ?? err.message };
  }
};

// ── 3b'. ETIQUETA ───────────────────────────────────────────────────────────
/**
 * Descarga la etiqueta PDF del envío (el backend la pide a SendSei con el token).
 */
export const openSpainLabel = async (nGuia) => {
  try {
    const res = await axiosInstance.get(`${BASE}/label/${encodeURIComponent(nGuia)}`, { responseType: 'blob' });
    // Se descarga como archivo (no se abre una pestaña en blanco mientras carga)
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta-${nGuia}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return { success: true };
  } catch (err) {
    console.error('[sendSeiService] label error:', err);
    return { success: false, message: 'La etiqueta todavía no está disponible. Inténtalo en unos minutos.' };
  }
};

// ── 3c. PUNTOS SEUR (DROP-OFF) ───────────────────────────────────────────────
/**
 * Puntos SEUR donde el cliente puede entregar el paquete (servicios drop-off).
 *
 * @returns {{ success: boolean, data: Array }}
 */
export const fetchSeurPoints = async (postalCode, city) => {
  try {
    const res = await axiosInstance.get(`${BASE}/seur-points`, { params: { postalCode, city } });
    if (res.data?.success === false) throw new Error(res.data?.error ?? 'Error SEUR');
    return { success: true, data: res.data?.results ?? [] };
  } catch (err) {
    console.error('[sendSeiService] seur points error:', err);
    return { success: false, data: [], error: err?.response?.data?.message ?? err.message };
  }
};

/**
 * Lee el resultado de POST /pickups. SendSei responde 201 aunque el courier
 * rechace la recogida: en ese caso viene success=false o status='failed'.
 */
export const getPickupResult = (pickupData) => {
  const p = pickupData?.pickups?.[0];
  const ok = !!p && p.success !== false && p.status !== 'failed' && !!p.pickup_code;
  return { ok, pickup: p ?? null, message: p?.message ?? pickupData?.error ?? null };
};

/** Próximos N días hábiles (lun-vie) desde mañana, en fecha LOCAL (no UTC). */
export const getNextBusinessDays = (n = 5) => {
  const days = [];
  const d = new Date();
  while (days.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      const copy = new Date(d);
      const iso = `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, '0')}-${String(copy.getDate()).padStart(2, '0')}`;
      days.push({
        iso,
        short: copy.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
  }
  return days;
};

const DIAS_ES = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
  friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

/**
 * Horario SEUR "monday: 09:30-14:00, 17:00-20:00 | tuesday: …" →
 * [{ dia: 'Lunes', horas: '09:30–14:00 · 17:00–20:00' }, …]
 */
export const formatHorarioSeur = (hours) =>
  String(hours ?? '')
    .split('|')
    .map((tramo) => {
      const [dia, ...resto] = tramo.split(':');
      const horas = resto.join(':').trim();
      if (!dia?.trim() || !horas) return null;
      return {
        dia:   DIAS_ES[dia.trim().toLowerCase()] ?? dia.trim(),
        horas: horas.split(',').map((h) => h.trim().replace('-', '–')).join(' · '),
      };
    })
    .filter(Boolean);

/** Franja de recogida (formato SendSei HH:mm). */
export const PICKUP_SLOT = { from: '09:00', to: '14:00', label: 'Mañana (09:00 – 14:00)' };

// ── 4. TRACKING ──────────────────────────────────────────────────────────────
/**
 * Consulta el estado de un envío por su número de seguimiento.
 *
 * @param {string} trackingNumber
 * @returns {{ success: boolean, data: object }}
 */
export const getSendSeiTracking = async (trackingNumber) => {
  try {
    const res = await axiosInstance.get(`${BASE}/tracking/${encodeURIComponent(trackingNumber)}`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('[sendSeiService] tracking error:', err);
    return { success: false, data: null, error: err?.response?.data ?? err.message };
  }
};

// ── Helpers de mapeo ──────────────────────────────────────────────────────────

function mapAddress(addr) {
  return {
    fullName:      addr.fullName      ?? addr.full_name   ?? '',
    company:       addr.company       ?? null,
    email:         addr.email         ?? '',
    phoneNumber:   addr.phoneNumber   ?? addr.phone       ?? '',
    address:       addr.address       ?? addr.line1       ?? '',
    addressNumber: addr.addressNumber ?? addr.number      ?? '',
    address2:      addr.address2      ?? addr.line2       ?? null,
    postalCode:    addr.postalCode    ?? addr.zip         ?? '',
    city:          addr.city          ?? '',
  };
}

function mapPackage(pkg) {
  return {
    weightKg:           String(Number(pkg.weight ?? pkg.weightKg ?? pkg.peso ?? 0).toFixed(2)),
    lengthCm:           String(pkg.largo ?? pkg.lengthCm ?? pkg.length ?? 0),
    widthCm:            String(pkg.ancho ?? pkg.widthCm  ?? pkg.width  ?? 0),
    heightCm:           String(pkg.alto  ?? pkg.heightCm ?? pkg.height ?? 0),
    contentDescription: pkg.descripcion ?? pkg.contentDescription ?? '',
    declaredValue:      String(Number(pkg.valorFOB ?? pkg.declaredValue ?? 0).toFixed(2)),
    isFragile:          pkg.isFragile ?? false,
  };
}