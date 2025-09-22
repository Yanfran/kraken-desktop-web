// src/pages/auth/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './Login.styles.scss';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [buildInfo] = useState({ version: '1.0.0' });

  // Función para manejar el login
  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    if (!email) {
      setEmailError('Por favor ingresa tu email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Por favor ingresa tu contraseña');
      hasError = true;
    }

    if (hasError) return;

    const result = await signIn(email, password);
    if (!result.success) {
      setEmailError('Credenciales inválidas');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="kraken-login">
      
      {/* Logo Kraken Real */}
      <div className="kraken-login__logo">
        <img 
          src="/src/assets/images/logo.jpg" 
          alt="Kraken Logo"
          className="kraken-login__logo-image"
        />
      </div>

      {/* Título */}
      <p className="kraken-login__title">Iniciar Sesión</p>

      {/* Botón Google */}
      <button
        className="kraken-login__google-button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        type="button"
      >
        <img 
          src="/src/assets/images/google-icon.png" 
          alt="Google"
          className="kraken-login__google-icon"
        />
        {isLoading ? (
          <div className="kraken-login__loading">
            <div className="kraken-login__spinner"></div>
            <span>Conectando...</span>
          </div>
        ) : (
          'Continuar con Google'
        )}
      </button>

      {/* Separador con punto */}
      <div className="kraken-login__separator">
        <div className="kraken-login__separator-dot"></div>
      </div>

      {/* Formulario de campos */}
      <form onSubmit={handleLogin} className="kraken-login__form">
        
        {/* Campo Email */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Correo electrónico</label>
          <input
            className={`kraken-input-field__input ${emailError ? 'kraken-input-field__input--error' : ''}`}
            type="email"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {emailError && <span className="kraken-input-field__error">{emailError}</span>}
        </div>

        {/* Campo Contraseña */}
        <div className="kraken-input-field">
          <label className="kraken-input-field__label">Contraseña</label>
          <div className="kraken-input-field__password-container">
            <input
              className={`kraken-input-field__input ${passwordError ? 'kraken-input-field__input--error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button 
              type="button"
              className="kraken-input-field__eye-button"
              onClick={togglePasswordVisibility}
            >
              👁️
            </button>
          </div>
          {passwordError && <span className="kraken-input-field__error">{passwordError}</span>}
        </div>

        {/* Enlace olvidé contraseña */}
        <div className="kraken-login__forgot">
          <a href="#forgot" className="kraken-login__forgot-link">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón Iniciar sesión */}
        <button
          type="submit"
          className="kraken-login__submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="kraken-login__loading">
              <div className="kraken-login__spinner"></div>
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      {/* Enlace registro */}
      <div className="kraken-login__register">
        <span className="kraken-login__register-text">¿No tienes cuenta? </span>
        <button 
          type="button"
          className="kraken-login__register-link"
          onClick={() => navigate('/register')}
        >
          Registrarse
        </button>
      </div>

      {/* Términos y condiciones */}
      <div className="kraken-login__terms">
        <p className="kraken-login__terms-text">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="#terms" className="kraken-login__terms-link">Términos y Condiciones</a>
          {' '}y nuestra{' '}
          <a href="#privacy" className="kraken-login__terms-link">Política de Privacidad</a>
        </p>
      </div>

    </div>
    
  );
};

export default Login;