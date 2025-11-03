// src/pages/auth/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.styles.scss';
import logoImage from '../../../assets/images/logo.jpg'; 
import PromoBanner from '../../../components/auth/PromoBanner/PromoBanner';

// Icons actualizados
import { 
  IoEyeOutline,
  IoEyeOffOutline,
} from 'react-icons/io5';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const { colors, actualTheme } = useTheme();
  
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
        console.log('🔵 Token recibido de Google');
        
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
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        toast.success('¡Bienvenido de vuelta!');
        navigate('/home');
      } else {
        if (result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          setErrors({ submit: result.message });
        }
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
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
        {/* Logo */}
        <div className="kraken-login__logo">
          <img 
            src={logoImage} 
            alt="Kraken Logo" 
            className="kraken-login__logo-image"
          />
        </div>

        {/* Título */}
        <h1 className="kraken-login__title">Iniciar Sesión</h1>

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
          <span>Continuar con Google</span>
        </button>

        {/* Separador */}
        <div className="kraken-login__separator">
          <div className="kraken-login__separator-line"></div>
          <span className="kraken-login__separator-text">o</span>
          <div className="kraken-login__separator-line"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="kraken-login__form">
          {/* Email */}
          <div className="kraken-input-field">
            <label className="kraken-input-field__label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Ingresa tu email"
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
            <label className="kraken-input-field__label">Contraseña</label>
            <div className="kraken-input-field__password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Ingresa tu contraseña"
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
                Iniciando sesión...
              </div>
            ) : (
              'Inicia sesión con e-mail'
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
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Link de registro */}
        <div className="kraken-login__register">
          <span className="kraken-login__register-text">
            ¿No tienes cuenta? 
          </span>
          <button
            type="button"
            className="kraken-login__register-link"
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </button>
        </div>

        {/* Términos y condiciones */}
        <div className="kraken-login__terms">
          <p className="kraken-login__terms-text">
            Al continuar, aceptas nuestros{' '}
            <a 
              href="/terms" 
              className="kraken-login__terms-link"            
              rel="noopener noreferrer"
            >
              Términos y Condiciones
            </a>
            {' '}y{' '}
            <a 
              href="/privacy" 
              className="kraken-login__terms-link"            
              rel="noopener noreferrer"
            >
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;