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
  const [opciones, setOpciones]   = useState([]);
  const [abierto, setAbierto]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [abreArriba, setAbreArriba] = useState(false);
  const ref       = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    axiosInstance.get('/PaqueteContenidos/getContent')
      .then(res => setOpciones(res.data?.data ?? []))
      .catch(() => setOpciones([]))
      .finally(() => setLoading(false));
  }, []);

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!abierto) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
        setBusqueda('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]);

  // Auto-foco y detección de espacio disponible al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Detecta si hay espacio suficiente hacia abajo; si no, abre hacia arriba
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const espacioAbajo = window.innerHeight - rect.bottom;
        setAbreArriba(espacioAbajo < 320);
      }
    }
  }, [abierto]);

  const toggle = (item) => {
    const existe = selected.find(s => s.id === item.id);
    onChange(existe
      ? selected.filter(s => s.id !== item.id)
      : [...selected, item]
    );
  };

  const opcionesFiltradas = busqueda.trim()
    ? opciones.filter(op => op.contenido.toLowerCase().includes(busqueda.toLowerCase()))
    : opciones;

  const label = selected.length === 0
    ? t('us_wizard.select_contents')
    : t('us_wizard.content_selected_n', { count: selected.length });

  return (
    <div className="contenido-selector" ref={ref}>
      <button
        type="button"
        className={`contenido-selector__trigger ${abierto ? 'contenido-selector__trigger--open' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); setAbierto(v => !v); }}
      >
        <span>{label}</span>
        <span>{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className={`contenido-selector__dropdown${abreArriba ? ' contenido-selector__dropdown--up' : ''}`}>
          {/* Buscador */}
          <div className="contenido-selector__search-wrap">
            <input
              ref={inputRef}
              type="text"
              className="contenido-selector__search"
              placeholder="Buscar contenido..."
              value={busqueda}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="contenido-selector__options-list">
            {loading
              ? <p className="contenido-selector__loading">{t('common.loading')}</p>
              : opcionesFiltradas.length === 0
                ? <p className="contenido-selector__loading">Sin resultados</p>
                : opcionesFiltradas.map(op => {
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
  const [showFOBTooltip,       setShowFOBTooltip]       = useState(false);
  const [showPesoTooltip,      setShowPesoTooltip]      = useState(false);
  const [showContenidoTooltip, setShowContenidoTooltip] = useState(false);
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
            <svg viewBox="0 0 860 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="pkgBoxTitle pkgBoxDesc" className="pkg-form__box-svg">
              <title id="pkgBoxTitle">Dimensiones del paquete</title>
              <desc id="pkgBoxDesc">Caja con las cotas Alto, Ancho y Largo y su significado.</desc>
              <defs>
                <marker id="dimArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="#1E2A6E"/>
                </marker>
                <linearGradient id="gTop" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0" stopColor="#E4C085"/>
                  <stop offset="1" stopColor="#D4AB69"/>
                </linearGradient>
                <linearGradient id="gFront" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#D7AD6D"/>
                  <stop offset="1" stopColor="#C99A57"/>
                </linearGradient>
                <linearGradient id="gRight" x1="0" y1="0" x2="1" y2="0.4">
                  <stop offset="0" stopColor="#C0935A"/>
                  <stop offset="1" stopColor="#AB7F43"/>
                </linearGradient>
                <linearGradient id="gTape" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#F1E3C1"/>
                  <stop offset="1" stopColor="#E5D0A2"/>
                </linearGradient>
                <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6"/>
                </filter>
              </defs>
              <ellipse cx="255" cy="293" rx="132" ry="11" fill="#000000" opacity="0.09" filter="url(#soft)"/>
              <polygon points="150,125 295,125 373,71 228,71" fill="url(#gTop)"/>
              <polygon points="150,125 295,125 295,285 150,285" fill="url(#gFront)"/>
              <polygon points="295,125 373,71 373,231 295,285" fill="url(#gRight)"/>
              <polygon points="182,125 214,125 214,285 182,285" fill="url(#gTape)" opacity="0.55"/>
              <polygon points="182,125 214,125 292,71 260,71" fill="url(#gTape)" opacity="0.65"/>
              <line x1="198" y1="125" x2="198" y2="285" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.30"/>
              <line x1="198" y1="125" x2="276" y2="71" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.30"/>
              <path d="M150,285 L150,125 L228,71 L373,71 L373,231 L295,285 Z" fill="none" stroke="#96702F" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M150,125 L295,125 M295,125 L373,71 M295,125 L295,285" fill="none" stroke="#96702F" strokeWidth="1.8" strokeLinejoin="round"/>
              <line x1="151" y1="125" x2="294" y2="125" stroke="#F0DCAE" strokeWidth="1" opacity="0.5"/>
              <g stroke="#C7CCD6" strokeWidth="1.2">
                <line x1="150" y1="125" x2="120" y2="125"/>
                <line x1="150" y1="285" x2="120" y2="285"/>
                <line x1="150" y1="285" x2="150" y2="315"/>
                <line x1="295" y1="285" x2="295" y2="315"/>
                <line x1="295" y1="285" x2="309" y2="303"/>
                <line x1="373" y1="231" x2="387" y2="249"/>
              </g>
              <g stroke="#1E2A6E" strokeWidth="2" markerStart="url(#dimArrow)" markerEnd="url(#dimArrow)">
                <line x1="125" y1="125" x2="125" y2="285"/>
                <line x1="150" y1="312" x2="295" y2="312"/>
                <line x1="309" y1="303" x2="387" y2="249"/>
              </g>
              <g fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="13">
                <rect x="102" y="194" width="46" height="22" rx="11" fill="#FFFFFF" stroke="#1E2A6E" strokeWidth="1.5"/>
                <text x="125" y="209" textAnchor="middle" fill="#1E2A6E">Alto</text>
                <rect x="193" y="301" width="58" height="22" rx="11" fill="#FFFFFF" stroke="#1E2A6E" strokeWidth="1.5"/>
                <text x="222" y="316" textAnchor="middle" fill="#1E2A6E">Ancho</text>
                <rect x="321" y="265" width="54" height="22" rx="11" fill="#FFFFFF" stroke="#1E2A6E" strokeWidth="1.5"/>
                <text x="348" y="280" textAnchor="middle" fill="#1E2A6E">Largo</text>
              </g>
              <g stroke="#EAECF3" strokeWidth="1">
                <line x1="458" y1="155" x2="840" y2="155"/>
                <line x1="458" y1="245" x2="840" y2="245"/>
              </g>
              <g fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
                <circle cx="472" cy="110" r="22" fill="#E85D26"/>
                <g stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <line x1="472" y1="98" x2="472" y2="122"/>
                  <path d="M466,104 L472,98 L478,104"/>
                  <path d="M466,116 L472,122 L478,116"/>
                </g>
                <text x="508" y="105" fontSize="17" fontWeight="800" fill="#1E2A6E" letterSpacing="0.5">ALTO</text>
                <text x="508" y="126" fontSize="13.5" fill="#5A6273">Medida vertical desde la base</text>
                <text x="508" y="143" fontSize="13.5" fill="#5A6273">hasta la parte superior.</text>
                <circle cx="472" cy="200" r="22" fill="#E85D26"/>
                <g stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <line x1="460" y1="200" x2="484" y2="200"/>
                  <path d="M466,194 L460,200 L466,206"/>
                  <path d="M478,194 L484,200 L478,206"/>
                </g>
                <text x="508" y="195" fontSize="17" fontWeight="800" fill="#1E2A6E" letterSpacing="0.5">ANCHO</text>
                <text x="508" y="216" fontSize="13.5" fill="#5A6273">Medida horizontal de lado a lado</text>
                <text x="508" y="233" fontSize="13.5" fill="#5A6273">de la base.</text>
                <circle cx="472" cy="290" r="22" fill="#E85D26"/>
                <g stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <line x1="460" y1="302" x2="484" y2="278"/>
                  <path d="M476,278 L484,278 L484,286"/>
                  <path d="M468,302 L460,302 L460,294"/>
                </g>
                <text x="508" y="285" fontSize="17" fontWeight="800" fill="#1E2A6E" letterSpacing="0.5">LARGO</text>
                <text x="508" y="306" fontSize="13.5" fill="#5A6273">Medida horizontal desde el frente</text>
                <text x="508" y="323" fontSize="13.5" fill="#5A6273">hacia el fondo.</text>
              </g>
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
              placeholder="e.g., 12"
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
              placeholder="e.g., 12"
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
              placeholder="e.g., 12"
              value={pkg.alto}
              min="0"
              onChange={(e) => set('alto', e.target.value)}
              className={errors?.alto ? 'field-error' : ''}
            />
            {errors?.alto && <span className="field-error-msg">{errors.alto}</span>}
          </div>
        </div>
      )}

      {/* ── Fila: Peso (+ unidad) | Valor FOB — en la misma fila ── */}
      <div className="wizard-grid-2" style={{ marginBottom: '1rem' }}>
        {/* PESO */}
        <div className="wizard-field">
          <label style={{ position: 'relative' }}>
            {t('us_wizard.field_peso')}
            <button
              type="button"
              className="pkg-form__tooltip-trigger"
              onMouseEnter={() => setShowPesoTooltip(true)}
              onMouseLeave={() => setShowPesoTooltip(false)}
            >
              ⓘ
            </button>
            {showPesoTooltip && (
              <span className="pkg-form__tooltip">
                Ingresa el peso de tu paquete en libras (lb). El peso correcto determina el costo del envío.
              </span>
            )}
          </label>
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

        {/* VALOR FOB */}
        <div className="wizard-field">
          <label style={{ position: 'relative' }}>
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
          <label style={{ position: 'relative' }}>
            {t('us_wizard.field_content_desc')}
            <button
              type="button"
              className="pkg-form__tooltip-trigger"
              onMouseEnter={() => setShowContenidoTooltip(true)}
              onMouseLeave={() => setShowContenidoTooltip(false)}
            >
              ⓘ
            </button>
            {showContenidoTooltip && (
              <span className="pkg-form__tooltip">
                Puedes seleccionar más de un tipo de contenido para tu paquete.
              </span>
            )}
          </label>
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
const Step1PackageDetails = ({ data, updateData, onNext, onBack }) => {
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
          {onBack && (
            <button className="btn-wizard-back" onClick={onBack}>
              {t('us_wizard.back')}
            </button>
          )}
          <button className="btn-wizard-next" onClick={handleNext}>
            {t('us_wizard.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1PackageDetails;