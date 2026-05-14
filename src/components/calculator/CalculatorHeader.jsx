// src/components/calculator/CalculatorHeader.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './CalculatorHeader.scss';
import calculatorIcon from '../../assets/images/icon-kraken-web-calculadora.png';

const CalculatorHeader = ({
  currentStep,
  onTabPress,
  title,
  subtitle
}) => {
  const { t } = useTranslation();

  const TABS = [
    { id: 1, label: t('calculator.tab_route') },
    { id: 2, label: t('calculator.tab_package') },
    { id: 3, label: t('calculator.tab_result') },
  ];

  const resolvedTitle = title ?? t('calculator.title');
  const resolvedSubtitle = subtitle ?? t('calculator.subtitle');
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
      <h1 className="calculator-header__title">{resolvedTitle}</h1>
      <p className="calculator-header__subtitle">{resolvedSubtitle}</p>

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