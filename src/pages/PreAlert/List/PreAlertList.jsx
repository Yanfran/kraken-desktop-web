// src/pages/PreAlert/PreAlertList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import './PreAlertList.styles.scss';

// Services
import { 
  getPreAlertasPendientes, 
  deletePreAlerta 
} from '@services/preAlertService';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';
import CustomAlert from '@components/alert/CustomAlert/CustomAlert';

// Hooks
import { useAuth } from '@hooks/useAuth';

const PreAlertList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [preAlertas, setPreAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleMenus, setVisibleMenus] = useState({});
  const [alert, setAlert] = useState({ 
    show: false, 
    type: '', 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  // Load pre-alerts
  const loadPreAlertas = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await getPreAlertasPendientes();
      if (response.success) {
        setPreAlertas(response.data);
      } else {
        showAlert('error', 'Error', response.message || 'Error cargando pre-alertas');
      }
    } catch (error) {
      console.error('Error loading pre-alerts:', error);
      showAlert('error', 'Error', error.message || 'Error cargando pre-alertas');
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      loadPreAlertas().finally(() => setLoading(false));
    }
  }, [loadPreAlertas, user?.id]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPreAlertas();
    setRefreshing(false);
  };

  // Alert utilities
  const showAlert = (type, title, message, onConfirm = null) => {
    setAlert({ show: true, type, title, message, onConfirm });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: '', title: '', message: '', onConfirm: null });
  };

  // Format tracking number - handle arrays
  const formatTrackingNumber = (tracking) => {
    const trackingStr = Array.isArray(tracking) ? tracking[0] : tracking;
    if (!trackingStr) return 'Sin tracking';
    return trackingStr.length > 20 ? `${trackingStr.substring(0, 20)}...` : trackingStr;
  };

  // Toggle menu visibility
  const toggleMenu = (preAlertaId) => {
    setVisibleMenus(prev => ({
      ...prev,
      [preAlertaId]: !prev[preAlertaId]
    }));
  };

  // Close all menus
  const closeAllMenus = () => {
    setVisibleMenus({});
  };

  // Navigation handlers
  const handleViewDetail = (preAlerta) => {
    closeAllMenus();
    navigate(`/pre-alerts/${preAlerta.id}`);
  };

  const handleEdit = (preAlerta) => {
    closeAllMenus();
    navigate(`/pre-alert/edit/${preAlerta.id}`);
  };

  // Delete pre-alert
  const handleDelete = (preAlerta) => {
    closeAllMenus();
    showAlert(
      'warning',
      'Confirmar eliminación',
      `¿Está seguro de eliminar la pre-alerta con tracking "${formatTrackingNumber(preAlerta.trackings)}"?`,
      () => confirmDelete(preAlerta.id)
    );
  };

  const confirmDelete = async (preAlertaId) => {
    try {
      const response = await deletePreAlerta(preAlertaId);
      
      if (response.success) {
        toast.success('Pre-alerta eliminada exitosamente');
        setPreAlertas(prev => prev.filter(p => p.id !== preAlertaId));
      } else {
        showAlert('error', 'Error', response.message || 'Error al eliminar pre-alerta');
      }
    } catch (error) {
      console.error('Error deleting pre-alert:', error);
      showAlert('error', 'Error', error.message || 'Error al eliminar pre-alerta');
    }
    hideAlert();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Format status
  const getStatusInfo = (preAlerta) => {
    if (preAlerta.IdGuia) {
      return { text: 'Procesada', className: 'success' };
    }
    return { text: 'Pendiente', className: 'pending' };
  };

  // Empty state
  const EmptyState = () => (
    <div className="pre-alert-list__empty">
      <div className="pre-alert-list__empty-icon">📦</div>
      <h3 className="pre-alert-list__empty-title">No hay pre-alertas</h3>
      <p className="pre-alert-list__empty-message">
        Aún no has creado ninguna pre-alerta. ¡Crea tu primera pre-alerta para empezar!
      </p>
      <Button
        variant="primary"
                    onClick={() => navigate('/pre-alert/create')}        className="pre-alert-list__empty-btn"
      >
        Crear Pre-Alerta
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="pre-alert-list__loading">
        <LoadingSpinner size="large" />
        <p>Cargando pre-alertas...</p>
      </div>
    );
  }

  return (
    <div className="pre-alert-list" onClick={closeAllMenus}>
      <div className="pre-alert-list__content">
        {/* Header Section */}
        <div className="pre-alert-list__header">
          <div className="pre-alert-list__header-left">
            <h1 className="pre-alert-list__title">Mis Pre-Alertas</h1>
            <p className="pre-alert-list__subtitle">
              {preAlertas.length} pre-alerta{preAlertas.length !== 1 ? 's' : ''} • {' '}
              {preAlertas.filter(p => !p.IdGuia).length} pendiente{preAlertas.filter(p => !p.IdGuia).length !== 1 ? 's' : ''} • {' '}
              {preAlertas.filter(p => p.IdGuia).length} procesada{preAlertas.filter(p => p.IdGuia).length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="pre-alert-list__header-actions">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="pre-alert-list__refresh-btn"
            >
              {refreshing ? <LoadingSpinner size="small" /> : '🔄'}
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/pre-alert/create')}
              className="pre-alert-list__create-btn"
            >
              + Nueva Pre-Alerta
            </Button>
          </div>
        </div>

        {/* Content */}
        {preAlertas.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Main Section - Table/Cards */}
            <div className="pre-alert-list__section">
              <div className="pre-alert-list__table-container">
                <div className="pre-alert-list__table-header">
                  <span className="pre-alert-list__table-header-text">Tracking</span>
                  <span className="pre-alert-list__table-header-text">Estatus</span>
                  <span className="pre-alert-list__table-header-text pre-alert-list__table-header-text--actions">
                    Acciones
                  </span>
                </div>
                <div className="pre-alert-list__table-body">
                  {preAlertas.map((preAlerta) => {
                    const status = getStatusInfo(preAlerta);
                    const trackings = Array.isArray(preAlerta.trackings)
                      ? preAlerta.trackings
                      : [preAlerta.tracking].filter(Boolean);
                    const hasMultipleTrackings = trackings.length > 1;
                    const displayTracking = formatTrackingNumber(trackings[0] || "");
                    const contenidos = preAlerta.contenidos || [];
                    let contenidosToShow = contenidos;
                    if (contenidos.length === 0 && preAlerta.contenido) {
                      contenidosToShow = [{ id: 0, contenido: preAlerta.contenido }];
                    }

                    return (
                      <div key={preAlerta.id} className="pre-alert-list__table-row">
                        <div className="pre-alert-list__tracking-cell">
                          <div className="pre-alert-list__tracking-main">
                            <span className="pre-alert-list__tracking-number">
                              {displayTracking}
                            </span>
                            {hasMultipleTrackings && (
                              <span className="pre-alert-list__tracking-count">
                                +{trackings.length - 1}
                              </span>
                            )}
                          </div>
                          {contenidosToShow.map((contenido, idx) => (
                            <div key={idx} className="pre-alert-list__content-item">
                              <span className="pre-alert-list__content-text">
                                {contenido.contenido}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="pre-alert-list__status-cell">
                          <span className={`pre-alert-list__status pre-alert-list__status--${status.className}`}>
                            {status.text}
                          </span>
                          <span className="pre-alert-list__date">
                            {formatDate(preAlerta.fechaCreacion)}
                          </span>
                        </div>
                        <div className="pre-alert-list__actions-cell">
                          <div className="pre-alert-list__actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(preAlerta.id);
                              }}
                              className="pre-alert-list__menu-btn"
                            >
                              ⋮
                            </button>
                            {visibleMenus[preAlerta.id] && (
                              <div className="pre-alert-list__menu">
                                <button
                                  onClick={() => handleViewDetail(preAlerta)}
                                  className="pre-alert-list__menu-item"
                                >
                                  👁️ Ver detalle
                                </button>
                                {!preAlerta.IdGuia && (
                                  <button
                                    onClick={() => handleEdit(preAlerta)}
                                    className="pre-alert-list__menu-item"
                                  >
                                    ✏️ Editar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(preAlerta)}
                                  className="pre-alert-list__menu-item pre-alert-list__menu-item--danger"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Custom Alert */}
        <CustomAlert {...alert} />
      </div>
    </div>
  );
};

export default PreAlertList;