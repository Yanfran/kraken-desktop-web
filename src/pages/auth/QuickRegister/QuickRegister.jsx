import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useTenant } from '../../../core/context/TenantContext';
import toast from 'react-hot-toast';
import './QuickRegister.styles.scss';
import PasswordValidator, { validatePassword } from '../../../components/auth/PasswordValidator/PasswordValidator';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import logoImage from '../../../assets/images/logo.jpg';
import axiosInstance from '../../../services/axiosInstance';
import { TENANT_CONFIG } from './tenantConfig';
import { useCountryDetection } from '../../../hooks/useCountryDetection';

const QuickRegister = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const { setUser } = useAuth();
  const { tenant } = useTenant();
  const { isDetecting, detectionError, SUPPORTED_COUNTRIES } = useCountryDetection();

  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Config siempre sigue a selectedPrefix
  const config = TENANT_CONFIG[selectedPrefix] ?? TENANT_CONFIG['KE'];

  // ✅ PASO 1: Detectar y establecer selectedPrefix desde tenant
  useEffect(() => {
    console.log('[QuickRegister] tenant.prefix:', tenant?.prefix);
    const fromTenant = tenant?.prefix?.toUpperCase();
    if (fromTenant && TENANT_CONFIG[fromTenant]) {
      console.log('[QuickRegister] Setting selectedPrefix from tenant:', fromTenant);
      setSelectedPrefix(fromTenant);
    } else {
      console.log('[QuickRegister] No tenant prefix, using default (null → KE)');
      setSelectedPrefix(null);
    }
  }, [tenant]);

  // ✅ PASO 2: Inicializar formData (DESPUÉS de que selectedPrefix se establezca)
  const [formData, setFormData] = useState(() => ({
    email: '',
    password: '',
    confirmPassword: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: config.tipoDocumentoDefault,
    nroDocumento: '',
    telefono: '',
    acceptTerms: false,
  }));

  // ✅ PASO 3: Resetear formData cuando cambia selectedPrefix
  useEffect(() => {
    if (!selectedPrefix) return;
    const newConfig = TENANT_CONFIG[selectedPrefix];
    console.log('[QuickRegister] selectedPrefix changed to:', selectedPrefix);
    setFormData(prev => ({
      ...prev,
      tipoDocumento: newConfig?.tipoDocumentoDefault ?? '',
      nroDocumento: '',
      telefono: '',
    }));
    setErrors({});
  }, [selectedPrefix]);

  // ── Handler ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let sanitized = type === 'checkbox' ? checked : value;

    if (name === 'telefono') {
      sanitized = value.replace(/\D/g, '').slice(0, config.telefonoDigitos);
    }

    if (name === 'nroDocumento') {
      const max = config.documentos[formData.tipoDocumento]?.maxLength ?? 15;
      sanitized = value.replace(/[^A-Za-z0-9-]/g, '').slice(0, max).toUpperCase();
    }

    if (name === 'tipoDocumento') {
      setFormData(prev => ({ ...prev, tipoDocumento: value, nroDocumento: '' }));
      setErrors(prev => ({ ...prev, nroDocumento: '', tipoDocumento: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'password') {
      setShowPasswordValidator(value.length > 0);
      if (value.length > 0 && validatePassword(value).isValid && errors.password) {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };

  // ── Validación ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else {
      const pv = validatePassword(formData.password);
      if (!pv.isValid) newErrors.password = pv.errors[0];
    }

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    const nom = formData.nombres.trim();
    if (!nom) newErrors.nombres = 'El nombre es requerido';
    else if (nom.length < 2 || nom.length > 50) newErrors.nombres = 'Entre 2 y 50 caracteres';

    const ape = formData.apellidos.trim();
    if (!ape) newErrors.apellidos = 'Los apellidos son requeridos';
    else if (ape.length < 2 || ape.length > 50) newErrors.apellidos = 'Entre 2 y 50 caracteres';

    const doc = formData.nroDocumento.trim().toUpperCase();
    if (!doc) newErrors.nroDocumento = 'El número de documento es requerido';
    else if (!config.validateDoc(formData.tipoDocumento, doc))
      newErrors.nroDocumento = config.docErrorMsg(formData.tipoDocumento, config.documentos);

    if (!formData.telefono) newErrors.telefono = 'El teléfono es requerido';
    else if (formData.telefono.replace(/\D/g, '').length !== config.telefonoDigitos)
      newErrors.telefono = `Teléfono inválido (${config.telefonoDigitos} dígitos)`;

    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }
    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        tipoDocumento: formData.tipoDocumento,
        nroDocumento: formData.nroDocumento.toUpperCase().trim(),
        telefono: `${config.telefonoPrefijo}${formData.telefono}`,
        pais: config.pais,
      };

      const res = await axiosInstance.post(config.endpoint, payload);
      const data = res.data;

      if (data?.success) {
        toast.success('¡Registro exitoso!');

        if (data.token && data.user) {
          const normalizedUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.nombres || data.user.name,
            lastName: data.user.apellidos || data.user.lastName,
            phone: data.user.telefonoCelular || data.user.phone,
            nro: data.user.nroIdentificacionCliente || data.user.nro,
            nombres: data.user.nombres,
            apellidos: data.user.apellidos,
            telefonoCelular: data.user.telefonoCelular,
            nroIdentificacionCliente: data.user.nroIdentificacionCliente,
            idClienteTipoIdentificacion: data.user.idClienteTipoIdentificacion,
            avatarId: data.user.avatarId || '1',
            profileComplete: true,
            emailVerified: true,
            clienteActivo: true,
            fromGoogle: false,
            fromEmail: true,
            codCliente: data.user.codCliente,
            regCodPais: data.user.regCodPais,
          };

          await setUser(normalizedUser, data.token);
        }

        navigate('/pickup');
      } else {
        toast.error(data?.message || 'Error en el registro');
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const docConfig = config.documentos[formData.tipoDocumento];
  const passwordIsInvalid = formData.password && !validatePassword(formData.password).isValid;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="quick-register" data-theme={actualTheme}>
      <div className="quick-register__container">
        {/* Logo */}
        <div className="quick-register__logo">
          <img src={logoImage} alt="Kraken Courier" />
        </div>

        {/* SELECT DE PAÍS */}
        <div className="quick-register__country-selector">
          <label className="quick-register__country-label">
            {isDetecting ? '🔍 Detectando tu país...' : '🌍 Tu país de registro'}
          </label>
          <select
            className="quick-register__country-select"
            value={selectedPrefix ?? ''}
            onChange={(e) => setSelectedPrefix(e.target.value)}
            disabled={isDetecting}
          >
            <option value="" disabled>-- Selecciona tu país --</option>
            {SUPPORTED_COUNTRIES.map(({ id, name, flag }) => (
              <option key={id} value={id}>
                {flag} {name}
              </option>
            ))}
          </select>

          {detectionError && (
            <p className="quick-register__country-hint">
              ⚠️ No se pudo detectar tu país. Selecciónalo manualmente.
            </p>
          )}
          {!detectionError && !isDetecting && (
            <p className="quick-register__country-hint">
              ¿Tienes VPN activa? Selecciona tu país manualmente si la detección es incorrecta.
            </p>
          )}
        </div>

        <h1 className="quick-register__title">{config.titulo}</h1>
        <p className="quick-register__subtitle">{config.subtitulo}</p>

        {/* Formulario */}
        {selectedPrefix && !isDetecting ? (
          <form onSubmit={handleSubmit} className="quick-register__form">
            {/* Email */}
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label>Contraseña *</label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <IoEyeOffOutline size={18} />
                  ) : (
                    <IoEyeOutline size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
              <PasswordValidator
                password={formData.password}
                visible={showPasswordValidator}
              />
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <div className="password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <IoEyeOffOutline size={18} />
                  ) : (
                    <IoEyeOutline size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Juan"
                maxLength={50}
                className={errors.nombres ? 'error' : ''}
              />
              {errors.nombres && (
                <span className="error-text">{errors.nombres}</span>
              )}
            </div>

            {/* Apellidos */}
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="García López"
                maxLength={50}
                className={errors.apellidos ? 'error' : ''}
              />
              {errors.apellidos && (
                <span className="error-text">{errors.apellidos}</span>
              )}
            </div>

            {/* Tipo de Documento */}
            <div className="form-group">
              <label>Tipo de Documento *</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
              >
                {config.tiposDocumento.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Número de Documento */}
            <div className="form-group">
              <label>Número de Documento *</label>
              <input
                type="text"
                name="nroDocumento"
                value={formData.nroDocumento}
                onChange={handleChange}
                placeholder={docConfig?.placeholder}
                maxLength={docConfig?.maxLength}
                className={errors.nroDocumento ? 'error' : ''}
              />
              <span className="field-hint">{docConfig?.hint}</span>
              {errors.nroDocumento && (
                <span className="error-text">{errors.nroDocumento}</span>
              )}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label>Teléfono *</label>
              <div className="phone-input">
                <span className="phone-prefix">{config.telefonoPrefijo}</span>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder={config.telefonoPlaceholder}
                  maxLength={config.telefonoDigitos}
                  inputMode="numeric"
                  className={errors.telefono ? 'error' : ''}
                />
              </div>
              <span className="field-hint">{config.telefonoHint}</span>
              {errors.telefono && (
                <span className="error-text">{errors.telefono}</span>
              )}
            </div>

            {/* Términos */}
            <div className="form-group checkbox full-width">
              <label>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <span>
                  Acepto los{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Términos y Condiciones
                  </a>
                  {' '}y la{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidad
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="error-text">{errors.acceptTerms}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="quick-register__submit"
              disabled={isLoading || passwordIsInvalid}
            >
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        ) : (
          <div className="quick-register__detecting">
            <div className="quick-register__spinner" />
            <p>Detectando tu ubicación...</p>
          </div>
        )}

        <div className="quick-register__login">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')}>Inicia sesión</button>
        </div>
      </div>
    </div>
  );
};

export default QuickRegister;