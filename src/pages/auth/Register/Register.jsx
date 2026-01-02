// src/pages/auth/Register/Register.jsx - CON BANNER LATERAL
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
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
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Configurar Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        // console.log('🔵 Token recibido de Google');
        
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

  // Manejar submit del formulario
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
      // Validar contraseña segura
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

  return (
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
        <h1 className="kraken-register__title">Crear cuenta</h1>

        {/* Botón Google */}
        <button
          type="button"
          className="kraken-register__google-button"
          onClick={() => googleLogin()}
          disabled={isLoading || googleLoading}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="kraken-register__google-icon"
          />
          <span>Continuar con Google</span>
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
    </div>
  );
};

export default Register;