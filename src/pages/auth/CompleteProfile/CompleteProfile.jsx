// src/pages/auth/CompleteProfile/CompleteProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import './CompleteProfile.styles.scss';
import logoImage from '../../../assets/images/logo.jpg'; 


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

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const { t } = useTranslation();
  const [isCompleting, setIsCompleting] = useState(false);

  // Completar perfil con loading visible
  const handleCompleteProfile = async () => {
    // console.log('🔄 [CompleteProfile] Iniciando proceso...');
    setIsCompleting(true);
    
    try {
      // Simular llamada a API - puedes reemplazar esto con tu lógica real
      // console.log('⏳ [CompleteProfile] Procesando...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // console.log('✅ [CompleteProfile] Proceso completado, redirigiendo...');
      // Redirigir a personal-data
      navigate('/personal-data', { replace: true });
      
    } catch (error) {
      console.error('❌ [CompleteProfile] Error:', error);
      alert(t('auth.complete_error'));
    } finally {
      setIsCompleting(false);
    }
  };

  // Aplicar tema al contenedor principal
  React.useEffect(() => {
    const profileContainer = document.querySelector('.kraken-complete-profile');
    if (profileContainer) {
      profileContainer.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="kraken-complete-profile" data-theme={actualTheme}>
      {/* Toggle de tema */}
      {/* <ThemeToggle /> */}
      
      {/* Logo - Mismas medidas que otras pantallas */}
      <div className="kraken-complete-profile__logo">        
        <a 
          href="https://krakencourier.com/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src={logoImage} 
            alt="Kraken Logo" 
            className="kraken-complete-profile__logo-image"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
            }}
          />
        </a>
      </div>

      {/* Contenido principal */}
      <div className="kraken-complete-profile__content">
        <div className="kraken-complete-profile__verification-badge">
          <span className="kraken-complete-profile__check-icon">✓</span>
          <span className="kraken-complete-profile__verification-text">
            {t('auth.complete_verified')}
          </span>
        </div>

        <p className="kraken-complete-profile__description">
          {t('auth.complete_desc')}
        </p>

        <div className="kraken-complete-profile__card">
          <div className="kraken-complete-profile__card-content">
            <div className="kraken-complete-profile__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#FF4500" strokeWidth="1.5"/>
                <circle cx="12" cy="9" r="3" stroke="#FF4500" strokeWidth="1.5"/>
                <path d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20" stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="kraken-complete-profile__card-text">
              <h3>{t('auth.complete_card_title')}</h3>
            </div>
          </div>
        </div>

        <button
          className="kraken-complete-profile__complete-button"
          onClick={handleCompleteProfile}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <div className="kraken-complete-profile__loading">
              <div className="kraken-complete-profile__spinner"></div>
              <span>{t('auth.complete_processing')}</span>
            </div>
          ) : (
            <span>
              {t('auth.complete_button')}
              <span className="kraken-complete-profile__arrow">→</span>
            </span>
          )}
        </button>

        {isCompleting && (
          <p className="kraken-complete-profile__loading-message">
            {t('auth.complete_loading_msg')}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompleteProfile;