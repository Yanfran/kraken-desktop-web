import axiosInstance from './axiosInstance';

export const getSaldoNotaCredito = async () => {
  try {
    const response = await axiosInstance.get('/NotaCredito/saldo-ves');
    return { success: true, data: response.data.data };
  } catch (error) {
    return { success: false, data: null };
  }
};
