// src/pages/dashboard/Home/Home.jsx - INTEGRACIÓN DE DIRECCIÓN
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NewsCarousel from '../../../components/NewsCarousel/NewsCarousel';
import { getLastShipment } from '../../../services/guiasService';
import { getPreAlertasPendientes, deletePreAlerta } from '../../../services/preAlertService';
import { getNovedades } from '../../../services/novedadesService';
import { useAddresses } from '@hooks/useAddresses'; 
import './Home.styles.scss';

// Icons
import { 
  IoChevronBack,
  IoCallOutline,
  IoCalendarOutline,
  IoPersonOutline,  
  IoSaveOutline,
  IoLocationOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoHelpOutline,
  IoTrashOutline,
  IoCardOutline,
  IoStorefrontOutline,
  IoHomeOutline
} from 'react-icons/io5';

const Home = ({ onNavigateToShipments }) => {
  const navigate = useNavigate();
  const { user } = useAuth();  
  const { 
    defaultAddressText, 
    isLoading: isLoadingAddress,
    error: addressError 
  } = useAddresses();

  // Debug: ver qué está pasando
  useEffect(() => {
    console.log('📍 Address state:', {
      defaultAddressText,
      isLoadingAddress,
      addressError
    });
  }, [defaultAddressText, isLoadingAddress, addressError]);
  
  // Loading states
  const [loading, setLoading] = useState({
    lastShipment: true,
    preAlerts: true,
    news: true
  });

  // Data states
  const [lastShipment, setLastShipment] = useState(null);
  const [preAlerts, setPreAlerts] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  
  // Menu states
  const [visibleMenus, setVisibleMenus] = useState({});
  const menuRefs = useRef({});
  
  // Error states
  const [errors, setErrors] = useState({
    lastShipment: null,
    preAlerts: null,
    news: null
  });

  /**
   * ✅ NUEVA: Formatear dirección desde el backend
   */
  // ✅ MEMOIZAR funciones auxiliares para evitar recrearlas
  const formatAddress = useCallback((direccion) => {
    if (!direccion) return 'Sin dirección';
    
    if (direccion.direccionTexto) {
      return direccion.direccionTexto;
    }
    
    if (direccion.tipo === 'store' || direccion.idLocker) {
      return direccion.nombreLocker 
        ? `Retiro en tienda: ${direccion.nombreLocker}` 
        : 'Retiro en tienda';
    }
    
    const parts = [];
    if (direccion.direccionCompleta) parts.push(direccion.direccionCompleta);
    if (direccion.nombreParroquia) parts.push(direccion.nombreParroquia);
    if (direccion.nombreMunicipio) parts.push(direccion.nombreMunicipio);
    if (direccion.nombreEstado) parts.push(direccion.nombreEstado);
    
    return parts.length > 0 ? parts.join(', ') : 'Sin dirección';
  }, []);

  /**
   * ✅ NUEVA: Acortar texto para que no se salga del diseño
   */
  const truncateText = useCallback((text, maxLength = 40) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  /**
   * ✅ ACTUALIZADO: Cargar pre-alertas con dirección
   */
  // ✅ OPTIMIZAR: Agregar useCallback a TODAS las funciones de carga
  const loadPreAlerts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, preAlerts: true }));
      setErrors(prev => ({ ...prev, preAlerts: null }));
      
      const response = await getPreAlertasPendientes();
      
      if (response.success && response.data) {
        const formattedPreAlerts = response.data.map(alert => ({
          id: alert.id,
          trackingNumber: Array.isArray(alert.trackings) 
            ? alert.trackings[0] 
            : alert.tracking || 'Sin tracking',
          trackingsCount: Array.isArray(alert.trackings) ? alert.trackings.length : 1,
          status: 'Pre-alertado',
          date: alert.fecha || alert.fechaCreacion || '',
          direccion: alert.direccion,
          deliveryLocation: formatAddress(alert.direccion),
          contenido: alert.contenido || 'Sin descripción'
        }));
        
        console.log('Formatted pre-alerts:', formattedPreAlerts);

        setPreAlerts(formattedPreAlerts);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          preAlerts: response.message || 'No se pudieron cargar las pre-alertas' 
        }));
      }
    } catch (error) {
      console.error('Error loading pre-alerts:', error);
      setErrors(prev => ({ 
        ...prev, 
        preAlerts: 'Error de conexión al cargar pre-alertas' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, preAlerts: false }));
    }
  }, [formatAddress]); // ✅ Agregar dependencia

  /**
   * Load last shipment from API
   */
  const loadLastShipment = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, lastShipment: true }));
      setErrors(prev => ({ ...prev, lastShipment: null }));
      
      const response = await getLastShipment();
      console.log('Last shipment response:', response);
      
      if (response.success && response.data) {
        setLastShipment(response.data);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          lastShipment: response.message || 'No se pudo cargar el último envío' 
        }));
      }
    } catch (error) {
      console.error('Error loading last shipment:', error);
      setErrors(prev => ({ 
        ...prev, 
        lastShipment: 'Error de conexión al cargar el último envío' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, lastShipment: false }));
    }
  }, []); // ✅ Sin dependencias externas

  /**
   * Load news/novedades from API
   */
  const loadNews = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, news: true }));
      setErrors(prev => ({ ...prev, news: null }));
      
      const response = await getNovedades();
      
      if (response.success && response.data) {
        const formattedNews = response.data
          .filter(item => item.mostrar === true)
          .map(item => ({
            id: item.id,
            title: item.title || item.titulo || 'Novedad',
            text: item.text || item.descripcion || item.contenido || '',
            iconName: item.iconName || item.icono || 'information-circle',
            backgroundColor: item.backgroundColor || item.colorFondo || '#f0f8ff',
            textColor: item.textColor || item.colorTexto || '#333'
          }));
        
        setNewsItems(formattedNews);
      } else {
        setNewsItems([]);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  }, []); // ✅ Sin dependencias externas


  // ✅ CARGAR TODO SOLO UNA VEZ cuando hay usuario
  useEffect(() => {
    if (user) {
      console.log('👤 User detected, loading data...');
      loadLastShipment();
      loadPreAlerts();
      loadNews();
    }
  }, [user]); 

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      const openMenus = Object.keys(visibleMenus).filter(key => visibleMenus[key]);
      openMenus.forEach(menuId => {
        if (menuRefs.current[menuId] && !menuRefs.current[menuId].contains(event.target)) {
          setVisibleMenus(prev => ({ ...prev, [menuId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visibleMenus]);

  /**
   * Toggle menu
   */
  const toggleMenu = (id) => {
    setVisibleMenus(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [id]: !prev[id]
    }));
  };

  /**
   * Menu handlers for last shipment
   */
  const handleViewDetailShipment = (shipment) => {
    console.log('Ver detalle shipment:', shipment);
    setVisibleMenus({});
    navigate(`/guide/detail/${shipment.id}`);
  };

  const handlePayShipment = (shipment) => {
    console.log('Pagar shipment:', shipment);
    setVisibleMenus({});
    navigate(`/payment/${shipment.id}`);
  };

  const handleHelpShipment = (shipment) => {
    console.log('Ayuda shipment:', shipment);
    setVisibleMenus({});
  };

  /**
   * Menu handlers for pre-alerts
   */
  const handleViewDetail = (alert) => {
    console.log('Ver detalle:', alert);
    setVisibleMenus({});
    navigate(`/pre-alert/${alert.id}`);
  };

  const handleEdit = (alert) => {
    console.log('Editar:', alert);
    setVisibleMenus({});
    navigate(`/pre-alert/edit/${alert.id}`);
  };

  const handleHelp = (alert) => {
    console.log('Ayuda:', alert);
    setVisibleMenus({});
  };

  const handleDelete = async (alert) => {
    if (window.confirm(`¿Estás seguro de eliminar la pre-alerta ${alert.trackingNumber}?`)) {
      setVisibleMenus({});
      try {
        const response = await deletePreAlerta(alert.id);
        if (response.success) {
          setPreAlerts(prev => prev.filter(p => p.id !== alert.id));
        } else {
          alert('Error al eliminar la pre-alerta');
        }
      } catch (error) {
        console.error('Error deleting pre-alert:', error);
        alert('Error de conexión al eliminar la pre-alerta');
      }
    }
  };

  /**
   * Get origin flag emoji
   */
  const getOriginFlag = (origin) => {
    const flags = {
      'USA': '🇺🇸',
      'CHINA': '🇨🇳',
      'ESPAÑA': '🇪🇸',
      'MEXICO': '🇲🇽'
    };
    return flags[origin?.toUpperCase()] || '🌍';
  };

  /**
   * Get status badge class
   */
  const getStatusClass = (status) => {
    const statusMap = {
      'Pendiente de Pago': 'pending',
      'Recibido en Almacén': 'received',
      'Enviado a Venezuela': 'in-transit',
      'Disponible para entrega': 'ready',
      'Entregado': 'delivered'
    };
    return statusMap[status] || 'pending';
  };

  return (
    <div className="dashboard-home">
      {/* Dirección de entrega */}
      <div className="delivery-address">
        <span className="delivery-address__label">Tu dirección de entrega</span>
        <div className="delivery-address__location">
          <span className="delivery-address__name">
            {defaultAddressText}
          </span>
          <span className="delivery-address__icon">
            <IoLocationOutline size={18}/>
          </span>
        </div>
      </div>

      {/* Último Envío */}
      <section className="last-shipment-card">
        <div className="last-shipment-card__header">
          <h2 className="last-shipment-card__title">Último Envío</h2>
          {lastShipment && (
            <div className="last-shipment-card__origin">
              <span className="last-shipment-card__origin-label">Origen</span>
              <div className="last-shipment-card__origin-info">
                <span className="last-shipment-card__origin-flag">
                  {getOriginFlag(lastShipment.origin)}
                </span>
                <span className="last-shipment-card__origin-country">
                  {lastShipment.origin}
                </span>
              </div>
            </div>
          )}
        </div>

        {loading.lastShipment ? (
          <div className="last-shipment-card__loading">
            <div className="spinner"></div>
            <p>Cargando último envío...</p>
          </div>
        ) : lastShipment ? (
          <>
            <div className="last-shipment-card__row">
              <div className="last-shipment-card__cell">
                <span className="last-shipment-card__label">N° Guía</span>
                <div className="last-shipment-card__value">
                  <span className="last-shipment-card__tracking">{lastShipment.trackingNumber}</span>
                  <span className="last-shipment-card__content">{lastShipment.contenido || 'TV'}</span>
                </div>
              </div>

              <div className="last-shipment-card__cell">
                <span className="last-shipment-card__label">Estatus</span>
                <div className="last-shipment-card__value">
                  <span className={`last-shipment-card__badge ${getStatusClass(lastShipment.status)}`}>
                    {lastShipment.status}
                  </span>
                  <span className="last-shipment-card__date">{lastShipment.date}</span>
                </div>
              </div>

              <div className="last-shipment-card__cell">
                <span className="last-shipment-card__label">Costo del envío</span>
                <span className="last-shipment-card__price">{lastShipment.cost}</span>
              </div>

              <div className="last-shipment-card__menu" ref={el => menuRefs.current['lastShipment'] = el}>
                <button 
                  className="last-shipment-card__menu-button"
                  onClick={() => toggleMenu('lastShipment')}
                  aria-label="Más opciones"
                >
                  ⋮
                </button>

                {visibleMenus['lastShipment'] && (
                  <div className="menu-dropdown">
                    <button onClick={() => handleViewDetailShipment(lastShipment)} className="menu-dropdown__item">
                      <span className="menu-dropdown__icon"><IoEyeOutline size={18}/></span>
                      Ver detalle
                    </button>
                    <button onClick={() => handlePayShipment(lastShipment)} className="menu-dropdown__item">
                      <span className="menu-dropdown__icon"><IoCardOutline size={18}/></span>
                      Pagar
                    </button>
                    <button onClick={() => handleHelpShipment(lastShipment)} className="menu-dropdown__item">
                      <span className="menu-dropdown__icon"><IoHelpOutline size={18}/></span>
                      Ayuda
                    </button>
                  </div>
                )}
              </div>

              {!lastShipment.prealerted && lastShipment.discount && (
                <div className="last-shipment-card__alert">
                  {/* <span className="alert-icon">🚫</span> */}
                  <span className="alert-text">No pre-alertado</span>
                  <span className="alert-discount">Perdiste {lastShipment.discount}</span>
                  <button className="alert-link" onClick={onNavigateToShipments}>
                    Ver todos
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="last-shipment-card__empty">
            {/* <span className="empty-icon">📦</span> */}
            <p>No tienes envíos registrados</p>
          </div>
        )}
      </section>

      {/* Pre-Alertas Pendientes */}
      <section className="pre-alerts-card">
        <h2 className="pre-alerts-card__title">
          Pre-Alertas Pendientes ({preAlerts.length})
        </h2>
        
        {/* Table Header */}
        <div className="pre-alerts-card__header">
          <span className="pre-alerts-card__header-text">Tracking</span>
          <span className="pre-alerts-card__header-text">Estatus</span>
          <span className="pre-alerts-card__header-text">Entrega en</span>
        </div>

        {loading.preAlerts ? (
          <div className="pre-alerts-card__loading">
            <div className="spinner"></div>
            <p>Cargando pre-alertas...</p>
          </div>
        ) : preAlerts.length > 0 ? (
          <>
            <div className="pre-alerts-card__list">
              {preAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="pre-alert-row">
                  <div className="pre-alert-row__tracking">
                    <span className="pre-alert-row__number">{alert.trackingNumber}</span>
                    <span className="pre-alert-row__content">{alert.contenido}</span>
                  </div>

                  <div className="pre-alert-row__status">
                    <span className="pre-alert-row__badge">{alert.status}</span>
                    <span className="pre-alert-row__date">{alert.date}</span>
                  </div>

                  {/* ✅ COLUMNA DE DIRECCIÓN ACTUALIZADA */}
                  <div 
                    className="pre-alert-row__delivery"
                    title={alert.deliveryLocation} // Tooltip con texto completo
                  >
                    {/* Icono según tipo */}
                    <span className="pre-alert-row__delivery-icon">
                      {alert.direccion?.tipo === 'store' || alert.direccion?.idLocker ? (
                        <IoStorefrontOutline size={16} />
                      ) : (
                        <IoHomeOutline size={16} />
                      )}
                    </span>
                    
                    {/* Texto truncado de la dirección */}
                    <span className="pre-alert-row__delivery-text">
                      {truncateText(alert.deliveryLocation)}
                    </span>
                  </div>

                  <div className="pre-alert-row__menu" ref={el => menuRefs.current[alert.id] = el}>
                    <button 
                      className="pre-alert-row__menu-button"
                      onClick={() => toggleMenu(alert.id)}
                      aria-label="Más opciones"
                    >
                      ⋮
                    </button>

                    {visibleMenus[alert.id] && (
                      <div className="menu-dropdown">
                        <button onClick={() => handleViewDetail(alert)} className="menu-dropdown__item">
                          <span className="menu-dropdown__icon"><IoEyeOutline size={18}/></span>
                          Ver detalle
                        </button>
                        <button onClick={() => handleEdit(alert)} className="menu-dropdown__item">
                          <span className="menu-dropdown__icon"><IoCreateOutline size={18}/></span>
                          Editar
                        </button>
                        <button onClick={() => handleHelp(alert)} className="menu-dropdown__item">
                          <span className="menu-dropdown__icon"><IoHelpOutline size={18}/></span>
                          Ayuda
                        </button>
                        <button onClick={() => handleDelete(alert)} className="menu-dropdown__item menu-dropdown__item--danger">
                          <span className="menu-dropdown__icon"><IoTrashOutline size={18}/></span>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {preAlerts.length > 3 && (
              <button className="pre-alerts-card__view-all" onClick={() => navigate('/pre-alert/list')}>
                Ver todos
              </button>
            )}
          </>
        ) : (
          <div className="pre-alerts-card__empty">
            {/* <span className="empty-icon">📋</span> */}
            <p>No tienes pre-alertas pendientes</p>
          </div>
        )}
      </section>

      {/* Carousel de Novedades */}
      <NewsCarousel 
        newsItems={newsItems}
        cardWidth={620}
        cardMargin={10}
      />
    </div>
  );
};

export default Home;