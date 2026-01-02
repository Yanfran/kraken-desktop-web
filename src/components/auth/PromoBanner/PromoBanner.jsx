// src/components/auth/PromoBanner/PromoBanner.jsx
import React from 'react';
import './PromoBanner.scss';

// 1. IMPORTAR IMÁGENES DE CONTENIDO (FOREGROUND)
import bannerImageDesktop from '../../../../src/assets/images/banner-navidad_desktop_def.png';
import bannerImageTablet from '../../../../src/assets/images/banner-navidad_tablet_def.png';

// 2. IMPORTAR IMÁGENES DE FONDO (BACKGROUNDS)
import bgDesktop from '../../../../src/assets/images/bg-banner-navidad_desktop_def.jpg';
import bgTablet from '../../../../src/assets/images/bg-banner-navidad_tablet_def.jpg';
import bambalinas from '../../../../src/assets/images/bambalinas.png';

const PromoBanner = () => {
  // Creamos un objeto de estilos con variables CSS dinámicas
  const backgroundStyles = {
    '--bg-desktop': `url(${bgDesktop})`,
    '--bg-tablet': `url(${bgTablet})`,
    '--bg-bambalinas': `url(${bambalinas})`
  };

  return (
    // 3. PASAR LAS VARIABLES AL STYLE
    <div className="promo-banner" style={backgroundStyles}>
      <picture className="promo-banner__picture">
        <source 
          media="(max-width: 1023px)" 
          srcSet={bannerImageTablet} 
        />
        <img 
          src={bannerImageDesktop} 
          alt="Banner promocional de Navidad" 
          className="promo-banner__image"
        />
      </picture>
    </div>
  );
};

export default PromoBanner;