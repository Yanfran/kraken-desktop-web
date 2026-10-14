// src/modules/es/pages/ShipmentWizard/steps/Step3CourierSelection.jsx
// Paso 3 — Selección del servicio de recogida España (SendSei)
// Mismo diseño que USA (modules/us/.../Step3CourierSelection.jsx):
// Toggle Drop-off / Pickup + date picker + cards de courier.
//
//   pickup  → Correos Express recoge en el domicilio; el cliente elige fecha.
//   dropoff → el cliente lleva el paquete a un punto SEUR (pre-determinado).
// Guarda { deliveryMethod, pickupDate, pickupTimeFrom, pickupTimeTo, dropoffPoint,
//          courierId, courierServiceId, courierQuote } en wizardData.

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  IoSearchOutline,
} from 'react-icons/io5';
import {
  fetchSendSeiQuotes,
  fetchSeurPoints,
  getNextBusinessDays,
  PICKUP_SLOT,
} from '../../../../../services/es/sendSeiService';
import './Step3CourierSelection.scss';

// CP del almacén Kraken España (destino de la recogida)
const KRAKEN_ES_POSTAL_CODE = '28013';

const BUSINESS_DAYS = getNextBusinessDays(5);

// Búsqueda sin tildes ni mayúsculas ("niño" encuentra "NIÑO", "tintoreros" encuentra "TINTOREROS")
const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const modalidadDe = (q) => (q?.modalidad ?? (q?.requires_pickup_point ? 'DROPOFF' : 'PICKUP'));

// Badges automáticos
function getBadge(quote, allQuotes) {
  const minPrice = Math.min(...allQuotes.map((q) => parseFloat(q.total)));
  if (parseFloat(quote.total) === minPrice)
    return { label: <><IoPricetagOutline size={12} style={{ verticalAlign: 'middle' }} /> Más económico</>, cls: 'badge--cheap' };
  return null;
}

