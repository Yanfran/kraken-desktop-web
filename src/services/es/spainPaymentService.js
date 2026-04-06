// src/services/es/spainPaymentService.js
import axiosInstance from '../axiosInstance';

const BASE = '/spain/payment';

// Genera parámetros firmados para el TPV
export const iniciarPagoRedsys = async (importeEuros, referenciaPedido) => {
  try {
    const res = await axiosInstance.post(`${BASE}/iniciar`, {
      importeEuros: Number(importeEuros), // ✅ Forzamos a que sea Número
      referenciaPedido,
    });
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message ?? 'Error al iniciar el pago.',
    };
  }
};

// Pre-registra la sesión ANTES de redirigir a Redsys
export const preRegistrarSesion = async (numeroPedido, importeEuros) => {
  try {
    const res = await axiosInstance.post(`${BASE}/pre-registrar`, {
      numeroPedido,
      importeEuros: Number(importeEuros), // ✅ Forzamos a que sea Número
    });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: 'Error al pre-registrar sesión.' };
  }
};

// Vincula NGuia+GuiaId a la sesión después de crear la guía
export const vincularGuiaASesion = async (numeroPedido, nGuia, guiaId) => {
  try {
    const res = await axiosInstance.put(`${BASE}/vincular-guia`, {
      numeroPedido,
      nGuia,
      guiaId,
    });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: 'Error al vincular guía.' };
  }
};

// Polling — consulta si Redsys ya notificó el resultado
export const consultarEstadoPago = async (numeroPedido) => {
  try {
    const res = await axiosInstance.get(`${BASE}/estado/${numeroPedido}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: 'Error consultando estado del pago.' };
  }
};