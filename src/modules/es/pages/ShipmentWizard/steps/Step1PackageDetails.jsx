// src/modules/es/pages/ShipmentWizard/steps/Step1PackageDetails.jsx
// Paso 1: Detalles del envío — dimensiones, peso, tipo, FOB, descripción
// Soporta múltiples cajas (paquetes)

import React, { useEffect, useRef, useState } from 'react';
import { IoCubeOutline } from 'react-icons/io5';
import './Step1PackageDetails.scss';
import axiosInstance from '../../../../../services/axiosInstance';



// ── Opciones de tipo de paquete ──────────────────────────────────────────────
const PACKAGE_TYPES = ['Caja', 'Sobre'];
const WEIGHT_UNITS  = ['kg'];

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
  contenidos: [],
});

// ── Validación de un paquete ─────────────────────────────────────────────────
const validatePackage = (pkg) => {
  const errors = {};
  if (!pkg.largo  || isNaN(pkg.largo)  || Number(pkg.largo)  <= 0) errors.largo  = 'Requerido';
  if (!pkg.ancho  || isNaN(pkg.ancho)  || Number(pkg.ancho)  <= 0) errors.ancho  = 'Requerido';
  if (!pkg.alto   || isNaN(pkg.alto)   || Number(pkg.alto)   <= 0) errors.alto   = 'Requerido';
  if (!pkg.peso   || isNaN(pkg.peso)   || Number(pkg.peso)   <= 0) errors.peso   = 'Requerido';
  if (!pkg.valorFOB || isNaN(pkg.valorFOB) || Number(pkg.valorFOB) < 0) errors.valorFOB = 'Requerido';
  if (!pkg.contenidos?.length) errors.contenidos = 'Selecciona al menos un contenido';
  return errors;
};

// ── Selector de contenidos ────────────────────────────────────────────────────
const ContenidoSelector = ({ selected, onChange }) => {
  const [opciones, setOpciones] = useState([]);
  const [abierto, setAbierto]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const ref = useRef(null); // ✅

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
    ? 'Seleccionar contenidos'
    : `${selected.length} seleccionado${selected.length > 1 ? 's' : ''}`;

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
            ? <p className="contenido-selector__loading">Cargando...</p>
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

// ── Componente de una caja individual ───────────────────────────────────────
const PackageForm = ({ pkg, index, total, onChange, onRemove, errors }) => {
  const [showFOBTooltip, setShowFOBTooltip] = useState(false);

  const set = (field, value) => onChange(pkg.id, field, value);

  return (
    <div className="pkg-form">
      {/* Cabecera de la caja — solo visible cuando hay múltiples cajas */}
      {total > 1 && (
        <div className="pkg-form__header">
          <span className="pkg-form__title">
            <IoCubeOutline size={16} style={{ verticalAlign: 'middle' }} /> Caja {index + 1} de {total}
          </span>
          <button className="pkg-form__remove" onClick={() => onRemove(pkg.id)} title="Eliminar caja">
            ✕
          </button>
        </div>
      )}

      {/* ── Tipo de paquete — toggle Caja / Sobre (arriba de la ilustración) ── */}
      <div className="wizard-field" style={{ marginBottom: '1rem' }}>
        <label>Tipo de Paquete</label>
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

      {/* ── Ilustración de la caja (solo en la primera) ── */}
      {index === 0 && (
        <div className="pkg-form__illustration">
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

      {/* ── Fila 2: Peso | Valor FOB — en la misma fila ── */}
      <div className="wizard-grid-2" style={{ marginBottom: '1rem' }}>
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

        {/* Valor FOB */}
        <div className="wizard-field">
          <label>
            Valor (FOB) USD
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
        <ContenidoSelector
          selected={pkg.contenidos ?? []}
          onChange={(items) => {
            onChange(pkg.id, '__contenidos__', items);
          }}
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