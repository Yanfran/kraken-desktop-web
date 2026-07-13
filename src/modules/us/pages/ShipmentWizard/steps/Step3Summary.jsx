// src/modules/es/pages/ShipmentWizard/steps/Step3Summary.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  IoCreateOutline,
  IoWarningOutline,
  IoCubeOutline,
  IoResizeOutline,
  IoScaleOutline,
  IoDocumentOutline,
  IoCashOutline,
  IoBarChartOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCarOutline,
  IoStorefrontOutline,
  IoDocumentTextOutline,
  IoPricetagOutline,
} from 'react-icons/io5';
import './Step3Summary.scss';

const fmt    = (n) => Number(n || 0).toFixed(2);
const fmtUSD = (n) => `$${fmt(n)} USD`;
const fmtTime = (hhmm) => {
  if (!hhmm || hhmm.length < 4) return hhmm;
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
};

// ── Fila de costo (Euros) ─────────────────────────────────────────────────────
const CostRow = ({ label, valueUSD, isDiscount }) => (
  <div className={`cost-row ${isDiscount ? 'cost-row--discount' : ''}`}>
    <span className="cost-row__label">{label}</span>
    <span className="cost-row__usd-value">{valueUSD}</span>
  </div>
);

// ── Bloque de dirección legible ───────────────────────────────────────────────
const AddressBlock = ({ address, flag, onEdit }) => {
  const { t } = useTranslation();

  if (!address) {
    return (
      <div className="summary-addr">
        <p className="summary-addr__line" style={{ color: '#ef4444' }}>
          <IoWarningOutline size={15} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.error_addr_not_found')}
        </p>
        <button className="summary-section__edit" onClick={onEdit}><IoCreateOutline size={14} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.edit_label')}</button>
      </div>
    );
  }

  const esStore = address.tipoDireccion === 'store';

  return (
    <div className="summary-addr">
      <p className="summary-addr__name">
        {flag} {address.alias || address.nombreLocker || t('us_wizard.no_name')}
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
  const { t } = useTranslation();

  const pkg   = data.packages[0];
  const isDoc = pkg?.tipoPaquete === 'Documento';
  const dims  = isDoc
    ? 'Documento'
    : (pkg ? `${pkg.largo || '–'}×${pkg.ancho || '–'}×${pkg.alto || '–'} in` : '–');

  const isPickup   = data.deliveryMethod === 'pickup';
  const pickupRate = (isPickup && !isDoc) ? Number(data.pickupRate ?? 0) : 0;

  // 1. Obtenemos el cálculo de la API
  const calc = data.calculationResult;

  // 2. Extraemos los detalles del nuevo formato JSON
  const detalles = calc?.data?.detalles || [];

  // 3. Filtramos la línea TOTAL para que no se repita arriba
  const lineas = detalles.filter((d) => d.categoria !== 'TOTAL');

  // 4. Obtenemos el total final
  const totalEUR = calc?.data?.total || 0;

  // 5. Descuento KU
  const discounts   = data.discounts ?? {};
  const discountPct = isPickup ? (discounts.pickup?.porcentaje ?? 0) : (discounts.dropoff?.porcentaje ?? 0);
  const discountName = isPickup ? (discounts.pickup?.nombre ?? 'Descuento Pickup') : (discounts.dropoff?.nombre ?? 'Descuento Drop-Off');
  const subtotalBeforeDiscount = Number(totalEUR) + Number(data.courierQuote?.total ?? 0) + pickupRate;
  const discountAmount = discountPct > 0 ? subtotalBeforeDiscount * discountPct / 100 : 0;
  const grandTotal = subtotalBeforeDiscount - discountAmount;

  const editPkg  = onEditPackage   ?? onBack;
  const editAddr = onEditAddresses ?? onBack;

  return (
    <div className="step3-layout">

      {/* ══ COLUMNA IZQUIERDA ════════════════════════════════════════════════ */}
      <div className="step3-layout__left">
        <div className="wizard-card">
          <h2 className="wizard-card__title">
            <IoDocumentTextOutline size={22} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.step4_title')}
          </h2>

          {/* ── Detalles del paquete ─────────────────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon"><IoCubeOutline size={18} /></span>
              <h3 className="summary-section__title">{t('us_wizard.summary_package_title')}</h3>
              <button className="summary-section__edit" onClick={editPkg} title="Editar paquete"><IoCreateOutline size={16} /></button>
            </div>

            <div className="summary-pkg-grid">
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon"><IoResizeOutline size={20} /></span>
                <div>
                  <p className="summary-pkg-item__label">{t('us_wizard.dimensions')}</p>
                  <p className="summary-pkg-item__value">{dims}</p>
                </div>
              </div>
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon"><IoScaleOutline size={20} /></span>
                <div>
                  <p className="summary-pkg-item__label">{t('us_wizard.physical_weight')}</p>
                  <p className="summary-pkg-item__value">{pkg?.peso || '–'} {pkg?.unidadPeso || 'lb'}</p>
                </div>
              </div>
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon"><IoDocumentOutline size={20} /></span>
                <div>
                  <p className="summary-pkg-item__label">{t('us_wizard.content_label')}</p>
                  <p className="summary-pkg-item__value">{pkg?.descripcion || '–'}</p>
                </div>
              </div>
              <div className="summary-pkg-item">
                <span className="summary-pkg-item__icon"><IoCashOutline size={20} /></span>
                <div>
                  <p className="summary-pkg-item__label">{t('us_wizard.fob_value')}</p>
                  <p className="summary-pkg-item__value">${pkg?.valorFOB || '–'} USD</p>
                </div>
              </div>

              {/* Peso volumétrico facturado si aplica */}
              {calc?.billedWeight && (
                <div className="summary-pkg-item">
                  <span className="summary-pkg-item__icon"><IoBarChartOutline size={20} /></span>
                  <div>
                    <p className="summary-pkg-item__label">{t('us_wizard.billed_weight')}</p>
                    <p className="summary-pkg-item__value">
                      {fmt(calc.billedWeight * 2.20462)} lb {calc.isVolumetric ? `(${t('us_wizard.volumetric')})` : ''}
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
              <h3 className="summary-section__title">{t('us_wizard.pickup_address')}</h3>
              <button className="summary-section__edit" onClick={editAddr} title="Editar dirección"><IoCreateOutline size={16} /></button>
            </div>
            <AddressBlock address={data.selectedOriginAddress} flag="🇺🇸" onEdit={editAddr} />
          </section>

          <div className="wizard-divider" />

          {/* ── Dirección de entrega (Venezuela) ────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">🇻🇪</span>
              <h3 className="summary-section__title">{t('us_wizard.delivery_address')}</h3>
              <button className="summary-section__edit" onClick={editAddr} title="Editar dirección"><IoCreateOutline size={16} /></button>
            </div>
            <AddressBlock address={data.selectedDestinationAddress} flag="🇻🇪" onEdit={editAddr} />
          </section>

          <div className="wizard-divider" />

          {/* ── Método de entrega UPS ─────────────────────────────────── */}
          <section className="summary-section">
            <div className="summary-section__header">
              <span className="summary-section__icon">
                {isPickup ? <IoCarOutline size={18} /> : <IoStorefrontOutline size={18} />}
              </span>
              <h3 className="summary-section__title">Método de Entrega UPS</h3>
            </div>
            {isPickup ? (
              <div className="summary-addr">
                <p className="summary-addr__name">
                  <IoCarOutline size={15} style={{ verticalAlign: 'middle' }} /> Pickup — UPS recoge en tu domicilio
                </p>
                <p className="summary-addr__line">
                  <IoCalendarOutline size={14} style={{ verticalAlign: 'middle' }} /> {data.pickupDate ?? '–'}
                </p>
                <p className="summary-addr__line">
                  <IoTimeOutline size={14} style={{ verticalAlign: 'middle' }} /> {fmtTime(data.pickupReadyTime)} – {fmtTime(data.pickupCloseTime)}
                </p>
                {pickupRate > 0 && (
                  <p className="summary-addr__line" style={{ color: '#1e40af', fontWeight: '600' }}>
                    <IoCashOutline size={14} style={{ verticalAlign: 'middle' }} /> +${pickupRate.toFixed(2)} USD (tarifa recogida)
                  </p>
                )}
              </div>
            ) : (
              <div className="summary-addr">
                <p className="summary-addr__name">
                  <IoStorefrontOutline size={15} style={{ verticalAlign: 'middle' }} /> Drop-off en tienda UPS
                </p>
                <p className="summary-addr__line" style={{ color: '#6b7280' }}>
                  Llevar el paquete a la tienda UPS más cercana al origen
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="wizard-actions">
          <button className="btn-wizard-back" onClick={onBack}>{t('us_wizard.back')}</button>
        </div>
      </div>

      {/* ══ COLUMNA DERECHA ══════════════════════════════════════════════════ */}
      <div className="step3-layout__right">
        <div className="cost-card" style={{ borderTop: '4px solid #022364' }}>
          <h3 className="cost-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            🇺🇸 {t('us_wizard.rate_detail')}
          </h3>

          {!calc ? (
            <p className="cost-card__error">
              <IoWarningOutline size={16} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.error_no_calc')}
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
                    label={<><IoCarOutline size={14} style={{ verticalAlign: 'middle' }} /> {data.courierQuote.courier ?? 'UPS'} {data.courierQuote.service ?? 'Ground'} (Flete USA)</>}
                    valueUSD={fmtUSD(data.courierQuote.total ?? 0)}
                    isDiscount={false}
                  />
                )}

                {/* Costo de recogida UPS (solo pickup) */}
                {isPickup && pickupRate > 0 && (
                  <CostRow
                    label={<><IoCarOutline size={14} style={{ verticalAlign: 'middle' }} /> Recogida UPS · {data.pickupDate ?? ''} {fmtTime(data.pickupReadyTime)}–{fmtTime(data.pickupCloseTime)}</>}
                    valueUSD={fmtUSD(pickupRate)}
                    isDiscount={false}
                  />
                )}

                {/* Descuento KU */}
                {discountPct > 0 && (
                  <CostRow
                    label={<><IoPricetagOutline size={14} style={{ verticalAlign: 'middle' }} /> {discountName} (-{discountPct}%)</>}
                    valueUSD={`-${fmtUSD(discountAmount)}`}
                    isDiscount={true}
                  />
                )}
              </div>

              {/* ── Total incluyendo UPS ─────────────────────────────── */}
              <div className="cost-total cost-total--espana">
                <span className="cost-total__label">Total PREPAID</span>
                <span className="cost-total__usd" style={{ color: '#fff', fontSize: '18px', fontFamily: 'Courier New, monospace' }}>
                  {fmtUSD(grandTotal)}
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
            {t('us_wizard.proceed_payment')}
          </button>
          
          <p style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', marginTop: '12px' }}>
            <IoWarningOutline size={13} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.usd_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3Summary;