// src/pages/profile/Profile/PersonalData/BirthdayModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose, IoCalendarOutline } from 'react-icons/io5';
import './BirthdayModal.styles.scss';

const BirthdayModal = ({ show, onClose, onSave, initialDate }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && initialDate) {
      setSelectedDate(initialDate);
      setError('');
    }
  }, [show, initialDate]);

  const validateAge = (dateString) => {
    if (!dateString) {
      return 'Selecciona una fecha';
    }

    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

    if (adjustedAge < 18) {
      return 'Debes ser mayor de 18 años';
    }

    if (adjustedAge > 120) {
      return 'Fecha de nacimiento inválida';
    }

    return '';
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    const validationError = validateAge(date);
    setError(validationError);
  };

  const handleSave = () => {
    const validationError = validateAge(selectedDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(selectedDate);
    handleClose();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!show) return null;

  // Calcular fecha máxima (18 años atrás desde hoy)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Calcular fecha mínima (120 años atrás desde hoy)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="birthday-modal-overlay" onClick={handleClose}>
      <div className="birthday-modal" onClick={(e) => e.stopPropagation()}>
        <div className="birthday-modal__header">
          <h2>
            <IoCalendarOutline size={24} />
            Fecha de Nacimiento
          </h2>
          <button className="birthday-modal__close" onClick={handleClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="birthday-modal__body">
          <div className="birthday-modal__field">
            <label>Selecciona tu fecha de nacimiento</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={maxDateStr}
              min={minDateStr}
              className={`birthday-modal__input ${error ? 'error' : ''}`}
            />
            {error && (
              <span className="birthday-modal__error">{error}</span>
            )}
            <span className="birthday-modal__hint">
              Debes ser mayor de 18 años para registrarte
            </span>
          </div>
        </div>

        <div className="birthday-modal__footer">
          <button
            type="button"
            className="birthday-modal__btn birthday-modal__btn--cancel"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="birthday-modal__btn birthday-modal__btn--save"
            onClick={handleSave}
            disabled={!selectedDate || !!error}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayModal;