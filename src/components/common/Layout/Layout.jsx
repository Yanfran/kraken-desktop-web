// src/components/common/Layout/Layout.jsx - IMPORT CORREGIDO
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // ✅ CORREGIDO
import './Layout.styles.scss';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth(); // ✅ CAMBIO: usar signOut
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      path: '/calculator',
      label: 'Calculadora',
      icon: '🧮',
    },
    {
      path: '/packages',
      label: 'Paquetes',
      icon: '📦',
    },
    {
      path: '/profile',
      label: 'Perfil',
      icon: '👤',
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`layout__sidebar ${sidebarOpen ? 'layout__sidebar--open' : 'layout__sidebar--closed'}`}>
        <div className="layout__sidebar-header">
          <div className="layout__logo">
            <span className="layout__logo-icon">🐙</span>
            {sidebarOpen && <span className="layout__logo-text">Kraken</span>}
          </div>
          <button 
            className="layout__sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="layout__nav">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`layout__nav-item ${location.pathname === item.path ? 'layout__nav-item--active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="layout__nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="layout__nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="layout__sidebar-footer">
          {sidebarOpen && user && (
            <div className="layout__user-info">
              <div className="layout__user-avatar">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="layout__user-details">
                <span className="layout__user-name">{user.name}</span>
                <span className="layout__user-email">{user.email}</span>
              </div>
            </div>
          )}
          
          <button 
            className="layout__logout-button"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            🚪
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`layout__main ${sidebarOpen ? 'layout__main--sidebar-open' : 'layout__main--sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;