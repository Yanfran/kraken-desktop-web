// src/pages/auth/Register/Register.jsx - IMPLEMENTACIÓN COMPLETA CON TU DISEÑO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; // ✅ CAMBIO: Usar el nuevo AuthContext
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast'; // ✅ AGREGADO: Para notificaciones
import './Register.styles.scss';
// AGREGAR después de tus imports existentes:
import PasswordValidator, { validatePassword } from '../../../components/auth/PasswordValidator/PasswordValidator';
import logoImage from '../../../assets/images/logo.jpg'; 

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

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isLoading } = useAuth(); // ✅ FUNCIONALIDAD REAL
  const { colors, actualTheme } = useTheme();
  

  
  // ✅ ESTADOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidator, setShowPasswordValidator] = useState(false); // ← AGREGAR

  // ✅ MANEJAR CAMBIOS EN INPUTS
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

    // ✅ AGREGAR ESTE BLOQUE:
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

  // ✅ VALIDACIÓN DEL FORMULARIO
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

  // ✅ MANEJAR SUBMIT DEL FORMULARIO
  // ✅ MANEJAR SUBMIT DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos básicos
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      // ✅ Validar contraseña segura
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    
    // Si hay errores, detener
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }
    
    try {
      const result = await signUp({
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result.success) {
        toast.success('¡Registro exitoso! Verifica tu email para continuar.');
        navigate('/email-confirmation', { 
          state: { email: formData.email }
        });
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
      console.error('Error en registro:', error);
      setErrors({ submit: 'Error de conexión. Intenta de nuevo.' });
      toast.error('Error de conexión. Intenta de nuevo.');
    }
  };

  // ✅ MANEJAR GOOGLE SIGN UP
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast.success('¡Registro exitoso con Google!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Error con Google Auth');
      }
    } catch (error) {
      console.error('Error en Google sign up:', error);
      toast.error('Error con autenticación de Google');
    }
  };

  return (
    <div className="kraken-register" data-theme={actualTheme}>
      {/* Theme Toggle */}
      {/* <ThemeToggle /> */}

      {/* Logo */}
      <div className="kraken-register__logo">
        <img 
          src={logoImage }
          alt="Kraken Logo" 
          className="kraken-register__logo-image"
        />
      </div>

      {/* Título */}
      <h1 className="kraken-register__title">Crear cuenta</h1>

      {/* Botón Google */}
      <button
        type="button"
        className="kraken-register__google-button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        <img 
          src="/src/assets/images/google-icon.png" 
          alt="Google" 
          className="kraken-register__google-icon"
        />
        Continuar con Google
      </button>

      {/* Separador */}
      <div className="kraken-register__separator">
        <div className="kraken-register__separator-line"></div>
        <span className="kraken-register__separator-text">o</span>
        <div className="kraken-register__separator-line"></div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="kraken-register__form">
        {/* Nombre */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ingresa tu nombre"
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
          <label className="kraken-input-field__label">Apellido</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Ingresa tu apellido"
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

          {/* ✅ AGREGAR ESTO: */}
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