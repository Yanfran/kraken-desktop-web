// src/pages/auth/Welcome/Welcome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext'; // ✅ CAMBIO: Importar desde contexts
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
  const { user } = useAuth(); // ✅ Ahora importado correctamente
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

        {/* Título */}
        <h1 className="kraken-welcome__title">¡Bienvenido!</h1>

        {/* Mensaje principal */}
        <p className="kraken-welcome__message">
          Ya tienes tu casillero gratuito.
        </p>

        {/* Mensaje secundario */}
        <p className="kraken-welcome__message">
          Revisa tu e-mail, allí encontrarás toda la información para que empieces a recibir tus envíos.
        </p>

        {/* Botón principal */}
        <button 
          className="kraken-welcome__button"
          onClick={handleGoToDashboard} 
          disabled={isNavigating}
        >
          {isNavigating ? (
            <div className="kraken-welcome__loading">
              <div className="kraken-welcome__spinner"></div>
              Accediendo...
            </div>
          ) : (
            'Ir a mi cuenta'
          )}
        </button>

        {/* Link de ayuda */}
        <div className="kraken-welcome__help-link" onClick={handleHowItWorks}>
          <span className="kraken-welcome__help-icon">❓</span>
          <span className="kraken-welcome__help-text">
            ¿Tienes dudas? Revisa{' '}
            <span className="kraken-welcome__help-highlight">cómo funciona</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default Welcome;