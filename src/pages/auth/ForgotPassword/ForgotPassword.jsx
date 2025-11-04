// src/pages/auth/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import './ForgotPassword.styles.scss';
import logoImage from '../../../assets/images/logo.jpg';
import axiosInstance from '../../../services/axiosInstance';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { colors, actualTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validar email
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/Users/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccessMessage('Se ha enviado un enlace a tu correo electrónico.');
        setEmail('');
      } else {
        setError(response.data.message || 'Error al enviar el enlace de recuperación');
      }
    } catch (error) {
      console.error('❌ Error en forgot password:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('El correo electrónico no está registrado');
      } else {
        setError('Error al enviar el enlace. Por favor intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
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
      <p className="kraken-forgot-password__subtitle">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} className="kraken-forgot-password__form">
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Correo electrónico</label>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
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
            color: colors.primary,
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: actualTheme === 'light'
              ? 'rgba(76, 175, 80, 0.05)'
              : 'rgba(129, 212, 129, 0.1)',                        
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