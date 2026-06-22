// src/modules/es/pages/ShipmentWizard/steps/Step2Addresses.jsx
// ✅ Paso 2: Selección de dirección de ORIGEN (España) y DESTINO (Venezuela)
//    DestinationModal sigue la misma lógica que /profile/addresses de la app

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  IoCarOutline,
  IoStorefrontOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoStarOutline,
  IoStar,
  IoTrashOutline,
  IoCallOutline,
  IoCheckmarkOutline,
  IoLocationOutline,
  IoWarningOutline,
  IoHomeOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import {
  fetchOriginAddresses,
  deleteOriginAddress,
  setOriginDefault,
  fetchDestinationAddresses,
  addDestinationAddress,
  deleteDestinationAddress,
  setDestinationDefault,
  fetchDeliveryData,
  fetchVenezuelaStates,
  fetchMunicipios,
  fetchParroquias,
} from '../../../../../services/es/spainAddressService';
import { addUsaOriginAddress } from '../../../../../services/us/usAddressService';
import './Step2Addresses.scss';

// ── Franjas horarias de pickup ──────────────────────────────────────────────
const TIME_SLOTS = [
  { value: 'morning',   label: 'Mañana (08:00 – 12:00)',      readyTime: '0800', closeTime: '1200' },
  { value: 'afternoon', label: 'Tarde (12:00 – 17:00)',        readyTime: '1200', closeTime: '1700' },
  { value: 'allday',    label: 'Todo el día (08:00 – 17:00)',  readyTime: '0800', closeTime: '1700' },
];

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// ── Helper: clientId del usuario logueado ──────────────────────────────────
const getClientId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('userData') ?? '{}');
    const raw = user?.id ?? user?.ID ?? null;
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
};

// ── Helper: solo permite caracteres válidos de teléfono ─────────────────────
const sanitizePhone = (v) => v.replace(/[^\d\s+\-()]/g, '');

// ── Formatos de teléfono ─────────────────────────────────────────────────────
const formatUSAPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};
const formatVenezPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 7);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};

// ── Operadoras Venezuela ──────────────────────────────────────────────────────
const VENEZ_OPERATORS = ['0412', '0414', '0416', '0422', '0424', '0426'];

// ── Tipos de documento por país (valores idénticos a la app móvil) ────────────
const DOC_TYPES = {
  VE: [
    { value: 'cedulavenezolana', label: 'Cédula Venezolana (V-)' },
    { value: 'cedulaextranjera', label: 'Cédula Extranjera (E-)' },
    { value: 'pasaporte',        label: 'Pasaporte' },
    { value: 'rifjuridico',      label: 'RIF Jurídico (J-)' },
    { value: 'rifgubernamental', label: 'RIF Gubernamental (G-)' },
    { value: 'rifcomuna',        label: 'RIF Comuna (C-)' },
    { value: 'riffirmapersonal', label: 'RIF Firma Personal (R-)' },
  ],
  US: [
    { value: 'pasaporte',      label: 'Passport' },
    { value: 'driverslicense', label: "Driver's License" },
  ],
};

// ── Reglas de validación por tipo (igual que countryConfig.ts de la app) ──────
const DOC_CONFIG = {
  cedulavenezolana: { pattern: /^[0-9]+$/,           min: 4,  max: 9,  hint: '4–9 dígitos numéricos' },
  cedulaextranjera: { pattern: /^[A-Za-z0-9]+$/,     min: 4,  max: 12, hint: '4–12 caracteres alfanuméricos' },
  pasaporte:        { pattern: /^[A-Za-z0-9]+$/,     min: 6,  max: 15, hint: '6–15 caracteres alfanuméricos' },
  rifjuridico:      { pattern: /^[A-Za-z0-9\-]+$/,   min: 6,  max: 12, hint: '6–12 caracteres (ej: 12345678-9)' },
  rifgubernamental: { pattern: /^[A-Za-z0-9\-]+$/,   min: 6,  max: 12, hint: '6–12 caracteres' },
  rifcomuna:        { pattern: /^[A-Za-z0-9\-]+$/,   min: 6,  max: 12, hint: '6–12 caracteres' },
  riffirmapersonal: { pattern: /^[A-Za-z0-9\-]+$/,   min: 6,  max: 12, hint: '6–12 caracteres' },
  driverslicense:   { pattern: /^[A-Za-z0-9]+$/,     min: 5,  max: 20, hint: '5–20 caracteres alfanuméricos' },
};

// ── Prefijo que precede al número en el string final (V-12345678) ─────────────
const DOC_PREFIX_MAP = {
  cedulavenezolana: 'V',
  cedulaextranjera: 'E',
  rifjuridico:      'J',
  rifgubernamental: 'G',
  rifcomuna:        'C',
  riffirmapersonal: 'R',
};

// ── ID de tipo de documento para la BD (igual que DOC_TYPE_DB_ID de la app) ──
const DOC_TYPE_DB_ID = {
  pasaporte:        1,
  rifjuridico:      2,
  cedulavenezolana: 3,
  driverslicense:   4,
  cedulaextranjera: 7,
  rifgubernamental: 8,
  rifcomuna:        9,
  riffirmapersonal: 10,
};

// ── Limpieza automática del input según tipo (misma lógica que la app) ────────
const cleanDocInput = (docType, text) => {
  const cfg = DOC_CONFIG[docType];
  if (!cfg) return text;
  if (/cedula/.test(docType)) return text.replace(/\D/g, '').slice(0, cfg.max);
  if (/rif/.test(docType))    return text.replace(/[^A-Za-z0-9\-]/g, '').slice(0, cfg.max);
  return text.replace(/[^A-Za-z0-9]/g, '').slice(0, cfg.max);
};

// ── Validar número de documento contra las reglas del tipo ────────────────────
const validateDocNum = (docType, docNum) => {
  const cfg = DOC_CONFIG[docType];
  if (!cfg) return null;
  const v = docNum.trim();
  if (v.length < cfg.min) return `Mínimo ${cfg.min} caracteres para este tipo.`;
  if (!cfg.pattern.test(v)) return 'Formato inválido para el tipo seleccionado.';
  return null;
};

