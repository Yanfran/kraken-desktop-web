// src/components/auth/InfoBanner/InfoBanner.jsx
import React from 'react';
import './InfoBanner.scss';
import handIcon from '../../../assets/images/mano.png';

const InfoBanner = () => {
  const handleClick = () => {
    window.open('https://krakencourier.com/', '_blank');
  };

  return (
    <div 
      className="info-banner" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <p className="info-banner__text">
        Más información en nuestra web{' '}
        <span className="info-banner__link">aquí</span>
      </p>
      <img 
        src={handIcon} 
        alt="Click aquí" 
        className="info-banner__icon"
      />
    </div>
  );
};

export default InfoBanner;