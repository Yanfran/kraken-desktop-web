// src/components/MobileBlock/MobileBlock.jsx
import React, { useEffect } from 'react';
import './MobileBlock.styles.scss';

const MobileBlock = () => {
  useEffect(() => {
    // ✅ Redirigir inmediatamente (sin delay)
    window.location.href = 'https://m.krakencourier.com/login';
  }, []);

  return (
    <div className="mobile-block">
      <div className="mobile-block__content">
        <div className="mobile-block__logo">
          <img 
            src="/images/kraken-logo-oscuro.png" 
            alt="Kraken Courier" 
            className="mobile-block__logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        <div className="mobile-block__icon">
          📱
        </div>
        
        <h1 className="mobile-block__title">
          Redirigiendo a versión móvil...
        </h1>
        
        {/* Spinner de carga */}
        <div className="mobile-block__spinner"></div>
        
        <p className="mobile-block__message">
          Por favor espera un momento
        </p>
      </div>
    </div>
  );
};

export default MobileBlock;