// ── Card de courier ────────────────────────────────────────────────────────────
const CourierCard = ({ quote, isSelected, onSelect, badge }) => {
  const total  = parseFloat(quote.total).toFixed(2);
  const base   = parseFloat(quote.price).toFixed(2);
  const fuel   = parseFloat(quote.fuel_surcharge).toFixed(2);
  const pickup = parseFloat(quote.pickup_cost ?? 0).toFixed(2);

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
        <span className="courier-card__total">{total} €</span>
        <span className="courier-card__currency">EUR</span>
      </div>
      <div className="courier-card__breakdown">
        <span>Tarifa regular: {base} €</span>
        {parseFloat(fuel)   > 0 && <span>+ Combustible: {fuel} €</span>}
        {parseFloat(pickup) > 0 && <span>+ Recogida: {pickup} €</span>}
      </div>
      <div className="courier-card__meta">
        <IoScaleOutline size={14} style={{ verticalAlign: 'middle' }} /> {quote.weight_max} kg
        &nbsp;·&nbsp;
        <IoCubeOutline size={14} style={{ verticalAlign: 'middle' }} /> {quote.total_packages} bulto(s)
        {quote.delivery_time && (
          <>
            &nbsp;·&nbsp;
            <IoTimeOutline size={14} style={{ verticalAlign: 'middle' }} /> {quote.delivery_time}
          </>
        )}
      </div>
      {quote.warnings?.length > 0 && (
        <div className="courier-card__warnings">
          {quote.warnings.map((w) => (
            <span key={w}><IoWarningOutline size={12} style={{ verticalAlign: 'middle' }} /> {w}</span>
          ))}
        </div>
      )}
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
  const [quotes,   setQuotes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(data.courierQuote ?? null);

  const [points,        setPoints]        = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsError,   setPointsError]   = useState(null);
  const [pointsQuery,   setPointsQuery]   = useState('');

  const isPickup         = data.deliveryMethod === 'pickup';   // pre-determinado: drop-off
  const originPostalCode = data.selectedOriginAddress?.zip ?? '';
  const originCity       = data.selectedOriginAddress?.city ?? '';
  const pkg              = data.packages?.[0] ?? {};
  const weightKg         = pkg.unidadPeso?.toLowerCase() === 'lb'
    ? (parseFloat(pkg.peso || 0) / 2.20462).toFixed(2)
    : parseFloat(pkg.peso || 0).toFixed(2);

  // Puntos SEUR filtrados por el buscador; el elegido siempre queda visible
  const filteredPoints = useMemo(() => {
    const q = normalizar(pointsQuery.trim());
    if (!q) return points;
    const match = points.filter((pt) =>
      normalizar(`${pt.name} ${pt.address} ${pt.postal_code} ${pt.city}`).includes(q));
    const sel = data.dropoffPoint;
    return sel && !match.some((pt) => pt.pudo_id === sel.pudo_id)
      ? [points.find((pt) => pt.pudo_id === sel.pudo_id) ?? sel, ...match]
      : match;
  }, [points, pointsQuery, data.dropoffPoint]);

  // Las cotizaciones traen ambos tipos; se muestran las del método elegido
  const visibleQuotes = useMemo(
    () => quotes.filter((q) => modalidadDe(q) === (isPickup ? 'PICKUP' : 'DROPOFF')),
    [quotes, isPickup]
  );

  const selectQuote = (quote) => {
    setSelected(quote);
    updateData({
      courierId:        quote?.courier_id ?? null,
      courierServiceId: quote?.service_id ?? null,
      courierQuote:     quote ?? null,
    });
  };

  // ── Quotes ────────────────────────────────────────────────────────────────
  const loadQuotes = useCallback(async () => {
    if (!originPostalCode) {
      setError('No se encontró el código postal de la dirección de origen.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const result = await fetchSendSeiQuotes(originPostalCode, KRAKEN_ES_POSTAL_CODE, weightKg, pkg);

    setLoading(false);

    if (!result.success || !Array.isArray(result.data)) {
      setError('No se pudieron obtener las tarifas de recogida. Intenta de nuevo.');
      return;
    }

    const sorted = [...result.data].sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
    setQuotes(sorted);
  }, [originPostalCode, weightKg]); // eslint-disable-line

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  // ── Auto-seleccionar el más económico del método activo ───────────────────
  useEffect(() => {
    if (loading) return;
    const stillVisible = visibleQuotes.some(
      (q) => q.courier_id === selected?.courier_id && q.service_id === selected?.service_id
    );
    if (!stillVisible) selectQuote(visibleQuotes[0] ?? null);
  }, [visibleQuotes, loading]); // eslint-disable-line

  // ── Auto-set fecha de recogida al montar si pickup ya está seleccionado ───
  useEffect(() => {
    if (isPickup && !data.pickupDate) {
      updateData({
        deliveryMethod: 'pickup',
        pickupDate:     BUSINESS_DAYS[0].iso,
        pickupTimeFrom: PICKUP_SLOT.from,
        pickupTimeTo:   PICKUP_SLOT.to,
      });
    }
  }, []); // eslint-disable-line

  // ── Puntos SEUR (solo drop-off) ───────────────────────────────────────────
  useEffect(() => {
    if (isPickup || visibleQuotes.length === 0 || points.length > 0) return;
    if (!originCity) { setPointsError('La dirección de origen no tiene ciudad.'); return; }

    let cancelled = false;
    setLoadingPoints(true);
    setPointsError(null);
    fetchSeurPoints(originPostalCode, originCity).then((res) => {
      if (cancelled) return;
      if (!res.success) { setPointsError('No se pudieron cargar los puntos SEUR. Intenta de nuevo.'); return; }
      if (res.data.length === 0) setPointsError(`No hay puntos SEUR cerca de ${originPostalCode}.`);
      setPoints(res.data);
    }).finally(() => { if (!cancelled) setLoadingPoints(false); });
    return () => { cancelled = true; };
  }, [isPickup, visibleQuotes.length, originPostalCode, originCity]); // eslint-disable-line

  // ── Toggle método ─────────────────────────────────────────────────────────
  const handleToggleMethod = (method) => {
    if (method === (isPickup ? 'pickup' : 'dropoff')) return;
    if (method === 'dropoff') {
      updateData({ deliveryMethod: 'dropoff', pickupDate: '', pickupTimeFrom: '', pickupTimeTo: '' });
    } else {
      updateData({
        deliveryMethod: 'pickup',
        pickupDate:     BUSINESS_DAYS[0].iso,
        pickupTimeFrom: PICKUP_SLOT.from,
        pickupTimeTo:   PICKUP_SLOT.to,
        dropoffPoint:   null,
      });
    }
  };

  // ── Siguiente paso ────────────────────────────────────────────────────────
  const canContinue = !!selected && !loading && (isPickup ? !!data.pickupDate : !!data.dropoffPoint);

  const handleNext = () => {
    if (!canContinue) return;
    onNext();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="courier-step">
      <div className="wizard-card">
        <h2 className="wizard-card__title">
          <IoCarOutline size={22} style={{ verticalAlign: 'middle' }} /> Servicio de Recogida
        </h2>
        <p className="courier-step__subtitle">
          Elige cómo enviarnos tu paquete desde{' '}
          <strong>{originCity || 'tu dirección'}</strong> ({originPostalCode}) hasta nuestro almacén.
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
            <small>Llevo mi paquete a un punto SEUR</small>
          </button>
          <button
            type="button"
            className={`method-toggle__btn ${isPickup ? 'method-toggle__btn--active method-toggle__btn--pickup' : ''}`}
            onClick={() => handleToggleMethod('pickup')}
          >
            <IoCarOutline size={18} />
            <span>Pickup</span>
            <small>El courier recoge en mi dirección</small>
          </button>
        </div>

        {/* ── Meta chips ───────────────────────────────────────────────── */}
        <div className="courier-step__meta">
          <span><IoCubeOutline size={14} style={{ verticalAlign: 'middle' }} /> Peso: <strong>{weightKg} kg</strong></span>
          <span><IoLocationOutline size={14} style={{ verticalAlign: 'middle' }} /> Origen: <strong>{originPostalCode}</strong></span>
          <span><IoBusinessOutline size={14} style={{ verticalAlign: 'middle' }} /> Destino: <strong>{KRAKEN_ES_POSTAL_CODE} (Almacén Kraken)</strong></span>
          {isPickup ? (
            <span>
              <IoCarOutline size={14} style={{ verticalAlign: 'middle' }} /> <strong>Pickup</strong> · Recogida incluida en la tarifa
            </span>
          ) : (
            <span>
              <IoStorefrontOutline size={14} style={{ verticalAlign: 'middle' }} /> <strong>Drop-off</strong> · Elige un punto SEUR cerca de {originPostalCode}
            </span>
          )}
        </div>

        {/* ── Info recogida (solo pickup) ───────────────────────────────── */}
        {isPickup && (
          <div className="pickup-panel pickup-panel--info">
            <div className="pickup-panel__info-row" style={{ marginBottom: '8px' }}>
              <IoCalendarOutline size={15} style={{ verticalAlign: 'middle' }} />
              <strong>Fecha:</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {BUSINESS_DAYS.map((day) => (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => updateData({ pickupDate: day.iso, pickupTimeFrom: PICKUP_SLOT.from, pickupTimeTo: PICKUP_SLOT.to })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: data.pickupDate === day.iso ? '2px solid #F05A22' : '1.5px solid #CBD5E1',
                    background: data.pickupDate === day.iso ? '#FFF5F0' : '#fff',
                    color: data.pickupDate === day.iso ? '#F05A22' : '#374151',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: data.pickupDate === day.iso ? '700' : '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {day.short}
                </button>
              ))}
            </div>
            <div className="pickup-panel__info-row">
              <IoTimeOutline size={15} style={{ verticalAlign: 'middle' }} />
              <span><strong> Rango Horario:</strong> {PICKUP_SLOT.label}</span>
            </div>
          </div>
        )}

        {/* ── Punto SEUR (solo drop-off) ────────────────────────────────── */}
        {!isPickup && !loading && visibleQuotes.length > 0 && (
          <div className="pickup-panel pickup-panel--info">
            <div className="pickup-panel__info-row" style={{ marginBottom: '8px' }}>
              <IoStorefrontOutline size={15} style={{ verticalAlign: 'middle' }} />
              <strong>Punto SEUR donde entregarás tu paquete:</strong>
            </div>
            {loadingPoints && <p className="courier-step__empty">Buscando puntos SEUR cerca de {originPostalCode}…</p>}
            {!loadingPoints && pointsError && (
              <p className="courier-step__empty"><IoWarningOutline size={14} style={{ verticalAlign: 'middle' }} /> {pointsError}</p>
            )}
            {!loadingPoints && points.length > 0 && (
              <div className="dropoff-points__search">
                <IoSearchOutline size={16} />
                <input
                  type="search"
                  value={pointsQuery}
                  onChange={(e) => setPointsQuery(e.target.value)}
                  placeholder="Buscar por nombre, calle o código postal"
                  aria-label="Buscar punto SEUR"
                />
                <small>{filteredPoints.length} de {points.length}</small>
              </div>
            )}
            {!loadingPoints && points.length > 0 && filteredPoints.length === 0 && (
              <p className="courier-step__empty">No hay puntos SEUR que coincidan con “{pointsQuery}”.</p>
            )}
            {!loadingPoints && filteredPoints.length > 0 && (
              <div className="dropoff-points">
                {filteredPoints.map((pt) => (
                  <button
                    key={pt.pudo_id}
                    type="button"
                    className={`dropoff-points__item ${data.dropoffPoint?.pudo_id === pt.pudo_id ? 'dropoff-points__item--active' : ''}`}
                    onClick={() => updateData({ dropoffPoint: pt })}
                  >
                    <span className="point-texts">
                      <strong>{pt.name}</strong>
                      <span>{pt.address}, {pt.postal_code} {pt.city}</span>
                      {pt.hours && <small>{pt.hours}</small>}
                    </span>
                  </button>
                ))}
              </div>
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
              <IoRefreshOutline size={14} style={{ verticalAlign: 'middle' }} /> Reintentar
            </button>
          </div>
        )}

        {!loading && !error && visibleQuotes.length === 0 && (
          <p className="courier-step__empty">
            {isPickup
              ? 'No hay servicios de recogida disponibles para este código postal. Prueba con Drop-off.'
              : 'No hay servicios de Drop-off disponibles para este código postal. Prueba con Pickup.'}
          </p>
        )}

        {!loading && !error && visibleQuotes.length > 0 && (
          <div className="courier-step__grid">
            {visibleQuotes.map((q) => (
              <CourierCard
                key={`${q.courier_id}-${q.service_id}`}
                quote={q}
                isSelected={selected?.courier_id === q.courier_id && selected?.service_id === q.service_id}
                onSelect={selectQuote}
                badge={getBadge(q, visibleQuotes)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        <button
          className="btn-wizard-next"
          onClick={handleNext}
          disabled={!canContinue}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default Step3CourierSelection;
