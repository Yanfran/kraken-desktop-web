import React, { useState, useEffect } from 'react';
import NewsCarousel from '../../../components/NewsCarousel/NewsCarousel';
import './Home.styles.scss';

const Home = () => {
  const [lastShipment, setLastShipment] = useState({
    id: 'TV',
    trackingNumber: '0001111222223311',
    status: 'Pendiente de Pago',
    date: 'Feb 7, 2025 • 09:30',
    origin: 'CHINA',
    cost: '$8.50',
    discount: '-10%'
  });

  const [preAlerts, setPreAlerts] = useState([
    {
      id: 'TV',
      trackingNumber: '0001111222223311',
      status: 'Pre-alertado',
      date: 'Feb 7, 2025 • 09:30',
      deliveryLocation: 'Tienda: Chacao'
    },
    {
      id: 'Zapatos',
      trackingNumber: 'ZR05B41TRF55450',
      status: 'Pre-alertado',
      date: 'Feb 6, 2025 • 23:26',
      deliveryLocation: 'Domicilio: Oficina'
    }
  ]);

  // Datos de ejemplo para el carousel (simulando lo que viene del API)
  const [newsItems, setNewsItems] = useState([
    {
      id: 1,
      title: 'Esta es una novedad:',
      text: 'Tenemos un 10% de descuento en envíos Navideños',
      iconName: 'information-circle',
      backgroundColor: '#f0f8ff',
      textColor: '#333'
    },
    {
      id: 2,
      title: 'Promoción especial:',
      text: 'Envío gratis en compras mayores a $100',
      iconName: 'gift',
      backgroundColor: '#fff0f0',
      textColor: '#333'
    },
    {
      id: 3,
      title: 'Nueva ruta:',
      text: 'Ahora también enviamos a Ecuador y Perú',
      iconName: 'airplane',
      backgroundColor: '#f0fff0',
      textColor: '#333'
    }
  ]);

  return (
    <div className="dashboard-home">
      {/* Dirección de entrega */}
      <div className="delivery-address">
        <span className="delivery-address__label">Tu dirección de entrega</span>
        <div className="delivery-address__location">
          <span className="delivery-address__name">Tienda Chacao</span>
          <span className="delivery-address__icon">📍</span>
        </div>
      </div>

      {/* Último Envío */}
      <section className="last-shipment">
        <div className="last-shipment__header">
          <h2 className="last-shipment__title">Último Envío</h2>
          <div className="last-shipment__origin">
            <span className="last-shipment__origin-label">Origen</span>
            <div className="last-shipment__origin-info">
              <span className="last-shipment__origin-flag">🇨🇳</span>
              <span className="last-shipment__origin-country">CHINA</span>
            </div>
          </div>
        </div>

        <div className="last-shipment__content">
          <div className="last-shipment__tracking">
            <span className="last-shipment__label">N° Guía</span>
            <div className="last-shipment__tracking-info">
              <span className="last-shipment__number">{lastShipment.trackingNumber}</span>
              <span className="last-shipment__type">{lastShipment.id}</span>
            </div>
          </div>

          <div className="last-shipment__status">
            <span className="last-shipment__label">Estatus</span>
            <div className="last-shipment__status-info">
              <div className="last-shipment__status-badge pending">
                {lastShipment.status}
              </div>
              <span className="last-shipment__date">{lastShipment.date}</span>
            </div>
          </div>

          <div className="last-shipment__cost">
            <span className="last-shipment__label">Costo del envío</span>
            <span className="last-shipment__price">{lastShipment.cost}</span>
          </div>
        </div>

        {/* No pre-alertado */}
        <div className="last-shipment__alert">
          <span className="alert-icon">🚫</span>
          <span className="alert-text">No pre-alertado</span>
          <span className="alert-discount">Perdiste {lastShipment.discount}</span>
          <button className="alert-link">Ver todos</button>
        </div>
      </section>

      {/* Pre-Alertas Pendientes */}
      <section className="pre-alerts">
        <h2 className="pre-alerts__title">Pre-Alertas Pendientes</h2>
        
        <div className="pre-alerts__list">
          {preAlerts.map((alert, index) => (
            <div key={index} className="pre-alert-item">
              <div className="pre-alert-item__info">
                <div className="pre-alert-item__tracking">
                  <span className="pre-alert-item__label">Tracking</span>
                  <div className="pre-alert-item__tracking-info">
                    <span className="pre-alert-item__number">{alert.trackingNumber}</span>
                    <span className="pre-alert-item__type">{alert.id}</span>
                  </div>
                </div>

                <div className="pre-alert-item__status">
                  <span className="pre-alert-item__label">Estatus</span>
                  <div className="pre-alert-item__status-badge">
                    {alert.status}
                  </div>
                  <span className="pre-alert-item__date">{alert.date}</span>
                </div>

                <div className="pre-alert-item__delivery">
                  <span className="pre-alert-item__label">Entrega en</span>
                  <span className="pre-alert-item__location">{alert.deliveryLocation}</span>
                </div>
              </div>

              <button className="pre-alert-item__menu">
                ⋮
              </button>
            </div>
          ))}
        </div>

        <button className="pre-alerts__view-all">Ver todos</button>
      </section>

      {/* Carousel de Novedades */}
      <NewsCarousel 
        newsItems={newsItems}
        cardWidth={620}
        cardMargin={10}
      />
    </div>
  );
};

export default Home;