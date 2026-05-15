// src/modules/es/pages/ShipmentWizard/steps/Step3CourierSelection.jsx
// ✅ Paso 3 del wizard España — Selección del servicio de recogida (SendSei)
//
// Llama automáticamente a la API de quotes al montarse.
// Muestra cards seleccionables agrupadas por courier.
// Guarda { courierId, courierServiceId, courierQuote } en wizardData.

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchUpsQuotes } from '../../../../../services/us/upsService';
import './Step3CourierSelection.scss';


// CP del almacén Kraken USA (destino de la recogida)
const KRAKEN_US_WAREHOUSE_ZIP = '33122';

// Logos por courier_id (agrega más según crezca la lista)
const COURIER_LOGOS = {
  1: '📮', // Correos Express
  3: '🟢', // Zeleris
};

// Badges automáticos
function getBadge(quote, allQuotes, t) {
  const minPrice = Math.min(...allQuotes.map((q) => parseFloat(q.total)));
  const maxPrice = Math.max(...allQuotes.map((q) => parseFloat(q.total)));

  if (parseFloat(quote.total) === minPrice) return { label: `💰 ${t('us_wizard.cheapest')}`, cls: 'badge--cheap' };
  if (parseFloat(quote.total) === maxPrice) return null;
  return null;
}

// ── Componente de card individual ─────────────────────────────────────────────
const CourierCard = ({ quote, isSelected, onSelect, badge }) => {
  const { t } = useTranslation();
  const total  = parseFloat(quote.total).toFixed(2);
  const base   = parseFloat(quote.price).toFixed(2);
  const fuel   = parseFloat(quote.fuel_surcharge).toFixed(2);
  const pickup = parseFloat(quote.pickup_cost).toFixed(2);
  const logo   = '🚚'; // UPS siempre usa este

  return (
    // ✅ div en lugar de button
    <div
      className={`courier-card ${isSelected ? 'courier-card--selected' : ''}`}
      onClick={() => onSelect(quote)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(quote)}
    >
      <span className={`courier-card__radio ${isSelected ? 'courier-card__radio--on' : ''}`} />

      <div className="courier-card__header">
        <span className="courier-card__logo">{logo}</span>
        <div className="courier-card__names">
          <span className="courier-card__courier">{quote.courier}</span>
          <span className="courier-card__service">{quote.service}</span>
        </div>
        {badge && <span className={`courier-card__badge ${badge.cls}`}>{badge.label}</span>}
      </div>

      <div className="courier-card__price">
        <span className="courier-card__total">{total} $</span>
        <span className="courier-card__currency">USD</span>
      </div>

      <div className="courier-card__breakdown">
        <span>{t('us_wizard.breakdown_base')}: {base} $</span>
        {parseFloat(fuel)   > 0 && <span>+ {t('us_wizard.breakdown_fuel')}: {fuel} $</span>}
        {parseFloat(pickup) > 0 && <span>+ {t('us_wizard.breakdown_pickup')}: {pickup} $</span>}
      </div>

      <div className="courier-card__meta">
        ⚖️ {quote.weight_max} kg · 📦 {quote.total_packages} {t('us_wizard.bultos')}
      </div>
    </div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="courier-card courier-card--skeleton">
    <div className="skeleton-line skeleton-line--wide" />
    <div className="skeleton-line skeleton-line--price" />
    <div className="skeleton-line skeleton-line--narrow" />
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const Step3CourierSelection = ({ data, updateData, onNext, onBack }) => {
  const { t } = useTranslation();

  const [quotes,   setQuotes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(data.courierQuote ?? null);

  // Extraer CP y peso del wizard
  const originPostalCode = data.selectedOriginAddress?.zip ?? '';
  const pkg              = data.packages?.[0] ?? {};
  const weightKg         = pkg.unidadPeso?.toLowerCase() === 'lb'
    ? (parseFloat(pkg.peso || 0) / 2.20462).toFixed(2)
    : parseFloat(pkg.peso || 0).toFixed(2);

  // ── Llamada a la API de quotes ────────────────────────────────────────────
  const loadQuotes = useCallback(async () => {
    if (!originPostalCode) {
      setError(t('us_wizard.error_no_zip'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // ✅ UPS en lugar de SendSei
    const result = await fetchUpsQuotes(
      originPostalCode,
      weightKg,
      parseFloat(pkg.largo  || 0),
      parseFloat(pkg.ancho  || 0),
      parseFloat(pkg.alto   || 0),
      'METRIC'
    );

    setLoading(false);

    if (!result.success || !Array.isArray(result.data)) {
      setError(t('us_wizard.error_ups_rates'));
      return;
    }

    setQuotes(result.data);

    if (!data.courierQuote && result.data.length > 0) {
      const first = result.data[0];
      updateData({
        courierId:        first.courier_id,
        courierServiceId: first.service_id,
        courierQuote:     first,
      });
    }
  }, [originPostalCode, weightKg]); // eslint-disable-line

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  // ── Selección del usuario ─────────────────────────────────────────────────
  const handleSelect = (quote) => {
    setSelected(quote);
    updateData({
      courierId:        quote.courier_id,
      courierServiceId: quote.service_id,
      courierQuote:     quote,
    });
  };

  // ── Avanzar al siguiente paso ─────────────────────────────────────────────
  const handleNext = () => {
    if (!selected) return;
    onNext();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="courier-step">
      <div className="wizard-card">
        <h2 className="wizard-card__title">🚚 {t('us_wizard.step3_title')}</h2>
        <p className="courier-step__subtitle">
          {t('us_wizard.step3_subtitle', {
            city: data.selectedOriginAddress?.city ?? '',
            zip:  originPostalCode,
          })}
        </p>

        <div className="courier-step__meta">
          <span>📦 {t('us_wizard.field_peso')}: <strong>{parseFloat(pkg.peso || 0).toFixed(2)} {pkg.unidadPeso || 'lb'}</strong></span>
          <span>📍 {t('us_wizard.origin_label')}: <strong>{originPostalCode}</strong></span>
          <span>🏭 {t('us_wizard.dest_label')}: <strong>{KRAKEN_US_WAREHOUSE_ZIP} ({t('us_wizard.courier_warehouse')})</strong></span>
        </div>

        <div className="wizard-divider" />

        {/* ── Estados: loading / error / resultados ─────────────────────── */}
        {loading && (
          <div className="courier-step__grid">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="courier-step__error">
            <p>⚠️ {error}</p>
            <button className="btn-wizard-back" onClick={loadQuotes}>
              🔄 {t('us_wizard.retry')}
            </button>
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <p className="courier-step__empty">
            {t('us_wizard.no_courier_services')}
          </p>
        )}

        {!loading && !error && quotes.length > 0 && (
          <div className="courier-step__grid">
            {quotes.map((q) => (
              <CourierCard
                key={`${q.courier_id}-${q.service_id}`}
                quote={q}
                isSelected={
                  selected?.courier_id    === q.courier_id &&
                  selected?.service_id    === q.service_id
                }
                onSelect={handleSelect}
                badge={getBadge(q, quotes, t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Acciones del wizard ──────────────────────────────────────────── */}
      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>
          {t('us_wizard.back')}
        </button>
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