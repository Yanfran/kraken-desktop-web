// src/pages/profile/Profile/PersonalData/PhoneModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import './PhoneModal.styles.scss';

const PhoneModal = ({ show, onClose, onSave, initialPhone, initialPhoneSecondary }) => {
  const { t } = useTranslation();
  const [countryCode, setCountryCode] = useState('+58');
  const [phoneOperator, setPhoneOperator] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Secundario venezolano (cuando principal es +1)
  const [venezuelanOperator, setVenezuelanOperator] = useState('');
  const [venezuelanPhone, setVenezuelanPhone] = useState('');

  // Secundario USA (cuando principal es +58)
  const [usaSecondaryPhone, setUsaSecondaryPhone] = useState('');

  const countries = [
    { code: '+58', name: t('profile.venezuela'), flag: '🇻🇪' },
    { code: '+1',  name: t('profile.united_states'), flag: '🇺🇸' },
  ];

  const venezuelanOperators = [
    { label: '(0412)', value: '(0412)' },
    { label: '(0414)', value: '(0414)' },
    { label: '(0416)', value: '(0416)' },
    { label: '(0424)', value: '(0424)' },
    { label: '(0426)', value: '(0426)' },
  ];

  const phoneFormats = {
    '+58': { mask: '###-##-##',     length: 7  },
    '+1':  { mask: '(###) ###-####', length: 10 },
  };

  useEffect(() => {
    if (show) {
      if (initialPhone)          parsePhone(initialPhone);
      if (initialPhoneSecondary) parsePhoneSecondary(initialPhoneSecondary);
    }
  }, [show, initialPhone, initialPhoneSecondary]); // eslint-disable-line

  const formatPhone = (text, code) => {
    const cleaned = text.replace(/\D/g, '');
    const format  = phoneFormats[code];
    if (!format) return cleaned;

    const { mask, length } = format;
    const limited = cleaned.slice(0, length);
    let formatted = '';
    let ci = 0;
    for (let i = 0; i < mask.length && ci < limited.length; i++) {
      formatted += mask[i] === '#' ? limited[ci++] : mask[i];
    }
    return formatted;
  };

  const parsePhone = (phone) => {
    const country = countries.find(c => phone.startsWith(c.code));
    if (!country) {
      // Sin prefijo — 10 dígitos → USA
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 10) {
        setCountryCode('+1');
        setPhoneNumber(formatPhone(digits, '+1'));
      }
      return;
    }

    const code = country.code;
    setCountryCode(code);
    const rest = phone.slice(code.length).trim();

    if (code === '+58') {
      const m = rest.match(/^(\([^)]+\))\s*(.+)$/);
      if (m) { setPhoneOperator(m[1]); setPhoneNumber(formatPhone(m[2], code)); }
    } else {
      setPhoneNumber(formatPhone(rest, code));
    }
  };

  const parsePhoneSecondary = (phone) => {
    if (!phone) return;
    // Secundario venezolano: +58 (XXXX) ###-##-##
    const veMatch = phone.match(/^\+58\s*(\([^)]+\))\s*(.+)$/);
    if (veMatch) {
      setVenezuelanOperator(veMatch[1]);
      setVenezuelanPhone(formatPhone(veMatch[2], '+58'));
      return;
    }
    // Secundario USA: +1 (###) ###-####
    if (phone.startsWith('+1')) {
      const rest = phone.slice(2).trim();
      setUsaSecondaryPhone(formatPhone(rest, '+1'));
    }
  };

  const isPhoneComplete = () => {
    if (!phoneNumber || !countryCode) return false;
    const format = phoneFormats[countryCode];
    const len = phoneNumber.replace(/\D/g, '').length;
    if (!format) return len >= 7;
    if (countryCode === '+58') return len === format.length && !!phoneOperator;
    return len === format.length;
  };

  // Valida el secundario venezolano (vacío = válido, parcial = inválido)
  const isVenezuelanSecondaryValid = () => {
    if (!venezuelanPhone && !venezuelanOperator) return true;
    return !!venezuelanOperator && venezuelanPhone.replace(/\D/g, '').length === 7;
  };

  // Valida el secundario USA (vacío = válido, parcial = inválido)
  const isUsaSecondaryValid = () => {
    if (!usaSecondaryPhone) return true;
    return usaSecondaryPhone.replace(/\D/g, '').length === 10;
  };

  const isFormValid = () => isPhoneComplete() && isVenezuelanSecondaryValid() && isUsaSecondaryValid();

  const handleSave = () => {
    if (!isFormValid()) return;

    const mainPhone = countryCode === '+58'
      ? `${countryCode} ${phoneOperator} ${phoneNumber}`
      : `${countryCode} ${phoneNumber}`;

    let secondaryPhone = '';
    if (countryCode === '+1' && venezuelanPhone && venezuelanOperator && isVenezuelanSecondaryValid()) {
      secondaryPhone = `+58 ${venezuelanOperator} ${venezuelanPhone}`;
    } else if (countryCode === '+58' && usaSecondaryPhone && isUsaSecondaryValid()) {
      secondaryPhone = `+1 ${usaSecondaryPhone}`;
    }

    onSave({ phone: mainPhone, phoneSecondary: secondaryPhone });
    handleClose();
  };

  const handleClose = () => {
    setPhoneOperator('');
    setPhoneNumber('');
    setVenezuelanOperator('');
    setVenezuelanPhone('');
    setUsaSecondaryPhone('');
    onClose();
  };

  const handleCountryChange = (code) => {
    setCountryCode(code);
    setPhoneNumber('');
    setPhoneOperator('');
  };

  if (!show) return null;

  return (
    <div className="phone-modal-overlay" onClick={handleClose}>
      <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phone-modal__header">
          <h2>{t('profile.phone_modal_title')}</h2>
          <button className="phone-modal__close" onClick={handleClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="phone-modal__body">
          {/* ── Selector de país principal ── */}
          <div className="phone-modal__field">
            <label>{t('profile.phone_modal_country')}</label>
            <select
              value={countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="phone-modal__select"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* ── Operadora (solo Venezuela principal) ── */}
          {countryCode === '+58' && (
            <div className="phone-modal__field">
              <label>{t('profile.phone_modal_operator')}</label>
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

          {/* ── Número principal ── */}
          <div className="phone-modal__field">
            <label>{t('profile.phone_modal_number')}</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhone(e.target.value, countryCode))}
              placeholder={phoneFormats[countryCode]?.mask || '###########'}
              className="phone-modal__input"
            />
            {phoneNumber && !isPhoneComplete() && (
              <span className="phone-modal__error">{t('profile.phone_modal_incomplete')}</span>
            )}
          </div>

          {/* ── Secundario: Venezuela (cuando principal es USA) ── */}
          {countryCode === '+1' && (
            <>
              <div className="phone-modal__divider">
                <span>{t('profile.phone_modal_ve_section')}</span>
              </div>

              <div className="phone-modal__field">
                <label>{t('profile.phone_modal_ve_operator')}</label>
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
                <label>{t('profile.phone_modal_ve_number')}</label>
                <input
                  type="tel"
                  value={venezuelanPhone}
                  onChange={(e) => setVenezuelanPhone(formatPhone(e.target.value, '+58'))}
                  placeholder="###-##-##"
                  className="phone-modal__input"
                />
                {venezuelanPhone && !isVenezuelanSecondaryValid() && (
                  <span className="phone-modal__error">{t('profile.phone_modal_ve_incomplete')}</span>
                )}
              </div>
            </>
          )}

          {/* ── Secundario: USA (cuando principal es Venezuela) ── */}
          {countryCode === '+58' && (
            <>
              <div className="phone-modal__divider">
                <span>🇺🇸 Número Americano (Opcional)</span>
              </div>

              <div className="phone-modal__field">
                <label>Número de teléfono (+1)</label>
                <input
                  type="tel"
                  value={usaSecondaryPhone}
                  onChange={(e) => setUsaSecondaryPhone(formatPhone(e.target.value, '+1'))}
                  placeholder="(###) ###-####"
                  className="phone-modal__input"
                />
                {usaSecondaryPhone && !isUsaSecondaryValid() && (
                  <span className="phone-modal__error">Número incompleto</span>
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
            {t('profile.phone_modal_cancel')}
          </button>
          <button
            type="button"
            className="phone-modal__btn phone-modal__btn--save"
            onClick={handleSave}
            disabled={!isFormValid()}
          >
            {t('profile.phone_modal_save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneModal;
