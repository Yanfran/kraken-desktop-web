// src/pages/profile/Profile/PersonalData/PhoneModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import './PhoneModal.styles.scss';

const PhoneModal = ({ show, onClose, onSave, initialPhone, initialPhoneSecondary }) => {
  const [countryCode, setCountryCode] = useState('+58');
  const [phoneOperator, setPhoneOperator] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [venezuelanOperator, setVenezuelanOperator] = useState('');
  const [venezuelanPhone, setVenezuelanPhone] = useState('');

  const countries = [
    { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+34', name: 'España', flag: '🇪🇸' },
  ];

  const venezuelanOperators = [
    { label: '(0412)', value: '(0412)' },
    { label: '(0414)', value: '(0414)' },
    { label: '(0416)', value: '(0416)' },
    { label: '(0424)', value: '(0424)' },
    { label: '(0426)', value: '(0426)' },
  ];

  const phoneFormats = {
    '+58': { mask: '###-##-##', length: 7 },
    '+1': { mask: '(###) ###-####', length: 10 },
    '+86': { mask: '(###) ####-####', length: 11 },
    '+34': { mask: '(###) ###-###', length: 9 },
  };

  useEffect(() => {
    if (show && initialPhone) {
      parsePhone(initialPhone);
    }
    if (show && initialPhoneSecondary) {
      parsePhoneSecondary(initialPhoneSecondary);
    }
  }, [show, initialPhone, initialPhoneSecondary]);

  const parsePhone = (phone) => {
    const match = phone.match(/^\+(\d+)\s*(\([^)]+\))?\s*(.+)$/);
    if (!match) return;

    const code = '+' + match[1];
    setCountryCode(code);

    if (code === '+58') {
      if (match[2]) setPhoneOperator(match[2]);
      if (match[3]) setPhoneNumber(formatPhone(match[3], code));
    } else {
      if (match[3]) setPhoneNumber(formatPhone(match[3], code));
    }
  };

  const parsePhoneSecondary = (phone) => {
    const match = phone.match(/^\+58\s*(\([^)]+\))\s*(.+)$/);
    if (match) {
      setVenezuelanOperator(match[1]);
      setVenezuelanPhone(formatVenezuelanPhone(match[2]));
    }
  };

  const formatPhone = (text, code) => {
    const cleaned = text.replace(/\D/g, '');
    const format = phoneFormats[code];
    if (!format) return cleaned;

    const { mask, length } = format;
    const limitedCleaned = cleaned.slice(0, length);

    let formatted = '';
    let cleanedIndex = 0;

    for (let i = 0; i < mask.length && cleanedIndex < limitedCleaned.length; i++) {
      if (mask[i] === '#') {
        formatted += limitedCleaned[cleanedIndex];
        cleanedIndex++;
      } else {
        formatted += mask[i];
      }
    }

    return formatted;
  };

  const formatVenezuelanPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limitedCleaned = cleaned.slice(0, 7);

    let formatted = '';
    let cleanedIndex = 0;
    const mask = '###-##-##';

    for (let i = 0; i < mask.length && cleanedIndex < limitedCleaned.length; i++) {
      if (mask[i] === '#') {
        formatted += limitedCleaned[cleanedIndex];
        cleanedIndex++;
      } else {
        formatted += mask[i];
      }
    }

    return formatted;
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber(formatPhone(value, countryCode));
  };

  const handleVenezuelanPhoneChange = (value) => {
    setVenezuelanPhone(formatVenezuelanPhone(value));
  };

  const isPhoneComplete = () => {
    if (!phoneNumber || !countryCode) return false;
    const format = phoneFormats[countryCode];
    if (!format) return phoneNumber.replace(/\D/g, '').length >= 7;

    const requiredLength = format.length;
    const actualLength = phoneNumber.replace(/\D/g, '').length;

    if (countryCode === '+58') {
      return actualLength === requiredLength && !!phoneOperator;
    }

    return actualLength === requiredLength;
  };

  const isVenezuelanPhoneValid = () => {
    if (countryCode === '+58') return true;
    if (!venezuelanPhone && !venezuelanOperator) return true;
    return !!venezuelanOperator && venezuelanPhone.replace(/\D/g, '').length === 7;
  };

  const handleSave = () => {
    if (!isPhoneComplete()) return;

    const mainPhone = countryCode === '+58'
      ? `${countryCode} ${phoneOperator} ${phoneNumber}`
      : `${countryCode} ${phoneNumber}`;

    let secondaryPhone = '';
    if (countryCode !== '+58' && venezuelanPhone && venezuelanOperator && isVenezuelanPhoneValid()) {
      secondaryPhone = `+58 ${venezuelanOperator} ${venezuelanPhone}`;
    }

    onSave({ phone: mainPhone, phoneSecondary: secondaryPhone });
    handleClose();
  };

  const handleClose = () => {
    setPhoneOperator('');
    setPhoneNumber('');
    setVenezuelanOperator('');
    setVenezuelanPhone('');
    onClose();
  };

  if (!show) return null;

  const showVenezuelanSection = countryCode !== '+58';

  return (
    <div className="phone-modal-overlay" onClick={handleClose}>
      <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phone-modal__header">
          <h2>Editar Teléfono</h2>
          <button className="phone-modal__close" onClick={handleClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="phone-modal__body">
          {/* Selector de país */}
          <div className="phone-modal__field">
            <label>País</label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setPhoneNumber('');
                setPhoneOperator('');
              }}
              className="phone-modal__select"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>

          {/* Operadora (solo para Venezuela) */}
          {countryCode === '+58' && (
            <div className="phone-modal__field">
              <label>Operadora</label>
              <div className="phone-modal__operators">
                {venezuelanOperators.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    className={`phone-modal__operator-btn ${phoneOperator === op.value ? 'active' : ''}`}
                    onClick={() => setPhoneOperator(op.value)}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Número de teléfono */}
          <div className="phone-modal__field">
            <label>Número de teléfono</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={phoneFormats[countryCode]?.mask || '###########'}
              className="phone-modal__input"
            />
            {phoneNumber && !isPhoneComplete() && (
              <span className="phone-modal__error">Número incompleto</span>
            )}
          </div>

          {/* Sección venezolana adicional */}
          {showVenezuelanSection && (
            <>
              <div className="phone-modal__divider">
                <span>Número Venezolano (Opcional)</span>
              </div>

              <div className="phone-modal__field">
                <label>Operadora Venezolana</label>
                <div className="phone-modal__operators">
                  {venezuelanOperators.map((op) => (
                    <button
                      key={op.value}
                      type="button"
                      className={`phone-modal__operator-btn ${venezuelanOperator === op.value ? 'active' : ''}`}
                      onClick={() => setVenezuelanOperator(op.value)}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="phone-modal__field">
                <label>Número Venezolano</label>
                <input
                  type="tel"
                  value={venezuelanPhone}
                  onChange={(e) => handleVenezuelanPhoneChange(e.target.value)}
                  placeholder="###-##-##"
                  className="phone-modal__input"
                />
                {venezuelanPhone && !isVenezuelanPhoneValid() && (
                  <span className="phone-modal__error">Número venezolano incompleto</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="phone-modal__footer">
          <button
            type="button"
            className="phone-modal__btn phone-modal__btn--cancel"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="phone-modal__btn phone-modal__btn--save"
            onClick={handleSave}
            disabled={!isPhoneComplete() || !isVenezuelanPhoneValid()}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneModal;