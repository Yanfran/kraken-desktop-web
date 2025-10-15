// src/components/MobileBlock/MobileBlock.jsx
import React from 'react';
import './MobileBlock.styles.scss';

const MobileBlock = () => {
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
          Versión Móvil No Disponible
        </h1>
        
        <p className="mobile-block__message">
          Esta plataforma está optimizada únicamente para <strong>tablet y escritorio</strong>.
        </p>
        
        <p className="mobile-block__suggestion">
          Por favor, accede desde:
        </p>
        
        <ul className="mobile-block__list">
          <li>💻 Computadora de escritorio</li>
          <li>💻 Laptop</li>
          <li>📱 Tablet (iPad, Android Tablet)</li>
        </ul>
        
        <div className="mobile-block__footer">
          <p>¿Necesitas ayuda?</p>
          <a 
            href="mailto:soporte@krakencourier.com" 
            className="mobile-block__contact"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileBlock;