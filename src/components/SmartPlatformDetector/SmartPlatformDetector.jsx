// src/components/SmartPlatformDetector/SmartPlatformDetector.jsx
// Sistema de redirección automática entre web y mobile (INCLUSO EN LOCALHOST)

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DeviceDetection from '../../utils/DeviceDetection';
import TokenService from '../../utils/TokenService';
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

      console.log('📱 Device Info:', info);

      // =============================================
      // CONFIGURACIÓN DE PUERTOS (Cambiar según tu setup)
      // =============================================
      const WEB_PORT = '3000';      // Puerto de tu web (React)
      const MOBILE_PORT = '8081';   // Puerto de tu mobile (Expo)
      
      const currentPort = window.location.port || '80';
      const isWebPort = currentPort === WEB_PORT;
      const isMobilePort = currentPort === MOBILE_PORT;

      // =============================================
      // LÓGICA DE REDIRECCIÓN
      // =============================================

      // CASO 1: Estás en WEB pero deberías estar en MOBILE
      if (isWebPort && info.isMobile && !info.isTablet) {
        console.log('🔄 Detectado dispositivo móvil en puerto WEB → Redirigiendo a MOBILE');
        await redirectToMobile(info);
        return;
      }

      // CASO 2: Estás en WEB pero la pantalla es pequeña (simulando móvil)
      if (isWebPort && info.isNarrowScreen && !info.isTablet) {
        console.log('🔄 Detectado pantalla pequeña en puerto WEB → Redirigiendo a MOBILE');
        await redirectToMobile(info);
        return;
      }

      // CASO 3: Estás en MOBILE pero deberías estar en WEB
      if (isMobilePort && !info.isMobile && !info.isNarrowScreen) {
        console.log('🔄 Detectado pantalla grande en puerto MOBILE → Redirigiendo a WEB');
        await redirectToWeb(info);
        return;
      }

      // CASO 4: Estás en MOBILE pero expandiste la ventana (desktop)
      if (isMobilePort && info.platform === 'desktop') {
        console.log('🔄 Detectado desktop en puerto MOBILE → Redirigiendo a WEB');
        await redirectToWeb(info);
        return;
      }

      console.log('✅ Estás en el puerto correcto para tu dispositivo');
    };

    // =============================================
    // FUNCIONES DE REDIRECCIÓN
    // =============================================

    const redirectToMobile = async (info) => {
      setIsRedirecting(true);

      try {
        // 1. Obtener token actual
        const token = TokenService.getToken();
        const userData = TokenService.getUserData();
        const refreshToken = TokenService.getRefreshToken();

        console.log('📦 Preparando datos para mobile:', { 
          hasToken: !!token, 
          hasUserData: !!userData 
        });

        // 2. Construir URL de destino
        const currentPath = location.pathname + location.search + location.hash;
        const mobileUrl = `http://localhost:8081${currentPath}`;

        // 3. Agregar token a la URL (query string)
        const url = new URL(mobileUrl);
        if (token) {
          url.searchParams.set('token', token);
        }
        if (userData) {
          url.searchParams.set('userData', JSON.stringify(userData));
        }
        if (refreshToken) {
          url.searchParams.set('refreshToken', refreshToken);
        }

        console.log('🚀 Redirigiendo a mobile:', url.toString());

        // 4. Redirigir
        window.location.href = url.toString();
      } catch (error) {
        console.error('❌ Error en redirección a mobile:', error);
        setIsRedirecting(false);
      }
    };

    const redirectToWeb = async (info) => {
      setIsRedirecting(true);

      try {
        // 1. Obtener token actual
        const token = TokenService.getToken();
        const userData = TokenService.getUserData();
        const refreshToken = TokenService.getRefreshToken();

        console.log('📦 Preparando datos para web:', { 
          hasToken: !!token, 
          hasUserData: !!userData 
        });

        // 2. Construir URL de destino
        const currentPath = location.pathname + location.search + location.hash;
        const webUrl = `http://localhost:3000${currentPath}`;

        // 3. Agregar token a la URL
        const url = new URL(webUrl);
        if (token) {
          url.searchParams.set('token', token);
        }
        if (userData) {
          url.searchParams.set('userData', JSON.stringify(userData));
        }
        if (refreshToken) {
          url.searchParams.set('refreshToken', refreshToken);
        }

        console.log('🚀 Redirigiendo a web:', url.toString());

        // 4. Redirigir
        window.location.href = url.toString();
      } catch (error) {
        console.error('❌ Error en redirección a web:', error);
        setIsRedirecting(false);
      }
    };

    // =============================================
    // SINCRONIZAR TOKEN DESDE URL (al cargar)
    // =============================================
    const syncTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userDataStr = params.get('userData');
      const refreshToken = params.get('refreshToken');

      if (token) {
        console.log('✅ Token recibido desde URL, sincronizando...');
        
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        TokenService.saveToken(token, userData, refreshToken);

        // Limpiar URL (quitar parámetros sensibles)
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        
        console.log('✅ Token sincronizado y URL limpiada');
      }
    };

    // Primero sincronizar token si viene en URL
    syncTokenFromUrl();

    // Luego detectar y redirigir si es necesario
    detectAndRedirect();

    // =============================================
    // LISTENER PARA CAMBIOS DE TAMAÑO
    // =============================================
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        detectAndRedirect();
      }, 500); // Esperar 500ms después del último cambio
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [location.pathname, location.search, location.hash]);

  // =============================================
  // PANTALLA DE REDIRECCIÓN
  // =============================================
  if (isRedirecting) {
    return (
      <div className="smart-platform-detector">
        <div className="redirect-screen">
          <div className="redirect-spinner"></div>
          <h2>Redirigiendo...</h2>
          <p>Te estamos llevando a la versión correcta de la aplicación</p>
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

  // =============================================
  // APLICAR CLASE CSS SEGÚN DISPOSITIVO
  // =============================================
  useEffect(() => {
    if (deviceInfo) {
      const appContainer = document.querySelector('.app');
      if (appContainer) {
        // Remover clases previas
        appContainer.classList.remove(
          'app-container--mobile',
          'app-container--tablet',
          'app-container--desktop'
        );
        
        // Agregar clase según plataforma
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