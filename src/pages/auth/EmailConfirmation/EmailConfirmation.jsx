// src/pages/auth/EmailConfirmation/EmailConfirmation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import './EmailConfirmation.styles.scss';

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

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const { colors, actualTheme } = useTheme();
  const [isResending, setIsResending] = useState(false);

  // Simular reenvío de email de confirmación
  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mostrar mensaje de éxito o manejar según tu lógica
      alert('Correo de confirmación reenviado');
    } catch (error) {
      alert('Error al reenviar el correo');
    } finally {
      setIsResending(false);
    }
  };

  // Aplicar tema al contenedor principal
  React.useEffect(() => {
    const confirmationContainer = document.querySelector('.kraken-email-confirmation');
    if (confirmationContainer) {
      confirmationContainer.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="kraken-email-confirmation" data-theme={actualTheme}>
      {/* Toggle de tema */}
      <ThemeToggle />
      
      {/* Logo - Mismas medidas que Login/Register */}
      <div className="kraken-email-confirmation__logo">
        <img
          src="/src/assets/images/logo.jpg"
          alt="Kraken Logo"
          className="kraken-email-confirmation__logo-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className="kraken-email-confirmation__content">
        {/* Título */}
        <h1 className="kraken-email-confirmation__title">
          Falta un solo paso para terminar tu registro
        </h1>

        {/* Descripción */}
        <p className="kraken-email-confirmation__description">
          Revisa tu bandeja de entrada o carpeta de spam y confirma tu e-mail.
        </p>

        {/* Pregunta de problemas */}
        <p className="kraken-email-confirmation__problems">
          ¿Problemas?
        </p>

        {/* Enlace de reenviar */}
        <a
          href="#"
          className="kraken-email-confirmation__resend-link"
          onClick={(e) => {
            e.preventDefault();
            handleResendEmail();
          }}
        >
          {isResending ? (
            <div className="kraken-email-confirmation__loading">
              <div className="kraken-email-confirmation__spinner"></div>
              Reenviando...
            </div>
          ) : (
            'Reenviar correo de confirmación'
          )}
        </a>

        {/* Link para volver al login */}
        <button
          className="kraken-email-confirmation__back-link"
          onClick={() => navigate('/login')}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;