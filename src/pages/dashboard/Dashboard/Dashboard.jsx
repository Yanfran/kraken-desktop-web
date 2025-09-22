// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import './Dashboard.styles.scss';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { colors, actualTheme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');

  // Estados para datos del dashboard
  const [shipments, setShipments] = useState([
    {
      id: 'TV',
      trackingNumber: '0001111222223311',
      status: 'Pendiente de Pago',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'CHINA',
      cost: '$8.50',
      preAlert: false,
      discount: '-10%'
    }
  ]);

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

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: '🏠', active: true },
    { id: 'calcular', label: 'Calcular', icon: '🧮' },
    { id: 'pre-alertar', label: 'Pre-Alertar', icon: '📦' },
    { id: 'rastrear', label: 'Rastrear', icon: '📍' }
  ];

  const sidebarMenuItems = [
    { id: 'mis-envios', label: 'Mis Envíos' },
    { id: 'mis-pre-alertas', label: 'Mis Pre-Alertas' },
    { id: 'perfil', label: 'Perfil de Usuario', hasArrow: true },
    { id: 'facturacion', label: 'Facturación', hasArrow: true },
    { id: 'seguridad', label: 'Seguridad', hasArrow: true }
  ];

  // Aplicar tema al contenedor
  useEffect(() => {
    const dashboardContainer = document.querySelector('.dashboard');
    if (dashboardContainer) {
      dashboardContainer.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  return (
    <div className="dashboard" data-theme={actualTheme}>
      {/* Sidebar */}
      <aside className={`dashboard__sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* User Profile */}
        <div className="dashboard__user-profile">
          <div className="dashboard__user-avatar">
            <span className="dashboard__user-initial">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="dashboard__user-info">
            <h3 className="dashboard__user-name">Nombre</h3>
            <p className="dashboard__user-id">N° de Casillero</p>
            <p className="dashboard__user-number">KV000111</p>
          </div>
        </div>

        {/* Casillero Info */}
        <div className="dashboard__casillero-info">
          <p className="dashboard__casillero-label">Casillero USA / Casillero CHINA</p>
          <button className="dashboard__directions-btn">Ver direcciones</button>
        </div>

        {/* Sidebar Menu */}
        <nav className="dashboard__sidebar-menu">
          {sidebarMenuItems.map((item) => (
            <button
              key={item.id}
              className={`dashboard__sidebar-item ${item.id === 'mis-envios' ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.label}</span>
              {item.hasArrow && <span className="dashboard__arrow">›</span>}
            </button>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="dashboard__language-selector">
          <span>Idioma</span>
          <div className="dashboard__language-buttons">
            <button className="dashboard__language-btn active">ES</button>
            <button className="dashboard__language-btn">EN</button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="dashboard__logout-btn" onClick={logout}>
          CERRAR SESIÓN
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard__main">
        {/* Top Header */}
        <header className="dashboard__header">
          <div className="dashboard__header-left">
            <button 
              className="dashboard__sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="dashboard__logo">
              <img src="/logo-kraken.png" alt="Kraken" className="dashboard__logo-image" />
            </div>
          </div>

          <div className="dashboard__header-center">
            <nav className="dashboard__main-nav">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`dashboard__nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="dashboard__nav-icon">{item.icon}</span>
                  <span className="dashboard__nav-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="dashboard__header-right">
            <div className="dashboard__delivery-info">
              <span className="dashboard__delivery-label">Tu dirección de entrega</span>
              <span className="dashboard__delivery-location">Tienda Chacao</span>
            </div>
            <button className="dashboard__theme-toggle" onClick={toggleTheme}>
              {actualTheme === 'light' ? '🌙' : '☀️'}
            </button>
            <span className="dashboard__desktop-indicator">DESKTOP</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard__content">
          {/* Last Shipment */}
          <section className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>Último Envío</h2>
              <div className="dashboard__shipment-origin">
                <span>Origen</span>
                <strong>CHINA</strong>
              </div>
            </div>

            <div className="dashboard__shipment-card">
              <div className="dashboard__shipment-info">
                <div className="dashboard__shipment-row">
                  <span className="dashboard__label">N° Guía</span>
                  <span className="dashboard__label">Estatus</span>
                  <span className="dashboard__label">Costo del envío</span>
                </div>
                <div className="dashboard__shipment-row">
                  <span className="dashboard__tracking">{shipments[0].trackingNumber}</span>
                  <span className="dashboard__status pending">{shipments[0].status}</span>
                  <span className="dashboard__cost">{shipments[0].cost}</span>
                </div>
                <div className="dashboard__shipment-row">
                  <span className="dashboard__shipment-type">{shipments[0].id}</span>
                  <span className="dashboard__date">{shipments[0].date}</span>
                  <button className="dashboard__more-options">⋮</button>
                </div>
              </div>

              {shipments[0].discount && (
                <div className="dashboard__discount-banner">
                  <span className="dashboard__no-prealert">📋 No pre-alertado</span>
                  <span className="dashboard__discount">Perdiste {shipments[0].discount}</span>
                </div>
              )}

              <button className="dashboard__see-all">Ver todos</button>
            </div>
          </section>

          {/* Pre-Alerts */}
          <section className="dashboard__section">
            <h2>Pre-Alertas Pendientes</h2>

            <div className="dashboard__prealerts-table">
              <div className="dashboard__table-header">
                <span>Tracking</span>
                <span>Estatus</span>
                <span>Entrega en</span>
                <span></span>
              </div>

              {preAlerts.map((alert, index) => (
                <div key={index} className="dashboard__table-row">
                  <div className="dashboard__tracking-info">
                    <span className="dashboard__tracking-number">{alert.trackingNumber}</span>
                    <span className="dashboard__item-type">{alert.id}</span>
                  </div>
                  <div className="dashboard__status-info">
                    <span className="dashboard__status prealert">{alert.status}</span>
                    <span className="dashboard__date">{alert.date}</span>
                  </div>
                  <div className="dashboard__delivery-info-item">
                    <span>{alert.deliveryLocation}</span>
                  </div>
                  <button className="dashboard__more-options">⋮</button>
                </div>
              ))}

              <button className="dashboard__see-all-prealerts">Ver todos</button>
            </div>
          </section>

          {/* Promotional Banner */}
          <section className="dashboard__promo">
            <div className="dashboard__promo-content">
              <div className="dashboard__promo-text">
                <h3>Esta es una novedad:</h3>
                <p>Tenemos un 10% de descuento en envíos Navideños</p>
              </div>
              <div className="dashboard__promo-graphic">
                <div className="dashboard__promo-triangle">△</div>
              </div>
            </div>
            
            {/* Pagination dots */}
            <div className="dashboard__promo-pagination">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;