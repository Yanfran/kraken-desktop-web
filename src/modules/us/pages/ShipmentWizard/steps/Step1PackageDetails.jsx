// src/modules/es/pages/ShipmentWizard/steps/Step1PackageDetails.jsx
// Paso 1: Detalles del envío — dimensiones, peso, tipo, FOB, descripción
// Soporta múltiples cajas (paquetes)

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoCubeOutline } from 'react-icons/io5';
import './Step1PackageDetails.scss';
import axiosInstance from '../../../../../services/axiosInstance';



// ── Opciones de tipo de paquete ──────────────────────────────────────────────
const PACKAGE_TYPES = ['Caja', 'Documento'];
const WEIGHT_UNITS  = ['lb'];

// ── Paquete vacío generador ──────────────────────────────────────────────────
const newPackage = () => ({
  id: Date.now() + Math.random(),
  largo: '',
  ancho: '',
  alto: '',
  peso: '',
  unidadPeso: 'lb',
  tipoPaquete: 'Caja',
  valorFOB: '',
  descripcion: '',
  contenidos: [],
});

// ── Validación de un paquete ─────────────────────────────────────────────────
const buildValidationErrors = (pkg, t) => {
  const errors = {};
  const isDoc = pkg.tipoPaquete === 'Documento';
  if (!isDoc) {
    if (!pkg.largo  || isNaN(pkg.largo)  || Number(pkg.largo)  <= 0) errors.largo  = t('us_wizard.required');
    if (!pkg.ancho  || isNaN(pkg.ancho)  || Number(pkg.ancho)  <= 0) errors.ancho  = t('us_wizard.required');
    if (!pkg.alto   || isNaN(pkg.alto)   || Number(pkg.alto)   <= 0) errors.alto   = t('us_wizard.required');
    if (!pkg.contenidos?.length) errors.contenidos = t('us_wizard.required');
  }
  if (!pkg.peso   || isNaN(pkg.peso)   || Number(pkg.peso)   <= 0) errors.peso   = t('us_wizard.required');
  if (!pkg.valorFOB || isNaN(pkg.valorFOB) || Number(pkg.valorFOB) < 0) errors.valorFOB = t('us_wizard.required');
  return errors;
};

