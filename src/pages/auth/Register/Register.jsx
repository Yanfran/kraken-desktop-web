// src/pages/auth/Register/Register.jsx - CON BANNER LATERAL
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import './Register.styles.scss';
import PasswordValidator, { validatePassword } from '../../../components/auth/PasswordValidator/PasswordValidator';
import logoImage from '../../../assets/images/logo.jpg';
import PromoBanner from '../../../components/auth/PromoBanner/PromoBanner';
import InfoBanner from '../../../components/auth/InfoBanner/InfoBanner';

// Icons actualizados
import {
  IoEyeOutline,
  IoEyeOffOutline,
} from 'react-icons/io5';

const COUNTRY_OPTIONS = [
  { prefix: 'KV', flag: '🇻🇪', name: 'Venezuela', desc: 'Encomiendas y envíos internacionales', disabled: false },
  { prefix: 'KU', flag: '🇺🇸', name: 'Estados Unidos', desc: 'Recogida directa en tu dirección USA', disabled: false },
  { prefix: 'KE', flag: '🇪🇺', name: 'Europa', desc: 'Próximamente', disabled: true },
];

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const { colors, actualTheme } = useTheme();
  const { t } = useTranslation();

  // Estados del formulario
  const [formData, setFormData] = useState({ name: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  // Selector de país inline para registro con email
  const [clientPrefix, setClientPrefix] = useState('KV');
  // Ref síncrona para el callback de Google
  const selectedPrefixRef = useRef('KV');

  // Manejar cambios en inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Mostrar/ocultar validador de contraseña
    if (field === 'password') {
      setShowPasswordValidator(value.length > 0);
      
      if (value.length > 0) {
        const validation = validatePassword(value);
        if (validation.isValid && errors.password) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.password;
            return newErrors;
          });
        }
      }
    }
  };

  const redirectAfterAuth = (user, isNewUser = false) => {
    if (user?.codCliente?.startsWith('KU') && isNewUser) {
      navigate('/pickup');
    } else {
      navigate('/home');
    }
  };

  const handleGoogleButtonClick = () => {
    setShowCountryModal(true);
  };

  const handleCountrySelected = (prefix) => {
    selectedPrefixRef.current = prefix;
    setShowCountryModal(false);
    googleLogin();
  };

  // Configurar Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const result = await signInWithGoogle(
          { credential: tokenResponse.access_token },
          selectedPrefixRef.current
        );
        if (result.success) {
          toast.success('¡Bienvenido!');
          redirectAfterAuth(result.user, result.isNewUser);
        } else {
          toast.error(result.message || 'Error con Google');
        }
      } catch (error) {
        console.error('❌ Error en Google registro:', error);
        toast.error('Error al conectar con Google');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Error con Google');
      setGoogleLoading(false);
    },
  });

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos básicos
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('auth.name_required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.last_name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.email_invalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.password_required');
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('auth.register_form_errors'));
      return;
    }
    
    try {
      const result = await signUp({
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        clientPrefix,
        fromWizard: clientPrefix === 'KU',
      });

      if (result.success) {
        toast.success(t('auth.register_success'));
        if (clientPrefix === 'KU') {
          navigate('/pickup');
        } else {
          navigate('/email-confirmation', { state: { email: formData.email } });
        }
      } else {
        if (result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          setErrors({ submit: result.message });
        }
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setErrors({ submit: t('auth.connection_error') });
      toast.error(t('auth.connection_error'));
    }
  };

  return (
    <>
    <div className="kraken-register-wrapper">
      {/* ✨ BANNER PROMOCIONAL - LADO IZQUIERDO */}
      <PromoBanner />
      
      {/* CONTENIDO DEL REGISTRO - LADO DERECHO */}
      <div className="kraken-register" data-theme={actualTheme}>

        <InfoBanner />

        {/* Logo */}
        <div className="kraken-register__logo">          
          <a 
            href="https://krakencourier.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={logoImage} 
              alt="Kraken Logo" 
              className="kraken-register__logo-image"
            />
          </a>
        </div>

        {/* Título */}
        <h1 className="kraken-register__title">{t('auth.register_title')}</h1>

        {/* Selector de país inline */}
        <div className="country-selector">
          {COUNTRY_OPTIONS.filter(o => !o.disabled).map((opt) => (
            <button
              key={opt.prefix}
              type="button"
              className={`country-selector__btn${clientPrefix === opt.prefix ? ' country-selector__btn--active' : ''}`}
              onClick={() => setClientPrefix(opt.prefix)}
            >
              <span>{opt.flag}</span>
              <span>{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Botón Google */}
        <button
          type="button"
          className="kraken-register__google-button"
          onClick={handleGoogleButtonClick}
          disabled={isLoading || googleLoading}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="kraken-register__google-icon"
          />
          <span>{googleLoading ? 'Conectando...' : t('auth.google')}</span>
        </button>

        {/* Separador */}
        <div className="kraken-register__separator">
          <div className="kraken-register__separator-line"></div>
          <span className="kraken-register__separator-text">{t('auth.or')}</span>
          <div className="kraken-register__separator-line"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="kraken-register__form">
          {/* Nombre */}
          <div className="kraken-input-field">
            <label className="kraken-input-field__label">{t('auth.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('auth.name_placeholder')}
              className={`kraken-input-field__input ${errors.name ? 'kraken-input-field__input--error' : ''}`}
              disabled={isLoading}
              autoComplete="given-name"
            />
            {errors.name && (
              <span className="kraken-input-field__error">{errors.name}</span>
            )}
          </div>

          {/* Apellido */}
          <div className="kraken-input-field">
            <label className="kraken-input-field__label">{t('auth.last_name')}</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder={t('auth.last_name_placeholder')}
              className={`kraken-input-field__input ${errors.lastName ? 'kraken-input-field__input--error' : ''}`}
              disabled={isLoading}
              autoComplete="family-name"
            />
            {errors.lastName && (
              <span className="kraken-input-field__error">{errors.lastName}</span>
            )}
          </div>

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
                autoComplete="new-password"
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

            {/* Validador de contraseña */}
            <PasswordValidator 
              password={formData.password} 
              visible={showPasswordValidator}
            />
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
            className="kraken-register__submit-button"
            disabled={
              isLoading ||
              (formData.password && !validatePassword(formData.password).isValid)
            }
          >
            {isLoading ? (
              <div className="kraken-register__loading">
                <div className="kraken-register__spinner"></div>
                {t('auth.registering')}
              </div>
            ) : (
              t('auth.register_submit')
            )}
          </button>
        </form>

        {/* Link de login */}
        <div className="kraken-register__login">
          <span className="kraken-register__login-text">
            {t('auth.have_account')}{' '}
          </span>
          <button
            type="button"
            className="kraken-register__login-link"
            onClick={() => navigate('/login')}
          >
            {t('auth.login_link_text')}
          </button>
        </div>

        {/* Términos y condiciones */}
        <div className="kraken-register__terms">
          <p className="kraken-register__terms-text">
            {t('auth.terms_start')}
            <a
              href="/terms"
              className="kraken-register__terms-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('auth.terms')}
            </a>
            {t('auth.privacy_start')}
            <a
              href="/privacy"
              className="kraken-register__terms-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('auth.privacy')}
            </a>
          </p>
        </div>
      </div>
    </div>

    {/* Modal selección de país (Google) */}
    {showCountryModal && (
      <div className="country-modal-overlay" onClick={() => setShowCountryModal(false)}>
        <div className="country-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="country-modal__title">¿Dónde estás ubicado?</h3>
          <p className="country-modal__subtitle">Selecciona tu país para continuar con Google</p>
          <div className="country-modal__options">
            {COUNTRY_OPTIONS.map((opt) => (
              <button
                key={opt.prefix}
                className={`country-modal__option${opt.disabled ? ' country-modal__option--disabled' : ''}`}
                onClick={() => !opt.disabled && handleCountrySelected(opt.prefix)}
                disabled={opt.disabled}
              >
                <span className="country-modal__flag">{opt.flag}</span>
                <div className="country-modal__info">
                  <span className="country-modal__name">{opt.name}</span>
                  <span className="country-modal__desc">{opt.desc}</span>
                </div>
              </button>
            ))}
          </div>
          <button className="country-modal__cancel" onClick={() => setShowCountryModal(false)}>
            Cancelar
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Register;