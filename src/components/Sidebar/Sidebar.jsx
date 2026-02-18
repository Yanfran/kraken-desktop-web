// src/components/Sidebar/Sidebar.jsx
// ✅ VERSIÓN CORREGIDA CON MANEJO CORRECTO DE SUBMENÚS

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../core/context/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { updateAvatar } from '../../services/profile/profileService';
import AvatarSelector from '../AvatarSelector/AvatarSelector';
import KrakenOriginal from '../../../src/assets/images/avatars/Kraken-Original.png'; 
import KrakenChino from '../../../src/assets/images/avatars/Kraken-Chino.png'; 
import KrakenSam from '../../../src/assets/images/avatars/Kraken-Sam.png'; 
import KrakenAcademico from '../../../src/assets/images/avatars/Kraken-Academico.png'; 
import KrakenAgente from '../../../src/assets/images/avatars/Kraken-Agente.png'; 
import './Sidebar.styles.scss';

const AVATAR_SOURCES = {
  '1': KrakenOriginal,
  '2': KrakenChino,
  '3': KrakenSam,
  '4': KrakenAcademico,
  '5': KrakenAgente,
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, signOut, setUserState } = useAuth();
  const { tenant, isLoading } = useTenant();
  const { actualTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ ESTADO CORRECTO: Solo un booleano para el submenú de perfil
  const [profileSubMenuOpen, setProfileSubMenuOpen] = useState(false);
  const [avatarSelectorVisible, setAvatarSelectorVisible] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // ✅ OBTENER CONFIGURACIÓN DESDE BD (sin if/else)
  const sidebarConfig = tenant?.navigation?.sidebar || {};
  const showCasilleroInfo = sidebarConfig.showCasilleroInfo || false;
  const showStoresButton = sidebarConfig.showStoresButton || false;
  const sidebarMenuItems = sidebarConfig.menuItems || [];

  // Handlers
  const handleAvatarClick = () => {
    setAvatarSelectorVisible(true);
  };

  const handleAvatarSelect = async (avatarId) => {
    try {
      setIsUpdatingAvatar(true);
      const response = await updateAvatar(avatarId);
      
      if (response.success) {
        setUserState(prev => ({
          ...prev,
          avatarId: avatarId
        }));
        
        const updatedUserData = {
          ...JSON.parse(localStorage.getItem('userData') || '{}'),
          avatarId: avatarId
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        toast.success('Avatar actualizado correctamente');
        setAvatarSelectorVisible(false);
      } else {
        toast.error(response.message || 'Error al actualizar avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Error al actualizar el avatar');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // ✅ TOGGLE SIMPLE para el submenú de perfil
  const toggleProfileSubmenu = () => {
    setProfileSubMenuOpen(!profileSubMenuOpen);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
    onClose();
  };

  const handleSubItemClick = (path) => {
    navigate(path);
    onClose();
  };

  const currentAvatarId = user?.avatarId || '1';
  const currentAvatar = AVATAR_SOURCES[currentAvatarId] || AVATAR_SOURCES['1'];

  // Loading state
  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* Overlay para cerrar en mobile */}
      {isOpen && <div className="dashboard-sidebar__overlay" onClick={onClose} />}
      
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`} data-theme={actualTheme}>
        <div className="dashboard-sidebar__content">
          
          {/* ========== USER PROFILE SECTION ========== */}
          <div className="dashboard-sidebar__user-profile">
            <button 
              className="dashboard-sidebar__avatar-button"
              onClick={handleAvatarClick}
              type="button"
              disabled={isUpdatingAvatar}
            >
              <div className="dashboard-sidebar__user-avatar">
                <img 
                  src={currentAvatar} 
                  alt="Avatar" 
                  className="dashboard-sidebar__avatar-image"
                />
                <div className="dashboard-sidebar__avatar-edit-overlay">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              </div>
            </button>
            
            <div className="dashboard-sidebar__user-info">
              <h3 className="dashboard-sidebar__user-name">
                {user?.name || user?.nombres || 'Usuario'} {user?.lastName || user?.apellidos || ''}
              </h3>
              <p className="dashboard-sidebar__user-id">N° de Casillero</p>
              <p className="dashboard-sidebar__user-number">{user?.codCliente || 'N/A'}</p>
            </div>
          </div>

          {/* ========== CASILLERO INFO (Solo Venezuela) ========== */}
          {showCasilleroInfo && (
            <div className="dashboard-sidebar__casillero-info">
              <p className="dashboard-sidebar__casillero-label">Casillero USA / Casillero CHINA</p>
              <Link to="/addresses" className="dashboard-sidebar__directions-btn">
                Ver direcciones
              </Link>
            </div>
          )}

          {/* ========== BOTÓN VER TIENDAS (USA y España) ========== */}
          {showStoresButton && (
            <div className="dashboard-sidebar__casillero-info">              
              <Link to="/stores" className="dashboard-sidebar__directions-btn">
                🏪 Ver Nuestras Tiendas
              </Link>
            </div>
          )}

          {/* ========== MENU ITEMS DINÁMICOS ========== */}
          <nav className="dashboard-sidebar__menu">
            {sidebarMenuItems.map((item) => (
              <div key={item.id}>
                {item.hasSubMenu ? (
                  // ✅ ITEM CON SUBMENÚ
                  <>
                    <button
                      onClick={toggleProfileSubmenu}
                      className={`dashboard-sidebar__menu-item ${profileSubMenuOpen ? 'active' : ''}`}
                    >
                      <span className="dashboard-sidebar__menu-text">{item.label}</span>
                      <span className={`dashboard-sidebar__menu-arrow ${profileSubMenuOpen ? 'open' : ''}`}>
                        ›
                      </span>
                    </button>
                    
                    {/* ✅ SUBMENÚ (se muestra si profileSubMenuOpen es true) */}
                    {profileSubMenuOpen && (
                      <div className="dashboard-sidebar__submenu">
                        {item.subItems?.map((subItem) => (
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
                  // ✅ ITEM NORMAL (sin submenú)
                  <Link
                    to={item.path}
                    className={`dashboard-sidebar__menu-item ${
                      location.pathname === item.path ? 'active' : ''
                    }`}
                    onClick={() => window.innerWidth <= 768 && onClose()}
                  >
                    <span className="dashboard-sidebar__menu-text">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* ========== LOGOUT BUTTON ========== */}
          <button className="dashboard-sidebar__logout-btn" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ========== AVATAR SELECTOR MODAL ========== */}
      {avatarSelectorVisible && (
        <AvatarSelector
          currentAvatarId={currentAvatarId}
          onSelect={handleAvatarSelect}
          onClose={() => setAvatarSelectorVisible(false)}
          isUpdating={isUpdatingAvatar}
        />
      )}
    </>
  );
};

export default Sidebar;