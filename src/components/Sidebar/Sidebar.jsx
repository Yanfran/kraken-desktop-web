// src/pages/dashboard/Dashboard/components/Sidebar/Sidebar.jsx
import React from 'react';
import { useAuth } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.styles.scss';

const Sidebar = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();

  const sidebarMenuItems = [
    { id: 'mis-envios', label: 'Mis Envíos' },
    { id: 'mis-pre-alertas', label: 'Mis Pre-Alertas' },
    { id: 'perfil', label: 'Perfil de Usuario', hasArrow: true },
    { id: 'facturacion', label: 'Facturación', hasArrow: true },
    { id: 'seguridad', label: 'Seguridad', hasArrow: true }
  ];

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
            <h3 className="dashboard-sidebar__user-name">Nombre</h3>
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
            <button
              key={item.id}
              className={`dashboard-sidebar__menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.label}</span>
              {item.hasArrow && <span className="dashboard-sidebar__arrow">›</span>}
            </button>
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
        <button className="dashboard-sidebar__logout-btn" onClick={logout}>
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;