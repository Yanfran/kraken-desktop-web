// src/pages/dashboard/ShipmentsList/ShipmentsList.jsx
import React, { useState, useEffect } from 'react';
import './ShipmentsList.styles.scss';

const ShipmentsList = () => {
  const [activeTab, setActiveTab] = useState('activos');
  const [shipments, setShipments] = useState([
    {
      id: 'TV',
      trackingNumber: '0001111222223311',
      status: 'Pendiente de Pago',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'CHINA',
      cost: '$8.50',
      preAlert: false,
      statusColor: 'pending',
      prealertIcon: '🚫'
    },
    {
      id: 'TV',
      trackingNumber: '1847545474654444',
      status: 'Recibido en Almacén',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'USA',
      cost: '$6.40',
      preAlert: true,
      statusColor: 'received',
      prealertIcon: '📋'
    },
    {
      id: 'TV',
      trackingNumber: 'HG141350004590',
      status: 'Enviado a Venezuela',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'USA',
      cost: '$118.12',
      preAlert: true,
      statusColor: 'shipped',
      prealertIcon: '✅'
    },
    {
      id: 'TV',
      trackingNumber: 'TRF40045001548',
      status: 'Disponible para entrega',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'USA',
      cost: '$6.50',
      preAlert: true,
      statusColor: 'ready',
      prealertIcon: '✅'
    },
    {
      id: 'TV',
      trackingNumber: '1240014587TR40',
      status: 'Disponible para entrega',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'CHINA',
      cost: '$10.00',
      preAlert: true,
      statusColor: 'ready',
      prealertIcon: '✅'
    }
  ]);

  return (
    <div className="shipments-list">
      {/* Header */}
      <div className="shipments-list__header">
        <h1 className="shipments-list__title">Listado de Envíos</h1>
        
        <div className="shipments-list__tabs">
          <button 
            className={`shipments-list__tab ${activeTab === 'activos' ? 'active' : ''}`}
            onClick={() => setActiveTab('activos')}
          >
            Activos
          </button>
          <button 
            className={`shipments-list__tab ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            Historial
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="shipments-list__table-container">
        <div className="shipments-list__table">
          {/* Header de la tabla */}
          <div className="shipments-list__table-header">
            <div className="shipments-list__column-header">N° Guía</div>
            <div className="shipments-list__column-header">Estatus</div>
            <div className="shipments-list__column-header">Costo del envío</div>
            <div className="shipments-list__column-header">Origen</div>
            <div className="shipments-list__column-header"></div>
          </div>

          {/* Filas de datos */}
          {shipments.map((shipment, index) => (
            <div key={index} className="shipments-list__table-row">
              {/* N° Guía */}
              <div className="shipments-list__guia-cell">
                <div className="shipments-list__prealert-icon">
                  {shipment.prealertIcon}
                </div>
                <div className="shipments-list__guia-info">
                  <span className="shipments-list__tracking-number">
                    {shipment.trackingNumber}
                  </span>
                  <span className="shipments-list__item-type">
                    {shipment.id}
                  </span>
                </div>
              </div>

              {/* Estatus */}
              <div className="shipments-list__status-cell">
                <div className={`shipments-list__status-badge ${shipment.statusColor}`}>
                  {shipment.status}
                </div>
                <span className="shipments-list__date">
                  {shipment.date}
                </span>
              </div>

              {/* Costo */}
              <div className="shipments-list__cost-cell">
                <span className="shipments-list__cost">
                  {shipment.cost}
                </span>
              </div>

              {/* Origen */}
              <div className="shipments-list__origin-cell">
                <div className="shipments-list__origin-flag">
                  {shipment.origin === 'CHINA' ? '🇨🇳' : '🇺🇸'}
                </div>
                <span className="shipments-list__origin-text">
                  {shipment.origin}
                </span>
              </div>

              {/* Menú */}
              <div className="shipments-list__menu-cell">
                <button className="shipments-list__menu-button">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentsList;