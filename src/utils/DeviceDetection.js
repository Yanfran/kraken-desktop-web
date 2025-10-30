// src/utils/DeviceDetection.js - Detección de dispositivo MEJORADA para web

/**
 * Servicio de detección de dispositivo para navegadores web
 * ✅ Detecta dispositivo real (móvil/tablet/desktop)
 * ✅ Detecta tamaño de pantalla (pequeña/grande)
 * ✅ Permite redirección inteligente
 */
class DeviceDetectionService {
  constructor() {
    this.MOBILE_BREAKPOINT = 768;    // Ancho mínimo para considerar "desktop"
    this.TABLET_MIN = 768;            // Ancho mínimo para tablet
    this.TABLET_MAX = 1024;           // Ancho máximo para tablet
  }

  /**
   * Detecta si es un dispositivo móvil REAL (por User-Agent)
   */
  isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Detectar móviles reales
    const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    // NO considerar iPad como móvil (es tablet)
    const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    return mobileRegex.test(ua) && !isIPad;
  }

  /**
   * Detecta si es una tablet REAL (por User-Agent)
   */
  isTabletDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // iPad
    const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Android tablets (tienen "Android" pero NO "Mobile")
    const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
    
    return isIPad || isAndroidTablet;
  }

  /**
   * Detecta si la pantalla es pequeña (independiente del dispositivo)
   */
  isNarrowScreen() {
    return window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  /**
   * Detecta si es WebView (app híbrida)
   */
  isWebView() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (
      (ua.includes('wv') || !ua.includes('Safari')) && 
      /iPad|iPhone|iPod|Android/i.test(ua)
    );
  }

  /**
   * Obtiene el tipo de plataforma
   */
  getPlatform() {
    const isTablet = this.isTabletDevice();
    const isMobile = this.isMobileDevice();
    const isNarrow = this.isNarrowScreen();

    // Prioridad: dispositivo real > tamaño de pantalla
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    if (isNarrow) return 'mobile-web'; // Desktop con ventana pequeña
    return 'desktop';
  }

  /**
   * Obtiene información completa del dispositivo
   */
  getDeviceInfo() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = this.isMobileDevice();
    const isTablet = this.isTabletDevice();
    const isNarrow = this.isNarrowScreen();
    const platform = this.getPlatform();

    return {
      // Tipo de dispositivo
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      
      // Tamaño de pantalla
      isNarrowScreen: isNarrow,
      isWideScreen: !isNarrow,
      
      // Plataforma
      platform,
      
      // Dimensiones
      screenWidth: width,
      screenHeight: height,
      isLandscape: width > height,
      isPortrait: height > width,
      
      // Otros
      isWebView: this.isWebView(),
      userAgent: navigator.userAgent,
      
      // Touch support
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      
      // Breakpoints
      breakpoint: this.getBreakpoint(width),
    };
  }

  /**
   * Obtiene el breakpoint actual
   */
  getBreakpoint(width) {
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    return 'xl';
  }

  /**
   * Determina si debe usar layout de tablet
   */
  shouldUseTabletLayout() {
    const width = window.innerWidth;
    return this.isTabletDevice() || (width >= this.TABLET_MIN && width <= this.TABLET_MAX);
  }

  /**
   * Determina si debe usar layout móvil
   */
  shouldUseMobileLayout() {
    return this.isMobileDevice() || this.isNarrowScreen();
  }

  /**
   * Determina si debe usar layout desktop
   */
  shouldUseDesktopLayout() {
    return !this.isMobileDevice() && !this.isTabletDevice() && !this.isNarrowScreen();
  }
}

export default new DeviceDetectionService();