// src/pages/dashboard/Home/Home.jsx - UPDATED WITH REAL API SERVICES
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import NewsCarousel from '../../../components/NewsCarousel/NewsCarousel';
import { getLastShipment } from '../../../services/guiasService';
import { getPreAlertasPendientes } from '../../../services/preAlertService';
import { getNovedades } from '../../../services/novedadesService';
import './Home.styles.scss';

const Home = ({ onNavigateToShipments }) => {
  const { user } = useAuth();
  
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
  
  // Error states
  const [errors, setErrors] = useState({
    lastShipment: null,
    preAlerts: null,
    news: null
  });

  /**
   * Load last shipment from API
   */
  const loadLastShipment = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, lastShipment: true }));
      setErrors(prev => ({ ...prev, lastShipment: null }));
      
      const response = await getLastShipment();
      
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
  }, []);

  /**
   * Load pending pre-alerts from API
   */
  const loadPreAlerts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, preAlerts: true }));
      setErrors(prev => ({ ...prev, preAlerts: null }));
      
      const response = await getPreAlertasPendientes();
      
      if (response.success && response.data) {
        // Format pre-alerts for display
        const formattedPreAlerts = response.data.map(alert => ({
          id: alert.id,
          trackingNumber: Array.isArray(alert.trackings) 
            ? alert.trackings[0] 
            : alert.tracking || 'Sin tracking',
          status: 'Pre-alertado',
          date: alert.fecha || alert.fechaCreacion || '',
          deliveryLocation: formatDeliveryLocation(alert),
          contenido: alert.contenido || 'Sin descripción'
        }));
        
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
  }, []);

  /**
   * Load news/novedades from API
   */
  const loadNews = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, news: true }));
      setErrors(prev => ({ ...prev, news: null }));
      
      const response = await getNovedades();
      
      if (response.success && response.data) {
        // Format news items for carousel
        const formattedNews = response.data.map(item => ({
          id: item.id,
          title: item.title || item.titulo || 'Novedad',
          text: item.text || item.descripcion || item.contenido || '',
          iconName: item.iconName || item.icono || 'information-circle',
          backgroundColor: item.backgroundColor || item.colorFondo || '#f0f8ff',
          textColor: item.textColor || item.colorTexto || '#333'
        }));
        
        setNewsItems(formattedNews);
      } else {
        // If no news, show empty array (carousel will handle it)
        setNewsItems([]);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  }, []);

  /**
   * Format delivery location from address data
   */
  const formatDeliveryLocation = (alert) => {
    if (alert.direccionResumen) {
      return alert.direccionResumen;
    }
    
    if (alert.nombreLocker) {
      return `Tienda: ${alert.nombreLocker}`;
    }
    
    if (alert.direccion) {
      return `Domicilio: ${alert.direccion.substring(0, 30)}...`;
    }
    
    return 'Sin dirección';
  };

  /**
   * Load all data on component mount
   */
  useEffect(() => {
    if (user) {
      loadLastShipment();
      loadPreAlerts();
      loadNews();
    }
  }, [user, loadLastShipment, loadPreAlerts, loadNews]);

  /**
   * Handle navigation to all shipments
   */
  const handleViewAllShipments = () => {
    if (onNavigateToShipments) {
      onNavigateToShipments();
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
            {user?.deliveryAddress || 'Tienda Chacao'}
          </span>
          <span className="delivery-address__icon">📍</span>
        </div>
      </div>

      {/* Último Envío */}
      <section className="last-shipment">
        <div className="last-shipment__header">
          <h2 className="last-shipment__title">Último Envío</h2>
          {lastShipment && (
            <div className="last-shipment__origin">
              <span className="last-shipment__origin-label">Origen</span>
              <div className="last-shipment__origin-info">
                <span className="last-shipment__origin-flag">
                  {getOriginFlag(lastShipment.origin)}
                </span>
                <span className="last-shipment__origin-country">
                  {lastShipment.origin}
                </span>
              </div>
            </div>
          )}
        </div>

        {loading.lastShipment ? (
          <div className="last-shipment__loading">
            <div className="spinner"></div>
            <p>Cargando último envío...</p>
          </div>
        ) : errors.lastShipment ? (
          <div className="last-shipment__error">
            <span className="error-icon">⚠️</span>
            <p>{errors.lastShipment}</p>
          </div>
        ) : lastShipment ? (
          <>
            <div className="last-shipment__content">
              <div className="last-shipment__tracking">
                <span className="last-shipment__label">N° Guía</span>
                <div className="last-shipment__tracking-info">
                  <span className="last-shipment__number">
                    {lastShipment.trackingNumber}
                  </span>
                  {lastShipment.trackingNumbers?.length > 1 && (
                    <span className="last-shipment__type">
                      +{lastShipment.trackingNumbers.length - 1} más
                    </span>
                  )}
                </div>
              </div>

              <div className="last-shipment__status">
                <span className="last-shipment__label">Estatus</span>
                <div className="last-shipment__status-info">
                  <div className={`last-shipment__status-badge ${getStatusClass(lastShipment.status)}`}>
                    {lastShipment.status}
                  </div>
                  <span className="last-shipment__date">{lastShipment.date}</span>
                </div>
              </div>

              <div className="last-shipment__cost">
                <span className="last-shipment__label">Costo del envío</span>
                <span className="last-shipment__price">{lastShipment.cost}</span>
              </div>
            </div>

            {/* Alert for non-prealerted shipments */}
            {!lastShipment.prealerted && lastShipment.discount && (
              <div className="last-shipment__alert">
                <span className="alert-icon">🚫</span>
                <span className="alert-text">No pre-alertado</span>
                <span className="alert-discount">Perdiste {lastShipment.discount}</span>
                <button className="alert-link" onClick={handleViewAllShipments}>
                  Ver todos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="last-shipment__empty">
            <span className="empty-icon">📦</span>
            <p>No tienes envíos registrados</p>
          </div>
        )}
      </section>

      {/* Pre-Alertas Pendientes */}
      <section className="pre-alerts">
        <h2 className="pre-alerts__title">Pre-Alertas Pendientes</h2>
        
        {loading.preAlerts ? (
          <div className="pre-alerts__loading">
            <div className="spinner"></div>
            <p>Cargando pre-alertas...</p>
          </div>
        ) : errors.preAlerts ? (
          <div className="pre-alerts__error">
            <span className="error-icon">⚠️</span>
            <p>{errors.preAlerts}</p>
          </div>
        ) : preAlerts.length > 0 ? (
          <>
            <div className="pre-alerts__list">
              {preAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="pre-alert-item">
                  <div className="pre-alert-item__info">
                    <div className="pre-alert-item__tracking">
                      <span className="pre-alert-item__label">Tracking</span>
                      <div className="pre-alert-item__tracking-info">
                        <span className="pre-alert-item__number">
                          {alert.trackingNumber}
                        </span>
                        <span className="pre-alert-item__type">
                          {alert.contenido}
                        </span>
                      </div>
                    </div>

                    <div className="pre-alert-item__status">
                      <span className="pre-alert-item__label">Estatus</span>
                      <div className="pre-alert-item__status-badge">
                        {alert.status}
                      </div>
                      <span className="pre-alert-item__date">{alert.date}</span>
                    </div>

                    <div className="pre-alert-item__delivery">
                      <span className="pre-alert-item__label">Entrega en</span>
                      <span className="pre-alert-item__location">
                        {alert.deliveryLocation}
                      </span>
                    </div>
                  </div>

                  <button className="pre-alert-item__menu" aria-label="Más opciones">
                    ⋮
                  </button>
                </div>
              ))}
            </div>

            <button className="pre-alerts__view-all">
              Ver todos ({preAlerts.length})
            </button>
          </>
        ) : (
          <div className="pre-alerts__empty">
            <span className="empty-icon">📋</span>
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