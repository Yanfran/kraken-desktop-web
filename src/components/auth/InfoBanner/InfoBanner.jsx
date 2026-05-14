// src/components/auth/InfoBanner/InfoBanner.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './InfoBanner.scss';
import handIcon from '../../../assets/images/mano.png';

const InfoBanner = () => {
  const { t } = useTranslation();

  const handleClick = () => {
    window.open('https://krakencourier.com/traelo-facil', '_blank');
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
        {t('auth.info_banner_text')}{' '}
        <span className="info-banner__link">{t('auth.info_banner_link')}</span>
      </p>
      <img
        src={handIcon}
        alt={t('auth.info_banner_link')}
        className="info-banner__icon"
      />
    </div>
  );
};

export default InfoBanner;