import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageToggle.styles.scss';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'es';

  const change = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="lang-toggle">
      <button
        className={`lang-toggle__btn ${current === 'es' ? 'active' : ''}`}
        onClick={() => change('es')}
        aria-label="Español"
      >
        ES
      </button>
      <button
        className={`lang-toggle__btn ${current === 'en' ? 'active' : ''}`}
        onClick={() => change('en')}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
