// src/modules/us/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 5 del wizard USA — Método de pago + creación de guía post-pago

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Step4Payment.scss'; // ← mismo scss que España, reutilizable

// ── Métodos de pago USA ───────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',  label: 'Credit / Debit Card', render: () => '💳' },
  { id: 'zelle', label: 'Zelle (Manual Pay)',  render: () => '💜' },
];

// ── Bloque informativo Stripe/Card ────────────────────────────────────────────
const CardInfo = () => (
  <div className="redsys-info-block">
    <div className="redsys-info-block__icon">🔒</div>
    <p className="redsys-info-block__title">Secure Card Payment</p>
    <p className="redsys-info-block__desc">
      Your payment is processed through our secure payment gateway.
      Your card details are never stored on our servers.
    </p>
    <div className="redsys-info-block__logos">
      <span>VISA</span>
      <span>Mastercard</span>
      <span>AMEX</span>
    </div>
    <p className="redsys-info-block__hint">
      🛡️ Your card data <strong>never</strong> passes through our servers.
    </p>
  </div>
);

// ── Bloque informativo Zelle ──────────────────────────────────────────────────
const ZelleInfo = () => (
  <div
    className="redsys-info-block"
    style={{ borderLeft: '4px solid #6d28d9', backgroundColor: '#f5f3ff' }}
  >
    <div className="redsys-info-block__icon" style={{ color: '#6d28d9' }}>💜</div>
    <p className="redsys-info-block__title" style={{ color: '#3b0764' }}>Manual Payment via Zelle</p>
    <p className="redsys-info-block__desc" style={{ color: '#5b21b6' }}>
      Send payment manually using Zelle through your bank app.
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
      ⚠️ <strong>Important:</strong> Your shipment will only be processed after
      payment is confirmed by our team.
    </p>
  </div>
);

// ── Pantalla de Éxito ─────────────────────────────────────────────────────────
const SuccessScreen = ({ nGuia, metodoPago }) => (
  <div className="payment-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
    <h2 style={{ color: '#022364', fontWeight: 'bold', fontSize: '24px' }}>
      Order Registered!
    </h2>
    <p style={{ color: '#4b5563', marginBottom: '20px' }}>
      We have received your shipment request.
    </p>

    <div style={{
      background: '#f3f4f6', padding: '20px', borderRadius: '12px',
      display: 'inline-block', marginBottom: '20px'
    }}>
      <span style={{
        display: 'block', fontSize: '12px', color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '1px'
      }}>
        Request Number
      </span>
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
        {nGuia}
      </span>
    </div>

    <p style={{
      fontSize: '14px', color: '#6b7280',
      maxWidth: '400px', margin: '0 auto 30px'
    }}>
      {metodoPago === 'zelle'
        ? 'Once our team verifies your Zelle payment, we will generate your pickup label and notify you by email.'
        : 'Your shipment has been registered. You will receive a confirmation email shortly.'}
    </p>

    <button
      className="btn-wizard-next"
      onClick={() => window.location.href = '/home'}
      style={{ width: '100%', maxWidth: '300px' }}
    >
      Go to Home
    </button>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const Step4Payment = ({ data, updateData, onBack }) => {
  const navigate = useNavigate();
  const [submitting,  setSubmitting]  = useState(false);
  const [submitPhase, setSubmitPhase] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [guiaResult,  setGuiaResult]  = useState(null);

  const { metodoPago, calculationResult, courierQuote } = data;

  // ── Precios en USD ────────────────────────────────────────────────────────
  const usd      = (n) => `$${Number(n || 0).toFixed(2)} USD`;
  const shipping = Number(calculationResult?.data?.total || 0);
  const courier  = courierQuote ? Number(courierQuote.cost || courierQuote.total || 0) : 0;
  const total    = Number((shipping + courier).toFixed(2));

  // ── Flujo principal ───────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!data.courierId || !data.selectedOriginAddress)
        throw new Error('Missing courier or origin address.');

      // ZELLE — Pago manual offline
      if (metodoPago === 'zelle') {
        setSubmitPhase('Registering your request...');
        // TODO: llamada real al backend para crear guía en estado "Por Pagar"
        setTimeout(() => {
          setGuiaResult({
            nGuia: `KU-${Date.now().toString().slice(-6)}`,
            metodoPago: 'zelle',
          });
          setSubmitting(false);
        }, 1500);
        return;
      }

      // CARD — TODO: integrar pasarela USA (Stripe u otro)
      setSubmitPhase('Initiating secure payment...');
      // TODO: llamar al endpoint de pago con tarjeta para USA
      throw new Error('Card payment for USA is not yet configured.');

    } catch (err) {
      console.error('[Step4Payment US]', err);
      setSubmitError(err.message ?? 'Error processing payment.');
    } finally {
      if (metodoPago !== 'zelle') {
        setSubmitting(false);
        setSubmitPhase('');
      }
    }
  };

  if (guiaResult) return <SuccessScreen {...guiaResult} />;

  return (
    <div className="step4-layout">

      {/* ── Columna izquierda: métodos de pago ── */}
      <div className="step4-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">💳 Payment Method</h2>
          <p className="wizard-card__subtitle">
            Select your payment method to complete the shipment.
          </p>

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
            ← Back
          </button>
        </div>
      </div>

      {/* ── Columna derecha: resumen + botón confirmar ── */}
      <div className="step4-layout__right">
        <div className="cost-card" style={{ borderTop: '4px solid #022364' }}>
          <h3 className="cost-card__title">Order Summary</h3>

          <div className="order-row">
            <span>International shipping</span>
            <span style={{ fontWeight: '600' }}>{usd(shipping)}</span>
          </div>

          {courierQuote && (
            <div className="order-row">
              <span>
                Local pickup ({courierQuote.name || courierQuote.service || 'UPS'})
              </span>
              <span style={{ fontWeight: '600' }}>{usd(courier)}</span>
            </div>
          )}

          <div className="order-divider" />

          <div className="order-total" style={{
            background: 'linear-gradient(135deg, #022364 0%, #1a3a8a 100%)',
            padding: '15px', borderRadius: '8px', color: '#fff'
          }}>
            <span style={{ color: '#fff' }}>Total to Pay:</span>
            <span className="order-total__value" style={{ color: '#fff' }}>
              {usd(total)}
            </span>
          </div>

          <div className="security-badges" style={{ marginTop: '20px' }}>
            <span className="security-badge">🔒 SSL</span>
            <span className="security-badge">🛡️ PCI DSS</span>
            <span className="security-badge">🔐 Encrypted</span>
          </div>
          <p className="security-text">
            Your data is protected with bank-grade encryption.
          </p>

          <button
            className="btn-wizard-next cost-card__proceed-btn"
            onClick={handleConfirm}
            disabled={submitting}
            style={{ marginTop: '15px' }}
          >
            {submitting
              ? `⏳ ${submitPhase || 'Processing...'}`
              : metodoPago === 'zelle'
                ? 'Confirm Request'
                : `Confirm Payment ${usd(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;