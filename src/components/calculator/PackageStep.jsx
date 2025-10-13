import React, { useEffect, useState } from 'react';
import CurrencyInput from '../common/CurrencyInput/CurrencyInput';
import SearchableSelect from '../common/SearchableSelect/SearchableSelect';
import './PackageStep.scss';

const HIGH_VALUE_THRESHOLD = 1000;

const PackageStep = ({
  declaredValue,
  currency,
  content,
  contenidos,
  weight,
  weightUnit,
  dimensionUnit,
  dimensions,
  isHighValue,
  isCalculating = false,
  contentOptions,
  onDeclaredValueChange,
  onContentChange,
  onContenidosChange,
  onWeightChange,
  onWeightUnitToggle,
  onDimensionChange,
  onCalculate,
  onBack,
  onHighValueChange
}) => {
  const [localContenidos, setLocalContenidos] = useState([]);

  useEffect(() => {
    setLocalContenidos(contenidos || []);
  }, [contenidos]);

  // Parsear valor declarado para validación
  const parseFormattedValue = (formattedValue) => {
    if (!formattedValue || formattedValue.trim() === '') return 0;
    if (formattedValue.includes(',')) {
      const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(cleanValue) || 0;
    }
    return parseFloat(formattedValue) || 0;
  };

  // Validar automáticamente si es alto valor
  useEffect(() => {
    const numericValue = parseFormattedValue(declaredValue);
    const shouldBeHighValue = numericValue >= HIGH_VALUE_THRESHOLD;
    
    if (shouldBeHighValue !== isHighValue) {
      onHighValueChange?.(shouldBeHighValue);
    }
  }, [declaredValue]);

  const handleDeclaredValueChange = (formattedValue, numericValue) => {
    onDeclaredValueChange(formattedValue);
  };

  const handleWeightInputChange = (e) => {
    const value = e.target.value;
    // Solo permitir números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onWeightChange(value);
    }
  };

  const handleDimensionInputChange = (dimension, e) => {
    const value = e.target.value;
    // Solo permitir números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onDimensionChange(dimension, value);
    }
  };

  const handleContentToggle = (value) => {
    const newContenidos = localContenidos.includes(value)
      ? localContenidos.filter(id => id !== value)
      : [...localContenidos, value];
    
    setLocalContenidos(newContenidos);
    onContenidosChange(newContenidos);
  };

  // ✅ Nuevo handler para SearchableSelect
  const handleSearchableContentChange = (selectedValue) => {
    if (selectedValue) {
      handleContentToggle(selectedValue);
    }
  };

  const isContentSelected = (value) => {
    return localContenidos.includes(value);
  };

  return (
    <div className="package-step">
      <div className="package-step__scroll">
        <div className="package-step__form">
          
          
          {/* ✅ NUEVO GRID DE DOS COLUMNAS: VALOR + PESO */}
          <div className="package-step__top-grid">
            {/* COLUMNA 1: VALOR DECLARADO (FOB) */}
            <div className="package-step__col">
              <label className="package-step__label">Valor declarado (FOB) *</label>
              
              {/* Contenedor para USD y CurrencyInput */}
              <div className="package-step__value-input-group"> 
                <div className="package-step__currency-badge">
                  <span>USD</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
                <CurrencyInput
                  value={declaredValue}
                  onChange={handleDeclaredValueChange}
                  placeholder="0,00"
                  maxLength={10}
                  disabled={isCalculating}
                  className={`package-step__input package-step__input--value-field ${isCalculating ? 'package-step__input--disabled' : ''}`}
                />
              </div>
            </div>

            {/* COLUMNA 2: PESO */}
            <div className="package-step__col">
              <div className="package-step__field">
                <label className="package-step__label">Peso *</label>
                <div className="package-step__weight-container">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`package-step__input ${isCalculating ? 'package-step__input--disabled' : ''}`}
                    placeholder="0.00"
                    value={weight}
                    onChange={handleWeightInputChange}
                    disabled={isCalculating}
                  />
                  <button
                    type="button"
                    className="package-step__unit-toggle"
                    onClick={onWeightUnitToggle}
                    disabled={isCalculating}
                  >
                    {weightUnit.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* FIN NUEVO GRID */}

{/* DIMENSIONES (solo si es alto valor) */}
          {isHighValue && (
            <div className="package-step__dimensions">
              <p className="package-step__high-value-note">
                ⚠️ Alto valor detectado. Por favor ingresa las dimensiones del paquete.
              </p>
              
              <label className="package-step__label">
                Dimensiones ({dimensionUnit})
              </label>
              
              <div className="package-step__dimensions-grid">
                <div className="package-step__dimension-input">
                  <label className="package-step__dimension-label">Largo</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`package-step__input ${isCalculating ? 'package-step__input--disabled' : ''}`}
                    placeholder="0.0"
                    value={dimensions.length}
                    onChange={(e) => handleDimensionInputChange('length', e)}
                    disabled={isCalculating}
                  />
                </div>
                
                <div className="package-step__dimension-input">
                  <label className="package-step__dimension-label">Ancho</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`package-step__input ${isCalculating ? 'package-step__input--disabled' : ''}`}
                    placeholder="0.0"
                    value={dimensions.width}
                    onChange={(e) => handleDimensionInputChange('width', e)}
                    disabled={isCalculating}
                  />
                </div>
                
                <div className="package-step__dimension-input">
                  <label className="package-step__dimension-label">Alto</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`package-step__input ${isCalculating ? 'package-step__input--disabled' : ''}`}
                    placeholder="0.0"
                    value={dimensions.height}
                    onChange={(e) => handleDimensionInputChange('height', e)}
                    disabled={isCalculating}
                  />
                </div>
              </div>
            </div>
          )}
          
          
          {/* ✅ CONTENIDOS MÚLTIPLES (Este se queda en una columna) */}
          <div className="package-step__field">
            <div className="package-step__label-container">
              <label className="package-step__label">
                Contenido * {localContenidos.length > 0 && `(${localContenidos.length} seleccionado${localContenidos.length !== 1 ? 's' : ''})`}
              </label>
            </div>
            
            <SearchableSelect
              options={contentOptions}
              value="" // Siempre vacío para permitir selección múltiple
              onChange={handleSearchableContentChange}
              placeholder={
                localContenidos.length > 0 
                  ? `${localContenidos.length} contenido(s) seleccionado(s)` 
                  : "Seleccionar contenidos"
              }
              disabled={isCalculating}
              className="package-step__content-select"
            />

            {/* Chips de contenidos seleccionados */}
            {localContenidos.length > 0 && (
              <div className="package-step__selected-contents">
                {localContenidos.map(id => {
                  const item = contentOptions.find(opt => opt.value === id);
                  return item ? (
                    <div key={id} className="package-step__content-chip">
                      <span>{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleContentToggle(id)}
                        className="package-step__content-chip-remove"
                        disabled={isCalculating}
                        aria-label={`Eliminar ${item.label}`}
                      >
                        ✕
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        
          
        </div>
      </div>

      {/* BOTONES */}
      <div className="package-step__buttons">
        <button
          type="button"
          className={`package-step__calculate-button ${isCalculating ? 'package-step__button--disabled' : ''}`}
          onClick={onCalculate}
          disabled={isCalculating}
        >
          {isCalculating ? (
            <div className="package-step__loading">
              <span className="package-step__spinner"></span>
              <span>Calculando...</span>
            </div>
          ) : (
            'Calcular'
          )}
        </button>
        
        <button
          type="button"
          className="package-step__back-button"
          onClick={onBack}
          disabled={isCalculating}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default PackageStep;