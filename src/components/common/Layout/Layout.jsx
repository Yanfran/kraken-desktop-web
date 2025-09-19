// src/components/common/Layout/Layout.jsx - Layout principal para desktop
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import './Layout.styles.scss';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <div className="layout__user-name">{user.name}</div>
                <div className="layout__user-email">{user.email}</div>
              </div>
            </div>
          )}
          <button 
            className="layout__logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="layout__logout-icon">🚪</span>
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="layout__main">
        <header className="layout__header">
          <h1 className="layout__page-title">
            {navigationItems.find(item => item.path === location.pathname)?.label || 'Kraken Desktop'}
          </h1>
          <div className="layout__header-actions">
            <button className="layout__notification-btn">
              🔔
            </button>
          </div>
        </header>

        <div className="layout__content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;