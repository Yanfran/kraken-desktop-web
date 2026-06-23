import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Tracking.module.scss';
import {
  searchTrackingNumber,
  searchTrackingInGuias,
  validateTrackingNumber,
  generateStepsFromStatus
} from '../../services/trackingService';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../services/axiosInstance';
import iconImage from '../../../src/assets/images/icon-kraken-web-rastrear-_1.png';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/common/CustomAlert/CustomAlert';
import Tooltip from '../../components/common/Tooltip/Tooltip';
import toast from 'react-hot-toast';

const PICKUP_STEPS = [
  { key: 'requested', label: 'Solicitado' },
  { key: 'scheduled', label: 'Programado' },
  { key: 'inroute',   label: 'En camino' },
  { key: 'pickedup',  label: 'Recogido' },
];

function getPickupStepIndex(status) {
  if (!status) return 0;
  const msg = (status.statusMessage ?? '').toLowerCase();
  const code = status.onCallStatusCode ?? '';
  if (msg.includes('picked up') || msg.includes('completed') || code === '007') return 3;
  if (msg.includes('in route') || msg.includes('dispatched') || code === '005') return 2;
  if (msg.includes('scheduled') || code === '002') return 1;
  return 0;
}

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [pickupStatus, setPickupStatus] = useState(null);
  const [pickupLoading, setPickupLoading] = useState(false);
  const navigate = useNavigate();
  const alert = useCustomAlert();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isKU = user?.codCliente?.startsWith('KU');

  const handleTrackPackage = async () => {
    const clean = trackingNumber.trim().toUpperCase();
    if (!clean) { alert.showError('Error', 'Ingresa un número de guía o tracking.'); return; }

    setIsLoading(true);
    setPickupStatus(null);

    try {
      if (isKU) {
        const { data: json } = await axiosInstance.get(`/usa/guia/tracking/${encodeURIComponent(clean)}`);
        if (json.success && json.data) {
          const d = json.data;
          const prn = d.pickupCode ?? null;
          const historial = d.statusHistory ?? [];
          setTrackingResult({
            trackingNumber: d.trackingNumber ?? clean,
            origin: d.plataforma ?? 'USA',
            status: d.currentStatus ?? 'En proceso',
            steps: historial.length > 0
              ? historial.map((h, i) => ({
                  name: h.status ?? '—',
                  date: h.timestamp ? new Date(h.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
                  completed: true, current: i === historial.length - 1,
                }))
              : [{ name: d.currentStatus ?? 'En proceso', date: '', completed: true, current: true }],
            guiaId: d.guiaId ?? null,
            idGuia: d.guiaId ?? null,
            pickupCode: prn,
            pickupZip: d.pickupZip ?? null,
          });
          if (prn) {
            setPickupLoading(true);
            try {
              const { data: pRes } = await axiosInstance.get(`/us/ups/pickup/${prn}`);
              if (pRes.success && pRes.data) setPickupStatus(pRes.data);
              else setPickupStatus({ statusMessage: 'Completed', onCallStatusCode: '007' });
            } catch { setPickupStatus({ statusMessage: 'Completed', onCallStatusCode: '007' }); }
            setPickupLoading(false);
          }
        } else {
          alert.showError(t('tracking.not_found_title'), t('tracking.not_found_message'));
        }
      } else {
        let response = await searchTrackingNumber(clean);
        if (!response.success) response = await searchTrackingInGuias(clean);
        if (response.success && response.data) {
          setTrackingResult({
            trackingNumber: response.data.nGuia || clean,
            origin: response.data.origen || 'USA',
            status: response.data.estatus || 'En proceso',
            currentLocation: response.data.ubicacionActual,
            estimatedDelivery: response.data.fechaEstimadaEntrega,
            steps: generateStepsFromStatus(response.data.estatus, response.data.historialEstatus),
            guiaId: response.data.id, idGuia: response.data.idGuia,
          });
        } else {
          alert.showError(t('tracking.not_found_title'), t('tracking.not_found_message'));
        }
      }
    } catch (error) {
      console.error('Error buscando tracking:', error);
      alert.showError(t('tracking.connection_error_title'), t('tracking.connection_error_message'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setTrackingNumber('');
    setTrackingResult(null);
    setPickupStatus(null);
  };

  // Ver detalles del paquete
  const handleVerDetallesTracking = async () => {
    if (!trackingResult) return;

    const guiaId = trackingResult.idGuia || trackingResult.guiaId;

    if (guiaId) {
      navigate(`/guide/detail/${guiaId}`);
      return;
    }

    try {
      console.log('🔍 Buscando guía por número de tracking:', trackingResult.trackingNumber);
      const response = await searchTrackingInGuias(trackingResult.trackingNumber);

      if (response.success && response.data) {
        const foundGuiaId = response.data.idGuia || response.data.id;
        if (foundGuiaId) {
          // console.log('✅ Guía encontrada con ID:', foundGuiaId);
          navigate(`/guide/detail/${foundGuiaId}`);
        } else {
          throw new Error('ID de guía no disponible');
        }
      } else {
        throw new Error('Guía no encontrada en el sistema');
      }
    } catch (error) {
      // console.log('❌ Error buscando detalles de la guía:', error);
      window.alert(
        `Información del Paquete\n\n` +
        `Número de rastreo: ${trackingResult.trackingNumber}\n` +
        `Origen: ${trackingResult.origin}\n` +
        `Estado: ${trackingResult.status}\n` +
        `${trackingResult.currentLocation ? `Ubicación: ${trackingResult.currentLocation}\n` : ''}` +
        `${trackingResult.estimatedDelivery ? `Entrega estimada: ${trackingResult.estimatedDelivery}` : ''}\n\n` +
        'Para ver detalles completos, inicia sesión en tu cuenta.'
      );
    }
  };

  // Renderizar cada paso del tracking (exacto de la app)
  const renderTrackingStep = (step, index) => {
    return (
      <div key={index} className={styles.stepRow}>
        <div className={styles.stepIndicator}>
          {step.completed ? (
            <div className={`${styles.stepCircle} ${styles.stepCompleted}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path 
                  d="M10 3L4.5 8.5L2 6" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div className={`${styles.stepCircle} ${styles.stepPending}`} />
          )}
          {index < (trackingResult?.steps?.length - 1 || 7) && <div className={styles.stepLine} />}
        </div>
        <div className={styles.stepContent}>
          <p className={`${styles.stepTitle} ${step.completed ? styles.stepTitleCompleted : ''} ${step.current ? styles.stepTitleCurrent : ''}`}>
            {step.name}
          </p>
          {step.date && (
            <p className={styles.stepDate}>{step.date}</p>
          )}
        </div>
      </div>
    );
  };

  // Manejar Enter key en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleTrackPackage();
    }
  };

  return (
    <div className={styles.container}>
      <CustomAlert {...alert.alertProps} />
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          <div className={styles.trackingSection}>
            {/* Header con título e icono */}
            <div className={styles.titleContainer}>
              <div className={styles.iconContainer}>
                <img
                  src={iconImage}
                  alt="Tracking Icon"
                  className={styles.calculatorIcon}
                />
              </div>
              <p className={styles.title}>{t('tracking.title')}</p>
              <p className={styles.subtitle}>
                {t('tracking.subtitle')}
              </p>
            </div>

            {/* Input de búsqueda */}
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.trackingInput}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('tracking.placeholder')}
                disabled={isLoading}
              />
              <button
                className={`${styles.trackButton} ${isLoading ? styles.trackButtonDisabled : ''}`}
                onClick={handleTrackPackage}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="white" 
                      strokeWidth="4" 
                      strokeDasharray="32" 
                      strokeDashoffset="0"
                      opacity="0.3"
                    />
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="white" 
                      strokeWidth="4" 
                      strokeDasharray="32" 
                      strokeDashoffset="8"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Resultados del tracking */}
            {trackingResult && (
              <div>
                <div className={styles.resultSection}>
                  <div className={styles.resultHeader}>
                    <p className={styles.resultSubtitle}>
                      {t('tracking.follow_status')}
                    </p>

                    {/* Información del tracking */}
                    <div className={styles.trackingInfo}>
                      <div className={styles.labelContainer}>
                        <div className={styles.labelWithTooltip}>
                          <p className={styles.trackingLabel}>{t('tracking.tracking_label')}</p>
                          <Tooltip
                            content={t('tracking.tracking_tooltip')}
                            position="auto"
                          />
                        </div>
                      </div>

                      <div className={styles.trackingNumberContainer}>
                        <p className={styles.trackingNumberText}>
                          {trackingResult.trackingNumber}
                        </p>
                      </div>

                      <p className={styles.trackingHelper}>
                        {t('tracking.tracking_hint')}
                      </p>
                    </div>

                    {/* Origen del paquete */}
                    <div className={styles.originContainer}>
                      <p className={styles.originLabel}>{t('tracking.origin')}</p>
                      <p className={styles.originText}>{trackingResult.origin}</p>
                    </div>
                  </div>

                  {/* Pickup Progress */}
                  {trackingResult.pickupCode && (
                    <div style={{
                      background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 12,
                      padding: '14px 16px', marginBottom: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 16 }}>🚐</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#F05A22', flex: 1 }}>Recogida UPS</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>
                            PRN: {trackingResult.pickupCode}
                            {trackingResult.pickupZip && ` · ZIP: ${trackingResult.pickupZip}`}
                          </span>
                          <a
                            href="https://www.ups.com/ipr/pickup-status-check?loc=en_US"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 11, color: '#1D4ED8', textDecoration: 'underline' }}
                          >Ver en UPS</a>
                        </span>
                      </div>
                      {pickupLoading ? (
                        <p style={{ textAlign: 'center', color: '#F05A22', fontSize: 13 }}>Consultando estado...</p>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                            {PICKUP_STEPS.map((step, idx) => {
                              const activeIdx = getPickupStepIndex(pickupStatus);
                              const done = idx <= activeIdx;
                              const isCurrent = idx === activeIdx;
                              const nextDone = idx + 1 <= activeIdx;
                              return (
                                <React.Fragment key={step.key}>
                                  <div style={{
                                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? '#22C55E' : '#D1D5DB',
                                    border: isCurrent ? '2px solid #fff' : 'none',
                                    boxShadow: isCurrent ? '0 0 0 2px #22C55E' : 'none',
                                  }}>
                                    {done && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                                  </div>
                                  {idx < PICKUP_STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: 3, background: (done && nextDone) ? '#22C55E' : '#D1D5DB' }} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {PICKUP_STEPS.map((step, idx) => {
                              const activeIdx = getPickupStepIndex(pickupStatus);
                              const done = idx <= activeIdx;
                              const isCurrent = idx === activeIdx;
                              return (
                                <span key={step.key} style={{
                                  fontSize: 10, fontWeight: isCurrent ? 700 : 500,
                                  color: done ? '#065F46' : '#9CA3AF', width: 65, textAlign: 'center',
                                }}>{step.label}</span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline de estados */}
                  <div className={styles.timelineContainer}>
                        {/* ⭐ MODIFICACIÓN CLAVE AQUÍ: Invertir el array antes de mapear */}
                    {trackingResult.steps
                        .slice() // Crea una copia del array
                        .reverse() // Invierte la copia
                        .map((step, index, reversedSteps) => 
                            renderTrackingStep(step, index, reversedSteps.length)
                        )}
                  </div>
                </div>

                {/* Link para ver detalles */}
                <button
                  className={styles.packageDetailsLink}
                  onClick={handleVerDetallesTracking}
                  type="button"
                >
                  <p className={styles.packageDetailsText}>
                    {t('tracking.view_details')}
                  </p>
                </button>

                {/* Botón para nueva búsqueda */}
                <button
                  className={styles.newTrackingButton}
                  onClick={resetSearch}
                  type="button"
                >
                  <p className={styles.newTrackingButtonText}>
                    {t('tracking.track_another')}
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}