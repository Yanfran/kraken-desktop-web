// src/components/calculator/CalculatorHeader.jsx
import React from 'react';
import './CalculatorHeader.scss';
import calculatorIcon from '../../assets/images/icon-kraken-web-calculadora.png';

const TABS = [
  { id: 1, label: 'Ruta' },
  { id: 2, label: 'Mi Paquete' },
  { id: 3, label: 'Resultado' },
];

const CalculatorHeader = ({ 
  currentStep, 
  onTabPress,
  title = "Calcula tu envío",
  subtitle = "Descubre cuánto te costará traer tus compras desde USA"
}) => {
  return (
    <div className="calculator-header">
      {/* Logo/Icon */}
      <div className="calculator-header__icon-container">        
        <img
          src={calculatorIcon}
          alt="Calculator"
          className="calculator-header__icon"
        />
      </div>

      {/* Title and Subtitle */}
      <h1 className="calculator-header__title">{title}</h1>
      <p className="calculator-header__subtitle">{subtitle}</p>

      {/* Tab Navigation */}
      <div className="calculator-header__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`calculator-header__tab ${currentStep === tab.id ? 'calculator-header__tab--active' : ''}`}
            onClick={() => onTabPress?.(tab.id)}
            disabled={!onTabPress}
            type="button"
          >
            <span className={`calculator-header__tab-text ${currentStep === tab.id ? 'calculator-header__tab-text--active' : ''}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorHeader;