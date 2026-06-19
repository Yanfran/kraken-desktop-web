// src/modules/us/pages/ShipmentWizard/steps/Step3CourierSelection.jsx
// Paso 3 — Selección de servicio de recogida UPS
// Toggle Drop-off / Pickup + date picker + time slots

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IoCarOutline,
  IoCubeOutline,
  IoLocationOutline,
  IoBusinessOutline,
  IoStorefrontOutline,
  IoPricetagOutline,
  IoScaleOutline,
  IoWarningOutline,
  IoRefreshOutline,
  IoCalendarOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import { fetchUpsQuotes, fetchPickupRate } from '../../../../../services/us/upsService';
import { fetchUsaDescuentos } from '../../../../../services/us/usCalculatorService';
import './Step3CourierSelection.scss';

const KRAKEN_US_WAREHOUSE_ZIP = '33122';

// Próximos N días hábiles (lun–vie) a partir de mañana
function getNextBusinessDays(n) {
  const days = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (days.length < n) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const NEXT_DAYS = getNextBusinessDays(10);

const TIME_SLOTS = [
  { id: 'morning',   label: 'Mañana',     sub: '08:00 – 12:00', readyTime: '0800', closeTime: '1200' },
  { id: 'afternoon', label: 'Tarde',       sub: '12:00 – 17:00', readyTime: '1200', closeTime: '1700' },
  { id: 'allday',    label: 'Todo el día', sub: '08:00 – 17:00', readyTime: '0800', closeTime: '1700' },
];

function formatDateLabel(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Badges automáticos
function getBadge(quote, allQuotes, t) {
  const minPrice = Math.min(...allQuotes.map((q) => parseFloat(q.total)));
  if (parseFloat(quote.total) === minPrice)
    return { label: <><IoPricetagOutline size={12} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.cheapest')}</>, cls: 'badge--cheap' };
  return null;
}

// ── Card de courier ────────────────────────────────────────────────────────────
const CourierCard = ({ quote, isSelected, onSelect, badge, pickupRate, discountPct }) => {
  const { t } = useTranslation();
  const base        = parseFloat(quote.price).toFixed(2);
  const fuel        = parseFloat(quote.fuel_surcharge).toFixed(2);
  const pickupExtra = parseFloat(pickupRate ?? 0);
  const subtotal    = parseFloat(quote.total) + pickupExtra;
  const discountAmt = discountPct > 0 ? subtotal * discountPct / 100 : 0;
  const total       = (subtotal - discountAmt).toFixed(2);

  return (
    <div
      className={`courier-card ${isSelected ? 'courier-card--selected' : ''}`}
      onClick={() => onSelect(quote)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(quote)}
    >
      <span className={`courier-card__radio ${isSelected ? 'courier-card__radio--on' : ''}`} />
      <div className="courier-card__header">
        <span className="courier-card__logo"><IoCarOutline size={22} /></span>
        <div className="courier-card__names">
          <span className="courier-card__courier">{quote.courier}</span>
          <span className="courier-card__service">{quote.service}</span>
        </div>
        {badge && <span className={`courier-card__badge ${badge.cls}`}>{badge.label}</span>}
      </div>
      <div className="courier-card__price">
        {discountPct > 0 && (
          <span className="courier-card__original" style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '14px', marginRight: '6px' }}>
            ${subtotal.toFixed(2)}
          </span>
        )}
        <span className="courier-card__total">${total}</span>
        <span className="courier-card__currency">USD</span>
      </div>
      {discountPct > 0 && (
        <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: '600', marginTop: '-4px' }}>
          <IoPricetagOutline size={12} style={{ verticalAlign: 'middle' }} /> -{discountPct}% descuento
        </div>
      )}
      <div className="courier-card__breakdown">
        <span>{t('us_wizard.breakdown_base')}: ${base}</span>
        {parseFloat(fuel)   > 0 && <span>+ {t('us_wizard.breakdown_fuel')}: ${fuel}</span>}
        {pickupExtra        > 0 && <span>+ {t('us_wizard.breakdown_pickup')}: ${pickupExtra.toFixed(2)}</span>}
      </div>
      <div className="courier-card__meta">
        <IoScaleOutline size={14} style={{ verticalAlign: 'middle' }} /> {quote.weight_max} kg
        &nbsp;·&nbsp;
        <IoCubeOutline size={14} style={{ verticalAlign: 'middle' }} /> {quote.total_packages} {t('us_wizard.bultos')}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="courier-card courier-card--skeleton">
    <div className="skeleton-line skeleton-line--wide" />
    <div className="skeleton-line skeleton-line--price" />
    <div className="skeleton-line skeleton-line--narrow" />
  </div>
);

// ── Componente principal ───────────────────────────────────────────────────────
const Step3CourierSelection = ({ data, updateData, onNext, onBack }) => {
  const { t } = useTranslation();

  const [quotes,      setQuotes]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selected,    setSelected]    = useState(data.courierQuote ?? null);
  const [pickupRate,  setPickupRate]  = useState(data.pickupRate   ?? 0);
  const [loadingRate, setLoadingRate] = useState(false);
  const [pickupError, setPickupError] = useState('');
  const [discounts,   setDiscounts]   = useState(data.discounts ?? { pickup: { porcentaje: 0 }, dropoff: { porcentaje: 0 } });

  const isPickup          = data.deliveryMethod === 'pickup';
  const discountPct       = isPickup ? discounts.pickup?.porcentaje ?? 0 : discounts.dropoff?.porcentaje ?? 0;
  const originPostalCode  = data.selectedOriginAddress?.zip ?? '';
  const pkg               = data.packages?.[0] ?? {};
  const weightKg          = pkg.unidadPeso?.toLowerCase() === 'lb'
    ? (parseFloat(pkg.peso || 0) / 2.20462).toFixed(2)
    : parseFloat(pkg.peso || 0).toFixed(2);

  // ── Quotes ────────────────────────────────────────────────────────────────
  const loadQuotes = useCallback(async () => {
    if (!originPostalCode) {
      setError(t('us_wizard.error_no_zip'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const result = await fetchUpsQuotes(
      originPostalCode,
      weightKg,
      parseFloat(pkg.largo || 0),
      parseFloat(pkg.ancho || 0),
      parseFloat(pkg.alto  || 0),
      'METRIC',
      isPickup ? '06' : '03',
    );

    setLoading(false);

    if (!result.success || !Array.isArray(result.data)) {
      setError(t('us_wizard.error_ups_rates'));
      return;
    }

    setQuotes(result.data);
    setSelected(null);

    if (result.data.length > 0) {
      const first = result.data[0];
      updateData({ courierId: first.courier_id, courierServiceId: first.service_id, courierQuote: first });
      setSelected(first);
    }
  }, [originPostalCode, weightKg, isPickup]); // eslint-disable-line

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  // ── Descuentos ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsaDescuentos().then((res) => {
      if (res.success && res.data) {
        setDiscounts(res.data);
        updateData({ discounts: res.data });
      }
    });
  }, []); // eslint-disable-line

  // ── Pickup rate ───────────────────────────────────────────────────────────
  useEffect(() => {
    const originAddr = data.selectedOriginAddress;
    if (!isPickup || !originAddr || !data.pickupDate || !data.pickupReadyTime) {
      if (!isPickup) { setPickupRate(0); updateData({ pickupRate: 0 }); }
      return;
    }
    const pickupDateFormatted = data.pickupDate.replace(/-/g, '');
    setLoadingRate(true);
    fetchPickupRate({
      addressLine:          originAddr.line1    ?? '',
      city:                 originAddr.city     ?? '',
      stateProvince:        originAddr.province ?? '',
      postalCode:           originAddr.zip      ?? '',
      residentialIndicator: 'N',
      pickupDate:           pickupDateFormatted,
      readyTime:            data.pickupReadyTime,
      closeTime:            data.pickupCloseTime,
    }).then((res) => {
      const rate = res.success ? res.rate : 0;
      setPickupRate(rate);
      updateData({ pickupRate: rate });
    }).finally(() => setLoadingRate(false));
  }, [isPickup, data.selectedOriginAddress, data.pickupDate, data.pickupReadyTime]); // eslint-disable-line

  // ── Toggle método ─────────────────────────────────────────────────────────
  const handleToggleMethod = (method) => {
    if (method === data.deliveryMethod) return;
    setPickupError('');
    if (method === 'dropoff') {
      updateData({
        deliveryMethod: 'dropoff',
        pickupDate: '', pickupTimeSlot: '', pickupReadyTime: '', pickupCloseTime: '', pickupRate: 0,
      });
    } else {
      updateData({ deliveryMethod: 'pickup' });
    }
  };

  // ── Fecha ─────────────────────────────────────────────────────────────────
  const handleDateSelect = (isoDate) => {
    setPickupError('');
    updateData({ pickupDate: isoDate });
  };

  // ── Franja horaria ────────────────────────────────────────────────────────
  const handleSlotSelect = (slot) => {
    setPickupError('');
    updateData({ pickupTimeSlot: slot.id, pickupReadyTime: slot.readyTime, pickupCloseTime: slot.closeTime });
  };

  // ── Selección de courier ──────────────────────────────────────────────────
  const handleSelect = (quote) => {
    setSelected(quote);
    updateData({ courierId: quote.courier_id, courierServiceId: quote.service_id, courierQuote: quote, pickupRate });
  };

  // ── Siguiente paso ────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!selected) return;
    if (isPickup) {
      if (!data.pickupDate) { setPickupError('Selecciona una fecha de recogida.'); return; }
      if (!data.pickupTimeSlot) { setPickupError('Selecciona una franja horaria.'); return; }
    }
    setPickupError('');
    onNext();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="courier-step">
      <div className="wizard-card">
        <h2 className="wizard-card__title">
          <IoCarOutline size={22} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.step3_title')}
        </h2>
        <p className="courier-step__subtitle">
          {t('us_wizard.step3_subtitle', { city: data.selectedOriginAddress?.city ?? '', zip: originPostalCode })}
        </p>

        {/* ── Toggle Drop-off / Pickup ──────────────────────────────────── */}
        <div className="method-toggle">
          <button
            type="button"
            className={`method-toggle__btn ${!isPickup ? 'method-toggle__btn--active method-toggle__btn--dropoff' : ''}`}
            onClick={() => handleToggleMethod('dropoff')}
          >
            <IoStorefrontOutline size={18} />
            <span>Drop-off</span>
            <small>Llevo mi paquete a UPS</small>
          </button>
          <button
            type="button"
            className={`method-toggle__btn ${isPickup ? 'method-toggle__btn--active method-toggle__btn--pickup' : ''}`}
            onClick={() => handleToggleMethod('pickup')}
          >
            <IoCarOutline size={18} />
            <span>Pickup</span>
            <small>UPS recoge en mi dirección</small>
          </button>
        </div>

        {/* ── Meta chips ───────────────────────────────────────────────── */}
        <div className="courier-step__meta">
          <span><IoCubeOutline size={14} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.field_peso')}: <strong>{parseFloat(pkg.peso || 0).toFixed(2)} {pkg.unidadPeso || 'lb'}</strong></span>
          <span><IoLocationOutline size={14} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.origin_label')}: <strong>{originPostalCode}</strong></span>
          <span><IoBusinessOutline size={14} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.dest_label')}: <strong>{KRAKEN_US_WAREHOUSE_ZIP} ({t('us_wizard.courier_warehouse')})</strong></span>
          {isPickup ? (
            <span>
              <IoCarOutline size={14} style={{ verticalAlign: 'middle' }} /> <strong>Pickup</strong>
              {loadingRate
                ? ' · Calculando tarifa...'
                : pickupRate > 0
                  ? ` · +${pickupRate.toFixed(2)} $ (recogida UPS)`
                  : ' · Tarifa pendiente'}
            </span>
          ) : (
            <span>
              <IoStorefrontOutline size={14} style={{ verticalAlign: 'middle' }} /> <strong>Drop-off</strong> ·{' '}
              <a
                href={`https://www.ups.com/us/en/find-a-location.page?requestType=dropOff&search=${originPostalCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1a73e8', textDecoration: 'underline' }}
              >
                Ver tiendas UPS cerca de {originPostalCode}
              </a>
            </span>
          )}
        </div>

        {/* ── Panel fecha + franja horaria (solo pickup) ────────────────── */}
        {isPickup && (
          <div className="pickup-panel">
            <div className="pickup-panel__section">
              <p className="pickup-panel__label">
                <IoCalendarOutline size={15} style={{ verticalAlign: 'middle' }} /> Fecha de recogida
              </p>
              <div className="pickup-panel__dates">
                {NEXT_DAYS.map((d) => {
                  const iso = toISO(d);
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`pickup-panel__date-btn ${data.pickupDate === iso ? 'pickup-panel__date-btn--active' : ''}`}
                      onClick={() => handleDateSelect(iso)}
                    >
                      {formatDateLabel(d)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pickup-panel__section">
              <p className="pickup-panel__label">
                <IoTimeOutline size={15} style={{ verticalAlign: 'middle' }} /> Franja horaria
              </p>
              <div className="pickup-panel__slots">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`pickup-panel__slot-btn ${data.pickupTimeSlot === slot.id ? 'pickup-panel__slot-btn--active' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="slot-texts">
                      <strong>{slot.label}</strong>
                      <small>{slot.sub}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {pickupError && (
              <p className="pickup-panel__error">
                <IoWarningOutline size={14} style={{ verticalAlign: 'middle' }} /> {pickupError}
              </p>
            )}
          </div>
        )}

        <div className="wizard-divider" />

        {/* ── Loading / error / resultados ─────────────────────────────── */}
        {loading && (
          <div className="courier-step__grid">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="courier-step__error">
            <p><IoWarningOutline size={18} style={{ verticalAlign: 'middle' }} /> {error}</p>
            <button className="btn-wizard-back" onClick={loadQuotes}>
              <IoRefreshOutline size={14} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.retry')}
            </button>
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <p className="courier-step__empty">{t('us_wizard.no_courier_services')}</p>
        )}

        {!loading && !error && quotes.length > 0 && (
          <div className="courier-step__grid">
            {quotes.map((q) => (
              <CourierCard
                key={`${q.courier_id}-${q.service_id}`}
                quote={q}
                isSelected={selected?.courier_id === q.courier_id && selected?.service_id === q.service_id}
                onSelect={handleSelect}
                badge={getBadge(q, quotes, t)}
                pickupRate={isPickup ? pickupRate : 0}
                discountPct={discountPct}
              />
            ))}
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>{t('us_wizard.back')}</button>
        <button
          className="btn-wizard-next"
          onClick={handleNext}
          disabled={!selected || loading}
        >
          {t('us_wizard.continue')}
        </button>
      </div>
    </div>
  );
};

export default Step3CourierSelection;
