import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

// Importar componentes separados
import Sidebar from '../../../components/Sidebar/Sidebar';
import TopNavigation from '../../../components/TopNavigation/TopNavigation';
import '../../../pages/dashboard/Dashboard.styles.scss';

const DashboardLayout = ({ children }) => {
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="dashboard-container" data-theme={actualTheme}>
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />
      <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <TopNavigation 
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;