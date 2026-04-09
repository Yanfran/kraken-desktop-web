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