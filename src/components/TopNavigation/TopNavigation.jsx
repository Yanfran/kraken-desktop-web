// src/components/TopNavigation/TopNavigation.jsx
// ✅ SIMPLIFICADO: Elimina if/else, obtiene menús desde BD

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../core/context/TenantContext';
import './TopNavigation.styles.scss';
import iconPulpo from '../../../src/assets/images/icon-kraken-web-pulpo-peq.png'; 
import iconCalcula from '../../../src/assets/images/icon-kraken-web-calculadora.png'; 
import iconParlante from '../../../src/assets/images/icon-kraken-web-parlante_1.png'; 
import iconRastreo from '../../../src/assets/images/icon-kraken-web-rastrear-_1.png'; 
import iconLogo from '../../../src/assets/images/logo.jpg'; 

const TopNavigation = ({ onToggleSidebar, sidebarOpen }) => {
  const { actualTheme } = useTheme();
  const location = useLocation();
  const { tenant, isLoading } = useTenant();

  // ✅ MAPEO DE ÍCONOS LOCALES (mantener para compatibilidad con assets)
  const iconMap = {
    'home': iconPulpo,
    'calculator': iconCalcula,
    'calc': iconCalcula,
    'bell': iconParlante,
    'box': iconRastreo,
    'map-pin': iconRastreo,
  };

  const emojiMap = {
    'home': '🏠',
    'calculator': '🧮',
    'calc': '🧮',
    'bell': '📢',
    'box': '📦',
    'map-pin': '📍',
  };

  // ✅ OBTENER MENÚS DIRECTAMENTE DE LA BD (sin if/else)
  const menuItems = tenant?.navigation?.topMenu?.map(item => ({
    ...item,
    iconSrc: iconMap[item.icon],
    iconAlt: emojiMap[item.icon] || '•'
  })) || [];

  // Loading state
  if (isLoading) {
    return (
      <header className="top-navigation" data-theme={actualTheme}>
        <div className="top-navigation__loading">Cargando menú...</div>
      </header>
    );
  }

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
        
        <div className="top-navigation__logo-container">          
          <a 
            href="https://krakencourier.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={iconLogo} 
              alt="Kraken Logo" 
              className="top-navigation__logo-imag"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="top-navigation__logo-fallback">KRAKEN<br><small>COURIER & CARGO</small></div>';
              }}
            />
          </a>
        </div>
      </div>

      {/* Parte Central - Menú dinámico desde BD */}
      <div className="top-navigation__center">
        <nav className="top-navigation__main-nav">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`top-navigation__nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="top-navigation__nav-icon-container">
                {item.iconSrc ? (
                  <img
                    src={item.iconSrc}
                    alt={item.label}
                    className="top-navigation__nav-icon-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<span class="top-navigation__nav-icon-emoji">${item.iconAlt}</span>`;
                    }}
                  />
                ) : (
                  <span className="top-navigation__nav-icon-emoji">{item.iconAlt}</span>
                )}
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