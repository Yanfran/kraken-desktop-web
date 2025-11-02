// src/components/SmartPlatformDetector/SmartPlatformDetector.jsx
// ACTUALIZADO: Usa URLs centralizadas desde config.js

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DeviceDetection from '../../utils/DeviceDetection';
import TokenService from '../../utils/TokenService';
import { APP_URLS, isDevelopment } from '../../utils/config'; // ✅ Importar URLs centralizadas
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

      // ═════════════════════════════════════
      // OBTENER PUERTOS DESDE CONFIG
      // ═════════════════════════════════════
      const getPortFromUrl = (url) => {
        try {
          const urlObj = new URL(url);
          return urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
        } catch {
          return '80';
        }
      };

      const webPort = getPortFromUrl(APP_URLS.WEB);
      const mobilePort = getPortFromUrl(APP_URLS.MOBILE);
      const currentPort = window.location.port || '80';
      
      const isWebPort = currentPort === webPort;
      const isMobilePort = currentPort === mobilePort;
      

      // ═════════════════════════════════════
      // MAPEO DE RUTAS WEB ↔ MOBILE
      // ═════════════════════════════════════
      const routeMap = {
        // Web → Mobile (React Router → Expo Router)
        webToMobile: {
          '/': '/home',
          '/home': '/home',
          '/login': '/login',
          '/register': '/register',
          '/forgot-password': '/forgot',
          '/calculator': '/',          
          '/profile/personal-data': '/profile?initialTab=Datos Personales',
          '/profile/addresses': '/profile?initialTab=Mis Direcciones',
          '/profile/change-password': '/profile/change-password',
          '/addresses': '/addresses',          
          '/tracking': '/tracking',
          '/guide/guides': '/guide/guides',
          '/pre-alert/create': '/pre-alert/pre-alert',
          '/pre-alert/list': '/pre-alert/list',
        },
        // Mobile → Web (Expo Router → React Router)
        mobileToWeb: {
          '/home': '/home',          
          '/login': '/login',
          '/register': '/register',
          '/forgot': '/forgot-password',
          '/': '/calculator',          
          '/profile?initialTab=Datos Personales': '/profile/personal-data',
          '/profile?initialTab=Mis Direcciones': '/profile/addresses',
          '/profile/change-password': '/profile/change-password',
          '/addresses': '/addresses',          
          '/tracking': '/tracking',
          '/guide/guides': '/guide/guides',
          '/pre-alert/pre-alert': '/pre-alert/create',
          '/pre-alert/list': '/pre-alert/list',
        }
      };

      // ═════════════════════════════════════
      // LÓGICA DE REDIRECCIÓN
      // ═════════════════════════════════════

      // CASO 1: Web → Mobile (pantalla pequeña)
      if (isWebPort && (info.isMobile || info.isNarrowScreen) && !info.isTablet) {
        console.log('🔄 Web → Mobile: Pantalla pequeña detectada');
        await redirectToMobile(info, routeMap.webToMobile);
        return;
      }

      // CASO 2: Mobile → Web (pantalla grande)
      if (isMobilePort && !info.isMobile && !info.isNarrowScreen) {
        console.log('🔄 Mobile → Web: Pantalla grande detectada');
        await redirectToWeb(info, routeMap.mobileToWeb);
        return;
      }

      console.log('✅ Estás en el puerto/dominio correcto');
    };

    // ═════════════════════════════════════
    // FUNCIÓN: REDIRIGIR A MOBILE
    // ═════════════════════════════════════
    const redirectToMobile = async (info, routeMap) => {
      setIsRedirecting(true);

      try {
        const token = TokenService.getToken();
        const userData = TokenService.getUserData();
        const refreshToken = TokenService.getRefreshToken();

        // Obtener ruta actual
        const currentPath = location.pathname;
        console.log('📍 Ruta actual (Web):', currentPath);

        // Mapear ruta de Web a Mobile
        let mobilePath = routeMap[currentPath];
        
        // Si no hay mapeo exacto, intentar con rutas dinámicas
        if (!mobilePath) {
          // Rutas con parámetros (ej: /guide/detail/123)
          if (currentPath.startsWith('/guide/detail/')) {
            const id = currentPath.split('/').pop();
            mobilePath = `/(protected)/guide/detail/${id}`;
          }
          else if (currentPath.startsWith('/payment/')) {
            const id = currentPath.split('/').pop();
            mobilePath = `/(protected)/payment/${id}`;
          }
          else if (currentPath.startsWith('/pre-alert/')) {
            const id = currentPath.split('/').pop();
            mobilePath = `/(protected)/pre-alert/${id}`;
          }
          // Si sigue sin encontrar, usar home como fallback
          else {
            mobilePath = token ? '/home' : '/(auth)/login';
            console.warn('⚠️ Ruta no mapeada, usando fallback:', mobilePath);
          }
        }

        console.log('🎯 Ruta destino (Mobile):', mobilePath);

        // ✅ Construir URL usando config
        const mobileUrl = `${APP_URLS.MOBILE}${mobilePath}`;
        const url = new URL(mobileUrl);

        // Agregar token si existe
        if (token) {
          url.searchParams.set('token', token);
          if (userData) url.searchParams.set('userData', JSON.stringify(userData));
          if (refreshToken) url.searchParams.set('refreshToken', refreshToken);
        }

        console.log('🚀 Redirigiendo a:', url.toString());
        window.location.href = url.toString();
      } catch (error) {
        console.error('❌ Error en redirección a mobile:', error);
        setIsRedirecting(false);
      }
    };

    // ═════════════════════════════════════
    // FUNCIÓN: REDIRIGIR A WEB
    // ═════════════════════════════════════
    const redirectToWeb = async (info, routeMap) => {
      setIsRedirecting(true);

      try {
        const token = TokenService.getToken();
        const userData = TokenService.getUserData();
        const refreshToken = TokenService.getRefreshToken();

        // Obtener ruta actual
        const currentPath = location.pathname;
        console.log('📍 Ruta actual (Mobile):', currentPath);

        // Mapear ruta de Mobile a Web
        let webPath = routeMap[currentPath];

        // Si no hay mapeo exacto, intentar con rutas dinámicas
        if (!webPath) {
          // Rutas con parámetros
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
          // Fallback
          else {
            webPath = token ? '/home' : '/login';
            console.warn('⚠️ Ruta no mapeada, usando fallback:', webPath);
          }
        }

        console.log('🎯 Ruta destino (Web):', webPath);

        // ✅ Construir URL usando config
        const webUrl = `${APP_URLS.WEB}${webPath}`;
        const url = new URL(webUrl);

        // Agregar token si existe
        if (token) {
          url.searchParams.set('token', token);
          if (userData) url.searchParams.set('userData', JSON.stringify(userData));
          if (refreshToken) url.searchParams.set('refreshToken', refreshToken);
        }

        console.log('🚀 Redirigiendo a:', url.toString());
        window.location.href = url.toString();
      } catch (error) {
        console.error('❌ Error en redirección a web:', error);
        setIsRedirecting(false);
      }
    };

    // ═════════════════════════════════════
    // SINCRONIZAR TOKEN DESDE URL
    // ═════════════════════════════════════
    const syncTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userDataStr = params.get('userData');
      const refreshToken = params.get('refreshToken');

      if (token) {
        console.log('✅ Token recibido desde URL, sincronizando...');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        TokenService.saveToken(token, userData, refreshToken);

        // Limpiar URL
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('✅ Token sincronizado, URL limpiada');
      }
    };

    // Ejecutar
    syncTokenFromUrl();
    detectAndRedirect();

    // ═════════════════════════════════════
    // LISTENER PARA RESIZE
    // ═════════════════════════════════════
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        detectAndRedirect();
      }, 500);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [location.pathname, location.search, location.hash, navigate]);

  // ═════════════════════════════════════
  // PANTALLA DE REDIRECCIÓN
  // ═════════════════════════════════════
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

  // ═════════════════════════════════════
  // APLICAR CLASE CSS SEGÚN DISPOSITIVO
  // ═════════════════════════════════════
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