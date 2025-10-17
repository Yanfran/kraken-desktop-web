// src/components/MobileBlock/MobileBlock.jsx
import React, { useEffect, useState } from 'react';
import './MobileBlock.styles.scss';

const MobileBlock = () => {
  const [countdown, setCountdown] = useState(5);
  const [manualRedirect, setManualRedirect] = useState(false);

  useEffect(() => {
    // Redirigir automáticamente después de 5 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = 'https://m.krakencourier.com/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRedirect = () => {
    setManualRedirect(true);
    window.location.href = 'https://m.krakencourier.com/login';
  };

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
          Versión Móvil Detectada
        </h1>
        
        <p className="mobile-block__message">
          Esta plataforma está optimizada para <strong>tablet y escritorio</strong>.
        </p>

        <div className="mobile-block__redirect">
          <p className="mobile-block__redirect-text">
            Serás redirigido a nuestra versión móvil en <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
          </p>
          
          <button 
            className="mobile-block__button"
            onClick={handleManualRedirect}
            disabled={manualRedirect}
          >
            {manualRedirect ? 'Redirigiendo...' : 'Ir ahora a versión móvil'}
          </button>
        </div>
        
        <div className="mobile-block__alternative">
          <p className="mobile-block__suggestion">
            También puedes acceder desde:
          </p>
          
          <ul className="mobile-block__list">
            <li>💻 Computadora de escritorio</li>
            <li>💻 Laptop</li>
            <li>📱 Tablet (iPad, Android Tablet)</li>
          </ul>
        </div>
        
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