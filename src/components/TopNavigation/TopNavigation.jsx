// src/pages/dashboard/Dashboard/components/TopNavigation/TopNavigation.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './TopNavigation.styles.scss';

const TopNavigation = ({ 
  activeTab, 
  setActiveTab, 
  onToggleSidebar, 
  sidebarOpen 
}) => {
  const { actualTheme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'calcular', label: 'Calcular', icon: '🧮' },
    { id: 'pre-alertar', label: 'Pre-Alertar', icon: '📦' },
    { id: 'rastrear', label: 'Rastrear', icon: '📍' }
  ];

  return (
    <header className="top-navigation" data-theme={actualTheme}>
      {/* Parte Izquierda - Solo toggle para móvil */}
      <div className="top-navigation__left">
        <button 
          className="top-navigation__sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          ☰
        </button>
      </div>

      {/* Parte Central - Logo Kraken + Menú Azul */}
      <div className="top-navigation__center">
        {/* Logo Kraken */}
        <div className="top-navigation__logo-container">
          <img 
            src="/src/assets/images/logo.jpg" 
            alt="Kraken Logo" 
            className="top-navigation__logo-image"
            onError={(e) => {
              // Fallback - mostrar texto si no encuentra la imagen
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div class="top-navigation__logo-fallback">KRAKEN<br><small>COURIER & CARGO</small></div>';
            }}
          />
        </div>

        {/* Menú Azul */}
        <nav className="top-navigation__main-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`top-navigation__nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="top-navigation__nav-icon">{item.icon}</span>
              <span className="top-navigation__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Parte Derecha */}
      <div className="top-navigation__right">
        {/* Información de entrega */}
        <div className="top-navigation__delivery-info">
          <span className="top-navigation__delivery-label">Tu dirección de entrega</span>
          <span className="top-navigation__delivery-location">
            Tienda Chacao
            <span className="top-navigation__location-icon">📍</span>
          </span>
        </div>
        
        {/* Indicador Desktop */}
        <span className="top-navigation__desktop-indicator">DESKTOP</span>
        
        {/* Toggle de tema */}
        <button 
          className="top-navigation__theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Cambiar a modo ${actualTheme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {actualTheme === 'light' ? '🌙' : '☀️'}
        </button>
        
        {/* Notificaciones */}
        <button className="top-navigation__notifications" aria-label="Notificaciones">
          🔔
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;