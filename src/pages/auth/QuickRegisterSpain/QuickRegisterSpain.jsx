// src/pages/auth/QuickRegisterSpain/QuickRegisterSpain.jsx
// ✅ REGISTRO RÁPIDO PARA ESPAÑA

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import './QuickRegisterSpain.styles.scss';
import logoImage from '../../../assets/images/logo.jpg';

const QuickRegisterSpain = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'dni', // dni, nie, pasaporte
    nroDocumento: '',
    telefono: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});

  // Validación DNI español
  const validateDNI = (dni) => {
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    return dniRegex.test(dni.toUpperCase());
  };

  // Validación NIE español
  const validateNIE = (nie) => {
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
    return nieRegex.test(nie.toUpperCase());
  };

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    // Confirmar contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Nombre
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }

    // Apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    // Documento
    if (!formData.nroDocumento.trim()) {
      newErrors.nroDocumento = 'El número de documento es requerido';
    } else if (formData.tipoDocumento === 'dni' && !validateDNI(formData.nroDocumento)) {
      newErrors.nroDocumento = 'DNI inválido (8 dígitos + letra)';
    } else if (formData.tipoDocumento === 'nie' && !validateNIE(formData.nroDocumento)) {
      newErrors.nroDocumento = 'NIE inválido (X/Y/Z + 7 dígitos + letra)';
    }

    // Teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9]{9}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Teléfono español inválido (9 dígitos)';
    }

    // Términos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
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
        telefono: `+34${formData.telefono.replace(/\s/g, '')}`,
        pais: 'ES', // España
        // profileComplete: true (se marca en backend)
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/Auth/quick-register-spain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
        navigate('/login');
      } else {
        toast.error(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quick-register-spain" data-theme={actualTheme}>
      <div className="quick-register-spain__container">
        
        {/* Logo */}
        <div className="quick-register-spain__logo">
          <img src={logoImage} alt="Kraken Courier" />
        </div>

        {/* Título */}
        <h1 className="quick-register-spain__title">Registro Rápido 🇪🇸</h1>
        <p className="quick-register-spain__subtitle">Crea tu cuenta en Kraken España</p>

        {/* Formulario */}
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
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label>Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              className={errors.confirmPassword ? 'error' : ''}
            />
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

          {/* Número de Documento */}
          <div className="form-group">
            <label>Número de Documento *</label>
            <input
              type="text"
              name="nroDocumento"
              value={formData.nroDocumento}
              onChange={handleChange}
              placeholder={
                formData.tipoDocumento === 'dni' ? '12345678A' :
                formData.tipoDocumento === 'nie' ? 'X1234567A' :
                'Número de pasaporte'
              }
              className={errors.nroDocumento ? 'error' : ''}
            />
            {errors.nroDocumento && <span className="error-text">{errors.nroDocumento}</span>}
          </div>

          {/* Teléfono */}
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
                maxLength="9"
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
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </a>
                {' '}y la{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </a>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            className="quick-register-spain__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Link Login */}
        <div className="quick-register-spain__login">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')}>
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickRegisterSpain;