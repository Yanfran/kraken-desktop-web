// src/hooks/useTokenSync.js
// 🔥 HOOK PARA SINCRONIZACIÓN AUTOMÁTICA DE TOKENS EN WEB

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import sharedTokenBridge from '../utils/SharedTokenBridge';

/**
 * Hook personalizado para sincronizar tokens automáticamente
 * Integra SharedTokenBridge con AuthContext
 * 
 * USO:
 * const { syncToken, clearTokens } = useTokenSync(authContext);
 */
export const useTokenSync = (authContext) => {
  const navigate = useNavigate();
  const hasSyncedOnMount = useRef(false);

  // =============================================
  // SINCRONIZAR TOKEN AL MONTAR EL COMPONENTE
  // =============================================
  useEffect(() => {
    const syncOnMount = async () => {
      if (hasSyncedOnMount.current) return;
      hasSyncedOnMount.current = true;

      try {
        // Verificar si hay token en URL
        const currentUrl = window.location.href;
        if (currentUrl.includes('?token=')) {
          console.log('🔄 [useTokenSync] Token en URL detectado, sincronizando...');
          
          const synced = await sharedTokenBridge.syncTokenFromUrl(currentUrl);
          
          if (synced) {
            // Obtener token y usuario sincronizados
            const token = await sharedTokenBridge.getToken();
            const userData = await sharedTokenBridge.getUserData();
            
            if (token && userData && authContext.setUserState) {
              console.log('✅ [useTokenSync] Actualizando AuthContext con token sincronizado');
              await authContext.setUserState(userData, token);
            }
            
            // Limpiar URL
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      } catch (error) {
        console.error('❌ [useTokenSync] Error en sincronización inicial:', error);
      }
    };

    syncOnMount();
  }, [authContext]);

  // =============================================
  // LISTENER PARA CAMBIOS DE TOKEN EN OTRAS PESTAÑAS
  // =============================================
  useEffect(() => {
    const cleanup = sharedTokenBridge.setupTokenListener(async (data) => {
      console.log('📡 [useTokenSync] Evento de token:', data.type);
      
      if (data.type === 'LOGOUT') {
        console.log('🚪 [useTokenSync] Logout detectado en otra pestaña');
        if (authContext.signOut) {
          await authContext.signOut();
        }
        navigate('/login', { replace: true });
      } 
      else if (data.type === 'TOKEN_UPDATED' && data.token) {
        console.log('🔄 [useTokenSync] Token actualizado en otra pestaña');
        
        // Verificar si el token es diferente al actual
        const currentToken = await sharedTokenBridge.getToken();
        if (currentToken !== data.token) {
          // Actualizar AuthContext
          if (authContext.setUserState && data.userData) {
            await authContext.setUserState(data.userData, data.token);
          }
        }
      }
    });

    return cleanup;
  }, [authContext, navigate]);

  // =============================================
  // FUNCIÓN: SINCRONIZAR TOKEN MANUALMENTE
  // =============================================
  const syncToken = useCallback(async (token, userData, refreshToken) => {
    try {
      console.log('🔄 [useTokenSync] Sincronizando token manualmente...');
      
      // Guardar en SharedTokenBridge
      await sharedTokenBridge.saveToken(token, userData, refreshToken);
      
      // Actualizar AuthContext
      if (authContext.setUserState) {
        await authContext.setUserState(userData, token);
      }
      
      console.log('✅ [useTokenSync] Token sincronizado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [useTokenSync] Error sincronizando token:', error);
      return false;
    }
  }, [authContext]);

  // =============================================
  // FUNCIÓN: LIMPIAR TOKENS (LOGOUT)
  // =============================================
  const clearTokens = useCallback(async () => {
    try {
      console.log('🧹 [useTokenSync] Limpiando tokens...');
      
      // Limpiar de SharedTokenBridge
      await sharedTokenBridge.clearToken();
      
      // Limpiar de AuthContext
      if (authContext.signOut) {
        await authContext.signOut();
      }
      
      console.log('✅ [useTokenSync] Tokens limpiados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ [useTokenSync] Error limpiando tokens:', error);
      return false;
    }
  }, [authContext]);

  // =============================================
  // FUNCIÓN: VALIDAR Y RENOVAR TOKEN SI ES NECESARIO
  // =============================================
  const validateAndRefreshToken = useCallback(async () => {
    try {
      const isValid = await sharedTokenBridge.isTokenValid();
      
      if (!isValid) {
        console.warn('⚠️ [useTokenSync] Token inválido o expirado');
        await clearTokens();
        navigate('/login', { replace: true });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ [useTokenSync] Error validando token:', error);
      return false;
    }
  }, [clearTokens, navigate]);

  // =============================================
  // VALIDAR TOKEN PERIÓDICAMENTE
  // =============================================
  useEffect(() => {
    // Validar token cada 5 minutos
    const interval = setInterval(() => {
      validateAndRefreshToken();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [validateAndRefreshToken]);

  return {
    syncToken,
    clearTokens,
    validateAndRefreshToken,
    sharedTokenBridge
  };
};

export default useTokenSync;