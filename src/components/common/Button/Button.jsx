// src/components/common/Button/Button.jsx - Componente de botón reutilizable
import React from 'react';
import clsx from 'clsx';
import './Button.styles.scss';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={clsx(
        'button',
        `button--${variant}`,
        `button--${size}`,
        {
          'button--disabled': disabled,
          'button--loading': loading,
          'button--full-width': fullWidth,
          'button--icon-right': iconPosition === 'right',
        },
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <span className="button__spinner" />}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="button__icon button__icon--left">{icon}</span>
      )}
      
      <span className="button__text">{children}</span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="button__icon button__icon--right">{icon}</span>
      )}
    </button>
  );
};

export default Button;