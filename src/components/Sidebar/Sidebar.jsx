// src/components/Sidebar/Sidebar.jsx
// ✅ VERSIÓN CORREGIDA CON MANEJO CORRECTO DE SUBMENÚS

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../core/context/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { updateAvatar } from '../../services/profile/profileService';
import AvatarSelector from '../AvatarSelector/AvatarSelector';
import CustomAlert from '../common/CustomAlert/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';
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
  const { alertProps, showConfirm } = useCustomAlert();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

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

  const safeParseUserData = () => {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw || raw === 'undefined' || raw === 'null') return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const handleAvatarSelect = async (avatarId) => {
    try {
      setIsUpdatingAvatar(true);
      const email = user?.email || safeParseUserData().email;
      if (!email) {
        toast.error(t('profile.email_error'));
        return;
      }
      const response = await updateAvatar(avatarId, email);

      if (response.success) {
        const baseUser = (user && typeof user === 'object') ? user : safeParseUserData();
        const updatedUserData = { ...baseUser, avatarId };
        setUserState(updatedUserData);

        toast.success(t('profile.avatar_updated'));
        setAvatarSelectorVisible(false);
      } else {
        toast.error(response.message || t('profile.avatar_error'));
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error(t('profile.avatar_error'));
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // ✅ TOGGLE SIMPLE para el submenú de perfil
  const toggleProfileSubmenu = () => {
    setProfileSubMenuOpen(!profileSubMenuOpen);
  };

  const handleLogout = () => {
    showConfirm(
      {
        title: t('auth.logout_confirm_title'),
        message: t('auth.logout_confirm_message'),
        type: 'warning',
        confirmText: t('auth.logout'),
        cancelText: t('common.cancel'),
      },
      async () => {
        await signOut();
        navigate('/login');
        onClose();
      }
    );
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
      <CustomAlert {...alertProps} />
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
                      <span className="dashboard-sidebar__menu-text">{t(`nav.${item.id}`, { defaultValue: item.label })}</span>
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
                            {t(`nav.${subItem.id}`, { defaultValue: subItem.label })}
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
                    <span className="dashboard-sidebar__menu-text">{t(`nav.${item.id}`, { defaultValue: item.label })}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* ========== LANGUAGE TOGGLE ========== */}
          {/* <button className="dashboard-sidebar__lang-btn" onClick={toggleLanguage} title={t('sidebar.language')}>
            🌐 {i18n.language === 'es' ? 'EN' : 'ES'}
          </button> */}

        {/* Idioma */}
        <div className="dashboard-sidebar__language-selector">
          <span className="dashboard-sidebar__language-label">{t('sidebar.language')}</span>
          <div className="dashboard-sidebar__language-buttons">
            <button
              className={`dashboard-sidebar__language-btn ${i18n.language === 'es' ? 'active' : ''}`}
              onClick={() => { i18n.changeLanguage('es'); localStorage.setItem('lang', 'es'); }}
            >ES</button>
            <button
              className={`dashboard-sidebar__language-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('lang', 'en'); }}
            >EN</button>
          </div>
        </div>

          {/* ========== LOGOUT BUTTON ========== */}
          <button className="dashboard-sidebar__logout-btn" onClick={handleLogout}>
            🚪 {t('auth.logout')}
          </button>
        </div>
      </aside>

      {/* ========== AVATAR SELECTOR MODAL ========== */}
      <AvatarSelector
        visible={avatarSelectorVisible}
        currentAvatarId={currentAvatarId}
        onSelect={handleAvatarSelect}
        onCancel={() => setAvatarSelectorVisible(false)}
        isUpdating={isUpdatingAvatar}
      />
    </>
  );
};

export default Sidebar;