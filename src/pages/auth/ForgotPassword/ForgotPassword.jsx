// src/pages/auth/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import './ForgotPassword.styles.scss'; // Importa el nuevo archivo de estilos
import logoImage from '../../../assets/images/logo.jpg'; 

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resendVerificationEmail, isLoading } = useAuth();
  const { colors, actualTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    const result = await resendVerificationEmail(email);

    if (result.success) {
      setSuccessMessage(result.message || 'Se ha enviado un enlace a tu correo electrónico.');
      setEmail('');
    } else {
      setError(result.message || 'Error al enviar el enlace. Inténtalo de nuevo.');
    }
  };

  React.useEffect(() => {
    const container = document.querySelector('.kraken-forgot-password');
    if (container) {
      container.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="kraken-forgot-password" data-theme={actualTheme}>
      <div className="kraken-forgot-password__logo">
        <img
          src={logoImage}
          alt="Kraken Logo"
          className="kraken-forgot-password__logo-image"
        />
      </div>

      <h1 className="kraken-forgot-password__title">Recuperar contraseña</h1>
      <p className="kraken-forgot-password__subtitle">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

      <form onSubmit={handleSubmit} className="kraken-forgot-password__form">
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Correo electrónico</label>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`kraken-input-field__input ${error ? 'kraken-input-field__input--error' : ''}`}
            disabled={isLoading}
            autoComplete="email"
          />
          {error && (
            <span className="kraken-input-field__error">{error}</span>
          )}
        </div>

        {successMessage && (
          <div style={{
            color: colors.success,
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: actualTheme === 'light'
              ? 'rgba(76, 175, 80, 0.05)'
              : 'rgba(129, 212, 129, 0.1)',
            borderRadius: '8px',
            border: `1px solid ${colors.success}`
          }}>
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          className="kraken-forgot-password__submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="kraken-forgot-password__loading">
              <div className="kraken-forgot-password__spinner"></div>
              Enviando enlace...
            </div>
          ) : (
            'Enviar enlace'
          )}
        </button>
      </form>

      <div className="kraken-forgot-password__back">
        <button
          type="button"
          className="kraken-forgot-password__back-link"
          onClick={() => navigate('/login')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;