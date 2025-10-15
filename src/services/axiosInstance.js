// src/services/axiosInstance.js

import axios from 'axios';
import { API_URL } from '../utils/config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para agregar el ClientId automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // ✅ ASEGÚRATE DE TENER ESTO
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ Si el endpoint es /Addresses/user-addresses, agregar ClientId
    if (config.url === '/Addresses/user-addresses' && userId) {
      config.data = {
        ...config.data,
        ClientId: parseInt(userId)
      };
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;