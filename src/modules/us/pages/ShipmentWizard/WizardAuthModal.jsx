// WizardAuthModal — igual que en la app móvil:
// Verifica si el email ya existe → modo login | modo registro
// Después de auth exitoso llama onSuccess() para continuar el wizard.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { authService } from '../../../../services/auth/authService';
import './USShipmentWizard.scss';
import PasswordValidator, { validatePassword } from '../../../../components/auth/PasswordValidator/PasswordValidator';
import { IoEyeOutline, IoEyeOffOutline, IoLockClosedOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const WizardAuthModal = ({ email, name, lastName, onSuccess, onCancel }) => {
  const { signIn, signUp } = useAuth();

  const [mode,         setMode]         = useState('checking'); // 'checking' | 'register' | 'login'
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showValidator, setShowValidator] = useState(false);

  // Al abrir el modal, verificar si el email ya existe usando el endpoint dedicado
  useEffect(() => {
    if (!email) { setMode('register'); return; }
    setMode('checking');
    authService.checkEmailExists(email)
      .then(({ exists }) => setMode(exists ? 'login' : 'register'))
      .catch(() => setMode('register'));
  }, [email]);

  const handleSubmit = async () => {
    setError('');
    if (!password) { setError('Ingresa tu contraseña.'); return; }

    if (mode === 'register') {
      const validation = validatePassword(password);
      if (!validation.isValid) { setError(validation.errors[0]); return; }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await signUp({ name, lastName, email, password, clientPrefix: 'KU', fromWizard: true });
        if (res.success) {
          toast.success('¡Cuenta creada! Continúa con tu recogida.');
          onSuccess();
        } else {
          // Si el email ya existía (race condition), intentar login
          if (res.message?.toLowerCase().includes('ya está registrado') || res.message?.toLowerCase().includes('already')) {
            setMode('login');
            setError('Este correo ya tiene una cuenta. Ingresa tu contraseña.');
          } else {
            setError(res.message || 'Error al crear la cuenta.');
          }
        }
      } else {
        const res = await signIn(email, password);
        if (res.success) {
          toast.success('¡Bienvenido! Continúa con tu recogida.');
          onSuccess();
        } else {
          setError(res.message || 'Contraseña incorrecta.');
        }
      }
    } catch (e) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wam-overlay" onClick={onCancel}>
      <div className="wam" onClick={(e) => e.stopPropagation()}>

        <div className="wam__icon">
          <IoLockClosedOutline size={32} />
        </div>

        {mode === 'checking' && (
          <>
            <h3 className="wam__title">Verificando...</h3>
            <div className="wam__spinner" />
          </>
        )}

        {mode === 'register' && (
          <>
            <h3 className="wam__title">Crea tu cuenta</h3>
            <p className="wam__subtitle">
              Ingresa una contraseña para guardar tu recogida y hacer seguimiento.
            </p>
            <p className="wam__email">{email}</p>
          </>
        )}

        {mode === 'login' && (
          <>
            <h3 className="wam__title">¡Ya tienes una cuenta!</h3>
            <p className="wam__subtitle">
              Ingresa tu contraseña para continuar.
            </p>
            <p className="wam__email">{email}</p>
          </>
        )}

        {(mode === 'register' || mode === 'login') && (
          <>
            <div className="wam__field">
              <div className="wam__password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    if (mode === 'register') setShowValidator(e.target.value.length > 0);
                  }}
                  className={`wam__input${error ? ' input--error' : ''}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="wam__eye"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
              {mode === 'register' && (
                <PasswordValidator password={password} visible={showValidator} />
              )}
              {error && <span className="field-error" style={{ marginTop: '6px', display: 'block' }}>{error}</span>}
            </div>

            {mode === 'login' && (
              <button
                type="button"
                className="wam__toggle"
                onClick={() => { setMode('register'); setPassword(''); setError(''); }}
              >
                ¿No es tu cuenta? Crear una nueva
              </button>
            )}

            <div className="wam__actions">
              <button className="wam__btn wam__btn--cancel" onClick={onCancel} disabled={loading}>
                Cancelar
              </button>
              <button className="wam__btn wam__btn--submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WizardAuthModal;
