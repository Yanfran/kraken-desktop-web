// src/modules/es/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 5 del wizard España — Método de pago + creación de guía post-pago

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpainGuia }                                    from '../../../../../services/es/spainGuiaService';
import { createSendSeiShipment, createSendSeiPickup }         from '../../../../../services/es/sendSeiService';
import './Step4Payment.scss';


// ── Helper próximo día hábil (añadir antes del componente) ───────────────────
const getNextBusinessDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// ── Dirección del almacén Kraken España (destino de la recogida SendSei) ─────
const KRAKEN_WAREHOUSE = {
  fullName:      'Kraken Courier España',
  email:         'operaciones@krakencourier.com',
  phoneNumber:   '+34600000000',
  address:       'Calle Mayor',
  addressNumber: '1',
  postalCode:    '28013',
  city:          'Madrid',
};

// ── Formateo de número de tarjeta ────────────────────────────────────────────
const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();

const detectCardBrand = (v) => {
  const n = v.replace(/\s/g, '');
  if (/^4/.test(n))                             return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n))                        return 'Amex';
  return '';
};

// ── Métodos de pago disponibles ───────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',     label: 'Tarjeta de Crédito/Débito', render: () => '💳' },
  { id: 'paypal',   label: 'PayPal',                    render: () => '🅿️' },
  { id: 'transfer', label: 'Transferencia Bancaria',     render: () => '🏦' },
];

// ── Formulario de tarjeta ────────────────────────────────────────────────────
const CardForm = ({ card, onChange, errors }) => {
  const brand = detectCardBrand(card.numero);
  return (
    <div className="card-form">
      <div className="wizard-grid-2">
        <div className="wizard-field card-form__numero-field">
          <label>Número de Tarjeta</label>
          <div className="card-form__numero-wrap">
            <span className="card-form__card-icon">💳</span>
            <input
              value={card.numero}
              onChange={(e) => onChange('numero', formatCardNumber(e.target.value))}
              placeholder="4532 1234 5678 9010"
              maxLength={19}
              className={errors?.numero ? 'field-error' : ''}
            />
            {brand && <span className="card-form__brand">{brand}</span>}
          </div>
          {errors?.numero && <span className="field-error-msg">{errors.numero}</span>}
        </div>

        <div className="wizard-field">
          <label>Fecha de Expiración (MM/AA)</label>
          <input
            value={card.expiracion}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
              onChange('expiracion', v);
            }}
            placeholder="12/25"
            maxLength={5}
            className={errors?.expiracion ? 'field-error' : ''}
          />
          {errors?.expiracion && <span className="field-error-msg">{errors.expiracion}</span>}
        </div>
      </div>

      <div className="wizard-grid-2">
        <div className="wizard-field" style={{ position: 'relative' }}>
          <label>CVV <span className="card-form__cvv-hint" title="Código de 3 dígitos en el reverso"> ⓘ</span></label>
          <input
            value={card.cvv}
            onChange={(e) => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            maxLength={4}
            type="password"
            className={errors?.cvv ? 'field-error' : ''}
          />
          {errors?.cvv && <span className="field-error-msg">{errors.cvv}</span>}
        </div>

        <div className="wizard-field">
          <label>Nombre del Titular</label>
          <input
            value={card.titular}
            onChange={(e) => onChange('titular', e.target.value)}
            placeholder="Carlos Gómez"
            className={errors?.titular ? 'field-error' : ''}
          />
          {errors?.titular && <span className="field-error-msg">{errors.titular}</span>}
        </div>
      </div>

      <label className="card-form__save-label">
        <input
          type="checkbox"
          checked={card.guardar}
          onChange={(e) => onChange('guardar', e.target.checked)}
          className="card-form__save-check"
        />
        Guardar esta tarjeta para futuros pagos de forma segura.
      </label>
    </div>
  );
};

// ── Instrucciones PayPal / Transferencia ──────────────────────────────────────
const PaypalInfo = () => (
  <div className="payment-info-block">
    <p>Serás redirigido a PayPal para completar el pago de forma segura.</p>
    <div className="payment-info-block__logo">🅿️ PayPal</div>
  </div>
);

const TransferInfo = () => (
  <div className="payment-info-block">
    <p>Realiza una transferencia bancaria a la siguiente cuenta:</p>
    <div className="transfer-data">
      <span><strong>Banco:</strong> BBVA España</span>
      <span><strong>IBAN:</strong> ES91 2100 0418 4502 0005 1332</span>
      <span><strong>Concepto:</strong> Tu número de pedido (se asignará al confirmar)</span>
    </div>
    <p className="payment-info-block__note">
      ⚠️ Tu envío se procesará una vez confirmado el pago (1-2 días hábiles).
    </p>
  </div>
);

// ── Pantalla de éxito ─────────────────────────────────────────────────────────
const SuccessScreen = ({ nGuia, courierName, courierService, courierTotal }) => (
  <div className="payment-success">
    <div className="payment-success__icon">✅</div>
    <h2 className="payment-success__title">¡Envío Registrado!</h2>
    <p className="payment-success__sub">Tu pedido ha sido registrado y tu guía generada.</p>

    {/* Número de guía — el dato más importante */}
    {nGuia && (
      <div className="payment-success__guia">
        <span className="payment-success__guia-label">Tu número de guía</span>
        <span className="payment-success__guia-number">{nGuia}</span>
        <span className="payment-success__guia-hint">
          Guarda este código para hacer seguimiento de tu envío
        </span>
      </div>
    )}

    {/* Datos del courier */}
    {courierName && (
      <div className="payment-success__courier">
        <span>🚚 {courierName} — {courierService}</span>
        {courierTotal && <span className="payment-success__courier-price">€{Number(courierTotal).toFixed(2)}</span>}
      </div>
    )}

    <p className="payment-success__hint">
      Recibirás un correo de confirmación con todos los detalles del envío.
    </p>
    <a href="/home" className="btn-wizard-next payment-success__btn">
      Ir al Inicio
    </a>
    <button
      className="ke-wizard__btn-track"
      onClick={() => navigate(`/tracking/${nGuia}`)}  // ✅ usar nGuia, no wizardData.nGuia
    >
      🔍 Rastrear mi envío
    </button>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const Step4Payment = ({ data, updateData, onBack }) => {
  const navigate = useNavigate();
  const [cardErrors,   setCardErrors]   = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitPhase,  setSubmitPhase]  = useState('');  // texto de estado mientras procesa
  const [guiaResult,   setGuiaResult]   = useState(null); // { nGuia, courierName, ... }
  const [submitError,  setSubmitError]  = useState(null);

  const { metodoPago, cardData, calculationResult, courierQuote } = data;

  // ── Precios ──────────────────────────────────────────────────────────────────
  const eur      = (n) => `€${Number(n || 0).toFixed(2)}`;
  const p        = calculationResult;
  const shipping = p?.cost ?? 0;
  const courier  = courierQuote ? parseFloat(courierQuote.total) : 0;    
  const total = shipping + courier;

  // ── Validación tarjeta ────────────────────────────────────────────────────
  const updateCard = (field, value) => {
    updateData({ cardData: { ...cardData, [field]: value } });
    setCardErrors((p) => { const c = { ...p }; delete c[field]; return c; });
  };

  const validateCard = () => {
    const e = {};
    if (!cardData.numero || cardData.numero.replace(/\s/g, '').length < 13) e.numero    = 'Número inválido';
    if (!cardData.expiracion || !/^\d{2}\/\d{2}$/.test(cardData.expiracion)) e.expiracion = 'Formato MM/AA';
    if (!cardData.cvv || cardData.cvv.length < 3)                            e.cvv       = 'CVV inválido';
    if (!cardData.titular?.trim())                                            e.titular   = 'Requerido';
    return e;
  };

  // ── Flujo principal post-pago ─────────────────────────────────────────────
  const handleConfirm = async () => {
    // Validar tarjeta si aplica
    if (metodoPago === 'card') {
      const errs = validateCard();
      if (Object.keys(errs).length) { setCardErrors(errs); return; }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // ── FASE 1: Crear shipment en SendSei ─────────────────────────────────
      setSubmitPhase('Registrando recogida con el courier...');

      if (!data.courierId || !data.selectedOriginAddress) {
        throw new Error('Falta courier o dirección de origen seleccionada.');
      }

      const pkg    = data.packages?.[0] ?? {};
      const origin = data.selectedOriginAddress;

      const shipmentRes = await createSendSeiShipment({
        courierId:        data.courierId,
        courierServiceId: data.courierServiceId,
        insuredAmount:    total > 0 ? total.toFixed(2) : null,
        origin: {
          fullName:      origin.fullName  ?? origin.alias ?? 'Cliente',
          company:       null,
          email:         origin.email     ?? 'noreply@krakencourier.com',
          phoneNumber:   origin.phone     ?? '000000000',
          address:       origin.line1     ?? origin.address ?? '',
          addressNumber: origin.addressNumber || 'S/N',
          postalCode:    origin.postalCode ?? origin.zip ?? '',
          city:          origin.city      ?? '',
        },
        destination: KRAKEN_WAREHOUSE,
        packages: [{
          weightKg:           String(parseFloat(pkg.peso    || pkg.weightKg || 0)),
          lengthCm:           String(parseFloat(pkg.largo   || pkg.lengthCm || 0)),
          widthCm:            String(parseFloat(pkg.ancho   || pkg.widthCm  || 0)),
          heightCm:           String(parseFloat(pkg.alto    || pkg.heightCm || 0)),
          contentDescription: (pkg.descripcion ?? 'Mercancía general').slice(0, 50),          
          declaredValue:      String(parseFloat(pkg.valorFOB ?? '0')),
        }],
      });

      if (!shipmentRes.success || !shipmentRes.data?.uuid) {
        throw new Error('No se pudo crear el envío con el courier. Intenta de nuevo.');
      }

      const shipmentUuid = shipmentRes.data.uuid;

      // ── FASE 2: Agendar pickup ────────────────────────────────────────────
      setSubmitPhase('Agendando recogida...');

      const pickupRes = await createSendSeiPickup(
        getNextBusinessDate(), // scheduledDate
        '09:00',               // scheduledTimeFrom
        '14:00',               // scheduledTimeTo
        [shipmentUuid],        // shipmentUuids
        'Recogida Kraken Courier'
      );

      if (!pickupRes.success) {
        // El shipment ya existe — no bloqueamos, continuamos igual
        console.warn('[Step4Payment] Pickup no agendado:', pickupRes.error);
      }

      const pickupCode = pickupRes.data?.pickups?.[0]?.pickup_code ?? null;

      // ── FASE 3: Crear guía en Kraken ──────────────────────────────────────
      setSubmitPhase('Generando guía de envío...');

      const guiaRes = await createSpainGuia(
          data,
          shipmentUuid, 
          pickupCode,
          shipmentRes.data, 
          pickupRes.data       
        );

      if (!guiaRes.success) {
        console.error('[Step4Payment] Error creando guía:', guiaRes.error);
      }

      setGuiaResult({
        nGuia:          guiaRes.nGuia   ?? shipmentUuid,
        courierName:    courierQuote?.courier ?? null,
        courierService: courierQuote?.service ?? null,
        courierTotal:   courierQuote?.total   ?? null,
      });

    } catch (err) {
      console.error('[Step4Payment] Error:', err);
      setSubmitError(err.message ?? 'Error al procesar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
      setSubmitPhase('');
    }
  };

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (guiaResult) return <SuccessScreen {...guiaResult} navigate={navigate} />;

  return (
    <div className="step4-layout">
      {/* ── Columna izquierda: métodos de pago ── */}
      <div className="step4-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">💳 Método de Pago</h2>
          <p className="wizard-card__subtitle">
            Selecciona tu forma de pago para completar el envío.
          </p>

          {/* Selector de método */}
          <div className="payment-methods">
            {PAYMENT_METHODS.map((m) => (
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
                <span className="payment-method__label">{m.label}</span>
                {m.id === 'card' && (
                  <span className="payment-method__brands">
                    <span>VISA</span><span>MC</span><span>AMEX</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Formulario según método */}
          <div className="payment-form-area">
            {metodoPago === 'card'     && <CardForm card={cardData} onChange={updateCard} errors={cardErrors} />}
            {metodoPago === 'paypal'   && <PaypalInfo />}
            {metodoPago === 'transfer' && <TransferInfo />}
          </div>
        </div>

        {/* Error de submit */}
        {submitError && (
          <div className="payment-submit-error">⚠️ {submitError}</div>
        )}

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack} disabled={submitting}>
            ← Volver
          </button>
        </div>
      </div>

      {/* ── Columna derecha: resumen + botón confirmar ── */}
      <div className="step4-layout__right">
        <div className="cost-card">
          <h3 className="cost-card__title">Resumen del Pedido</h3>

          {/* Envío internacional Kraken */}
          {p ? (
            <>
              <div className="order-row">
                <span>Envío internacional</span>
                <span>{eur(shipping)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Tarifa no disponible</p>
          )}

          {/* Recogida SendSei */}
          {courierQuote && (
            <div className="order-row">
              <span>Recogida ({courierQuote.service})</span>
              <span>{eur(courierQuote.total)}</span>
            </div>
          )}
          
          <div className="order-divider" />

          <div className="order-total">
            <span>Total a Pagar:</span>
            <span className="order-total__value">{eur(total)}</span>
          </div>

          {/* Badges de seguridad */}
          <div className="security-badges">
            <span className="security-badge">🔒 SSL</span>
            <span className="security-badge">🛡️ PCI DSS</span>
            <span className="security-badge">🔐 Cifrado</span>
          </div>
          <p className="security-text">
            Tus datos están protegidos con encriptación de grado bancario.
          </p>

          {/* Botón confirmar */}
          <button
            className="btn-wizard-next cost-card__proceed-btn"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting
              ? `⏳ ${submitPhase || 'Procesando...'}`
              : `Confirmar Pago ${eur(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;