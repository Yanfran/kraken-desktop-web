// src/pages/profile/Profile/PersonalData/BirthdayModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose, IoCalendarOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import './BirthdayModal.styles.scss';

const BirthdayModal = ({ show, onClose, onSave, initialDate }) => {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const months = [
    { value: '01', label: t('profile.birthday_jan') },
    { value: '02', label: t('profile.birthday_feb') },
    { value: '03', label: t('profile.birthday_mar') },
    { value: '04', label: t('profile.birthday_apr') },
    { value: '05', label: t('profile.birthday_may') },
    { value: '06', label: t('profile.birthday_jun') },
    { value: '07', label: t('profile.birthday_jul') },
    { value: '08', label: t('profile.birthday_aug') },
    { value: '09', label: t('profile.birthday_sep') },
    { value: '10', label: t('profile.birthday_oct') },
    { value: '11', label: t('profile.birthday_nov') },
    { value: '12', label: t('profile.birthday_dec') },
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
            {t('profile.birthday_modal_title')}
          </h2>
          <button className="birthday-modal__close" onClick={handleClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="birthday-modal__body">
          <p className="birthday-modal__subtitle">{t('profile.birthday_modal_subtitle')}</p>

          <div className="birthday-modal__selectors">
            <div className="birthday-modal__field">
              <label>{t('profile.birthday_modal_month')}</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="birthday-modal__select"
              >
                <option value="">{t('profile.birthday_modal_select_month')}</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="birthday-modal__field">
              <label>{t('profile.birthday_modal_day')}</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="birthday-modal__select"
                disabled={!selectedMonth}
              >
                <option value="">{t('profile.birthday_modal_select_day')}</option>
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
              {t('profile.birthday_modal_preview')} <strong>{selectedDay}/{selectedMonth}</strong>
            </div>
          )}
        </div>

        <div className="birthday-modal__footer">
          <button
            type="button"
            className="birthday-modal__btn birthday-modal__btn--cancel"
            onClick={handleClose}
          >
            {t('profile.birthday_modal_cancel')}
          </button>
          <button
            type="button"
            className="birthday-modal__btn birthday-modal__btn--save"
            onClick={handleSave}
            disabled={!isValid}
          >
            {t('profile.birthday_modal_save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayModal;