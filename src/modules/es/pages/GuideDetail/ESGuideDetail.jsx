// src/modules/es/pages/GuideDetail/ESGuideDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { getSpainGuiaDetail } from '../../../../services/es/spainGuiaService';
import {
  openSpainLabel,
  rescheduleSendSeiPickup,
  getNextBusinessDays,
  PICKUP_SLOT,
  formatHorarioSeur,
} from '../../../../services/es/sendSeiService';
import toast from 'react-hot-toast';
import styles from './ESGuideDetail.module.scss';
import clsx from 'clsx';

import {
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoReceiptOutline,
  IoCheckmarkDoneOutline,
  IoCloudDownloadOutline,
  IoWarningOutline,
  IoCalendarOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoStorefrontOutline,
} from 'react-icons/io5';

const RESCHEDULE_DAYS = getNextBusinessDays(5);

export default function ESGuideDetail() {
  const { idGuia } = useParams();
  const navigate   = useNavigate();
  const { isSignedIn } = useAuth();

  const [detail,   setDetail]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [rescheduleOpen,    setRescheduleOpen]    = useState(false);
  const [rescheduleDate,    setRescheduleDate]    = useState(RESCHEDULE_DAYS[0].iso);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError,   setRescheduleError]   = useState('');
  const [expanded, setExpanded] = useState({
    otrosDetalles:    false,
    historialEstatus: false,
  });

  const toggle = useCallback((section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const load = useCallback(async () => {
    if (!idGuia) return;
    setLoading(true);
    try {
      const res = await getSpainGuiaDetail(parseInt(idGuia, 10));
      if (res.success) setDetail(res.data);
    } finally {
      setLoading(false);
    }
  }, [idGuia]);

  useEffect(() => {
    if (isSignedIn && idGuia) load();
  }, [idGuia, isSignedIn, load]);

  // ── Descargar label PDF ──────────────────────────────────────────────────
  // La label_url de SendSei es relativa y exige su API Token: se descarga vía backend.
  const handleDownloadLabel = useCallback(async () => {
    if (!detail?.nGuia) return;
    const res = await openSpainLabel(detail.nGuia);
    if (!res.success) toast.error(res.message);
  }, [detail]);

  // ── Reagendar recogida pendiente (igual que USA) ─────────────────────────
  const handleReschedule = useCallback(async () => {
    if (!detail?.nGuia) return;
    setRescheduleLoading(true);
    setRescheduleError('');
    const res = await rescheduleSendSeiPickup(detail.nGuia, rescheduleDate, PICKUP_SLOT.from, PICKUP_SLOT.to);
    setRescheduleLoading(false);
    if (!res.success) {
      setRescheduleError(res.message || 'No se pudo agendar la recogida. Prueba con otra fecha.');
      return;
    }
    toast.success(`Recogida agendada — código ${res.pickupCode}`);
    setRescheduleOpen(false);
    load();
  }, [detail, rescheduleDate, load]);

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando detalle de la guía...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.errorContainer}>
        <IoAlertCircleOutline size={64} color="#ff6b6b" />
        <h2 className={styles.errorTitle}>Guía no encontrada</h2>
        <p className={styles.errorDescription}>
          No pudimos encontrar los detalles de este envío.
        </p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  const {
    nGuia, estatus, fechaRegistro, tienePago,
    peso, unidadPeso, largo, ancho, alto, valorFOB,
    direccionRecogida,
    historialEstatus, envioExterno, detallePago, detallesRecibo,
  } = detail;

  const formatUSD = (n = 0) =>
    `$${Number(n).toFixed(2)} USD`;

  const esDropOff       = detail.modalidad === 'DROPOFF';
  const puntoOrigen     = envioExterno?.puntoOrigen ?? null;
  const pickupPendiente = !esDropOff && envioExterno?.pickupPendiente === true;
  const pickupScheduled = !pickupPendiente && envioExterno?.pickupCode
    && (envioExterno?.estatus === 'scheduled' || envioExterno?.estatus === 'created');

  const totalPaid = (detallesRecibo ?? []).reduce((s, d) => s + (d.monto ?? 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.scrollView}>

        {/* ── Banner estatus ────────────────────────────────────────────────── */}
        {pickupPendiente ? (
          <div className={clsx(styles.alertContainer, styles.alertWarning)}>
            <IoWarningOutline size={24} style={{ color: '#B45309', flexShrink: 0 }} />
            <p className={styles.alertText}>
              Recogida pendiente — el courier no pudo agendarla automáticamente.
              Puedes reagendarla cuando quieras sin coste adicional.
            </p>
          </div>
        ) : esDropOff ? (
          <div className={clsx(styles.alertContainer, styles.alertInfo)}>
            <IoStorefrontOutline size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <p className={styles.alertText}>
              Drop-off — imprime la etiqueta y entrega tu paquete en el punto SEUR indicado.
            </p>
          </div>
        ) : (
          <div className={clsx(
            styles.alertContainer,
            pickupScheduled ? styles.alertSuccess : styles.alertInfo
          )}>
            <IoCheckmarkCircleOutline
              size={24}
              style={{ color: pickupScheduled ? '#4CAF50' : '#3b82f6' }}
            />
            <p className={styles.alertText}>
              {pickupScheduled
                ? `Recogida agendada — código ${envioExterno.pickupCode}`
                : tienePago
                  ? 'Guía registrada y pagada'
                  : 'Guía registrada'}
            </p>
          </div>
        )}

        {pickupPendiente && (
          <button
            className={styles.rescheduleButton}
            onClick={() => { setRescheduleError(''); setRescheduleOpen(true); }}
          >
            <IoCalendarOutline size={20} /> Reagendar Recogida
          </button>
        )}

        {/* ── N° Guía ───────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>N° de Guía</label>
          <p className={styles.sectionValue}>{nGuia}</p>
        </div>

        {/* ── Estatus + Courier ─────────────────────────────────────────────── */}
        <div className={styles.row}>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Estatus</label>
            <p className={styles.sectionValue}>{estatus}</p>
            <span className={styles.sectionSubtext}>{fechaRegistro}</span>
          </div>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Courier</label>
            <p className={styles.sectionValue}>
              {envioExterno?.courierNombre ?? '—'}
              {envioExterno?.courierServicio ? ` — ${envioExterno.courierServicio}` : ''}
            </p>
          </div>
        </div>

        {/* ── Punto SEUR (drop-off) ──────────────────────────────────────────── */}
        {esDropOff && puntoOrigen && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Punto de Entrega SEUR</label>
            <p className={styles.sectionValue}>{puntoOrigen.nombre ?? puntoOrigen.codigo}</p>
            {puntoOrigen.direccion && <span className={styles.sectionSubtext}>{puntoOrigen.direccion}</span>}
            {formatHorarioSeur(puntoOrigen.horario).map((h) => (
              <span key={h.dia} className={styles.sectionSubtext}>
                <strong>{h.dia}:</strong> {h.horas}
              </span>
            ))}
          </div>
        )}

        {/* ── Dirección de recogida ─────────────────────────────────────────── */}
        {!esDropOff && direccionRecogida && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Dirección de Recogida</label>
            <p className={styles.sectionValue}>{direccionRecogida}</p>
          </div>
        )}

        {/* ── Tracking number ───────────────────────────────────────────────── */}
        {envioExterno?.trackingNumber && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Número de Rastreo</label>
            <p className={clsx(styles.sectionValue, styles.trackingValue)}>
              {envioExterno.trackingNumber}
            </p>
          </div>
        )}

        {/* ── Pickup code (en drop-off PickupCode es el punto SEUR) ─────────── */}
        {!esDropOff && envioExterno?.pickupCode && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Código de Recogida</label>
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
          <h2 className={styles.expandableTitle}>Detalles del Paquete</h2>
          {expanded.otrosDetalles
            ? <IoChevronUpOutline size={24} />
            : <IoChevronDownOutline size={24} />}
        </div>

        {expanded.otrosDetalles && (
          <div className={styles.expandableContent}>
            <div className={styles.row}>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Peso</label>
                <p className={styles.sectionValue}>
                  {Number(peso ?? 0).toFixed(2)} {unidadPeso ?? 'kg'}
                </p>
              </div>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Valor Declarado</label>
                <p className={styles.sectionValue}>{formatUSD(valorFOB)}</p>
              </div>
            </div>
            {(largo || ancho || alto) && (
              <div className={styles.row}>
                <div className={styles.rowItem}>
                  <label className={styles.sectionLabel}>Dimensiones</label>
                  <p className={styles.sectionValue}>
                    L {Number(largo ?? 0).toFixed(1)} ×{' '}
                    A {Number(ancho ?? 0).toFixed(1)} ×{' '}
                    H {Number(alto  ?? 0).toFixed(1)} cm
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
          <h2 className={styles.expandableTitle}>Historial de Estatus</h2>
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
              Desglose de Tarifa
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

              <div className={styles.facturaRowTotal}>
                <p className={styles.facturaTotalLabel}>Total Pagado</p>
                <span className={styles.facturaTotalValue}>{formatUSD(totalPaid)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Etiqueta de envío ────────────────────────────────────────────── */}
        {envioExterno?.labelUrl && (
          <div className={styles.labelSection}>
            <button onClick={handleDownloadLabel} className={styles.labelButton}>
              <IoCloudDownloadOutline size={20} />
              Descargar Etiqueta
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
              Detalle de Pago
            </h2>
            <div className={styles.pagoTable}>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Método de Pago</p>
                <span className={styles.pagoValue}>{detallePago.metodoPago}</span>
              </div>
              {detallePago.referencia && (
                <div className={styles.pagoRow}>
                  <p className={styles.pagoLabel}>Referencia</p>
                  <span className={styles.pagoValue}>{detallePago.referencia}</span>
                </div>
              )}
              {detallePago.autorizacion && (
                <div className={styles.pagoRow}>
                  <p className={styles.pagoLabel}>Código de Autorización</p>
                  <span className={styles.pagoValue}>{detallePago.autorizacion}</span>
                </div>
              )}
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Monto</p>
                <span className={styles.pagoValue}>{formatUSD(detallePago.monto)}</span>
              </div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Fecha</p>
                <span className={styles.pagoValue}>{detallePago.fecha}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal reagendar recogida ──────────────────────────────────────── */}
      {rescheduleOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => { if (!rescheduleLoading) setRescheduleOpen(false); }}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
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
                <p className={styles.alertText}>{rescheduleError}</p>
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
                    key={day.iso}
                    type="button"
                    onClick={() => setRescheduleDate(day.iso)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: rescheduleDate === day.iso ? '2px solid #F05A22' : '1.5px solid #BFDBFE',
                      background: rescheduleDate === day.iso ? '#FFF5F0' : '#fff',
                      color: rescheduleDate === day.iso ? '#F05A22' : '#022364',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: rescheduleDate === day.iso ? '700' : '500',
                      textTransform: 'capitalize',
                    }}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#022364' }}>
                <span style={{ width: 16, flexShrink: 0 }}>🕗</span>
                <span><strong>Franja:</strong> {PICKUP_SLOT.label}</span>
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
