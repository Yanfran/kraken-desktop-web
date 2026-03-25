// src/modules/es/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 5 del wizard España — Método de pago + creación de guía post-pago

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpainGuia }                            from '../../../../../services/es/spainGuiaService';
import { createSendSeiShipment, createSendSeiPickup } from '../../../../../services/es/sendSeiService';
import { iniciarPagoRedsys, preRegistrarSesion } from '../../../../../services/es/spainPaymentService';
import './Step4Payment.scss';

// ── Helper próximo día hábil ──────────────────────────────────────────────────
const getNextBusinessDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// ── Dirección del almacén Kraken España ──────────────────────────────────────
const KRAKEN_WAREHOUSE = {
  fullName:      'Kraken Courier España',
  email:         'operaciones@krakencourier.com',
  phoneNumber:   '+34600000000',
  address:       'Calle Mayor',
  addressNumber: '1',
  postalCode:    '28013',
  city:          'Madrid',
};

// ── Métodos de pago disponibles ───────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',     label: 'Tarjeta de Crédito/Débito', render: () => '💳' },
  // { id: 'paypal',   label: 'PayPal',                    render: () => '🅿️' },
  // { id: 'transfer', label: 'Transferencia Bancaria',     render: () => '🏦' },
];

// ── Bloque informativo Redsys (reemplaza CardForm) ────────────────────────────
const RedsysInfo = () => (
  <div className="redsys-info-block">
    <div className="redsys-info-block__icon">🔒</div>
    <p className="redsys-info-block__title">Pago Seguro con Redsys</p>
    <p className="redsys-info-block__desc">
      Al confirmar serás redirigido al TPV seguro de CaixaBank para
      introducir los datos de tu tarjeta con total seguridad.
    </p>
    <div className="redsys-info-block__logos">
      <span>VISA</span>
      <span>Mastercard</span>
      <span>AMEX</span>
    </div>
    <p className="redsys-info-block__hint">
      🛡️ Tus datos de tarjeta <strong>nunca</strong> pasan por nuestros servidores.
    </p>
  </div>
);

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
const SuccessScreen = ({ nGuia, courierName, courierService, courierTotal, navigate }) => (
  <div className="payment-success">
    <div className="payment-success__icon">✅</div>
    <h2 className="payment-success__title">¡Envío Registrado!</h2>
    <p className="payment-success__sub">Tu pedido ha sido registrado y tu guía generada.</p>

    {nGuia && (
      <div className="payment-success__guia">
        <span className="payment-success__guia-label">Tu número de guía</span>
        <span className="payment-success__guia-number">{nGuia}</span>
        <span className="payment-success__guia-hint">
          Guarda este código para hacer seguimiento de tu envío
        </span>
      </div>
    )}

    {courierName && (
      <div className="payment-success__courier">
        <span>🚚 {courierName} — {courierService}</span>
        {courierTotal && (
          <span className="payment-success__courier-price">
            €{Number(courierTotal).toFixed(2)}
          </span>
        )}
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
      onClick={() => navigate(`/tracking/${nGuia}`)}
    >
      🔍 Rastrear mi envío
    </button>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const Step4Payment = ({ data, updateData, onBack }) => {
  const navigate = useNavigate();
  const [submitting,  setSubmitting]  = useState(false);
  const [submitPhase, setSubmitPhase] = useState('');
  const [guiaResult,  setGuiaResult]  = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const { metodoPago, calculationResult, courierQuote } = data;

  // ── Precios ───────────────────────────────────────────────────────────────
  const eur      = (n) => `€${Number(n || 0).toFixed(2)}`;
  const p        = calculationResult;
  const shipping = p?.cost ?? 0;
  const courier  = courierQuote ? parseFloat(courierQuote.total) : 0;
  const total    = shipping + courier;

  // ── Flujo principal ───────────────────────────────────────────────────────
  // handleConfirm — NUEVO orden
  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!data.courierId || !data.selectedOriginAddress)
        throw new Error('Falta courier o dirección de origen.');

      setSubmitPhase('Iniciando pago seguro...');

      // 1. Generar parámetros firmados
      const pagoRes = await iniciarPagoRedsys(total, `KE${Date.now()}`);
      if (!pagoRes.success) throw new Error(pagoRes.message);

      const { urlTPV, ds_SignatureVersion, ds_MerchantParameters,
              ds_Signature, numeroPedido } = pagoRes.data;

      // 2. ✅ Pre-registrar sesión ANTES de salir — el webhook ya la encontrará
      await preRegistrarSesion(numeroPedido, total);

      // 3. Guardar datos del wizard en sessionStorage
      sessionStorage.setItem('ke_pago_pendiente', JSON.stringify({
        numeroPedido,
        total,
        wizardData: {
          courierId:             data.courierId,
          courierServiceId:      data.courierServiceId,
          selectedOriginAddress: data.selectedOriginAddress,
          packages:              data.packages,
          calculationResult:     data.calculationResult,
          courierQuote:          data.courierQuote,
        },
      }));

      // 4. Redirigir a Redsys
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = urlTPV;


      [
        { name: 'Ds_SignatureVersion',   value: ds_SignatureVersion   },
        { name: 'Ds_MerchantParameters', value: ds_MerchantParameters },
        { name: 'Ds_Signature',          value: ds_Signature          },
      ].forEach(({ name, value }) => {
        const h = document.createElement('input');
        h.type = 'hidden'; h.name = name; h.value = value;
        form.appendChild(h);
      });

      document.body.appendChild(form);
      form.submit();
      return;

    } catch (err) {
      console.error('[Step4Payment]', err);
      setSubmitError(err.message ?? 'Error al procesar.');
    } finally {
      setSubmitting(false);
      setSubmitPhase('');
    }
  };

  // ── Pantalla de éxito (PayPal / Transferencia) ────────────────────────────
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

          {/* Panel según método seleccionado */}
          <div className="payment-form-area">
            {/* ✅ Card → aviso Redsys (ya no hay formulario local) */}
            {metodoPago === 'card'     && <RedsysInfo />}
            {metodoPago === 'paypal'   && <PaypalInfo />}
            {metodoPago === 'transfer' && <TransferInfo />}
          </div>
        </div>

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

          {p ? (
            <div className="order-row">
              <span>Envío internacional</span>
              <span>{eur(shipping)}</span>
            </div>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Tarifa no disponible</p>
          )}

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

          <div className="security-badges">
            <span className="security-badge">🔒 SSL</span>
            <span className="security-badge">🛡️ PCI DSS</span>
            <span className="security-badge">🔐 Cifrado</span>
          </div>
          <p className="security-text">
            Tus datos están protegidos con encriptación de grado bancario.
          </p>

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