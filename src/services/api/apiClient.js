// src/services/apiClient.js
import axios from 'axios';

// Base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7031/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth storage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log errors
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          console.warn('🔒 Unauthorized access - redirecting to login');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          console.warn('🚫 Forbidden access');
          break;

        case 404:
          // Not found
          console.warn('🔍 Resource not found');
          break;

        case 422:
          // Validation error
          console.warn('⚠️ Validation error:', data?.errors);
          break;

        case 500:
          // Server error
          console.error('🔥 Server error');
          break;

        default:
          console.error(`🔴 HTTP ${status} error`);
      }

      // Return structured error response
      return Promise.reject({
        status,
        message: data?.message || `HTTP ${status} Error`,
        errors: data?.errors || [],
        data: data,
      });
    } else if (error.request) {
      // Network error
      console.error('🌐 Network error - no response received');
      return Promise.reject({
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        errors: ['Network error'],
        data: null,
      });
    } else {
      // Other error
      console.error('⚡ Request setup error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'Error desconocido',
        errors: [error.message],
        data: null,
      });
    }
  }
);

// Helper methods for common operations
export const apiHelpers = {
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      delete apiClient.defaults.headers.Authorization;
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    delete apiClient.defaults.headers.Authorization;
  },

  // Get current token
  getAuthToken: () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!apiHelpers.getAuthToken();
  },
};

// Export default client
export default apiClient;