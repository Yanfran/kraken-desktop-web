// src/components/SmartPlatformDetector/SmartPlatformDetector.jsx
// 🔥 VERSIÓN MEJORADA CON SINCRONIZACIÓN AUTOMÁTICA DE TOKENS

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DeviceDetection from '../../utils/DeviceDetection';
import sharedTokenBridge from '../../utils/SharedTokenBridge';
import './SmartPlatformDetector.styles.scss';

const SmartPlatformDetector = ({ children }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
  const navigate = useNavigate();
  const location = useLocation();
  const hasSynced = useRef(false);

  useEffect(() => {
    const initializeAndDetect = async () => {
      // =============================================
      // PASO 1: SINCRONIZAR TOKEN DESDE URL (SI EXISTE)
      // =============================================
      if (!hasSynced.current) {
        const currentUrl = window.location.href;
        const hasToken = currentUrl.includes('?token=');
        
        if (hasToken) {
          console.log('🔄 Token detectado en URL, sincronizando...');
          setSyncStatus('syncing');
          
          const synced = await sharedTokenBridge.syncTokenFromUrl(currentUrl);
          
          if (synced) {
            console.log('✅ Token sincronizado exitosamente');
            setSyncStatus('synced');
            
            // Limpiar URL sin recargar página
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
            
            // Marcar como sincronizado
            hasSynced.current = true;
            
            // Dar tiempo al AuthContext para actualizar
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.warn('⚠️ No se pudo sincronizar token desde URL');
            setSyncStatus('error');
          }
        } else {
          hasSynced.current = true;
        }
      }

      // =============================================
      // PASO 2: DETECTAR DISPOSITIVO Y REDIRIGIR SI ES NECESARIO
      // =============================================
      await detectAndRedirect();
    };

    const detectAndRedirect = async () => {
      const info = DeviceDetection.getDeviceInfo();
      setDeviceInfo(info);

      console.log('📱 Device Info:', info);

      // =============================================
      // CONFIGURACIÓN DE PUERTOS
      // =============================================
      const WEB_PORT = '3000';
      const MOBILE_PORT = '8081';
      
      const currentPort = window.location.port || '80';
      const isWebPort = currentPort === WEB_PORT;
      const isMobilePort = currentPort === MOBILE_PORT;

      // =============================================
      // MAPEO DE RUTAS WEB ↔ MOBILE
      // =============================================
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
          '/addresses': '/addresses',          
          '/tracking': '/tracking',
          '/guide/guides': '/guide/guides',
          '/pre-alert/create': '/pre-alert/pre-alert',
          '/pre-alert/list': '/pre-alert/list',
          // Agregar más rutas según necesites
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
          '/addresses': '/addresses',          
          '/tracking': '/tracking',
          '/guide/guides': '/guide/guides',
          '/pre-alert/pre-alert': '/pre-alert/create',
          '/pre-alert/list': '/pre-alert/list',
          // Agregar más rutas según necesites
        }
      };

      // =============================================
      // LÓGICA DE REDIRECCIÓN
      // =============================================
      
      // Si estamos en puerto Web pero dispositivo es móvil → Redirigir a Mobile
      if (isWebPort && info.isMobile && info.screenWidth < 768) {
        console.log('🔄 Web → Mobile: Pantalla pequeña detectada');
        await redirectToMobile(info, routeMap.webToMobile);
        return;
      }

      // Si estamos en puerto Mobile pero dispositivo es desktop → Redirigir a Web
      if (isMobilePort && (!info.isMobile || info.screenWidth >= 1024)) {
        console.log('🔄 Mobile → Web: Pantalla grande detectada');
        await redirectToWeb(info, routeMap.mobileToWeb);
        return;
      }

      console.log('✅ Estás en el puerto correcto');
      setSyncStatus('idle');
    };

    // =============================================
    // FUNCIÓN: REDIRIGIR A MOBILE
    // =============================================
    const redirectToMobile = async (info, routeMap) => {
      setIsRedirecting(true);
      setSyncStatus('syncing');

      try {
        const currentPath = location.pathname;
        console.log('📍 Ruta actual (Web):', currentPath);

        // Mapear ruta de Web a Mobile
        let mobilePath = routeMap[currentPath];
        
        if (!mobilePath) {
          // Rutas dinámicas
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
          else {
            // Verificar si hay token para decidir ruta fallback
            const hasToken = await sharedTokenBridge.getToken();
            mobilePath = hasToken ? '/(protected)/home' : '/(auth)/login';
            console.warn('⚠️ Ruta no mapeada, usando fallback:', mobilePath);
          }
        }

        console.log('🎯 Ruta destino (Mobile):', mobilePath);

        // 🔥 GENERAR URL CON TOKEN USANDO SharedTokenBridge
        const mobileBaseUrl = `http://localhost:${MOBILE_PORT}`;
        const fullUrl = await sharedTokenBridge.generateAuthUrl(mobileBaseUrl, mobilePath);

        console.log('🚀 Redirigiendo a Mobile:', fullUrl);
        window.location.href = fullUrl;
      } catch (error) {
        console.error('❌ Error en redirección a mobile:', error);
        setIsRedirecting(false);
        setSyncStatus('error');
      }
    };

    // =============================================
    // FUNCIÓN: REDIRIGIR A WEB
    // =============================================
    const redirectToWeb = async (info, routeMap) => {
      setIsRedirecting(true);
      setSyncStatus('syncing');

      try {
        const currentPath = location.pathname;
        console.log('📍 Ruta actual (Mobile):', currentPath);

        // Mapear ruta de Mobile a Web
        let webPath = routeMap[currentPath];

        if (!webPath) {
          // Rutas dinámicas
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
            // Verificar si hay token para decidir ruta fallback
            const hasToken = await sharedTokenBridge.getToken();
            webPath = hasToken ? '/home' : '/login';
            console.warn('⚠️ Ruta no mapeada, usando fallback:', webPath);
          }
        }

        console.log('🎯 Ruta destino (Web):', webPath);

        // 🔥 GENERAR URL CON TOKEN USANDO SharedTokenBridge
        const webBaseUrl = `http://localhost:${WEB_PORT}`;
        const fullUrl = await sharedTokenBridge.generateAuthUrl(webBaseUrl, webPath);

        console.log('🚀 Redirigiendo a Web:', fullUrl);
        window.location.href = fullUrl;
      } catch (error) {
        console.error('❌ Error en redirección a web:', error);
        setIsRedirecting(false);
        setSyncStatus('error');
      }
    };

    // =============================================
    // EJECUTAR INICIALIZACIÓN
    // =============================================
    initializeAndDetect();

    // =============================================
    // LISTENER PARA RESIZE
    // =============================================
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        detectAndRedirect();
      }, 500);
    };

    window.addEventListener('resize', handleResize);

    // =============================================
    // LISTENER PARA CAMBIOS DE TOKEN EN OTRAS PESTAÑAS
    // =============================================
    const cleanup = sharedTokenBridge.setupTokenListener((data) => {
      console.log('📡 Evento de token recibido:', data.type);
      if (data.type === 'LOGOUT') {
        navigate('/login', { replace: true });
      } else if (data.type === 'TOKEN_UPDATED') {
        console.log('✅ Token actualizado en otra pestaña');
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (cleanup) cleanup();
    };
  }, [location.pathname, location.search, location.hash, navigate]);

  // =============================================
  // PANTALLA DE REDIRECCIÓN
  // =============================================
  if (isRedirecting || syncStatus === 'syncing') {
    return (
      <div className="smart-platform-detector">
        <div className="redirect-screen">
          <div className="redirect-spinner"></div>
          <h2>
            {syncStatus === 'syncing' ? 'Sincronizando sesión...' : 'Redirigiendo...'}
          </h2>
          <p>
            {syncStatus === 'syncing' 
              ? 'Transferimos tu sesión de forma segura'
              : 'Te estamos llevando a la versión correcta'}
          </p>
          {deviceInfo && (
            <div className="device-info">
              <p>Dispositivo: {deviceInfo.isMobile ? '📱 Móvil' : '💻 Desktop'}</p>
              <p>Pantalla: {deviceInfo.screenWidth} x {deviceInfo.screenHeight}</p>
              <p>Navegador: {deviceInfo.browser}</p>
              <p>SO: {deviceInfo.os}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================
  // MOSTRAR ESTADO DE ERROR SI ES NECESARIO
  // =============================================
  if (syncStatus === 'error') {
    console.error('❌ Error en sincronización de token');
  }

  return children;
};

export default SmartPlatformDetector;