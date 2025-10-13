// src/pages/auth/EmailConfirmation/EmailConfirmation.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import './EmailConfirmation.styles.scss';

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

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, resendVerificationEmail, user } = useAuth();
  const { actualTheme } = useTheme();
  
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // ✅ MEJOR OBTENCIÓN DE EMAIL con múltiples fallbacks
  const email = React.useMemo(() => {
    // 1. Del state de navegación
    if (location.state?.email) return location.state.email;
    
    // 2. Del usuario en context
    if (user?.email) return user.email;
    
    // 3. Del localStorage
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.email) return parsed.email;
      }
    } catch (e) {
      console.error('Error parsing userData:', e);
    }
    
    return null;
  }, [location.state, user]);

  // ✅ MOSTRAR ALERTA SI NO HAY EMAIL
  React.useEffect(() => {
    if (!email) {
      toast.error('No se encontró el email. Redirigiendo...');
      setTimeout(() => navigate('/register'), 2000);
    }
  }, [email, navigate]);

  const handleResendEmail = async () => {
    // ✅ DESCOMENTAR ESTA VALIDACIÓN
    if (isResending || emailSent || !email) {
      if (!email) {
        toast.error('No se encontró el email. Intenta registrarte nuevamente.');
      }
      return;
    }

    try {
      setIsResending(true);
      console.log('📧 Enviando email a:', email); // Debug
      
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success('¡Correo enviado! Revisa tu bandeja de entrada y spam.');
        setTimeout(() => setEmailSent(false), 20000);
      } else {
        toast.error(result.message || 'No se pudo reenviar el correo.');
      }
    } catch (error) {
      console.error('Error al reenviar email:', error);
      toast.error('Error de conexión.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = async () => {
    await signOut();
    navigate('/login');
  };

  // ✅ MOSTRAR LOADING SI NO HAY EMAIL
  if (!email) {
    return (
      <div className="kraken-email-confirmation" data-theme={actualTheme}>
        {/* <ThemeToggle /> */}
        <div className="kraken-email-confirmation__content">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="kraken-email-confirmation" data-theme={actualTheme}>
      {/* <ThemeToggle /> */}
      
      <div className="kraken-email-confirmation__logo">
        <img
          src="/src/assets/images/logo.jpg"
          alt="Kraken Logo"
          className="kraken-email-confirmation__logo-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      <div className="kraken-email-confirmation__content">
        <h1 className="kraken-email-confirmation__title">
          Falta un solo paso para terminar tu registro
        </h1>

        <p className="kraken-email-confirmation__description">
          Revisa tu bandeja de entrada o carpeta de spam y confirma tu e-mail.
        </p>

        <p className="kraken-email-confirmation__problems">
          ¿Problemas?
        </p>

        <a
          href="#"
          className="kraken-email-confirmation__resend-link"
          style={{ 
            pointerEvents: (isResending || emailSent) ? 'none' : 'auto',
            opacity: (isResending || emailSent) ? 0.6 : 1 
          }}
          onClick={(e) => {
            e.preventDefault();
            handleResendEmail();
          }}
        >
          {isResending ? (
            <div className="kraken-email-confirmation__loading">
              <div className="kraken-email-confirmation__spinner"></div>
              Reenviando...
            </div>
          ) : emailSent ? (
            <span style={{ color: '#4CAF50' }}>✓ Enviado</span>
          ) : (
            'Reenviar correo de confirmación'
          )}
        </a>

        <button
          className="kraken-email-confirmation__back-link"
          onClick={handleBackToLogin}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;