// src/modules/es/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 4: Método de pago — Tarjeta, PayPal, Transferencia
// Al confirmar llama al backend y redirige a pantalla de éxito

import React, { useState } from 'react';
import './Step4Payment.scss';

// ── Mock submit — reemplazar con llamada real ────────────────────────────────
// POST /api/es/shipments/create + POST /api/es/payments/process
const mockSubmit = async (payload) => {
  await new Promise((r) => setTimeout(r, 1500));
  return { success: true, orderId: `KE${Date.now()}` };
};

// ── Formateo de número de tarjeta ────────────────────────────────────────────
const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();

const detectCardBrand = (v) => {
  const n = v.replace(/\s/g, '');
  if (/^4/.test(n))  return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return '';
};

// ── Métodos de pago disponibles ───────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Tarjeta de Crédito/Débito',
    icons: ['Visa', 'MC', 'Amex'],
    render: () => '💳',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    render: () => '🅿️',
  },
  {
    id: 'transfer',
    label: 'Transferencia Bancaria',
    render: () => '🏦',
  },
];

// ── Formulario de tarjeta ────────────────────────────────────────────────────
const CardForm = ({ card, onChange, errors }) => {
  const brand = detectCardBrand(card.numero);

  return (
    <div className="card-form">
      <div className="wizard-grid-2">
        {/* Número */}
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

        {/* Expiración */}
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
        {/* CVV */}
        <div className="wizard-field" style={{ position: 'relative' }}>
          <label>
            CVV
            <span className="card-form__cvv-hint" title="El código de 3 dígitos en la parte posterior de tu tarjeta"> ⓘ</span>
          </label>
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

        {/* Titular */}
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

      {/* Guardar tarjeta */}
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

// ── Instrucciones de PayPal / Transferencia ───────────────────────────────────
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
    <p className="payment-info-block__note">⚠️ Tu envío se procesará una vez confirmado el pago (1-2 días hábiles).</p>
  </div>
);

// ── Pantalla de éxito ─────────────────────────────────────────────────────────
const SuccessScreen = ({ orderId }) => (
  <div className="payment-success">
    <div className="payment-success__icon">✅</div>
    <h2 className="payment-success__title">¡Envío Creado!</h2>
    <p className="payment-success__sub">Tu pedido ha sido registrado correctamente.</p>
    <div className="payment-success__order">
      N° de Orden: <strong>{orderId}</strong>
    </div>
    <p className="payment-success__hint">Recibirás un correo de confirmación con todos los detalles.</p>
    <a href="/home" className="btn-wizard-next payment-success__btn">
      Ir al Inicio
    </a>
  </div>
);

// ── Componente principal del paso 4 ─────────────────────────────────────────
const Step4Payment = ({ data, updateData, onBack }) => {
  const [cardErrors, setCardErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { metodoPago, cardData, pricing } = data;

  const updateCard = (field, value) => {
    updateData({ cardData: { ...cardData, [field]: value } });
    setCardErrors((p) => { const c = { ...p }; delete c[field]; return c; });
  };

  const validateCard = () => {
    const e = {};
    if (!cardData.numero || cardData.numero.replace(/\s/g, '').length < 13) e.numero = 'Número inválido';
    if (!cardData.expiracion || !/^\d{2}\/\d{2}$/.test(cardData.expiracion)) e.expiracion = 'Formato MM/AA';
    if (!cardData.cvv || cardData.cvv.length < 3) e.cvv = 'CVV inválido';
    if (!cardData.titular.trim()) e.titular = 'Requerido';
    return e;
  };

  const handleConfirm = async () => {
    if (metodoPago === 'card') {
      const errs = validateCard();
      if (Object.keys(errs).length) { setCardErrors(errs); return; }
    }

    setSubmitting(true);
    try {
      const result = await mockSubmit({ data, metodoPago });
      if (result.success) setOrderId(result.orderId);
    } catch {
      alert('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const eur = (n) => `€${Number(n || 0).toFixed(2)}`;
  const p   = pricing;

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (orderId) return <SuccessScreen orderId={orderId} />;

  return (
    <div className="step4-layout">
      {/* ── Columna izquierda: métodos ── */}
      <div className="step4-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">💳 Método de Pago</h2>
          <p className="wizard-card__subtitle">Selecciona tu forma de pago preferida para completar tu envío.</p>

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

          {/* Formulario según método seleccionado */}
          <div className="payment-form-area">
            {metodoPago === 'card'     && <CardForm card={cardData} onChange={updateCard} errors={cardErrors} />}
            {metodoPago === 'paypal'   && <PaypalInfo />}
            {metodoPago === 'transfer' && <TransferInfo />}
          </div>
        </div>

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack} disabled={submitting}>← Volver</button>
        </div>
      </div>

      {/* ── Columna derecha: resumen + confirmar ── */}
      <div className="step4-layout__right">
        <div className="cost-card">
          <h3 className="cost-card__title">Resumen del Pedido</h3>

          {p ? (
            <>
              <div className="order-row"><span>Envío base</span>        <span>{eur(p.envioBase)}</span></div>
              {p.pesoVolumetrico > 0 && <div className="order-row"><span>Peso volumétrico</span> <span>{eur(p.pesoVolumetrico)}</span></div>}
              {data.seguroActivo     && <div className="order-row"><span>Seguro de Envío</span>  <span>{eur(p.seguro)}</span></div>}
              <div className="order-row"><span>IVA (21%)</span>         <span>{eur(p.iva)}</span></div>
              <div className="order-divider" />
              <div className="order-total">
                <span>Total a Pagar:</span>
                <span className="order-total__value">{eur(p.total)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Precio no disponible</p>
          )}

          {/* Badges de seguridad */}
          <div className="security-badges">
            <span className="security-badge">🔒 SSL</span>
            <span className="security-badge">🛡️ PCI DSS</span>
            <span className="security-badge">🔐 Cifrado</span>
          </div>
          <p className="security-text">
            Tus datos están protegidos con encriptación de grado bancario. No almacenamos la información de tu tarjeta sin tu consentimiento.
          </p>

          <button
            className="btn-wizard-next cost-card__proceed-btn"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? '⏳ Procesando...' : `Confirmar Pago ${p ? eur(p.total) : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;