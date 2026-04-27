// src/pages/auth/PersonalData/PersonalData.jsx
// VERSIÓN FUNCIONAL - Adaptada a tu estructura actual

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import axiosInstance from '../../../services/axiosInstance';
import './PersonalData.styles.scss';
import SearchableSelect from '../../../components/common/SearchableSelect/SearchableSelect'
import logoImage from '../../../assets/images/logo.jpg';

import { countryConfig, getCountryConfig } from '../../../config/countryConfig';

// Componente toggle para cambio de tema
const ThemeToggle = () => {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${actualTheme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {actualTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

const PersonalData = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [documentTypeDB, setDocumentTypeDB] = useState([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    residenceCountry: '', // Nuevo campo
    documentType: '',
    documentNumber: '',
    countryCode: '',
    countryIso2: '',
    countryName: '',
    phone: '',
    phoneOperator: '',
    venezuelanPhone: '',
    venezuelanOperator: ''
  });

  const [errors, setErrors] = useState({});

  // ===== CONFIGURACIONES =====

  // Validaciones de documentos
  const documentValidations = {
    cedula: {
      pattern: /^[0-9]+$/,
      minLength: 4,
      maxLength: 9,
      description: "Solo números (0-9), entre 4 y 9 dígitos"
    },
    pasaporte: {
      pattern: /^[A-Za-z0-9]+$/,
      minLength: 6,
      maxLength: 12,
      description: "Letras y números, entre 6 y 12 caracteres"
    },
    rif: {
      pattern: /^[A-Za-z0-9]+$/,
      minLength: 6,
      maxLength: 12,
      description: "Letras y números, entre 6 y 12 caracteres"
    },
    otro: {
      pattern: /^[A-Za-z0-9]+$/,
      minLength: 4,
      maxLength: 20,
      description: "Letras y números, entre 4 y 20 caracteres"
    }
  };

  // Formatos de teléfono por país
  const phoneFormats = {
    "+58": { mask: "###-##-##", length: 7, name: "Venezuela" },
    "+1": { mask: "(###) ###-####", length: 10, name: "Estados Unidos" },
    "+86": { mask: "(###) ####-####", length: 11, name: "China" },
    "+55": { mask: "(##) #####-####", length: 11, name: "Brasil" },
    "+54": { mask: "(##) ####-####", length: 10, name: "Argentina" },
    "+52": { mask: "(###) ###-####", length: 10, name: "México" },
    "+57": { mask: "(###) ###-####", length: 10, name: "Colombia" },
    "+56": { mask: "(##) ####-####", length: 9, name: "Chile" },
    "+51": { mask: "(###) ###-####", length: 9, name: "Perú" },
    "+593": { mask: "(##) ####-####", length: 9, name: "Ecuador" },
    "+591": { mask: "(###) ###-####", length: 8, name: "Bolivia" },
    "+595": { mask: "(###) ###-####", length: 8, name: "Paraguay" },
    "+598": { mask: "(###) ###-####", length: 8, name: "Uruguay" },
    "+502": { mask: "####-####", length: 8, name: "Guatemala" },
    "+53": { mask: "(##) ####-####", length: 8, name: "Cuba" },
    "+504": { mask: "####-####", length: 8, name: "Honduras" },
    "+503": { mask: "####-####", length: 8, name: "El Salvador" },
    "+505": { mask: "####-####", length: 8, name: "Nicaragua" },
    "+506": { mask: "####-####", length: 8, name: "Costa Rica" },
    "+507": { mask: "####-####", length: 8, name: "Panamá" },
    "+501": { mask: "####-####", length: 7, name: "Belice" },
    "+34": { mask: "(###) ###-###", length: 9, name: "España" },
    "+351": { mask: "(###) ###-###", length: 9, name: "Portugal" },
    "+39": { mask: "(###) ####-###", length: 10, name: "Italia" },
    "+49": { mask: "(###) ###-####", length: 10, name: "Alemania" },
    "+61": { mask: "(###) ###-###", length: 9, name: "Australia" },
    "+31": { mask: "(##) ####-####", length: 9, name: "Países Bajos" },
    "+297": { mask: "###-####", length: 7, name: "Aruba" },
    "+599": { mask: "(###) ###-####", length: 9, name: "Curazao" }
  };

  // Operadores venezolanos
  const venezuelanOperators = [
    { label: "(0412)", value: "(0412)" },
    { label: "(0422)", value: "(0422)" },
    { label: "(0414)", value: "(0414)" },
    { label: "(0424)", value: "(0424)" },
    { label: "(0416)", value: "(0416)" },
    { label: "(0426)", value: "(0426)" },
  ];

  // ===== FUNCIONES DE CARGA DE DATOS =====

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Cargar países (códigos de teléfono)
        const addressRes = await axiosInstance.get('/Addresses/countries');
        // console.log('📍 Countries response:', addressRes.data);

        if (addressRes.data.success) {
          const phoneCodes = addressRes.data.data
            .filter(item => item.iso2 === 'VE' || item.iso2 === 'US')
            .map((item) => ({
              label: `+${item.phoneCode} (${item.name})`,
              value: `+${item.phoneCode}`,
              iso2: item.iso2,
              name: item.name
            }));

          // Venezuela primero, luego el resto
          const sortedPhoneCodes = phoneCodes.sort((a, b) => {
            if (a.iso2 === 'VE') return -1;
            if (b.iso2 === 'VE') return 1;
            return a.label.localeCompare(b.label);
          });

          setCountryOptions(sortedPhoneCodes);
        }

        // Cargar tipos de documento
        const docTypesRes = await axiosInstance.get('/Addresses/document-types');
        // console.log('📄 Document types response:', docTypesRes.data);

        if (docTypesRes.data.success) {
          setDocumentTypeDB(docTypesRes.data.data);
        }
      } catch (error) {
        console.error("❌ Error al cargar datos iniciales:", error);
        setErrors({ submit: 'Error al cargar datos iniciales. Verifica tu conexión.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ===== FUNCIONES DE VALIDACIÓN =====

  const validateDocument = (type, value) => {
    if (!type || !value) return { isValid: false, message: "" };

    let validation = documentValidations[type];

    // Check config validations override
    const config = getCountryConfig(formData.residenceCountry);
    const docConfig = config.documentTypes?.find(d => d.value === type);
    if (docConfig && docConfig.validation) {
      validation = docConfig.validation;
    }

    if (!validation) return { isValid: false, message: "Tipo de documento no válido" };

    const { pattern, minLength, maxLength } = validation;

    if (!pattern.test(value)) {
      return {
        isValid: false,
        message: "Contiene caracteres no permitidos. " + validation.description
      };
    }

    if (value.length < minLength) {
      return {
        isValid: false,
        message: `Debe tener al menos ${minLength} caracteres`
      };
    }

    if (value.length > maxLength) {
      return {
        isValid: false,
        message: `No puede tener más de ${maxLength} caracteres`
      };
    }

    return { isValid: true, message: "" };
  };

  const isPhoneComplete = () => {
    if (!formData.phone || !formData.countryCode) return false;
    const format = phoneFormats[formData.countryCode];
    if (!format) return formData.phone.length >= 7;
    return formData.phone.replace(/\D/g, "").length === format.length;
  };

  const isVenezuelanPhoneValid = () => {
    // VE: no necesita teléfono secundario
    if (formData.residenceCountry === 'VE') return true;

    // US: teléfono venezolano obligatorio
    return !!(
      formData.venezuelanOperator &&
      formData.venezuelanPhone &&
      formData.venezuelanPhone.replace(/\D/g, "").length === 7
    );
  };

  const isFormComplete = () => {
    const documentValidation = validateDocument(
      formData.documentType,
      formData.documentNumber
    );

    return formData.residenceCountry && // Ensure residence country is selected
      formData.documentType &&
      formData.documentNumber &&
      documentValidation.isValid &&
      formData.countryCode &&
      isPhoneComplete() &&
      (formData.countryCode !== "+58" || formData.phoneOperator) &&
      isVenezuelanPhoneValid();
  };

  // ===== FUNCIONES DE FORMATO =====

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

  // ===== HANDLERS =====

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleResidenceChange = (value) => {
    const phoneCodeMap = { VE: '+58', US: '+1' };
    setFormData(prev => ({
      ...prev,
      residenceCountry: value,
      countryCode: phoneCodeMap[value] || '',
      documentType: '',
      documentNumber: '',
      phone: '',
      phoneOperator: '',
      venezuelanPhone: '',
      venezuelanOperator: ''
    }));
    setErrors(prev => ({ ...prev, documentNumber: '' }));
  };

  const handleDocumentTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      documentType: value,
      documentNumber: ''
    }));
    setErrors(prev => ({ ...prev, documentNumber: '' }));
  };

  const handleDocumentNumberChange = (text) => {
    if (!formData.documentType) {
      return;
    }

    let validation = documentValidations[formData.documentType];

    // Check config validations override
    const config = getCountryConfig(formData.residenceCountry);
    const docConfig = config.documentTypes?.find(d => d.value === formData.documentType);
    if (docConfig && docConfig.validation) {
      validation = docConfig.validation;
    }

    if (!validation) return;

    let cleaned = '';

    // Config types default cleaning (Alphanumeric) or retain switch for existing types
    if (docConfig) {
      cleaned = text.replace(/[^A-Za-z0-9]/g, '');
    } else {
      switch (formData.documentType) {
        case 'cedula':
          cleaned = text.replace(/[^0-9]/g, '');
          break;
        case 'pasaporte':
        case 'rif':
        case 'otro':
          cleaned = text.replace(/[^A-Za-z0-9]/g, '');
          break;
        default:
          cleaned = text;
      }
    }

    const limited = cleaned.slice(0, validation.maxLength);
    handleInputChange('documentNumber', limited);
  };

  const handleCountryChange = (value) => {
    const country = countryOptions.find(c => c.value === value);

    setFormData(prev => ({
      ...prev,
      countryCode: value,
      countryIso2: country?.iso2 || '',
      countryName: country?.name || '',
      phone: '',
      phoneOperator: '',
      venezuelanPhone: '',
      venezuelanOperator: ''
    }));
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhone(text);
    handleInputChange('phone', formatted);
  };

  const handleVenezuelanPhoneChange = (text) => {
    const formatted = formatVenezuelanPhone(text);
    handleInputChange('venezuelanPhone', formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const documentValidation = validateDocument(
      formData.documentType,
      formData.documentNumber
    );

    if (!documentValidation.isValid) {
      setErrors({ submit: `Error en documento: ${documentValidation.message}` });
      return;
    }

    if (!isFormComplete()) {
      setErrors({ submit: 'Por favor, complete todos los campos requeridos' });
      return;
    }

    setIsSaving(true);

    try {
      const config = getCountryConfig(formData.residenceCountry);
      const clientPrefix = config.prefix || 'KV';

      const submitData = {
        clientPrefix,
        residenceCountry: formData.residenceCountry,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        countryCode: formData.countryCode,
        countryIso2: formData.countryIso2,
        phone: formData.phone,
        ...(formData.countryCode === "+58" && { phoneOperator: formData.phoneOperator }),
        ...(formData.countryCode !== "+58" &&
          formData.venezuelanPhone &&
          formData.venezuelanOperator && {
          venezuelanPhone: formData.venezuelanPhone,
          venezuelanOperator: formData.venezuelanOperator
        })
      };

      // console.log('📤 Enviando datos:', submitData);

      // Navegar a delivery-option con los datos
      navigate('/delivery-option', { state: submitData });
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setErrors({ submit: 'Error al guardar los datos. Intenta nuevamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ===== HELPERS PARA UI =====

  // Opciones de documentos por país de residencia
  const getDocumentOptions = () => {
    if (!formData.residenceCountry) return [];

    const config = getCountryConfig(formData.residenceCountry);

    // US: usa los tipos definidos en countryConfig
    if (formData.residenceCountry === 'US' && config.documentTypes.length > 0) {
      return config.documentTypes;
    }

    // VE y otros: filtra por countryCode desde la BD
    return documentTypeDB
      .filter(item => item.countryCode === formData.residenceCountry)
      .sort((a, b) => {
        if (a.displayName.toLowerCase() === 'cédula') return -1;
        if (b.displayName.toLowerCase() === 'cédula') return 1;
        return 0;
      })
      .map(item => ({
        label: item.displayName,
        value: item.displayName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/'/g, '')
          .replace(/ /g, '')
      }));
  };

  const documentOptions = getDocumentOptions();

  const getDocumentPlaceholder = () => {
    if (!formData.documentType) return "Seleccione tipo de documento primero";

    // Check config validations first
    const config = getCountryConfig(formData.residenceCountry);
    const docConfig = config.documentTypes?.find(d => d.value === formData.documentType);
    if (docConfig && docConfig.validation) {
      return docConfig.validation.description || "Número de documento";
    }

    const validation = documentValidations[formData.documentType];
    if (!validation) return "Número de documento";

    switch (formData.documentType) {
      case 'cedula':
        return "Ej: 12345678";
      case 'pasaporte':
        return "Ej: A1234567";
      case 'rif':
        return "Ej: J123456789";
      case 'otro':
        return "Documento de identidad";
      default:
        return "Número de documento";
    }
  };

  const getPhonePlaceholder = () => {
    const format = phoneFormats[formData.countryCode];
    if (!format) return "Celular";
    return `Celular ${format.mask}`;
  };

  const getPhoneErrorMessage = () => {
    const format = phoneFormats[formData.countryCode];
    if (!format) return "Ingrese un número válido";
    return `Ingrese un número completo ${format.mask}`;
  };

  const currentDocumentValidation = validateDocument(
    formData.documentType,
    formData.documentNumber
  );

  // ===== RENDER =====

  useEffect(() => {
    const container = document.querySelector('.kraken-personal-data');
    if (container) {
      container.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  if (isLoading) {
    return (
      <div className="kraken-personal-data" data-theme={actualTheme}>
        <div className="kraken-personal-data__loading">
          <div className="kraken-personal-data__spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kraken-personal-data" data-theme={actualTheme}>
      {/* <ThemeToggle /> */}

      {/* Logo */}
      <div className="kraken-personal-data__logo">
        <a
          href="https://krakencourier.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={logoImage}
            alt="Kraken Logo"
            className="kraken-personal-data__logo-image"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
            }}
          />
        </a>
      </div>

      {/* Contenido principal */}
      <div className="kraken-personal-data__content">
        <h1 className="kraken-personal-data__title">Datos personales</h1>

        <form onSubmit={handleSubmit} className="kraken-personal-data__form">
          {/* País de Residencia */}
          <div className="kraken-form-field">
            <label className="kraken-form-field__label">País de Residencia</label>
            <SearchableSelect
              options={[
                { label: 'Venezuela', value: 'VE' },
                { label: 'Estados Unidos', value: 'US' }
              ]}
              value={formData.residenceCountry}
              onChange={handleResidenceChange}
              placeholder="Seleccione país de residencia"
            />
          </div>

          {/* Tipo de documento */}
          <div className="kraken-form-field">
            <label className="kraken-form-field__label">Tipo de documento</label>
            <select
              className="kraken-form-field__select"
              value={formData.documentType}
              onChange={(e) => handleDocumentTypeChange(e.target.value)}
              required
            >
              <option value="">Seleccione</option>
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
              className={`kraken-form-field__input ${formData.documentNumber && !currentDocumentValidation.isValid
                ? 'kraken-form-field__input--error'
                : ''
                }`}
              placeholder={getDocumentPlaceholder()}
              value={formData.documentNumber}
              onChange={(e) => handleDocumentNumberChange(e.target.value)}
              disabled={!formData.documentType}
              required
            />

            {formData.documentNumber && !currentDocumentValidation.isValid && (
              <p className="kraken-form-field__error">
                {currentDocumentValidation.message}
              </p>
            )}

            {formData.documentType && !formData.documentNumber && (
              <p className="kraken-form-field__helper">
                {documentValidations[formData.documentType]?.description}
              </p>
            )}
          </div>

          {/* Teléfono principal — VE: con operador, US: formato americano */}
          {formData.residenceCountry === 'VE' ? (
            <div className="kraken-form-field__row">
              <div className="kraken-form-field kraken-form-field--60">
                <label className="kraken-form-field__label">Número de Celular</label>
                <input
                  type="tel"
                  className="kraken-form-field__input"
                  placeholder={getPhonePlaceholder()}
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
                {formData.phone && !isPhoneComplete() && (
                  <p className="kraken-form-field__error">{getPhoneErrorMessage()}</p>
                )}
              </div>
              <div className="kraken-form-field kraken-form-field--38">
                <label className="kraken-form-field__label">Operador</label>
                <select
                  className="kraken-form-field__select"
                  value={formData.phoneOperator}
                  onChange={(e) => handleInputChange('phoneOperator', e.target.value)}
                  required
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
          ) : formData.residenceCountry === 'US' ? (
            <>
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Número de Celular (EE.UU.)</label>
                <input
                  type="tel"
                  className="kraken-form-field__input"
                  placeholder={getPhonePlaceholder()}
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
                {formData.phone && !isPhoneComplete() && (
                  <p className="kraken-form-field__error">{getPhoneErrorMessage()}</p>
                )}
              </div>

              {/* Teléfono venezolano — obligatorio para usuarios de EE.UU. */}
              <div className="kraken-form-field">
                <label className="kraken-form-field__label kraken-form-field__label--additional">
                  Número venezolano
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
                    required
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
                  placeholder="###-##-##"
                  value={formData.venezuelanPhone}
                  onChange={(e) => handleVenezuelanPhoneChange(e.target.value)}
                  required
                />
                {formData.venezuelanPhone &&
                  formData.venezuelanPhone.replace(/\D/g, "").length > 0 &&
                  formData.venezuelanPhone.replace(/\D/g, "").length < 7 && (
                    <p className="kraken-form-field__error">
                      Ingrese un número venezolano completo ###-##-##
                    </p>
                  )}
                {formData.venezuelanOperator && !formData.venezuelanPhone && (
                  <p className="kraken-form-field__error">
                    Ingrese el número venezolano
                  </p>
                )}
                {formData.venezuelanPhone &&
                  formData.venezuelanPhone.replace(/\D/g, "").length === 7 &&
                  !formData.venezuelanOperator && (
                    <p className="kraken-form-field__error">
                      Seleccione un operador
                    </p>
                  )}
              </div>
            </>
          ) : null}

          {/* Error general */}
          {errors.submit && (
            <div className="kraken-form-field__error-general">
              {errors.submit}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className={`kraken-personal-data__submit-button ${isFormComplete() ? 'active' : 'inactive'
              }`}
            disabled={!isFormComplete() || isSaving}
          >
            {isSaving ? (
              <div className="kraken-personal-data__loading-inline">
                <div className="kraken-personal-data__spinner-small"></div>
                Guardando...
              </div>
            ) : (
              'Finalizar Registro'
            )}
          </button>

          {/* Términos y condiciones */}
          <div className="kraken-personal-data__terms">
            <p>
              Al continuar, aceptas nuestros{' '}
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
