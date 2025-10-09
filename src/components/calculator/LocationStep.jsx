// src/components/calculator/LocationStep.jsx
// ✅ ACTUALIZADO con SearchableSelect y diseño correcto
import React, { useState } from 'react';
import SearchableSelect from '../../components/common/SearchableSelect/SearchableSelect';
import './LocationStep.scss';

const LocationStep = ({
  statesList,
  municipalitiesList,
  parishesList,
  selectedState,
  selectedMunicipality,
  selectedParish,
  onStateChange,
  onMunicipalityChange,
  onParishChange,
  onNext,
  isLoading
}) => {
  const [validationError, setValidationError] = useState('');

  const handleNext = () => {
    setValidationError('');

    if (!selectedState || selectedState.trim() === '') {
      setValidationError('Por favor selecciona un estado');
      return;
    }

    if (!selectedMunicipality || selectedMunicipality.trim() === '') {
      setValidationError('Por favor selecciona un municipio');
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

  return (
    <div className="location-step">
      <div className="location-step__form">
        {/* Países fijos */}
        <label className="location-step__label">País de Origen</label>
        <div className="location-step__fixed-country">
          <span className="location-step__flag">🇺🇸</span>
          <span className="location-step__fixed-country-text">Estados Unidos</span>
        </div>

        <label className="location-step__label">País de Destino</label>
        <div className="location-step__fixed-country">
          <span className="location-step__flag">🇻🇪</span>
          <span className="location-step__fixed-country-text">Venezuela</span>
        </div>

        {/* SearchableSelect de estados */}
        <label className="location-step__label">Estado *</label>
        <SearchableSelect
          options={statesList}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="Seleccione un estado"
          disabled={isLoading}
          className={validationError && !selectedState ? 'location-step__select--error' : ''}
        />

        {/* SearchableSelect de municipios */}
        <label className="location-step__label">Municipio *</label>
        <SearchableSelect
          options={municipalitiesList}
          value={selectedMunicipality}
          onChange={handleMunicipalityChange}
          placeholder="Seleccione un estado primero"
          disabled={!selectedState || isLoading}
          className={validationError && !selectedMunicipality ? 'location-step__select--error' : ''}
        />

        {/* Mensaje de error */}
        {validationError && (
          <div className="location-step__error">
            <span className="location-step__error-text">{validationError}</span>
          </div>
        )}
      </div>

      <button 
        className={`location-step__next-button ${isLoading ? 'location-step__next-button--disabled' : ''}`}
        onClick={handleNext}
        disabled={isLoading}
        type="button"
      >
        {isLoading ? (
          <span className="location-step__spinner"></span>
        ) : (
          'Siguiente'
        )}
      </button>
    </div>
  );
};

export default LocationStep;