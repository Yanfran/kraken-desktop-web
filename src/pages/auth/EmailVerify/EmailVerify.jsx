// src/pages/auth/EmailVerify/EmailVerify.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import './EmailVerify.styles.scss';
import logoImage from '../../../assets/images/logo.jpg';
import axiosInstance from '../../../services/axiosInstance';

// Persiste entre re-mounts para evitar llamadas duplicadas si el componente
// se desmonta/remonta por cambios en el contexto de auth durante la verificación.
const handledTokens = new Set();

const EmailVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserState } = useAuth();
  const { actualTheme } = useTheme();
  const { t } = useTranslation();

  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage(t('auth.email_verify_no_token'));
      return;
    }

    if (handledTokens.has(token)) return;
    handledTokens.add(token);

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus('loading');
      
      // ✅ CORRECTO: axiosInstance.get sin opciones adicionales
      const response = await axiosInstance.get(`/Users/verify-email?token=${token}`);

      // ✅ CORRECTO: Con axios, usar response.data (NO response.json())
      const data = response.data;

      // console.log('📥 Respuesta del backend:', data);

      // ✅ Validar respuesta
      if (!data.success) {
        throw new Error(data.message || 'Token inválido o expirado');
      }

      // Guardar sesión
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // Actualizar context
      await setUserState(data.user, data.token);

      setStatus('success');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        // Si el perfil está completo, ir al dashboard
        if (data.user.profileComplete) {
          navigate('/home');
        } else {
          // Si no, ir a completar perfil
          navigate('/complete-profile');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Error al verificar email:', error);
      setStatus('error');
      
      // ✅ Manejo de errores mejorado
      const message = error.response?.data?.message
        || error.message
        || t('auth.email_verify_default_error');
      
      setErrorMessage(message);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="kraken-email-verify" data-theme={actualTheme}>
      <div className="kraken-email-verify__container">
        
        {/* Logo */}
        <div className="kraken-email-verify__logo">          
          <a 
            href="https://krakencourier.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={logoImage} 
              alt="Kraken Logo" 
              className="kraken-email-verify__logo-image"
            />
          </a>
        </div>

        {status === 'loading' && (
          <div className="kraken-email-verify__content">
            <div className="kraken-email-verify__spinner"></div>
            <h1 className="kraken-email-verify__title">{t('auth.email_verify_loading')}</h1>
            <p className="kraken-email-verify__message">{t('auth.email_verify_wait')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="kraken-email-verify__content kraken-email-verify__content--success">
            <div className="kraken-email-verify__icon kraken-email-verify__icon--success">✓</div>
            <h1 className="kraken-email-verify__title">{t('auth.email_verify_success_title')}</h1>
            <p className="kraken-email-verify__message">{t('auth.email_verify_success_msg')}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="kraken-email-verify__content kraken-email-verify__content--error">
            <div className="kraken-email-verify__icon kraken-email-verify__icon--error">✗</div>
            <h1 className="kraken-email-verify__title">{t('auth.email_verify_error_title')}</h1>
            <p className="kraken-email-verify__message">{errorMessage}</p>
            <p className="kraken-email-verify__message-suctitulo">{t('auth.email_verify_error_msg')}</p>
            <button className="kraken-email-verify__back-button" onClick={handleBackToLogin}>
              {t('auth.email_verify_back')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailVerify;