// src/pages/dashboard/Dashboard/Dashboard.jsx - REFACTORIZADO
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

// Importar componentes separados
import Sidebar from '../../../components/Sidebar/Sidebar';
import TopNavigation from '../../../components/TopNavigation/TopNavigation';
import './Dashboard.styles.scss';

const Dashboard = () => {
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');

  // Estados para datos del dashboard (mantenemos los mismos datos)
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

  // Funciones de manejo
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Aplicar tema al contenedor principal
  useEffect(() => {
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
      dashboardContainer.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  // Cerrar sidebar en móvil cuando se cambia de pestaña
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [activeTab]);

  return (
    <div className="dashboard-container" data-theme={actualTheme}>
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Navigation Component */}
        <TopNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Mostrar contenido basado en activeTab */}
          {activeTab === 'inicio' && (
            <>
              {/* Último Envío */}
              <section className="dashboard-section">
                <div className="dashboard-section-header">
                  <h2>Listado de Envíos</h2>
                  <div className="dashboard-tabs">
                    <button className="dashboard-tab active">Activos</button>
                    <button className="dashboard-tab">Historial</button>
                  </div>
                </div>

                <div className="dashboard-shipments-table">
                  <div className="dashboard-table-header">
                    <span>N° Guía</span>
                    <span>Estatus</span>
                    <span>Costo del envío</span>
                    <span>Origen</span>
                    <span></span>
                  </div>

                  {shipments.map((shipment, index) => (
                    <div key={index} className="dashboard-table-row">
                      <div className="dashboard-tracking-info">
                        <div className="dashboard-package-icon">📦</div>
                        <div>
                          <span className="dashboard-tracking-number">{shipment.trackingNumber}</span>
                          <span className="dashboard-item-type">{shipment.id}</span>
                        </div>
                      </div>
                      <div className="dashboard-status-info">
                        <span className="dashboard-status pending">{shipment.status}</span>
                        <span className="dashboard-date">{shipment.date}</span>
                      </div>
                      <span className="dashboard-cost">{shipment.cost}</span>
                      <span className="dashboard-origin">{shipment.origin}</span>
                      <button className="dashboard-more-options">⋮</button>
                    </div>
                  ))}
                </div>

                {shipments[0]?.discount && (
                  <div className="dashboard-discount-banner">
                    <span className="dashboard-no-prealert">📋 No pre-alertado</span>
                    <span className="dashboard-discount">Perdiste {shipments[0].discount}</span>
                  </div>
                )}
              </section>

              {/* Pre-Alertas */}
              <section className="dashboard-section">
                <h2>Pre-Alertas Pendientes</h2>

                <div className="dashboard-prealerts-table">
                  <div className="dashboard-table-header">
                    <span>Tracking</span>
                    <span>Estatus</span>
                    <span>Entrega en</span>
                    <span></span>
                  </div>

                  {preAlerts.map((alert, index) => (
                    <div key={index} className="dashboard-table-row">
                      <div className="dashboard-tracking-info">
                        <div className="dashboard-package-icon">📦</div>
                        <div>
                          <span className="dashboard-tracking-number">{alert.trackingNumber}</span>
                          <span className="dashboard-item-type">{alert.id}</span>
                        </div>
                      </div>
                      <div className="dashboard-status-info">
                        <span className="dashboard-status prealert">{alert.status}</span>
                        <span className="dashboard-date">{alert.date}</span>
                      </div>
                      <div className="dashboard-delivery-info">
                        <span>{alert.deliveryLocation}</span>
                      </div>
                      <button className="dashboard-more-options">⋮</button>
                    </div>
                  ))}

                  <button className="dashboard-see-all-prealerts">Ver todos</button>
                </div>
              </section>

              {/* Banner Promocional */}
              <section className="dashboard-promo">
                <div className="dashboard-promo-content">
                  <div className="dashboard-promo-text">
                    <h3>Esta es una novedad:</h3>
                    <p>Tenemos un 10% de descuento en envíos Navideños</p>
                  </div>
                  <div className="dashboard-promo-graphic">
                    <div className="dashboard-promo-triangle">△</div>
                  </div>
                </div>
                
                {/* Pagination dots */}
                <div className="dashboard-promo-pagination">
                  <span className="dot active"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </section>
            </>
          )}

          {/* Contenido para otras pestañas */}
          {activeTab === 'calcular' && (
            <section className="dashboard-section">
              <h2>Calculadora de Envíos</h2>
              <p>Aquí irá el componente de calculadora...</p>
            </section>
          )}

          {activeTab === 'pre-alertar' && (
            <section className="dashboard-section">
              <h2>Pre-Alertar Paquetes</h2>
              <p>Aquí irá el formulario de pre-alertas...</p>
            </section>
          )}

          {activeTab === 'rastrear' && (
            <section className="dashboard-section">
              <h2>Rastrear Paquetes</h2>
              <p>Aquí irá el sistema de tracking...</p>
            </section>
          )}

          {activeTab === 'mis-envios' && (
            <section className="dashboard-section">
              <h2>Mis Envíos</h2>
              <p>Listado completo de todos mis envíos...</p>
            </section>
          )}

          {activeTab === 'mis-pre-alertas' && (
            <section className="dashboard-section">
              <h2>Mis Pre-Alertas</h2>
              <p>Listado completo de todas mis pre-alertas...</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;