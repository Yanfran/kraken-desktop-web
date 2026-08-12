// src/components/SmartPlatformDetector/SmartPlatformDetector.jsx
// VERSIÓN CORREGIDA CON DETECCIÓN POR HOSTNAME Y PUERTO

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DeviceDetection from '../../utils/DeviceDetection';
import TokenService from '../../utils/TokenService';
import { APP_URLS } from '../../utils/config';
import './SmartPlatformDetector.styles.scss';

const SmartPlatformDetector = ({ children }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const detectAndRedirect = async () => {
      const info = DeviceDetection.getDeviceInfo();
      setDeviceInfo(info);

      // ═══════════════════════════════════════════════
      // 🔍 DETECCIÓN MEJORADA DE ENTORNO
      // ═══════════════════════════════════════════════
      const currentUrl = window.location.href;
      const currentHostname = window.location.hostname;
      const currentPort = window.location.port || '80';
      
      // console.log('═══════════════════════════════════════════════');
      // console.log('🔍 SMART PLATFORM DETECTOR - WEB');
      // console.log('═══════════════════════════════════════════════');
      // console.log('📱 Device Info:', {
      //   isMobile: info.isMobile,
      //   isTablet: info.isTablet,
      //   isNarrowScreen: info.isNarrowScreen,
      //   screenWidth: info.screenWidth,
      //   screenHeight: info.screenHeight
      // });
      // console.log('🌐 Current URL:', currentUrl);
      // console.log('🌐 Hostname:', currentHostname);
      // console.log('🔌 Port:', currentPort);
      // console.log('🎯 APP_URLS:', APP_URLS);
      
      // Determinar si estamos en producción o desarrollo
      const isProduction = currentHostname.includes('krakencourier.com');
      // console.log('🎯 Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
      
      // ═══════════════════════════════════════════════
      // DETERMINAR EN QUÉ APP ESTAMOS
      // ═══════════════════════════════════════════════
      let isOnWebApp = false;
      let isOnMobileApp = false;
      
      if (isProduction) {
        // En producción, detectar por hostname
        // Cualquier subdominio de krakencourier.com que no sea m. es la app web
        // (cubre app.krakencourier.com, app-backup.krakencourier.com, etc.)
        isOnMobileApp = currentHostname === 'm.krakencourier.com';
        isOnWebApp = !isOnMobileApp;
      } else {
        // En desarrollo, detectar por puerto
        isOnWebApp = currentPort === '3000';
        isOnMobileApp = currentPort === '8081';
      }
      
      // console.log('📍 Ubicación actual:', {
      //   isOnWebApp,
      //   isOnMobileApp
      // });

      // ═══════════════════════════════════════════════
      // MAPEO DE RUTAS
      // ═══════════════════════════════════════════════
      const routeMap = {
        webToMobile: {
          '/': '/home',
          '/home': '/home',
          '/login': '/login',
          '/register': '/register',
          '/forgot-password': '/forgot',
          '/calculator': '/',          
          '/profile/personal-data': '/profile?initialTab=Datos Personales',
          '/profile/addresses': '/profile?initialTab=Mis Direcciones',
          '/change-password': '/change-password',
          '/addresses': '/addresses',          
          '/tracking': '/tracking',
          '/guide/guides': '/guide/guides',
          '/pre-alert/create': '/pre-alert/pre-alert',
          '/pre-alert/list': '/pre-alert/list',
        },
        mobileToWeb: {
          '/home': '/home',          
          '/login': '/login',
          '/register': '/register',
          '/forgot': '/forgot-password',
          '/': '/calculator',          
          '/profile?initialTab=Datos Personales': '/profile/personal-data',
          '/profile?initialTab=Mis Direcciones': '/profile/addresses',
          '/change-password': '/change-password',
          '/addresses': '/addresses',          
          '/tracking': '/tracking',
          '/guide/guides': '/guide/guides',
          '/pre-alert/pre-alert': '/pre-alert/create',
          '/pre-alert/list': '/pre-alert/list',
        }
      };

      // ═══════════════════════════════════════════════
      // LÓGICA DE REDIRECCIÓN
      // ═══════════════════════════════════════════════

      // CASO 1: Web → Mobile (pantalla pequeña)
      if (isOnWebApp && (info.isMobile || info.isNarrowScreen) && !info.isTablet) {
        // console.log('🔄 REDIRECCIÓN NECESARIA: Web → Mobile');
        // console.log('   Razón: Pantalla pequeña detectada en app web');
        await redirectToMobile(routeMap.webToMobile);
        return;
      }

      // CASO 2: Mobile → Web (pantalla grande)
      if (isOnMobileApp && !info.isMobile && !info.isNarrowScreen) {
        // console.log('🔄 REDIRECCIÓN NECESARIA: Mobile → Web');
        // console.log('   Razón: Pantalla grande detectada en app mobile');
        await redirectToWeb(routeMap.mobileToWeb);
        return;
      }

      // console.log('✅ Estás en la app correcta para tu dispositivo');
      // console.log('═══════════════════════════════════════════════');
    };

    // ═══════════════════════════════════════════════
    // FUNCIÓN: REDIRIGIR A MOBILE
    // ═══════════════════════════════════════════════
    const redirectToMobile = async (routeMap) => {
      // console.log('🚀 Iniciando redirección a MOBILE...');
      setIsRedirecting(true);

      try {
        const token = TokenService.getToken();
        const userData = TokenService.getUserData();
        const refreshToken = TokenService.getRefreshToken();

        const currentPath = location.pathname;
        // console.log('📍 Ruta actual (Web):', currentPath);

        // Mapear ruta
        let mobilePath = routeMap[currentPath];
        
        if (!mobilePath) {
          if (currentPath.startsWith('/guide/detail/')) {
            const id = currentPath.split('/').pop();
            mobilePath = `/guide/detail/${id}`;
          }
          else if (currentPath.startsWith('/payment/')) {
            const id = currentPath.split('/').pop();
            mobilePath = `/payment/${id}`;
          }
          else if (currentPath.startsWith('/pre-alert/')) {
            const id = currentPath.split('/').pop();
            mobilePath = `/pre-alert/${id}`;
          }
          else {
            mobilePath = token ? '/home' : '/login';
            console.warn('⚠️ Ruta no mapeada, usando fallback:', mobilePath);
          }
        }

        // console.log('🎯 Ruta destino (Mobile):', mobilePath);

        // Construir URL
        const mobileUrl = `${APP_URLS.MOBILE}${mobilePath}`;
        const url = new URL(mobileUrl);

        // Agregar token
        if (token) {
          url.searchParams.set('token', token);
          if (userData) url.searchParams.set('userData', JSON.stringify(userData));
          if (refreshToken) url.searchParams.set('refreshToken', refreshToken);
        }

        // console.log('🚀 Redirigiendo a:', url.toString());
        
        // Pequeño delay para ver los logs
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.location.href = url.toString();
      } catch (error) {
        console.error('❌ Error en redirección a mobile:', error);
        setIsRedirecting(false);
      }
    };

    // ═══════════════════════════════════════════════
    // FUNCIÓN: REDIRIGIR A WEB
    // ═══════════════════════════════════════════════
    const redirectToWeb = async (routeMap) => {
      // console.log('🚀 Iniciando redirección a WEB...');
      setIsRedirecting(true);

      try {
        const token = TokenService.getToken();
        const userData = TokenService.getUserData();
        const refreshToken = TokenService.getRefreshToken();

        const currentPath = location.pathname;
        // console.log('📍 Ruta actual (Mobile):', currentPath);

        // Mapear ruta
        let webPath = routeMap[currentPath];

        if (!webPath) {
          if (currentPath.includes('/guide/detail/')) {
            const id = currentPath.split('/').pop();
            webPath = `/guide/detail/${id}`;
          }
          else if (currentPath.includes('/payment/')) {
            const id = currentPath.split('/').pop();
            webPath = `/payment/${id}`;
          }
          else if (currentPath.includes('/pre-alert/')) {
            const segments = currentPath.split('/');
            const id = segments[segments.length - 1];
            if (currentPath.includes('/edit/')) {
              webPath = `/pre-alert/edit/${id}`;
            } else {
              webPath = `/pre-alert/${id}`;
            }
          }
          else {
            webPath = token ? '/home' : '/login';
            console.warn('⚠️ Ruta no mapeada, usando fallback:', webPath);
          }
        }

        // console.log('🎯 Ruta destino (Web):', webPath);

        // Construir URL
        const webUrl = `${APP_URLS.WEB}${webPath}`;
        const url = new URL(webUrl);

        // Agregar token
        if (token) {
          url.searchParams.set('token', token);
          if (userData) url.searchParams.set('userData', JSON.stringify(userData));
          if (refreshToken) url.searchParams.set('refreshToken', refreshToken);
        }

        // console.log('🚀 Redirigiendo a:', url.toString());
        
        // Pequeño delay para ver los logs
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.location.href = url.toString();
      } catch (error) {
        console.error('❌ Error en redirección a web:', error);
        setIsRedirecting(false);
      }
    };

    // ═══════════════════════════════════════════════
    // SINCRONIZAR TOKEN DESDE URL
    // ═══════════════════════════════════════════════
    const syncTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userDataStr = params.get('userData');
      const refreshToken = params.get('refreshToken');

      if (token) {
        // console.log('✅ Token recibido desde URL, sincronizando...');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        TokenService.saveToken(token, userData, refreshToken);

        // Limpiar URL
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        // console.log('✅ Token sincronizado, URL limpiada');
      }
    };

    // Ejecutar
    syncTokenFromUrl();
    detectAndRedirect();

    // ═══════════════════════════════════════════════
    // LISTENER PARA RESIZE
    // ═══════════════════════════════════════════════
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // console.log('🔄 Resize detectado, re-evaluando...');
        detectAndRedirect();
      }, 500);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [location.pathname, location.search, location.hash, navigate]);

  // ═══════════════════════════════════════════════
  // PANTALLA DE REDIRECCIÓN
  // ═══════════════════════════════════════════════
  if (isRedirecting) {
    return (
      <div className="smart-platform-detector">
        <div className="redirect-screen">
          <div className="redirect-spinner"></div>
          <h2>Redirigiendo...</h2>
          <p>Te estamos llevando a la versión correcta</p>
          {deviceInfo && (
            <div className="device-info">
              <p>Dispositivo: {deviceInfo.isMobile ? '📱 Móvil' : '💻 Desktop'}</p>
              <p>Pantalla: {deviceInfo.screenWidth}x{deviceInfo.screenHeight}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // APLICAR CLASE CSS SEGÚN DISPOSITIVO
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (deviceInfo) {
      const appContainer = document.querySelector('.app');
      if (appContainer) {
        appContainer.classList.remove(
          'app-container--mobile',
          'app-container--tablet',
          'app-container--desktop'
        );
        
        if (deviceInfo.isTablet) {
          appContainer.classList.add('app-container--tablet');
        } else if (deviceInfo.isMobile) {
          appContainer.classList.add('app-container--mobile');
        } else {
          appContainer.classList.add('app-container--desktop');
        }
      }
    }
  }, [deviceInfo]);

  return <>{children}</>;
};

export default SmartPlatformDetector;