// src/pages/auth/Register/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App'; // Tu hook de autenticación actual
import { useTheme } from '../../../contexts/ThemeContext'; // Hook de tema
import './Register.styles.scss';

// Componente toggle para cambio de tema (igual al del login)
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

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const { colors, actualTheme } = useTheme();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
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

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    
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

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Por ahora solo simula el registro y navega
    try {
      // Simular loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navegar directo a email-confirmation
      navigate('/email-confirmation');
    } catch (error) {
      setErrors({ submit: 'Error al registrarse. Intenta nuevamente.' });
    }
  };

  // Manejar registro con Google
  const handleGoogleRegister = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ submit: 'Error al registrarse con Google' });
    }
  };

  // Aplicar tema al contenedor principal
  React.useEffect(() => {
    const registerContainer = document.querySelector('.kraken-register');
    if (registerContainer) {
      registerContainer.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="kraken-register" data-theme={actualTheme}>
      {/* Toggle de tema */}
      <ThemeToggle />
      
      {/* Logo */}
      <div className="kraken-register__logo">
        <img
          src="/src/assets/images/logo.jpg"
          alt="Kraken Logo"
          className="kraken-register__logo-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Título */}
      <h1 className="kraken-register__title">Registro</h1>

      {/* Botón Google */}
      <button
        type="button"
        className="kraken-register__google-button"
        onClick={handleGoogleRegister}
        disabled={isLoading}
      >
        <img
          src="/google-icon.png"
          alt="Google"
          className="kraken-register__google-icon"
          onError={(e) => {
            e.target.src = "https://developers.google.com/identity/images/g-logo.png";
          }}
        />
        {isLoading ? 'Registrando...' : 'Continuar con Google'}
      </button>

      {/* Separador */}
      <div className="kraken-register__separator">
        <div className="kraken-register__separator-dot">o</div>
      </div>

      {/* Formulario de registro */}
      <form onSubmit={handleSubmit} className="kraken-register__form">
        {/* Campo Nombre */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`kraken-input-field__input ${errors.name ? 'kraken-input-field__input--error' : ''}`}
            disabled={isLoading}
            autoComplete="given-name"
          />
          {errors.name && (
            <span className="kraken-input-field__error">{errors.name}</span>
          )}
        </div>

        {/* Campo Apellido */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Apellido</label>
          <input
            type="text"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`kraken-input-field__input ${errors.lastName ? 'kraken-input-field__input--error' : ''}`}
            disabled={isLoading}
            autoComplete="family-name"
          />
          {errors.lastName && (
            <span className="kraken-input-field__error">{errors.lastName}</span>
          )}
        </div>

        {/* Campo Email */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Correo electrónico</label>
          <input
            type="email"
            placeholder="Correo electrónico"
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
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
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
          className="kraken-register__submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="kraken-register__loading">
              <div className="kraken-register__spinner"></div>
              Registrando...
            </div>
          ) : (
            'Registro con e-mail'
          )}
        </button>
      </form>

      {/* Link de login */}
      <div className="kraken-register__login">
        <span className="kraken-register__login-text">
          ¿Ya tienes cuenta? 
        </span>
        <button
          type="button"
          className="kraken-register__login-link"
          onClick={() => navigate('/login')}
        >
          Inicia sesión aquí
        </button>
      </div>

      {/* Términos y condiciones */}
      <div className="kraken-register__terms">
        <p className="kraken-register__terms-text">
          Al continuar, aceptas nuestros{' '}
          <a 
            href="/terms" 
            className="kraken-register__terms-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Términos y Condiciones
          </a>
          {' '}y{' '}
          <a 
            href="/privacy" 
            className="kraken-register__terms-link"
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

export default Register;