// src/pages/Profile/PersonalData/PersonalData.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PersonalData.styles.scss';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';

const PersonalData = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
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

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        phoneSecondary: user.phoneSecondary || '',
        idType: user.idType || 'cedula',
        idNumber: user.idNumber || '',
        birthday: user.birthday ? formatDateForInput(user.birthday) : ''
      });
    }
  }, [user]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrate with your API
      // const response = await updateProfile(formData);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Datos actualizados exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-data">
      <div className="personal-data__container">
        {/* Header */}
        <div className="personal-data__header">
          <button 
            className="personal-data__back-btn"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
          <h1 className="personal-data__title">Datos Personales</h1>
          <p className="personal-data__subtitle">
            Actualiza tu información personal
          </p>
        </div>

        {/* Form */}
        <form className="personal-data__form" onSubmit={handleSubmit}>
          {/* Nombres */}
          <div className="personal-data__row">
            <div className="personal-data__field">
              <label className="personal-data__label">
                Nombre <span className="personal-data__required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="personal-data__input"
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="personal-data__field">
              <label className="personal-data__label">
                Apellido <span className="personal-data__required">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="personal-data__input"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="personal-data__field">
            <label className="personal-data__label">
              Email <span className="personal-data__required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="personal-data__input"
              placeholder="tu@email.com"
              required
              disabled
            />
            <span className="personal-data__hint">
              El email no puede ser modificado
            </span>
          </div>

          {/* Teléfonos */}
          <div className="personal-data__row">
            <div className="personal-data__field">
              <label className="personal-data__label">
                Teléfono Principal <span className="personal-data__required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="personal-data__input"
                placeholder="+58 412 1234567"
                required
              />
            </div>

            <div className="personal-data__field">
              <label className="personal-data__label">Teléfono Secundario</label>
              <input
                type="tel"
                name="phoneSecondary"
                value={formData.phoneSecondary}
                onChange={handleChange}
                className="personal-data__input"
                placeholder="+58 424 7654321"
              />
            </div>
          </div>

          {/* Documento de identidad */}
          <div className="personal-data__row">
            <div className="personal-data__field">
              <label className="personal-data__label">
                Tipo de Documento <span className="personal-data__required">*</span>
              </label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="personal-data__select"
                required
              >
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="rif">RIF</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="personal-data__field">
              <label className="personal-data__label">
                Número de Documento <span className="personal-data__required">*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="personal-data__input"
                placeholder="12345678"
                required
              />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className="personal-data__field">
            <label className="personal-data__label">
              Fecha de Nacimiento <span className="personal-data__required">*</span>
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="personal-data__input"
              required
            />
          </div>

          {/* Actions */}
          <div className="personal-data__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalData;