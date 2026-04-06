// src/modules/es/pages/ShipmentWizard/steps/Step4Payment.jsx
// Paso 5 del wizard España — Método de pago + creación de guía post-pago

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpainGuia }            from '../../../../../services/es/spainGuiaService';
import { createSendSeiShipment, createSendSeiPickup } from '../../../../../services/es/sendSeiService';
import { iniciarPagoRedsys, preRegistrarSesion } from '../../../../../services/es/spainPaymentService';
import './Step4Payment.scss';

// ── Métodos de pago disponibles ───────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',     label: 'Tarjeta de Crédito/Débito', render: () => '💳' },
  { id: 'bizum',    label: 'Bizum (Pago Manual)',       render: () => '📱' },
];

// ── Bloque informativo Redsys ─────────────────────────────────────────────────
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

// ── Bloque informativo Bizum ──────────────────────────────────────────────────
const BizumInfo = () => (
  <div className="redsys-info-block" style={{ borderLeft: '4px solid #00c3a9', backgroundColor: '#f0fdfa' }}>
    <div className="redsys-info-block__icon" style={{ color: '#00c3a9' }}>📱</div>
    <p className="redsys-info-block__title" style={{ color: '#064e3b' }}>Pago Seguro con Bizum</p>
    <p className="redsys-info-block__desc" style={{ color: '#0f766e' }}>
      Realiza el pago de forma manual a través de la app de tu banco usando Bizum.
    </p>
    <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', margin: '15px 0', fontSize: '14px', border: '1px solid #ccfbf1' }}>
      <p style={{ margin: '0 0 8px 0', color: '#111827' }}><strong>Teléfono Bizum:</strong> +34 600 000 000</p>
      <p style={{ margin: '0', color: '#111827' }}><strong>Concepto:</strong> Pago Envío Kraken</p>
    </div>
    <p className="redsys-info-block__hint" style={{ color: '#0f766e' }}>
      ⚠️ <strong>Importante:</strong> Tu envío será procesado y la etiqueta generada únicamente tras confirmar la recepción de los fondos.
    </p>
  </div>
);

// ── Pantalla de Éxito (Para pagos manuales) ───────────────────────────────────
const SuccessScreen = ({ nGuia }) => (
  <div className="payment-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div className="payment-success__icon" style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
    <h2 className="payment-success__title" style={{ color: '#022364', fontWeight: 'bold', fontSize: '24px' }}>¡Pedido Registrado!</h2>
    <p className="payment-success__sub" style={{ color: '#4b5563', marginBottom: '20px' }}>
      Hemos recibido tu solicitud de envío.
    </p>
    
    <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
      <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>N° de Solicitud</span>
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{nGuia}</span>
    </div>

    <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '400px', margin: '0 auto 30px' }}>
      Una vez que nuestro equipo de administración verifique tu pago móvil vía Bizum, emitiremos tu etiqueta oficial de recolección y te notificaremos por correo electrónico.
    </p>
    
    <button
      className="btn-wizard-next"
      onClick={() => window.location.href = '/home'}
      style={{ width: '100%', maxWidth: '300px' }}
    >
      Volver al Inicio
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

  // ── Precios Estrictos ✅ ──────────────────────────────────────────────────
  const eur      = (n) => `€${Number(n || 0).toFixed(2)}`;
  
  // Forzamos Number() en cada lectura para evitar Strings ocultos
  const shipping = Number(calculationResult?.data?.total || 0);
  const courier  = courierQuote ? Number(courierQuote.cost || courierQuote.total || 0) : 0;
  const total    = Number((shipping + courier).toFixed(2));

  // ── Flujo principal ───────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!data.courierId || !data.selectedOriginAddress)
        throw new Error('Falta courier o dirección de origen.');

      // LÓGICA DE BIZUM (Pago Manual / Offline)
      if (metodoPago === 'bizum') {
        setSubmitPhase('Registrando solicitud...');
        
        // TODO: Llamada a crear guía en status "Por Pagar"
        setTimeout(() => {
          setGuiaResult({ nGuia: `REQ-${Date.now().toString().slice(-6)}` });
          setSubmitting(false);
        }, 1500);
        return;
      }

      // LÓGICA DE REDSYS (Pago Online)
      setSubmitPhase('Iniciando pago seguro...');
      
      // ✅ Enviamos 'total' limpio como Number
      const pagoRes = await iniciarPagoRedsys(total, `KE${Date.now()}`);
      if (!pagoRes.success) throw new Error(pagoRes.message);

      const { urlTPV, ds_SignatureVersion, ds_MerchantParameters,
              ds_Signature, numeroPedido } = pagoRes.data;

      // ✅ Enviamos 'total' limpio como Number
      await preRegistrarSesion(numeroPedido, total);

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
      if (metodoPago !== 'bizum') {
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
          <h2 className="wizard-card__title">💳 Método de Pago</h2>
          <p className="wizard-card__subtitle">
            Selecciona tu forma de pago para completar el envío.
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
            {metodoPago === 'card'  && <RedsysInfo />}
            {metodoPago === 'bizum' && <BizumInfo />}
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
        <div className="cost-card" style={{ borderTop: '4px solid #022364' }}>
          <h3 className="cost-card__title">Resumen del Pedido</h3>

          <div className="order-row">
            <span>Envío internacional</span>
            <span style={{ fontWeight: '600' }}>{eur(shipping)}</span>
          </div>

          {courierQuote && (
            <div className="order-row">
              <span>Recogida local ({courierQuote.name || courierQuote.service || 'Courier'})</span>
              <span style={{ fontWeight: '600' }}>{eur(courier)}</span>
            </div>
          )}

          <div className="order-divider" />

          <div className="order-total" style={{ background: 'linear-gradient(135deg, #022364 0%, #1a3a8a 100%)', padding: '15px', borderRadius: '8px', color: '#fff' }}>
            <span style={{ color: '#fff' }}>Total a Pagar:</span>
            <span className="order-total__value" style={{ color: '#fff' }}>{eur(total)}</span>
          </div>

          <div className="security-badges" style={{ marginTop: '20px' }}>
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
            style={{ marginTop: '15px' }}
          >
            {submitting
              ? `⏳ ${submitPhase || 'Procesando...'}`
              : metodoPago === 'bizum' 
                  ? 'Confirmar Solicitud' 
                  : `Confirmar Pago ${eur(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;