// src/pages/PreAlert/PreAlertDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import './PreAlertDetail.styles.scss';

// Services
import { getPreAlertaById } from '@services/preAlertService';

// Components
import AppContainer from '@components/common/AppContainer';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import CustomAlert from '@components/alert/CustomAlert';

// Hooks
import { useAuth } from '@hooks/useAuth';

const PreAlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [preAlerta, setPreAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ 
    show: false, 
    type: '', 
    title: '', 
    message: '' 
  });

  // Load pre-alert data
  const loadData = async () => {
    if (!id) return;

    try {
      const response = await getPreAlertaById(Number(id));
      if (response.success) {
        setPreAlerta(response.data);
        setError('');
      } else {
        setError(response.message || 'Error al cargar pre-alerta');
        showAlert('error', 'Error', response.message || 'Error al cargar pre-alerta');
      }
    } catch (error) {
      console.error('Error loading pre-alert:', error);
      setError(error.message || 'Error al cargar pre-alerta');
      showAlert('error', 'Error', error.message || 'Error al cargar pre-alerta');
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [id]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Alert utilities
  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: '', title: '', message: '' });
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

  // Format tracking numbers
  const formatTrackings = (trackings) => {
    if (!trackings) return [];
    return Array.isArray(trackings) ? trackings : [trackings];
  };

  // Get status info
  const getStatusInfo = (data) => {
    if (!data) return { text: 'Desconocido', className: 'unknown' };
    
    if (data.IdGuia) {
      return { 
        text: 'Procesada', 
        className: 'success',
        description: 'La pre-alerta ha sido procesada y convertida en guía'
      };
    }
    return { 
      text: 'Pendiente', 
      className: 'pending',
      description: 'La pre-alerta está pendiente de procesamiento'
    };
  };

  // Navigation handlers
  const handleEdit = () => {
    navigate(`/pre-alerts/edit/${id}`);
  };

  const handleBackToList = () => {
    navigate('/pre-alerts');
  };

  // Loading state
  if (loading) {
    return (
      <div className="pre-alert-detail">
        <AppContainer>
          <div className="pre-alert-detail__loading">
            <LoadingSpinner size="large" />
            <p>Cargando detalles de la pre-alerta...</p>
          </div>
        </AppContainer>
      </div>
    );
  }

  // Error state
  if (error && !preAlerta) {
    return (
      <div className="pre-alert-detail">
        <AppContainer>
          <div className="pre-alert-detail__error">
            <div className="pre-alert-detail__error-icon">❌</div>
            <h2 className="pre-alert-detail__error-title">Error al cargar</h2>
            <p className="pre-alert-detail__error-message">{error}</p>
            <div className="pre-alert-detail__error-actions">
              <Button variant="outline" onClick={handleBackToList}>
                Volver a la lista
              </Button>
              <Button variant="primary" onClick={handleRefresh}>
                Reintentar
              </Button>
            </div>
          </div>
        </AppContainer>
      </div>
    );
  }

  const status = getStatusInfo(preAlerta);
  const trackings = formatTrackings(preAlerta?.trackings);

  return (
    <div className="pre-alert-detail">
      <AppContainer>
        <div className="pre-alert-detail__layout">
          
          {/* Header */}
          <div className="pre-alert-detail__header">
            <div className="pre-alert-detail__header-content">
              <div className="pre-alert-detail__header-left">
                <button 
                  onClick={handleBackToList}
                  className="pre-alert-detail__back-btn"
                >
                  ← Volver a mis pre-alertas
                </button>
                <h1 className="pre-alert-detail__title">
                  Detalle de Pre-Alerta #{preAlerta?.id}
                </h1>
                <div className="pre-alert-detail__header-meta">
                  <span className={`pre-alert-detail__status pre-alert-detail__status--${status.className}`}>
                    {status.text}
                  </span>
                  <span className="pre-alert-detail__date">
                    Creada el {formatDate(preAlerta?.fechaCreacion)}
                  </span>
                </div>
              </div>
              <div className="pre-alert-detail__header-actions">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="pre-alert-detail__refresh-btn"
                >
                  {refreshing ? <LoadingSpinner size="small" /> : '🔄'}
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
                {!preAlerta?.IdGuia && (
                  <Button
                    variant="primary"
                    onClick={handleEdit}
                  >
                    ✏️ Editar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="pre-alert-detail__content">
            
            {/* Main Information */}
            <div className="pre-alert-detail__section">
              <div className="pre-alert-detail__section-header">
                <h2 className="pre-alert-detail__section-title">
                  📦 Información del Paquete
                </h2>
              </div>
              <div className="pre-alert-detail__section-content">
                
                {/* Tracking Numbers */}
                <div className="pre-alert-detail__field-group">
                  <label className="pre-alert-detail__label">
                    Números de Tracking ({trackings.length})
                  </label>
                  <div className="pre-alert-detail__trackings">
                    {trackings.map((tracking, index) => (
                      <div key={index} className="pre-alert-detail__tracking-item">
                        <span className="pre-alert-detail__tracking-number">
                          {tracking}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(tracking)}
                          className="pre-alert-detail__copy-btn"
                          title="Copiar tracking"
                        >
                          📋
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Package Details */}
                <div className="pre-alert-detail__field-grid">
                  <div className="pre-alert-detail__field">
                    <label className="pre-alert-detail__label">Contenido</label>
                    <div className="pre-alert-detail__value">
                      {preAlerta?.contenido || 'Sin especificar'}
                    </div>
                  </div>
                  
                  <div className="pre-alert-detail__field">
                    <label className="pre-alert-detail__label">Valor</label>
                    <div className="pre-alert-detail__value pre-alert-detail__value--currency">
                      ${preAlerta?.valor || '0.00'} USD
                    </div>
                  </div>
                  
                  <div className="pre-alert-detail__field">
                    <label className="pre-alert-detail__label">Peso</label>
                    <div className="pre-alert-detail__value">
                      {preAlerta?.peso || '0.0'} lbs
                    </div>
                  </div>
                  
                  <div className="pre-alert-detail__field">
                    <label className="pre-alert-detail__label">Cantidad</label>
                    <div className="pre-alert-detail__value">
                      {preAlerta?.cantidad || 1} unidad{(preAlerta?.cantidad || 1) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="pre-alert-detail__field">
                    <label className="pre-alert-detail__label">Tipo de Envío</label>
                    <div className="pre-alert-detail__value">
                      <span className={`pre-alert-detail__shipping-type pre-alert-detail__shipping-type--${preAlerta?.tipoEnvio || 'maritimo'}`}>
                        {preAlerta?.tipoEnvio === 'aereo' ? '✈️ Aéreo' : '🚢 Marítimo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="pre-alert-detail__section">
              <div className="pre-alert-detail__section-header">
                <h2 className="pre-alert-detail__section-title">
                  📍 Dirección de Entrega
                </h2>
              </div>
              <div className="pre-alert-detail__section-content">
                {preAlerta?.direccion ? (
                  <div className="pre-alert-detail__address">
                    <div className="pre-alert-detail__address-header">
                      <div className="pre-alert-detail__address-name">
                        {preAlerta.direccion.nombres} {preAlerta.direccion.apellidos}
                      </div>
                      {preAlerta.direccion.telefono && (
                        <div className="pre-alert-detail__address-phone">
                          📞 {preAlerta.direccion.telefono}
                        </div>
                      )}
                    </div>
                    
                    <div className="pre-alert-detail__address-details">
                      <div className="pre-alert-detail__address-line">
                        {preAlerta.direccion.direccion}
                      </div>
                      {preAlerta.direccion.estado && (
                        <div className="pre-alert-detail__address-location">
                          {preAlerta.direccion.estado}
                          {preAlerta.direccion.municipio && `, ${preAlerta.direccion.municipio}`}
                          {preAlerta.direccion.parroquia && `, ${preAlerta.direccion.parroquia}`}
                        </div>
                      )}
                      {preAlerta.direccion.codigoPostal && (
                        <div className="pre-alert-detail__address-postal">
                          CP: {preAlerta.direccion.codigoPostal}
                        </div>
                      )}
                      {preAlerta.direccion.email && (
                        <div className="pre-alert-detail__address-email">
                          ✉️ {preAlerta.direccion.email}
                        </div>
                      )}
                      {preAlerta.direccion.cedula && (
                        <div className="pre-alert-detail__address-id">
                          🆔 {preAlerta.direccion.cedula}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="pre-alert-detail__no-data">
                    📍 No hay información de dirección disponible
                  </div>
                )}
              </div>
            </div>

            {/* Status & Processing */}
            <div className="pre-alert-detail__section">
              <div className="pre-alert-detail__section-header">
                <h2 className="pre-alert-detail__section-title">
                  📋 Estado y Procesamiento
                </h2>
              </div>
              <div className="pre-alert-detail__section-content">
                <div className="pre-alert-detail__status-card">
                  <div className="pre-alert-detail__status-main">
                    <div className={`pre-alert-detail__status-badge pre-alert-detail__status-badge--${status.className}`}>
                      {status.text}
                    </div>
                    <div className="pre-alert-detail__status-description">
                      {status.description}
                    </div>
                  </div>
                  
                  {preAlerta?.IdGuia && (
                    <div className="pre-alert-detail__guide-info">
                      <div className="pre-alert-detail__guide-label">
                        Número de Guía Asignado:
                      </div>
                      <div className="pre-alert-detail__guide-number">
                        #{preAlerta.IdGuia}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pre-alert-detail__timeline">
                  <div className="pre-alert-detail__timeline-item pre-alert-detail__timeline-item--completed">
                    <div className="pre-alert-detail__timeline-icon">✅</div>
                    <div className="pre-alert-detail__timeline-content">
                      <div className="pre-alert-detail__timeline-title">Pre-alerta creada</div>
                      <div className="pre-alert-detail__timeline-date">
                        {formatDate(preAlerta?.fechaCreacion)}
                      </div>
                    </div>
                  </div>
                  
                  {preAlerta?.IdGuia ? (
                    <div className="pre-alert-detail__timeline-item pre-alert-detail__timeline-item--completed">
                      <div className="pre-alert-detail__timeline-icon">🔄</div>
                      <div className="pre-alert-detail__timeline-content">
                        <div className="pre-alert-detail__timeline-title">Pre-alerta procesada</div>
                        <div className="pre-alert-detail__timeline-date">
                          {formatDate(preAlerta?.fechaProcesamiento)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pre-alert-detail__timeline-item pre-alert-detail__timeline-item--pending">
                      <div className="pre-alert-detail__timeline-icon">⏳</div>
                      <div className="pre-alert-detail__timeline-content">
                        <div className="pre-alert-detail__timeline-title">Pendiente de procesamiento</div>
                        <div className="pre-alert-detail__timeline-description">
                          Su pre-alerta será procesada en las próximas horas
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Files/Invoices */}
            {preAlerta?.facturas && preAlerta.facturas.length > 0 && (
              <div className="pre-alert-detail__section">
                <div className="pre-alert-detail__section-header">
                  <h2 className="pre-alert-detail__section-title">
                    📎 Archivos Adjuntos
                  </h2>
                </div>
                <div className="pre-alert-detail__section-content">
                  <div className="pre-alert-detail__files">
                    {preAlerta.facturas.map((file, index) => (
                      <div key={index} className="pre-alert-detail__file-item">
                        <div className="pre-alert-detail__file-icon">
                          {file.type?.includes('pdf') ? '📄' : '🖼️'}
                        </div>
                        <div className="pre-alert-detail__file-info">
                          <div className="pre-alert-detail__file-name">
                            {file.name || `Archivo ${index + 1}`}
                          </div>
                          <div className="pre-alert-detail__file-size">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Tamaño desconocido'}
                          </div>
                        </div>
                        <button 
                          className="pre-alert-detail__file-download"
                          onClick={() => {
                            // Implementar descarga de archivo
                            toast.info('Funcionalidad de descarga en desarrollo');
                          }}
                        >
                          ⬇️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="pre-alert-detail__section">
              <div className="pre-alert-detail__section-header">
                <h2 className="pre-alert-detail__section-title">
                  ℹ️ Información Adicional
                </h2>
              </div>
              <div className="pre-alert-detail__section-content">
                <div className="pre-alert-detail__info-grid">
                  <div className="pre-alert-detail__info-item">
                    <div className="pre-alert-detail__info-label">ID de Pre-alerta</div>
                    <div className="pre-alert-detail__info-value">#{preAlerta?.id}</div>
                  </div>
                  
                  <div className="pre-alert-detail__info-item">
                    <div className="pre-alert-detail__info-label">Fecha de creación</div>
                    <div className="pre-alert-detail__info-value">
                      {formatDate(preAlerta?.fechaCreacion)}
                    </div>
                  </div>
                  
                  {preAlerta?.fechaActualizacion && (
                    <div className="pre-alert-detail__info-item">
                      <div className="pre-alert-detail__info-label">Última actualización</div>
                      <div className="pre-alert-detail__info-value">
                        {formatDate(preAlerta.fechaActualizacion)}
                      </div>
                    </div>
                  )}
                  
                  <div className="pre-alert-detail__info-item">
                    <div className="pre-alert-detail__info-label">Cliente</div>
                    <div className="pre-alert-detail__info-value">
                      {user?.name || user?.email || 'Usuario'}
                    </div>
                  </div>
                </div>
                
                {/* Help Text */}
                <div className="pre-alert-detail__help">
                  <div className="pre-alert-detail__help-title">💡 ¿Necesitas ayuda?</div>
                  <div className="pre-alert-detail__help-content">
                    <p>
                      Si tienes preguntas sobre tu pre-alerta o necesitas hacer cambios, 
                      no dudes en contactarnos. Nuestro equipo está aquí para ayudarte.
                    </p>
                    <div className="pre-alert-detail__help-actions">
                      <Button variant="outline" size="small">
                        📞 Contactar Soporte
                      </Button>
                      <Button variant="outline" size="small">
                        ❓ Centro de Ayuda
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pre-alert-detail__bottom-actions">
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="pre-alert-detail__back-action"
            >
              ← Volver a la lista
            </Button>
            
            <div className="pre-alert-detail__primary-actions">
              {!preAlerta?.IdGuia && (
                <Button 
                  variant="primary" 
                  onClick={handleEdit}
                  className="pre-alert-detail__edit-action"
                >
                  ✏️ Editar Pre-Alerta
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="pre-alert-detail__print-action"
              >
                🖨️ Imprimir
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Alert */}
        <CustomAlert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          onConfirm={hideAlert}
        />
      </AppContainer>
    </div>
  );
};

export default PreAlertDetail;