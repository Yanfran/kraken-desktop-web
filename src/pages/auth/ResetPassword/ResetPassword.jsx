// src/pages/auth/ResetPassword/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import './ResetPassword.styles.scss';
import logoImage from '../../../assets/images/logo.jpg';
import axiosInstance from '../../../services/axiosInstance';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { colors, actualTheme } = useTheme();
  const { t } = useTranslation();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);

  // Extraer token de la URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setTokenError(t('auth.reset_token_error'));
    }
  }, [searchParams]);

  useEffect(() => {
    const container = document.querySelector('.kraken-reset-password');
    if (container) {
      container.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  // Validar contraseña
  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    };
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = t('auth.reset_password_required');
    } else {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        newErrors.password = t('auth.reset_password_requirements');
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.reset_confirm_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.reset_passwords_mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/Users/reset-password', {
        token: token,
        newPassword: password
      });

      if (response.data.success) {
        setSuccessMessage(t('auth.reset_success_api'));
      } else {
        setErrors({ general: response.data.message || t('auth.reset_error_general') });
      }
    } catch (error) {
      console.error('❌ Error al restablecer contraseña:', error);
      setErrors({ general: error.response?.data?.message || t('auth.reset_error_general') });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar validador de contraseña
  const passwordValidation = validatePassword(password);

  // Si hay error de token
  if (tokenError) {
    return (
      <div className="kraken-reset-password" data-theme={actualTheme}>
        <div className="kraken-reset-password__logo">
          <img
            src={logoImage}
            alt="Kraken Logo"
            className="kraken-reset-password__logo-image"
          />
        </div>
        
        <h1 className="kraken-reset-password__title" style={{color: colors.error}}>
          {t('auth.reset_invalid_title')}
        </h1>
        <p className="kraken-reset-password__subtitle">{tokenError}</p>
        <button onClick={() => navigate('/forgot-password')} className="kraken-reset-password__submit-button">
          {t('auth.reset_request_link')}
        </button>
        <div className="kraken-reset-password__back">
          <button type="button" className="kraken-reset-password__back-link" onClick={() => navigate('/login')}>
            {t('auth.back_to_login')}
          </button>
        </div>
      </div>
    );
  }

  // Si fue exitoso
  if (successMessage) {
    return (
      <div className="kraken-reset-password" data-theme={actualTheme}>
        <div className="kraken-reset-password__logo">
          <img
            src={logoImage}
            alt="Kraken Logo"
            className="kraken-reset-password__logo-image"
          />
        </div>
                
        <h1 className="kraken-reset-password__title" style={{color: colors.secondary}}>
          {t('auth.reset_success_title')}
        </h1>
        <div style={{ color: colors.textPlaceholder, fontSize: '14px', textAlign: 'center', marginBottom: '30px', width: '100%', maxWidth: '380px', padding: '12px', lineHeight: '1.5' }}>
          {successMessage} {t('auth.reset_success_msg')}
        </div>
        <button onClick={() => navigate('/login')} className="kraken-reset-password__submit-button">
          {t('auth.reset_go_login')}
        </button>
      </div>
    );
  }

  return (
    <div className="kraken-reset-password" data-theme={actualTheme}>
      <div className="kraken-reset-password__logo">        
        <a 
          href="https://krakencourier.com/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src={logoImage} 
            alt="Kraken Logo" 
            className="kraken-reset-password__logo-image"
          />
        </a>
      </div>

      <h1 className="kraken-reset-password__title">{t('auth.reset_title')}</h1>
      <p className="kraken-reset-password__subtitle">
        {t('auth.reset_subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="kraken-reset-password__form">
        {/* Error general */}
        {errors.general && (
          <div style={{
            color: colors.error,
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: actualTheme === 'light'
              ? 'rgba(244, 67, 54, 0.05)'
              : 'rgba(255, 180, 171, 0.1)',
            borderRadius: '8px',
            border: `1px solid ${colors.error}`
          }}>
            {errors.general}
          </div>
        )}

        {/* Campo Nueva Contraseña */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">{t('auth.reset_new_password')}</label>
          <div className="kraken-input-field__wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.reset_new_password')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setShowPasswordValidator(e.target.value.length > 0);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              className={`kraken-input-field__input ${errors.password ? 'kraken-input-field__input--error' : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="kraken-input-field__icon"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          {errors.password && (
            <span className="kraken-input-field__error">{errors.password}</span>
          )}
        </div>

        {/* Validador de contraseña */}
        {showPasswordValidator && (
          <div className="kraken-reset-password__password-validator">
            <p className="kraken-reset-password__validator-title">
              {t('auth.reset_validator_title')}
            </p>
            <ul className="kraken-reset-password__validator-list">
              <li className={passwordValidation.minLength ? 'valid' : ''}>
                {passwordValidation.minLength ? '✓' : '○'} {t('auth.reset_req_length')}
              </li>
              <li className={passwordValidation.hasUpperCase ? 'valid' : ''}>
                {passwordValidation.hasUpperCase ? '✓' : '○'} {t('auth.reset_req_upper')}
              </li>
              <li className={passwordValidation.hasLowerCase ? 'valid' : ''}>
                {passwordValidation.hasLowerCase ? '✓' : '○'} {t('auth.reset_req_lower')}
              </li>
              <li className={passwordValidation.hasNumber ? 'valid' : ''}>
                {passwordValidation.hasNumber ? '✓' : '○'} {t('auth.reset_req_number')}
              </li>
              <li className={passwordValidation.hasSpecialChar ? 'valid' : ''}>
                {passwordValidation.hasSpecialChar ? '✓' : '○'} {t('auth.reset_req_special')}
              </li>
            </ul>
          </div>
        )}

        {/* Campo Confirmar Contraseña */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">{t('auth.reset_confirm_password')}</label>
          <div className="kraken-input-field__wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.reset_confirm_password')}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
              }}
              className={`kraken-input-field__input ${errors.confirmPassword ? 'kraken-input-field__input--error' : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="kraken-input-field__icon"
            >
              {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="kraken-input-field__error">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="kraken-reset-password__submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="kraken-reset-password__loading">
              <div className="kraken-reset-password__spinner"></div>
              {t('auth.reset_submitting')}
            </div>
          ) : (
            t('auth.reset_submit')
          )}
        </button>
      </form>

      {/* Enlace volver al login */}
      <div className="kraken-reset-password__back">
        <button
          type="button"
          className="kraken-reset-password__back-link"
          onClick={() => navigate('/login')}
        >
          {t('auth.back_to_login')}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;