// src/modules/es/pages/ShipmentWizard/steps/Step3Summary.jsx
import React, { useState } from 'react';
import './Step3Summary.scss';

const fmt    = (n) => Number(n || 0).toFixed(2);
const fmtUSD = (n) => `$${fmt(n)} USD`;

// ── Fila de costo (solo USD) ──────────────────────────────────────────────────
const CostRow = ({ label, valueUSD, isDiscount, isMuted }) => (
  <div className={`cost-row ${isDiscount ? 'cost-row--discount' : ''} ${isMuted ? 'cost-row--muted' : ''}`}>
    <span className="cost-row__label">{label}</span>
    <span className="cost-row__usd-value">{valueUSD}</span>
  </div>
);

// ── Bloque de dirección legible ───────────────────────────────────────────────
const AddressBlock = ({ address, flag, onEdit }) => {
  if (!address) {
    return (
      <div className="summary-addr">
        <p className="summary-addr__line" style={{ color: '#ef4444' }}>
          ⚠️ No se encontró la dirección seleccionada.
        </p>
        <button className="summary-section__edit" onClick={onEdit}>✏️ Cambiar</button>
      </div>
    );
  }

  const esStore = address.tipoDireccion === 'store';

  return (
    <div className="summary-addr">
      <p className="summary-addr__name">
        {flag} {address.alias || address.nombreLocker || 'Sin nombre'}
      </p>

      {esStore ? (
        <>
          {address.nombreLocker && <p className="summary-addr__line">🏪 {address.nombreLocker}</p>}
          {address.line1        && <p className="summary-addr__line">{address.line1}</p>}
        </>
      ) : (
        <>
          {address.line1      && <p className="summary-addr__line">{address.line1}</p>}
          {address.city       && (
            <p className="summary-addr__line">
              {address.city}{address.zip ? ` - ${address.zip}` : ''}
            </p>
          )}
          {address.province   && <p className="summary-addr__line">{address.province}</p>}
          {address.phone      && <p className="summary-addr__line">📞 {address.phone}</p>}
          {address.direccion  && <p className="summary-addr__line">📍 {address.direccion}</p>}
          {address.referencia && (
            <p className="summary-addr__line" style={{ color: '#9ca3af' }}>
              Ref: {address.referencia}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Step3Summary = ({ data, onNext, onBack, onEditPackage, onEditAddresses }) => {

  const [desglosAbierto, setDesglosAbierto] = useState(false);

  const pkg  = data.packages[0];
  const dims = pkg
    ? `${pkg.largo || '–'}×${pkg.ancho || '–'}×${pkg.alto || '–'} cm`
    : '–';

  const calc      = data.calculationResult;
  const opts      = calc?.deliveryOptions ?? [];
  const bdOfi     = calc?.breakdowns?.oficina;
  const bdDom     = calc?.breakdowns?.domicilio;

  const opcionOfi = opts.find((o) => o.type === 'oficina');
  const opcionDom = opts.find((o) => o.type === 'domicilio');

  const bdActivo  = bdOfi ?? bdDom;
  const lineas    = (bdActivo?.detalles ?? []).filter(
    (d) => d.montoUSD !== 0 && d.categoria !== 'TOTAL_BS'
  );

  const totalUSD  = opcionOfi?.cost ?? opcionDom?.cost ?? 0;

  const editPkg  = onEditPackage   ?? onBack;
  const editAddr = onEditAddresses ?? onBack;

  return (
    <div className="step3-layout">

      {/* ══ COLUMNA IZQUIERDA ════════════════════════════════════════════════ */}
      <div className="step3-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">📋 Resumen del Envío</h2>

          {/* ── Detalles del paquete ─────────────────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">📦</span>
              <h3 className="summary-section__title">Detalles del Paquete</h3>
              <button className="summary-section__edit" onClick={editPkg} title="Editar paquete">✏️</button>
            </div>

            <div className="summary-pkg-grid">
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon">📐</span>
                <div>
                  <p className="summary-pkg-item__label">Dimensiones:</p>
                  <p className="summary-pkg-item__value">{dims}</p>
                </div>
              </div>
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon">⚖️</span>
                <div>
                  <p className="summary-pkg-item__label">Peso:</p>
                  <p className="summary-pkg-item__value">{pkg?.peso || '–'} {pkg?.unidadPeso || 'kg'}</p>
                </div>
              </div>
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon">📄</span>
                <div>
                  <p className="summary-pkg-item__label">Contenido:</p>
                  <p className="summary-pkg-item__value">{pkg?.descripcion || '–'}</p>
                </div>
              </div>
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon">💲</span>
                <div>
                  <p className="summary-pkg-item__label">Valor FOB:</p>
                  <p className="summary-pkg-item__value">${pkg?.valorFOB || '–'} USD</p>
                </div>
              </div>
              {calc?.weightLbVol && (
                <div className="summary-pkg-item">
                  <span className="summary-pkg-item__icon">📊</span>
                  <div>
                    <p className="summary-pkg-item__label">Peso facturado:</p>
                    <p className="summary-pkg-item__value">{fmt(calc.weightLbVol)} lb</p>
                  </div>
                </div>
              )}
            </div>

            {data.packages.length > 1 && (
              <p className="summary-multi-box">+ {data.packages.length - 1} caja(s) adicional(es)</p>
            )}
          </section>

          <div className="wizard-divider" />

          {/* ── Dirección de recogida (España) ───────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇪🇸</span>
              <h3 className="summary-section__title">Dirección de Recogida</h3>
              <button className="summary-section__edit" onClick={editAddr} title="Editar dirección">✏️</button>
            </div>
            <AddressBlock address={data.selectedOriginAddress} flag="🇪🇸" onEdit={editAddr} />
          </section>

          <div className="wizard-divider" />

          {/* ── Dirección de entrega (Venezuela) ────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇻🇪</span>
              <h3 className="summary-section__title">Dirección de Entrega</h3>
              <button className="summary-section__edit" onClick={editAddr} title="Editar dirección">✏️</button>
            </div>
            <AddressBlock address={data.selectedDestinationAddress} flag="🇻🇪" onEdit={editAddr} />
          </section>
        </div>

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        </div>
      </div>

      {/* ══ COLUMNA DERECHA ══════════════════════════════════════════════════ */}
      <div className="step3-layout__right">
        <div className="cost-card">
          <h3 className="cost-card__title">Resumen de Costos</h3>

          {!calc ? (
            <p className="cost-card__error">
              ⚠️ No se pudo calcular la tarifa. Vuelve al paso anterior.
            </p>
          ) : (
            <>
              {/* ── Opciones de entrega ─────────────────────────────────── */}
              {opts.length > 0 && (
                <div className="cost-options">
                  {opts.map((opt) => (
                    <div key={opt.type} className="cost-option">
                      <span className="cost-option__name">{opt.name}</span>
                      <span className="cost-option__price">{fmtUSD(opt.cost)}</span>
                      {opt.savings > 0 && (
                        <span className="cost-option__savings">Ahorra {opt.savings}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="cost-divider" />

              {/* ── Desglose colapsable ─────────────────────────────────── */}
              <button
                className={`cost-breakdown-toggle ${desglosAbierto ? 'cost-breakdown-toggle--open' : ''}`}
                onClick={() => setDesglosAbierto((v) => !v)}
              >
                <span className="cost-breakdown-toggle__label">
                  {bdOfi ? '🏪 Ver desglose (Retiro en Tienda)' : '🏠 Ver desglose (Domicilio)'}
                </span>
                <span className="cost-breakdown-toggle__arrow">
                  {desglosAbierto ? '▲' : '▼'}
                </span>
              </button>

              {/* Líneas detalladas — visibles solo cuando está abierto */}
              <div className={`cost-breakdown-body ${desglosAbierto ? 'cost-breakdown-body--open' : ''}`}>
                {lineas.map((d) => (
                  <CostRow
                    key={d.numLinea}
                    label={d.descripcionItem}
                    valueUSD={fmtUSD(Math.abs(d.montoUSD))}
                    isDiscount={d.esDescuento}
                    isMuted={d.categoria === 'SUBTOTAL'}
                  />
                ))}
                <div className="cost-divider" />
              </div>

              {/* ── Total — siempre visible ─────────────────────────────── */}
              <div className="cost-total">
                <span className="cost-total__label">Total a Pagar:</span>
                <span className="cost-total__usd">{fmtUSD(totalUSD)}</span>
              </div>
            </>
          )}

          <button
            className="btn-wizard-next cost-card__proceed-btn"
            onClick={onNext}
            disabled={!calc}
          >
            Proceder al Pago →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Summary;