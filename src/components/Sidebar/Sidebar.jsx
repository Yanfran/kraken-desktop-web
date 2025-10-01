// src/components/Sidebar/Sidebar.jsx - IMPORT CORREGIDO
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // ✅ CORREGIDO
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.styles.scss';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth(); // ✅ CAMBIO: usar signOut en lugar de logout
  const { actualTheme } = useTheme();
  const location = useLocation();

  const sidebarMenuItems = [
    { id: 'mis-envios', label: 'Mis Envíos', path: '/dashboard/mis-envios' },
    { id: 'mis-pre-alertas', label: 'Mis Pre-Alertas', path: '/pre-alert/list' },
    { id: 'perfil', label: 'Perfil de Usuario', path: '/profile', hasArrow: true },
    { id: 'facturacion', label: 'Facturación', path: '/billing', hasArrow: true },
    { id: 'seguridad', label: 'Seguridad', path: '/security', hasArrow: true }
  ];

  // ✅ FUNCIÓN DE LOGOUT MEJORADA
  const handleLogout = async () => {
    try {
      await signOut();
      // El AuthContext ya maneja la redirección
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`} data-theme={actualTheme}>
      {/* Overlay para mobile */}
      {isOpen && <div className="dashboard-sidebar__overlay" onClick={onClose} />}
      
      <div className="dashboard-sidebar__content">
        {/* User Profile */}
        <div className="dashboard-sidebar__user-profile">
          <div className="dashboard-sidebar__user-avatar">
            <span className="dashboard-sidebar__user-initial">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="dashboard-sidebar__user-info">
            <h3 className="dashboard-sidebar__user-name">
              {user?.name || 'Usuario'} {user?.lastName || ''}
            </h3>
            <p className="dashboard-sidebar__user-id">N° de Casillero</p>
            <p className="dashboard-sidebar__user-number">KV000111</p>
          </div>
        </div>

        {/* Casillero Info */}
        <div className="dashboard-sidebar__casillero-info">
          <p className="dashboard-sidebar__casillero-label">Casillero USA / Casillero CHINA</p>
          <button className="dashboard-sidebar__directions-btn">Ver direcciones</button>
        </div>

        {/* Sidebar Menu */}
        <nav className="dashboard-sidebar__menu">
          {sidebarMenuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`dashboard-sidebar__menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <span>{item.label}</span>
              {item.hasArrow && <span className="dashboard-sidebar__arrow">›</span>}
            </Link>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="dashboard-sidebar__language-selector">
          <span>Idioma</span>
          <div className="dashboard-sidebar__language-buttons">
            <button className="dashboard-sidebar__language-btn active">ES</button>
            <button className="dashboard-sidebar__language-btn">EN</button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="dashboard-sidebar__logout-btn" onClick={handleLogout}>
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;