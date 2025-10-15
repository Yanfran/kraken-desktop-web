import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Sidebar from '../../Sidebar/Sidebar';
import TopNavigation from '../../TopNavigation/TopNavigation';
import MobileBlock from '../../MobileBlock/MobileBlock'; // ✅ NUEVO
import '../../../pages/dashboard/Dashboard.styles.scss';

const DashboardLayout = ({ children }) => {
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // ✅ NUEVO

  // ✅ Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Bloquear para pantallas menores a 768px
      
      // Gestionar sidebar según tamaño
      if (width >= 1200) {
        setSidebarOpen(true); // Desktop: abierto
      } else if (width < 768) {
        setSidebarOpen(false); // Mobile: cerrado (aunque no se verá)
      } else {
        setSidebarOpen(false); // Tablet: cerrado por defecto
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth < 1200) {
      setSidebarOpen(false);
    }
  };

  // ✅ Si es móvil, mostrar página de bloqueo
  if (isMobile) {
    return <MobileBlock />;
  }

  // ✅ Si es tablet o desktop, mostrar dashboard normal
  return (
    <div className="dashboard-container" data-theme={actualTheme}>
      {sidebarOpen && window.innerWidth < 1200 && (
        <div 
          className="dashboard-sidebar__overlay" 
          onClick={handleCloseSidebar}
        />
      )}
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />
      
      <main className="dashboard-main">
        <TopNavigation 
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;