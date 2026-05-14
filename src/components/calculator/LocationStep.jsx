// src/components/calculator/LocationStep.jsx
// ✅ COMPLETO - Con selector de país Y parroquia
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchableSelect from '../../components/common/SearchableSelect/SearchableSelect';
import './LocationStep.scss';

const LocationStep = ({
  statesList,
  municipalitiesList,
  parishesList,
  selectedState,
  selectedMunicipality,
  selectedParish,
  originCountry, // 🆕 País de origen seleccionado
  onStateChange,
  onMunicipalityChange,
  onParishChange,
  onOriginCountryChange, // 🆕 Callback para cambiar país
  onNext,
  isLoading
}) => {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState('');

  const originCountryOptions = [
    { label: '🇺🇸 Estados Unidos', value: 'US' },
    { label: '🇨🇳 China', value: 'CN' }
  ];

  const handleNext = () => {
    setValidationError('');

    if (!selectedState || selectedState.trim() === '') {
      setValidationError(t('calculator.error_select_state'));
      return;
    }

    if (!selectedMunicipality || selectedMunicipality.trim() === '') {
      setValidationError(t('calculator.error_select_municipality'));
      return;
    }

    onNext();
  };

  const handleStateChange = (value) => {
    setValidationError('');
    onStateChange(value);
  };

  const handleMunicipalityChange = (value) => {
    setValidationError('');
    onMunicipalityChange(value);
  };

  // 🆕 Handler para cambio de país de origen
  const handleOriginCountryChangeInternal = (value) => {
    setValidationError('');
    onOriginCountryChange(value);
  };

  return (
    <div className="location-step">
      <div className="location-step__form">
        
        {/* ✅ CONTENEDOR 1: PAÍSES EN 2 COLUMNAS */}
        <div className="location-step__grid"> 
          {/* 🆕 País de Origen - AHORA ES SELECCIONABLE */}
          <div className="location-step__col">
            <label className="location-step__label">{t('calculator.origin_country')} *</label>
            <SearchableSelect
              options={originCountryOptions}
              value={originCountry}
              onChange={handleOriginCountryChangeInternal}
              placeholder={t('calculator.select_country')}
              disabled={isLoading}
            />
          </div>

          <div className="location-step__col">
            <label className="location-step__label">{t('calculator.destination_country')}</label>
            <div className="location-step__fixed-country">
              <span className="location-step__flag">🇻🇪</span>
              <span className="location-step__fixed-country-text">Venezuela</span>
            </div>
          </div>
        </div>

        {/* ✅ CONTENEDOR 2: ESTADO Y MUNICIPIO EN 2 COLUMNAS */}
        <div className="location-step__grid"> 
          <div className="location-step__col">
            <label className="location-step__label">{t('calculator.state')} *</label>
            <SearchableSelect
              options={statesList}
              value={selectedState}
              onChange={handleStateChange}
              placeholder={t('calculator.select_state')}
              disabled={isLoading}
              className={validationError && !selectedState ?
                'location-step__select location-step__select--error' :
                'location-step__select'}
            />
          </div>

          <div className="location-step__col">
            <label className="location-step__label">{t('calculator.municipality')} *</label>
            <SearchableSelect
              options={municipalitiesList}
              value={selectedMunicipality}
              onChange={handleMunicipalityChange}
              placeholder={selectedState ? t('calculator.select_municipality') : t('calculator.select_municipality_first')}
              disabled={isLoading || !selectedState || municipalitiesList.length === 0}
              className={validationError && !selectedMunicipality ? 
                'location-step__select location-step__select--error' : 
                'location-step__select'}
            />
          </div>
        </div>

        {/* ✅ CONTENEDOR 3: PARROQUIA EN 1 COLUMNA (OPCIONAL) */}
        {/* <div className="location-step__field">
          <label className="location-step__label">Parroquia (opcional)</label>
          <SearchableSelect
            options={parishesList}
            value={selectedParish}
            onChange={onParishChange}
            placeholder={selectedMunicipality ? "Seleccione una parroquia" : "Primero seleccione municipio"}
            disabled={isLoading || !selectedMunicipality || parishesList.length === 0}
            className="location-step__select"
          />
        </div> */}

        {/* Mensaje de error */}
        {validationError && (
          <div className="location-step__error">
            <span className="location-step__error-icon">⚠️</span>
            <span className="location-step__error-text">{validationError}</span>
          </div>
        )}
      </div>

      {/* Botón siguiente */}
      <div className="location-step__buttons">
        <button
          type="button"
          className="location-step__next-button"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? t('calculator.loading') : t('calculator.next')}
        </button>
      </div>
    </div>
  );
};

export default LocationStep;