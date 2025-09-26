// src/services/auth/googleService.js - Google OAuth adaptado para web
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const googleService = {
  // ===== CARGAR GOOGLE SCRIPT =====
  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      // Crear script tag
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ [Google] Script cargado exitosamente');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ [Google] Error cargando script');
        reject(new Error('Error cargando Google Script'));
      };
      
      document.head.appendChild(script);
    });
  },

  // ===== INICIALIZAR GOOGLE AUTH =====
  async initialize() {
    try {
      await this.loadGoogleScript();
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID no configurado');
      }

      // Inicializar Google Identity Services
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      console.log('✅ [Google] Auth inicializado');
      return true;
    } catch (error) {
      console.error('❌ [Google] Error en inicialización:', error);
      return false;
    }
  },

  // ===== MANEJAR RESPUESTA DE CREDENCIAL =====
  handleCredentialResponse(response) {
    // Esta función será sobrescrita por el componente que use el servicio
    console.log('Google credential response:', response);
  },

  // ===== SIGN IN CON POPUP =====
  async signIn() {
    try {
      await this.initialize();

      return new Promise((resolve, reject) => {
        // Configurar callback temporal
        const originalCallback = this.handleCredentialResponse;
        this.handleCredentialResponse = (response) => {
          // Restaurar callback original
          this.handleCredentialResponse = originalCallback;
          
          if (response.credential) {
            resolve({
              success: true,
              token: response.credential
            });
          } else {
            reject(new Error('No se recibió credencial de Google'));
          }
        };

        // Mostrar popup de Google
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Si el popup no se muestra, intentar con método alternativo
            this.signInWithPopup().then(resolve).catch(reject);
          }
        });
      });
    } catch (error) {
      console.error('❌ [Google] Error en sign in:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // ===== MÉTODO ALTERNATIVO CON POPUP =====
  async signInWithPopup() {
    try {
      // Usar método de popup alternativo si el prompt no funciona
      return new Promise((resolve, reject) => {
        const popup = window.open(
          `https://accounts.google.com/oauth/authorize?` +
          `client_id=${GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${window.location.origin}/auth/google/callback&` +
          `response_type=code&` +
          `scope=email profile&` +
          `access_type=offline`,
          'google-signin',
          'width=500,height=600'
        );

        // Listener para el mensaje del popup
        const handleMessage = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            resolve({
              success: true,
              token: event.data.token
            });
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', handleMessage);

        // Verificar si el popup fue cerrado manualmente
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Popup cerrado por el usuario'));
          }
        }, 1000);
      });
    } catch (error) {
      console.error('❌ [Google] Error en popup:', error);
      throw error;
    }
  },

  // ===== SIGN OUT =====
  async signOut() {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      console.log('✅ [Google] Sign out exitoso');
    } catch (error) {
      console.error('❌ [Google] Error en sign out:', error);
    }
  },

  // ===== RENDERIZAR BOTÓN DE GOOGLE =====
  renderButton(element, options = {}) {
    try {
      if (!window.google || !window.google.accounts) {
        console.warn('⚠️ [Google] Google script no está cargado');
        return;
      }

      const defaultOptions = {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      };

      window.google.accounts.id.renderButton(element, {
        ...defaultOptions,
        ...options
      });
      
      console.log('✅ [Google] Botón renderizado');
    } catch (error) {
      console.error('❌ [Google] Error renderizando botón:', error);
    }
  },

  // ===== VERIFICAR SI ESTÁ DISPONIBLE =====
  isAvailable() {
    return !!(window.google && window.google.accounts && GOOGLE_CLIENT_ID);
  }
};