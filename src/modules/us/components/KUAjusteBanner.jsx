// src/modules/us/components/KUAjusteBanner.jsx
// Banner global de pagos de ajuste pendientes para tenant KU.
// Flujo: detalles modal → cierra modal → CollectJS abre libre → resultado en modal.

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { chargeAjuste, getAjustesPendientes } from '../../../services/us/usAjusteService';
import './KUAjusteBanner.scss';

const HALARAPAY_KEY = 'XEaBVN-yX978V-PJJ64R-Z6KdqZ';
const HALARAPAY_SRC = 'https://halarapay.transactiongateway.com/token/Collect.js';

export default function KUAjusteBanner() {
  const { user } = useAuth();

  const [ajustes,       setAjustes]       = useState([]);
  const [ajusteModal,   setAjusteModal]   = useState(null);
  // Guarda datos mientras CollectJS está abierto (modal cerrado)
  const [payingAjuste,  setPayingAjuste]  = useState(null);
  const [ajustePaying,  setAjustePaying]  = useState(false);
  const [ajusteError,   setAjusteError]   = useState('');
  const [ajusteSuccess, setAjusteSuccess] = useState(false);
  const [collectReady,  setCollectReady]  = useState(false);
  const tokenCallbackRef = useRef(null);

  // ── Cargar ajustes ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      getAjustesPendientes().then(res => {
        if (res.success) setAjustes(res.data ?? []);
      });
    }
  }, [user]);

  // ── Cargar CollectJS en cuanto hay ajustes (no esperar al modal) ────────────
  useEffect(() => {
    if (ajustes.length === 0) return;
    const configure = () => {
      if (!window.CollectJS) return;
      window.CollectJS.configure({
        paymentType: 'cc',
        callback: (response) => tokenCallbackRef.current?.(response.token),
      });
      setCollectReady(true);
    };
    if (window.CollectJS) { configure(); return; }
    const existing = document.querySelector(`script[src="${HALARAPAY_SRC}"]`);
    if (existing) { existing.addEventListener('load', configure); return; }
    const script = document.createElement('script');
    script.src = HALARAPAY_SRC;
    script.setAttribute('data-tokenization-key', HALARAPAY_KEY);
    script.async = true;
    script.onload = configure;
    document.head.appendChild(script);
  }, [ajustes.length]);

  // ── Token callback (usa payingAjuste porque el modal está cerrado) ──────────
  tokenCallbackRef.current = async (token) => {
    const target = payingAjuste;
    if (!target) return;
    setAjustePaying(true);
    try {
      const res = await chargeAjuste({
        ajusteId:  target.id,
        token,
        firstName: user?.name,
        lastName:  user?.lastName,
        email:     user?.email,
      });
      if (res.success) {
        setAjustes(prev => prev.filter(a => a.id !== target.id));
        setAjusteSuccess(true);
        setAjusteModal(target); // Re-abre modal para mostrar éxito
      } else {
        setAjusteError(res.message || 'Pago rechazado. Intenta con otra tarjeta.');
        setAjusteModal(target); // Re-abre modal para mostrar error
      }
    } finally {
      setAjustePaying(false);
      setPayingAjuste(null);
    }
  };

  // ── Botón Pagar: cierra modal → CollectJS abre sin obstáculos ──────────────
  const handlePay = () => {
    if (!window.CollectJS || !collectReady) return;
    const current = ajusteModal;
    setPayingAjuste(current); // Guarda datos
    setAjusteModal(null);     // Cierra nuestro modal
    setAjusteError('');
    window.CollectJS.startPaymentRequest();
  };

  const openModal = (ajuste) => {
    setAjusteModal(ajuste);
    setAjusteSuccess(false);
    setAjusteError('');
  };

  const closeModal = () => {
    setAjusteModal(null);
    setAjusteError('');
    setAjusteSuccess(false);
  };

  // Cancelar mientras CollectJS está abierto
  const cancelPaying = () => {
    setPayingAjuste(null);
    setAjustePaying(false);
  };

  // Nada que mostrar
  if (ajustes.length === 0) return null;

  return (
    <>
      {/* ── FAB flotante ── */}
      {payingAjuste ? (
        <button className="ku-ajuste-fab ku-ajuste-fab--paying" onClick={cancelPaying}>
          <span className="ku-ajuste-fab__icon">⏳</span>
          <span className="ku-ajuste-fab__label">Cancelar pago</span>
        </button>
      ) : (
        <button className="ku-ajuste-fab" onClick={() => openModal(ajustes[0])}>
          <span className="ku-ajuste-fab__badge">{ajustes.length}</span>
          <span className="ku-ajuste-fab__icon">⚠️</span>
          <span className="ku-ajuste-fab__label">
            Pago{ajustes.length > 1 ? 's' : ''} pendiente{ajustes.length > 1 ? 's' : ''}
          </span>
        </button>
      )}

      {/* ── Modal detalles + resultado ── */}
      {ajusteModal && (
        <div className="ku-ajuste-overlay" onClick={closeModal}>
          <div className="ku-ajuste-modal" onClick={e => e.stopPropagation()}>
            <button className="ku-ajuste-modal__close" onClick={closeModal}>✕</button>

            {ajusteSuccess ? (
              <div className="ku-ajuste-success">
                <span className="ku-ajuste-success__icon">✅</span>
                <h3>¡Pago exitoso!</h3>
                <p>Tu pago de diferencia ha sido procesado correctamente.</p>
                <button className="ku-ajuste-pay-btn" onClick={closeModal}>Cerrar</button>
              </div>
            ) : (
              <>
                <h3 className="ku-ajuste-modal__title">Pago de diferencia</h3>
                <p className="ku-ajuste-modal__guia">
                  Guía: <strong>{ajusteModal.nGuia ?? `#${ajusteModal.idGuia}`}</strong>
                </p>

                {ajusteModal.observaciones && (
                  <p className="ku-ajuste-modal__obs">{ajusteModal.observaciones}</p>
                )}

                <div className="ku-ajuste-detail-list">
                  {ajusteModal.detallesPagoAnterior?.map((d, i) => (
                    <div key={i} className="ku-ajuste-detail-row">
                      <span>{d.descripcion}</span>
                      <span>${Number(d.monto ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="ku-ajuste-detail-row ku-ajuste-detail-row--paid">
                    <span>Total pagado anteriormente</span>
                    <span>${Number(ajusteModal.montoPagado ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="ku-ajuste-total">
                  <span>Monto a pagar ahora</span>
                  <span className="ku-ajuste-total__amount">
                    ${Math.abs(Number(ajusteModal.montoAPagar ?? 0)).toFixed(2)} USD
                  </span>
                </div>

                {ajusteError && <p className="ku-ajuste-error">{ajusteError}</p>}

                <button
                  className="ku-ajuste-pay-btn"
                  onClick={handlePay}
                  disabled={ajustePaying || !collectReady}
                >
                  {ajustePaying
                    ? 'Procesando…'
                    : !collectReady
                    ? 'Cargando pasarela…'
                    : `Pagar $${Math.abs(Number(ajusteModal.montoAPagar ?? 0)).toFixed(2)} USD`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
