// src/modules/us/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 5 del wizard USA — Método de pago + creación de guía post-pago

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { axiosPaymentInstance } from '../../../../../services/axiosInstance';
import { createUpsPickup, createUpsShipment } from '../../../../../services/us/upsService';
import { getNextNGuia } from '../../../../../services/us/usGuiasService';
import { useAuth } from '../../../../../contexts/AuthContext';
import { API_URL } from '../../../../../utils/config';
import {
  IoCheckmarkCircle,
  IoCheckmarkDoneOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoCloudDownloadOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoKeyOutline,
  IoCarOutline,
  IoCardOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoHomeOutline,
  IoCubeOutline,
  IoMailOutline,
  IoPricetagOutline,
  IoCheckbox,
  IoSquareOutline,
} from 'react-icons/io5';
import './Step4Payment.scss';

// Devuelve el próximo día hábil (lunes si cae en fin de semana)
const getNextBusinessDay = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // sábado → lunes
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // domingo → lunes
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};

const HALARAPAY_TOKENIZATION_KEY = 'XEaBVN-yX978V-PJJ64R-Z6KdqZ';
const HALARAPAY_SCRIPT_SRC = 'https://halarapay.transactiongateway.com/token/Collect.js';

// ── Métodos de pago USA — labels resolved at render time via t() ──────────────
const PAYMENT_METHOD_IDS = [
  { id: 'card', render: () => <IoCardOutline size={22} /> },
  // { id: 'zelle', render: () => '💜' },
];

// ── Bloque informativo Zelle ──────────────────────────────────────────────────
const ZelleInfo = () => {
  const { t } = useTranslation();
  return (
  <div
    className="redsys-info-block"
    style={{ borderLeft: '4px solid #6d28d9', backgroundColor: '#f5f3ff' }}
  >
    <div className="redsys-info-block__icon" style={{ color: '#6d28d9' }}>💜</div>
    <p className="redsys-info-block__title" style={{ color: '#3b0764' }}>{t('us_wizard.zelle_title')}</p>
    <p className="redsys-info-block__desc" style={{ color: '#5b21b6' }}>
      {t('us_wizard.zelle_desc')}
    </p>
    <div style={{
      background: '#ffffff', padding: '15px', borderRadius: '8px',
      margin: '15px 0', fontSize: '14px', border: '1px solid #ddd6fe'
    }}>
      <p style={{ margin: '0 0 8px 0', color: '#111827' }}>
        <strong>Zelle Email:</strong> payments@krakencourier.com
      </p>
      <p style={{ margin: '0', color: '#111827' }}>
        <strong>Memo:</strong> Kraken Shipment Payment
      </p>
    </div>
    <p className="redsys-info-block__hint" style={{ color: '#5b21b6' }}>
      ⚠️ {t('us_wizard.zelle_hint')}
    </p>
  </div>
  );
};

// ── Info de tarjeta (lightbox — HalaraPay muestra su propio modal) ────────────
const CardInfo = () => {
  const { t } = useTranslation();
  return (
  <div className="redsys-info-block" style={{ borderLeft: '4px solid #022364', backgroundColor: '#eff6ff' }}>
    <div className="redsys-info-block__icon" style={{ color: '#022364' }}><IoCardOutline size={32} /></div>
    <p className="redsys-info-block__title" style={{ color: '#022364' }}>{t('us_wizard.card_sec_title')}</p>
    <p className="redsys-info-block__desc" style={{ color: '#1e40af' }}>
      {t('us_wizard.card_sec_desc')}
    </p>
    <p className="redsys-info-block__hint" style={{ color: '#1e40af' }}>
      {t('us_wizard.card_sec_hint')}
    </p>
  </div>
  );
};

// ── Pantalla de Éxito ─────────────────────────────────────────────────────────
const NAVY   = '#022364';
const ORANGE = '#F05A22';
const GREEN  = '#22C55E';
const AMBER  = '#F59E0B';

