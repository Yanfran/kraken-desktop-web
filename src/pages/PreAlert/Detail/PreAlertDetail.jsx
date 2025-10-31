// src/pages/PreAlert/PreAlertDetail.jsx - CON ICONOS ACTUALIZADOS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PreAlertDetail.styles.scss';
import iconImage from '../../../assets/images/icon-kraken-web-parlante_1.png'; 

// Icons actualizados
import { 
  IoCreateOutline,
  IoCubeOutline,        // Para paquetes 📦
  IoCarOutline,         // Para delivery 🚚
  IoLocationOutline,    // Para ubicación 📍
  IoClipboardOutline,   // Para información 📋
  IoInformationCircleOutline, // Para el status box ℹ️
  IoArrowBack,         // Para el botón de volver
  IoDocumentTextOutline // Para facturas 📄
} from 'react-icons/io5';

// Services
import { getPreAlertaById } from '@services/preAlertService';

const PreAlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [preAlerta, setPreAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load pre-alert data
  const loadData = async () => {
    if (!id) return;

    try {
      console.log('📥 Cargando pre-alerta ID:', id);
      const response = await getPreAlertaById(Number(id));
      
      if (response.success) {
        setPreAlerta(response.data);
        setError('');
        console.log('✅ Pre-alerta cargada:', response.data);
      } else {
        setError(response.message || 'Error al cargar pre-alerta');
        toast.error(response.message || 'Error al cargar pre-alerta');
      }
    } catch (error) {
      console.error('❌ Error loading pre-alert:', error);
      setError(error.message || 'Error al cargar pre-alerta');
      toast.error(error.message || 'Error al cargar pre-alerta');
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Format trackings
  const formatTrackings = (trackings) => {
    if (!trackings) return [];
    return Array.isArray(trackings) ? trackings : [trackings];
  };

  // Get status info
  const getStatusInfo = (data) => {
    if (!data) return { text: 'Desconocido', className: 'unknown' };
    
    if (data.idGuia || data.IdGuia) {
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
    navigate(`/pre-alert/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Loading state
  if (loading) {
    return (
      <div className="pre-alert-detail">
        <div className="pre-alert-detail__loading">
          <div className="spinner"></div>
          <p>Cargando detalles de la pre-alerta...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !preAlerta) {
    return (
      <div className="pre-alert-detail">
        <div className="pre-alert-detail__error">
          <div className="pre-alert-detail__error-icon">❌</div>
          <h2 className="pre-alert-detail__error-title">Error al cargar</h2>
          <p className="pre-alert-detail__error-message">{error}</p>
          <div className="pre-alert-detail__error-actions">
            <button onClick={handleBack} className="btn btn--outline">
              Volver al inicio
            </button>
            <button onClick={loadData} className="btn btn--primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusInfo(preAlerta);
  const trackings = formatTrackings(preAlerta?.trackings);

  return (
    <div className="pre-alert-detail">
      <div className="pre-alert-detail__container">
        
        {/* Header */}
        <div className="pre-alert-detail-padre__header">
          <div className="prealert-detail__icon">
            <img
              src={iconImage}
              style={{
                width: 50,
                filter: 'invert(41%) sepia(99%) saturate(7496%) hue-rotate(358deg) brightness(99%) contrast(101%)'
              }}
              alt=""
            />
          </div>

          <div className="pre-alert-detail__header">
            
            <button onClick={handleBack} className="pre-alert-detail__back-btn">
              <IoArrowBack size={18} style={{ marginBottom: -3, marginRight: 8 }} />
              Volver
            </button>
            
            <div className="pre-alert-detail__header-info">
              <h1 className="pre-alert-detail__title">
                Pre-Alerta #{preAlerta?.id}
              </h1>
            </div>
            
            {!preAlerta?.idGuia && !preAlerta?.IdGuia && (
              <button onClick={handleEdit} className="btn btn--primary">
                <IoCreateOutline size={18} style={{ marginBottom: -3}} /> Editar
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pre-alert-detail__content">
          
          {/* Trackings Section */}
          <div className="pre-alert-detail__section">
            <h2 className="pre-alert-detail__section-title">
              <IoCubeOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Números de Tracking
            </h2>
            <div className="pre-alert-detail__trackings">
              {trackings.length > 0 ? (
                trackings.map((tracking, index) => (
                  <div key={index} className="pre-alert-detail__tracking-item">
                    <span className="pre-alert-detail__tracking-number">
                      {tracking}
                    </span>
                  </div>
                ))
              ) : (
                <p className="pre-alert-detail__no-data">
                  Sin números de tracking
                </p>
              )}
            </div>
          </div>

          {/* Delivery Info Section */}
          <div className="pre-alert-detail__section">
            <h2 className="pre-alert-detail__section-title">
              <IoCarOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Dirección de Entrega
            </h2>
            <div className="pre-alert-detail__delivery-info">
              <p className="pre-alert-detail__delivery-text">
                {preAlerta?.direccionResumen || 'Sin dirección especificada'}
              </p>
              {preAlerta?.nombreLocker && (
                <p className="pre-alert-detail__delivery-locker">
                  <IoLocationOutline size={18} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Locker: {preAlerta.nombreLocker}
                </p>
              )}
            </div>
          </div>

          {/* Package Info Section */}
          <div className="pre-alert-detail__section">
            <h2 className="pre-alert-detail__section-title">
              <IoClipboardOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Información del Paquete
            </h2>
            <div className="pre-alert-detail__info-grid">
              
              <div className="pre-alert-detail__info-item">
                <label className="pre-alert-detail__label">Contenido</label>
                <span className="pre-alert-detail__value">
                  {preAlerta?.contenido || 'Sin especificar'}
                </span>
              </div>

              <div className="pre-alert-detail__info-item">
                <label className="pre-alert-detail__label">Tipo de Contenido</label>
                <span className="pre-alert-detail__value">
                  {preAlerta?.tipoContenido || 'Sin especificar'}
                </span>
              </div>

              <div className="pre-alert-detail__info-item">
                <label className="pre-alert-detail__label">Valor Declarado</label>
                <span className="pre-alert-detail__value">
                  ${preAlerta?.valorDeclarado?.parsedValue || preAlerta?.valorDeclarado || preAlerta?.valor || '0.00'}
                </span>
              </div>      

              <div className="pre-alert-detail__info-item">
                <label className="pre-alert-detail__label">Facturas</label>
                <span className="pre-alert-detail__value pre-alert-detail__value--invoices">
                  <IoDocumentTextOutline size={18} />
                  {preAlerta?.archivosActuales?.length || 0} archivo(s) adjunto(s)
                </span>
              </div>                  

              {preAlerta?.tipoEnvio && (
                <div className="pre-alert-detail__info-item">
                  <label className="pre-alert-detail__label">Tipo de Envío</label>
                  <span className="pre-alert-detail__value">
                    {preAlerta.tipoEnvio}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Description */}
          {/* {status.description && (
            <div className="pre-alert-detail__status-box">
              <div className="pre-alert-detail__status-icon">
                <IoInformationCircleOutline size={24} />
              </div>
              <div className="pre-alert-detail__status-description">
                <strong>Estado:</strong> {status.description}
              </div>
            </div>
          )} */}

        </div>
      </div>
    </div>
  );
};

export default PreAlertDetail;