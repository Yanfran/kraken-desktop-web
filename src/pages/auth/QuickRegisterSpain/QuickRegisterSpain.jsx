// src/pages/auth/QuickRegisterSpain/QuickRegisterSpain.jsx
// ✅ REGISTRO RÁPIDO PARA ESPAÑA

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import './QuickRegisterSpain.styles.scss';
import PasswordValidator, { validatePassword } from '../../../components/auth/PasswordValidator/PasswordValidator';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import logoImage from '../../../assets/images/logo.jpg';
import axiosInstance from '../../../services/axiosInstance';

// ── Configuración de documentos españoles ───────────────────────────────────
const DOCUMENT_CONFIG = {
  dni:       { maxLength: 9,  placeholder: '12345678A',    hint: '8 dígitos + letra' },
  nie:       { maxLength: 9,  placeholder: 'X1234567A',    hint: 'X/Y/Z + 7 dígitos + letra' },
  pasaporte: { maxLength: 15, placeholder: 'Nro. pasaporte', hint: '6-15 caracteres alfanuméricos' },
};

const QuickRegisterSpain = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // ── Visibilidad de contraseñas ───────────────────────────────────────────
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);

  // ── Estado del formulario ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email:           '',
    password:        '',
    confirmPassword: '',
    nombres:         '',
    apellidos:       '',
    tipoDocumento:   'dni',
    nroDocumento:    '',
    telefono:        '',
    acceptTerms:     false,
  });

  const [errors, setErrors] = useState({});

  // ── Validaciones de documento ────────────────────────────────────────────
  const validateDNI  = (v) => /^[0-9]{8}[A-Z]$/i.test(v);
  const validateNIE  = (v) => /^[XYZ][0-9]{7}[A-Z]$/i.test(v);

  // ── Handler genérico de cambios ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let sanitized = type === 'checkbox' ? checked : value;

    // 🔒 Teléfono: solo dígitos
    if (name === 'telefono') {
      sanitized = value.replace(/\D/g, '').slice(0, 9);
    }

    // 🔒 Documento: limpiar según tipo + maxLength
    if (name === 'nroDocumento') {
      const max = DOCUMENT_CONFIG[formData.tipoDocumento]?.maxLength ?? 15;
      sanitized = value.replace(/[^A-Za-z0-9]/g, '').slice(0, max).toUpperCase();
    }

    // 🔒 Al cambiar tipo de documento, resetear el campo
    if (name === 'tipoDocumento') {
      setFormData(prev => ({ ...prev, tipoDocumento: value, nroDocumento: '' }));
      setErrors(prev => ({ ...prev, nroDocumento: '', tipoDocumento: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));

    // Limpiar error del campo
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    // Mostrar/ocultar validador de contraseña
    if (name === 'password') {
      setShowPasswordValidator(value.length > 0);
      if (value.length > 0 && validatePassword(value).isValid && errors.password) {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };

  // ── Validación completa del formulario ───────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const pv = validatePassword(formData.password);
      if (!pv.isValid) newErrors.password = pv.errors[0];
    }

    // Confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Nombre
    const nom = formData.nombres.trim();
    if (!nom) {
      newErrors.nombres = 'El nombre es requerido';
    } else if (nom.length < 2 || nom.length > 50) {
      newErrors.nombres = 'El nombre debe tener entre 2 y 50 caracteres';
    }

    // Apellidos
    const ape = formData.apellidos.trim();
    if (!ape) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (ape.length < 2 || ape.length > 50) {
      newErrors.apellidos = 'Los apellidos deben tener entre 2 y 50 caracteres';
    }

    // Documento
    const doc = formData.nroDocumento.trim().toUpperCase();
    if (!doc) {
      newErrors.nroDocumento = 'El número de documento es requerido';
    } else if (formData.tipoDocumento === 'dni' && !validateDNI(doc)) {
      newErrors.nroDocumento = `DNI inválido — ${DOCUMENT_CONFIG.dni.hint}`;
    } else if (formData.tipoDocumento === 'nie' && !validateNIE(doc)) {
      newErrors.nroDocumento = `NIE inválido — ${DOCUMENT_CONFIG.nie.hint}`;
    } else if (formData.tipoDocumento === 'pasaporte' && (doc.length < 6 || doc.length > 15)) {
      newErrors.nroDocumento = `Pasaporte inválido — ${DOCUMENT_CONFIG.pasaporte.hint}`;
    }

    // Teléfono
    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9]{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono español inválido (9 dígitos)';
    }

    // Términos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email:          formData.email.toLowerCase().trim(),
        password:       formData.password,
        nombres:        formData.nombres.trim(),
        apellidos:      formData.apellidos.trim(),
        tipoDocumento:  formData.tipoDocumento,
        nroDocumento:   formData.nroDocumento.toUpperCase().trim(),
        telefono:       `+34${formData.telefono}`,
        pais:           'ES',
      };

      const res = await axiosInstance.post('/spain/register', payload);
      const data = res?.data;

      if (data?.success) {
        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
        navigate('/login');
      } else {
        toast.error(data?.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const docConfig = DOCUMENT_CONFIG[formData.tipoDocumento];
  const passwordIsInvalid = formData.password && !validatePassword(formData.password).isValid;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="quick-register-spain" data-theme={actualTheme}>
      <div className="quick-register-spain__container">

        <div className="quick-register-spain__logo">
          <img src={logoImage} alt="Kraken Courier" />
        </div>

        <h1 className="quick-register-spain__title">Registro Rápido 🇪🇸</h1>
        <p className="quick-register-spain__subtitle">Crea tu cuenta en Kraken España</p>

        <form onSubmit={handleSubmit} className="quick-register-spain__form">

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
                onClick={() => setShowPassword(p => !p)}
                tabIndex="-1"
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
            <PasswordValidator password={formData.password} visible={showPasswordValidator} />
          </div>

          {/* ✅ Confirmar Contraseña — ahora CON ícono de ojo */}
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
                onClick={() => setShowConfirmPassword(p => !p)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
            {errors.nombres && <span className="error-text">{errors.nombres}</span>}
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
            {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
          </div>

          {/* Tipo de Documento */}
          <div className="form-group">
            <label>Tipo de Documento *</label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
            >
              <option value="dni">DNI</option>
              <option value="nie">NIE</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </div>

          {/* ✅ Número de Documento — maxLength dinámico + solo alfanumérico */}
          <div className="form-group">
            <label>Número de Documento *</label>
            <input
              type="text"
              name="nroDocumento"
              value={formData.nroDocumento}
              onChange={handleChange}
              placeholder={docConfig.placeholder}
              maxLength={docConfig.maxLength}
              className={errors.nroDocumento ? 'error' : ''}
            />
            <span className="field-hint">{docConfig.hint}</span>
            {errors.nroDocumento && <span className="error-text">{errors.nroDocumento}</span>}
          </div>

          {/* ✅ Teléfono — solo dígitos, bloqueado por handleChange */}
          <div className="form-group">
            <label>Teléfono *</label>
            <div className="phone-input">
              <span className="phone-prefix">+34</span>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="612 345 678"
                maxLength={9}
                inputMode="numeric"
                className={errors.telefono ? 'error' : ''}
              />
            </div>
            {errors.telefono && <span className="error-text">{errors.telefono}</span>}
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
                <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
                {' '}y la{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="quick-register-spain__submit"
            disabled={isLoading || passwordIsInvalid}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="quick-register-spain__login">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')}>Inicia sesión</button>
        </div>
      </div>
    </div>
  );
};

export default QuickRegisterSpain;