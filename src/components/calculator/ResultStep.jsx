// src/components/calculator/ResultStep.jsx
import React, { useEffect, useState } from 'react';
import './ResultStep.scss';

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

  // Función para formatear números con separadores de miles
  const formatNumberWithThousands = (value) => {
    return value.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPrice = (price) => {
    if (selectedCurrency === 'BS') {
      return `${formatNumberWithThousands(price * exchangeRate)} Bs.`;
    }
    return `${formatNumberWithThousands(price)} USD`;
  };

  const toggleCard = (key) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Renderizar lista completa de detalles
  const renderDetallesCompletos = (breakdown) => {
    if (!breakdown || !breakdown.detalles || breakdown.detalles.length === 0) {
      return <p className="result-step__no-data">No hay detalles disponibles</p>;
    }

    return (
      <div className="result-step__detalles-table">
        {breakdown.detalles.map((detalle) => {
          const isSubtotal = detalle.categoria === 'SUBTOTAL';
          const isTotal = detalle.categoria === 'TOTAL_BS';
          const isDescuento = detalle.esDescuento;

          // Extraer valor si viene como objeto {source, parsedValue}
          const getMonto = (value) => {
            if (typeof value === 'object' && value !== null) {
              return value.parsedValue || parseFloat(value.source) || 0;
            }
            return value || 0;
          };

          const montoBs = getMonto(detalle.montoBs);
          const montoUSD = getMonto(detalle.montoUSD);
          const monto = selectedCurrency === 'BS' ? montoBs : montoUSD;

          // ✅ NO MOSTRAR si el monto es 0 y NO es subtotal ni total
          if (monto === 0 && !isSubtotal && !isTotal) {
            return null;
          }

          const rowClass = `result-step__detalle-row ${
            isSubtotal ? 'result-step__detalle-row--subtotal' : ''
          } ${isTotal ? 'result-step__detalle-row--total' : ''} ${
            isDescuento ? 'result-step__detalle-row--descuento' : ''
          }`;

          const labelClass = isTotal 
            ? 'result-step__detalle-label--total'
            : isSubtotal 
            ? 'result-step__detalle-label--bold'
            : 'result-step__detalle-label';

          const valueClass = isTotal
            ? 'result-step__detalle-value--total'
            : isSubtotal
            ? 'result-step__detalle-value--bold'
            : 'result-step__detalle-value';

          return (
            <div key={detalle.numLinea} className={rowClass}>
              <span className={labelClass}>
                {detalle.descripcionItem}
              </span>
              <span className={valueClass}>
                {selectedCurrency === 'BS' 
                  ? `${formatNumberWithThousands(montoBs)} Bs.`
                  : `${formatNumberWithThousands(montoUSD)} USD`
                }
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCard = (title, breakdown, key) => {
    const isExpanded = expandedCards[key];
    const totalBs = breakdown?.totalBs || 0;
    const totalUSD = breakdown?.total || 0;

    return (
      <div className="result-step__card" key={key}>
        <div className="result-step__card-header" onClick={() => toggleCard(key)}>
          <div className="result-step__header-left">
            <div className="result-step__delivery-type">
              <span className="result-step__delivery-type-text">{title}</span>
            </div>
          </div>
          
          <div className="result-step__price-container">
            <span className="result-step__price-value">
              {selectedCurrency === 'BS' 
                ? `${formatNumberWithThousands(totalBs)} Bs.`
                : `${formatNumberWithThousands(totalUSD)} USD`
              }
            </span>
          </div>
          
          <button 
            type="button"
            className="result-step__eye-button"
            aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
          >
            {isExpanded ? '👁️' : '👁️‍🗨️'}
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

  // ✅ FUNCIÓN CORRECTA: Verificar si una opción está disponible en deliveryOptions
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

        {/* ✅ Cards de resultados - FILTRADAS según deliveryOptions */}
        <div className="result-step__cards">
          {/* ✅ Solo mostrar "Retiro en Oficina" si está en deliveryOptions */}
          {isOptionAvailable('oficina') && result?.data?.breakdowns?.oficina && 
            renderCard('Retiro en Oficina', result.data.breakdowns.oficina, 'oficina')}
          
          {/* ✅ Solo mostrar "Entrega a Domicilio" si está en deliveryOptions */}
          {isOptionAvailable('domicilio') && result?.data?.breakdowns?.domicilio && 
            renderCard('Entrega a Domicilio', result.data.breakdowns.domicilio, 'domicilio')}
          
          {/* ✅ Mensaje si no hay opciones disponibles */}
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