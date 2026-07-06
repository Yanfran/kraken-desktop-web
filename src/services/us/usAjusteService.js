import axiosInstance from '../axiosInstance';

export const getAjustesPendientes = async () => {
  try {
    const { data } = await axiosInstance.get('/usa/ajuste/pendientes');
    console.log('[Ajuste] response:', data);
    return data;
  } catch (e) {
    console.error('[Ajuste] error:', e?.status, e?.message, e?.data);
    return { success: false, data: [] };
  }
};

export const chargeAjuste = async ({ ajusteId, token, firstName, lastName, email }) => {
  try {
    const { data } = await axiosInstance.post('/usa/ajuste/charge', {
      ajusteId,
      token,
      firstName,
      lastName,
      email,
    });
    return data;
  } catch (e) {
    return { success: false, message: e?.response?.data?.message ?? e.message ?? 'Error al procesar el pago.' };
  }
};