// ── Selector de contenidos ────────────────────────────────────────────────────
const ContenidoSelector = ({ selected, onChange }) => {
  const { t } = useTranslation();
  const [opciones, setOpciones] = useState([]);
  const [abierto, setAbierto]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    axiosInstance.get('/PaqueteContenidos/getContent')
      .then(res => setOpciones(res.data?.data ?? []))
      .catch(() => setOpciones([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Cierra al hacer click fuera
  useEffect(() => {
    if (!abierto) return; // solo escucha cuando está abierto
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]); // ← depende de abierto

  const toggle = (item) => {
    const existe = selected.find(s => s.id === item.id);
    onChange(existe
      ? selected.filter(s => s.id !== item.id)
      : [...selected, item]
    );
  };

  const label = selected.length === 0
    ? t('us_wizard.select_contents')
    : t('us_wizard.content_selected_n', { count: selected.length });

  return (
    <div className="contenido-selector" ref={ref}> {/* ✅ ref conectado */}
      <button
        type="button"
        className={`contenido-selector__trigger ${abierto ? 'contenido-selector__trigger--open' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); setAbierto(v => !v); }}
      >
        <span>{label}</span>
        <span>{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="contenido-selector__dropdown">
          {loading
            ? <p className="contenido-selector__loading">{t('common.loading')}</p>
            : opciones.map(op => {
                const activo = !!selected.find(s => s.id === op.id);
                return (
                  <div
                    key={op.id}
                    className={`contenido-selector__option ${activo ? 'contenido-selector__option--active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); toggle(op); }}
                  >
                    <span>{op.contenido}</span>
                    {activo && <span className="contenido-selector__check">✓</span>}
                  </div>
                );
              })
          }
        </div>
      )}

      {selected.length > 0 && (
        <div className="contenido-selector__tags">
          {selected.map(s => (
            <span key={s.id} className="contenido-selector__tag">
              {s.contenido}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); toggle(s); }}
              >×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Ilustración SVG de documento/sobre ──────────────────────────────────────
const DocumentIllustration = () => (
  <svg viewBox="0 0 340 180" className="pkg-form__box-svg" aria-hidden="true" fill="none">
    <ellipse cx="170" cy="162" rx="100" ry="8" fill="#CBD5E1" opacity="0.5"/>
    <path d="M52 68 L288 68 L288 148 L52 148 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2"/>
    <path d="M52 68 L170 28 L288 68 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M52 68 L170 108 L288 68" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 3"/>
    <path d="M52 68 L52 148 L170 108 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5"/>
    <path d="M288 68 L288 148 L170 108 Z" fill="#E8EFF6" stroke="#94A3B8" strokeWidth="1.5"/>
    <line x1="110" y1="95" x2="230" y2="95" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
    <line x1="110" y1="108" x2="230" y2="108" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
    <line x1="110" y1="121" x2="190" y2="121" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
    <rect x="228" y="72" width="38" height="26" rx="4" fill="#FFF7F5" stroke="#F05A22" strokeWidth="1.5"/>
    <rect x="233" y="77" width="28" height="16" rx="2" fill="#F05A22" opacity="0.15"/>
    <line x1="235" y1="82" x2="259" y2="82" stroke="#F05A22" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="235" y1="87" x2="255" y2="87" stroke="#F05A22" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="170" y1="154" x2="170" y2="163" stroke="#64748B" strokeWidth="1.2"/>
    <text x="170" y="176" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#64748B" letterSpacing="0.5">PESO (lb)</text>
    <line x1="52" y1="156" x2="288" y2="156" stroke="#94A3B8" strokeWidth="1.2"/>
    <line x1="52" y1="152" x2="52" y2="160" stroke="#94A3B8" strokeWidth="1.2"/>
    <line x1="288" y1="152" x2="288" y2="160" stroke="#94A3B8" strokeWidth="1.2"/>
  </svg>
);

// ── Componente de una caja individual ───────────────────────────────────────
const PackageForm = ({ pkg, index, total, onChange, onRemove, errors }) => {
  const { t } = useTranslation();
  const [showFOBTooltip, setShowFOBTooltip] = useState(false);
  const isDoc = pkg.tipoPaquete === 'Documento';

  const set = (field, value) => onChange(pkg.id, field, value);

  return (
    <div className="pkg-form">
      {/* Cabecera de la caja — solo visible cuando hay múltiples cajas */}
      {total > 1 && (
        <div className="pkg-form__header">
          <span className="pkg-form__title">
            <IoCubeOutline size={16} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.box_n', { index: index + 1, total })}
          </span>
          <button className="pkg-form__remove" onClick={() => onRemove(pkg.id)} title="Eliminar caja">
            ✕
          </button>
        </div>
      )}

      {/* ── Tipo de paquete — toggle Caja / Documento (arriba de la ilustración) ── */}
      <div className="wizard-field" style={{ marginBottom: '1rem' }}>
        <label>{t('us_wizard.field_package_type')}</label>
        <div className="pkg-form__type-toggle">
          {PACKAGE_TYPES.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`pkg-form__type-toggle-btn${pkg.tipoPaquete === tipo ? ' pkg-form__type-toggle-btn--active' : ''}`}
              onClick={() => set('tipoPaquete', tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ilustración (solo en la primera) ── */}
      {index === 0 && (
        <div className="pkg-form__illustration">
          {isDoc ? (
            <DocumentIllustration />
          ) : (
            <svg viewBox="0 0 340 200" className="pkg-form__box-svg" aria-hidden="true">
              <defs>
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
                <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#00000022"/>
                </filter>
              </defs>
              <polygon points="60,70  200,30  280,65  140,105" fill="url(#faceTop)" stroke="#a06830" strokeWidth="1" filter="url(#boxShadow)"/>
              <polygon points="60,70  140,105  140,165  60,130" fill="url(#faceLeft)" stroke="#8a5820" strokeWidth="1"/>
              <polygon points="140,105  280,65  280,125  140,165" fill="url(#faceRight)" stroke="#9a6828" strokeWidth="1"/>
              <line x1="60" y1="70" x2="280" y2="65" stroke="#a06830" strokeWidth="1.5"/>
              <line x1="140" y1="105" x2="140" y2="30" stroke="#a06830" strokeWidth="1" strokeOpacity="0.4"/>
              <polygon points="60,84   200,44   214,50   74,90" fill="#1B2B6B" opacity="0.55"/>
              <polygon points="164,30  178,34  158,108  144,104" fill="#1B2B6B" opacity="0.45"/>
              <rect x="60" y="100" width="80" height="9" fill="#1B2B6B" opacity="0.35" transform="skewY(25)"/>
              <line x1="99" y1="105" x2="99" y2="165" stroke="#1B2B6B" strokeWidth="8" strokeOpacity="0.30" transform="skewX(-5)"/>
              <line x1="207" y1="80" x2="207" y2="148" stroke="#1B2B6B" strokeWidth="7" strokeOpacity="0.25"/>
              <line x1="60"  y1="70"  x2="60"  y2="130" stroke="#7a4818" strokeWidth="1.5"/>
              <line x1="280" y1="65"  x2="280" y2="125" stroke="#7a4818" strokeWidth="1.5"/>
              <line x1="60"  y1="130" x2="140" y2="165" stroke="#7a4818" strokeWidth="1.5"/>
              <line x1="140" y1="165" x2="280" y2="125" stroke="#7a4818" strokeWidth="1.5"/>
              <line x1="294" y1="65" x2="294" y2="125" stroke="#555" strokeWidth="1.5"/>
              <line x1="280" y1="65"  x2="297" y2="65"  stroke="#555" strokeWidth="1"/>
              <line x1="280" y1="125" x2="297" y2="125" stroke="#555" strokeWidth="1"/>
              <text x="300" y="100" fontSize="13" fill="#444" fontWeight="700" fontFamily="sans-serif">{t('us_wizard.svg_alto')}</text>
              <line x1="35" y1="70" x2="35" y2="130" stroke="#555" strokeWidth="1.5"/>
              <line x1="35" y1="70"  x2="62" y2="70"  stroke="#555" strokeWidth="1"/>
              <line x1="35" y1="130" x2="62" y2="130" stroke="#555" strokeWidth="1"/>
              <text x="3" y="103" fontSize="13" fill="#444" fontWeight="700" fontFamily="sans-serif">{t('us_wizard.svg_largo')}</text>
              <line x1="140" y1="177" x2="280" y2="137" stroke="#555" strokeWidth="1.5"/>
              <line x1="140" y1="165" x2="140" y2="180" stroke="#555" strokeWidth="1"/>
              <line x1="280" y1="125" x2="280" y2="140" stroke="#555" strokeWidth="1"/>
              <text x="185" y="190" fontSize="13" fill="#444" fontWeight="700" fontFamily="sans-serif">{t('us_wizard.svg_ancho')}</text>
            </svg>
          )}
        </div>
      )}

      {/* ── Fila 1: Largo | Ancho | Alto — solo para Caja ── */}
      {!isDoc && (
        <div className="pkg-form__dims-row">
          <div className="wizard-field">
            <label>{t('us_wizard.field_largo')}</label>
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
            <label>{t('us_wizard.field_ancho')}</label>
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
            <label>{t('us_wizard.field_alto')}</label>
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
      )}

      {/* ── Fila 2: Peso (+ unidad) ── */}
      <div className="pkg-form__meta-row" style={{ gridTemplateColumns: isDoc ? '1fr' : undefined }}>
        <div className="wizard-field">
          <label>{t('us_wizard.field_peso')}</label>
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
      </div>

      {/* Valor FOB */}
      <div className="wizard-grid-2" style={{ marginBottom: '1rem' }}>
        <div className="wizard-field">
          <label>
            {t('us_wizard.field_fob')}
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
                {t('us_wizard.fob_tooltip')}
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

      {/* Descripción del contenido — solo para Caja */}
      {!isDoc && (
        <div className="wizard-field">
          <label>{t('us_wizard.field_content_desc')}</label>
          <ContenidoSelector
            selected={pkg.contenidos ?? []}
            onChange={(items) => {
              onChange(pkg.id, '__contenidos__', items);
            }}
          />
          {errors?.descripcion && <span className="field-error-msg">{errors.descripcion}</span>}
        </div>
      )}
    </div>
  );
};

// ── Componente principal del paso 1 ─────────────────────────────────────────
const Step1PackageDetails = ({ data, updateData, onNext }) => {
  const { t } = useTranslation();
  const [fieldErrors, setFieldErrors] = useState({});

  // Mutaciones en el array de paquetes
  const handleChange = (id, field, value) => {
    updateData({
      packages: data.packages.map((p) => {
        if (p.id !== id) return p;

        // ── Caso especial: actualizar contenidos + descripcion juntos ──
        if (field === '__contenidos__') {
          return {
            ...p,
            contenidos:  value,
            descripcion: value.map(i => i.contenido).join(', '),
          };
        }

        return { ...p, [field]: value };
      }),
    });

    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[`${id}.${field}`];
      delete copy[`${id}.contenidos`];
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
      const errs = buildValidationErrors(pkg, t);
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
        <h2 className="wizard-card__title"><IoCubeOutline size={22} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.step1_title')}</h2>

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
        {/* <button className="btn-add-box" disabled onClick={handleAdd}>
          + Añadir otra caja
        </button> */}

        <div className="wizard-actions">
          <button className="btn-wizard-next" onClick={handleNext}>
            {t('us_wizard.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1PackageDetails;