/**
 * @typedef {object} CustomAlertProps
 * @property {boolean} visible
 * @property {string} title
 * @property {string} message
 * @property {'info' | 'warning' | 'error' | 'success' | 'confirm'} [type='info']
 * @property {boolean} [showIcon=true]
 * @property {string} [confirmText='OK']
 * @property {string} [cancelText='Cancelar']
 * @property {() => void} [onConfirm]
 * @property {() => void} [onCancel]
 * @property {() => void} [onClose]
 * @property {boolean} [showCancel=false]
 * @property {boolean} [loading=false]
 * @property {string} [icon]
 * @property {string} [iconColor]
 */

/**
 * @typedef {object} AlertOptions
 * @property {string} title
 * @property {string} message
 * @property {CustomAlertProps['type']} [type]
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 * @property {boolean} [showCancel]
 * @property {boolean} [showIcon]
 * @property {CustomAlertProps['icon']} [icon]
 * @property {string} [iconColor]
 * @property {boolean} [loading]
 */

/**
 * @typedef {AlertOptions & { visible: boolean; onConfirm?: () => void; onCancel?: () => void; }}
 */
let AlertState;

import { useCallback, useState } from 'react';

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false,
    showIcon: true,
    loading: false,
  });

  // Función para mostrar alerta simple (solo OK)
  const showAlert = useCallback((options, onConfirm) => {
    setAlertState({
      ...options,
      visible: true,
      showCancel: false,
      onConfirm,
    });
  }, []);

  // Función para mostrar alerta de confirmación (OK/Cancelar)
  const showConfirm = useCallback((
    options,
    onConfirm,
    onCancel
  ) => {
    setAlertState({
      ...options,
      visible: true,
      showCancel: true,
      onConfirm,
      onCancel,
    });
  }, []);

  // Función para mostrar alerta de éxito
  const showSuccess = useCallback((title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'success',
      confirmText: 'Continuar',
    }, onConfirm);
  }, [showAlert]);

  // Función para mostrar alerta de error
  const showError = useCallback((title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'error',
      confirmText: 'Entendido',
    }, onConfirm);
  }, [showAlert]);

  // Función para mostrar alerta de advertencia
  const showWarning = useCallback((title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'warning',
      confirmText: 'OK',
    }, onConfirm);
  }, [showAlert]);

  // Función para mostrar alerta de información
  const showInfo = useCallback((title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
    }, onConfirm);
  }, [showAlert]);

  // Función para mostrar confirmación de eliminación
  const showDeleteConfirm = useCallback((
    itemName,
    onConfirm,
    onCancel
  ) => {
    showConfirm({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    }, onConfirm, onCancel);
  }, [showConfirm]);

  // Función para cerrar la alerta
  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  // Función para actualizar el estado de loading
  const setLoading = useCallback((loading) => {
    setAlertState(prev => ({ ...prev, loading }));
  }, []);

  // Handlers para los botones
  const handleConfirm = useCallback(() => {
    if (alertState.loading) return;
    alertState.onConfirm?.();
    if (!alertState.showCancel) {
      hideAlert();
    }
  }, [alertState.onConfirm, alertState.loading, alertState.showCancel, hideAlert]);

  const handleCancel = useCallback(() => {
    if (alertState.loading) return;
    alertState.onCancel?.();
    hideAlert();
  }, [alertState.onCancel, alertState.loading, hideAlert]);

  return {
    // Estados
    alertProps: {
      ...alertState,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      onClose: hideAlert,
    },
    
    // Métodos para mostrar diferentes tipos de alertas
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDeleteConfirm,
    
    // Métodos de control
    hideAlert,
    setLoading,
    
    // Estado actual
    isVisible: alertState.visible,
    isLoading: alertState.loading,
  };
};
