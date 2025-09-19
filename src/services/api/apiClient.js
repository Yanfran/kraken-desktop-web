// src/services/api/apiClient.js
import axios from 'axios';
import { API_URL } from '@utils/config';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - compatible con tu sistema de auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar idioma si está disponible
    const language = localStorage.getItem('language') || 'es';
    config.headers['Accept-Language'] = language;
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - manejo de errores similar a tu móvil
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;