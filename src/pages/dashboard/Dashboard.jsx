// src/pages/dashboard/Dashboard.jsx - ACTUALIZADO CON HOME
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Importar componentes separados
import Sidebar from '../../components/Sidebar/Sidebar';
import TopNavigation from '../../components/TopNavigation/TopNavigation';
import Home from './Home/Home';
import './Dashboard.styles.scss';

const Dashboard = () => {
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');

  // Estados para datos del dashboard (para otras pestañas)
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

  // Función para renderizar el contenido basado en activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Home />;
      
      case 'calcular':
        return (
          <div className="dashboard-content">
            <h2>Calculadora de Envíos</h2>
            <p>Aquí irá la calculadora de costos de envío.</p>
          </div>
        );
      
      case 'pre-alertar':
        return (
          <div className="dashboard-content">
            <h2>Pre-Alertar Paquetes</h2>
            <p>Aquí irá el formulario para pre-alertar paquetes.</p>
          </div>
        );
      
      case 'rastrear':
        return (
          <div className="dashboard-content">
            <h2>Rastrear Envíos</h2>
            <p>Aquí irá el sistema de rastreo.</p>
          </div>
        );
      
      case 'mis-envios':
        return (
          <div className="dashboard-content">
            {/* Listado de Envíos Completo */}
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

                    <button className="dashboard-more-btn">⋮</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      
      case 'mis-pre-alertas':
        return (
          <div className="dashboard-content">
            <h2>Mis Pre-Alertas</h2>
            <p>Aquí irá la lista completa de pre-alertas.</p>
          </div>
        );
      
      default:
        return <Home />;
    }
  };

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

        {/* Dynamic Content Based on Active Tab */}
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;