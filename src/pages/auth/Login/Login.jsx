// src/pages/auth/Login/Login.jsx - IMPLEMENTACIÓN COMPLETA CON TU DISEÑO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; // ✅ CAMBIO: Usar el nuevo AuthContext
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast'; // ✅ AGREGADO: Para notificaciones
import './Login.styles.scss';

// Componente toggle para cambio de tema (mantener igual)
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

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading } = useAuth(); // ✅ FUNCIONALIDAD REAL
  const { colors, actualTheme } = useTheme();
  
  // ✅ ESTADOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // ✅ MANEJAR CAMBIOS EN INPUTS
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ✅ VALIDACIÓN DEL FORMULARIO
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

  // ✅ MANEJAR SUBMIT DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        toast.success('¡Bienvenido de vuelta!');
        navigate('/dashboard');
      } else {
        // Manejar errores específicos del backend
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

  // ✅ MANEJAR GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast.success('¡Bienvenido!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Error con Google Auth');
      }
    } catch (error) {
      console.error('Error en Google sign in:', error);
      toast.error('Error con autenticación de Google');
    }
  };

  return (
    <div className="kraken-login" data-theme={actualTheme}>
      {/* Theme Toggle */}
      {/* <ThemeToggle /> */}

      {/* Logo */}
      <div className="kraken-login__logo">
        <img 
          src="/src/assets/images/logo.jpg" 
          alt="Kraken Logo" 
          className="kraken-login__logo-image"
        />
      </div>

      {/* Título */}
      <h1 className="kraken-login__title">Iniciar Sesión</h1>

      {/* Botón Google */}
      <button
        type="button"
        className="kraken-login__google-button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <img 
          src="/src/assets/images/google-icon.png" 
          alt="Google" 
          className="kraken-login__google-icon"
        />
        Continuar con Google
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
              {showPassword ? '🙈' : '👁️'}
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
            target="_blank"
            rel="noopener noreferrer"
          >
            Términos y Condiciones
          </a>
          {' '}y{' '}
          <a 
            href="/privacy" 
            className="kraken-login__terms-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;