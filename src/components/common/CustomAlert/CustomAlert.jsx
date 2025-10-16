// src/components/common/CustomAlert/CustomAlert.jsx
import React from 'react';
import styles from './CustomAlert.module.scss';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
} from 'react-icons/io5';

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info',
  showIcon = true,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose,
  showCancel = false,
  loading = false,
  icon,
  iconColor,
}) => {
  // Determinar el icono y color según el tipo
  const getIconAndColor = () => {
    if (icon && iconColor) {
      return { IconComponent: icon, color: iconColor };
    }

    switch (type) {
      case 'success':
        return { IconComponent: IoCheckmarkCircleOutline, color: '#10B981' };
      case 'error':
        return { IconComponent: IoCloseCircleOutline, color: '#EF4444' };
      case 'warning':
        return { IconComponent: IoWarningOutline, color: '#F59E0B' };
      case 'confirm':
        return { IconComponent: IoHelpCircleOutline, color: '#007AFF' };
      case 'info':
      default:
        return { IconComponent: IoInformationCircleOutline, color: '#007AFF' };
    }
  };

  const { IconComponent, color } = getIconAndColor();

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.();
    if (!showCancel) {
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
    onClose?.();
  };

  const handleBackdropClick = (e) => {
    if (loading) return;
    if (e.target === e.currentTarget && !showCancel) {
      onClose?.();
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.alertContainer}>
        {/* Header con icono y título */}
        <div className={styles.alertHeader}>
          {showIcon && (
            <div 
              className={styles.iconContainer}
              style={{ backgroundColor: `${color}15` }}
            >
              <IconComponent size={32} color={color} />
            </div>
          )}
          <h2 className={styles.alertTitle}>{title}</h2>
        </div>

        {/* Cuerpo del mensaje */}
        <div className={styles.alertBody}>
          <p className={styles.alertMessage}>{message}</p>
        </div>

        {/* Footer con botones */}
        <div className={styles.alertFooter}>
          {showCancel ? (
            <div className={styles.buttonRow}>
              <button
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelText}
              </button>

              <button
                className={`${styles.button} ${styles.confirmButton}`}
                style={{ backgroundColor: color }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          ) : (
            <button
              className={`${styles.button} ${styles.singleButton}`}
              style={{ backgroundColor: color }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                confirmText
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;