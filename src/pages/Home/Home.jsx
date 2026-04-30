// src/pages/dashboard/Home/Home.jsx - CON FUNCIONALIDAD DE CARGA DE FACTURA
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NewsCarousel from '../../components/NewsCarousel/NewsCarousel';
import { getLastShipment, uploadGuiaInvoice } from '../../services/guiasService';
import { getPreAlertasPendientes, deletePreAlerta } from '../../services/preAlertService';
import { getNovedades } from '../../services/novedadesService';
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
  IoHomeOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,  // ← agregar
  IoBookmarkOutline,         // ← agregar
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
    // console.log('📍 Address state:', {
    //   defaultAddressText,
    //   isLoadingAddress,
    //   addressError
    // });
  }, [defaultAddressText, isLoadingAddress, addressError]);
  
  // Loading states
  const [loading, setLoading] = useState({
    lastShipment: true,
    preAlerts: true,
    news: true,
    uploadingInvoice: false // 🆕 ESTADO PARA CARGA DE FACTURA
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

  // 🆕 REF PARA INPUT DE ARCHIVO (INVISIBLE)
  const fileInputRef = useRef(null);

  /**
   * ✅ FUNCIÓN AUXILIAR: Formatear dirección
   */
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
   * ✅ FUNCIÓN AUXILIAR: Acortar texto
   */
  const truncateText = useCallback((text, maxLength = 40) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  /**
   * 🆕 FUNCIÓN: Verificar si la guía necesita factura
   */
  const necesitaFactura = useCallback((shipment) => {
    if (!shipment) return false;
    
    const estatus = shipment.status?.toLowerCase();
    const idEstatusActual = shipment.idEstatusActual || 0;
    
    return (
      estatus === 'pendiente de factura' || 
      idEstatusActual === 3
    );
  }, []);

  /**
 * 🆕 FUNCIÓN: Verificar si se puede pagar
 * ✅ CORREGIDO: Acceso seguro a calculationData
 */
  const sePuedePagar = useCallback((shipment) => {
    if (!shipment) {
      // console.log('❌ No hay shipment');
      return false;
    }
    
    // console.log('🔍 Evaluando sePuedePagar:', {
    //   id: shipment.id,
    //   trackingNumber: shipment.trackingNumber,
    //   calculationData: shipment.calculationData
    // });
    
    // ✅ ACCESO SEGURO con optional chaining
    const tienePago = shipment.calculationData?.detallePago || false;
    
    if (tienePago) {
      // console.log('❌ Ya tiene pago registrado');
      return false;
    }
    
    // ✅ Obtener valores desde calculationData (donde están los datos reales)
    const fob = shipment.calculationData?.valorFOB || 0;
    const idEstatusActual = shipment.calculationData?.idEstatus || 0;
    
    // console.log('💰 Valores para validación:', {
    //   fob,
    //   idEstatusActual,
    //   tienePago
    // });
    
    // Lógica de validación según FOB
    let puedePagar = false;
    
    if (fob < 100) {
      puedePagar = idEstatusActual >= 2;
      // console.log(`📦 FOB < 100: ${puedePagar ? '✅ SÍ puede' : '❌ NO puede'} (requiere >= 2, actual: ${idEstatusActual})`);
    } else {
      // puedePagar = idEstatusActual >= 8;
      puedePagar = idEstatusActual >= 2;
      // console.log(`📦 FOB >= 100: ${puedePagar ? '✅ SÍ puede' : '❌ NO puede'} (requiere >= 8, actual: ${idEstatusActual})`);
    }
    
    return puedePagar;
  }, []);

  /**
   * 🆕 FUNCIÓN: Manejar carga de factura
   */
  const handleCargarFactura = useCallback(async (shipment) => {
    if (!shipment) {
      alert('No se puede cargar factura sin seleccionar una guía');
      return;
    }

    // console.log('📄 Iniciando carga de factura para guía:', shipment.id);
    
    // Cerrar el menú
    setVisibleMenus({});
    
    // Simular click en el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * 🆕 FUNCIÓN: Procesar archivo seleccionado
   */
  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      // console.log('📄 Usuario canceló la selección de archivo');
      return;
    }

    if (!lastShipment) {
      alert('No hay guía seleccionada');
      event.target.value = ''; // Limpiar input
      return;
    }

    // console.log('📄 Archivo seleccionado:', {
    //   name: file.name,
    //   size: file.size,
    //   type: file.type
    // });

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. El tamaño máximo es 5MB');
      event.target.value = ''; // Limpiar input
      return;
    }

    // Validar tipo de archivo
    const isValidType = file.type.includes('pdf') || 
                       file.type.includes('image') ||
                       /\.(pdf|jpg|jpeg|png|gif)$/i.test(file.name);

    if (!isValidType) {
      alert('Tipo de archivo no válido. Solo se permiten archivos PDF o imágenes (JPG, PNG, GIF)');
      event.target.value = ''; // Limpiar input
      return;
    }

    // Iniciar carga
    setLoading(prev => ({ ...prev, uploadingInvoice: true }));

    try {
      // console.log('📤 Subiendo factura al servidor...');
      const uploadResult = await uploadGuiaInvoice(lastShipment.id, file);
      
      if (uploadResult.success) {
        alert(`✅ Factura cargada exitosamente\n\nLa factura "${file.name}" se ha cargado correctamente para la guía ${lastShipment.trackingNumber}`);
        
        // Recargar datos
        await loadLastShipment();
      } else {
        alert(`❌ Error al cargar factura\n\n${uploadResult.message || 'No se pudo cargar la factura. Inténtalo nuevamente.'}`);
      }
    } catch (error) {
      console.error('❌ Error cargando factura:', error);
      alert('❌ Error al cargar factura\n\nNo se pudo cargar la factura. Inténtalo nuevamente.');
    } finally {
      setLoading(prev => ({ ...prev, uploadingInvoice: false }));
      event.target.value = ''; // Limpiar input para permitir seleccionar el mismo archivo de nuevo
    }
  }, [lastShipment]);

  /**
   * Cargar pre-alertas
   */
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
        
        // console.log('Formatted pre-alerts:', formattedPreAlerts);

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
  }, [formatAddress]);

  /**
   * Cargar último envío
   */
  const loadLastShipment = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, lastShipment: true }));
      setErrors(prev => ({ ...prev, lastShipment: null }));
      
      const response = await getLastShipment();
      // console.log('Last shipment response :', response);
      
      if (response.success && response.data) {
        setLastShipment(response.data);
        // console.log('Último envío cargado:', response.data);
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
   * Cargar novedades
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
  }, []);

  /**
   * Cargar todo al inicio
   */
  useEffect(() => {
    if (user) {
      // console.log('👤 User detected, loading data...');
      loadLastShipment();
      loadPreAlerts();
      loadNews();
    }
  }, [user, loadLastShipment, loadPreAlerts, loadNews]);

  /**
   * Cerrar menú al hacer click fuera
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
   * Menu handlers para último envío
   */
  const handleViewDetailShipment = (shipment) => {
    // console.log('Ver detalle shipment:', shipment);
    setVisibleMenus({});
    navigate(`/guide/detail/${shipment.id}`);
  };

  const handlePayShipment = (shipment) => {
    // console.log('Pagar shipment:', shipment);
    setVisibleMenus({});
    navigate(`/payment/${shipment.id}`);
  };

  const handleHelpShipment = (shipment) => {
    // console.log('Ayuda shipment:', shipment);
    setVisibleMenus({});
    alert('Para obtener ayuda, contacta nuestro soporte');
  };

  /**
   * Menu handlers para pre-alertas
   */
  const handleViewDetail = (alert) => {
    // console.log('Ver detalle:', alert);
    setVisibleMenus({});
    navigate(`/pre-alert/${alert.id}`);
  };

  const handleEdit = (alert) => {
    // console.log('Editar:', alert);
    setVisibleMenus({});
    navigate(`/pre-alert/edit/${alert.id}`);
  };

  const handleHelp = (alert) => {
    // console.log('Ayuda:', alert);
    setVisibleMenus({});
    alert('Para obtener ayuda, contacta nuestro soporte');
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
   * Obtener bandera del país de origen
   */
  const getOriginFlag = (origin) => {
    const flags = {
      'USA': '🇺🇸',
      'CHN': '🇨🇳',
      'ESP': '🇪🇸',
      'MEX': '🇲🇽'
    };
    return flags[origin?.toUpperCase()] || '🌍';
  };

  /**
   * Obtener clase CSS según estatus
   */
  const getStatusClass = (status) => {
    const statusMap = {
      'Pendiente de Pago': 'pending',
      'Pendiente de Factura': 'pending', // 🆕 AGREGAR ESTE
      'Recibido en Almacén': 'received',
      'Enviado a Venezuela': 'in-transit',
      'Disponible para entrega': 'ready',
      'Entregado': 'delivered'
    };
    return statusMap[status] || 'pending';
  };


  const formatBolivarFromShipment = (shipment) => {
    if (!shipment) return '0,00 Bs.';
    const df = shipment.calculationData?.detalleFactura || {};
    const tasa = shipment.calculationData?.tasaCambio || shipment.tasaCambio || 0;

    let value = 0;
    if (typeof df.precioBase === 'number') {
      value = df.precioBase;
    } else if (typeof df.precioBaseUSD === 'number' && tasa) {
      value = df.precioBaseUSD * tasa;
    } else if (typeof shipment.valorFOB === 'number' && tasa) {
      value = shipment.valorFOB * tasa;
    }

    return Number(value || 0).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' Bs.';
  };

  return (
    <div className="dashboard-home">
      {/* 🆕 INPUT DE ARCHIVO INVISIBLE */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

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
                  {lastShipment.status}
                  <span className="last-shipment-card__date">{lastShipment.date}</span>
                </div>
              </div>

              <div className="last-shipment-card__cell">
                <span className="last-shipment-card__label">{lastShipment.estaPagado ? 'Total Pagado' : 'Costo del envío'}</span>
                <span className="last-shipment-card__price">{formatBolivarFromShipment(lastShipment)}</span>
              </div>

              <div className="last-shipment-card__menu" ref={el => menuRefs.current['lastShipment'] = el}>
                <button 
                  className="last-shipment-card__menu-button"
                  onClick={() => toggleMenu('lastShipment')}
                  aria-label="Más opciones"
                  disabled={loading.uploadingInvoice}
                >
                  ⋮
                </button>

                {visibleMenus['lastShipment'] && (
                  <div className="menu-dropdown">
                    {/* Ver detalle */}
                    <button 
                      onClick={() => handleViewDetailShipment(lastShipment)} 
                      className="menu-dropdown__item"
                    >
                      <span className="menu-dropdown__icon"><IoEyeOutline size={18}/></span>
                      Ver detalle
                    </button>

                    {/* 🆕 OPCIÓN: Cargar Factura (solo si necesita factura) */}
                    {necesitaFactura(lastShipment) && (
                      <button 
                        onClick={() => handleCargarFactura(lastShipment)} 
                        className="menu-dropdown__item"
                        disabled={loading.uploadingInvoice}
                      >
                        <span className="menu-dropdown__icon">
                          {loading.uploadingInvoice ? (
                            <div className="spinner-small"></div>
                          ) : (
                            <IoDocumentTextOutline size={18} style={{ color: '#f59e0b' }}/>
                          )}
                        </span>
                        {loading.uploadingInvoice ? 'Cargando...' : 'Cargar Factura'}
                      </button>
                    )}

                    {/* Pagar (solo si se puede pagar) */}
                    {sePuedePagar(lastShipment) && (
                      <button 
                        onClick={() => handlePayShipment(lastShipment)} 
                        className="menu-dropdown__item menu-dropdown__item--pagar"
                      >
                        <span className="menu-dropdown__icon"><IoCardOutline size={18}/></span>
                        Pagar
                      </button>
                    )}

                    {/* Ayuda */}
                    <button 
                      onClick={() => handleHelpShipment(lastShipment)} 
                      className="menu-dropdown__item"
                    >
                      <span className="menu-dropdown__icon"><IoHelpOutline size={18}/></span>
                      Ayuda
                    </button>
                  </div>
                )}
              </div>

              <div className="last-shipment-card__alert">
                <span className="alert-icon">
                  {lastShipment.prealerted
                    ? <IoCheckmarkCircleOutline size={16} color="#4CAF50" />
                    : <IoBookmarkOutline size={16} color="#DC2626" />
                  }
                </span>
                <span className={`alert-text ${lastShipment.prealerted ? 'alert-text--success' : ''}`}>
                  {lastShipment.prealerted ? 'Pre-alertado' : 'No pre-alertado'}
                </span>
                <span className={`alert-discount ${lastShipment.prealerted ? 'alert-discount--success' : ''}`}>
                  {lastShipment.prealerted ? 'Ganaste +10%' : 'Perdiste -10%'}
                </span>
                <button className="alert-link" onClick={() => navigate('/guide/guides')}>
                  Ver todas
                </button>
              </div>

            </div>
          </>
        ) : (
          <div className="last-shipment-card__empty">
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

                  <div 
                    className="pre-alert-row__delivery"
                    title={alert.deliveryLocation}
                  >
                    <span className="pre-alert-row__delivery-icon">
                      {alert.direccion?.tipo === 'store' || alert.direccion?.idLocker ? (
                        <IoStorefrontOutline size={16} />
                      ) : (
                        <IoHomeOutline size={16} />
                      )}
                    </span>
                    
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