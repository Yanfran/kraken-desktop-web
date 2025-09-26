// src/pages/PreAlert/PreAlertList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import './PreAlertList.styles.scss';

// Services
import { 
  getPreAlertasPendientes, 
  deletePreAlerta 
} from '@services/preAlertService';

// Components
import AppContainer from '@components/common/AppContainer';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import CustomAlert from '@components/alert/CustomAlert';

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
    navigate(`/pre-alerts/edit/${preAlerta.id}`);
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
        onClick={() => navigate('/pre-alerts/create')}
        className="pre-alert-list__empty-btn"
      >
        Crear Pre-Alerta
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="pre-alert-list">
        <AppContainer>
          <div className="pre-alert-list__loading">
            <LoadingSpinner size="large" />
            <p>Cargando pre-alertas...</p>
          </div>
        </AppContainer>
      </div>
    );
  }

  return (
    <div className="pre-alert-list" onClick={closeAllMenus}>
      <AppContainer>
        <div className="pre-alert-list__layout">
          
          {/* Header */}
          <div className="pre-alert-list__header">
            <div className="pre-alert-list__header-content">
              <div className="pre-alert-list__header-left">
                <h1 className="pre-alert-list__title">Mis Pre-Alertas</h1>
                <p className="pre-alert-list__subtitle">
                  Gestiona tus pre-alertas pendientes y procesadas
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
                  onClick={() => navigate('/pre-alerts/create')}
                  className="pre-alert-list__create-btn"
                >
                  + Nueva Pre-Alerta
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pre-alert-list__content">
            {preAlertas.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Stats */}
                <div className="pre-alert-list__stats">
                  <div className="pre-alert-list__stat-item">
                    <span className="pre-alert-list__stat-number">{preAlertas.length}</span>
                    <span className="pre-alert-list__stat-label">Total</span>
                  </div>
                  <div className="pre-alert-list__stat-item">
                    <span className="pre-alert-list__stat-number">
                      {preAlertas.filter(p => !p.IdGuia).length}
                    </span>
                    <span className="pre-alert-list__stat-label">Pendientes</span>
                  </div>
                  <div className="pre-alert-list__stat-item">
                    <span className="pre-alert-list__stat-number">
                      {preAlertas.filter(p => p.IdGuia).length}
                    </span>
                    <span className="pre-alert-list__stat-label">Procesadas</span>
                  </div>
                </div>

                {/* Table */}
                <div className="pre-alert-list__table-container">
                  <table className="pre-alert-list__table">
                    <thead>
                      <tr>
                        <th>Tracking</th>
                        <th>Contenido</th>
                        <th>Valor</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preAlertas.map((preAlerta) => {
                        const status = getStatusInfo(preAlerta);
                        return (
                          <tr key={preAlerta.id} className="pre-alert-list__table-row">
                            <td className="pre-alert-list__table-cell">
                              <div className="pre-alert-list__tracking">
                                <span className="pre-alert-list__tracking-number">
                                  {formatTrackingNumber(preAlerta.trackings)}
                                </span>
                                {Array.isArray(preAlerta.trackings) && preAlerta.trackings.length > 1 && (
                                  <span className="pre-alert-list__tracking-count">
                                    +{preAlerta.trackings.length - 1} más
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="pre-alert-list__table-cell">
                              <span className="pre-alert-list__content">
                                {preAlerta.contenido || 'Sin especificar'}
                              </span>
                            </td>
                            <td className="pre-alert-list__table-cell">
                              <span className="pre-alert-list__value">
                                ${preAlerta.valor || '0.00'}
                              </span>
                            </td>
                            <td className="pre-alert-list__table-cell">
                              <span className={`pre-alert-list__status pre-alert-list__status--${status.className}`}>
                                {status.text}
                              </span>
                            </td>
                            <td className="pre-alert-list__table-cell">
                              <span className="pre-alert-list__date">
                                {formatDate(preAlerta.fechaCreacion)}
                              </span>
                            </td>
                            <td className="pre-alert-list__table-cell">
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="pre-alert-list__cards">
                  {preAlertas.map((preAlerta) => {
                    const status = getStatusInfo(preAlerta);
                    return (
                      <div key={preAlerta.id} className="pre-alert-list__card">
                        <div className="pre-alert-list__card-header">
                          <div className="pre-alert-list__card-tracking">
                            <span className="pre-alert-list__card-tracking-label">Tracking:</span>
                            <span className="pre-alert-list__card-tracking-number">
                              {formatTrackingNumber(preAlerta.trackings)}
                            </span>
                            {Array.isArray(preAlerta.trackings) && preAlerta.trackings.length > 1 && (
                              <span className="pre-alert-list__card-tracking-count">
                                +{preAlerta.trackings.length - 1}
                              </span>
                            )}
                          </div>
                          <span className={`pre-alert-list__card-status pre-alert-list__card-status--${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <div className="pre-alert-list__card-body">
                          <div className="pre-alert-list__card-info">
                            <div className="pre-alert-list__card-item">
                              <span className="pre-alert-list__card-label">Contenido:</span>
                              <span className="pre-alert-list__card-value">
                                {preAlerta.contenido || 'Sin especificar'}
                              </span>
                            </div>
                            <div className="pre-alert-list__card-item">
                              <span className="pre-alert-list__card-label">Valor:</span>
                              <span className="pre-alert-list__card-value">
                                ${preAlerta.valor || '0.00'}
                              </span>
                            </div>
                            <div className="pre-alert-list__card-item">
                              <span className="pre-alert-list__card-label">Fecha:</span>
                              <span className="pre-alert-list__card-value">
                                {formatDate(preAlerta.fechaCreacion)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pre-alert-list__card-actions">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleViewDetail(preAlerta)}
                          >
                            Ver detalle
                          </Button>
                          {!preAlerta.IdGuia && (
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleEdit(preAlerta)}
                            >
                              Editar
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleDelete(preAlerta)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Custom Alert */}
        <CustomAlert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          onConfirm={alert.onConfirm || hideAlert}
          showCancel={!!alert.onConfirm}
        />
      </AppContainer>
    </div>
  );
};

export default PreAlertList;