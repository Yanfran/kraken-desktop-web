// src/pages/auth/PersonalData/PersonalData.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import { useTheme } from '../../../contexts/ThemeContext';
import './PersonalData.styles.scss';


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

const PersonalData = () => {
  const navigate = useNavigate();
  const { colors, actualTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    countryCode: '',
    countryName: '',
    phone: '',
    phoneOperator: '',
    venezuelanPhone: '',
    venezuelanOperator: ''
  });

  const [errors, setErrors] = useState({});

  // Opciones de documento
  const documentOptions = [
    { label: "Cédula", value: "cedula" },
    { label: "Pasaporte", value: "pasaporte" }
  ];

  // Códigos de país con formato de teléfono
  const phoneFormats = {
    "+1": { mask: "(###) ###-####", length: 10, name: "Estados Unidos" },
    "+58": { mask: "(####) ###-####", length: 11, name: "Venezuela" },
    "+34": { mask: "(###) ###-###", length: 9, name: "España" },
    "+57": { mask: "(###) ###-####", length: 10, name: "Colombia" },
    "+507": { mask: "(###) ####-####", length: 8, name: "Panamá" },
    "+593": { mask: "(##) ####-####", length: 9, name: "Ecuador" },
    "+51": { mask: "(###) ###-###", length: 9, name: "Perú" },
    "+54": { mask: "(##) ####-####", length: 10, name: "Argentina" },
    "+56": { mask: "(#) ####-####", length: 9, name: "Chile" },
    "+55": { mask: "(##) #####-####", length: 11, name: "Brasil" }
  };

  // Operadores venezolanos
  const venezuelanOperators = [
    { label: "(0412)", value: "(0412)" },
    { label: "(0414)", value: "(0414)" },
    { label: "(0416)", value: "(0416)" },
    { label: "(0424)", value: "(0424)" },
    { label: "(0426)", value: "(0426)" }
  ];

  // Función para formatear teléfono según el país
  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const format = phoneFormats[formData.countryCode];
    
    if (!format) return cleaned;
    
    const { mask, length } = format;
    const limitedCleaned = cleaned.slice(0, length);
    
    let formatted = "";
    let cleanedIndex = 0;
    
    for (let i = 0; i < mask.length && cleanedIndex < limitedCleaned.length; i++) {
      if (mask[i] === "#") {
        formatted += limitedCleaned[cleanedIndex];
        cleanedIndex++;
      } else {
        formatted += mask[i];
      }
    }
    
    return formatted;
  };

  // Función para formatear teléfono venezolano
  const formatVenezuelanPhone = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const limitedCleaned = cleaned.slice(0, 7);
    
    let formatted = "";
    let cleanedIndex = 0;
    const mask = "###-##-##";
    
    for (let i = 0; i < mask.length && cleanedIndex < limitedCleaned.length; i++) {
      if (mask[i] === "#") {
        formatted += limitedCleaned[cleanedIndex];
        cleanedIndex++;
      } else {
        formatted += mask[i];
      }
    }
    
    return formatted;
  };

  // Validar documento
  const validateDocument = () => {
    if (!formData.documentType || !formData.documentNumber) return false;
    
    if (formData.documentType === 'cedula') {
      const cleaned = formData.documentNumber.replace(/\D/g, '');
      return cleaned.length >= 6 && cleaned.length <= 12;
    }
    
    if (formData.documentType === 'pasaporte') {
      return formData.documentNumber.length >= 6 && formData.documentNumber.length <= 12;
    }
    
    return false;
  };

  // Validar teléfono
  const isPhoneComplete = () => {
    if (!formData.phone || !formData.countryCode) return false;
    const format = phoneFormats[formData.countryCode];
    if (!format) return formData.phone.length >= 7;
    return formData.phone.replace(/\D/g, "").length === format.length;
  };

  // Validar teléfono venezolano
  const isVenezuelanPhoneValid = () => {
    if (formData.countryCode === "+58") return true;
    
    if (!formData.venezuelanPhone && !formData.venezuelanOperator) return true;
    
    if (formData.venezuelanPhone || formData.venezuelanOperator) {
      return formData.venezuelanOperator && formData.venezuelanPhone.replace(/\D/g, "").length === 7;
    }
    
    return true;
  };

  // Validar formulario completo
  const isFormComplete = () => {
    return validateDocument() &&
           formData.countryCode &&
           isPhoneComplete() &&
           (formData.countryCode !== "+58" || formData.phoneOperator) &&
           isVenezuelanPhoneValid();
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar cambio de país
  const handleCountryChange = (countryCode) => {
    const countryName = phoneFormats[countryCode]?.name || '';
    setFormData(prev => ({
      ...prev,
      countryCode,
      countryName,
      phone: '',
      phoneOperator: ''
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormComplete()) {
      setErrors({ submit: 'Por favor, complete todos los campos requeridos' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir al dashboard o siguiente paso
      navigate('/delivery-option');
    } catch (error) {
      setErrors({ submit: 'Error al guardar los datos. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener placeholder del documento
  const getDocumentPlaceholder = () => {
    if (formData.documentType === 'cedula') {
      return 'Ej: A1234567';
    }
    if (formData.documentType === 'pasaporte') {
      return 'Ej: A1234567';
    }
    return 'Seleccione un tipo primero';
  };

  // Obtener placeholder del teléfono
  const getPhonePlaceholder = () => {
    const format = phoneFormats[formData.countryCode];
    if (!format) return "Celular";
    return `Celular ${format.mask}`;
  };

  // Aplicar tema al contenedor
  useEffect(() => {
    const container = document.querySelector('.kraken-personal-data');
    if (container) {
      container.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="kraken-personal-data" data-theme={actualTheme}>        
      {/* Toggle de tema */}
      <ThemeToggle />


      {/* Logo */}
      <div className="kraken-personal-data__logo">
        <img
          src="/src/assets/images/logo.jpg"
          alt="Kraken Logo"
          className="kraken-personal-data__logo-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className="kraken-personal-data__content">
        <h1 className="kraken-personal-data__title">Datos personales</h1>

        <form onSubmit={handleSubmit} className="kraken-personal-data__form">
          {/* Tipo de documento */}
          <div className="kraken-form-field">
            <label className="kraken-form-field__label">Tipo de documento</label>
            <select
              className="kraken-form-field__select"
              value={formData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              required
            >
              <option value="">Pasaporte</option>
              {documentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Número de documento */}
          <div className="kraken-form-field">
            <label className="kraken-form-field__label">Número de documento</label>
            <input
              type="text"
              className={`kraken-form-field__input ${
                formData.documentNumber && !validateDocument() ? 'kraken-form-field__input--error' : ''
              }`}
              placeholder={getDocumentPlaceholder()}
              value={formData.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              required
            />
            <p className="kraken-form-field__helper">Letras y números, entre 6 y 12 caracteres</p>
          </div>

          {/* Código de País */}
          <div className="kraken-form-field">
            <label className="kraken-form-field__label">Código de País</label>
            <select
              className="kraken-form-field__select"
              value={formData.countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              required
            >
              <option value="">+1 (Estados Unidos)</option>
              {Object.entries(phoneFormats).map(([code, format]) => (
                <option key={code} value={code}>
                  {code} ({format.name})
                </option>
              ))}
            </select>
          </div>

          {/* Número de Celular */}
          <div className="kraken-form-field">
            <label className="kraken-form-field__label">Número de Celular</label>
            <input
              type="tel"
              className="kraken-form-field__input"
              placeholder={getPhonePlaceholder()}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
              required
            />
            {formData.countryCode && formData.phone && !isPhoneComplete() && (
              <p className="kraken-form-field__error">
                Ingrese un número completo según el formato {phoneFormats[formData.countryCode]?.mask}
              </p>
            )}
          </div>

          {/* Sección venezolana adicional si no es +58 */}
          {formData.countryCode && formData.countryCode !== "+58" && (
            <>
              <div className="kraken-form-field">
                <label className="kraken-form-field__label kraken-form-field__label--additional">
                  Número venezolano adicional (opcional)
                </label>
              </div>

              <div className="kraken-form-field__row">
                <div className="kraken-form-field kraken-form-field--half">
                  <div className="kraken-form-field__fixed-country">
                    +58 (Venezuela)
                  </div>
                </div>

                <div className="kraken-form-field kraken-form-field--half">
                  <select
                    className="kraken-form-field__select"
                    value={formData.venezuelanOperator}
                    onChange={(e) => handleInputChange('venezuelanOperator', e.target.value)}
                  >
                    <option value="">Operador</option>
                    {venezuelanOperators.map((operator) => (
                      <option key={operator.value} value={operator.value}>
                        {operator.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Celular Venezolano</label>
                <input
                  type="tel"
                  className="kraken-form-field__input"
                  placeholder="Celular venezolano ###-##-## (opcional)"
                  value={formData.venezuelanPhone}
                  onChange={(e) => handleInputChange('venezuelanPhone', formatVenezuelanPhone(e.target.value))}
                />
                {formData.venezuelanPhone && !isVenezuelanPhoneValid() && (
                  <p className="kraken-form-field__error">
                    Debe completar tanto el operador como el número
                  </p>
                )}
              </div>
            </>
          )}

          {/* Error general */}
          {errors.submit && (
            <div className="kraken-form-field__error-general">
              {errors.submit}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className={`kraken-personal-data__submit-button ${isFormComplete() ? 'active' : 'inactive'}`}
            disabled={!isFormComplete() || isLoading}
          >
            {isLoading ? (
              <div className="kraken-personal-data__loading">
                <div className="kraken-personal-data__spinner"></div>
                Guardando...
              </div>
            ) : (
              'Finalizar Registro'
            )}
          </button>

          {/* Términos y condiciones */}
          <div className="kraken-personal-data__terms">
            <p>
              Al iniciar sesión, aceptas nuestros{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Términos y Condiciones
              </a>{' '}
              y nuestra{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Política de Privacidad
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalData;