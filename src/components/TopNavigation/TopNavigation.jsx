import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './TopNavigation.styles.scss';

const TopNavigation = ({ 
  onToggleSidebar, 
  sidebarOpen 
}) => {
  const { actualTheme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'inicio', 
      label: 'Inicio', 
      icon: '/src/assets/images/icon-kraken-web-pulpo-peq.png',
      iconAlt: '🏠',
      path: '/dashboard'
    },
    { 
      id: 'calcular', 
      label: 'Calcular', 
      icon: '/src/assets/images/icon-kraken-web-calculadora.png',
      iconAlt: '🧮',
      path: '/calculator'
    },
    { 
      id: 'pre-alertar', 
      label: 'Pre-Alertar', 
      icon: '/src/assets/images/icon-kraken-web-parlante_1.png',
      iconAlt: '📦',
      path: '/pre-alert'
    },
    { 
      id: 'rastrear', 
      label: 'Rastrear', 
      icon: '/src/assets/images/icon-kraken-web-rastrear-_1.png',
      iconAlt: '📍',
      path: '/rastrear'
    }
  ];

  return (
    <header className="top-navigation" data-theme={actualTheme}>
      {/* Parte Izquierda - Toggle móvil + Logo */}
      <div className="top-navigation__left">
        <button 
          className="top-navigation__sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          ☰
        </button>
        
        {/* Logo Kraken pegado a la izquierda */}
        <div className="top-navigation__logo-container">
          <img 
            src="/src/assets/images/logo.jpg" 
            alt="Kraken Logo" 
            className="top-navigation__logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div class="top-navigation__logo-fallback">KRAKEN<br><small>COURIER & CARGO</small></div>';
            }}
          />
        </div>
      </div>

      {/* Parte Central - Solo el menú azul, centrado */}
      <div className="top-navigation__center">
        <nav className="top-navigation__main-nav">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`top-navigation__nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="top-navigation__nav-icon-container">
                <img 
                  src={item.icon}
                  alt={item.label}
                  className="top-navigation__nav-icon-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<span class="top-navigation__nav-icon-emoji">${item.iconAlt}</span>`;
                  }}
                />
              </div>
              <span className="top-navigation__nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Parte Derecha */}
      {/* <div className="top-navigation__right">
        Información de entrega
        <div className="top-navigation__delivery-info">
          <span className="top-navigation__delivery-label">Tu dirección de entrega</span>
          <span className="top-navigation__delivery-location">
            Tienda Chacao
            <span className="top-navigation__location-icon">📍</span>
          </span>
        </div>
        
        Indicador Desktop
        <span className="top-navigation__desktop-indicator">DESKTOP</span>
        
        Iconos de la derecha
        <button 
          className="top-navigation__notifications"
          aria-label="Notificaciones"
        >
          🔔
        </button>
        
        Toggle de tema
        <button 
          className="top-navigation__theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Cambiar a modo ${actualTheme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {actualTheme === 'light' ? '🌙' : '☀️'}
        </button>
      </div> */}
    </header>
  );
};

export default TopNavigation;