// src/modules/es/pages/ShipmentWizard/steps/Step3Summary.jsx
// Paso 3: Resumen del envío — detalles + cálculo de costos
// Llama al backend para calcular el precio; el usuario puede activar seguro opcional

import React, { useState, useEffect, useCallback } from 'react';
import './Step3Summary.scss';

// ── Mock para calcular precio — reemplazar con llamada real ─────────────────
// POST /api/es/shipments/calculate
const mockCalculate = async (packages, seguroActivo) => {
  await new Promise((r) => setTimeout(r, 800));
  const totalKg       = packages.reduce((s, p) => s + Number(p.peso || 0), 0);
  const totalVol      = packages.reduce((s, p) => s + (Number(p.largo||0) * Number(p.ancho||0) * Number(p.alto||0)) / 5000, 0);
  const envioBase     = 25.00;
  const pesoVol       = Math.max(0, (totalVol - totalKg) * 3);
  const seguro        = seguroActivo ? 8.50 : 0;
  const subtotal      = envioBase + pesoVol + seguro;
  const iva           = parseFloat((subtotal * 0.21).toFixed(2));
  const total         = parseFloat((subtotal + iva).toFixed(2));
  const totalUSD      = parseFloat((total * 1.10).toFixed(2)); // tasa aprox
  return { envioBase, pesoVolumetrico: pesoVol, seguro, subtotal, iva, total, totalUSD };
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const eur = (n) => `€${Number(n || 0).toFixed(2)}`;

// ── Fila de resumen de costo ─────────────────────────────────────────────────
const CostRow = ({ label, value, optional, checked, onToggle }) => (
  <div className={`cost-row ${optional ? 'cost-row--optional' : ''}`}>
    <span className="cost-row__label">
      {optional && (
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="cost-row__check"
          id="seguro-check"
        />
      )}
      {optional ? <label htmlFor="seguro-check">{label}</label> : label}
    </span>
    <span className={`cost-row__value ${checked === false ? 'cost-row__value--off' : ''}`}>
      {value}
    </span>
  </div>
);

// ── Componente principal del paso 3 ─────────────────────────────────────────
const Step3Summary = ({ data, updateData, onNext, onBack }) => {
  const [calculating, setCalculating] = useState(false);

  // Dispara el cálculo cuando se monta o cambia el seguro
  const calculate = useCallback(async () => {
    setCalculating(true);
    try {
      const pricing = await mockCalculate(data.packages, data.seguroActivo);
      updateData({ pricing });
    } finally {
      setCalculating(false);
    }
  }, [data.packages, data.seguroActivo, updateData]);

  useEffect(() => { calculate(); }, [data.seguroActivo]); // eslint-disable-line

  const toggleSeguro = () => updateData({ seguroActivo: !data.seguroActivo });

  // Dirección de origen / destino simuladas (normalmente vendrían del contexto de direcciones)
  const originAddr  = { name: 'Carlos Rodríguez', line: 'Calle Mayor, 12, 4ºB, 28013 Madrid, España',       phone: '+34 612 345 678' };
  const destAddr    = { name: 'Ana Martínez',      line: 'Av. Francisco de Miranda, Torre Europa, P5, Caracas', phone: '+58 424 123 4567' };

  const pkg = data.packages[0];
  const p   = data.pricing;

  // Resumen de dimensiones del primer paquete
  const dims = pkg
    ? `${pkg.largo || '–'}×${pkg.ancho || '–'}×${pkg.alto || '–'} cm`
    : '–';

  return (
    <div className="step3-layout">
      {/* ── Columna izquierda: detalles ── */}
      <div className="step3-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">📋 Resumen del Envío</h2>

          {/* Detalles del paquete */}
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
            </div>

            {data.packages.length > 1 && (
              <p className="summary-multi-box">+ {data.packages.length - 1} caja(s) adicional(es)</p>
            )}
          </section>

          <div className="wizard-divider" />

          {/* Dirección origen */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇪🇸</span>
              <h3 className="summary-section__title">Dirección de Origen</h3>
              <button className="summary-section__edit" title="Editar">✏️</button>
            </div>
            <p className="summary-addr__name">{originAddr.name}</p>
            <p className="summary-addr__line"><strong>Dirección:</strong> {originAddr.line}</p>
            <p className="summary-addr__line"><strong>Teléfono:</strong> {originAddr.phone}</p>
          </section>

          <div className="wizard-divider" />

          {/* Dirección destino */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇻🇪</span>
              <h3 className="summary-section__title">Dirección de Destino</h3>
              <button className="summary-section__edit" title="Editar">✏️</button>
            </div>
            <p className="summary-addr__name">{destAddr.name}</p>
            <p className="summary-addr__line"><strong>Dirección:</strong> {destAddr.line}</p>
            <p className="summary-addr__line"><strong>Teléfono:</strong> {destAddr.phone}</p>
          </section>
        </div>

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        </div>
      </div>

      {/* ── Columna derecha: costos ── */}
      <div className="step3-layout__right">
        <div className="cost-card">
          <h3 className="cost-card__title">Resumen de Costos</h3>

          {calculating ? (
            <div className="cost-card__loading">
              <div className="spinner-small" />
              <span>Calculando precio...</span>
            </div>
          ) : p ? (
            <>
              <CostRow label="Envío base:"        value={eur(p.envioBase)} />
              <CostRow label="Peso volumétrico:"  value={eur(p.pesoVolumetrico)} />
              <CostRow
                label="Seguro opcional (hasta €500):"
                value={eur(p.seguro)}
                optional
                checked={data.seguroActivo}
                onToggle={toggleSeguro}
              />

              <div className="cost-divider" />

              <CostRow label="Subtotal:" value={eur(p.subtotal)} />
              <CostRow label="IVA (21%):" value={eur(p.iva)} />

              <div className="cost-total">
                <span className="cost-total__label">Costo Total:</span>
                <div className="cost-total__values">
                  <span className="cost-total__eur">{eur(p.total)}</span>
                  <span className="cost-total__usd">(${p.totalUSD} USD aprox.)</span>
                </div>
              </div>
            </>
          ) : (
            <p className="cost-card__error">No se pudo calcular el precio. Intenta de nuevo.</p>
          )}

          <button
            className="btn-wizard-next cost-card__proceed-btn"
            onClick={onNext}
            disabled={calculating || !p}
          >
            Proceder al Pago →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Summary;