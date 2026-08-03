// src/modules/us/pages/GuideDetail/UsaGuideDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { getUsaGuiaDetail } from '../../../../services/us/usGuiasService';
import { rescheduleUpsPickup } from '../../../../services/us/upsService';
import styles from './UsaGuideDetail.module.scss';
import clsx from 'clsx';

import {
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoReceiptOutline,
  IoCheckmarkDoneOutline,
  IoCloudDownloadOutline,
  IoCalendarOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import { API_URL } from '../../../../utils/config';

function getNextBusinessDays(n) {
  const days = [];
  const d = new Date();
  while (days.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      const copy = new Date(d);
      const y = copy.getFullYear();
      const m = String(copy.getMonth() + 1).padStart(2, '0');
      const day = String(copy.getDate()).padStart(2, '0');
      days.push({
        isoDate: `${y}-${m}-${day}`,
        short:   copy.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
  }
  return days;
}

const RESCHEDULE_DAYS   = getNextBusinessDays(5);
const RESCHEDULE_ALLDAY = { readyTime: '0800', closeTime: '1700' };

export default function UsaGuideDetail() {
  const { idGuia } = useParams();
  const navigate   = useNavigate();
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();

  const [detail,   setDetail]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState({
    otrosDetalles:    false,
    historialEstatus: false,
  });
  const [rescheduleOpen,    setRescheduleOpen]    = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError,   setRescheduleError]   = useState('');
  const [rescheduleDate,    setRescheduleDate]    = useState(RESCHEDULE_DAYS[0].isoDate);

  const toggle = useCallback((section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const load = useCallback(async () => {
    if (!idGuia) return;
    setLoading(true);
    try {
      const res = await getUsaGuiaDetail(parseInt(idGuia));
      if (res.success) setDetail(res.data);
    } finally {
      setLoading(false);
    }
  }, [idGuia]);

  useEffect(() => {
    if (isSignedIn && idGuia) load();
  }, [idGuia, isSignedIn, load]);

  // ── Reagendar recogida ───────────────────────────────────────────────────
  const handleReschedule = useCallback(async () => {
    if (!detail?.nGuia) return;
    setRescheduleLoading(true);
    setRescheduleError('');
    try {
      const res = await rescheduleUpsPickup(detail.nGuia, rescheduleDate, RESCHEDULE_ALLDAY.readyTime, RESCHEDULE_ALLDAY.closeTime);
      if (res.success) {
        setRescheduleOpen(false);
        await load();
      } else {
        setRescheduleError(res.message ?? 'No se pudo agendar la recogida. Intenta más tarde.');
      }
    } finally {
      setRescheduleLoading(false);
    }
  }, [detail, load]);

  // ── Descargar label PDF ──────────────────────────────────────────────────
  const handleDownloadLabel = useCallback(() => {
    const url = detail?.envioExterno?.labelUrl;
    if (!url) return;
    const backendBase = API_URL.replace(/\/api$/, '');
    const fullUrl = url.startsWith('http') ? url : `${backendBase}${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }, [detail]);

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>{t('us_guide.loading_detail')}</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.errorContainer}>
        <IoAlertCircleOutline size={64} color="#ff6b6b" />
        <h2 className={styles.errorTitle}>{t('us_guide.not_found_title')}</h2>
        <p className={styles.errorDescription}>
          {t('us_guide.not_found_desc')}
        </p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          {t('us_guide.go_back')}
        </button>
      </div>
    );
  }

  const {
    nGuia, estatus, fechaRegistro, tienePago,
    peso, unidadPeso, largo, ancho, alto, valorFOB,
    direccionEntrega,
    historialEstatus, envioExterno, detallePago, detallesRecibo,
  } = detail;

  const formatUSD = (n = 0) =>
    `$${Number(n).toFixed(2)} USD`;

  const pickupPendiente = envioExterno?.pickupPendiente === true;
  const pickupScheduled = !pickupPendiente && envioExterno?.pickupCode
    && (envioExterno?.estatus === 'scheduled' || envioExterno?.estatus === 'created');

  const totalPaid = (detallesRecibo ?? []).reduce((s, d) => s + (d.monto ?? 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.scrollView}>

        {/* ── Banner pickup status ──────────────────────────────────────────── */}
        {pickupPendiente ? (
          <div className={clsx(styles.alertContainer, styles.alertWarning)}>
            <IoWarningOutline size={24} style={{ color: '#B45309', flexShrink: 0 }} />
            <p className={styles.alertText}>
              Recogida pendiente — UPS no pudo agendar automáticamente. Puedes reagendarla cuando quieras sin cargo adicional.
            </p>
          </div>
        ) : (
          <div className={clsx(
            styles.alertContainer,
            pickupScheduled ? styles.alertSuccess : styles.alertInfo
          )}>
            {pickupScheduled
              ? <IoCheckmarkCircleOutline size={24} style={{ color: '#4CAF50' }} />
              : <IoCheckmarkCircleOutline size={24} style={{ color: '#3b82f6' }} />}
            <p className={styles.alertText}>
              {pickupScheduled
                ? t('us_guide.pickup_scheduled', { code: envioExterno.pickupCode })
                : tienePago
                  ? t('us_guide.registered_paid')
                  : t('us_guide.registered')}
            </p>
          </div>
        )}

        {/* ── Reagendar recogida button ─────────────────────────────────────── */}
        {pickupPendiente && (
          <button
            className={styles.rescheduleButton}
            onClick={() => {
              setRescheduleError('');
              setRescheduleOpen(true);
            }}
          >
            <IoCalendarOutline size={20} />
            Reagendar Recogida
          </button>
        )}

        {/* ── N° Guía ───────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{t('us_guide.shipment_number')}</label>
          <p className={styles.sectionValue}>{nGuia}</p>
        </div>

        {/* ── Estatus + Courier ─────────────────────────────────────────────── */}
        <div className={styles.row}>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>{t('us_guide.status')}</label>
            <p className={styles.sectionValue}>{estatus}</p>
            <span className={styles.sectionSubtext}>{fechaRegistro}</span>
          </div>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>{t('us_guide.courier')}</label>
            <p className={styles.sectionValue}>
              {envioExterno?.courierNombre ?? 'UPS'}
              {envioExterno?.courierServicio ? ` — ${envioExterno.courierServicio}` : ''}
            </p>
          </div>
        </div>

        {/* ── Dirección de entrega ─────────────────────────────────────────── */}
        {direccionEntrega && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>{t('us_guide.delivery_address')}</label>
            <p className={styles.sectionValue}>{direccionEntrega}</p>
          </div>
        )}

        {/* ── Tracking number ───────────────────────────────────────────────── */}
        {envioExterno?.trackingNumber && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>{t('us_guide.tracking_number')}</label>
            <p className={clsx(styles.sectionValue, styles.trackingValue)}>
              {envioExterno.trackingNumber}
            </p>
          </div>
        )}

        {/* ── Pickup code ───────────────────────────────────────────────────── */}
        {envioExterno?.pickupCode && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>{t('us_guide.pickup_code')}</label>
            <p className={styles.pickupCodeValue}>{envioExterno.pickupCode}</p>
            {envioExterno.pickupFecha && (
              <span className={styles.sectionSubtext}>
                {envioExterno.pickupFecha}
                {envioExterno.pickupHoraDesde && envioExterno.pickupHoraHasta
                  ? ` · ${envioExterno.pickupHoraDesde} – ${envioExterno.pickupHoraHasta}`
                  : ''}
              </span>
            )}
          </div>
        )}

        {/* ── Otros Detalles (expandable) ───────────────────────────────────── */}
        <div
          className={styles.expandableHeader}
          onClick={() => toggle('otrosDetalles')}
        >
          <h2 className={styles.expandableTitle}>{t('us_guide.package_details')}</h2>
          {expanded.otrosDetalles
            ? <IoChevronUpOutline size={24} />
            : <IoChevronDownOutline size={24} />}
        </div>

        {expanded.otrosDetalles && (
          <div className={styles.expandableContent}>
            <div className={styles.row}>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>{t('us_guide.weight')}</label>
                <p className={styles.sectionValue}>
                  {Number(peso ?? 0).toFixed(2)} lb
                </p>
              </div>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>{t('us_guide.declared_value')}</label>
                <p className={styles.sectionValue}>{formatUSD(valorFOB)}</p>
              </div>
            </div>
            {(largo || ancho || alto) && (
              <div className={styles.row}>
                <div className={styles.rowItem}>
                  <label className={styles.sectionLabel}>{t('us_guide.dimensions')}</label>
                  <p className={styles.sectionValue}>
                    L {Number(largo ?? 0).toFixed(1)} ×{' '}
                    W {Number(ancho ?? 0).toFixed(1)} ×{' '}
                    H {Number(alto  ?? 0).toFixed(1)} in
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Historial de Estatus (expandable) ────────────────────────────── */}
        <div
          className={styles.expandableHeader}
          onClick={() => toggle('historialEstatus')}
        >
          <h2 className={styles.expandableTitle}>{t('us_guide.status_history')}</h2>
          {expanded.historialEstatus
            ? <IoChevronUpOutline size={24} />
            : <IoChevronDownOutline size={24} />}
        </div>

        {expanded.historialEstatus && (
          <div className={styles.expandableContent}>
            {(historialEstatus ?? []).map((item, i) => (
              <div key={i} className={styles.historyItem}>
                <IoCheckmarkCircleOutline size={24} color="#28a745" />
                <div className={styles.historyContent}>
                  <p className={styles.historyStatus}>{item.estatus}</p>
                  <span className={styles.historyDate}>{item.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Detalle de Recibo (USD) ───────────────────────────────────────── */}
        {(detallesRecibo?.length > 0) && (
          <div className={styles.facturaSection}>
            <h2 className={styles.facturaTitle}>
              <IoReceiptOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {t('us_guide.payment_breakdown')}
            </h2>

            <div className={styles.facturaTable}>
              {detallesRecibo.map((d, i) => {
                const isDiscount = d.monto < 0;
                return (
                  <div
                    key={i}
                    className={clsx(styles.facturaRow, {
                      [styles.facturaRowDescuento]: isDiscount,
                    })}
                  >
                    <p className={styles.facturaLabel}>{d.descripcion}</p>
                    <span className={styles.facturaValue}>{formatUSD(d.monto)}</span>
                  </div>
                );
              })}

              {/* Total row */}
              <div className={styles.facturaRowTotal}>
                <p className={styles.facturaTotalLabel}>{t('us_guide.total_paid')}</p>
                <span className={styles.facturaTotalValue}>{formatUSD(totalPaid)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Etiqueta de envío ────────────────────────────────────────────── */}
        {envioExterno?.labelUrl && (
          <div className={styles.labelSection}>
            <div className={styles.labelNotice}>
              <span className={styles.labelNoticeIcon}>⚠️</span>
              <div>
                <p className={styles.labelNoticeTitle}>{t('us_guide.label_notice_title')}</p>
                <p className={styles.labelNoticeText}>
                  {t('us_guide.label_notice_text')}
                </p>
              </div>
            </div>
            <button onClick={handleDownloadLabel} className={styles.labelButton}>
              <IoCloudDownloadOutline size={20} />
              {t('us_guide.download_label')}
            </button>
          </div>
        )}

        {/* ── Detalle de Pago ───────────────────────────────────────────────── */}
        {detallePago && (
          <div className={styles.pagoSection}>
            <h2 className={styles.pagoTitle}>
              <IoCheckmarkDoneOutline
                size={22}
                style={{ marginRight: 8, verticalAlign: 'middle', color: '#28a745' }}
              />
              {t('us_guide.payment_details')}
            </h2>
            <div className={styles.pagoTable}>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>{t('us_guide.payment_method')}</p>
                <span className={styles.pagoValue}>{detallePago.metodoPago}</span>
              </div>
              {detallePago.referencia && (
                <div className={styles.pagoRow}>
                  <p className={styles.pagoLabel}>{t('us_guide.reference')}</p>
                  <span className={styles.pagoValue}>{detallePago.referencia}</span>
                </div>
              )}
              {detallePago.autorizacion && (
                <div className={styles.pagoRow}>
                  <p className={styles.pagoLabel}>{t('us_guide.auth_code')}</p>
                  <span className={styles.pagoValue}>{detallePago.autorizacion}</span>
                </div>
              )}
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>{t('us_guide.amount')}</p>
                <span className={styles.pagoValue}>{formatUSD(detallePago.monto)}</span>
              </div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>{t('us_guide.date')}</p>
                <span className={styles.pagoValue}>{detallePago.fecha}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Reschedule Modal ─────────────────────────────────────────────── */}
      {rescheduleOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => { if (!rescheduleLoading) setRescheduleOpen(false); }}
        >
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Reagendar Recogida</h2>
              <button
                className={styles.modalClose}
                onClick={() => { if (!rescheduleLoading) setRescheduleOpen(false); }}
                disabled={rescheduleLoading}
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            {rescheduleError && (
              <div className={clsx(styles.alertContainer, styles.alertWarning)} style={{ marginBottom: '1rem' }}>
                <IoWarningOutline size={20} style={{ color: '#B45309', flexShrink: 0 }} />
                <p className={styles.alertText} style={{ color: '#92400E' }}>{rescheduleError}</p>
              </div>
            )}

            <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '10px', padding: '14px 16px', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#022364' }}>
                <IoCalendarOutline size={16} />
                <strong>Fecha:</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {RESCHEDULE_DAYS.map((day) => (
                  <button
                    key={day.isoDate}
                    type="button"
                    onClick={() => setRescheduleDate(day.isoDate)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: rescheduleDate === day.isoDate ? '2px solid #F05A22' : '1.5px solid #BFDBFE',
                      background: rescheduleDate === day.isoDate ? '#FFF5F0' : '#fff',
                      color: rescheduleDate === day.isoDate ? '#F05A22' : '#022364',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: rescheduleDate === day.isoDate ? '700' : '500',
                      textTransform: 'capitalize',
                    }}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#022364' }}>
                <span style={{ width: 16, flexShrink: 0 }}>🕗</span>
                <span><strong>Ventana:</strong> Todo el día (08:00 – 17:00)</span>
              </div>
            </div>

            <button
              className={styles.rescheduleSubmitBtn}
              onClick={handleReschedule}
              disabled={rescheduleLoading}
            >
              {rescheduleLoading
                ? 'Procesando…'
                : <><IoRefreshOutline size={18} /> Confirmar Reagendamiento</>}
            </button>

            <p className={styles.rescheduleHint}>No se realizará ningún cargo adicional.</p>
          </div>
        </div>
      )}
    </div>
  );
}
