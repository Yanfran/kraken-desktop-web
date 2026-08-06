// src/pages/profile/Profile/PersonalData/PersonalData.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './PersonalData.styles.scss';
import axiosInstance from '../../../../services/axiosInstance';
import { API_URL } from '../../../../utils/config';

// Icons
import {
  IoChevronBack,
  IoCallOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoCardOutline,
  IoSaveOutline,
  IoGlobeOutline
} from 'react-icons/io5';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';
import PhoneModal from './PhoneModal';
import BirthdayModal from './BirthdayModal';

const PersonalData = () => {
  const navigate = useNavigate();
  const { user, updateProfile: updateUserContext } = useAuth();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [documentTypeDB, setDocumentTypeDB] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    phoneSecondary: '',
    residenceCountry: '',
    idType: '',
    idNumber: '',
    birthday: ''
  });

  const [errors, setErrors] = useState({});

  // Cargar tipos de documento desde el API
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const res = await axiosInstance.get('/Addresses/document-types');
        const docData = Array.isArray(res.data) ? res.data : (res.data?.success ? res.data.data : []);
        setDocumentTypeDB(docData);
      } catch (error) {
        console.error('Error loading document types:', error);
      }
    };
    loadDocumentTypes();
  }, []);

  // ✅ Cargar datos del usuario desde el contexto
  useEffect(() => {
    if (user) {
      // El user del contexto puede venir del servidor sin todos los campos;
      // localStorage siempre tiene los datos completos como fallback.
      const stored = (() => {
        try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
      })();

      const docId = user.idClienteTipoIdentificacion ?? stored.idClienteTipoIdentificacion;
      const countryCode = user.reg_CodPais ?? stored.reg_CodPais ?? inferCountryFromDocId(docId);
      const detectedIdType = detectDocumentType({ idClienteTipoIdentificacion: docId });

      setFormData({
        name: user.name || user.nombres || '',
        lastName: user.lastName || user.apellidos || '',
        email: user.email || '',
        phone: user.phone || user.telefonoCelular || '',
        phoneSecondary: user.phoneSecondary || user.telefonoCelularSecundario || '',
        residenceCountry: countryCode,
        idType: detectedIdType,
        idNumber: stripDocumentPrefix(
          user.idNumber || user.nroIdentificacionCliente || user.nro || '',
          detectedIdType
        ),
        birthday: user.birthday || user.fechaNacimiento ? formatDateForInput(user.birthday || user.fechaNacimiento) : ''
      });
    }
  }, [user]);

  const inferCountryFromDocId = (docId) => {
    if ([1, 2, 3, 7, 8, 9, 10].includes(docId)) return 'VE';
    if ([4, 5].includes(docId)) return 'US';
    return '';
  };

  const detectDocumentType = (userData) => {
    if (!userData) return '';
    const docId = userData.idClienteTipoIdentificacion;
    const docMap = {
      1:  'pasaporte',
      2:  'rifjuridico',
      3:  'cedulavenezolana',
      4:  'driverslicense',
      5:  'ein',
      7:  'cedulaextranjera',
      8:  'rifgubernamental',
      9:  'rifcomuna',
      10: 'riffirmapersonal',
    };
    return docMap[docId] || '';
  };

  const mapIdTypeToBackend = (idType) => {
    const typeMap = {
      'pasaporte':        1,
      'rifjuridico':      2,
      'cedulavenezolana': 3,
      'driverslicense':   4,
      'ein':              5,
      'cedulaextranjera': 7,
      'rifgubernamental': 8,
      'rifcomuna':        9,
      'riffirmapersonal': 10,
    };
    return typeMap[idType] || 3;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Seleccionar fecha';
    // Parse string directly to avoid UTC-offset shifting the day
    const str = String(dateString).split('T')[0]; // "2000-06-17"
    const parts = str.split('-');
    if (parts.length < 3) return 'Seleccionar fecha';
    return `${parts[2]}/${parts[1]}`; // "17/06"
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return 'Agregar teléfono';
    return phone;
  };

  const normalizeDocValue = (displayName) =>
    displayName
      .replace(/\s*\([^)]*\)/g, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/'/g, '')
      .replace(/\s+/g, '');

  const getDocumentPrefix = (idType) => {
    const prefixes = {
      'cedulavenezolana': 'V-',
      'cedulaextranjera': 'E-',
      'rifjuridico':      'J-',
      'rifgubernamental': 'G-',
      'rifcomuna':        'C-',
      'riffirmapersonal': 'R-',
    };
    return prefixes[idType] || '';
  };

  const stripDocumentPrefix = (value, idType) => {
    const prefix = getDocumentPrefix(idType);
    if (!prefix || !value) return value;
    const re = new RegExp(`^${prefix.replace('-', '[-]?')}`, 'i');
    return value.replace(re, '');
  };

  const getPlaceholderForType = (idType) => {
    const placeholders = {
      'cedula':           '12345678',
      'cedulavenezolana': '12345678',
      'cedulaextranjera': '12345678',
      'pasaporte':        'AB123456',
      'rifjuridico':      '12345678-9',
      'rifgubernamental': '12345678-9',
      'rifcomuna':        '12345678-9',
      'riffirmapersonal': '12345678-9',
      'driverslicense':   'Driver license number',
      'ein':              'XX-XXXXXXX',
    };
    return placeholders[idType] || 'Número de documento';
  };

  const getDocumentOptions = () => {
    if (!formData.residenceCountry) return [];
    return documentTypeDB
      .filter(item => item.countryCode === formData.residenceCountry)
      .map(item => ({
        label: item.displayName,
        value: normalizeDocValue(item.displayName)
      }));
  };

  const validateDocument = (type, number) => {
    const num = number.trim();

    switch (type) {
      case 'cedula':
      case 'cedulavenezolana':
        if (!/^\d{4,9}$/.test(num))
          return { isValid: false, message: 'Cédula debe tener entre 4-9 dígitos' };
        break;
      case 'cedulaextranjera':
        if (!/^[A-Za-z0-9]{4,12}$/.test(num))
          return { isValid: false, message: 'Cédula Extranjera debe tener entre 4-12 caracteres' };
        break;
      case 'pasaporte':
        if (num.length < 5 || num.length > 15)
          return { isValid: false, message: 'Pasaporte debe tener entre 5-15 caracteres' };
        break;
      case 'rif':
      case 'rifjuridico':
      case 'rifgubernamental':
      case 'rifcomuna':
      case 'riffirmapersonal':
        if (num.length < 6 || num.length > 12)
          return { isValid: false, message: 'RIF debe tener entre 6-12 caracteres' };
        break;
      case 'driverslicense':
      case 'otro':
        if (num.length < 5 || num.length > 20)
          return { isValid: false, message: 'Documento debe tener entre 5-20 caracteres' };
        break;
      case 'ein':
        if (!/^\d{2}-\d{7}$/.test(num))
          return { isValid: false, message: 'EIN debe tener el formato XX-XXXXXXX (ej: 12-3456789)' };
        break;
      default:
        return { isValid: false, message: 'Selecciona un tipo de documento' };
    }

    return { isValid: true, message: '' };
  };

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
    if (!formData.name.trim()) {
      newErrors.name = t('profile.name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('profile.name_min');
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras y espacios.';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('profile.last_name_required');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('profile.last_name_min');
    } else if (!nameRegex.test(formData.lastName.trim())) {
      newErrors.lastName = 'El apellido solo puede contener letras y espacios.';
    }

    if (!formData.residenceCountry) {
      newErrors.residenceCountry = t('profile.country_required');
    }

    if (!formData.idType) {
      newErrors.idType = t('profile.doc_type_required');
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = t('profile.doc_number_required');
    } else if (formData.idType && formData.idNumber) {
      const docValidation = validateDocument(formData.idType, formData.idNumber);
      if (!docValidation.isValid) {
        newErrors.idNumber = docValidation.message;
      }
    }

    if (!formData.birthday) {
      newErrors.birthday = 'La fecha de nacimiento es obligatoria';
    } 
    // else {
    //   const birthDate = new Date(formData.birthday);
    //   const today = new Date();
    //   const age = today.getFullYear() - birthDate.getFullYear();
      
    //   if (age < 18) {
    //     newErrors.birthday = 'Debes ser mayor de 18 años';
    //   } else if (age > 120) {
    //     newErrors.birthday = 'Fecha de nacimiento inválida';
    //   }
    // }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono principal es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleResidenceChange = (e) => {
    setFormData(prev => ({
      ...prev,
      residenceCountry: e.target.value,
      idType: '',
      idNumber: ''
    }));
    setErrors(prev => ({ ...prev, residenceCountry: '', idType: '', idNumber: '' }));
  };

  const handleIdTypeChange = (e) => {
    setFormData(prev => ({ ...prev, idType: e.target.value, idNumber: '' }));
    setErrors(prev => ({ ...prev, idType: '', idNumber: '' }));
  };

  const handleIdNumberChange = (e) => {
    const raw = e.target.value;
    const type = formData.idType;
    let filtered = raw;
    let maxLen = 20;

    switch (type) {
      case 'cedula':
      case 'cedulavenezolana':
        filtered = raw.replace(/\D/g, '');
        maxLen = 9;
        break;
      case 'cedulaextranjera':
        filtered = raw.replace(/[^A-Za-z0-9]/g, '');
        maxLen = 12;
        break;
      case 'pasaporte':
        filtered = raw.replace(/[^A-Za-z0-9]/g, '');
        maxLen = 15;
        break;
      case 'rif':
      case 'rifjuridico':
      case 'rifgubernamental':
      case 'rifcomuna':
      case 'riffirmapersonal':
        filtered = raw.replace(/[^A-Za-z0-9\-]/g, '');
        maxLen = 12;
        break;
      case 'driverslicense':
        filtered = raw.replace(/[^A-Za-z0-9]/g, '');
        maxLen = 20;
        break;
      case 'ein': {
        const digits = raw.replace(/[^0-9]/g, '');
        filtered = digits.length <= 2 ? digits : digits.slice(0, 2) + '-' + digits.slice(2, 9);
        maxLen = 10;
        break;
      }
      default:
        filtered = raw.replace(/[^A-Za-z0-9]/g, '');
        maxLen = 20;
    }

    // Strip prefix if user pasted the full document number (e.g. "J-12345678-9")
    const prefix = getDocumentPrefix(type);
    if (prefix && filtered.length > 0) {
      const re = new RegExp(`^${prefix.replace('-', '[-]?')}`, 'i');
      filtered = filtered.replace(re, '');
    }

    const value = filtered.slice(0, maxLen);
    setFormData(prev => ({ ...prev, idNumber: value }));
    if (errors.idNumber) setErrors(prev => ({ ...prev, idNumber: '' }));
  };

  const handlePhoneSave = (phoneData) => {
    setFormData(prev => ({
      ...prev,
      phone: phoneData.phone,
      phoneSecondary: phoneData.phoneSecondary
    }));
    setShowPhoneModal(false);
  };

  const handleBirthdaySave = (date) => {
    setFormData(prev => ({ ...prev, birthday: date }));
    setShowBirthdayModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('profile.form_errors'));
      return;
    }

    setLoading(true);

    try {
      const emailToSend = formData.email || user?.email;
      
      if (!emailToSend) {
        console.error('❌ No se encontró email');
        toast.error(t('profile.email_error'));
        setLoading(false);
        return;
      }

      const payload = {
        email: emailToSend,
        name: formData.name,
        lastName: formData.lastName,
        phone: formData.phone,
        phoneSecondary: formData.phoneSecondary || null,
        residenceCountry: formData.residenceCountry,
        idType: formData.idType,
        idNumber: formData.idNumber,
        birthday: formData.birthday ? `${formData.birthday}T12:00:00.000Z` : undefined
      };

      // console.log('📤 Payload FINAL:', JSON.stringify(payload, null, 2));

      // ✅ CORRECTO: Axios maneja automáticamente headers y JSON
      const response = await axiosInstance.post('/Users/update-profile', payload);

      // console.log('📥 Respuesta:', response.data);

      if (response.data.success) {
        const updatedUser = {
          ...user,
          name: response.data.user.nombres || formData.name,
          lastName: response.data.user.apellidos || formData.lastName,
          nombres: response.data.user.nombres || formData.name,
          apellidos: response.data.user.apellidos || formData.lastName,
          phone: response.data.user.telefonoCelular || formData.phone,
          phoneSecondary: response.data.user.telefonoCelularSecundario || formData.phoneSecondary,
          telefonoCelular: response.data.user.telefonoCelular || formData.phone,
          telefonoCelularSecundario: response.data.user.telefonoCelularSecundario || formData.phoneSecondary,
          reg_CodPais: response.data.user.reg_CodPais || formData.residenceCountry,
          idType: formData.idType,
          idNumber: response.data.user.nroIdentificacionCliente || formData.idNumber,
          nroIdentificacionCliente: response.data.user.nroIdentificacionCliente || formData.idNumber,
          idClienteTipoIdentificacion: response.data.user.idClienteTipoIdentificacion,
          birthday: formData.birthday,
          fechaNacimiento: response.data.user.fechaNacimiento,
          profileComplete: true
        };
        
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        if (updateUserContext) {
          await updateUserContext(updatedUser);
        }

        toast.success(response.data.message || t('profile.update_success'));
        
        // Volver al perfil
        navigate('/home');
      } else {
        if (response.data.field) {
          setErrors({ [response.data.field]: response.data.message });
        }
        toast.error(response.data.message || t('profile.update_error'));
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.error('📦 Response data:', error.response?.data);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.field) {
          setErrors({ [errorData.field]: errorData.message || `Campo ${errorData.field} requerido` });
          toast.error(`Error: ${errorData.message || `Campo ${errorData.field} requerido`}`);
        } else {
          toast.error(errorData.message || 'Error de validación');
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('common.connection_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-data">
      {/* Header con botón volver, título y subtítulo */}
      <div className="personal-data__header-section">
        <button 
          className="personal-data__back-btn"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <IoChevronBack size={20} />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="personal-data__main-title">{t('profile.personal_data')}</h1>
        <p className="personal-data__subtitle">{t('profile.personal_data_subtitle')}</p>
      </div>

      {/* Card con el formulario */}
      <div className="personal-data__container">
        <div className="personal-data__card">
          <form className="personal-data__form" onSubmit={handleSubmit}>
            {/* Nombres */}
            <div className="personal-data__section">
              <div className="personal-data__field">
                <label className="personal-data__label">
                  <IoPersonOutline size={18} />
                  {t('profile.name')} <span className="personal-data__required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`personal-data__input ${errors.name ? 'error' : ''}`}
                  placeholder="Juan"
                  disabled={loading}
                />
                {errors.name && (
                  <span className="personal-data__error">{errors.name}</span>
                )}
              </div>

              <div className="personal-data__field">
                <label className="personal-data__label">
                  <IoPersonOutline size={18} />
                  {t('profile.last_name')} <span className="personal-data__required">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`personal-data__input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Pérez"
                  disabled={loading}
                />
                {errors.lastName && (
                  <span className="personal-data__error">{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* Email (solo lectura) */}
            <div className="personal-data__section">
              <div className="personal-data__field full-width">
                <label className="personal-data__label">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="personal-data__input readonly"
                  readOnly
                  disabled
                />
                <span className="personal-data__hint">
                  {t('profile.email_readonly')}
                </span>
              </div>
            </div>

            {/* Teléfono (con modal) */}
            <div className="personal-data__section">
              <div className="personal-data__field full-width">
                <label className="personal-data__label">
                  <IoCallOutline size={18} />
                  {t('profile.phone')} <span className="personal-data__required">*</span>
                </label>
                <div 
                  className="personal-data__clickable-field"
                  onClick={() => setShowPhoneModal(true)}
                >
                  <span>{formatPhoneForDisplay(formData.phone)}</span>
                  <IoCallOutline size={20} />
                </div>
                {formData.phoneSecondary && (
                  <div className="personal-data__secondary-phone">
                    Teléfono secundario: {formData.phoneSecondary}
                  </div>
                )}
                {errors.phone && (
                  <span className="personal-data__error">{errors.phone}</span>
                )}
              </div>
            </div>

            {/* País de Residencia */}
            <div className="personal-data__section">
              <div className="personal-data__field full-width">
                <label className="personal-data__label">
                  <IoGlobeOutline size={18} />
                  {t('profile.residence_country')} <span className="personal-data__required">*</span>
                </label>
                <select
                  name="residenceCountry"
                  value={formData.residenceCountry}
                  onChange={handleResidenceChange}
                  className={`personal-data__select ${errors.residenceCountry ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">{t('profile.select_country')}</option>
                  <option value="VE">{t('profile.venezuela')}</option>
                  <option value="US">{t('profile.united_states')}</option>
                </select>
                {errors.residenceCountry && (
                  <span className="personal-data__error">{errors.residenceCountry}</span>
                )}
              </div>
            </div>

            {/* Documento de identidad */}
            <div className="personal-data__section">
              <div className="personal-data__field">
                <label className="personal-data__label">
                  <IoCardOutline size={18} />
                  {t('profile.document_type')} <span className="personal-data__required">*</span>
                </label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleIdTypeChange}
                  className={`personal-data__select ${errors.idType ? 'error' : ''}`}
                  disabled={loading || !formData.residenceCountry}
                >
                  <option value="">{t('profile.select_document_type')}</option>
                  {getDocumentOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.idType && (
                  <span className="personal-data__error">{errors.idType}</span>
                )}
              </div>

              <div className="personal-data__field">
                <label className="personal-data__label">
                  <IoCardOutline size={18} />
                  {t('profile.document_number')} <span className="personal-data__required">*</span>
                </label>
                {getDocumentPrefix(formData.idType) ? (
                  <div className={`personal-data__input-prefix-wrapper ${errors.idNumber ? 'error' : ''}`}>
                    <span className="personal-data__prefix-badge">
                      {getDocumentPrefix(formData.idType)}
                    </span>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleIdNumberChange}
                      className="personal-data__input personal-data__input--prefixed"
                      placeholder={getPlaceholderForType(formData.idType)}
                      disabled={loading || !formData.idType}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleIdNumberChange}
                    className={`personal-data__input ${errors.idNumber ? 'error' : ''}`}
                    placeholder={getPlaceholderForType(formData.idType)}
                    disabled={loading || !formData.idType}
                  />
                )}
                {errors.idNumber && (
                  <span className="personal-data__error">{errors.idNumber}</span>
                )}
              </div>
            </div>

            {/* Fecha de nacimiento (con modal) */}
            <div className="personal-data__section">
              <div className="personal-data__field full-width">
                <label className="personal-data__label">
                  <IoCalendarOutline size={18} />
                  {t('profile.birthday')} <span className="personal-data__required">*</span>
                </label>
                <div 
                  className="personal-data__clickable-field"
                  onClick={() => setShowBirthdayModal(true)}
                >
                  <span>{formatDateForDisplay(formData.birthday)}</span>
                  <IoCalendarOutline size={20} />
                </div>
                {errors.birthday && (
                  <span className="personal-data__error">{errors.birthday}</span>
                )}
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="personal-data__actions">              
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                icon={loading ? null : <IoSaveOutline size={20} />}
              >
                {loading ? t('profile.saving') : t('profile.save')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modales */}
      <PhoneModal
        show={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSave={handlePhoneSave}
        initialPhone={formData.phone}
        initialPhoneSecondary={formData.phoneSecondary}
      />

      <BirthdayModal
        show={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        onSave={handleBirthdaySave}
        initialDate={formData.birthday}
      />
    </div>
  );
};

export default PersonalData;