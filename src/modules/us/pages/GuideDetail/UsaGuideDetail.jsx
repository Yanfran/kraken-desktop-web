// src/modules/us/pages/GuideDetail/UsaGuideDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { getUsaGuiaDetail } from '../../../../services/us/usGuiasService';
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
} from 'react-icons/io5';
import { API_URL } from '../../../../utils/config';

export default function UsaGuideDetail() {
  const { idGuia } = useParams();
  const navigate   = useNavigate();
  const { isSignedIn } = useAuth();

  const [detail,   setDetail]   = useState(null);
  const [loading,  setLoading]  = useState(true);
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
      const res = await getUsaGuiaDetail(parseInt(idGuia));
      if (res.success) setDetail(res.data);
    } finally {
      setLoading(false);
    }
  }, [idGuia]);

  useEffect(() => {
    if (isSignedIn && idGuia) load();
  }, [idGuia, isSignedIn, load]);

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
        <p>Loading shipment details…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.errorContainer}>
        <IoAlertCircleOutline size={64} color="#ff6b6b" />
        <h2 className={styles.errorTitle}>Shipment not found</h2>
        <p className={styles.errorDescription}>
          Could not load shipment details. Please try again later.
        </p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Go Back
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

  const pickupScheduled = envioExterno?.pickupCode
    && (envioExterno?.estatus === 'scheduled' || envioExterno?.estatus === 'created');

  const totalPaid = (detallesRecibo ?? []).reduce((s, d) => s + (d.monto ?? 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.scrollView}>

        {/* ── Banner pickup status ──────────────────────────────────────────── */}
        <div className={clsx(
          styles.alertContainer,
          pickupScheduled ? styles.alertSuccess : styles.alertInfo
        )}>
          {pickupScheduled
            ? <IoCheckmarkCircleOutline size={24} style={{ color: '#4CAF50' }} />
            : <IoCheckmarkCircleOutline size={24} style={{ color: '#3b82f6' }} />}
          <p className={styles.alertText}>
            {pickupScheduled
              ? `UPS Pickup scheduled — Code: ${envioExterno.pickupCode}`
              : tienePago
                ? 'Shipment registered and paid'
                : 'Shipment registered'}
          </p>
        </div>

        {/* ── N° Guía ───────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Shipment Number</label>
          <p className={styles.sectionValue}>{nGuia}</p>
        </div>

        {/* ── Estatus + Courier ─────────────────────────────────────────────── */}
        <div className={styles.row}>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Status</label>
            <p className={styles.sectionValue}>{estatus}</p>
            <span className={styles.sectionSubtext}>{fechaRegistro}</span>
          </div>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Courier</label>
            <p className={styles.sectionValue}>
              {envioExterno?.courierNombre ?? 'UPS'}
              {envioExterno?.courierServicio ? ` — ${envioExterno.courierServicio}` : ''}
            </p>
          </div>
        </div>

        {/* ── Dirección de entrega ─────────────────────────────────────────── */}
        {direccionEntrega && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Delivery Address</label>
            <p className={styles.sectionValue}>{direccionEntrega}</p>
          </div>
        )}

        {/* ── Tracking number ───────────────────────────────────────────────── */}
        {envioExterno?.trackingNumber && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>UPS Tracking Number</label>
            <p className={clsx(styles.sectionValue, styles.trackingValue)}>
              {envioExterno.trackingNumber}
            </p>
          </div>
        )}

        {/* ── Pickup code ───────────────────────────────────────────────────── */}
        {envioExterno?.pickupCode && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Pickup Confirmation Code</label>
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
          <h2 className={styles.expandableTitle}>Package Details</h2>
          {expanded.otrosDetalles
            ? <IoChevronUpOutline size={24} />
            : <IoChevronDownOutline size={24} />}
        </div>

        {expanded.otrosDetalles && (
          <div className={styles.expandableContent}>
            <div className={styles.row}>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Weight</label>
                <p className={styles.sectionValue}>
                  {Number(peso ?? 0).toFixed(2)} lb
                </p>
              </div>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Declared Value (FOB)</label>
                <p className={styles.sectionValue}>{formatUSD(valorFOB)}</p>
              </div>
            </div>
            {(largo || ancho || alto) && (
              <div className={styles.row}>
                <div className={styles.rowItem}>
                  <label className={styles.sectionLabel}>Dimensions (in)</label>
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
          <h2 className={styles.expandableTitle}>Status History</h2>
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
              Payment Breakdown
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
                <p className={styles.facturaTotalLabel}>Total Paid</p>
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
                <p className={styles.labelNoticeTitle}>Acción requerida — Etiqueta de envío</p>
                <p className={styles.labelNoticeText}>
                  Descarga tu etiqueta, imprímela y pégala en la caja <strong>antes</strong> de que llegue el courier a recoger tu paquete.
                  Sin la etiqueta visible el conductor no podrá retirar el envío.
                </p>
              </div>
            </div>
            <button onClick={handleDownloadLabel} className={styles.labelButton}>
              <IoCloudDownloadOutline size={20} />
              Descargar Etiqueta de Envío (PDF)
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
              Payment Details
            </h2>
            <div className={styles.pagoTable}>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Payment Method</p>
                <span className={styles.pagoValue}>{detallePago.metodoPago}</span>
              </div>
              {detallePago.referencia && (
                <div className={styles.pagoRow}>
                  <p className={styles.pagoLabel}>Reference</p>
                  <span className={styles.pagoValue}>{detallePago.referencia}</span>
                </div>
              )}
              {detallePago.autorizacion && (
                <div className={styles.pagoRow}>
                  <p className={styles.pagoLabel}>Auth Code</p>
                  <span className={styles.pagoValue}>{detallePago.autorizacion}</span>
                </div>
              )}
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Amount</p>
                <span className={styles.pagoValue}>{formatUSD(detallePago.monto)}</span>
              </div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Date</p>
                <span className={styles.pagoValue}>{detallePago.fecha}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
