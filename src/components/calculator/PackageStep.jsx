// src/components/calculator/PackageStep.jsx
import React, { useEffect, useState } from 'react';
import CurrencyInput from '../common/CurrencyInput/CurrencyInput';
import './PackageStep.scss';
import { ChevronDown, X } from 'lucide-react';

const HIGH_VALUE_THRESHOLD = 100; // Alineado con la app móvil

const PackageStep = ({
  declaredValue,
  contenidos,
  weight,
  weightUnit,
  dimensionUnit,
  dimensions,
  isHighValue,
  isCalculating = false,
  contentOptions,
  onDeclaredValueChange,
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

  const parseFormattedValue = (formattedValue) => {
    if (!formattedValue || formattedValue.trim() === '') return 0;
    if (formattedValue.includes(',')) {
      const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(cleanValue) || 0;
    }
    return parseFloat(formattedValue) || 0;
  };

  useEffect(() => {
    const numericValue = parseFormattedValue(declaredValue);
    const shouldBeHighValue = numericValue > HIGH_VALUE_THRESHOLD;
    
    if (shouldBeHighValue !== isHighValue) {
      onHighValueChange?.(shouldBeHighValue);
    }
  }, [declaredValue, isHighValue, onHighValueChange]);

  const handleDeclaredValueChange = (formattedValue, numericValue) => {
    onDeclaredValueChange(formattedValue);
  };

  const handleWeightInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onWeightChange(value);
    }
  };

  const handleDimensionInputChange = (dimension, e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onDimensionChange(dimension, value);
    }
  };

  const handleContentToggle = (value) => {
    if (!value) return;
    const newContenidos = localContenidos.includes(value)
      ? localContenidos.filter(id => id !== value)
      : [...localContenidos, value];
    
    setLocalContenidos(newContenidos);
    onContenidosChange(newContenidos);
  };

  return (
    <div className="package-step">
      <div className="package-step__form">
        
        {/* VALOR DECLARADO (FOB) */}
        <div className="package-step__field">
          <label className="package-step__label">Valor declarado (FOB) *</label>
          <div className="package-step__input-container">
            <div className="package-step__currency-badge">
              <span>USD</span>
              <ChevronDown size={16} />
            </div>
            <CurrencyInput
              value={declaredValue}
              onChange={handleDeclaredValueChange}
              placeholder="0,00"
              maxLength={10}
              disabled={isCalculating}
              className="package-step__input"
            />
          </div>
        </div>

        {/* CONTENIDOS MÚLTIPLES */}
        <div className="package-step__field">
          <label className="package-step__label">
            Contenido * {localContenidos.length > 0 && `(${localContenidos.length})`}
          </label>
          <div className="package-step__dropdown-container">
            <select 
              className="package-step__select"
              value=""
              onChange={(e) => handleContentToggle(e.target.value)}
              disabled={isCalculating}
            >
              <option value="">
                {localContenidos.length > 0 
                  ? `${localContenidos.length} contenido(s) seleccionado(s)` 
                  : "Seleccionar contenidos"}
              </option>
              {contentOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

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
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* UNIDADES */}
        <div className="package-step__units-section">
          <h3 className="package-step__units-title">Unidades de medida</h3>
          <div className="package-step__units-toggle">
            <span className="package-step__units-label">Kg/cm</span>
            <button
              type="button"
              className={`package-step__toggle-switch ${weightUnit === 'lb' ? 'active' : ''}`}
              onClick={onWeightUnitToggle}
              disabled={isCalculating}
            >
              <span className="package-step__toggle-thumb"></span>
            </button>
            <span className="package-step__units-label">Lbs/in</span>
          </div>
        </div>

        {/* PESO */}
        <div className="package-step__field">
          <label className="package-step__label">Peso ({weightUnit === 'kg' ? 'Kg' : 'Lbs'}) *</label>
          <input
            type="text"
            inputMode="decimal"
            className="package-step__input"
            placeholder="0,00"
            value={weight}
            onChange={handleWeightInputChange}
            disabled={isCalculating}
          />
        </div>

        {/* DIMENSIONES (solo si es alto valor) */}
        {isHighValue && (
          <div className="package-step__dimensions">
            <label className="package-step__label">Medidas ({dimensionUnit}) *</label>
            <p className="package-step__high-value-note">
              Requeridas para paquetes de alto valor (&gt;${HIGH_VALUE_THRESHOLD})
            </p>
            <div className="package-step__dimensions-grid">
              <div className="package-step__dimension-input">
                <label className="package-step__dimension-label">Largo</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="package-step__input"
                  placeholder="0,0"
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
                  className="package-step__input"
                  placeholder="0,0"
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
                  className="package-step__input"
                  placeholder="0,0"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionInputChange('height', e)}
                  disabled={isCalculating}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="package-step__buttons">
        <button
          type="button"
          className="package-step__calculate-button"
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