// src/utils/TokenService.js - Versión para desarrollo local

/**
 * Maneja tokens compartidos entre dominios y plataformas
 * ✅ Funciona en localhost (desarrollo)
 * ✅ Funciona en producción (dominios reales)
 */
class TokenService {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.USER_KEY = 'kraken_user_data';
    this.REFRESH_KEY = 'kraken_refresh_token';
    
    // ✅ Detectar si estamos en localhost o producción
    this.isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    // ✅ Dominio para cookies (solo en producción)
    this.DOMAIN = this.isLocalhost ? null : '.krakencourier.com';
  }

  /**
   * Guarda el token en todos los storages disponibles
   */
  saveToken(token, userData = null, refreshToken = null) {
    try {
      // 1. LocalStorage (persistente)
      localStorage.setItem(this.TOKEN_KEY, token);
      if (userData) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      }
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_KEY, refreshToken);
      }

      // 2. SessionStorage (backup)
      sessionStorage.setItem(this.TOKEN_KEY, token);

      // 3. Cookie (solo en producción, no funciona en localhost con puertos diferentes)
      if (!this.isLocalhost) {
        this.setCookie(this.TOKEN_KEY, token, 7);
        if (refreshToken) {
          this.setCookie(this.REFRESH_KEY, refreshToken, 30);
        }
      }

      // 4. Si está en mobile app, notificar al bridge nativo
      if (this.isWebView()) {
        this.sendToNativeApp('saveToken', { token, userData, refreshToken });
      }

      // console.log('✅ Token guardado exitosamente en todos los storages');
      return true;
    } catch (error) {
      console.error('❌ Error saving token:', error);
      return false;
    }
  }

  /**
   * Obtiene el token desde cualquier storage disponible
   */
  getToken() {
    // Prioridad: LocalStorage > Cookie > SessionStorage
    const token = 
      localStorage.getItem(this.TOKEN_KEY) ||
      this.getCookie(this.TOKEN_KEY) ||
      sessionStorage.getItem(this.TOKEN_KEY) ||
      null;

      // console.log('🔍 Obteniendo token desde storages... yayayayyayay', token);

    if (token) {
      // console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No se encontró token en ningún storage');
    }

    return token;
  }

  /**
   * Obtiene el refresh token
   */
  getRefreshToken() {
    return (
      localStorage.getItem(this.REFRESH_KEY) ||
      this.getCookie(this.REFRESH_KEY) ||
      null
    );
  }

  /**
   * Obtiene datos del usuario
   */
  getUserData() {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Limpia todos los tokens (logout)
   */
  clearToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      
      if (!this.isLocalhost) {
        this.deleteCookie(this.TOKEN_KEY);
        this.deleteCookie(this.REFRESH_KEY);
      }

      if (this.isWebView()) {
        this.sendToNativeApp('clearToken', {});
      }

      // console.log('✅ Token eliminado de todos los storages');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  /**
   * Verifica si el token es válido (no expirado)
   */
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const isValid = Date.now() < exp;

      if (!isValid) {
        console.warn('⚠️ Token expirado');
      }

      return isValid;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * ⚠️ NOTA: En localhost NO funciona la sincronización entre puertos
   * Esta función solo funciona en producción con dominios reales
   */
  async syncTokenFromDomain(sourceUrl) {
    // ✅ En localhost, no intentar sincronizar (no funcionará)
    if (this.isLocalhost) {
      // console.warn('⚠️ [Localhost] Sincronización cross-domain no disponible en desarrollo');
      // console.log('💡 Solución: Usa el mismo puerto para web y mobile, o espera a producción');
      return false;
    }

    try {
      // console.log('🔄 Intentando sincronizar token desde:', sourceUrl);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${sourceUrl}/token-bridge.html`;
      document.body.appendChild(iframe);

      return new Promise((resolve) => {
        const handleMessage = (event) => {
          const expectedOrigin = new URL(sourceUrl).origin;
          if (event.origin !== expectedOrigin) {
            console.warn('⚠️ Mensaje de origen no confiable:', event.origin);
            return;
          }

          const { token, userData, refreshToken } = event.data;
          if (token) {
            // console.log('✅ Token sincronizado exitosamente');
            this.saveToken(token, userData, refreshToken);
            resolve(true);
          } else {
            console.warn('⚠️ No se recibió token en la sincronización');
            resolve(false);
          }

          window.removeEventListener('message', handleMessage);
          document.body.removeChild(iframe);
        };

        window.addEventListener('message', handleMessage);

        setTimeout(() => {
          console.warn('⏱️ Timeout en sincronización de token');
          window.removeEventListener('message', handleMessage);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve(false);
        }, 3000);
      });
    } catch (error) {
      console.error('❌ Token sync failed:', error);
      return false;
    }
  }

  // ========== Métodos auxiliares ==========

  setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const domain = this.DOMAIN ? `; domain=${this.DOMAIN}` : '';
    const secure = this.isLocalhost ? '' : '; Secure';
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domain}${secure}; SameSite=Lax`;
  }

  getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }

  deleteCookie(name) {
    this.setCookie(name, '', -1);
  }

  isWebView() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.includes('wv') || !ua.includes('Safari')) && /iPad|iPhone|iPod|Android/i.test(ua);
  }

  sendToNativeApp(action, data) {
    try {
      if (window.AndroidBridge && typeof window.AndroidBridge.handleMessage === 'function') {
        window.AndroidBridge.handleMessage(JSON.stringify({ action, data }));
      }
      if (window.webkit?.messageHandlers?.iOSBridge) {
        window.webkit.messageHandlers.iOSBridge.postMessage({ action, data });
      }
    } catch (error) {
      console.error('Error sending message to native app:', error);
    }
  }
}

export default new TokenService();