// src/services/auth/googleService.js
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
        // console.log('✅ [Google] Script cargado exitosamente');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ [Google] Error cargando script');
        reject(new Error('Error cargando Google Script'));
      };
      
      document.head.appendChild(script);
    });
  },

  // ===== SIGN IN CON POPUP =====
  async signIn() {
    try {
      await this.loadGoogleScript();

      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID no configurado');
      }

      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              // console.log('✅ [Google] Credencial recibida');
              resolve({
                success: true,
                token: response.credential, // Este es el JWT token
                credential: response.credential
              });
            } else {
              reject(new Error('No se recibió credencial'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Mostrar el popup de Google
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // console.log('⚠️ [Google] Popup no mostrado');
            reject(new Error('Google Sign-In cancelado o no disponible'));
          }
        });
      });
    } catch (error) {
      console.error('❌ [Google] Error en signIn:', error);
      throw error;
    }
  },

  // ===== DECODIFICAR JWT TOKEN =====
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ [Google] Error decodificando JWT:', error);
      return null;
    }
  }
};