// src/pages/profile/Profile/ChangePassword/ChangePassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import toast from 'react-hot-toast';
import './ChangePassword.styles.scss';
import axiosInstance from '../../../../services/axiosInstance';

// Icons
import { 
  IoChevronBack,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoSaveOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';
import CustomAlert from '@components/common/CustomAlert/CustomAlert';
import PasswordValidator, { validatePassword } from '@components/auth/PasswordValidator/PasswordValidator';

// Hook personalizado para alertas
import { useCustomAlert } from '@hooks/useCustomAlert';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  
  // Hook de alertas personalizado
  const alert = useCustomAlert();
  
  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para mostrar el validador de contraseña
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // ===== VALIDACIONES =====
  
  // Ya no necesitamos esta función porque usaremos validatePassword del componente
  // const validatePassword = (password) => { ... }

  const validateForm = () => {
    const newErrors = {};

    // Validar contraseña actual
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Validar nueva contraseña usando el validador del componente
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.errors[0];
      }
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.newPassword && formData.currentPassword && 
        formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== HANDLERS =====

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Mostrar/ocultar validador de contraseña
    if (name === 'newPassword') {
      setShowPasswordValidator(value.length > 0);
      
      // Limpiar error si la contraseña es válida
      if (value.length > 0) {
        const validation = validatePassword(value);
        if (validation.isValid && errors.newPassword) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.newPassword;
            return newErrors;
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/Users/reset-password-profile', {
        email: user.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        // Mostrar alerta de éxito
        alert.showSuccess(
          'Contraseña actualizada',
          'Tu contraseña se ha cambiado correctamente. Por seguridad, te recomendamos no compartirla con nadie.',
          () => {
            // Limpiar formulario
            setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            
            // Ocultar validador
            setShowPasswordValidator(false);
            
            // Volver al perfil
            navigate('/home');
          }
        );
      } else {
        toast.error(response.data.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error('Error al cambiar la contraseña. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER =====

  if (!user) {
    return (
      <div className="change-password">
        <LoadingSpinner />
      </div>
    );
  }

  // Validar si la nueva contraseña es válida
  const isNewPasswordValid = formData.newPassword ? validatePassword(formData.newPassword).isValid : false;

  return (
    <div className="change-password">
      {/* Header con botón volver, título y subtítulo */}
      <div className="change-password__header-section">
        <button 
          className="change-password__back-btn"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <IoChevronBack size={20} />
          <span>Volver</span>
        </button>
        <h1 className="change-password__main-title">Cambiar Contraseña</h1>
        <p className="change-password__subtitle">Actualiza tu contraseña de forma segura</p>
      </div>

      {/* Card con el formulario */}
      <div className="change-password__container">
        <div className="change-password__card">
          {/* Información de seguridad */}
          {/* <div className="change-password__info-box">
            <IoShieldCheckmarkOutline size={24} />
            <div>
              <h3>Requisitos de seguridad</h3>
              <p>Tu nueva contraseña debe cumplir con los siguientes requisitos:</p>
            </div>
          </div> */}

          <form className="change-password__form" onSubmit={handleSubmit}>
            {/* Contraseña Actual */}
            <div className="change-password__section">
              <div className="change-password__field full-width">
                <label className="change-password__label">
                  <IoLockClosedOutline size={18} />
                  Contraseña Actual <span className="change-password__required">*</span>
                </label>
                <div className="change-password__password-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`change-password__input ${errors.currentPassword ? 'error' : ''}`}
                    placeholder="Ingresa tu contraseña actual"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="change-password__toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showCurrentPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="change-password__error">{errors.currentPassword}</span>
                )}
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div className="change-password__section">
              <div className="change-password__field full-width">
                <label className="change-password__label">
                  <IoLockClosedOutline size={18} />
                  Nueva Contraseña <span className="change-password__required">*</span>
                </label>
                <div className="change-password__password-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`change-password__input ${errors.newPassword ? 'error' : ''}`}
                    placeholder="Ingresa tu nueva contraseña"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="change-password__toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showNewPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="change-password__error">{errors.newPassword}</span>
                )}
                
                {/* ✅ Validador de Contraseña - Igual que en Register */}
                <PasswordValidator 
                  password={formData.newPassword} 
                  visible={showPasswordValidator}
                />
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="change-password__section">
              <div className="change-password__field full-width">
                <label className="change-password__label">
                  <IoLockClosedOutline size={18} />
                  Confirmar Nueva Contraseña <span className="change-password__required">*</span>
                </label>
                <div className="change-password__password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`change-password__input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirma tu nueva contraseña"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="change-password__toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="change-password__error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Botón de envío */}
            <div className="change-password__submit-section">
              <Button
                type="submit"
                variant="primary"
                disabled={
                  loading || 
                  (formData.newPassword && !isNewPasswordValid)
                }
                icon={loading ? null : <IoSaveOutline size={20} />}
              >
                {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Alert - Usa tu componente existente */}
      <CustomAlert {...alert.alertProps} />
    </div>
  );
};

export default ChangePassword;