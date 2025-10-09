// src/components/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.styles.scss';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { actualTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Estado para controlar el submenú de perfil
  const [profileSubMenuOpen, setProfileSubMenuOpen] = useState(false);

  const sidebarMenuItems = [
    { id: 'mis-envios', label: 'Mis Envíos', path: '/dashboard/mis-envios' },
    { id: 'mis-pre-alertas', label: 'Mis Pre-Alertas', path: '/pre-alert/list' },
    { 
      id: 'perfil', 
      label: 'Perfil de Usuario', 
      hasSubMenu: true, // ✅ Marcar que tiene submenú
      subItems: [
        { id: 'datos-personales', label: 'Datos Personales', path: '/profile/personal-data' },
        { id: 'direcciones', label: 'Direcciones', path: '/profile/addresses' }
      ]
    },
    { id: 'facturacion', label: 'Facturación', path: '/billing', hasArrow: true },
    { id: 'seguridad', label: 'Seguridad', path: '/security', hasArrow: true }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // ✅ Toggle del submenú de perfil
  const toggleProfileSubMenu = () => {
    setProfileSubMenuOpen(!profileSubMenuOpen);
  };

  // ✅ Navegar a subitem y cerrar sidebar en mobile
  const handleSubItemClick = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`} data-theme={actualTheme}>
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
            <p className="dashboard-sidebar__user-number">{user?.codCliente || 'KV000111'}</p>
          </div>
        </div>

        {/* Casillero Info */}
        <div className="dashboard-sidebar__casillero-info">
          <p className="dashboard-sidebar__casillero-label">Casillero USA / Casillero CHINA</p>
          <Link to="/addresses" className="dashboard-sidebar__directions-btn">
            Ver direcciones
          </Link>
        </div>

        {/* Sidebar Menu */}
        <nav className="dashboard-sidebar__menu">
          {sidebarMenuItems.map((item) => (
            <div key={item.id}>
              {/* ✅ Si tiene submenú, mostrar con toggle */}
              {item.hasSubMenu ? (
                <>
                  <button
                    onClick={toggleProfileSubMenu}
                    className={`dashboard-sidebar__menu-item ${profileSubMenuOpen ? 'active' : ''}`}
                  >
                    <span className="dashboard-sidebar__menu-text">{item.label}</span>
                    <span className={`dashboard-sidebar__menu-arrow ${profileSubMenuOpen ? 'open' : ''}`}>
                      ›
                    </span>
                  </button>
                  
                  {/* ✅ Submenú desplegable */}
                  {profileSubMenuOpen && (
                    <div className="dashboard-sidebar__submenu">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.path)}
                          className={`dashboard-sidebar__submenu-item ${
                            location.pathname === subItem.path ? 'active' : ''
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* ✅ Items normales sin submenú */
                <Link
                  to={item.path}
                  className={`dashboard-sidebar__menu-item ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                  onClick={() => window.innerWidth <= 768 && onClose()}
                >
                  <span className="dashboard-sidebar__menu-text">{item.label}</span>
                  {item.hasArrow && <span className="dashboard-sidebar__menu-arrow">›</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Idioma */}
        <div className="dashboard-sidebar__language-selector">
          <p className="dashboard-sidebar__language-label">Idioma</p>
          <div className="dashboard-sidebar__language-buttons">
            <button className="dashboard-sidebar__language-btn active">ES</button>
            <button className="dashboard-sidebar__language-btn">EN</button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="dashboard-sidebar__logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;