// ── Sub-componente: selector de teléfono Venezuela (operadora + número) ───────
const VenezPhoneInput = ({ operator, number, onOperatorChange, onNumberChange, required, label, error }) => (
  <div className="wizard-field">
    <label>{label}{required ? ' *' : ''}</label>
    <div className="phone-ve-row">
      <select
        className={`phone-ve-operator${error ? ' input--error' : ''}`}
        value={operator}
        onChange={(e) => onOperatorChange(e.target.value)}
      >
        <option value="">Operadora</option>
        {VENEZ_OPERATORS.map((op) => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>
      <input
        className={`phone-ve-number${error ? ' input--error' : ''}`}
        placeholder="000-00-00"
        value={number}
        onChange={(e) => onNumberChange(formatVenezPhone(e.target.value))}
        inputMode="numeric"
        disabled={!operator}
      />
    </div>
    {error && <span className="field-error">{error}</span>}
  </div>
);

// ── Sub-componente: selector de identificación (país + tipo + número) ─────────
const DocIdentInput = ({ country, docType, docNum, onCountryChange, onTypeChange, onNumChange, errors = {} }) => {
  const cfg    = DOC_CONFIG[docType] ?? null;
  const prefix = DOC_PREFIX_MAP[docType] ?? null;
  return (
    <div className="wizard-field wizard-field--full">
      <label>Identificación *</label>
      <div className="doc-ident-row">
        <select
          className={`doc-country${errors.docCountry ? ' input--error' : ''}`}
          value={country}
          onChange={(e) => { onCountryChange(e.target.value); onTypeChange(''); }}
        >
          <option value="">País</option>
          <option value="VE">🇻🇪 Venezuela</option>
          <option value="US">🇺🇸 USA</option>
        </select>
        <select
          className={`doc-type${errors.docType ? ' input--error' : ''}`}
          value={docType}
          onChange={(e) => { onTypeChange(e.target.value); onNumChange(''); }}
          disabled={!country}
        >
          <option value="">Tipo</option>
          {(DOC_TYPES[country] ?? []).map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <div className={`doc-num-wrapper${errors.docNum ? ' doc-num-wrapper--error' : ''}`}>
          {prefix && <span className="doc-prefix">{prefix}-</span>}
          <input
            className="doc-num-input"
            placeholder={cfg ? cfg.hint : 'Número'}
            value={docNum}
            onChange={(e) => onNumChange(cleanDocInput(docType, e.target.value))}
            disabled={!docType}
            inputMode={/cedula/.test(docType) ? 'numeric' : 'text'}
          />
        </div>
      </div>
      {cfg && !errors.docNum && docType && (
        <span className="field-hint">{prefix ? `${prefix}-` : ''}{cfg.hint}</span>
      )}
      {(errors.docCountry || errors.docType || errors.docNum) && (
        <span className="field-error">{errors.docCountry || errors.docType || errors.docNum}</span>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// ██  TARJETA DE DIRECCIÓN
// ════════════════════════════════════════════════════════════════════════════
const AddressCard = ({ address, selected, onSelect, onDelete, onSetDefault, flag }) => {
  const { t } = useTranslation();
  return (
  <button
    type="button"
    className={`addr-card ${selected ? 'addr-card--selected' : ''}`}
    onClick={() => onSelect(address.id)}
  >
    {address.esPredeterminada && (
      <span className="addr-card__badge"><IoStar size={12} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.default_badge')}</span>
    )}
    {selected && <span className="addr-card__check"><IoCheckmarkOutline size={14} /></span>}

    <div className="addr-card__body">
      <p className="addr-card__alias">{flag} {address.alias}</p>
      <p className="addr-card__line">{address.line1}</p>
      {address.city && (
        <p className="addr-card__line">
          {address.city}{address.zip ? ` - ${address.zip}` : ''}
        </p>
      )}
      {address.phone && <p className="addr-card__phone"><IoCallOutline size={13} style={{ verticalAlign: 'middle' }} /> {address.phone}</p>}
      {address.tipoDireccion === 'store' && address.nombreLocker && (
        <p className="addr-card__line"><IoStorefrontOutline size={13} style={{ verticalAlign: 'middle' }} /> {address.nombreLocker}</p>
      )}
    </div>

    <div className="addr-card__actions" onClick={(e) => e.stopPropagation()}>
      {!address.esPredeterminada && (
        <button
          className="addr-card__action-btn addr-card__action-btn--star"
          title="Marcar como predeterminada"
          onClick={() => onSetDefault(address.id)}
        ><IoStarOutline size={16} /></button>
      )}
      <button
        className="addr-card__action-btn addr-card__action-btn--danger"
        title="Eliminar"
        onClick={() => onDelete(address.id)}
      ><IoTrashOutline size={16} /></button>
    </div>
  </button>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// ██  COLUMNA DE DIRECCIONES
// ════════════════════════════════════════════════════════════════════════════
const AddressColumn = ({
  title, flag, country, addresses, selectedId,
  onSelect, onAdd, onDelete, onSetDefault, loading,
}) => {
  const { t } = useTranslation();
  return (
  <div className="addr-col">
    <h3 className="addr-col__title">
      <span className="addr-col__flag">{flag}</span>
      {title} <span className="addr-col__country">({country})</span>
    </h3>

    {loading ? (
      <div className="addr-col__loading">
        <div className="spinner-small" />
        <span>{t('us_wizard.loading_addresses')}</span>
      </div>
    ) : (
      <div className="addr-col__grid">
        {addresses.length === 0 && (
          <p className="addr-col__empty">{t('us_wizard.no_addresses')}</p>
        )}
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            selected={addr.id === selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            flag={flag}
          />
        ))}
        {addresses.length < 4 ? (
          <button className="addr-add-btn" onClick={onAdd}>
            <span className="addr-add-btn__icon">+</span>
            <span>{t('us_wizard.add_address')}</span>
          </button>
        ) : (
          <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: '8px 0' }}>
            Máximo 4 direcciones alcanzado
          </p>
        )}
      </div>
    )}
  </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// ██  MODAL — ORIGEN (USA) 🇪🇸
// ════════════════════════════════════════════════════════════════════════════
const OriginModal = ({ onSave, onClose, saving }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    alias: '', line1: '', city: '', province: '',
    zip: '', phone: '', referencia: '', setAsDefault: false,
  });
  // Teléfono Venezuela (opcional)
  const [phoneVeOp, setPhoneVeOp] = useState('');
  const [phoneVeNum, setPhoneVeNum] = useState('');
  // Identificación
  const [docCountry, setDocCountry] = useState('');
  const [docType,    setDocType]    = useState('');
  const [docNum,     setDocNum]     = useState('');

  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.alias.trim()) e.alias = t('us_wizard.error_alias');
    if (!form.line1.trim()) e.line1 = t('us_wizard.error_address');
    if (!form.city.trim())  e.city  = t('us_wizard.error_city_req');
    // Teléfono USA — obligatorio para UPS (10 dígitos exactos)
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!phoneDigits) e.phone = 'El teléfono es obligatorio (requerido por UPS).';
    else if (phoneDigits.length !== 10) e.phone = 'Ingresa un teléfono USA de 10 dígitos. Ej: (305) 000-0000';
    // Teléfono Venezuela: si se escribió número, operadora es obligatoria
    if (phoneVeNum && !phoneVeOp) e.phoneVe = 'Selecciona la operadora del teléfono venezolano.';
    if (phoneVeOp && phoneVeNum.replace(/\D/g, '').length !== 7) e.phoneVe = 'El número venezolano debe tener 7 dígitos.';
    // Identificación: todos obligatorios si alguno se completa
    if (docCountry || docType || docNum) {
      if (!docCountry) e.docCountry = 'Selecciona el país.';
      if (!docType)    e.docType    = 'Selecciona el tipo de documento.';
      if (!docNum.trim()) {
        e.docNum = 'Ingresa el número de documento.';
      } else {
        const docErr = validateDocNum(docType, docNum);
        if (docErr) e.docNum = docErr;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const phoneVenez = phoneVeOp && phoneVeNum
      ? `+58 (${phoneVeOp}) ${phoneVeNum}`
      : null;
    const prefix = DOC_PREFIX_MAP[docType];
    const identificacion = docType && docNum.trim()
      ? (prefix ? `${prefix}-${docNum.trim()}` : docNum.trim())
      : null;
    onSave({
      ...form,
      alias: form.alias.trim(),
      line1: form.line1.trim(),
      city:  form.city.trim(),
      phoneVenez,
      identificacion,
      idClienteTipoIdentificacion: docType ? (DOC_TYPE_DB_ID[docType] ?? null) : null,
    });
  };

  return (
    <div className="addr-modal-backdrop" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="addr-modal__header">
          <h3>🇺🇸 {t('us_wizard.origin_modal_title')}</h3>
          <button className="addr-modal__close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="addr-modal__body">
          <div className="wizard-field">
            <label>{t('us_wizard.field_alias')} *</label>
            <input
              placeholder="Ej. Casa, Oficina..."
              value={form.alias}
              onChange={(e) => { set('alias', e.target.value); setErrors(p => ({ ...p, alias: '' })); }}
              className={errors.alias ? 'input--error' : ''}
            />
            {errors.alias && <span className="field-error">{errors.alias}</span>}
          </div>

          <div className="wizard-field">
            <label>{t('us_wizard.field_address')} *</label>
            <input
              placeholder="Calle de Alcalá 123, 2º A"
              value={form.line1}
              onChange={(e) => { set('line1', e.target.value); setErrors(p => ({ ...p, line1: '' })); }}
              className={errors.line1 ? 'input--error' : ''}
            />
            {errors.line1 && <span className="field-error">{errors.line1}</span>}
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>{t('us_wizard.field_city')} *</label>
              <input
                placeholder="Miami"
                value={form.city}
                onChange={(e) => { set('city', e.target.value); setErrors(p => ({ ...p, city: '' })); }}
                className={errors.city ? 'input--error' : ''}
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="wizard-field">
              <label>{t('us_wizard.field_province')}</label>
              <input placeholder="Florida" value={form.province} onChange={(e) => set('province', e.target.value)} />
            </div>
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>{t('us_wizard.field_zip')}</label>
              <input placeholder="33122" maxLength={5} value={form.zip}
                onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))} />
            </div>
            <div className="wizard-field">
              <label>Teléfono USA *</label>
              <input
                placeholder="(305) 000-0000"
                value={form.phone}
                onChange={(e) => { set('phone', formatUSAPhone(e.target.value)); setErrors(p => ({ ...p, phone: '' })); }}
                maxLength={14}
                inputMode="tel"
                className={errors.phone ? 'input--error' : ''}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="wizard-field">
            <label>{t('us_wizard.field_ref')} <span className="label-optional">({t('common.optional')})</span></label>
            <input placeholder="Portero automático #3, timbre azul..." value={form.referencia} onChange={(e) => set('referencia', e.target.value)} />
          </div>

          {/* Teléfono Venezuela (opcional) */}
          <VenezPhoneInput
            label="Teléfono Venezuela"
            operator={phoneVeOp}
            number={phoneVeNum}
            onOperatorChange={setPhoneVeOp}
            onNumberChange={setPhoneVeNum}
            required={false}
            error={errors.phoneVe}
          />

          {/* Identificación */}
          <DocIdentInput
            country={docCountry}
            docType={docType}
            docNum={docNum}
            onCountryChange={setDocCountry}
            onTypeChange={setDocType}
            onNumChange={setDocNum}
            errors={errors}
          />

          <label className="addr-modal__checkbox">
            <input type="checkbox" checked={form.setAsDefault} onChange={(e) => set('setAsDefault', e.target.checked)} />
            <span>{t('us_wizard.set_default_check')}</span>
          </label>
        </div>

        <div className="addr-modal__footer">
          <button className="btn-wizard-back" onClick={onClose} disabled={saving}>{t('common.cancel')}</button>
          <button className="btn-wizard-next" onClick={handleSave} disabled={saving}>
            {saving ? t('us_wizard.saving') : t('us_wizard.save_address')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// ██  MODAL — DESTINO (Venezuela) 🇻🇪
//     Lógica idéntica a /profile/addresses de la app
// ════════════════════════════════════════════════════════════════════════════
const DestinationModal = ({ onSave, onClose, saving }) => {
  const { t } = useTranslation();
  // ── Tipo de entrega ────────────────────────────────────────────────────────
  const [tipo, setTipo] = useState('home'); // 'store' | 'home'

  // ── Estado del formulario TIENDA ──────────────────────────────────────────
  const [storeForm, setStoreForm] = useState({ city: '', store: '' });

  // ── Estado del formulario DOMICILIO ───────────────────────────────────────
  const [homeForm, setHomeForm] = useState({
    alias:     '',
    idEstado:  '',
    idMunicipio: '',
    idParroquia: '',
    direccion:   '',
    referencia:  '',
    setAsDefault: false,
  });

  // ── Datos del contacto de entrega (compartido para home y store) ───────────
  const [contactoForm, setContactoForm] = useState({
    nombres: '', apellidos: '', email: '',
    informacionAdicional: '', referenciaContacto: '',
  });
  // Teléfonos Venezuela con operadora
  const [telOp,    setTelOp]    = useState('');
  const [telNum,   setTelNum]   = useState('');
  const [telAdOp,  setTelAdOp]  = useState('');
  const [telAdNum, setTelAdNum] = useState('');
  // Identificación del contacto
  const [cDocCountry, setCDocCountry] = useState('VE');
  const [cDocType,    setCDocType]    = useState('');
  const [cDocNum,     setCDocNum]     = useState('');

  const setContacto = (k, v) => setContactoForm((p) => ({ ...p, [k]: v }));

  // ── Datos GEO ──────────────────────────────────────────────────────────────
  const [ciudades,    setCiudades]    = useState([]);  // [{ id, name }]
  const [allTiendas,  setAllTiendas]  = useState([]);  // [{ id, nombre, idZonaCiudad, idEstado }]
  const [estados,     setEstados]     = useState([]);  // [{ id, name }]
  const [municipios,  setMunicipios]  = useState([]);  // [{ id, name }]
  const [parroquias,  setParroquias]  = useState([]);  // [{ id, name }]
  const [loadingGeo,  setLoadingGeo]  = useState(false);
  const [errors,      setErrors]      = useState({});

  const setStore = (k, v) => setStoreForm((p) => ({ ...p, [k]: v }));
  const setHome  = (k, v) => setHomeForm((p) => ({ ...p, [k]: v }));

  // ── Tiendas filtradas por ciudad (idZonaCiudad) ────────────────────────────
  // Mismo patrón que DeliveryOption.jsx → filteredStores
  const filteredTiendas = useMemo(() => {
    if (!allTiendas.length) return [];
    return allTiendas.filter((t) => {
      const tipoValido = t.idTiendaTipo === 2 || t.idTiendaTipo === 3 || t.idTiendaTipo === 8;
      const matchCiudad = storeForm.city
        ? t.idZonaCiudad === parseInt(storeForm.city)
        : true;
      return tipoValido && matchCiudad;
    });
  }, [allTiendas, storeForm.city]);

  // ── Cargar datos iniciales al montar ───────────────────────────────────────
  useEffect(() => {
    fetchDeliveryData().then(({ ciudades: c, tiendas: t }) => {
      setCiudades(c);
      setAllTiendas(t);
    });
    fetchVenezuelaStates().then(setEstados);
  }, []);

  // ── Limpiar tienda al cambiar ciudad ──────────────────────────────────────
  useEffect(() => {
    setStore('store', '');
  }, [storeForm.city]);

  // ── Cargar municipios al cambiar estado ───────────────────────────────────
  useEffect(() => {
    if (!homeForm.idEstado) {
      setMunicipios([]);
      setParroquias([]);
      setHome('idMunicipio', '');
      setHome('idParroquia', '');
      return;
    }
    setLoadingGeo(true);
    fetchMunicipios(homeForm.idEstado)
      .then(setMunicipios)
      .catch(() => toast.error(t('us_wizard.error_load_municipios')))
      .finally(() => setLoadingGeo(false));
    setHome('idMunicipio', '');
    setHome('idParroquia', '');
  }, [homeForm.idEstado]);

  // ── Cargar parroquias al cambiar municipio ────────────────────────────────
  useEffect(() => {
    if (!homeForm.idMunicipio) {
      setParroquias([]);
      setHome('idParroquia', '');
      return;
    }
    fetchParroquias(homeForm.idMunicipio)
      .then(setParroquias)
      .catch(() => toast.error(t('us_wizard.error_load_parroquias')));
    setHome('idParroquia', '');
  }, [homeForm.idMunicipio]);

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (tipo === 'store') {
      if (!storeForm.city)  e.city  = t('us_wizard.error_city_sel');
      if (!storeForm.store) e.store = t('us_wizard.error_store');
    } else {
      if (!homeForm.alias.trim())     e.alias       = t('us_wizard.error_address_name');
      if (!homeForm.idEstado)         e.idEstado    = t('us_wizard.error_state_sel');
      if (!homeForm.idMunicipio)      e.idMunicipio = t('us_wizard.error_municipio');
      if (!homeForm.idParroquia)      e.idParroquia = t('us_wizard.error_parroquia');
      if (!homeForm.direccion.trim()) e.direccion   = t('us_wizard.error_address');
    }
    if (!contactoForm.nombres.trim())  e.nombres  = t('us_wizard.error_first_name');
    // Teléfono principal Venezuela (obligatorio)
    if (!telOp) e.telefono = 'Selecciona la operadora del teléfono principal.';
    else if (telNum.replace(/\D/g, '').length !== 7) e.telefono = 'El número debe tener 7 dígitos.';
    // Teléfono adicional (opcional pero si se empieza a llenar, valida)
    if (telAdNum && !telAdOp) e.telefonoAdicional = 'Selecciona la operadora del teléfono adicional.';
    if (telAdOp && telAdNum.replace(/\D/g, '').length !== 7) e.telefonoAdicional = 'El teléfono adicional debe tener 7 dígitos.';
    // Identificación (todos obligatorios)
    if (!cDocCountry) e.docCountry = 'Selecciona el país de identificación.';
    if (!cDocType)    e.docType    = 'Selecciona el tipo de documento.';
    if (!cDocNum.trim()) {
      e.docNum = 'Ingresa el número de documento.';
    } else {
      const docErr = validateDocNum(cDocType, cDocNum);
      if (docErr) e.docNum = docErr;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

    const contactoTelefono = `+58 (${telOp}) ${telNum}`;
    const contactoTelefonoAdicional = telAdOp && telAdNum ? `+58 (${telAdOp}) ${telAdNum}` : '';
    const cPrefix = DOC_PREFIX_MAP[cDocType];
    const contactoNumeroIdentificacion = cDocType && cDocNum.trim()
      ? (cPrefix ? `${cPrefix}-${cDocNum.trim()}` : cDocNum.trim())
      : '';

    const contactoPayload = {
      contactoNombres:              contactoForm.nombres,
      contactoApellidos:            contactoForm.apellidos,
      contactoEmail:                contactoForm.email,
      contactoTelefono,
      contactoTelefonoAdicional,
      contactoNumeroIdentificacion,
      contactoInformacionAdicional: contactoForm.informacionAdicional,
      contactoReferencia:           contactoForm.referenciaContacto,
    };

    if (tipo === 'store') {
      const tiendaSeleccionada = allTiendas.find((t) => t.id === parseInt(storeForm.store));
      onSave({
        alias:         tiendaSeleccionada?.nombre ?? '',
        tipoDireccion: 'store',
        idLocker:      Number(storeForm.store),
        idEstado:      tiendaSeleccionada?.idEstado ?? null,
        idMunicipio:   null,
        idParroquia:   null,
        direccion:     null,
        referencia:    null,
        setAsDefault:  false,
        ...contactoPayload,
      });
    } else {
      onSave({
        alias:         homeForm.alias.trim(),
        tipoDireccion: 'home',
        idLocker:      null,
        idEstado:      Number(homeForm.idEstado),
        idMunicipio:   homeForm.idMunicipio ? Number(homeForm.idMunicipio) : null,
        idParroquia:   homeForm.idParroquia  ? Number(homeForm.idParroquia)  : null,
        direccion:     homeForm.direccion.trim(),
        referencia:    homeForm.referencia.trim(),
        setAsDefault:  homeForm.setAsDefault,
        ...contactoPayload,
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="addr-modal-backdrop" onClick={onClose}>
      <div className="addr-modal addr-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="addr-modal__header">
          <h3>🇻🇪 {t('us_wizard.dest_modal_title')}</h3>
          <button className="addr-modal__close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="addr-modal__body">

          {/* ── Selector de tipo ─────────────────────────────────────────── */}
           
          <div className="addr-modal__type-selector">
            <button
              type="button"
              className={`addr-modal__type-btn ${tipo === 'store' ? 'addr-modal__type-btn--active' : ''}`}
              onClick={() => setTipo('store')}
            >
              <IoStorefrontOutline size={15} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.pickup_store')}
            </button>
            <button
              type="button"
              className={`addr-modal__type-btn ${tipo === 'home' ? 'addr-modal__type-btn--active' : ''}`}
              onClick={() => setTipo('home')}
            >
              <IoHomeOutline size={15} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.send_home')}
            </button>
          </div>
           
          {/* ══════════════════════════════════════════════════════════════
              SECCIÓN TIENDA — Ciudad + Tienda (filtrada)
          ══════════════════════════════════════════════════════════════ */}

  
          
          {tipo === 'store' && (
            <>
              <div className="wizard-grid-2">
                
                <div className="wizard-field">
                  <label>{t('us_wizard.field_city')} *</label>
                  <select
                    value={storeForm.city}
                    onChange={(e) => { setStore('city', e.target.value); setErrors(p => ({ ...p, city: '' })); }}
                    className={errors.city ? 'input--error' : ''}
                  >
                    <option value="">{t('us_wizard.select_city')}</option>
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="wizard-field">
                  <label>{t('us_wizard.field_store')} *</label>
                  <select
                    value={storeForm.store}
                    onChange={(e) => { setStore('store', e.target.value); setErrors(p => ({ ...p, store: '' })); }}
                    disabled={!storeForm.city}
                    className={errors.store ? 'input--error' : ''}
                  >
                    <option value="">{t('us_wizard.select_store')}</option>
                    {filteredTiendas.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                  {errors.store && <span className="field-error">{errors.store}</span>}
                </div>
              </div>
            </>
          )} 

          {/* ══════════════════════════════════════════════════════════════
              SECCIÓN DOMICILIO — Nombre + Estado + Municipio + Parroquia + Dirección
          ══════════════════════════════════════════════════════════════ */}
          {tipo === 'home' && (
            <>
              {/* Nombre de la dirección */}
              <div className="wizard-field">
                <label>{t('us_wizard.field_address_name')} *</label>
                <input
                  placeholder="Ej. Casa, Oficina, etc."
                  value={homeForm.alias}
                  onChange={(e) => { setHome('alias', e.target.value); setErrors(p => ({ ...p, alias: '' })); }}
                  className={errors.alias ? 'input--error' : ''}
                />
                {errors.alias && <span className="field-error">{errors.alias}</span>}
              </div>

              {/* Estado + Municipio + Parroquia en grid 3 columnas */}
              <div className="wizard-grid-3">
                <div className="wizard-field">
                  <label>{t('us_wizard.field_state')} *</label>
                  <select
                    value={homeForm.idEstado}
                    onChange={(e) => { setHome('idEstado', e.target.value); setErrors(p => ({ ...p, idEstado: '' })); }}
                    className={errors.idEstado ? 'input--error' : ''}
                  >
                    <option value="">{t('us_wizard.select_state')}</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  {errors.idEstado && <span className="field-error">{errors.idEstado}</span>}
                </div>

                <div className="wizard-field">
                  <label>{t('us_wizard.field_municipio')} *</label>
                  <select
                    value={homeForm.idMunicipio}
                    onChange={(e) => { setHome('idMunicipio', e.target.value); setErrors(p => ({ ...p, idMunicipio: '' })); }}
                    disabled={!homeForm.idEstado || loadingGeo}
                    className={errors.idMunicipio ? 'input--error' : ''}
                  >
                    <option value="">
                      {loadingGeo ? t('common.loading') : t('us_wizard.select_municipio')}
                    </option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors.idMunicipio && <span className="field-error">{errors.idMunicipio}</span>}
                </div>

                <div className="wizard-field">
                  <label>{t('us_wizard.field_parroquia')} *</label>
                  <select
                    value={homeForm.idParroquia}
                    onChange={(e) => { setHome('idParroquia', e.target.value); setErrors(p => ({ ...p, idParroquia: '' })); }}
                    disabled={!homeForm.idMunicipio}
                    className={errors.idParroquia ? 'input--error' : ''}
                  >
                    <option value="">{t('us_wizard.select_parroquia')}</option>
                    {parroquias.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.idParroquia && <span className="field-error">{errors.idParroquia}</span>}
                </div>
              </div>

              {/* Dirección completa */}
              <div className="wizard-field">
                <label>{t('us_wizard.field_full_address')} *</label>
                <textarea
                  className={`addr-modal__textarea${errors.direccion ? ' input--error' : ''}`}
                  placeholder="Ej: Barrio, Vicario 3, Carrera 9 entre Calles 5 y 7"
                  rows={3}
                  value={homeForm.direccion}
                  onChange={(e) => { setHome('direccion', e.target.value); setErrors(p => ({ ...p, direccion: '' })); }}
                />
                {errors.direccion && <span className="field-error">{errors.direccion}</span>}
              </div>

              {/* Punto de referencia */}
              <div className="wizard-field">
                <label>{t('us_wizard.field_ref_point')} <span className="label-optional">({t('common.optional')})</span></label>
                <textarea
                  className="addr-modal__textarea"
                  placeholder="Punto de referencia adicional (opcional)"
                  rows={2}
                  value={homeForm.referencia}
                  onChange={(e) => setHome('referencia', e.target.value)}
                />
              </div>

              {/* Predeterminada */}
              <label className="addr-modal__checkbox">
                <input
                  type="checkbox"
                  checked={homeForm.setAsDefault}
                  onChange={(e) => setHome('setAsDefault', e.target.checked)}
                />
                <span>{t('us_wizard.set_as_default')}</span>
              </label>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECCIÓN CONTACTO — Datos de quien recibe (home y store)
          ══════════════════════════════════════════════════════════════ */}
          <div className="addr-modal__section-divider">
            <span><IoPersonOutline size={15} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.contact_section')}</span>
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>{t('us_wizard.field_first_name')} *</label>
              <input
                placeholder="Ej. Juan"
                value={contactoForm.nombres}
                onChange={(e) => { setContacto('nombres', e.target.value); setErrors(p => ({ ...p, nombres: '' })); }}
                className={errors.nombres ? 'input--error' : ''}
              />
              {errors.nombres && <span className="field-error">{errors.nombres}</span>}
            </div>
            <div className="wizard-field">
              <label>{t('us_wizard.field_last_name')}</label>
              <input
                placeholder="Ej. Pérez"
                value={contactoForm.apellidos}
                onChange={(e) => setContacto('apellidos', e.target.value)}
              />
            </div>
          </div>

          {/* Teléfono principal Venezuela (obligatorio) */}
          <VenezPhoneInput
            label={t('us_wizard.field_contact_phone')}
            required
            operator={telOp}
            number={telNum}
            onOperatorChange={(v) => { setTelOp(v); setErrors(p => ({ ...p, telefono: '' })); }}
            onNumberChange={(v) => { setTelNum(v); setErrors(p => ({ ...p, telefono: '' })); }}
            error={errors.telefono}
          />

          {/* Teléfono adicional Venezuela (opcional) */}
          <VenezPhoneInput
            label={`${t('us_wizard.field_phone2')} (${t('common.optional')})`}
            required={false}
            operator={telAdOp}
            number={telAdNum}
            onOperatorChange={(v) => { setTelAdOp(v); setErrors(p => ({ ...p, telefonoAdicional: '' })); }}
            onNumberChange={(v) => { setTelAdNum(v); setErrors(p => ({ ...p, telefonoAdicional: '' })); }}
            error={errors.telefonoAdicional}
          />

          {/* Identificación */}
          <DocIdentInput
            country={cDocCountry}
            docType={cDocType}
            docNum={cDocNum}
            onCountryChange={(v) => { setCDocCountry(v); setErrors(p => ({ ...p, docCountry: '' })); }}
            onTypeChange={(v)    => { setCDocType(v);    setErrors(p => ({ ...p, docType: '' })); }}
            onNumChange={(v)     => { setCDocNum(v);     setErrors(p => ({ ...p, docNum: '' })); }}
            errors={errors}
          />

          {/* Email */}
          <div className="wizard-field">
            <label>{t('us_wizard.field_email')} <span className="label-optional">({t('common.optional')})</span></label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={contactoForm.email}
              onChange={(e) => setContacto('email', e.target.value)}
            />
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>{t('us_wizard.field_extra_info')} <span className="label-optional">({t('common.optional')})</span></label>
              <input
                placeholder="Notas sobre el contacto"
                value={contactoForm.informacionAdicional}
                onChange={(e) => setContacto('informacionAdicional', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>{t('us_wizard.field_contact_ref')} <span className="label-optional">({t('common.optional')})</span></label>
              <input
                placeholder="Referencia o nota adicional"
                value={contactoForm.referenciaContacto}
                onChange={(e) => setContacto('referenciaContacto', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="addr-modal__footer">
          <button className="btn-wizard-back" onClick={onClose} disabled={saving}>{t('common.cancel')}</button>
          <button className="btn-wizard-next" onClick={handleSave} disabled={saving}>
            {saving ? t('us_wizard.saving') : t('us_wizard.save_address')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// ██  COMPONENTE PRINCIPAL — Step2Addresses
// ════════════════════════════════════════════════════════════════════════════
const Step2Addresses = ({ data, updateData, onNext, onBack, calculating }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const clientId = getClientId();

  // Datos de contacto para usuarios guest (no logueados)
  const [senderName,     setSenderName]     = useState(data.senderName     ?? '');
  const [senderLastName, setSenderLastName] = useState(data.senderLastName ?? '');
  const [senderEmail,    setSenderEmail]    = useState(data.senderEmail    ?? '');

  const [originList,      setOriginList]      = useState([]);
  const [destList,        setDestList]        = useState([]);
  const [loading,         setLoading]         = useState({ origin: true, dest: true });
  const [saving,          setSaving]          = useState(false);
  const [modal,           setModal]           = useState(null);
  const [errors,          setErrors]          = useState({});
  const [deliveryMethod,  setDeliveryMethod]  = useState(data.deliveryMethod  ?? 'dropoff');
  const [pickupDate,      setPickupDate]      = useState(data.pickupDate      ?? '');
  const [pickupTimeSlot,  setPickupTimeSlot]  = useState(data.pickupTimeSlot  ?? '');
  const minPickupDate = getTomorrow();

  // ✅ FIX: Subir allTiendas al nivel del componente padre (antes solo estaba en DestinationModal)
  // Esto permite enriquecer el destList con idEstado antes de llamar onNext
  const [allTiendas, setAllTiendas] = useState([]);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    // ✅ FIX: Cargar tiendas aquí también para tener idEstado disponible en handleNext
    fetchDeliveryData().then(({ tiendas: t }) => {
      setAllTiendas(t);
    });

    if (!clientId) { setLoading({ origin: false, dest: false }); return; }

    fetchOriginAddresses(clientId).then((res) => {
      if (res.success) {
        setOriginList(res.data);
        const pred = res.data.find((a) => a.esPredeterminada);
        if (pred && !data.originAddressId) updateData({ originAddressId: pred.id });
      } else {
        toast.error(res.message);
      }
      setLoading((p) => ({ ...p, origin: false }));
    });

    fetchDestinationAddresses(clientId).then((res) => {
      if (res.success) {
        setDestList(res.data);
        const pred = res.data.find((a) => a.esPredeterminada);
        if (pred && !data.destinationAddressId) updateData({ destinationAddressId: pred.id });
      } else {
        toast.error(res.message);
      }
      setLoading((p) => ({ ...p, dest: false }));
    });
  }, [clientId]);

  // ── Eliminar ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (type, id) => {
    if (!window.confirm(t('us_wizard.delete_confirm'))) return;
    if (type === 'origin') {
      const res = await deleteOriginAddress(clientId, id);
      if (res.success) {
        setOriginList((p) => p.filter((a) => a.id !== id));
        if (data.originAddressId === id) updateData({ originAddressId: null });
        toast.success(t('us_wizard.origin_deleted'));
      } else { toast.error(res.message); }
    } else {
      const res = await deleteDestinationAddress(clientId, id);
      if (res.success) {
        setDestList((p) => p.filter((a) => a.id !== id));
        if (data.destinationAddressId === id) updateData({ destinationAddressId: null });
        toast.success(t('us_wizard.dest_deleted'));
      } else { toast.error(res.message); }
    }
  }, [clientId, data, updateData]);

  // ── Predeterminada ─────────────────────────────────────────────────────────
  const handleSetDefault = useCallback(async (type, id) => {
    if (type === 'origin') {
      const res = await setOriginDefault(clientId, id);
      if (res.success) {
        setOriginList((p) => p.map((a) => ({ ...a, esPredeterminada: a.id === id })));
        toast.success(t('us_wizard.origin_default_updated'));
      } else { toast.error(res.message); }
    } else {
      const res = await setDestinationDefault(clientId, id);
      if (res.success) {
        setDestList((p) => p.map((a) => ({ ...a, esPredeterminada: a.id === id })));
        toast.success(t('us_wizard.dest_default_updated'));
      } else { toast.error(res.message); }
    }
  }, [clientId]);

  // ── Guardar dirección ORIGEN ───────────────────────────────────────────────
  const handleSaveOrigin = async (formData) => {
    // Guest: guardar local, sincronizar al backend tras autenticación
    if (!user) {
      const localId = `local_${Date.now()}`;
      const card = {
        id: localId, alias: formData.alias, line1: formData.line1,
        city: formData.city, province: formData.province ?? '',
        zip: formData.zip ?? '', phone: formData.phone ?? '',
        esPredeterminada: true,
      };
      setOriginList([card]);
      updateData({ originAddressId: localId, localOriginFormData: { ...formData, setAsDefault: true } });
      setModal(null);
      toast.success(t('us_wizard.origin_saved'));
      return;
    }

    setSaving(true);
    const res = await addUsaOriginAddress({ clientId, ...formData, idPais: 2 });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }

    const card = {
      id:               res.data.id,
      alias:            res.data.alias,
      line1:            res.data.line1,
      city:             res.data.city,
      province:         res.data.province,
      zip:              res.data.zip,
      phone:            res.data.phone,
      esPredeterminada: res.data.esPredeterminada ?? formData.setAsDefault,
    };
    setOriginList((p) => {
      const lista = formData.setAsDefault ? p.map((a) => ({ ...a, esPredeterminada: false })) : [...p];
      return [...lista, card];
    });
    updateData({ originAddressId: res.data.id });
    setModal(null);
    toast.success(t('us_wizard.origin_saved'));
  };

  // ── Guardar dirección DESTINO ──────────────────────────────────────────────
  const handleSaveDestination = async (formData) => {
    // Guest: guardar local, sincronizar al backend tras autenticación
    if (!user) {
      const localId = `local_${Date.now()}`;
      const card = {
        id: localId,
        alias: formData.alias ?? formData.direccion ?? '',
        line1: formData.direccion ?? '',
        tipoDireccion: formData.tipoDireccion,
        esPredeterminada: true,
        idEstado: formData.idEstado ?? null,
        idMunicipio: formData.idMunicipio ?? null,
        idLocker: formData.idLocker ?? null,
      };
      setDestList([card]);
      updateData({ destinationAddressId: localId, localDestFormData: { ...formData, setAsDefault: true } });
      setModal(null);
      toast.success(t('us_wizard.dest_saved'));
      return;
    }

    setSaving(true);
    const res = await addDestinationAddress({ clientId, ...formData });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }

    const card = {
      id:               res.data.id,
      alias:            res.data.alias,
      line1:            formData.direccion ?? '',
      tipoDireccion:    formData.tipoDireccion,
      esPredeterminada: res.data.esPredeterminada ?? formData.setAsDefault,
      idEstado:         res.data.idEstado   ?? formData.idEstado   ?? null,
      idMunicipio:      res.data.idMunicipio ?? formData.idMunicipio ?? null,
      idLocker:         formData.idLocker ?? null,
    };
    setDestList((p) => {
      const lista = formData.setAsDefault ? p.map((a) => ({ ...a, esPredeterminada: false })) : [...p];
      return [...lista, card];
    });
    updateData({ destinationAddressId: res.data.id });
    setModal(null);
    toast.success(t('us_wizard.dest_saved'));
  };

  // ── Continuar ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    const e = {};

    // Validar datos de contacto si es usuario guest
    if (!user) {
      if (!senderName.trim())     e.senderName     = 'Ingresa tu nombre.';
      if (!senderLastName.trim()) e.senderLastName = 'Ingresa tu apellido.';
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim());
      if (!senderEmail.trim() || !emailOk) e.senderEmail = 'Ingresa un correo electrónico válido.';
    }

    if (!data.originAddressId)      e.origin = t('us_wizard.error_origin_required');
    if (!data.destinationAddressId) e.dest   = t('us_wizard.error_dest_required');
    if (deliveryMethod === 'pickup') {
      if (!pickupDate)     e.pickupDate = t('us_wizard.error_pickup_date');
      if (!pickupTimeSlot) e.pickupTime = t('us_wizard.error_pickup_time');
    }
    if (Object.keys(e).length) { setErrors(e); return; }

    const enrichedDestList = destList.map((addr) => {
      if (addr.tipoDireccion === 'store' && !addr.idEstado && addr.idLocker) {
        const tienda = allTiendas.find((t) => t.id === Number(addr.idLocker));
        if (tienda?.idEstado) {
          return { ...addr, idEstado: tienda.idEstado };
        }
      }
      return addr;
    });

    const slot = TIME_SLOTS.find((s) => s.value === pickupTimeSlot);
    updateData({
      deliveryMethod,
      pickupDate,
      pickupTimeSlot,
      pickupReadyTime: slot?.readyTime ?? '',
      pickupCloseTime: slot?.closeTime ?? '',
      ...(!user && { senderName: senderName.trim(), senderLastName: senderLastName.trim(), senderEmail: senderEmail.trim() }),
    });

    onNext({ destList: enrichedDestList, originList });
  };

  return (
    <div>
      <div className="wizard-card">
        <h2 className="wizard-card__title"><IoLocationOutline size={22} style={{ verticalAlign: 'middle' }} /> {t('us_wizard.step2_title')}</h2>
        <p className="wizard-card__subtitle">
          {t('us_wizard.step2_subtitle')}
        </p>

        {/* ── Datos de contacto (solo usuarios no logueados) ───────────── */}
        {!user && (
          <div className="guest-contact-card">
            <p className="guest-contact-card__title"><IoPersonOutline size={16} style={{ verticalAlign: 'middle' }} /> Tus datos de contacto</p>
            <p className="guest-contact-card__subtitle">Se usarán para crear o acceder a tu cuenta al finalizar</p>
            <div className="wizard-grid-2" style={{ marginTop: '0.75rem' }}>
              <div className="wizard-field">
                <input
                  placeholder="Nombre"
                  value={senderName}
                  onChange={(e) => { setSenderName(e.target.value); setErrors(p => ({ ...p, senderName: '' })); }}
                  className={errors.senderName ? 'input--error' : ''}
                />
                {errors.senderName && <span className="field-error">{errors.senderName}</span>}
              </div>
              <div className="wizard-field">
                <input
                  placeholder="Apellido"
                  value={senderLastName}
                  onChange={(e) => { setSenderLastName(e.target.value); setErrors(p => ({ ...p, senderLastName: '' })); }}
                  className={errors.senderLastName ? 'input--error' : ''}
                />
                {errors.senderLastName && <span className="field-error">{errors.senderLastName}</span>}
              </div>
            </div>
            <div className="wizard-field" style={{ marginTop: '0.5rem' }}>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={senderEmail}
                onChange={(e) => { setSenderEmail(e.target.value); setErrors(p => ({ ...p, senderEmail: '' })); }}
                className={errors.senderEmail ? 'input--error' : ''}
              />
              {errors.senderEmail && <span className="field-error">{errors.senderEmail}</span>}
            </div>
          </div>
        )}

        {(errors.origin || errors.dest) && (
          <div className="addr-error-banner">
            {errors.origin && <span><IoWarningOutline size={14} style={{ verticalAlign: 'middle' }} /> {errors.origin}</span>}
            {errors.dest   && <span><IoWarningOutline size={14} style={{ verticalAlign: 'middle' }} /> {errors.dest}</span>}
          </div>
        )}

        <div className="addr-columns">
          <div className={errors.origin ? 'addr-col--error' : ''}>
            <AddressColumn
              title={t('us_wizard.origin_label')} flag="🇺🇸" country="USA"
              addresses={originList} selectedId={data.originAddressId}
              loading={loading.origin}
              onSelect={(id) => { updateData({ originAddressId: id }); setErrors((p) => ({ ...p, origin: null })); }}
              onAdd={() => setModal('origin')}
              onDelete={(id) => handleDelete('origin', id)}
              onSetDefault={(id) => handleSetDefault('origin', id)}
            />
          </div>
          <div className={errors.dest ? 'addr-col--error' : ''}>
            <AddressColumn
              title={t('us_wizard.dest_label')} flag="🇻🇪" country="Venezuela"
              addresses={destList} selectedId={data.destinationAddressId}
              loading={loading.dest}
              onSelect={(id) => { updateData({ destinationAddressId: id }); setErrors((p) => ({ ...p, dest: null })); }}
              onAdd={() => setModal('dest')}
              onDelete={(id) => handleDelete('dest', id)}
              onSetDefault={(id) => handleSetDefault('dest', id)}
            />
          </div>
        </div>
      </div>

      {/* ── Método de entrega a UPS ────────────────────────────────────── */}
      <div className="wizard-card" style={{ marginTop: '16px' }}>
        <h3 className="wizard-card__title">
          <IoCarOutline size={20} style={{ verticalAlign: 'middle' }} /> ¿Cómo llevarás tu paquete a UPS?
        </h3>

        <div className="addr-modal__type-selector" style={{ marginTop: '12px' }}>
          <button
            type="button"
            className={`addr-modal__type-btn ${deliveryMethod === 'dropoff' ? 'addr-modal__type-btn--active' : ''}`}
            onClick={() => { setDeliveryMethod('dropoff'); updateData({ deliveryMethod: 'dropoff' }); }}
          >
            <IoStorefrontOutline size={16} style={{ verticalAlign: 'middle' }} /> Drop-off — Llevo mi paquete a una tienda UPS
          </button>
          <button
            type="button"
            className={`addr-modal__type-btn ${deliveryMethod === 'pickup' ? 'addr-modal__type-btn--active' : ''}`}
            onClick={() => { setDeliveryMethod('pickup'); updateData({ deliveryMethod: 'pickup' }); }}
          >
            <IoCarOutline size={16} style={{ verticalAlign: 'middle' }} /> Pickup — UPS recoge en mi dirección
          </button>
        </div>

        {deliveryMethod === 'dropoff' && (
          <p style={{ marginTop: '10px', color: '#666', fontSize: '13px' }}>
            <IoCheckmarkCircleOutline size={14} style={{ verticalAlign: 'middle', color: '#22c55e' }} /> Sin costo adicional. Lleva tu paquete a cualquier UPS Store o punto de entrega autorizado.
          </p>
        )}

        {deliveryMethod === 'pickup' && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
              UPS recogerá el paquete en tu dirección de origen. Se aplicará una tarifa de pickup.
            </p>
            <div className="wizard-grid-2">
              <div className="wizard-field">
                <label><IoCalendarOutline size={14} style={{ verticalAlign: 'middle' }} /> Fecha de pickup *</label>
                <input
                  type="date"
                  min={minPickupDate}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    updateData({ pickupDate: e.target.value });
                    setErrors((p) => ({ ...p, pickupDate: '' }));
                  }}
                  className={errors.pickupDate ? 'input--error' : ''}
                />
                {errors.pickupDate && <span className="field-error">{errors.pickupDate}</span>}
              </div>
              <div className="wizard-field">
                <label><IoTimeOutline size={14} style={{ verticalAlign: 'middle' }} /> Ventana horaria *</label>
                <select
                  value={pickupTimeSlot}
                  onChange={(e) => {
                    setPickupTimeSlot(e.target.value);
                    setErrors((p) => ({ ...p, pickupTime: '' }));
                  }}
                  className={errors.pickupTime ? 'input--error' : ''}
                >
                  <option value="">Seleccionar horario...</option>
                  {TIME_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.pickupTime && <span className="field-error">{errors.pickupTime}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>{t('us_wizard.back')}</button>
        <button
          className="btn-wizard-next"
          onClick={handleNext}
          disabled={calculating}
        >
          {calculating ? `⏳ ${t('us_wizard.calculating')}` : t('us_wizard.continue')}
        </button>
      </div>

      {modal === 'origin' && (
        <OriginModal onSave={handleSaveOrigin} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal === 'dest' && (
        <DestinationModal onSave={handleSaveDestination} onClose={() => setModal(null)} saving={saving} allTiendasProp={allTiendas}  />
      )}
    </div>
  );
};

export default Step2Addresses;