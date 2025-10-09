// src/pages/profile/Profile/PersonalData/BirthdayModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose, IoCalendarOutline } from 'react-icons/io5';
import './BirthdayModal.styles.scss';

const BirthdayModal = ({ show, onClose, onSave, initialDate }) => {
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Generar días del 1 al 31
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return { value: day, label: day };
  });

  useEffect(() => {
    if (show && initialDate) {
      // Extraer día y mes de la fecha inicial (formato: YYYY-MM-DD o DD/MM)
      const date = new Date(initialDate);
      if (!isNaN(date.getTime())) {
        setSelectedDay(String(date.getDate()).padStart(2, '0'));
        setSelectedMonth(String(date.getMonth() + 1).padStart(2, '0'));
      }
    }
  }, [show, initialDate]);

  const handleSave = () => {
    if (!selectedDay || !selectedMonth) return;

    // Crear fecha completa con el año actual para guardar
    const currentYear = new Date().getFullYear();
    const fullDate = `${currentYear}-${selectedMonth}-${selectedDay}`;
    
    onSave(fullDate);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!show) return null;

  const isValid = selectedDay && selectedMonth;

  return (
    <div className="birthday-modal-overlay" onClick={handleClose}>
      <div className="birthday-modal" onClick={(e) => e.stopPropagation()}>
        <div className="birthday-modal__header">
          <h2>
            <IoCalendarOutline size={24} />
            Seleccionar Cumpleaños
          </h2>
          <button className="birthday-modal__close" onClick={handleClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="birthday-modal__body">
          <p className="birthday-modal__subtitle">Selecciona tu día y mes de nacimiento</p>
          
          <div className="birthday-modal__selectors">
            <div className="birthday-modal__field">
              <label>Mes</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="birthday-modal__select"
              >
                <option value="">Seleccionar mes</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="birthday-modal__field">
              <label>Día</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="birthday-modal__select"
                disabled={!selectedMonth}
              >
                <option value="">Seleccionar día</option>
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isValid && (
            <div className="birthday-modal__preview">
              Cumpleaños seleccionado: <strong>{selectedDay}/{selectedMonth}</strong>
            </div>
          )}
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
            disabled={!isValid}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayModal;