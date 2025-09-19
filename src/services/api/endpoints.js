// src/services/api/endpoints.js - Basado en tu backend C#
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  
  // Payment endpoints - basado en tu PaymentController
  PAYMENT: {
    PROCESS_MOBILE: '/payment/mobile',
    PROCESS_DEBIT: '/payment/debit',
    GET_DATA: (id) => `/payment/${id}/data`,
    GET_MULTIPLE_DATA: '/payment/multiple/data',
    MERCANTIL_AUTH: '/payment/mercantil/auth',
  },
  
  // Calculator endpoints
  CALCULATOR: {
    CALCULATE: '/calculator/calculate',
    GET_RATES: '/calculator/rates',
  },
  
  // Address endpoints - basado en tu AddressController
  ADDRESS: {
    COUNTRIES: '/address/countries',
    STATES: (countryId) => `/address/states/${countryId}`,
    MUNICIPALITIES: (stateId) => `/address/municipalities/${stateId}`,
    PARISHES: (municipalityId) => `/address/parishes/${municipalityId}`,
  },
  
  // Package endpoints - basado en tu PaqueteContenidosController
  PACKAGES: {
    LIST: '/packages',
    DETAIL: (id) => `/packages/${id}`,
    CONTENTS: '/packages/contents',
    UPDATE: (id) => `/packages/${id}`,
  },
  
  // Profile endpoints
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    ADDRESSES: '/profile/addresses',
  },
};