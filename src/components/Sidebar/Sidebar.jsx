// src/components/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { updateAvatar } from '../../services/profile/profileService';
import AvatarSelector from '../AvatarSelector/AvatarSelector';
import KrakenOriginal from '../../../src/assets/images/avatars/Kraken-Original.png'; 
import KrakenChino from '../../../src/assets/images/avatars/Kraken-Chino.png'; 
import KrakenSam from '../../../src/assets/images/avatars/Kraken-Sam.png'; 
import KrakenAcademico from '../../../src/assets/images/avatars/Kraken-Academico.png'; 
import KrakenAgente from '../../../src/assets/images/avatars/Kraken-Agente.png'; 
import './Sidebar.styles.scss';

// Mapeo de avatares disponibles (igual que en la app)
const AVATAR_SOURCES = {
  '1': KrakenOriginal,
  '2': KrakenChino,
  '3': KrakenSam,
  '4': KrakenAcademico,
  '5': KrakenAgente,
};

const Sidebar = ({ isOpen, onClose }) => {
  // ✅ CORREGIR: Usar setUserState en lugar de setUser
  const { user, signOut, setUserState } = useAuth();
  const { actualTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profileSubMenuOpen, setProfileSubMenuOpen] = useState(false);
  const [avatarSelectorVisible, setAvatarSelectorVisible] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // ✅ MENÚ ACTUALIZADO - IDÉNTICO A LA IMAGEN
  const sidebarMenuItems = [
    { id: 'mis-envios', label: 'Mis Envíos', path: '/guide/guides' },
    { id: 'mis-pre-alertas', label: 'Mis Pre-Alertas', path: '/pre-alert/list' },
    { 
      id: 'perfil', 
      label: 'Perfil de Usuario', 
      hasSubMenu: true,
      subItems: [
        { id: 'datos-personales', label: 'Datos Personales', path: '/profile/personal-data' },
        { id: 'direcciones', label: 'Direcciones', path: '/profile/addresses' },
        { id: 'change-password', label: 'Cambiar Contraseña', path: '/profile/change-password'}
        
      ]
    },
    // { id: 'facturacion', label: 'Facturación', path: '/billing', hasArrow: true },
    // { id: 'seguridad', label: 'Seguridad', path: '/security', hasArrow: true }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const toggleProfileSubMenu = () => {
    setProfileSubMenuOpen(!profileSubMenuOpen);
  };

  const handleSubItemClick = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  // ✅ FUNCIÓN PARA OBTENER EL AVATAR ACTUAL
  const getAvatarSource = () => {
    const avatarId = user?.avatarId || '1';
    return AVATAR_SOURCES[avatarId] || '/src/assets/images/about/circle_logo.png';
  };

  // ✅ ABRIR SELECTOR DE AVATAR
  const handleAvatarClick = () => {
    setAvatarSelectorVisible(true);
  };

  // ✅ CAMBIAR AVATAR - CORREGIDO
  const handleAvatarChange = async (newAvatarId) => {
    if (isUpdatingAvatar) return;

    try {
      setIsUpdatingAvatar(true);
      console.log('🎨 Iniciando cambio de avatar a:', newAvatarId);

      if (!user || !user.email) {
        toast.error('Usuario no válido. Por favor, inicia sesión nuevamente.');
        return;
      }

      // ✅ PASO 1: Actualizar en el backend
      const response = await updateAvatar(newAvatarId, user.email);

      if (response.success) {
        console.log('✅ Avatar actualizado en backend');
        
        // ✅ PASO 2: Actualizar el usuario en el contexto
        const updatedUser = { 
          ...user, 
          avatarId: newAvatarId
        };
        
        // ✅ PASO 3: Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log('💾 Avatar guardado en localStorage');
        
        // ✅ PASO 4: Actualizar contexto usando setUserState
        await setUserState(updatedUser);
        console.log('🔄 Contexto actualizado');
        
        // ✅ PASO 5: Cerrar modal y mostrar éxito
        setAvatarSelectorVisible(false);
        toast.success('Avatar actualizado exitosamente');
      } else {
        toast.error(response.message || 'Error al actualizar el avatar');
      }
    } catch (error) {
      console.error('❌ Error actualizando avatar:', error);
      toast.error('No se pudo actualizar el avatar. Intenta nuevamente.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <>
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`} data-theme={actualTheme}>
        {isOpen && <div className="dashboard-sidebar__overlay" onClick={onClose} />}
        
        <div className="dashboard-sidebar__content">
          {/* User Profile con Avatar Editable */}
          <div className="dashboard-sidebar__user-profile">
            {/* ✅ Avatar clickeable con indicador de edición */}
            <button 
              className="dashboard-sidebar__avatar-button"
              onClick={handleAvatarClick}
              type="button"
              disabled={isUpdatingAvatar}
            >
              <div className="dashboard-sidebar__user-avatar">
                <img 
                  src={getAvatarSource()} 
                  alt="Avatar" 
                  className="dashboard-sidebar__avatar-image"
                />
                {/* Overlay de edición */}
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
        {/* <div className="dashboard-sidebar__language-selector">
          <p className="dashboard-sidebar__language-label">Idioma</p>
          <div className="dashboard-sidebar__language-buttons">
            <button className="dashboard-sidebar__language-btn active">ES</button>
            <button className="dashboard-sidebar__language-btn">EN</button>
          </div>
        </div> */}

          {/* Logout Button */}
          <button className="dashboard-sidebar__logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ✅ MODAL DE SELECTOR DE AVATAR */}
      <AvatarSelector
        visible={avatarSelectorVisible}
        currentAvatarId={user?.avatarId || '1'}
        onSelect={handleAvatarChange}
        onCancel={() => setAvatarSelectorVisible(false)}
      />
    </>
  );
};

export default Sidebar;