// src/pages/auth/Welcome/Welcome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import AnimatedPulpo from './AnimatedPulpo';
import './Welcome.styles.scss';

// Componente toggle para cambio de tema
const ThemeToggle = () => {
  const { actualTheme, toggleTheme } = useTheme();
  
  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${actualTheme === 'light' ? 'oscuro' : 'claro'}`}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 20,
        padding: '8px',
        borderRadius: '50%',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = actualTheme === 'light' 
          ? 'rgba(0, 0, 0, 0.1)' 
          : 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {actualTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

const Welcome = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const actualTheme = theme === 'auto' ? 'light' : theme;
  const [isNavigating, setIsNavigating] = useState(false);

  // Aplicar tema al contenedor
  useEffect(() => {
    const container = document.querySelector('.kraken-welcome');
    if (container) {
      container.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  // Prevenir retroceso del navegador
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleGoToDashboard = async () => {
    // console.log('🏠 [Welcome] Iniciando navegación al dashboard...');
    setIsNavigating(true);
    
    try {
      // console.log('👤 [Welcome] Usuario actual:', user);
      
      // Pequeña pausa para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navegar al dashboard
      // console.log('🚀 [Welcome] Navegando al dashboard...');
      navigate('/home', { replace: true });
      
    } catch (error) {
      console.error('❌ [Welcome] Error navegando al dashboard:', error);
      
      // Fallback: navegar directamente
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1000);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleHowItWorks = () => {
    // Navegar a cómo funciona
    window.open('/how-it-works', '_blank');
  };

  return (
    <div className="kraken-welcome" data-theme={actualTheme}>

      {/* Toggle de tema */}
      {/* <ThemeToggle /> */}

      <div className="kraken-welcome__content">
        
        {/* Pulpo animado */}
        <div className="kraken-welcome__pulpo-container">
          <AnimatedPulpo />
        </div>

        <h1 className="kraken-welcome__title">{t('auth.welcome_title')}</h1>

        <p className="kraken-welcome__message">{t('auth.welcome_locker_msg')}</p>

        <p className="kraken-welcome__message">{t('auth.welcome_email_msg')}</p>

        <button
          className="kraken-welcome__button"
          onClick={handleGoToDashboard}
          disabled={isNavigating}
        >
          {isNavigating ? (
            <div className="kraken-welcome__loading">
              <div className="kraken-welcome__spinner"></div>
              {t('auth.welcome_navigating')}
            </div>
          ) : (
            t('auth.welcome_go_dashboard')
          )}
        </button>

        <div className="kraken-welcome__help-link" onClick={handleHowItWorks}>
          <span className="kraken-welcome__help-icon">❓</span>
          <span className="kraken-welcome__help-text">
            {t('auth.welcome_help_text')}{' '}
            <span className="kraken-welcome__help-highlight">{t('auth.welcome_how_it_works')}</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default Welcome;