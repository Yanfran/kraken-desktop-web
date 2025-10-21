// src/components/calculator/ResultStep.jsx
import React, { useState } from 'react';
import './ResultStep.scss';

// Icons actualizados
import { 
  IoEyeOutline,        // Para el ojo 👁️
  IoEyeOffOutline,     // Para el ojo cerrado 🙈
} from 'react-icons/io5';

const ResultStep = ({ 
  result, 
  selectedState, 
  selectedMunicipality, 
  declaredValue, 
  originCountry,
  onNewCalculation 
}) => {
  const [expandedCards, setExpandedCards] = useState({
    oficina: false,
    domicilio: false
  });
  const [selectedCurrency, setSelectedCurrency] = useState('BS');
  const [exchangeRate, setExchangeRate] = useState(285);

  // ✅ Función para extraer valores numéricos
  const extractNumericValue = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'object' && value !== null) {
      return value.parsedValue || parseFloat(value.source) || 0;
    }
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return Number(value) || 0;
  };

  const formatNumberWithThousands = (value) => {
    const numValue = extractNumericValue(value);
    return numValue.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPrice = (price) => {
    const numPrice = extractNumericValue(price);
    if (selectedCurrency === 'BS') {
      return `${formatNumberWithThousands(numPrice * exchangeRate)} Bs.`;
    }
    return `${formatNumberWithThousands(numPrice)} USD`;
  };

  const toggleCard = (key) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 🆕 ACTUALIZADO: Renderizar detalles con DOS COLUMNAS
  const renderDetallesCompletos = (breakdown) => {
    if (!breakdown || !breakdown.detalles || breakdown.detalles.length === 0) {
      return <p className="result-step__no-data">No hay detalles disponibles</p>;
    }

    // ✅ Calcular suma sin Promo Prealerta
    let sumaSinPromoPrealerta = 0;
    
    breakdown.detalles.forEach((detalle) => {
      const isPromoPrealerta = detalle.descripcionItem === 'Promo Prealerta';
      const isSubtotal = detalle.categoria === 'SUBTOTAL';
      const isTotal = detalle.categoria === 'TOTAL_BS';
      
      if (!isPromoPrealerta && !isSubtotal && !isTotal) {
        const montoBs = extractNumericValue(detalle.montoBs);
        const montoUSD = extractNumericValue(detalle.montoUSD);
        const valor = selectedCurrency === 'BS' ? montoBs : montoUSD;
        sumaSinPromoPrealerta += valor;
      }
    });

    return (
      <div className="result-step__detalles-completos">
        {/* Header de columnas */}
        <div className="result-step__header-container">
          <div className="result-step__header-row">
            <div className="result-step__empty-header-cell" />
            <div className="result-step__header-cell result-step__header-cell--full">
              <span>Tarifa Full</span>
            </div>
            <div className="result-step__header-cell result-step__header-cell--discount">
              <span>Con Prealerta<br/>ahorra 10%</span>
            </div>
          </div>
        </div>

        {/* Filas de detalles */}
        <div className="result-step__detalles-rows">
          {breakdown.detalles.map((detalle) => {
            const isSubtotal = detalle.categoria === 'SUBTOTAL';
            const isTotal = detalle.categoria === 'TOTAL_BS';
            const isDescuento = detalle.esDescuento || detalle.categoria === 'DESCUENTO';

            const montoBs = extractNumericValue(detalle.montoBs);
            const montoUSD = extractNumericValue(detalle.montoUSD);
            const precio = selectedCurrency === 'BS' ? montoBs : montoUSD;

            // ✅ NO mostrar si AMBOS valores son 0 Y NO es subtotal ni total
            if (montoBs === 0 && montoUSD === 0 && !isSubtotal && !isTotal) {
              return null;
            }

            // ✅ Calcular Tarifa Full
            let precioTarifaFull = 0;
            
            if (detalle.descripcionItem === 'Promo Prealerta') {
              precioTarifaFull = 0;
            } else if (isSubtotal) {
              precioTarifaFull = sumaSinPromoPrealerta;
            } else if (isTotal) {
              const subtotalDetalle = breakdown.detalles.find(d => d.categoria === 'SUBTOTAL');
              const subtotalConDescuentos = extractNumericValue(
                selectedCurrency === 'BS' ? subtotalDetalle?.montoBs : subtotalDetalle?.montoUSD
              );
              const diferencia = precio - subtotalConDescuentos;
              precioTarifaFull = sumaSinPromoPrealerta + diferencia;
            } else {
              precioTarifaFull = precio;
            }

            const rowClass = `result-step__detalle-row ${
              isSubtotal ? 'result-step__detalle-row--subtotal' : ''
            } ${isTotal ? 'result-step__detalle-row--total' : ''} ${
              isDescuento ? 'result-step__detalle-row--descuento' : ''
            }`;

            return (
              <div key={detalle.numLinea} className={rowClass}>
                <div className="result-step__detalle-label-cell">
                  <span className={
                    isTotal 
                      ? 'result-step__detalle-label--total'
                      : isSubtotal 
                      ? 'result-step__detalle-label--bold'
                      : 'result-step__detalle-label'
                  }>
                    {detalle.descripcionItem}
                  </span>
                </div>
                
                {/* Columna Tarifa Full */}
                <div className="result-step__detalle-value-cell result-step__detalle-value-cell--full">
                  <span className={
                    isTotal
                      ? 'result-step__detalle-value--total'
                      : isSubtotal
                      ? 'result-step__detalle-value--bold'
                      : 'result-step__detalle-value'
                  }>
                    {detalle.descripcionItem === 'Promo Prealerta'
                      ? '-'
                      : selectedCurrency === 'BS'
                      ? `${formatNumberWithThousands(precioTarifaFull)} Bs.`
                      : `${formatNumberWithThousands(precioTarifaFull / exchangeRate)} USD`
                    }
                  </span>
                </div>
                
                {/* Columna Con Prealerta */}
                <div className="result-step__detalle-value-cell result-step__detalle-value-cell--discount">
                  <span className={
                    isTotal
                      ? 'result-step__detalle-value--total'
                      : isSubtotal
                      ? 'result-step__detalle-value--bold'
                      : isDescuento
                      ? 'result-step__detalle-value--descuento'
                      : 'result-step__detalle-value'
                  }>
                    {selectedCurrency === 'BS'
                      ? `${formatNumberWithThousands(precio)} Bs.`
                      : `${formatNumberWithThousands(precio / exchangeRate)} USD`
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCard = (title, breakdown, key) => {
    const isExpanded = expandedCards[key];
    
    // ✅ Calcular Tarifa Full para el header
    let tarifaFullTotal = 0;
    if (breakdown?.detalles) {
      breakdown.detalles.forEach((detalle) => {
        const isPromoPrealerta = detalle.descripcionItem === 'Promo Prealerta';
        const isSubtotal = detalle.categoria === 'SUBTOTAL';
        const isTotal = detalle.categoria === 'TOTAL_BS';
        
        if (!isPromoPrealerta && !isSubtotal && !isTotal) {
          const montoBs = extractNumericValue(detalle.montoBs);
          tarifaFullTotal += montoBs;
        }
      });
      
      const totalDetalle = breakdown.detalles.find(d => d.categoria === 'TOTAL_BS');
      const subtotalDetalle = breakdown.detalles.find(d => d.categoria === 'SUBTOTAL');
      
      if (totalDetalle && subtotalDetalle) {
        const totalBs = extractNumericValue(totalDetalle.montoBs);
        const subtotalBs = extractNumericValue(subtotalDetalle.montoBs);
        const diferencia = totalBs - subtotalBs;
        tarifaFullTotal += diferencia;
      }
    }
    
    const totalBs = extractNumericValue(breakdown?.totalBs);
    const totalUSD = extractNumericValue(breakdown?.total);
    
    const fullPriceBs = tarifaFullTotal || totalBs / 0.9;
    const fullPriceUSD = (tarifaFullTotal || totalUSD) / exchangeRate;

    return (
      <div className="result-step__card" key={key}>
        <div className="result-step__card-header" onClick={() => toggleCard(key)}>
          <div className="result-step__header-left">
            <div className="result-step__delivery-type">
              <span className="result-step__delivery-type-text">{title}</span>
            </div>
          </div>
          
          {/* ✅ DOS COLUMNAS DE PRECIOS */}
          <div className="result-step__prices-container">
            <div className="result-step__price-column result-step__price-column--full">
              <span className="result-step__price-value">
                {selectedCurrency === 'BS' 
                  ? `${formatNumberWithThousands(fullPriceBs)} Bs.`
                  : `${formatNumberWithThousands(fullPriceUSD)} USD`
                }
              </span>
            </div>
            
            <div className="result-step__price-column result-step__price-column--discount">
              <span className="result-step__price-value">
                {selectedCurrency === 'BS' 
                  ? `${formatNumberWithThousands(totalBs)} Bs.`
                  : `${formatNumberWithThousands(totalUSD)} USD`
                }
              </span>
            </div>
          </div>
          
          <button 
            type="button"
            className="result-step__eye-button"
            aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
          >
            {isExpanded ? <IoEyeOffOutline size={24} /> : <IoEyeOutline size={24} />}
          </button>
        </div>

        {isExpanded && (
          <div className="result-step__card-content">
            {renderDetallesCompletos(breakdown)}
          </div>
        )}
      </div>
    );
  };

  const isOptionAvailable = (optionType) => {
    return result?.data?.deliveryOptions?.some(option => option.type === optionType);
  };

  return (
    <div className="result-step">
      <div className="result-step__container">
        <p className="result-step__title">
          Envío desde {originCountry === 'US' ? '🇺🇸 Estados Unidos' : originCountry} 
          {' '}hasta {selectedState?.label}, {selectedMunicipality?.label} 🇻🇪
        </p>

        <div className="result-step__package-info">
          <p className="result-step__package-text">
            Valor declarado: ${declaredValue.toFixed(2)} USD
          </p>
        </div>

        <div className="result-step__cards">
          {isOptionAvailable('oficina') && result?.data?.breakdowns?.oficina && 
            renderCard('Retiro en Oficina', result.data.breakdowns.oficina, 'oficina')}
          
          {isOptionAvailable('domicilio') && result?.data?.breakdowns?.domicilio && 
            renderCard('Entrega a Domicilio', result.data.breakdowns.domicilio, 'domicilio')}
          
          {(!result?.data?.deliveryOptions || result.data.deliveryOptions.length === 0) && (
            <div className="result-step__no-options">
              <p>No hay opciones de entrega disponibles para esta ubicación.</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="result-step__new-calculation-button"
          onClick={onNewCalculation}
        >
          Nueva Cotización
        </button>
      </div>
    </div>
  );
};

export default ResultStep;