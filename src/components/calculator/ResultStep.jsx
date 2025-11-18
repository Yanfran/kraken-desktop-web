// src/components/calculator/ResultStep.jsx
import React, { useState } from 'react';
import './ResultStep.scss';
import bannerCalculadora from '@/assets/images/banneer-calculadora.gif';


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

    // ✅ Calcular SUBTOTAL excluyendo SOLO el Descuento Prealerta (Tarifa Full)
    let subtotalSinDescuentoPrealerta = 0;
     
    breakdown.detalles.forEach((detalle) => {
      const isPromoPrealerta = detalle.descripcionItem === 'Descuento Prealerta';
      const isSubtotal = detalle.categoria === 'SUBTOTAL';
      const isTotal = detalle.categoria === 'TOTAL_BS';
      const isCargoPostSubtotal = ['CARGO_UNICO', 'IMPUESTO'].includes(detalle.categoria);
      
      // Sumamos todo EXCEPTO Descuento Prealerta, subtotal, total y cargos post-subtotal
      if (!isPromoPrealerta && !isSubtotal && !isTotal && !isCargoPostSubtotal) {
        const montoBs = extractNumericValue(detalle.montoBs);
        subtotalSinDescuentoPrealerta += montoBs;
      }
    });

    // console.log('Subtotal sin Descuento Prealerta (Tarifa Full):', subtotalSinDescuentoPrealerta);

    // ✅ Calcular IVA de Tarifa Full
    const seguroDetalle = breakdown.detalles.find(d => d.descripcionItem === 'Seguro');
    const franqueoDetalle = breakdown.detalles.find(d => d.descripcionItem === 'Franqueo Postal');
    const arancelDetalle = breakdown.detalles.find(d => d.descripcionItem === 'Arancel');
    
    const seguroBs = extractNumericValue(seguroDetalle?.montoBs);
    const franqueoBs = extractNumericValue(franqueoDetalle?.montoBs);
    const arancelBs = extractNumericValue(arancelDetalle?.montoBs);
    
    const baseImponibleFull = subtotalSinDescuentoPrealerta;
    const ivaFullBs = baseImponibleFull * 0.16;
    
    const totalFullBs = baseImponibleFull + ivaFullBs + seguroBs + franqueoBs + arancelBs;

    // console.log('Base Imponible Full:', baseImponibleFull);
    // console.log('IVA Full:', ivaFullBs);
    // console.log('Total Full:', totalFullBs);

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
            const isIVA = detalle.descripcionItem === 'IVA';
            const isDescuentoPrealerta = detalle.descripcionItem === 'Descuento Prealerta';

            const montoBs = extractNumericValue(detalle.montoBs);
            const montoUSD = extractNumericValue(detalle.montoUSD);
            const precioConPrealerta = selectedCurrency === 'BS' ? montoBs : montoUSD;

            // ✅ NO mostrar si AMBOS valores son 0 Y NO es subtotal ni total
            if (montoBs === 0 && montoUSD === 0 && !isSubtotal && !isTotal) {
              return null;
            }

            // ✅ Calcular TARIFA FULL según el tipo de ítem
            let precioTarifaFull = 0;
            
            if (isDescuentoPrealerta) {
              // En Tarifa Full NO existe el Descuento Prealerta
              precioTarifaFull = 0;
            } else if (isSubtotal) {
              // Subtotal = suma de servicios y descuentos EXCEPTO Descuento Prealerta
              precioTarifaFull = subtotalSinDescuentoPrealerta;
            } else if (isIVA) {
              // IVA recalculado para Tarifa Full
              precioTarifaFull = ivaFullBs;
            } else if (isTotal) {
              // Total completo de Tarifa Full
              precioTarifaFull = totalFullBs;
            } else {
              // Para todos los demás ítems (servicios, descuento lanzamiento, impuestos, etc.)
              precioTarifaFull = montoBs;
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
                      : isDescuento && !isDescuentoPrealerta
                      ? 'result-step__detalle-value--descuento'
                      : 'result-step__detalle-value'
                  }>
                    {isDescuentoPrealerta
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
                      ? `${formatNumberWithThousands(precioConPrealerta)} Bs.`
                      : `${formatNumberWithThousands(precioConPrealerta / exchangeRate)} USD`
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
  
  // ✅ DECLARAR la variable tarifaFullTotal
  let tarifaFullTotal = 0;
  
  if (breakdown?.detalles) {
    // Variable para acumular el subtotal
    let subtotalSinDescuentoPrealerta = 0;
    
    // Sumar servicios y descuentos EXCEPTO Descuento Prealerta
    breakdown.detalles.forEach((detalle) => {
      const isDescuentoPrealerta = detalle.descripcionItem === 'Descuento Prealerta';
      const isSubtotal = detalle.categoria === 'SUBTOTAL';
      const isTotal = detalle.categoria === 'TOTAL_BS';
      const isCargoPostSubtotal = ['CARGO_UNICO', 'IMPUESTO'].includes(detalle.categoria);
      
      if (!isDescuentoPrealerta && !isSubtotal && !isTotal && !isCargoPostSubtotal) {
        const montoBs = extractNumericValue(detalle.montoBs);
        subtotalSinDescuentoPrealerta += montoBs;
      }
    });
    
    // Agregar cargos post-subtotal (Seguro, Franqueo, Arancel)
    const seguroDetalle = breakdown.detalles.find(d => d.descripcionItem === 'Seguro');
    const franqueoDetalle = breakdown.detalles.find(d => d.descripcionItem === 'Franqueo Postal');
    const arancelDetalle = breakdown.detalles.find(d => d.descripcionItem === 'Arancel');
    
    const seguroBs = extractNumericValue(seguroDetalle?.montoBs);
    const franqueoBs = extractNumericValue(franqueoDetalle?.montoBs);
    const arancelBs = extractNumericValue(arancelDetalle?.montoBs);
    
    const baseImponibleFull = subtotalSinDescuentoPrealerta;
    const ivaFullBs = baseImponibleFull * 0.16;
    
    tarifaFullTotal = baseImponibleFull + ivaFullBs + seguroBs + franqueoBs + arancelBs;
    
    // console.log('Header - Subtotal sin Descuento Prealerta:', subtotalSinDescuentoPrealerta);
    // console.log('Header - Base Imponible Full:', baseImponibleFull);
    // console.log('Header - IVA Full:', ivaFullBs);
    // console.log('Header - Total Full:', tarifaFullTotal);
  }
  
  const totalBs = extractNumericValue(breakdown?.totalBs);
  const totalUSD = extractNumericValue(breakdown?.total);
  
  // Usar el cálculo correcto, o fallback al cálculo aproximado
  const fullPriceBs = tarifaFullTotal || totalBs / 0.9;
  const fullPriceUSD = fullPriceBs / exchangeRate;

  return (
    <div className="result-step__card" key={key}>
      <div className="result-step__card-header" onClick={() => toggleCard(key)}>
        <div className="result-step__header-left">
          <div className="result-step__delivery-type">
            <span className="result-step__delivery-type-text">{title}</span>
          </div>
        </div>
        
        {/* ✅ DOS COLUMNAS DE PRECIOS - Ahora con cálculo correcto */}
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
          

          {isOptionAvailable('domicilio') && result?.data?.breakdowns?.domicilio && 
            renderCard('Entrega a Domicilio', result.data.breakdowns.domicilio, 'domicilio')}                           

          {isOptionAvailable('oficina') && result?.data?.breakdowns?.oficina && 
            renderCard('Retiro en Tienda', result.data.breakdowns.oficina, 'oficina')}   
          
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
          Nuevo Cálculo
        </button>

        {/* ✅ NUEVO: Banner promocional alineado a la derecha */}
        <div className="result-step__promotional-banner">
          <img 
            src={bannerCalculadora} 
            alt="Banner promocional - Descuento 50%" 
            className="result-step__banner-image"
          />
        </div>
        
      </div>
    </div>
  );
};

export default ResultStep;