// src/modules/es/pages/ShipmentWizard/steps/Step3Summary.jsx
import React from 'react';
import './Step3Summary.scss';

const fmt    = (n) => Number(n || 0).toFixed(2);
const fmtUSD = (n) => `$${fmt(n)} USD`;

// ── Fila de costo (Euros) ─────────────────────────────────────────────────────
const CostRow = ({ label, valueUSD, isDiscount }) => (
  <div className={`cost-row ${isDiscount ? 'cost-row--discount' : ''}`}>
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

  const pkg  = data.packages[0];
  const dims = pkg
    ? `${pkg.largo || '–'}×${pkg.ancho || '–'}×${pkg.alto || '–'} cm`
    : '–';

  // 1. Obtenemos el cálculo de la API
  const calc = data.calculationResult;
  
  // 2. Extraemos los detalles del nuevo formato JSON
  const detalles = calc?.data?.detalles || [];
  
  // 3. Filtramos la línea TOTAL para que no se repita arriba
  const lineas = detalles.filter((d) => d.categoria !== 'TOTAL');
  
  // 4. Obtenemos el total final
  const totalEUR = calc?.data?.total || 0;

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
                  <p className="summary-pkg-item__label">Peso Físico:</p>
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
              
              {/* Peso volumétrico facturado si aplica */}
              {calc?.billedWeight && (
                <div className="summary-pkg-item">
                  <span className="summary-pkg-item__icon">📊</span>
                  <div>
                    <p className="summary-pkg-item__label">Peso facturado:</p>
                    <p className="summary-pkg-item__value">
                      {fmt(calc.billedWeight)} kg {calc.isVolumetric ? '(Volumétrico)' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="wizard-divider" />

          {/* ── Dirección de recogida (USA) ───────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇺🇸</span>
              <h3 className="summary-section__title">Dirección de Recogida</h3>
              <button className="summary-section__edit" onClick={editAddr} title="Editar dirección">✏️</button>
            </div>
            <AddressBlock address={data.selectedOriginAddress} flag="🇺🇸" onEdit={editAddr} />
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
        <div className="cost-card" style={{ borderTop: '4px solid #022364' }}>
          <h3 className="cost-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            🇺🇸 Detalle de Tarifa
          </h3>

          {!calc ? (
            <p className="cost-card__error">
              ⚠️ No se pudo calcular la tarifa. Vuelve al paso anterior.
            </p>
          ) : (
            <>
              {/* ── Desglose tarifa Kraken ─────────────────────────────────── */}
              <div className="cost-breakdown-body cost-breakdown-body--open" style={{ marginTop: '15px' }}>
                {lineas.map((d, idx) => (
                  <CostRow
                    key={idx}
                    label={d.descripcionItem}
                    valueUSD={fmtUSD(Math.abs(d.monto))}
                    isDiscount={d.esDescuento || d.monto < 0}
                  />
                ))}

                {/* ✅ Línea UPS si hay courierQuote */}
                {data.courierQuote && (
                  <CostRow
                    label={`🚚 ${data.courierQuote.courier ?? 'UPS'} ${data.courierQuote.service ?? 'Ground'} (Recogida)`}
                    valueUSD={fmtUSD(data.courierQuote.total ?? 0)}
                    isDiscount={false}
                  />
                )}
              </div>

              {/* ── Total incluyendo UPS ─────────────────────────────── */}
              <div className="cost-total cost-total--espana">
                <span className="cost-total__label">Total PREPAID</span>
                <span className="cost-total__usd" style={{ color: '#fff', fontSize: '18px', fontFamily: 'Courier New, monospace' }}>
                  {fmtUSD(
                    Number(totalEUR) + Number(data.courierQuote?.total ?? 0)
                  )}
                </span>
              </div>
            </>
          )}

          <button
            className="btn-wizard-next cost-card__proceed-btn"
            onClick={onNext}
            disabled={!calc}
            style={{ marginTop: '20px' }}
          >
            Proceder al Pago →
          </button>
          
          <p style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', marginTop: '12px' }}>
            <i className="fas fa-info-circle"></i> Los montos en USD  son referenciales.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3Summary;