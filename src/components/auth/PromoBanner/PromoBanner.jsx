// src/components/auth/PromoBanner/PromoBanner.jsx
import React from 'react';
import './PromoBanner.scss';
import bannerImage from '../../../../src/assets/images/banner-BlackFriday-DESKTOP_003aaa.gif';

const PromoBanner = () => {
  return (
    <div className="promo-banner">
      <img 
        src={bannerImage} 
        alt="Banner promocional" 
        className="promo-banner__image"
      />
    </div>
  );
};

export default PromoBanner;