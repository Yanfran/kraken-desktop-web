// src/components/alert/CustomAlert/CustomAlert.jsx
import React from 'react';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarning,
  IoHelpCircle,
  IoInformationCircle,
} from 'react-icons/io5';
import './CustomAlert.styles.scss';

const ICONS = {
  'checkmark-circle': IoCheckmarkCircle,
  'close-circle':     IoCloseCircle,
  'warning':          IoWarning,
  'help-circle':      IoHelpCircle,
  'information-circle': IoInformationCircle,
};

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
        return { iconName: 'checkmark-circle', color: '#4CAF50' };
      case 'error':
        return { iconName: 'close-circle', color: '#F44336' };
      case 'warning':
        return { iconName: 'warning', color: '#FF9800' };
      case 'confirm':
        return { iconName: 'help-circle', color: '#FF4500' };
      case 'info':
      default:
        return { iconName: 'information-circle', color: '#2196F3' };
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
          {showIcon && (() => {
            const IconComponent = ICONS[iconName];
            return (
              <div className="custom-alert-icon-container" style={{ backgroundColor: `${color}22` }}>
                {IconComponent && <IconComponent size={32} style={{ color }} />}
              </div>
            );
          })()}
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
