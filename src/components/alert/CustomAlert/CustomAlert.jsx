// src/components/alert/CustomAlert/CustomAlert.jsx
import React from 'react';
import './CustomAlert.styles.scss';

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
  if (!visible) return null;

  // Determine icon and color based on type
  const getIconAndColor = () => {
    if (icon && iconColor) {
      return { iconName: icon, color: iconColor };
    }

    switch (type) {
      case 'success':
        return { iconName: 'checkmark-circle', color: 'var(--success)' };
      case 'error':
        return { iconName: 'close-circle', color: 'var(--error)' };
      case 'warning':
        return { iconName: 'warning', color: 'var(--warning)' };
      case 'confirm':
        return { iconName: 'help-circle', color: 'var(--primary)' };
      case 'info':
      default:
        return { iconName: 'information-circle', color: 'var(--info)' };
    }
  };

  const { iconName, color } = getIconAndColor();

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

  const handleBackdropPress = () => {
    if (loading) return;
    if (!showCancel) {
      onClose?.();
    }
  };

  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-backdrop" onClick={handleBackdropPress}></div>
      
      <div className="custom-alert-container">
        {/* Header with icon and title */}
        <div className="custom-alert-header">
          {showIcon && (
            <div className="custom-alert-icon-container" style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}>
              <ion-icon name={iconName} style={{ color: color }}></ion-icon>
            </div>
          )}
          <span className="custom-alert-title">{title}</span>
        </div>

        {/* Message body */}
        <div className="custom-alert-body">
          <p className="custom-alert-message">{message}</p>
        </div>

        {/* Footer with buttons */}
        <div className="custom-alert-footer">
          {showCancel ? (
            <div className="custom-alert-button-row">
              <button
                className="custom-alert-button custom-alert-cancel-button"
                onClick={handleCancel}
                disabled={loading}
              >
                <span className="custom-alert-cancel-button-text">{cancelText}</span>
              </button>

              <button
                className={`custom-alert-button custom-alert-confirm-button ${loading ? 'disabled' : ''}`}
                style={{ backgroundColor: color }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <div className="custom-alert-spinner"></div> // Simple spinner
                ) : (
                  <span className="custom-alert-confirm-button-text">{confirmText}</span>
                )}
              </button>
            </div>
          ) : (
            <button
              className={`custom-alert-button custom-alert-single-button ${loading ? 'disabled' : ''}`}
              style={{ backgroundColor: color }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="custom-alert-spinner"></div> // Simple spinner
              ) : (
                <span className="custom-alert-confirm-button-text">{confirmText}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
