// src/pages/auth/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.styles.scss';
import logoImage from '../../../assets/images/logo.jpg'; 
import PromoBanner from '../../../components/auth/PromoBanner/PromoBanner';
import InfoBanner from '../../../components/auth/InfoBanner/InfoBanner';

// Icons actualizados
import { 
  IoEyeOutline,
  IoEyeOffOutline,
} from 'react-icons/io5';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const { colors, actualTheme } = useTheme();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🔥 CONFIGURAR GOOGLE LOGIN CON HOOK
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        // console.log('🔵 Token recibido de Google');
        
        // Crear credential response
        const credentialResponse = {
          credential: tokenResponse.access_token
        };
        
        const result = await signInWithGoogle(credentialResponse);
        
        if (result.success) {
          toast.success('¡Bienvenido!');
          navigate('/home');
        } else {
          toast.error(result.message || 'Error con Google');
        }
      } catch (error) {
        console.error('❌ Error en Google login:', error);
        toast.error('Error al conectar con Google');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('❌ Error de Google:', error);
      toast.error('Error con Google');
      setGoogleLoading(false);
    },
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.email_invalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.password_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success  == true) {
        toast.success(t('auth.welcome_back'));
        navigate('/home');
      } else {

        if (result.tokenVerify) {
          toast('Tu cuenta no está verificada. Reenvía el correo de confirmación.', { icon: '📧' });
          navigate('/email-confirmation', { state: { email: formData.email } });
          return;
        }

        if (result.code === 'ACCOUNT_INACTIVE') {
          return;
        }

        if (result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          setErrors({ submit: result.message });
        }
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error en login yyy:', error);
      setErrors({ submit: 'Error de conexión. Intenta de nuevo.' });
      toast.error('Error de conexión. Intenta de nuevo.');
    }
  };

  return (
    <div className="kraken-login-wrapper">
      {/* ✨ BANNER PROMOCIONAL - LADO IZQUIERDO */}
      <PromoBanner />
      
      {/* CONTENIDO DEL LOGIN - LADO DERECHO */}
      <div className="kraken-login" data-theme={actualTheme}>

        <InfoBanner />
        
        {/* Logo */}
        <div className="kraken-login__logo">          
          <a 
            href="https://krakencourier.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={logoImage} 
              alt="Kraken Logo" 
              className="kraken-login__logo-image"
            />
          </a>
        </div>

        {/* Título */}
        <h1 className="kraken-login__title">{t('auth.login_title')}</h1>

        {/* 🔥 BOTÓN GOOGLE PERSONALIZADO */}
        <button
          type="button"
          className="kraken-login__google-button"
          onClick={() => googleLogin()}
          disabled={isLoading || googleLoading}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="kraken-login__google-icon"
          />
          <span>{t('auth.google')}</span>
        </button>

        {/* Separador */}
        <div className="kraken-login__separator">
          <div className="kraken-login__separator-line"></div>
          <span className="kraken-login__separator-text">{t('auth.or')}</span>
          <div className="kraken-login__separator-line"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="kraken-login__form">
          {/* Email */}
          <div className="kraken-input-field">
            <label className="kraken-input-field__label">{t('auth.email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('auth.email_placeholder')}
              className={`kraken-input-field__input ${errors.email ? 'kraken-input-field__input--error' : ''}`}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="kraken-input-field__error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="kraken-input-field">
            <label className="kraken-input-field__label">{t('auth.password')}</label>
            <div className="kraken-input-field__password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={t('auth.password_placeholder')}
                className={`kraken-input-field__input ${errors.password ? 'kraken-input-field__input--error' : ''}`}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="kraken-input-field__eye-button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18}/>}
              </button>
            </div>
            {errors.password && (
              <span className="kraken-input-field__error">{errors.password}</span>
            )}
          </div>

          {/* Error general */}
          {errors.submit && (
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
              {errors.submit}
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            className="kraken-login__submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="kraken-login__loading">
                <div className="kraken-login__spinner"></div>
                {t('auth.signing_in')}
              </div>
            ) : (
              t('auth.sign_in')
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="kraken-login__forgot">
          <button
            type="button"
            className="kraken-login__forgot-link"
            onClick={() => navigate('/forgot-password')}
          >
            {t('auth.forgot_password')}
          </button>
        </div>

        {/* Link de registro */}
        <div className="kraken-login__register">
          <span className="kraken-login__register-text">
            {t('auth.no_account')}{' '}
          </span>
          <button
            type="button"
            className="kraken-login__register-link"
            onClick={() => navigate('/register')}
          >
            {t('auth.register_link')}
          </button>
        </div>

        {/* Términos y condiciones */}
        <div className="kraken-login__terms">
          <p className="kraken-login__terms-text">
            {t('auth.terms_start')}
            <a
              href="/terms"
              className="kraken-login__terms-link"
              rel="noopener noreferrer"
            >
              {t('auth.terms')}
            </a>
            {t('auth.privacy_start')}
            <a
              href="/privacy"
              className="kraken-login__terms-link"
              rel="noopener noreferrer"
            >
              {t('auth.privacy')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;