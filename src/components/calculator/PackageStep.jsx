// src/components/calculator/PackageStep.jsx
// ✅ CORREGIDO - Dimensiones solo si FOB > 100 (CN y US)
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '../common/CurrencyInput/CurrencyInput';
import SearchableSelect from '../common/SearchableSelect/SearchableSelect';
import './PackageStep.scss';

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
  originCountry,
  contentOptions,
  onDeclaredValueChange,
  onContentChange,
  onContenidosChange,
  onWeightChange,
  onWeightUnitToggle,
  onDimensionChange,
  onCalculate,
  onBack,
  isCalculating,
  onHighValueChange
}) => {
  const { t } = useTranslation();
  const [localContenidos, setLocalContenidos] = useState(contenidos || []);

  useEffect(() => {
    setLocalContenidos(contenidos || []);
  }, [contenidos]);

  // Helper para parsear valores formateados
  const parseFormattedValue = (formattedValue) => {
    if (!formattedValue || formattedValue.trim() === '') return 0;
    
    if (formattedValue.includes(',')) {
      const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(cleanValue) || 0;
    }
    return parseFloat(formattedValue) || 0;
  };

  // 🆕 LÓGICA CORREGIDA: Dimensiones solo si FOB > 100 (para ambos países)
  const shouldShowDimensions = () => {
    const fobValue = parseFormattedValue(declaredValue);
    // ✅ Condición: Debe ser China Y el valor mayor a 100
    const showDims = originCountry === 'CN';    
    return showDims;
  };

  const showDimensions = shouldShowDimensions();

  const handleDeclaredValueCurrencyInputChange = (formattedValue, numericValue) => {
    onDeclaredValueChange(formattedValue, numericValue);
  };

  const handleWeightCurrencyInputChange = (formattedValue, numericValue) => {
    onWeightChange(formattedValue);
  };

  const handleDimensionCurrencyInputChange = (dimension) => (formattedValue, numericValue) => {
    onDimensionChange(dimension, formattedValue);
  };

  const handleSearchableContentChange = (value) => {
    if (value && !localContenidos.includes(value)) {
      const newContenidos = [...localContenidos, value];
      setLocalContenidos(newContenidos);
      onContenidosChange(newContenidos);
    }
  };

  const handleContentToggle = (contentId) => {
    const newContenidos = localContenidos.filter(id => id !== contentId);
    setLocalContenidos(newContenidos);
    onContenidosChange(newContenidos);
  };

  return (
    <div className="package-step">
      <div className="package-step__content">
        <div className="package-step__form">
          
          {/* ✅ VALOR DECLARADO Y PESO EN 2 COLUMNAS */}
          <div className="package-step__grid">
            {/* Valor Declarado */}
            <div className="package-step__field">
              <label className="package-step__label">
                {t('calculator.declared_value')} *
              </label>
              <CurrencyInput
                value={declaredValue}
                onChange={handleDeclaredValueCurrencyInputChange}
                placeholder="0,00"
                maxLength={10}
                disabled={isCalculating}
                className={`package-step__input ${isCalculating ? 'package-step__input--disabled' : ''}`}
              />
            </div>


           {/* Peso con toggle */}
            <div className="package-step__field">
              <label className="package-step__label">{t('calculator.weight')} *</label>

              {/* Input del peso */}
              <CurrencyInput
                value={weight}
                onChange={handleWeightCurrencyInputChange}
                placeholder="0,0"
                maxLength={6}
                disabled={isCalculating}
                className={`package-step__input ${isCalculating ? 'package-step__input--disabled' : ''}`}
              />

              {/* 👇 CONTENEDOR SOLO PARA EL SWITCHER, ABAJO Y A LA DERECHA 👇 */}
              <div className="package-step__switcher-container">
                <div className="package-step__unit-switcher">
                  <button
                    type="button"
                    className={`package-step__switcher-option ${weightUnit === 'kg' ? 'package-step__switcher-option--active' : ''}`}
                    onClick={() => weightUnit !== 'kg' && onWeightUnitToggle()}
                    disabled={isCalculating}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`package-step__switcher-option ${weightUnit === 'lb' ? 'package-step__switcher-option--active' : ''}`}
                    onClick={() => weightUnit !== 'lb' && onWeightUnitToggle()}
                    disabled={isCalculating}
                  >
                    lb
                  </button>
                </div>
              </div>
              {/* 👆 FIN CONTENEDOR DEL SWITCHER 👆 */}
            </div>


          </div>

         

          {/* 🆕 DIMENSIONES - SOLO SI FOB > 100 */}
          {showDimensions && (
            <div className="package-step__dimensions-section">
              <div className="package-step__dimensions-header">
                <label className="package-step__label">
                  {t('calculator.dimensions')}
                </label>
                {/* <span className="package-step__dimension-note">
                  {originCountry === 'CN' 
                    ? '🇨🇳 Alto valor desde China: Dimensiones para cálculo volumétrico'
                    : '📦 Alto valor: Dimensiones para cálculo volumétrico'}
                </span> */}
              </div>
              
              <div className="package-step__dimensions-grid">
                <div className="package-step__dimension-input">
                  <label className="package-step__dimension-label">{t('calculator.length')}</label>
                  <CurrencyInput
                    value={dimensions.length}
                    onChange={handleDimensionCurrencyInputChange('length')}
                    placeholder="0,0"
                    maxLength={5}
                    disabled={isCalculating}
                    className={`package-step__input package-step__input--dimension ${isCalculating ? 'package-step__input--disabled' : ''}`}
                  />
                </div>
                
                <div className="package-step__dimension-input">
                  <label className="package-step__dimension-label">{t('calculator.width')}</label>
                  <CurrencyInput
                    value={dimensions.width}
                    onChange={handleDimensionCurrencyInputChange('width')}
                    placeholder="0,0"
                    maxLength={5}
                    disabled={isCalculating}
                    className={`package-step__input package-step__input--dimension ${isCalculating ? 'package-step__input--disabled' : ''}`}
                  />
                </div>
                
                <div className="package-step__dimension-input">
                  <label className="package-step__dimension-label">{t('calculator.height')}</label>
                  <CurrencyInput
                    value={dimensions.height}
                    onChange={handleDimensionCurrencyInputChange('height')}
                    placeholder="0,0"
                    maxLength={5}
                    disabled={isCalculating}
                    className={`package-step__input package-step__input--dimension ${isCalculating ? 'package-step__input--disabled' : ''}`}
                  />
                </div>
              </div>
              
              <span className="package-step__unit-label">
                {t('calculator.unit_label')}: {dimensionUnit}
              </span>
            </div>
          )}
          
          {/* ✅ CONTENIDOS MÚLTIPLES */}
          <div className="package-step__field">
            <div className="package-step__label-container">
              <label className="package-step__label">
                {t('calculator.content')} * {localContenidos.length > 0 && `(${localContenidos.length} ${t('calculator.content_selected')})`}
              </label>
            </div>
            
            <SearchableSelect
              options={contentOptions}
              value=""
              onChange={handleSearchableContentChange}
              placeholder={
                localContenidos.length > 0
                  ? `${localContenidos.length} ${t('calculator.content_selected')}`
                  : t('calculator.select_content')
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
              <span>{t('calculator.calculating')}</span>
            </div>
          ) : (
            t('calculator.calculate')
          )}
        </button>
        
        <button
          type="button"
          className="package-step__back-button"
          onClick={onBack}
          disabled={isCalculating}
        >
          {t('calculator.back')}
        </button>
      </div>
    </div>
  );
};

export default PackageStep;