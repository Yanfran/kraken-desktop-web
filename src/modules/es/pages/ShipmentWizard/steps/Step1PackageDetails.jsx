// src/modules/es/pages/ShipmentWizard/steps/Step1PackageDetails.jsx
// Paso 1: Detalles del envío — dimensiones, peso, tipo, FOB, descripción
// Soporta múltiples cajas (paquetes)

import React, { useState } from 'react';
import './Step1PackageDetails.scss';

// ── Opciones de tipo de paquete ──────────────────────────────────────────────
const PACKAGE_TYPES = ['Caja', 'Sobre'];
const WEIGHT_UNITS  = ['kg', 'lb'];

// ── Paquete vacío generador ──────────────────────────────────────────────────
const newPackage = () => ({
  id: Date.now() + Math.random(),
  largo: '',
  ancho: '',
  alto: '',
  peso: '',
  unidadPeso: 'kg',
  tipoPaquete: 'Caja',
  valorFOB: '',
  descripcion: '',
});

// ── Validación de un paquete ─────────────────────────────────────────────────
const validatePackage = (pkg) => {
  const errors = {};
  if (!pkg.largo  || isNaN(pkg.largo)  || Number(pkg.largo)  <= 0) errors.largo  = 'Requerido';
  if (!pkg.ancho  || isNaN(pkg.ancho)  || Number(pkg.ancho)  <= 0) errors.ancho  = 'Requerido';
  if (!pkg.alto   || isNaN(pkg.alto)   || Number(pkg.alto)   <= 0) errors.alto   = 'Requerido';
  if (!pkg.peso   || isNaN(pkg.peso)   || Number(pkg.peso)   <= 0) errors.peso   = 'Requerido';
  if (!pkg.valorFOB || isNaN(pkg.valorFOB) || Number(pkg.valorFOB) < 0) errors.valorFOB = 'Requerido';
  if (!pkg.descripcion.trim()) errors.descripcion = 'Requerido';
  return errors;
};

