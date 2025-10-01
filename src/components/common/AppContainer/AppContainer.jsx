// src/components/common/AppContainer/AppContainer.jsx
import React from 'react';
import './AppContainer.styles.scss';

const AppContainer = ({ children }) => {
  return (
    <div className="app-container">
      {children}
    </div>
  );
};

export default AppContainer;
