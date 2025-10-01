// src/pages/dashboard/Dashboard.jsx - SOLO AGREGADA NAVEGACIÓN A PRE-ALERTAS (SIN CAMBIAR DISEÑO)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// Importar componentes separados
import Sidebar from '../../components/Sidebar/Sidebar';
import TopNavigation from '../../components/TopNavigation/TopNavigation';
import Home from './Home/Home';
import ShipmentsList from './ShipmentsList/ShipmentsList';
import './Dashboard.styles.scss';

const Dashboard = () => {
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');

  // Tu data existente (mantener igual)
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
      cost: '$21.25',
      preAlert: true
    }
  ]);

  // Responsive: cerrar sidebar automáticamente en mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Verificar al montar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers para sidebar
  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // 🆕 SOLO AGREGAR NAVEGACIÓN A PRE-ALERTAS (sin cambiar el resto)
  const navigateToTab = (tab) => {
    // Si es una pestaña de pre-alertas, navegar a las rutas correspondientes
    if (tab === 'mis-pre-alertas') {
      navigate('/pre-alert/list');
      return;
    }
    
    if (tab === 'pre-alertar') {
      navigate('/pre-alert');
      return;
    }

    // Para otras pestañas, mantener la lógica actual EXACTAMENTE igual
    setActiveTab(tab);
  };

  // Tu renderContent original (mantener EXACTAMENTE igual)
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Home onNavigateToShipments={() => navigateToTab('mis-envios')} />;
      
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
        return <ShipmentsList />;
      
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
        setActiveTab={navigateToTab} // 🆕 Usar la función que maneja navegación
      />

      {/* Main Content Area */}
      <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Navigation Component */}
        <TopNavigation 
          activeTab={activeTab}
          setActiveTab={navigateToTab} // 🆕 Usar la función que maneja navegación
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