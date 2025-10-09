// src/components/common/TabNavigator/TabNavigator.jsx
import React from 'react';
import './TabNavigator.scss';

const TabNavigator = ({ currentStep, onTabPress }) => {
  const TABS = [
    { id: 1, label: 'Ruta' },
    { id: 2, label: 'Mi Paquete' },
    { id: 3, label: 'Resultado' },
  ];

  return (
    <div className="tab-navigator">
      {TABS.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <div
            className={`tab-navigator__item ${currentStep === tab.id ? 'active' : ''} ${currentStep > tab.id ? 'completed' : ''}`}
            onClick={() => onTabPress(tab.id)}
          >
            <div className="tab-navigator__step-circle">{currentStep > tab.id ? '✔' : tab.id}</div>
            <span className="tab-navigator__label">{tab.label}</span>
          </div>
          {index < TABS.length - 1 && <div className="tab-navigator__connector" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TabNavigator;
