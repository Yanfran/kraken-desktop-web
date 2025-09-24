// src/pages/dashboard/Dashboard/Dashboard.jsx - COMPLETO Y CORREGIDO
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
    },
    {
      id: 'TV',
      trackingNumber: '1847545474654444',
      status: 'Recibido en Almacén',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'USA',
      cost: '$6.40',
      preAlert: true
    },
    {
      id: 'TV',
      trackingNumber: 'HG141350004590',
      status: 'Enviado a Venezuela',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'USA',
      cost: '$118.12',
      preAlert: true
    },
    {
      id: 'TV',
      trackingNumber: 'TRF40045001548',
      status: 'Disponible para entrega',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'USA',
      cost: '$6.50',
      preAlert: true
    },
    {
      id: 'TV',
      trackingNumber: '1240014587TR40',
      status: 'Disponible para entrega',
      date: 'Feb 7, 2025 • 09:30',
      origin: 'CHINA',
      cost: '$10.00',
      preAlert: true
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

  // Función para obtener el estatus apropiado
  const getStatusClass = (status) => {
    if (status.toLowerCase().includes('pendiente')) return 'pending';
    if (status.toLowerCase().includes('recibido')) return 'received';
    if (status.toLowerCase().includes('enviado')) return 'shipped';
    if (status.toLowerCase().includes('disponible')) return 'ready';
    return 'pending';
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

      {/* Main Content Area - CLASES CORRECTAS */}
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
              {/* Listado de Envíos */}
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
                        <div className="dashboard-tracking-details">
                          <span className="dashboard-tracking-number">{shipment.trackingNumber}</span>
                          <span className="dashboard-item-type">{shipment.id}</span>
                        </div>
                      </div>

                      <div className="dashboard-status-info">
                        <span className={`dashboard-status ${getStatusClass(shipment.status)}`}>
                          {shipment.status}
                        </span>
                        <span className="dashboard-date">{shipment.date}</span>
                      </div>

                      <div className="dashboard-cost">
                        {shipment.cost}
                      </div>

                      <div className="dashboard-origin">
                        <div className="dashboard-origin-flag">
                          {shipment.origin === 'CHINA' ? '🇨🇳' : '🇺🇸'}
                        </div>
                        <span className="dashboard-origin-text">{shipment.origin}</span>
                      </div>

                      <button className="dashboard-more-options">
                        ⋮
                      </button>
                    </div>
                  ))}

                  {/* Banner de descuento solo para el primer envío sin pre-alerta */}
                  {shipments[0] && !shipments[0].preAlert && (
                    <div className="dashboard-discount-banner">
                      <span className="dashboard-no-prealert">
                        No tienes pre-alerta para este paquete
                      </span>
                      <span className="dashboard-discount">-10%</span>
                    </div>
                  )}
                </div>

                <button className="dashboard-see-all">
                  Ver todos los envíos →
                </button>
              </section>
            </>
          )}

          {activeTab === 'calcular' && (
            <section className="dashboard-section">
              <h2>Calculadora de Envíos</h2>
              <p>Aquí va el contenido de la calculadora...</p>
            </section>
          )}

          {activeTab === 'pre-alertar' && (
            <section className="dashboard-section">
              <h2>Pre-Alertar Paquetes</h2>
              <p>Aquí va el formulario para pre-alertar paquetes...</p>
            </section>
          )}

          {activeTab === 'rastrear' && (
            <section className="dashboard-section">
              <h2>Rastrear Envíos</h2>
              <p>Aquí va el sistema de rastreo...</p>
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

          {activeTab === 'perfil-usuario' && (
            <section className="dashboard-section">
              <h2>Perfil de Usuario</h2>
              <p>Aquí va la configuración del perfil...</p>
            </section>
          )}

          {activeTab === 'facturacion' && (
            <section className="dashboard-section">
              <h2>Facturación</h2>
              <p>Aquí va el historial de facturación...</p>
            </section>
          )}

          {activeTab === 'seguridad' && (
            <section className="dashboard-section">
              <h2>Seguridad</h2>
              <p>Aquí van las configuraciones de seguridad...</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;