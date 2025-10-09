// src/components/calculator/ResultStep.jsx
import React, { useState, useEffect } from 'react';
import './ResultStep.scss';
import axiosInstance from '../../services/axiosInstance';
import { API_URL } from '../../utils/config';

const ResultStep = ({
  result,
  selectedState,
  selectedMunicipality,
  declaredValue,
  originCountry,
  onNewCalculation
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('BS');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [exchangeDetails, setExchangeDetails] = useState(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      setIsLoadingRate(true);
      const response = await axiosInstance.get(`${API_URL}/ExchangeRate/current`);
      
      if (response.data?.success && response.data?.data) {
        setExchangeRate(response.data.data.rate);
        setExchangeDetails({
          source: response.data.data.source,
          lastUpdate: new Date(response.data.data.lastUpdate),
          isFromCache: response.data.data.isFromCache
        });
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate(102.16); // Fallback
    } finally {
      setIsLoadingRate(false);
    }
  };

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

  const renderBreakdownColumns = (breakdown) => {
    const subtotalConDescuento = breakdown?.subtotal || 0;
    const subtotalSinDescuento = breakdown?.subtotalSinDescuento || subtotalConDescuento / 0.9;
    const franqueoPostal = breakdown?.franqueoPostal || 0;
    const ivaConDescuento = breakdown?.iva || 0;
    const ivaSinDescuento = breakdown?.ivaSinDescuento || (subtotalSinDescuento * 0.16);
    const totalConDescuento = breakdown?.totalConDescuento || breakdown?.total || 0;
    const totalSinDescuento = breakdown?.totalSinDescuento || (subtotalSinDescuento + franqueoPostal + ivaSinDescuento);

    return (
      <div className="result-step__columns-breakdown">
        {/* Fila SUBTOTAL */}
        <div className="result-step__breakdown-row">
          <span className="result-step__concept-label">SUBTOTAL</span>
          <span className="result-step__full-price-value">{formatPrice(subtotalSinDescuento)}</span>
          <span className="result-step__discount-price-value">{formatPrice(subtotalConDescuento)}</span>
        </div>
        
        {/* Fila Franqueo Postal */}
        <div className="result-step__breakdown-row">
          <span className="result-step__concept-label">Franqueo Postal</span>
          <span className="result-step__full-price-value">{formatPrice(franqueoPostal)}</span>
          <span className="result-step__discount-price-value">{formatPrice(franqueoPostal)}</span>
        </div>
        
        {/* Fila IVA */}
        <div className="result-step__breakdown-row">
          <span className="result-step__concept-label">IVA</span>
          <span className="result-step__full-price-value">{formatPrice(ivaSinDescuento)}</span>
          <span className="result-step__discount-price-value">{formatPrice(ivaConDescuento)}</span>
        </div>
        
        {/* Fila TOTAL */}
        <div className="result-step__breakdown-row result-step__total-row">
          <span className="result-step__concept-label result-step__total-label">TOTAL</span>
          <span className="result-step__full-price-value result-step__total-value">
            {formatPrice(totalSinDescuento)}
          </span>
          <span className="result-step__discount-price-value result-step__total-value">
            {formatPrice(totalConDescuento)}
          </span>
        </div>
      </div>
    );
  };

  const renderCard = (title, breakdown, key) => {
    const isExpanded = expandedCards[key];
    const total = breakdown?.totalConDescuento || breakdown?.total || 0;

    return (
      <div className="result-step__card" key={key}>
        {/* Header de la card */}
        <div className="result-step__card-header" onClick={() => toggleCard(key)}>
          <div className="result-step__header-left">
            <div className="result-step__delivery-type">
              <span className="result-step__delivery-type-text">{title}</span>
            </div>
          </div>
          
          <div className="result-step__header-center">
            <span className="result-step__price-text">{formatPrice(total)}</span>
          </div>
          
          <button 
            type="button"
            className="result-step__eye-button"
            aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
          >
            {isExpanded ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Contenido expandido */}
        {isExpanded && (
          <div className="result-step__expanded-content">
            {/* Headers de columnas */}
            <div className="result-step__header-container">
              <div className="result-step__header-row">
                <div className="result-step__delivery-type-cell"></div>
                <div className="result-step__empty-header-cell"></div>
                <div className="result-step__full-price-cell">
                  <span className="result-step__header-title">Tarifa Full</span>
                </div>
                <div className="result-step__discount-price-cell">
                  <span className="result-step__header-title">Con Prealerta</span>
                  <span className="result-step__discount-badge">-10%</span>
                </div>
              </div>
            </div>

            {/* Desglose */}
            {renderBreakdownColumns(breakdown)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="result-step">
      <div className="result-step__container">
        <p className="result-step__title">
          Tu paquete desde {originCountry === 'US' ? '🇺🇸 Estados Unidos' : originCountry} 
          {' '}hasta {selectedState?.label}, {selectedMunicipality?.label} 🇻🇪
        </p>

        <div className="result-step__package-info">
          <p className="result-step__package-text">
            Valor declarado: ${declaredValue.toFixed(2)} USD
          </p>
        </div>

        {/* Selector de moneda */}
        <div className="result-step__currency-selector">
          <div className="result-step__currency-header">
            <span className="result-step__currency-label">Ver precios en:</span>
            {!isLoadingRate && exchangeDetails && (
              <div className="result-step__rate-info">
                <span className="result-step__rate-text">
                  1 USD = {formatNumberWithThousands(exchangeRate)} Bs.
                </span>
                <span className="result-step__rate-details">
                  {exchangeDetails.source} • {exchangeDetails.lastUpdate.toLocaleDateString('es-VE')}
                </span>
              </div>
            )}
          </div>
          
          <div className="result-step__currency-toggle">
            <button
              type="button"
              className={`result-step__currency-button ${selectedCurrency === 'BS' ? 'result-step__active-currency' : ''}`}
              onClick={() => setSelectedCurrency('BS')}
            >
              <span className={`result-step__currency-option ${selectedCurrency === 'BS' ? 'result-step__active-currency-text' : ''}`}>
                Bolívares (Bs.)
              </span>
            </button>
            <button
              type="button"
              className={`result-step__currency-button ${selectedCurrency === 'USD' ? 'result-step__active-currency' : ''}`}
              onClick={() => setSelectedCurrency('USD')}
            >
              <span className={`result-step__currency-option ${selectedCurrency === 'USD' ? 'result-step__active-currency-text' : ''}`}>
                Dólares (USD)
              </span>
            </button>
          </div>
        </div>

        {/* Cards de resultados */}
        <div className="result-step__cards">
          {result?.data?.breakdowns?.oficina && renderCard('Retiro en Oficina', result.data.breakdowns.oficina, 'oficina')}
          {result?.data?.breakdowns?.domicilio && renderCard('Entrega a Domicilio', result.data.breakdowns.domicilio, 'domicilio')}
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