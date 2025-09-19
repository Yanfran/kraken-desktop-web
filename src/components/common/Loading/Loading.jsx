// src/components/common/Loading/Loading.jsx - Componente de carga
import React from 'react';
import './Loading.styles.scss';

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading">
      <div className="loading__spinner">
        <div className="loading__spinner-ring"></div>
        <div className="loading__spinner-ring"></div>
        <div className="loading__spinner-ring"></div>
      </div>
      <p className="loading__message">{message}</p>
    </div>
  );
};

export default Loading;