// src/components/calculator/LocationStep.jsx
import React from 'react';
import { Loader } from 'lucide-react';
import './LocationStep.scss';

const LocationStep = ({
  statesList = [],
  municipalitiesList = [],
  selectedState,
  selectedMunicipality,
  onStateChange,
  onMunicipalityChange,
  onNext,
  isLoading = false,
  validationError = ''
}) => {

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="location-step">
      <div className="location-step__form">
        {/* Países fijos */}
        <div className="location-step__field">
          <label className="location-step__label">País de Origen</label>
          <div className="location-step__fixed-box">
            <span>🇺🇸</span> Estados Unidos
          </div>
        </div>

        <div className="location-step__field">
          <label className="location-step__label">País de Destino</label>
          <div className="location-step__fixed-box">
            <span>🇻🇪</span> Venezuela
          </div>
        </div>

        {/* Dropdown de estados */}
        <div className="location-step__field">
          <label className="location-step__label">Estado *</label>
          <select
            className={`location-step__dropdown ${validationError && !selectedState ? 'error' : ''}`}
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={isLoading || statesList.length === 0}
          >
            <option value="">{isLoading ? 'Cargando estados...' : 'Seleccione un estado'}</option>
            {statesList.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de municipios */}
        <div className="location-step__field">
          <label className="location-step__label">Municipio *</label>
          <select
            className={`location-step__dropdown ${validationError && !selectedMunicipality ? 'error' : ''}`}
            value={selectedMunicipality}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            disabled={isLoading || !selectedState || municipalitiesList.length === 0}
          >
            <option value="">{selectedState ? 'Seleccione un municipio' : 'Seleccione un estado primero'}</option>
            {municipalitiesList.map(mun => (
              <option key={mun.value} value={mun.value}>
                {mun.label}
              </option>
            ))}
          </select>
        </div>

        {validationError && (
          <div className="location-step__error-box">
            <p>{validationError}</p>
          </div>
        )}
      </div>

      <button 
        className="location-step__next-button"
        onClick={handleNext}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="spinner" size={20} />
            <span>Cargando...</span>
          </>
        ) : (
          'Siguiente'
        )}
      </button>
    </div>
  );
};

export default LocationStep;
