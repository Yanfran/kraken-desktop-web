// src/modules/us/pages/HomePage.jsx
// ✅ HOME PAGE ESPECÍFICA PARA USA (KU)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import './HomePage.scss';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data - Envíos recientes
  const recentShipments = [
    { id: 'ENV-1001', status: 'En tránsito', statusColor: 'orange', label: 'En tránsito' },
    { id: 'ENV-1002', status: 'Entregado', statusColor: 'green', label: 'En tránsito' },
    { id: 'ENV-1003', status: 'Entregado', statusColor: 'green', label: 'En tránsito' },
    { id: 'ENV-1004', status: 'Entregado', statusColor: 'green', label: 'En tránsito' },
  ];

  // Mock data - Direcciones guardadas
  const savedAddresses = [
    { id: 1, name: 'Oficina Central', icon: '🏢' },
    { id: 2, name: 'Hogar', icon: '🏠' },
    { id: 3, name: 'Venias', icon: '🏠' },
    { id: 4, name: 'Oficina Centra.', icon: '🏢' },
  ];

  // Mock data - Estadísticas
  const stats = [
    { label: 'Envíos Activos', value: '3' },
    { label: 'Total Entregados', value: '25' },
    { label: 'Envíos Mensual', value: '19' },
    { label: 'Gasto Mensual', value: '€120.50' },
  ];

  const handleNewPickup = () => {
    navigate('/pickup');
  };

  const handleViewShipment = (id) => {
    navigate(`/tracking/${id}`);
  };

  return (
    <div className="us-home">
      {/* Header de Bienvenida */}
      <div className="us-home__header">
        <h1 className="us-home__title">¡Hola, Bienvenido de nuevo!</h1>
        <p className="us-home__subtitle">
          Bienvenido para envíos y su patamentan Kraken Courier.
        </p>
      </div>

      {/* Botón Nueva Recogida */}
      <button className="us-home__pickup-btn" onClick={handleNewPickup}>
        <span className="us-home__pickup-icon">📦</span>
        <span className="us-home__pickup-text">Nueva Recogida</span>
      </button>

      {/* Grid Principal */}
      <div className="us-home__grid">
        {/* Columna Izquierda */}
        <div className="us-home__left">
          {/* Envíos Recientes */}
          <section className="us-home__section">
            <h2 className="us-home__section-title">Envíos Recientes</h2>
            <div className="us-home__shipments">
              {recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="us-home__shipment-item"
                  onClick={() => handleViewShipment(shipment.id)}
                >
                  <div className="us-home__shipment-info">
                    <span className="us-home__shipment-id">{shipment.id}</span>
                    <span className={`us-home__shipment-status us-home__shipment-status--${shipment.statusColor}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div className="us-home__shipment-action">
                    <span className="us-home__shipment-label">{shipment.label}</span>
                    <span className="us-home__shipment-arrow">›</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Columna Derecha */}
        <div className="us-home__right">
          {/* Direcciones Guardadas */}
          <section className="us-home__section">
            <h2 className="us-home__section-title">Direcciones Guardadas</h2>
            <div className="us-home__addresses">
              {savedAddresses.map((address) => (
                <div key={address.id} className="us-home__address-card">
                  <span className="us-home__address-icon">{address.icon}</span>
                  <span className="us-home__address-name">{address.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Ruta Frecuente */}
          <section className="us-home__section">
            <h2 className="us-home__section-title">Ruta Frecuente</h2>
            <div className="us-home__route">
              <span className="us-home__route-flag">🇪🇸</span>
              <span className="us-home__route-text">España → Venezuela</span>
              <span className="us-home__route-flag">🇻🇪</span>
            </div>
          </section>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="us-home__stats">
        {stats.map((stat, index) => (
          <div key={index} className="us-home__stat-card">
            <h3 className="us-home__stat-label">{stat.label}</h3>
            <p className="us-home__stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;