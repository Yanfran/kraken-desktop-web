// src/modules/es/pages/ShipmentWizard/steps/Step3Summary.jsx
// Paso 3: Resumen del envío — detalles + costos reales del backend

import React from 'react';
import './Step3Summary.scss';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (n)  => Number(n || 0).toFixed(2);
const fmtBs = (n)  => `Bs. ${fmt(n)}`;
const fmtUSD = (n) => `$${fmt(n)} USD`;

// ── Fila de costo genérica ────────────────────────────────────────────────────
const CostRow = ({ label, valueBs, valueUSD, isDiscount, isMuted }) => (
  <div className={`cost-row ${isDiscount ? 'cost-row--discount' : ''} ${isMuted ? 'cost-row--muted' : ''}`}>
    <span className="cost-row__label">{label}</span>
    <div className="cost-row__values">
      <span className="cost-row__bs">{valueBs}</span>
      {valueUSD && <span className="cost-row__usd">{valueUSD}</span>}
    </div>
  </div>
);

// ── Componente principal del paso 3 ──────────────────────────────────────────
const Step3Summary = ({ data, updateData, onNext, onBack }) => {

  // ── Datos del paquete (Step1) ────────────────────────────────────────────
  const pkg  = data.packages[0];
  const dims = pkg
    ? `${pkg.largo || '–'}×${pkg.ancho || '–'}×${pkg.alto || '–'} cm`
    : '–';

  // ── Resultado del calculator (viene de ESShipmentWizard tras Step2) ──────
  // Shape: { cost, weightLbVol, deliveryOptions:[{type,name,cost,savings}],
  //          breakdowns:{ oficina:{detalles,total,totalBs,tasaCambio,...},
  //                       domicilio:{...} } }
  const calc   = data.calculationResult;
  const opts   = calc?.deliveryOptions ?? [];
  const bdOfi  = calc?.breakdowns?.oficina;    // retiro en tienda
  const bdDom  = calc?.breakdowns?.domicilio;  // domicilio
  const tasa   = bdOfi?.tasaCambio ?? 0;

  // Opción de oficina como precio base (la más económica)
  const opcionOfi = opts.find((o) => o.type === 'oficina');
  const opcionDom = opts.find((o) => o.type === 'domicilio');

  // Líneas del desglose (filtrar las que son 0)
  const lineas = (bdOfi?.detalles ?? []).filter(
    (d) => d.montoBs !== 0 && d.categoria !== 'TOTAL_BS'
  );

  // Total final (de la opción oficina si existe, sino domicilio)
  const totalUSD = opcionOfi?.cost ?? opcionDom?.cost ?? 0;
  const totalBs  = bdOfi?.totalBs  ?? bdDom?.totalBs  ?? 0;

  return (
    <div className="step3-layout">

      {/* ══════════════════════════════════════════════════════════════
          COLUMNA IZQUIERDA — detalles del paquete y direcciones
      ══════════════════════════════════════════════════════════════ */}
      <div className="step3-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">📋 Resumen del Envío</h2>

          {/* ── Detalles del paquete ─────────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">📦</span>
              <h3 className="summary-section__title">Detalles del Paquete</h3>
              <button className="summary-section__edit" onClick={onBack} title="Editar">✏️</button>
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

          {/* ── Dirección origen (España) ────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇪🇸</span>
              <h3 className="summary-section__title">Dirección de Origen</h3>
              <button className="summary-section__edit" onClick={onBack} title="Editar">✏️</button>
            </div>
            <p className="summary-addr__line">ID seleccionado: {data.originAddressId ?? '–'}</p>
          </section>

          <div className="wizard-divider" />

          {/* ── Dirección destino (Venezuela) ────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇻🇪</span>
              <h3 className="summary-section__title">Dirección de Destino</h3>
              <button className="summary-section__edit" onClick={onBack} title="Editar">✏️</button>
            </div>
            <p className="summary-addr__line">ID seleccionado: {data.destinationAddressId ?? '–'}</p>
          </section>
        </div>

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          COLUMNA DERECHA — costos reales del backend
      ══════════════════════════════════════════════════════════════ */}
      <div className="step3-layout__right">
        <div className="cost-card">
          <h3 className="cost-card__title">Resumen de Costos</h3>

          {!calc ? (
            /* Sin resultado — no debería llegar aquí porque el wizard
               bloqueó el avance si el calculator falló */
            <p className="cost-card__error">
              ⚠️ No se pudo calcular la tarifa. Vuelve al paso anterior.
            </p>

          ) : (
            <>
              {/* ── Opciones de entrega disponibles ─────────────── */}
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

              {/* ── Desglose línea a línea ────────────────────────── */}
              <p className="cost-card__subtitle">Desglose (Retiro en Tienda)</p>
              {lineas.map((d) => (
                <CostRow
                  key={d.numLinea}
                  label={d.descripcionItem}
                  valueBs={fmtBs(Math.abs(d.montoBs))}
                  valueUSD={fmtUSD(Math.abs(d.montoUSD))}
                  isDiscount={d.esDescuento}
                  isMuted={d.categoria === 'SUBTOTAL'}
                />
              ))}

              <div className="cost-divider" />

              {/* ── Tasa de cambio ───────────────────────────────── */}
              <CostRow
                label="Tasa de cambio:"
                valueBs={`Bs. ${fmt(tasa)}`}
                isMuted
              />

              {/* ── Total ────────────────────────────────────────── */}
              <div className="cost-total">
                <span className="cost-total__label">Total a Pagar:</span>
                <div className="cost-total__values">
                  <span className="cost-total__usd">{fmtUSD(totalUSD)}</span>
                  <span className="cost-total__bs">({fmtBs(totalBs)})</span>
                </div>
              </div>
            </>
          )}

          {/* ── Botón proceder al pago ───────────────────────────── */}
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