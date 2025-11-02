// src/pages/profile/Profile/PersonalData/PersonalData.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import toast from 'react-hot-toast';
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
  IoSaveOutline
} from 'react-icons/io5';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';
import PhoneModal from './PhoneModal';
import BirthdayModal from './BirthdayModal';

const PersonalData = () => {
  const navigate = useNavigate();
  const { user, updateProfile: updateUserContext } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    phoneSecondary: '',
    idType: 'cedula',
    idNumber: '',
    birthday: ''
  });

  const [errors, setErrors] = useState({});

  // ✅ Cargar datos del usuario desde el contexto
  useEffect(() => {
    if (user) {
      // console.log('👤 Usuario en contexto:', user);
      
      // Mapear los campos del backend a tu formulario
      const detectedIdType = detectDocumentType(user);
      
      setFormData({
        name: user.name || user.nombres || '',
        lastName: user.lastName || user.apellidos || '',
        email: user.email || '',
        phone: user.phone || user.telefonoCelular || '',
        phoneSecondary: user.phoneSecondary || user.telefonoCelularSecundario || '',
        idType: detectedIdType,
        idNumber: user.idNumber || user.nroIdentificacionCliente || user.nro || '',
        birthday: user.birthday || user.fechaNacimiento ? formatDateForInput(user.birthday || user.fechaNacimiento) : ''
      });
    }
  }, [user]);

  const detectDocumentType = (userData) => {
    if (!userData) return 'cedula';
    
    // ✅ MAPEO CORRECTO según tu base de datos:
    // 1 = Pasaporte, 2 = RIF, 3 = Cédula, 4+ = Otro
    const docId = userData.idClienteTipoIdentificacion;
    const docMap = { 
      1: 'pasaporte',  // ✅ Pasaporte
      2: 'rif',        // ✅ RIF
      3: 'cedula',     // ✅ Cédula
      4: 'otro',       // ✅ Driver's license
      5: 'otro',       // ✅ EIN
      6: 'otro'        // ✅ Tarjeta de Identidad de Residencia
    };
    
    return docMap[docId] || 'cedula';
  };

  const mapIdTypeToBackend = (idType) => {
    // ✅ MAPEO INVERSO CORRECTO
    const typeMap = { 
      'pasaporte': 1,  // ✅ Pasaporte
      'rif': 2,        // ✅ RIF
      'cedula': 3,     // ✅ Cédula
      'otro': 4        // ✅ Otros documentos
    };
    return typeMap[idType] || 3; // Default: Cédula
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Seleccionar fecha';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // ✅ Solo mostrar día y mes (sin año)
    return `${day}/${month}`;
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return 'Agregar teléfono';
    return phone;
  };

  const validateDocument = (type, number) => {
    const num = number.trim();
    
    switch (type) {
      case 'cedula':
        if (!/^\d{6,8}$/.test(num)) {
          return { isValid: false, message: 'Cédula debe tener entre 6-8 dígitos' };
        }
        break;
      case 'pasaporte':
        if (num.length < 5 || num.length > 15) {
          return { isValid: false, message: 'Pasaporte debe tener entre 5-15 caracteres' };
        }
        break;
      case 'rif':
        if (!/^[VEJPG]-?\d{8,9}-?\d?$/.test(num)) {
          return { isValid: false, message: 'RIF debe tener formato válido (ej: V-12345678-9)' };
        }
        break;
      case 'otro':
        if (num.length < 5 || num.length > 20) {
          return { isValid: false, message: 'Documento debe tener entre 5-20 caracteres' };
        }
        break;
      default:
        return { isValid: false, message: 'Selecciona un tipo de documento' };
    }
    
    return { isValid: true, message: '' };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.idType) {
      newErrors.idType = 'Selecciona un tipo de documento';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'El número de documento es obligatorio';
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
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      const emailToSend = formData.email || user?.email;
      
      if (!emailToSend) {
        console.error('❌ No se encontró email');
        toast.error('Error: No se pudo obtener tu email');
        setLoading(false);
        return;
      }

      const payload = {
        email: emailToSend,
        name: formData.name,
        lastName: formData.lastName,
        phone: formData.phone,
        phoneSecondary: formData.phoneSecondary || null,
        idType: formData.idType,
        idNumber: formData.idNumber,
        birthday: new Date(formData.birthday).toISOString()
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

        toast.success(response.data.message || 'Datos actualizados exitosamente');
        
        // Volver al perfil
        navigate('/home');
      } else {
        if (response.data.field) {
          setErrors({ [response.data.field]: response.data.message });
        }
        toast.error(response.data.message || 'Error al actualizar los datos');
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
        toast.error('Error de conexión. Intenta nuevamente.');
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
          <span>Volver</span>
        </button>
        <h1 className="personal-data__main-title">Datos Personales</h1>
        <p className="personal-data__subtitle">Gestiona tu información personal</p>
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
                  Nombre <span className="personal-data__required">*</span>
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
                  Apellido <span className="personal-data__required">*</span>
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
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="personal-data__input readonly"
                  readOnly
                  disabled
                />
                <span className="personal-data__hint">
                  El correo no se puede modificar
                </span>
              </div>
            </div>

            {/* Teléfono (con modal) */}
            <div className="personal-data__section">
              <div className="personal-data__field full-width">
                <label className="personal-data__label">
                  <IoCallOutline size={18} />
                  Teléfono Principal <span className="personal-data__required">*</span>
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

            {/* Documento de identidad */}
            <div className="personal-data__section">
              <div className="personal-data__field">
                <label className="personal-data__label">
                  <IoCardOutline size={18} />
                  Tipo de Documento <span className="personal-data__required">*</span>
                </label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  className={`personal-data__select ${errors.idType ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="cedula">Cédula</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="rif">RIF</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.idType && (
                  <span className="personal-data__error">{errors.idType}</span>
                )}
              </div>

              <div className="personal-data__field">
                <label className="personal-data__label">
                  <IoCardOutline size={18} />
                  Número de Documento <span className="personal-data__required">*</span>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className={`personal-data__input ${errors.idNumber ? 'error' : ''}`}
                  placeholder={
                    formData.idType === 'cedula' ? '12345678' :
                    formData.idType === 'pasaporte' ? 'AB123456' :
                    formData.idType === 'rif' ? 'V-12345678-9' :
                    'Número de documento'
                  }
                  disabled={loading}
                />
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
                  Fecha de Nacimiento <span className="personal-data__required">*</span>
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
                {loading ? 'Guardarndo Cambios...' : 'Guardar Cambios'}
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