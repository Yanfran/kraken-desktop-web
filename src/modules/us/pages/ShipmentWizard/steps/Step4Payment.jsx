// src/modules/us/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 5 del wizard USA — Método de pago + creación de guía post-pago

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { axiosPaymentInstance } from '../../../../../services/axiosInstance';
import { createUpsPickup, createUpsShipment } from '../../../../../services/us/upsService';
import { API_URL } from '../../../../../utils/config';
import {
  IoCheckmarkCircle,
  IoWarningOutline,
  IoCloudDownloadOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoKeyOutline,
  IoCarOutline,
  IoCardOutline,
  IoRefreshOutline,
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
const SuccessScreen = ({ nGuia, metodoPago, labelBase64, labelUrl, trackingNumber }) => {
  const { t } = useTranslation();
  const hasLabel = !!labelBase64 || !!labelUrl;

  const downloadLabel = () => {
    const now = new Date();
    const p   = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${p(now.getMonth()+1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
    const filename = `KU-${stamp}.pdf`;

    if (labelBase64) {
      // Descargar directamente desde base64 (sin red)
      const bytes = Uint8Array.from(atob(labelBase64), c => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } else if (labelUrl) {
      // Fallback: abrir desde el backend
      const backendBase = API_URL.replace(/\/api$/, '');
      const fullUrl = labelUrl.startsWith('http') ? labelUrl : `${backendBase}${labelUrl}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="payment-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ marginBottom: '20px', color: '#22c55e' }}>
        <IoCheckmarkCircle size={72} />
      </div>
      <h2 style={{ color: '#022364', fontWeight: 'bold', fontSize: '24px' }}>
        {t('us_wizard.success_title')}
      </h2>
      <p style={{ color: '#4b5563', marginBottom: '20px' }}>
        {t('us_wizard.success_subtitle')}
      </p>

      {/* Número de guía */}
      <div style={{
        background: '#f3f4f6', padding: '20px', borderRadius: '12px',
        display: 'inline-block', marginBottom: '20px'
      }}>
        <span style={{
          display: 'block', fontSize: '12px', color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          {t('us_wizard.guide_number')}
        </span>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
          {nGuia}
        </span>
      </div>

      {/* Tracking UPS */}
      {trackingNumber && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
          padding: '12px 20px', marginBottom: '20px', fontSize: '14px', color: '#1e40af'
        }}>
          <strong>UPS Tracking:</strong> {trackingNumber}
        </div>
      )}

      {/* Aviso de etiqueta */}
      {hasLabel && (
        <div style={{
          background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: '10px',
          padding: '16px 20px', marginBottom: '20px', textAlign: 'left',
          maxWidth: '420px', margin: '0 auto 20px'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '700', color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IoWarningOutline size={20} /> {t('us_wizard.label_notice_title')}
          </p>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#78350F', lineHeight: '1.55' }}>
            {t('us_wizard.label_notice_text')}
          </p>
          <button
            onClick={downloadLabel}
            style={{
              background: '#022364', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '12px 28px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', width: '100%'
            }}
          >
            <IoCloudDownloadOutline size={20} /> {t('us_wizard.download_label')}
          </button>
        </div>
      )}

      <p style={{
        fontSize: '14px', color: '#6b7280',
        maxWidth: '400px', margin: '0 auto 30px'
      }}>
        {metodoPago === 'zelle'
          ? t('us_wizard.success_zelle')
          : t('us_wizard.success_card')}
      </p>

      <button
        className="btn-wizard-next"
        onClick={() => window.location.href = '/home'}
        style={{ width: '100%', maxWidth: '300px', textAlign: 'center' }}
      >
        {t('us_wizard.go_home')}
      </button>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Step4Payment = ({ data, updateData, onBack }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting,     setSubmitting]     = useState(false);
  const [submitPhase,    setSubmitPhase]     = useState('');
  const [pendingRetry,   setPendingRetry]   = useState(null); // { transactionId, orderPayload }
  const [submitError,    setSubmitError]     = useState(null);
  const [guiaResult,     setGuiaResult]      = useState(null);
  const [collectJsReady, setCollectJsReady]  = useState(false);

  const { metodoPago, calculationResult, courierQuote } = data;

  // ── Precios en USD ────────────────────────────────────────────────────────
  const usd      = (n) => `$${Number(n || 0).toFixed(2)} USD`;
  const shipping = Number(calculationResult?.data?.total || 0);
  const courier  = courierQuote ? Number(courierQuote.cost || courierQuote.total || 0) : 0;
  const pickup   = Number(data.pickupRate ?? 0);
  const total    = Number((shipping + courier + pickup).toFixed(2));
  const isPickup = data.deliveryMethod === 'pickup';

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

    if (isPickup) {
      setSubmitPhase('Scheduling UPS pickup…');
      const pickupResult = await createUpsPickup({
        pickupDate:           data.pickupDate || getNextBusinessDay(),
        readyTime:            data.pickupReadyTime || '0900',
        closeTime:            data.pickupCloseTime || '1700',
        contactName:          addr.alias || 'Client',
        companyName:          addr.alias || '',
        addressLine:          addr.line1 || '',
        city:                 addr.city  || '',
        stateProvince:        addr.province || addr.state || addr.stateProvince || '',
        postalCode:           addr.zip   || '',
        residentialIndicator: 'Y',
        phone:                (addr.phone || '').replace(/\D/g, '').slice(0, 10) || '',
        weight:               parseFloat(weightKg.toFixed(2)),
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

      if (!pickupResult.success) {
        console.warn('[UPS Pickup] No se pudo crear el pickup:', pickupResult.message);
      }
    }

    setSubmitPhase('Generating shipping label…');
    const shipmentResult = await createUpsShipment({
      contactName:   addr.alias || 'Client',
      companyName:   addr.alias || '',
      addressLine:   addr.line1 || '',
      city:          addr.city  || '',
      stateProvince: addr.province || addr.state || addr.stateProvince || '',
      postalCode:    addr.zip   || '',
      phone:         (addr.phone || '').replace(/\D/g, '').slice(0, 10) || '',
      weight:        parseFloat(weightKg.toFixed(2)),
      length:        parseFloat(pkg.largo || 0),
      width:         parseFloat(pkg.ancho || 0),
      height:        parseFloat(pkg.alto  || 0),
      unitSystem:    'METRIC',
      serviceCode:   data.courierQuote?.service_code ?? '03',
    });

    const trackingNumber = shipmentResult.success ? (shipmentResult.data?.trackingNumber ?? '') : '';
    const labelBase64    = shipmentResult.success ? (shipmentResult.data?.labelBase64    ?? '') : '';
    const labelUrl       = shipmentResult.success ? (shipmentResult.data?.labelUrl       ?? '') : '';

    if (!shipmentResult.success) {
      console.warn('[UPS Shipment] No se pudo generar el label:', shipmentResult.message);
    }

    setSubmitPhase('Creating your shipment…');

    const pickupFechaIso = pickupResultDate
      ? `${pickupResultDate.slice(0,4)}-${pickupResultDate.slice(4,6)}-${pickupResultDate.slice(6,8)}`
      : (isPickup ? (data.pickupDate ?? null) : null);

    const { data: guiaResult } = await axiosPaymentInstance.post('/usa/guia/create', {
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
    });

    // Éxito: limpiar recuperación y mostrar pantalla de éxito
    sessionStorage.removeItem(RECOVERY_KEY);
    setPendingRetry(null);
    const nGuia = guiaResult?.nGuia || `KU-${Date.now().toString().slice(-6)}`;
    setGuiaResult({ nGuia, metodoPago: 'card', labelBase64, labelUrl, trackingNumber });
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
              disabled={submitting || (metodoPago === 'card' && !collectJsReady)}
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