const SuccessScreen = ({ nGuia, metodoPago, labelBase64, labelUrl, trackingNumber, pickupWarning }) => {
  const navigate   = useNavigate();
  const hasLabel   = !!labelBase64 || !!labelUrl;
  const [copied,       setCopied]       = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(nGuia).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (labelBase64) {
        const now   = new Date();
        const p     = (n) => String(n).padStart(2, '0');
        const stamp = `${now.getFullYear()}${p(now.getMonth()+1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}`;
        const bytes = Uint8Array.from(atob(labelBase64), c => c.charCodeAt(0));
        const blob  = new Blob([bytes], { type: 'application/pdf' });
        const url   = URL.createObjectURL(blob);
        const a     = document.createElement('a');
        a.href = url; a.download = `${nGuia || `KU-${stamp}`}.pdf`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      } else if (labelUrl) {
        const base    = API_URL.replace(/\/api$/, '');
        const fullUrl = labelUrl.startsWith('http') ? labelUrl : `${base}${labelUrl}`;
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      background: '#F9FAFB', minHeight: '60vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px 60px',
    }}>
      {/* Check circle */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 20px ${GREEN}66`,
        }}>
          <IoCheckmarkCircle size={44} color="#fff" />
        </div>
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: `${GREEN}18`, pointerEvents: 'none',
        }} />
      </div>

      {/* Títulos */}
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px', textAlign: 'center' }}>
        ¡Envío Registrado!
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', textAlign: 'center' }}>
        Hemos recibido tu solicitud de recogida correctamente.
      </p>

      {/* Card número de guía */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#fff', borderRadius: 16, padding: '16px 20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 8px' }}>
          Número de guía
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: 0.5 }}>{nGuia}</span>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#F3F4F6', border: 'none', borderRadius: 8,
              padding: '6px 12px', cursor: 'pointer',
              color: copied ? GREEN : NAVY, fontWeight: 600, fontSize: 12,
            }}
          >
            {copied
              ? <><IoCheckmarkDoneOutline size={16} /> ¡Copiado!</>
              : <><IoCopyOutline size={16} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* Banner pickup warning */}
      {pickupWarning && (
        <div style={{
          width: '100%', maxWidth: 440, marginBottom: 12,
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: '#FEF2F2', borderLeft: '4px solid #DC2626',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <IoAlertCircleOutline size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#991B1B' }}>
              Recogida pendiente de confirmación
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#7F1D1D', lineHeight: 1.6 }}>
              Tu envío quedó registrado, pero no pudimos confirmar la recogida automáticamente con UPS.
              Nuestro equipo se pondrá en contacto contigo para coordinarla.
              Guía: <strong>{nGuia}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Tracking UPS */}
      {!!trackingNumber && (
        <div style={{
          width: '100%', maxWidth: 440, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#EFF6FF', border: '1px solid #DBEAFE',
          borderRadius: 10, padding: '12px 14px',
        }}>
          <IoCubeOutline size={16} color={NAVY} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#374151' }}>
            UPS Tracking: <strong style={{ color: NAVY }}>{trackingNumber}</strong>
          </span>
        </div>
      )}

      {/* Banner + botón etiqueta */}
      <div style={{ width: '100%', maxWidth: 440, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: '#FFFBEB', borderLeft: '4px solid #F59E0B',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <IoWarningOutline size={20} color={AMBER} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#92400E' }}>
              Acción requerida — Etiqueta de envío
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              {hasLabel
                ? <>Descarga tu etiqueta, imprímela y <strong>pégala en tu caja</strong> antes de que llegue el courier. Sin la etiqueta visible el conductor no podrá retirar el envío.</>
                : <>Tu etiqueta ha sido solicitada. La recibirás en tu correo en breve. Puedes también descargarla desde <strong>Ver Mis Envíos</strong> una vez disponible.</>}
            </p>
          </div>
        </div>
        {hasLabel && (
          <button
            onClick={!downloading ? handleDownload : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: downloading ? '#D1D5DB' : NAVY, color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 20px',
              fontSize: 15, fontWeight: 700, cursor: downloading ? 'default' : 'pointer',
              width: '100%',
            }}
          >
            <IoCloudDownloadOutline size={20} />
            {downloading ? 'Descargando…' : 'Descargar Etiqueta de Envío (PDF)'}
          </button>
        )}
      </div>

      {/* Email */}
      <div style={{
        width: '100%', maxWidth: 440, marginBottom: 20,
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <IoMailOutline size={15} color="#6B7280" style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55 }}>
          Tu envío ha sido registrado. Recibirás un correo de confirmación en breve.
        </span>
      </div>

      {/* Botón Ir al Inicio */}
      <button
        onClick={() => window.location.href = '/home'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', maxWidth: 440, background: ORANGE, color: '#fff',
          border: 'none', borderRadius: 14, padding: '15px 20px',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
          boxShadow: `0 4px 12px ${ORANGE}44`,
        }}
      >
        <IoHomeOutline size={20} /> Ir al Inicio
      </button>

      {/* Botón Ver Mis Envíos */}
      <button
        onClick={() => navigate('/guide/guides')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', maxWidth: 440, background: '#fff', color: NAVY,
          border: `1.5px solid #E5E7EB`, borderRadius: 14, padding: '14px 20px',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <IoCubeOutline size={18} /> Ver Mis Envíos
      </button>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Step4Payment = ({ data, updateData, onBack }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting,     setSubmitting]     = useState(false);
  const [submitPhase,    setSubmitPhase]     = useState('');
  const [pendingRetry,   setPendingRetry]   = useState(null); // { transactionId, orderPayload }
  const [submitError,    setSubmitError]     = useState(null);
  const [guiaResult,     setGuiaResult]      = useState(null);
  const [collectJsReady, setCollectJsReady]  = useState(false);

  const { metodoPago, calculationResult, courierQuote } = data;
  const [acceptContent, setAcceptContent] = useState(false);
  const [acceptWeight, setAcceptWeight]   = useState(false);

  // ── Precios en USD ────────────────────────────────────────────────────────
  const usd      = (n) => `$${Number(n || 0).toFixed(2)} USD`;
  const shipping = Number(calculationResult?.data?.total || 0);
  const courier  = courierQuote ? Number(courierQuote.cost || courierQuote.total || 0) : 0;
  const pickup   = Number(data.pickupRate ?? 0);
  const isPickup = data.deliveryMethod === 'pickup';
  const discounts   = data.discounts ?? {};
  const discountPct = isPickup ? (discounts.pickup?.porcentaje ?? 0) : (discounts.dropoff?.porcentaje ?? 0);
  const discountName = isPickup ? (discounts.pickup?.nombre ?? 'Descuento Pickup') : (discounts.dropoff?.nombre ?? 'Descuento Drop-Off');
  const subtotalBeforeDiscount = shipping + courier + pickup;
  const discountAmount = discountPct > 0 ? subtotalBeforeDiscount * discountPct / 100 : 0;
  const total    = Number((subtotalBeforeDiscount - discountAmount).toFixed(2));

  const totalRef      = useRef(total);
  const lightboxOpen  = useRef(false);
  useEffect(() => { totalRef.current = total; }, [total]);

  // Clave sessionStorage para recuperación si el navegador se cierra/falla tras el cobro
  const RECOVERY_KEY = 'krakenu_pending_tx';

  // Al montar: si hay un pago pendiente sin guía, ofrecer reintento
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RECOVERY_KEY);
      if (stored) {
        const { transactionId } = JSON.parse(stored);
        if (transactionId) setPendingRetry(transactionId);
      }
    } catch { sessionStorage.removeItem(RECOVERY_KEY); }
  }, []); // eslint-disable-line

  // ── Pasos post-pago: pickup + label + guía ────────────────────────────────
  // Separado del cobro para poder reintentar sin volver a cobrar.
  const runPostPaymentFlow = async (transactionId) => {
    const pkg  = data.packages?.[0] ?? {};
    const addr = data.selectedOriginAddress ?? {};

    const weightKg = pkg.unidadPeso?.toLowerCase() === 'lb'
      ? parseFloat(pkg.peso || 0) / 2.20462
      : parseFloat(pkg.peso || 0);

    let prn = '', pickupTransId = '', pickupResultDate = null;
    let pickupReady = data.pickupReadyTime || '0900';
    let pickupClose = data.pickupCloseTime || '1700';
    let pickupFailed = false;

    if (isPickup) {
      setSubmitPhase('Scheduling UPS pickup…');
      try {
        const pickupResult = await createUpsPickup({
          pickupDate:           data.pickupDate || getNextBusinessDay(),
          readyTime:            data.pickupReadyTime || '0900',
          closeTime:            data.pickupCloseTime || '1700',
          contactName:          addr.alias || 'Client',
          companyName:          'Kraken Courier & Cargo INC',
          addressLine:          addr.line1 || '',
          city:                 addr.city  || '',
          stateProvince:        addr.province || addr.state || addr.stateProvince || 'FL',
          postalCode:           addr.zip   || '',
          residentialIndicator: 'Y',
          phone:                (addr.phone || '').replace(/\D/g, '').slice(0, 10) || '',
          weight:               parseFloat(weightKg.toFixed(2)) || 1,
          unitSystem:           'METRIC',
          quantity:             1,
          serviceCode:          '003',
          referenceNumber:      '',
        });

        prn             = pickupResult.success ? (pickupResult.data?.prn                   ?? '') : '';
        pickupTransId   = pickupResult.success ? (pickupResult.data?.transactionIdentifier ?? '') : '';
        pickupResultDate= pickupResult.success ? (pickupResult.data?.pickupDate             ?? null) : null;
        pickupReady     = pickupResult.success ? (pickupResult.data?.readyTime  ?? data.pickupReadyTime ?? '0900') : (data.pickupReadyTime ?? '0900');
        pickupClose     = pickupResult.success ? (pickupResult.data?.closeTime  ?? data.pickupCloseTime ?? '1700') : (data.pickupCloseTime ?? '1700');

        if (!pickupResult.success || !prn) {
          pickupFailed = true;
          console.warn('[UPS Pickup] No se pudo crear el pickup:', pickupResult.message);
        }
      } catch (pickupErr) {
        pickupFailed = true;
        console.warn('[UPS Pickup] Excepción al crear pickup:', pickupErr);
      }
    }

    setSubmitPhase('Reservando número de guía…');
    const reservedNGuia = await getNextNGuia();

    setSubmitPhase('Generating shipping label…');
    const shipmentResult = await createUpsShipment({
      contactName:   addr.alias || 'Client',
      companyName:   addr.alias || '',
      addressLine:   addr.line1 || '',
      city:          addr.city  || '',
      stateProvince: addr.province || addr.state || addr.stateProvince || 'FL',
      postalCode:    addr.zip   || '',
      phone:         (addr.phone || '').replace(/\D/g, '').slice(0, 10) || '',
      weight:        parseFloat(weightKg.toFixed(2)) || 1,
      length:        parseFloat(pkg.largo || 0) || 1,
      width:         parseFloat(pkg.ancho || 0) || 1,
      height:        parseFloat(pkg.alto  || 0) || 1,
      unitSystem:    'METRIC',
      serviceCode:   data.courierQuote?.service_code ?? '03',
      nGuia:         reservedNGuia ?? undefined,
      codCliente:    user?.codCliente ?? '',
    });

    const trackingNumber = shipmentResult.data?.trackingNumber ?? '';
    const labelBase64    = shipmentResult.data?.labelBase64    ?? null;
    const labelUrl       = shipmentResult.data?.labelUrl       ?? null;

    if (!shipmentResult.success) {
      console.warn('[UPS Shipment] No se pudo generar el label:', shipmentResult.message);
    }

    setSubmitPhase('Creating your shipment…');

    const pickupFechaIso = pickupResultDate
      ? `${pickupResultDate.slice(0,4)}-${pickupResultDate.slice(4,6)}-${pickupResultDate.slice(6,8)}`
      : (isPickup ? (data.pickupDate ?? null) : null);

    const { data: guiaResult } = await axiosPaymentInstance.post('/usa/guia/create', {
      nGuia:            reservedNGuia ?? undefined,
      halaraPayTransactionId: transactionId,
      peso:             Number(pkg.peso  || 0),
      largo:            Number(pkg.largo || 0),
      ancho:            Number(pkg.ancho || 0),
      alto:             Number(pkg.alto  || 0),
      unidadPeso:       pkg.unidadPeso   || 'lb',
      declaredValueUSD: Number(pkg.valorFOB || 0),
      fragil:           pkg.fragil ?? false,
      courierId:        data.courierId        ?? null,
      courierServiceId: data.courierServiceId ?? null,
      courierTotal:     Number(data.courierQuote?.total || data.courierQuote?.cost || 0),
      courierName:      data.courierQuote?.name    || data.courierQuote?.courier || '',
      courierService:   data.courierQuote?.service || '',
      pickupCost:       isPickup ? Number(data.pickupRate ?? 0) : 0,
      discountAmount:   discountAmount > 0 ? Number(discountAmount.toFixed(2)) : 0,
      discountName:     discountPct > 0 ? discountName : null,
      idDireccionOrigen:  data.originAddressId      ?? data.selectedOriginAddress?.id      ?? null,
      idDireccionDestino: data.destinationAddressId ?? data.selectedDestinationAddress?.id ?? null,
      contenidosIds:    pkg.contenidos?.map(c => c.id) ?? [],
      costoBase:        Number(data.calculationResult?.data?.total || 0),
      tienePago:        true,
      pickupCode:           prn,
      sendSeiPickupUuid:    prn,
      sendSeiShipmentUuid:  pickupTransId,
      pickupFecha:          pickupFechaIso,
      pickupHoraDesde:      isPickup ? pickupReady : null,
      pickupHoraHasta:      isPickup ? pickupClose : null,
      sendSeiTrackingNumber: trackingNumber,
      labelUrl:              labelUrl,
      idFormaCreacion:       isPickup ? 5 : 7,
    });

    // Éxito: limpiar recuperación y mostrar pantalla de éxito
    sessionStorage.removeItem(RECOVERY_KEY);
    setPendingRetry(null);
    const nGuia = guiaResult?.nGuia || reservedNGuia || `KU-${Date.now().toString().slice(-6)}`;
    // Fallback al labelUrl/trackingNumber del guia (igual que la app móvil)
    const finalLabelUrl       = labelUrl       ?? guiaResult?.labelUrl       ?? guiaResult?.data?.labelUrl       ?? null;
    const finalLabelBase64    = labelBase64    ?? guiaResult?.labelBase64    ?? guiaResult?.data?.labelBase64    ?? null;
    const finalTrackingNumber = trackingNumber || guiaResult?.trackingNumber  || guiaResult?.data?.trackingNumber  || '';
    setGuiaResult({ nGuia, metodoPago: 'card', labelBase64: finalLabelBase64, labelUrl: finalLabelUrl, trackingNumber: finalTrackingNumber, pickupWarning: pickupFailed });
  };

  // ── Callback que recibe el token de HalaraPay (lightbox) ──────────────────
  const handleTokenReceived = async (token) => {
    lightboxOpen.current = false;
    setSubmitPhase('Processing payment…');
    try {
      // ── 1. Cobrar la tarjeta ─────────────────────────────────────────────
      const { data: chargeResult } = await axiosPaymentInstance.post('/usa/payment/charge', {
        token,
        amountUSD: totalRef.current,
        nGuia:     '',
        guiaId:    null,
      });

      if (!chargeResult.success) {
        setSubmitError(chargeResult.message ?? 'Payment declined. Please try again.');
        setSubmitting(false);
        setSubmitPhase('');
        return;
      }

      // ── 2. Pago aprobado: guardar en sessionStorage ANTES de continuar ───
      // Si el navegador falla aquí, el usuario puede reintentar al volver.
      const transactionId = chargeResult.transactionId ?? '';
      sessionStorage.setItem(RECOVERY_KEY, JSON.stringify({ transactionId }));

      // ── 3. Crear pickup + label + guía ───────────────────────────────────
      await runPostPaymentFlow(transactionId);

    } catch (err) {
      console.error('[Step4Payment US] error', err);
      // Si ya hay un pago guardado → el error es post-pago: ofrecer reintento
      const stored = sessionStorage.getItem(RECOVERY_KEY);
      if (stored) {
        try {
          const { transactionId } = JSON.parse(stored);
          setPendingRetry(transactionId);
          setSubmitError('Tu pago fue procesado correctamente, pero ocurrió un error al crear tu guía. Usa el botón "Reintentar" para completar el proceso sin volver a cobrar.');
        } catch { setSubmitError(err.message ?? 'Error inesperado.'); }
      } else {
        setSubmitError(err.message ?? 'Payment failed. Please try again.');
      }
      setSubmitting(false);
      setSubmitPhase('');
    }
  };

  // ── Reintento post-pago (sin cobrar de nuevo) ─────────────────────────────
  const handleRetry = async () => {
    if (!pendingRetry) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await runPostPaymentFlow(pendingRetry);
    } catch (err) {
      console.error('[Step4Payment US] retry error', err);
      setSubmitError('Error al reintentar. Si el problema persiste, contáctanos con tu ID de transacción: ' + pendingRetry);
    } finally {
      setSubmitting(false);
      setSubmitPhase('');
    }
  };

  // Ref estable para el callback — evita stale closures
  const handleTokenReceivedRef = useRef(null);
  handleTokenReceivedRef.current = handleTokenReceived;

  // ── Configurar CollectJS (lightbox) ───────────────────────────────────────
  const configureCollectJS = () => {
    if (!window.CollectJS) return;

    window.CollectJS.configure({
      paymentType: 'cc',
      callback: (response) => handleTokenReceivedRef.current?.(response.token),
    });

    setCollectJsReady(true);
  };

  // ── Cargar script de HalaraPay una sola vez ───────────────────────────────
  useEffect(() => {
    if (window.CollectJS) {
      configureCollectJS();
      return;
    }

    const script = document.createElement('script');
    script.src = HALARAPAY_SCRIPT_SRC;
    script.setAttribute('data-tokenization-key', HALARAPAY_TOKENIZATION_KEY);
    script.async = true;
    script.onload  = () => configureCollectJS();
    script.onerror = () => setSubmitError('Could not load the payment processor. Please refresh and try again.');

    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Flujo principal ───────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!data.courierId || !data.selectedOriginAddress)
        throw new Error('Missing courier or origin address.');

      // ZELLE — Pago manual offline
      if (metodoPago === 'zelle') {
        setSubmitPhase('Registering your request…');
        setTimeout(() => {
          setGuiaResult({ nGuia: `KU-${Date.now().toString().slice(-6)}`, metodoPago: 'zelle' });
          setSubmitting(false);
        }, 1500);
        return;
      }

      // CARD — HalaraPay Lightbox
      if (metodoPago === 'card') {
        if (!window.CollectJS || !collectJsReady)
          throw new Error('Payment form not ready. Please wait a moment and try again.');

        setSubmitPhase('Opening secure payment form…');
        lightboxOpen.current = true;
        window.CollectJS.startPaymentRequest();

        // Detectar cierre del lightbox sin completar el pago.
        // CollectJS no tiene callback de cancelación; cuando el usuario cierra
        // el modal, la ventana recupera el foco. Si el token aún no llegó
        // (lightboxOpen.current sigue true) reseteamos el estado.
        setTimeout(() => {
          if (!lightboxOpen.current) return;
          const handleFocus = () => {
            if (lightboxOpen.current) {
              lightboxOpen.current = false;
              setSubmitting(false);
              setSubmitPhase('');
            }
          };
          window.addEventListener('focus', handleFocus, { once: true });
        }, 800);

        return;
      }

    } catch (err) {
      console.error('[Step4Payment US]', err);
      setSubmitError(err.message ?? 'Error processing payment.');
      setSubmitting(false);
      setSubmitPhase('');
    }
  };

  if (guiaResult) return <SuccessScreen {...guiaResult} />;

  return (
    <div className="step4-layout">

      {/* ── Columna izquierda: métodos de pago ── */}
      <div className="step4-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title"><IoCardOutline size={22} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.payment_title')}</h2>
          <p className="wizard-card__subtitle">
            {t('us_wizard.payment_subtitle')}
          </p>

          <div className="payment-methods">
            {PAYMENT_METHOD_IDS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`payment-method ${metodoPago === m.id ? 'payment-method--active' : ''}`}
                onClick={() => updateData({ metodoPago: m.id })}
              >
                <span className="payment-method__radio">
                  {metodoPago === m.id && <span className="payment-method__dot" />}
                </span>
                <span className="payment-method__icon">{m.render()}</span>
                <span className="payment-method__label">{t(`us_wizard.${m.id === 'card' ? 'card_method_label' : 'zelle_title'}`)}</span>
                {m.id === 'card' && (
                  <span className="payment-method__brands">
                    <span>VISA</span><span>MC</span><span>AMEX</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="payment-form-area">
            {metodoPago === 'card'  && <CardInfo />}
            {metodoPago === 'zelle' && <ZelleInfo />}
          </div>
        </div>

        {submitError && (
          <div className="payment-submit-error">⚠️ {submitError}</div>
        )}

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack} disabled={submitting}>
            {t('us_wizard.back')}
          </button>
        </div>
      </div>

      {/* ── Columna derecha: resumen + botón confirmar ── */}
      <div className="step4-layout__right">
        <div className="cost-card" style={{ borderTop: '4px solid #022364' }}>
          <h3 className="cost-card__title">{t('us_wizard.order_summary')}</h3>

          <div className="order-row">
            <span>{t('us_wizard.intl_shipping')}</span>
            <span style={{ fontWeight: '600' }}>{usd(shipping)}</span>
          </div>

          {courierQuote && (
            <div className="order-row">
              <span>
                <IoCarOutline size={14} style={{ verticalAlign: 'middle' }} /> {courierQuote.courier || 'UPS'} {courierQuote.service || ''}
              </span>
              <span style={{ fontWeight: '600' }}>{usd(courier)}</span>
            </div>
          )}

          {pickup > 0 && (
            <div className="order-row">
              <span><IoCarOutline size={14} style={{ verticalAlign: 'middle' }} /> Recogida UPS</span>
              <span style={{ fontWeight: '600' }}>{usd(pickup)}</span>
            </div>
          )}

          {discountPct > 0 && (
            <div className="order-row" style={{ color: '#16a34a' }}>
              <span><IoPricetagOutline size={14} style={{ verticalAlign: 'middle' }} /> {discountName} (-{discountPct}%)</span>
              <span style={{ fontWeight: '600' }}>-{usd(discountAmount)}</span>
            </div>
          )}

          <div className="order-divider" />

          <div className="order-total" style={{
            background: 'linear-gradient(135deg, #022364 0%, #1a3a8a 100%)',
            padding: '15px', borderRadius: '8px', color: '#fff'
          }}>
            <span style={{ color: '#fff' }}>{t('us_wizard.total_to_pay')}</span>
            <span className="order-total__value" style={{ color: '#fff' }}>
              {usd(total)}
            </span>
          </div>

          <div className="security-badges" style={{ marginTop: '20px' }}>
            <span className="security-badge"><IoLockClosedOutline size={13} style={{ verticalAlign: 'middle' }} /> SSL</span>
            <span className="security-badge"><IoShieldCheckmarkOutline size={13} style={{ verticalAlign: 'middle' }} /> PCI DSS</span>
            <span className="security-badge"><IoKeyOutline size={13} style={{ verticalAlign: 'middle' }} /> Encrypted</span>
          </div>
          <p className="security-text">
            {t('us_wizard.security_text')}
          </p>

          {/* Declaraciones obligatorias */}
          <div style={{
            marginTop: '16px', padding: '14px', border: '1.5px solid #E5E7EB',
            borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#022364', margin: 0 }}>
              Declaraciones obligatorias
            </p>

            <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'flex-start' }}
              onClick={() => setAcceptContent(!acceptContent)}>
              {acceptContent
                ? <IoCheckbox size={20} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                : <IoSquareOutline size={20} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />}
              <span style={{ fontSize: '12px', color: '#374151', lineHeight: '1.5' }}>
                Declaro que el paquete no contiene productos prohibidos o restringidos, y que el contenido
                enviado corresponde a la descripción suministrada. Acepto que el envío podrá ser retenido,
                rechazado o cancelado si se detecta mercancía no permitida.{' '}
                <a href="https://krakencourier.com/productos-prohibidos" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#1D4ED8', textDecoration: 'underline', fontWeight: 600 }}
                  onClick={(e) => e.stopPropagation()}>
                  Ver lista de productos prohibidos
                </a>
              </span>
            </label>

            <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'flex-start' }}
              onClick={() => setAcceptWeight(!acceptWeight)}>
              {acceptWeight
                ? <IoCheckbox size={20} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                : <IoSquareOutline size={20} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />}
              <span style={{ fontSize: '12px', color: '#374151', lineHeight: '1.5' }}>
                Confirmo que el peso y las medidas suministradas son correctos. Entiendo que la tarifa ha
                sido calculada con base en esta información y que, si al verificar el paquete existe una
                diferencia que aumente el costo, debo pagar el monto restante para que el envío pueda ser procesado.
              </span>
            </label>
          </div>

          {pendingRetry ? (
            <div style={{
              background: '#fef3c7', border: '1px solid #f59e0b',
              borderRadius: '8px', padding: '16px', marginTop: '15px',
            }}>
              <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IoWarningOutline size={16} /> Tu pago fue procesado exitosamente
              </p>
              <p style={{ color: '#78350f', fontSize: '12px', marginBottom: '12px', lineHeight: '1.4' }}>
                Ocurrió un error al crear tu guía. Pulsa "Reintentar" para completar el proceso sin volver a cobrar tu tarjeta.
              </p>
              <p style={{ color: '#92400e', fontSize: '11px', marginBottom: '12px' }}>
                ID de transacción: <span style={{ fontFamily: 'monospace', background: '#fde68a', padding: '1px 4px', borderRadius: '3px' }}>{pendingRetry}</span>
              </p>
              <button
                className="btn-wizard-next cost-card__proceed-btn"
                onClick={handleRetry}
                disabled={submitting}
                style={{ marginTop: '0', width: '100%' }}
              >
                {submitting
                  ? `⏳ ${submitPhase || 'Procesando...'}`
                  : <><IoRefreshOutline size={16} style={{ verticalAlign: 'middle' }} /> Reintentar creación de guía</>}
              </button>
            </div>
          ) : (
            <button
              className="btn-wizard-next cost-card__proceed-btn"
              onClick={handleConfirm}
              disabled={submitting || (metodoPago === 'card' && !collectJsReady) || !acceptContent || !acceptWeight}
              style={{ marginTop: '15px' }}
            >
              {submitting
                ? `⏳ ${submitPhase || t('us_wizard.processing')}`
                : (metodoPago === 'card' && !collectJsReady)
                  ? `⏳ ${t('us_wizard.loading_payment')}`
                  : metodoPago === 'zelle'
                    ? t('us_wizard.confirm_request')
                    : t('us_wizard.confirm_payment', { amount: usd(total) })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;
