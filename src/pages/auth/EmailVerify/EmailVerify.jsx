// src/pages/auth/EmailVerify/EmailVerify.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import './EmailVerify.styles.scss';
import logoImage from '../../../assets/images/logo.jpg';
import axiosInstance from '../../../services/axiosInstance';

const EmailVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserState } = useAuth();
  const { actualTheme } = useTheme();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No se encontró el token de verificación');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus('loading');
      
      // ✅ CORRECTO: axiosInstance.get sin opciones adicionales
      const response = await axiosInstance.get(`/Users/verify-email?token=${token}`);

      // ✅ CORRECTO: Con axios, usar response.data (NO response.json())
      const data = response.data;

      console.log('📥 Respuesta del backend:', data);

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
        || 'No se pudo verificar el correo electrónico';
      
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
          <img
            src={logoImage}
            alt="Kraken Logo"
            className="kraken-email-verify__logo-image"
          />
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="kraken-email-verify__content">
            <div className="kraken-email-verify__spinner"></div>
            <h1 className="kraken-email-verify__title">
              Verificando tu cuenta...
            </h1>
            <p className="kraken-email-verify__message">
              Por favor espera un momento
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="kraken-email-verify__content kraken-email-verify__content--success">
            <div className="kraken-email-verify__icon kraken-email-verify__icon--success">
              ✓
            </div>
            <h1 className="kraken-email-verify__title">
              ¡Cuenta verificada!
            </h1>
            <p className="kraken-email-verify__message">
              Tu email ha sido verificado correctamente.
              Redirigiendo...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="kraken-email-verify__content kraken-email-verify__content--error">
            <div className="kraken-email-verify__icon kraken-email-verify__icon--error">
              ✗
            </div>
            <h1 className="kraken-email-verify__title">
              Error de verificación
            </h1>
            <p className="kraken-email-verify__message">
              {errorMessage}
            </p>
            <button
              className="kraken-email-verify__back-button"
              onClick={handleBackToLogin}
            >
              Volver a iniciar sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailVerify;