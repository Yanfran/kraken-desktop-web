// src/pages/auth/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App'; // Tu hook de autenticación actual
import { useTheme } from '../../../contexts/ThemeContext'; // Nuevo hook de tema
import './Login.styles.scss';

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

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const { colors, actualTheme } = useTheme();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validación simple
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar login con email
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await signIn(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ submit: result.message || 'Error de autenticación' });
    }
  };

  // Manejar login con Google
  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ submit: 'Error al iniciar sesión con Google' });
    }
  };

  // Aplicar tema al contenedor principal
  React.useEffect(() => {
    const loginContainer = document.querySelector('.kraken-login');
    if (loginContainer) {
      loginContainer.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="kraken-login" data-theme={actualTheme}>
      {/* Toggle de tema */}
      <ThemeToggle />
      
      {/* Logo */}
      <div className="kraken-login__logo">
        <img
          src="/src/assets/images/logo.jpg" // Ajusta la ruta según tu estructura
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
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <img
          src="/src/assets/images/google-icon.png"
          alt="Google"
          className="kraken-login__google-icon"
        />
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </button>

      {/* Separador */}
      <div className="kraken-login__separator">
        <div className="kraken-login__separator-dot">o</div>
      </div>

      {/* Formulario de login */}
      <form onSubmit={handleSubmit} className="kraken-login__form">
        {/* Campo Email */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Correo electrónico</label>
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`kraken-input-field__input ${errors.email ? 'kraken-input-field__input--error' : ''}`}
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && (
            <span className="kraken-input-field__error">{errors.email}</span>
          )}
        </div>

        {/* Campo Contraseña */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Contraseña</label>
          <div className="kraken-input-field__password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
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

        {/* Olvidé contraseña */}
        <div className="kraken-login__forgot">
          <button
            type="button"
            className="kraken-login__forgot-link"
            onClick={() => navigate('/forgot')}
          >
            ¿Olvidaste tu contraseña?
          </button>
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
            'Iniciar Sesión'
          )}
        </button>
      </form>

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