// ── Componente de una caja individual ───────────────────────────────────────
const PackageForm = ({ pkg, index, total, onChange, onRemove, errors }) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showFOBTooltip, setShowFOBTooltip]     = useState(false);

  const set = (field, value) => onChange(pkg.id, field, value);

  return (
    <div className="pkg-form">
      {/* Cabecera de la caja */}
      <div className="pkg-form__header">
        <span className="pkg-form__title">
          📦 {total > 1 ? `Caja ${index + 1} de ${total}` : 'Detalles del Paquete'}
        </span>
        {total > 1 && (
          <button className="pkg-form__remove" onClick={() => onRemove(pkg.id)} title="Eliminar caja">
            ✕
          </button>
        )}
      </div>

      {/* ── Ilustración de la caja (solo en la primera) ── */}
      {index === 0 && (
        <div className="pkg-form__illustration">
          <svg viewBox="0 0 340 200" className="pkg-form__box-svg" aria-hidden="true">
            <defs>
              {/* Gradientes para dar volumen a cada cara */}
              <linearGradient id="faceTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#e8c89a"/>
                <stop offset="100%" stopColor="#d4a96a"/>
              </linearGradient>
              <linearGradient id="faceLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#c48a4a"/>
                <stop offset="100%" stopColor="#b87a38"/>
              </linearGradient>
              <linearGradient id="faceRight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#d4a05a"/>
                <stop offset="100%" stopColor="#c49040"/>
              </linearGradient>
              {/* Sombra drop */}
              <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#00000022"/>
              </filter>
            </defs>

            {/* ── Cara SUPERIOR (tapa) ── */}
            {/*  Puntos: izq-front, der-front, der-back, izq-back  */}
            <polygon
              points="60,70  200,30  280,65  140,105"
              fill="url(#faceTop)"
              stroke="#a06830"
              strokeWidth="1"
              filter="url(#boxShadow)"
            />

            {/* ── Cara IZQUIERDA (frente) ── */}
            <polygon
              points="60,70  140,105  140,165  60,130"
              fill="url(#faceLeft)"
              stroke="#8a5820"
              strokeWidth="1"
            />

            {/* ── Cara DERECHA (lateral) ── */}
            <polygon
              points="140,105  280,65  280,125  140,165"
              fill="url(#faceRight)"
              stroke="#9a6828"
              strokeWidth="1"
            />

            {/* ── Línea central de la tapa (abertura) ── */}
            <line x1="60" y1="70" x2="280" y2="65"  stroke="#a06830" strokeWidth="1.5" strokeDasharray="0"/>
            <line x1="140" y1="105" x2="140" y2="30" stroke="#a06830" strokeWidth="1" strokeOpacity="0.4"/>

            {/* ── CINTA adhesiva — cara superior ── */}
            {/* franja horizontal en la tapa */}
            <polygon
              points="60,84   200,44   214,50   74,90"
              fill="#1B2B6B"
              opacity="0.55"
            />
            {/* franja vertical en la tapa */}
            <polygon
              points="164,30  178,34  158,108  144,104"
              fill="#1B2B6B"
              opacity="0.45"
            />

            {/* ── CINTA — cara izquierda (frente) ── */}
            <rect x="60" y="100" width="80" height="9" fill="#1B2B6B" opacity="0.35" transform="skewY(25)"/>
            <line x1="99" y1="105" x2="99" y2="165" stroke="#1B2B6B" strokeWidth="8" strokeOpacity="0.30"
                  transform="skewX(-5)"/>

            {/* ── CINTA — cara derecha (lateral) ── */}
            <line x1="207" y1="80" x2="207" y2="148" stroke="#1B2B6B" strokeWidth="7" strokeOpacity="0.25"/>

            {/* ── Bordes oscuros para definición ── */}
            <line x1="60"  y1="70"  x2="60"  y2="130" stroke="#7a4818" strokeWidth="1.5"/>
            <line x1="280" y1="65"  x2="280" y2="125" stroke="#7a4818" strokeWidth="1.5"/>
            <line x1="60"  y1="130" x2="140" y2="165" stroke="#7a4818" strokeWidth="1.5"/>
            <line x1="140" y1="165" x2="280" y2="125" stroke="#7a4818" strokeWidth="1.5"/>

            {/* ── Etiquetas de dimensiones ── */}
            {/* Alto — flecha derecha */}
            <line x1="294" y1="65" x2="294" y2="125" stroke="#555" strokeWidth="1.5" markerEnd="url(#arr)"/>
            <line x1="280" y1="65"  x2="297" y2="65"  stroke="#555" strokeWidth="1"/>
            <line x1="280" y1="125" x2="297" y2="125" stroke="#555" strokeWidth="1"/>
            <text x="300" y="100" fontSize="13" fill="#444" fontWeight="700" fontFamily="sans-serif">Alto</text>

            {/* Largo — flecha inferior izquierda */}
            <line x1="35" y1="70" x2="35" y2="130" stroke="#555" strokeWidth="1.5"/>
            <line x1="35" y1="70"  x2="62" y2="70"  stroke="#555" strokeWidth="1"/>
            <line x1="35" y1="130" x2="62" y2="130" stroke="#555" strokeWidth="1"/>
            <text x="3" y="103" fontSize="13" fill="#444" fontWeight="700" fontFamily="sans-serif">Largo</text>

            {/* Ancho — flecha inferior */}
            <line x1="140" y1="177" x2="280" y2="137" stroke="#555" strokeWidth="1.5"/>
            <line x1="140" y1="165" x2="140" y2="180" stroke="#555" strokeWidth="1"/>
            <line x1="280" y1="125" x2="280" y2="140" stroke="#555" strokeWidth="1"/>
            <text x="185" y="190" fontSize="13" fill="#444" fontWeight="700" fontFamily="sans-serif">Ancho</text>
          </svg>
        </div>
      )}

      {/* ── Fila 1: Largo | Ancho | Alto ── */}
      <div className="pkg-form__dims-row">
        <div className="wizard-field">
          <label>Largo (cm)</label>
          <input
            type="number"
            placeholder="e.g., 30"
            value={pkg.largo}
            min="0"
            onChange={(e) => set('largo', e.target.value)}
            className={errors?.largo ? 'field-error' : ''}
          />
          {errors?.largo && <span className="field-error-msg">{errors.largo}</span>}
        </div>

        <div className="wizard-field">
          <label>Ancho (cm)</label>
          <input
            type="number"
            placeholder="e.g., 30"
            value={pkg.ancho}
            min="0"
            onChange={(e) => set('ancho', e.target.value)}
            className={errors?.ancho ? 'field-error' : ''}
          />
          {errors?.ancho && <span className="field-error-msg">{errors.ancho}</span>}
        </div>

        <div className="wizard-field">
          <label>Alto (cm)</label>
          <input
            type="number"
            placeholder="e.g., 30"
            value={pkg.alto}
            min="0"
            onChange={(e) => set('alto', e.target.value)}
            className={errors?.alto ? 'field-error' : ''}
          />
          {errors?.alto && <span className="field-error-msg">{errors.alto}</span>}
        </div>
      </div>

      {/* ── Fila 2: Peso | Tipo de Paquete ── */}
      <div className="pkg-form__meta-row">
        {/* Peso */}
        <div className="wizard-field">
          <label>Peso</label>
          <div className="pkg-form__peso-wrap">
            <input
              type="number"
              placeholder="0.0"
              value={pkg.peso}
              min="0"
              step="0.1"
              onChange={(e) => set('peso', e.target.value)}
              className={errors?.peso ? 'field-error' : ''}
            />
            <select
              value={pkg.unidadPeso}
              onChange={(e) => set('unidadPeso', e.target.value)}
              className="pkg-form__unit-select"
            >
              {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          {errors?.peso && <span className="field-error-msg">{errors.peso}</span>}
        </div>

        {/* Tipo de Paquete */}
        <div className="wizard-field pkg-form__tipo-field">
          <label>Tipo de Paquete</label>
          <div className="pkg-form__type-wrapper">
            <button
              type="button"
              className="pkg-form__type-btn"
              onClick={() => setShowTypeDropdown((v) => !v)}
            >
              {pkg.tipoPaquete}
              <span className="pkg-form__type-arrow">{showTypeDropdown ? '▲' : '▼'}</span>
            </button>
            {showTypeDropdown && (
              <div className="pkg-form__type-dropdown">
                {PACKAGE_TYPES.map((t) => (
                  <button
                    key={t}
                    className={`pkg-form__type-option ${pkg.tipoPaquete === t ? 'active' : ''}`}
                    onClick={() => { set('tipoPaquete', t); setShowTypeDropdown(false); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Valor FOB */}
      <div className="wizard-grid-2" style={{ marginBottom: '1rem' }}>
        <div className="wizard-field">
          <label>
            Valor FOB (USD)
            <button
              type="button"
              className="pkg-form__tooltip-trigger"
              onMouseEnter={() => setShowFOBTooltip(true)}
              onMouseLeave={() => setShowFOBTooltip(false)}
            >
              ⓘ
            </button>
            {showFOBTooltip && (
              <span className="pkg-form__tooltip">
                Valor FOB es el valor de la mercancía en puerto de origen, sin incluir flete ni seguro.
              </span>
            )}
          </label>
          <div className="pkg-form__fob-wrap">
            <span className="pkg-form__fob-prefix">$</span>
            <input
              type="number"
              placeholder="e.g., 100.00"
              value={pkg.valorFOB}
              min="0"
              step="0.01"
              onChange={(e) => set('valorFOB', e.target.value)}
              className={errors?.valorFOB ? 'field-error' : ''}
            />
          </div>
          {errors?.valorFOB && <span className="field-error-msg">{errors.valorFOB}</span>}
        </div>
      </div>

      {/* Descripción del contenido */}
      <div className="wizard-field">
        <label>Descripción del Contenido</label>
        <textarea
          placeholder="Descripción detallada del contenido"
          value={pkg.descripcion}
          onChange={(e) => set('descripcion', e.target.value)}
          className={errors?.descripcion ? 'field-error' : ''}
          rows={3}
        />
        {errors?.descripcion && <span className="field-error-msg">{errors.descripcion}</span>}
      </div>
    </div>
  );
};

// ── Componente principal del paso 1 ─────────────────────────────────────────
const Step1PackageDetails = ({ data, updateData, onNext }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  // Mutaciones en el array de paquetes
  const handleChange = (id, field, value) => {
    updateData({
      packages: data.packages.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
    // Limpia el error del campo tocado
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[`${id}.${field}`];
      return copy;
    });
  };

  const handleAdd = () => {
    updateData({ packages: [...data.packages, newPackage()] });
  };

  const handleRemove = (id) => {
    if (data.packages.length === 1) return;
    updateData({ packages: data.packages.filter((p) => p.id !== id) });
  };

  // Validación antes de avanzar
  const handleNext = () => {
    const allErrors = {};
    let hasError = false;

    data.packages.forEach((pkg) => {
      const errs = validatePackage(pkg);
      if (Object.keys(errs).length > 0) {
        Object.entries(errs).forEach(([k, v]) => {
          allErrors[`${pkg.id}.${k}`] = v;
        });
        hasError = true;
      }
    });

    if (hasError) {
      setFieldErrors(allErrors);
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="wizard-card">
        <h2 className="wizard-card__title">📦 Detalles del Envío</h2>

        {data.packages.map((pkg, idx) => (
          <React.Fragment key={pkg.id}>
            {idx > 0 && <div className="wizard-divider" />}
            <PackageForm
              pkg={pkg}
              index={idx}
              total={data.packages.length}
              onChange={handleChange}
              onRemove={handleRemove}
              errors={
                Object.fromEntries(
                  Object.entries(fieldErrors)
                    .filter(([k]) => k.startsWith(`${pkg.id}.`))
                    .map(([k, v]) => [k.split('.')[1], v])
                )
              }
            />
          </React.Fragment>
        ))}
      </div>

      {/* Acciones */}
      <div className="step1-footer">
        <button className="btn-add-box" onClick={handleAdd}>
          + Añadir otra caja
        </button>

        <div className="wizard-actions">
          <button className="btn-wizard-next" onClick={handleNext}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1PackageDetails;