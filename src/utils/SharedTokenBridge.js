// SharedTokenBridge.js - Sistema unificado de sincronización de tokens
// ✅ Funciona en Web (localStorage) y Mobile (AsyncStorage)
// ✅ Sincronización bidireccional automática
// ✅ Compatible con localhost en desarrollo

/**
 * 🔥 SERVICIO CENTRAL DE TOKENS - FUNCIONA EN AMBAS PLATAFORMAS
 * 
 * Problema resuelto:
 * - Web usa localStorage
 * - Mobile usa AsyncStorage
 * - Necesitan compartir el mismo token al cambiar de dimensión
 * 
 * Solución:
 * 1. Detectar plataforma automáticamente
 * 2. Usar el storage correcto según plataforma
 * 3. Sincronizar via URL params + localStorage/AsyncStorage
 * 4. Mantener sesión activa en ambas plataformas
 */

class SharedTokenBridge {
  constructor() {
    this.TOKEN_KEY = 'kraken_auth_token';
    this.USER_KEY = 'kraken_user_data';
    this.REFRESH_KEY = 'kraken_refresh_token';
    this.LAST_SYNC_KEY = 'kraken_last_sync';
    
    // Detectar plataforma
    this.isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    this.isMobile = typeof global !== 'undefined' && global.process?.versions?.node === undefined;
    
    // Importar AsyncStorage solo si estamos en mobile
    if (!this.isWeb) {
      try {
        // En mobile: usar AsyncStorage
        this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (e) {
        console.warn('AsyncStorage no disponible, usando fallback');
      }
    }
  }

  /**
   * 🔐 GUARDAR TOKEN - Funciona en ambas plataformas
   */
  async saveToken(token, userData = null, refreshToken = null) {
    try {
      const timestamp = Date.now();
      
      if (this.isWeb) {
        // WEB: localStorage + sessionStorage
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.LAST_SYNC_KEY, timestamp.toString());
        sessionStorage.setItem(this.TOKEN_KEY, token);
        
        if (userData) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        }
        if (refreshToken) {
          localStorage.setItem(this.REFRESH_KEY, refreshToken);
        }
        
        console.log('✅ [Web] Token guardado en localStorage');
      } else {
        // MOBILE: AsyncStorage
        if (this.AsyncStorage) {
          await this.AsyncStorage.setItem(this.TOKEN_KEY, token);
          await this.AsyncStorage.setItem(this.LAST_SYNC_KEY, timestamp.toString());
          
          if (userData) {
            await this.AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userData));
          }
          if (refreshToken) {
            await this.AsyncStorage.setItem(this.REFRESH_KEY, refreshToken);
          }
          
          console.log('✅ [Mobile] Token guardado en AsyncStorage');
        }
      }
      
      // Notificar a otras ventanas/instancias (solo web)
      if (this.isWeb && window.BroadcastChannel) {
        try {
          const channel = new BroadcastChannel('kraken_auth');
          channel.postMessage({
            type: 'TOKEN_UPDATED',
            token,
            userData,
            refreshToken,
            timestamp
          });
          channel.close();
        } catch (e) {
          console.warn('BroadcastChannel no soportado');
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error guardando token:', error);
      return false;
    }
  }

  /**
   * 🔍 OBTENER TOKEN - Funciona en ambas plataformas
   */
  async getToken() {
    try {
      if (this.isWeb) {
        // WEB: localStorage primero, sessionStorage como fallback
        const token = localStorage.getItem(this.TOKEN_KEY) || 
                     sessionStorage.getItem(this.TOKEN_KEY);
        return token;
      } else {
        // MOBILE: AsyncStorage
        if (this.AsyncStorage) {
          const token = await this.AsyncStorage.getItem(this.TOKEN_KEY);
          return token;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * 📊 OBTENER DATOS DE USUARIO
   */
  async getUserData() {
    try {
      if (this.isWeb) {
        const data = localStorage.getItem(this.USER_KEY);
        return data ? JSON.parse(data) : null;
      } else {
        if (this.AsyncStorage) {
          const data = await this.AsyncStorage.getItem(this.USER_KEY);
          return data ? JSON.parse(data) : null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo datos de usuario:', error);
      return null;
    }
  }

  /**
   * 🔄 OBTENER REFRESH TOKEN
   */
  async getRefreshToken() {
    try {
      if (this.isWeb) {
        return localStorage.getItem(this.REFRESH_KEY);
      } else {
        if (this.AsyncStorage) {
          return await this.AsyncStorage.getItem(this.REFRESH_KEY);
        }
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * 🧹 LIMPIAR TOKENS (Logout)
   */
  async clearToken() {
    try {
      if (this.isWeb) {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.LAST_SYNC_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        
        // Notificar logout a otras ventanas
        if (window.BroadcastChannel) {
          try {
            const channel = new BroadcastChannel('kraken_auth');
            channel.postMessage({ type: 'LOGOUT' });
            channel.close();
          } catch (e) {
            console.warn('BroadcastChannel no soportado');
          }
        }
        
        console.log('✅ [Web] Token eliminado');
      } else {
        if (this.AsyncStorage) {
          await this.AsyncStorage.multiRemove([
            this.TOKEN_KEY,
            this.USER_KEY,
            this.REFRESH_KEY,
            this.LAST_SYNC_KEY
          ]);
          console.log('✅ [Mobile] Token eliminado');
        }
      }
      return true;
    } catch (error) {
      console.error('Error limpiando token:', error);
      return false;
    }
  }

  /**
   * ✅ VALIDAR TOKEN
   */
  async isTokenValid() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Decodificar JWT
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000;
      const isValid = Date.now() < exp;

      if (!isValid) {
        console.warn('⚠️ Token expirado');
        await this.clearToken();
      }

      return isValid;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  }

  /**
   * 🔗 SINCRONIZAR TOKEN DESDE URL (Función clave para el problema)
   * Se ejecuta cuando la app recibe una URL con token
   */
  async syncTokenFromUrl(url) {
    try {
      let params;
      
      if (this.isWeb) {
        // Web: usar URLSearchParams
        params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
      } else {
        // Mobile: parsear manualmente
        const queryString = url.includes('?') ? url.split('?')[1] : '';
        params = new URLSearchParams(queryString);
      }

      const token = params.get('token');
      const userDataStr = params.get('userData');
      const refreshToken = params.get('refreshToken');

      if (token) {
        console.log('🔄 Sincronizando token desde URL...');
        
        let userData = null;
        if (userDataStr) {
          try {
            userData = JSON.parse(decodeURIComponent(userDataStr));
          } catch (e) {
            console.error('Error parseando userData:', e);
          }
        }

        await this.saveToken(token, userData, refreshToken);
        console.log('✅ Token sincronizado exitosamente desde URL');
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error sincronizando token desde URL:', error);
      return false;
    }
  }

  /**
   * 🚀 GENERAR URL CON TOKEN (para redirecciones entre plataformas)
   */
  async generateAuthUrl(targetUrl, currentPath = '/') {
    try {
      const token = await this.getToken();
      const userData = await this.getUserData();
      const refreshToken = await this.getRefreshToken();

      if (!token) {
        console.warn('⚠️ No hay token para generar URL');
        return `${targetUrl}${currentPath}`;
      }

      const url = new URL(targetUrl + currentPath);
      url.searchParams.set('token', token);
      
      if (userData) {
        url.searchParams.set('userData', JSON.stringify(userData));
      }
      if (refreshToken) {
        url.searchParams.set('refreshToken', refreshToken);
      }

      return url.toString();
    } catch (error) {
      console.error('Error generando URL con auth:', error);
      return `${targetUrl}${currentPath}`;
    }
  }

  /**
   * 📡 LISTENER PARA CAMBIOS DE TOKEN (solo Web)
   * Permite sincronización en tiempo real entre pestañas
   */
  setupTokenListener(callback) {
    if (!this.isWeb) return;

    // Listener para BroadcastChannel
    if (window.BroadcastChannel) {
      try {
        const channel = new BroadcastChannel('kraken_auth');
        channel.onmessage = (event) => {
          console.log('📡 Mensaje recibido de otra pestaña:', event.data);
          callback(event.data);
        };
        return () => channel.close();
      } catch (e) {
        console.warn('BroadcastChannel no soportado');
      }
    }

    // Fallback: storage event
    const handleStorageChange = (e) => {
      if (e.key === this.TOKEN_KEY && e.newValue) {
        callback({
          type: 'TOKEN_UPDATED',
          token: e.newValue
        });
      } else if (e.key === this.TOKEN_KEY && !e.newValue) {
        callback({ type: 'LOGOUT' });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  /**
   * ⏰ OBTENER TIMESTAMP DE ÚLTIMA SINCRONIZACIÓN
   */
  async getLastSyncTime() {
    try {
      if (this.isWeb) {
        const time = localStorage.getItem(this.LAST_SYNC_KEY);
        return time ? parseInt(time) : 0;
      } else {
        if (this.AsyncStorage) {
          const time = await this.AsyncStorage.getItem(this.LAST_SYNC_KEY);
          return time ? parseInt(time) : 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error obteniendo última sincronización:', error);
      return 0;
    }
  }

  /**
   * 🔒 VERIFICAR SI EL TOKEN ESTÁ DESACTUALIZADO
   * Útil para detectar si otra plataforma actualizó el token
   */
  async isTokenOutdated(timestamp) {
    const lastSync = await this.getLastSyncTime();
    return timestamp > lastSync;
  }
}

// Exportar instancia única (singleton)
const sharedTokenBridge = new SharedTokenBridge();

// Export para ES6 y CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = sharedTokenBridge;
}

export default sharedTokenBridge;