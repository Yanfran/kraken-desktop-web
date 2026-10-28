// src/modules/es/pages/ShipmentWizard/steps/Step2Addresses.jsx
// ✅ Paso 2: Selección de dirección de ORIGEN (España) y DESTINO (Venezuela)
//    DestinationModal sigue la misma lógica que /profile/addresses de la app

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  IoStar,
  IoStarOutline,
  IoCheckmarkOutline,
  IoPersonOutline,
  IoStorefrontOutline,
  IoCallOutline,
  IoMailOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoLocationOutline,
} from 'react-icons/io5';
import { useAuth } from '../../../../../contexts/AuthContext';
import {
  fetchOriginAddresses,
  addOriginAddress,
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
import './Step2Addresses.scss';
import { useCustomAlert } from '../../../../../hooks/useCustomAlert';
import CustomAlert from '../../../../../components/common/CustomAlert/CustomAlert';

// ── Validación genérica de campos de direcciones (origen España y destino VE) ─
const NAME_CHARS_REGEX    = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{2,50}$/;
const ADDRESS_CHARS_REGEX = /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,ºª°/-]{5,150}$/;
const ES_ZIP_REGEX        = /^\d{5}$/;
const ES_PHONE_REGEX      = /^(\+34)?\d{9}$/;
const EMAIL_REGEX         = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REFERENCIA      = 150;

// ── Operadoras Venezuela y tipos de documento (igual que el wizard de USA) ───
const VENEZ_OPERATORS = ['0412', '0414', '0416', '0422', '0424', '0426'];

const formatVenezPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 7);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};

const VE_DOC_TYPES = [
  { value: 'cedulavenezolana', label: 'Cédula Venezolana' },
  { value: 'cedulaextranjera', label: 'Cédula Extranjera' },
  { value: 'pasaporte',        label: 'Pasaporte' },
  { value: 'rifjuridico',      label: 'RIF Jurídico' },
  { value: 'rifgubernamental', label: 'RIF Gubernamental' },
  { value: 'rifcomuna',        label: 'RIF Comuna' },
  { value: 'riffirmapersonal', label: 'RIF Firma Personal' },
];

const VE_DOC_CONFIG = {
  cedulavenezolana: { pattern: /^[0-9]+$/,         min: 4,  max: 9,  hint: '4–9 dígitos numéricos' },
  cedulaextranjera: { pattern: /^[A-Za-z0-9]+$/,   min: 4,  max: 12, hint: '4–12 caracteres alfanuméricos' },
  pasaporte:        { pattern: /^[A-Za-z0-9]+$/,   min: 6,  max: 15, hint: '6–15 caracteres alfanuméricos' },
  rifjuridico:      { pattern: /^[A-Za-z0-9-]+$/, min: 6,  max: 12, hint: '6–12 caracteres (ej: 12345678-9)' },
  rifgubernamental: { pattern: /^[A-Za-z0-9-]+$/, min: 6,  max: 12, hint: '6–12 caracteres' },
  rifcomuna:        { pattern: /^[A-Za-z0-9-]+$/, min: 6,  max: 12, hint: '6–12 caracteres' },
  riffirmapersonal: { pattern: /^[A-Za-z0-9-]+$/, min: 6,  max: 12, hint: '6–12 caracteres' },
};

const VE_DOC_PREFIX_MAP = {
  cedulavenezolana: 'V', cedulaextranjera: 'E', rifjuridico: 'J',
  rifgubernamental: 'G', rifcomuna: 'C', riffirmapersonal: 'R',
};

// Igual que DOC_TYPE_DB_ID de la app (spa_tbClienteTipoIdentificacion)
const VE_DOC_DB_ID = {
  pasaporte: 1, rifjuridico: 2, cedulavenezolana: 3,
  cedulaextranjera: 7, rifgubernamental: 8, rifcomuna: 9, riffirmapersonal: 10,
};

const cleanVeDocInput = (docType, text) => {
  const cfg = VE_DOC_CONFIG[docType];
  if (!cfg) return text;
  if (/cedula/.test(docType)) return text.replace(/\D/g, '').slice(0, cfg.max);
  if (/rif/.test(docType))    return text.replace(/[^A-Za-z0-9-]/g, '').slice(0, cfg.max);
  return text.replace(/[^A-Za-z0-9]/g, '').slice(0, cfg.max);
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

// ════════════════════════════════════════════════════════════════════════════
// ██  TARJETA DE DIRECCIÓN (mismo diseño que el wizard de USA)
// ════════════════════════════════════════════════════════════════════════════
const AddressCard = ({ address, selected, onSelect, onView, onDelete, onSetDefault, flag, userInfo }) => {
  const displayName = address.contactoNombres
    ? `${address.contactoNombres} ${address.contactoApellidos ?? ''}`.trim()
    : userInfo?.name ?? null;
  const displayPhone = address.contactoTelefono ?? address.phone ?? null;
  const displayEmail = address.contactoEmail ?? userInfo?.email ?? null;

  return (
  <button
    type="button"
    className={`addr-card ${selected ? 'addr-card--selected' : ''}`}
    onClick={() => onSelect(address.id)}
  >
    {address.esPredeterminada && (
      <span className="addr-card__badge"><IoStar size={12} style={{ verticalAlign: 'middle' }} /> Predeterminada</span>
    )}
    {selected && <span className="addr-card__check"><IoCheckmarkOutline size={14} /></span>}

    <div className="addr-card__body">
      <p className="addr-card__alias">{flag} {address.alias}</p>
      {displayName && (
        <p className="addr-card__line"><IoPersonOutline size={13} style={{ verticalAlign: 'middle' }} /> {displayName}</p>
      )}
      <p className="addr-card__line">{address.line1}</p>
      {address.city && (
        <p className="addr-card__line">
          {address.city}{address.zip ? ` - ${address.zip}` : ''}
        </p>
      )}
      {address.tipoDireccion === 'store' && address.nombreLocker && (
        <p className="addr-card__line"><IoStorefrontOutline size={13} style={{ verticalAlign: 'middle' }} /> {address.nombreLocker}</p>
      )}
      {displayPhone && <p className="addr-card__phone"><IoCallOutline size={13} style={{ verticalAlign: 'middle' }} /> {displayPhone}</p>}
      {displayEmail && <p className="addr-card__line"><IoMailOutline size={13} style={{ verticalAlign: 'middle' }} /> {displayEmail}</p>}
    </div>

    <div className="addr-card__actions" onClick={(e) => e.stopPropagation()}>
      <button
        className="addr-card__action-btn addr-card__action-btn--view"
        title="Ver detalle"
        onClick={() => onView(address.id)}
      ><IoEyeOutline size={16} /> <span>Ver</span></button>
      {!address.esPredeterminada && (
        <button
          className="addr-card__action-btn addr-card__action-btn--star"
          title="Marcar como predeterminada"
          onClick={() => onSetDefault(address.id)}
        ><IoStarOutline size={16} /> <span>Predeterminada</span></button>
      )}
      <button
        className="addr-card__action-btn addr-card__action-btn--danger"
        title="Eliminar"
        onClick={() => onDelete(address.id)}
      ><IoTrashOutline size={16} /> <span>Eliminar</span></button>
    </div>
  </button>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// ██  COLUMNA DE DIRECCIONES (mismo diseño que el wizard de USA)
// ════════════════════════════════════════════════════════════════════════════
const AddressColumn = ({
  title, flag, country, addresses, selectedId,
  onSelect, onView, onAdd, onDelete, onSetDefault, loading, userInfo,
}) => (
  <div className="addr-col">
    <h3 className="addr-col__title">
      <span className="addr-col__flag">{flag}</span>
      {title} <span className="addr-col__country">({country})</span>
    </h3>

    {loading ? (
      <div className="addr-col__loading">
        <div className="spinner-small" />
        <span>Cargando direcciones...</span>
      </div>
    ) : (
      <div className="addr-col__grid">
        {addresses.length === 0 && (
          <p className="addr-col__empty">No tienes direcciones guardadas.</p>
        )}
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            selected={addr.id === selectedId}
            onSelect={onSelect}
            onView={onView}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            flag={flag}
            userInfo={userInfo}
          />
        ))}
        {addresses.length < 4 ? (
          <button className="addr-add-btn" onClick={onAdd}>
            <span className="addr-add-btn__icon">+</span>
            <span>Añadir Nueva Dirección</span>
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

// ════════════════════════════════════════════════════════════════════════════
// ██  MODAL — ORIGEN (España) 🇪🇸
// ════════════════════════════════════════════════════════════════════════════
const OriginModal = ({ onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    alias: '', line1: '', city: '', province: '',
    zip: '', phone: '', referencia: '', setAsDefault: false,
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};

    if (!form.alias.trim()) e.alias = 'El nombre/alias es obligatorio';
    else if (form.alias.trim().length < 2 || form.alias.trim().length > 40) e.alias = 'Debe tener entre 2 y 40 caracteres';

    if (!form.line1.trim()) e.line1 = 'La dirección es obligatoria';
    else if (!ADDRESS_CHARS_REGEX.test(form.line1.trim())) e.line1 = 'Dirección inválida (5 a 150 caracteres)';

    if (!form.city.trim()) e.city = 'La ciudad es obligatoria';
    else if (!NAME_CHARS_REGEX.test(form.city.trim())) e.city = 'Solo letras, entre 2 y 50 caracteres';

    if (form.province.trim() && !NAME_CHARS_REGEX.test(form.province.trim()))
      e.province = 'Solo letras, entre 2 y 50 caracteres';

    if (form.zip.trim() && !ES_ZIP_REGEX.test(form.zip.trim()))
      e.zip = 'Código postal de España: 5 dígitos';

    if (form.phone.trim() && !ES_PHONE_REGEX.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Teléfono de España inválido (9 dígitos, opcional +34)';

    if (form.referencia.trim().length > MAX_REFERENCIA)
      e.referencia = `Máximo ${MAX_REFERENCIA} caracteres`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, alias: form.alias.trim(), line1: form.line1.trim(), city: form.city.trim() });
  };

  return (
    <div className="addr-modal-backdrop" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="addr-modal__header">
          <h3>🇪🇸 Nueva Dirección de Origen — España</h3>
          <button className="addr-modal__close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="addr-modal__body">
          <div className="wizard-field">
            <label>Nombre / Alias *</label>
            <input placeholder="Ej. Casa, Oficina..." maxLength={40} value={form.alias} onChange={(e) => set('alias', e.target.value)} />
            {errors.alias && <span className="field-error">{errors.alias}</span>}
          </div>

          <div className="wizard-field">
            <label>Dirección *</label>
            <input placeholder="Calle de Alcalá 123, 2º A" maxLength={150} value={form.line1} onChange={(e) => set('line1', e.target.value)} />
            {errors.line1 && <span className="field-error">{errors.line1}</span>}
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>Ciudad *</label>
              <input placeholder="Madrid" maxLength={50} value={form.city} onChange={(e) => set('city', e.target.value)} />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="wizard-field">
              <label>Provincia</label>
              <input placeholder="Madrid" maxLength={50} value={form.province} onChange={(e) => set('province', e.target.value)} />
              {errors.province && <span className="field-error">{errors.province}</span>}
            </div>
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>Código Postal</label>
              <input
                placeholder="28001"
                maxLength={5}
                value={form.zip}
                onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
              />
              {errors.zip && <span className="field-error">{errors.zip}</span>}
            </div>
            <div className="wizard-field">
              <label>Teléfono</label>
              <input
                placeholder="+34 600 000 000"
                maxLength={17}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/[^\d+\s]/g, ''))}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="wizard-field">
            <label>Referencia adicional</label>
            <input
              placeholder="Portero automático #3, timbre azul..."
              maxLength={MAX_REFERENCIA}
              value={form.referencia}
              onChange={(e) => set('referencia', e.target.value)}
            />
            {errors.referencia && <span className="field-error">{errors.referencia}</span>}
          </div>

          <label className="addr-modal__checkbox">
            <input type="checkbox" checked={form.setAsDefault} onChange={(e) => set('setAsDefault', e.target.checked)} />
            <span>Marcar como dirección predeterminada</span>
          </label>
        </div>

        <div className="addr-modal__footer">
          <button className="btn-wizard-back" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn-wizard-next" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Dirección'}
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

  // ── Datos GEO ──────────────────────────────────────────────────────────────
  const [ciudades,    setCiudades]    = useState([]);  // [{ id, name }]
  const [allTiendas,  setAllTiendas]  = useState([]);  // [{ id, nombre, idZonaCiudad, idEstado }]
  const [estados,     setEstados]     = useState([]);  // [{ id, name }]
  const [municipios,  setMunicipios]  = useState([]);  // [{ id, name }]
  const [parroquias,  setParroquias]  = useState([]);  // [{ id, name }]
  const [loadingGeo,  setLoadingGeo]  = useState(false);
  const [errors,      setErrors]      = useState({});

  // ── Datos del destinatario (se registra como Cliente real, sin su consentimiento,
  //     igual que krakenAdmin en el mostrador) ─────────────────────────────────
  const [contactoForm, setContactoForm] = useState({
    nombres: '', apellidos: '', email: '',
    telOperator: '', telDigits: '', docType: '', docNum: '',
  });
  const setContacto = (k, v) => setContactoForm((p) => ({ ...p, [k]: v }));

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
      .catch(() => toast.error('Error al cargar municipios'))
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
      .catch(() => toast.error('Error al cargar parroquias'));
    setHome('idParroquia', '');
  }, [homeForm.idMunicipio]);

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (tipo === 'store') {
      if (!storeForm.city)  e.city  = 'Selecciona una ciudad';
      if (!storeForm.store) e.store = 'Selecciona una tienda';
    } else {
      if (!homeForm.alias.trim()) e.alias = 'El nombre de la dirección es obligatorio';
      else if (homeForm.alias.trim().length < 2 || homeForm.alias.trim().length > 40) e.alias = 'Debe tener entre 2 y 40 caracteres';

      if (!homeForm.idEstado)        e.idEstado    = 'Selecciona un estado';
      if (!homeForm.idMunicipio)     e.idMunicipio = 'Selecciona un municipio';
      if (!homeForm.idParroquia)     e.idParroquia = 'Selecciona una parroquia';

      if (!homeForm.direccion.trim()) e.direccion = 'La dirección es obligatoria';
      else if (!ADDRESS_CHARS_REGEX.test(homeForm.direccion.trim())) e.direccion = 'Dirección inválida (5 a 150 caracteres)';

      if (homeForm.referencia.trim().length > MAX_REFERENCIA) e.referencia = `Máximo ${MAX_REFERENCIA} caracteres`;
    }

    if (!contactoForm.nombres.trim()) e.cNombres = 'El nombre del destinatario es obligatorio';
    else if (!NAME_CHARS_REGEX.test(contactoForm.nombres.trim())) e.cNombres = 'Solo letras, entre 2 y 50 caracteres';

    if (contactoForm.apellidos.trim() && !NAME_CHARS_REGEX.test(contactoForm.apellidos.trim()))
      e.cApellidos = 'Solo letras, entre 2 y 50 caracteres';

    if (contactoForm.email.trim() && !EMAIL_REGEX.test(contactoForm.email.trim()))
      e.cEmail = 'Email inválido';

    if (!contactoForm.telOperator || contactoForm.telDigits.replace(/\D/g, '').length !== 7)
      e.cTelefono = 'Teléfono venezolano inválido (operadora + 7 dígitos)';
    if (!contactoForm.docType) e.docType = 'Selecciona el tipo de documento';
    else {
      const cfg = VE_DOC_CONFIG[contactoForm.docType];
      const v = contactoForm.docNum.trim();
      if (!v) e.docNum = 'Ingresa el número de documento';
      else if (v.length < cfg.min || !cfg.pattern.test(v)) e.docNum = 'Número de documento inválido para el tipo seleccionado';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

    const docPrefix = VE_DOC_PREFIX_MAP[contactoForm.docType] ?? '';
    const contacto = {
      contactoNombres:              contactoForm.nombres.trim(),
      contactoApellidos:            contactoForm.apellidos.trim(),
      contactoEmail:                contactoForm.email.trim(),
      contactoTelefono:             `+58 (${contactoForm.telOperator}) ${contactoForm.telDigits}`,
      contactoNumeroIdentificacion: `${docPrefix}-${contactoForm.docNum.trim()}`,
      contactoIdTipoIdentificacion: VE_DOC_DB_ID[contactoForm.docType] ?? null,
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
        ...contacto,
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
        ...contacto,
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="addr-modal-backdrop" onClick={onClose}>
      <div className="addr-modal addr-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="addr-modal__header">
          <h3>🇻🇪 Nueva Dirección de Destino — Venezuela</h3>
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
              <span>🏪</span> Retiro en Tienda
            </button>
            <button
              type="button"
              className={`addr-modal__type-btn ${tipo === 'home' ? 'addr-modal__type-btn--active' : ''}`}
              onClick={() => setTipo('home')}
            >
              <span>🏠</span> Enviar a otra dirección
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECCIÓN TIENDA — Ciudad + Tienda (filtrada)
          ══════════════════════════════════════════════════════════════ */}
          {tipo === 'store' && (
            <div className="wizard-grid-2">
              <div className="wizard-field">
                <label>Ciudad *</label>
                <select
                  value={storeForm.city}
                  onChange={(e) => setStore('city', e.target.value)}
                >
                  <option value="">Seleccione una ciudad</option>
                  {ciudades.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="wizard-field">
                <label>Tienda *</label>
                <select
                  value={storeForm.store}
                  onChange={(e) => setStore('store', e.target.value)}
                  disabled={!storeForm.city}
                >
                  <option value="">Seleccione una tienda</option>
                  {filteredTiendas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                {errors.store && <span className="field-error">{errors.store}</span>}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECCIÓN DOMICILIO — Nombre + Estado + Municipio + Parroquia + Dirección
          ══════════════════════════════════════════════════════════════ */}
          {tipo === 'home' && (
            <>
              {/* Nombre de la dirección */}
              <div className="wizard-field">
                <label>Nombre de la Dirección *</label>
                <input
                  placeholder="Ej. Casa, Oficina, etc."
                  maxLength={40}
                  value={homeForm.alias}
                  onChange={(e) => setHome('alias', e.target.value)}
                />
                {errors.alias && <span className="field-error">{errors.alias}</span>}
              </div>

              {/* Estado + Municipio + Parroquia en grid 3 columnas */}
              <div className="wizard-grid-3">
                <div className="wizard-field">
                  <label>Estado *</label>
                  <select value={homeForm.idEstado} onChange={(e) => setHome('idEstado', e.target.value)}>
                    <option value="">Seleccione un estado</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  {errors.idEstado && <span className="field-error">{errors.idEstado}</span>}
                </div>

                <div className="wizard-field">
                  <label>Municipio *</label>
                  <select
                    value={homeForm.idMunicipio}
                    onChange={(e) => setHome('idMunicipio', e.target.value)}
                    disabled={!homeForm.idEstado || loadingGeo}
                  >
                    <option value="">
                      {loadingGeo ? 'Cargando...' : 'Seleccione un municipio'}
                    </option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors.idMunicipio && <span className="field-error">{errors.idMunicipio}</span>}
                </div>

                <div className="wizard-field">
                  <label>Parroquia *</label>
                  <select
                    value={homeForm.idParroquia}
                    onChange={(e) => { setHome('idParroquia', e.target.value); setErrors(p => ({ ...p, idParroquia: '' })); }}
                    disabled={!homeForm.idMunicipio}
                    className={errors.idParroquia ? 'input--error' : ''}
                  >
                    <option value="">Seleccione una parroquia</option>
                    {parroquias.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.idParroquia && <span className="field-error">{errors.idParroquia}</span>}
                </div>
              </div>

              {/* Dirección completa */}
              <div className="wizard-field">
                <label>Dirección Completa *</label>
                <textarea
                  className="addr-modal__textarea"
                  placeholder="Ej: Barrio, Vicario 3, Carrera 9 entre Calles 5 y 7"
                  rows={3}
                  maxLength={150}
                  value={homeForm.direccion}
                  onChange={(e) => setHome('direccion', e.target.value)}
                />
                {errors.direccion && <span className="field-error">{errors.direccion}</span>}
              </div>

              {/* Punto de referencia */}
              <div className="wizard-field">
                <label>Punto de Referencia <span className="label-optional">(opcional)</span></label>
                <textarea
                  className="addr-modal__textarea"
                  placeholder="Punto de referencia adicional (opcional)"
                  rows={2}
                  maxLength={MAX_REFERENCIA}
                  value={homeForm.referencia}
                  onChange={(e) => setHome('referencia', e.target.value)}
                />
                {errors.referencia && <span className="field-error">{errors.referencia}</span>}
              </div>

              {/* Predeterminada */}
              <label className="addr-modal__checkbox">
                <input
                  type="checkbox"
                  checked={homeForm.setAsDefault}
                  onChange={(e) => setHome('setAsDefault', e.target.checked)}
                />
                <span>Establecer como dirección predeterminada</span>
              </label>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════
              DATOS DEL DESTINATARIO — se registra como Cliente real, sin su
              consentimiento, igual que krakenAdmin en Nuevo Envío Prepaid.
          ══════════════════════════════════════════════════════════════ */}
          <h4 className="addr-modal__section-title">Datos del destinatario</h4>
          <p className="addr-modal__section-hint">
            Con estos datos se registra al destinatario en Kraken para que pueda hacer seguimiento de su envío.
          </p>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>Nombres *</label>
              <input
                placeholder="Nombres"
                maxLength={50}
                value={contactoForm.nombres}
                onChange={(e) => setContacto('nombres', e.target.value)}
              />
              {errors.cNombres && <span className="field-error">{errors.cNombres}</span>}
            </div>
            <div className="wizard-field">
              <label>Apellidos</label>
              <input
                placeholder="Apellidos"
                maxLength={50}
                value={contactoForm.apellidos}
                onChange={(e) => setContacto('apellidos', e.target.value)}
              />
              {errors.cApellidos && <span className="field-error">{errors.cApellidos}</span>}
            </div>
          </div>

          <div className="wizard-field">
            <label>Teléfono (Venezuela) *</label>
            <div className="phone-ve-row">
              <select
                className={`phone-ve-operator${errors.cTelefono ? ' input--error' : ''}`}
                value={contactoForm.telOperator}
                onChange={(e) => setContacto('telOperator', e.target.value)}
              >
                <option value="">Operadora</option>
                {VENEZ_OPERATORS.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                className={`phone-ve-number${errors.cTelefono ? ' input--error' : ''}`}
                placeholder="000-00-00"
                value={contactoForm.telDigits}
                onChange={(e) => setContacto('telDigits', formatVenezPhone(e.target.value))}
                inputMode="numeric"
                disabled={!contactoForm.telOperator}
              />
            </div>
            {errors.cTelefono && <span className="field-error">{errors.cTelefono}</span>}
          </div>

          <div className="wizard-field">
            <label>Email <span className="label-optional">(opcional)</span></label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              maxLength={100}
              value={contactoForm.email}
              onChange={(e) => setContacto('email', e.target.value)}
            />
            {errors.cEmail && <span className="field-error">{errors.cEmail}</span>}
          </div>

          <div className="wizard-field wizard-field--full">
            <label>Identificación *</label>
            <div className="doc-ident-row">
              <select
                className={`doc-type${errors.docType ? ' input--error' : ''}`}
                value={contactoForm.docType}
                onChange={(e) => { setContacto('docType', e.target.value); setContacto('docNum', ''); }}
              >
                <option value="">Tipo de documento</option>
                {VE_DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <div className={`doc-num-wrapper${errors.docNum ? ' doc-num-wrapper--error' : ''}`}>
                {VE_DOC_PREFIX_MAP[contactoForm.docType] && (
                  <span className="doc-prefix">{VE_DOC_PREFIX_MAP[contactoForm.docType]}-</span>
                )}
                <input
                  className="doc-num-input"
                  placeholder={VE_DOC_CONFIG[contactoForm.docType]?.hint ?? 'Número'}
                  value={contactoForm.docNum}
                  onChange={(e) => setContacto('docNum', cleanVeDocInput(contactoForm.docType, e.target.value))}
                  disabled={!contactoForm.docType}
                  inputMode={/cedula/.test(contactoForm.docType) ? 'numeric' : 'text'}
                />
              </div>
            </div>
            {(errors.docType || errors.docNum) && (
              <span className="field-error">{errors.docType || errors.docNum}</span>
            )}
          </div>
        </div>

        <div className="addr-modal__footer">
          <button className="btn-wizard-back" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn-wizard-next" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Dirección'}
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
  const clientId = getClientId();
  const confirmAlert = useCustomAlert();

  const [originList, setOriginList] = useState([]);
  const [destList,   setDestList]   = useState([]);
  const [loading,    setLoading]    = useState({ origin: true, dest: true });
  const [saving,     setSaving]     = useState(false);
  const [modal,      setModal]      = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const { user } = useAuth();
  const [errors,     setErrors]     = useState({});

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
  const handleDelete = useCallback((type, id) => {
    confirmAlert.showDeleteConfirm('esta dirección', async () => {
      confirmAlert.hideAlert();
      if (type === 'origin') {
        const res = await deleteOriginAddress(clientId, id);
        if (res.success) {
          setOriginList((p) => p.filter((a) => a.id !== id));
          if (data.originAddressId === id) updateData({ originAddressId: null });
          toast.success('Dirección de origen eliminada');
        } else { toast.error(res.message); }
      } else {
        const res = await deleteDestinationAddress(clientId, id);
        if (res.success) {
          setDestList((p) => p.filter((a) => a.id !== id));
          if (data.destinationAddressId === id) updateData({ destinationAddressId: null });
          toast.success('Dirección de destino eliminada');
        } else { toast.error(res.message); }
      }
    }, () => {});
  }, [clientId, data, updateData]);

  // ── Predeterminada ─────────────────────────────────────────────────────────
  const handleSetDefault = useCallback(async (type, id) => {
    if (type === 'origin') {
      const res = await setOriginDefault(clientId, id);
      if (res.success) {
        setOriginList((p) => p.map((a) => ({ ...a, esPredeterminada: a.id === id })));
        toast.success('Predeterminada de origen actualizada');
      } else { toast.error(res.message); }
    } else {
      const res = await setDestinationDefault(clientId, id);
      if (res.success) {
        setDestList((p) => p.map((a) => ({ ...a, esPredeterminada: a.id === id })));
        toast.success('Predeterminada de destino actualizada');
      } else { toast.error(res.message); }
    }
  }, [clientId]);

  // ── Guardar dirección ORIGEN ───────────────────────────────────────────────
  const handleSaveOrigin = async (formData) => {
    setSaving(true);
    const res = await addOriginAddress({ clientId, ...formData });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }

    const card = {
      id:              res.data.id,
      alias:           res.data.alias,
      line1:           res.data.line1,
      city:            res.data.city,
      zip:             res.data.zip,
      phone:           res.data.phone,
      esPredeterminada: res.data.esPredeterminada ?? formData.setAsDefault,
    };
    setOriginList((p) => {
      const lista = formData.setAsDefault ? p.map((a) => ({ ...a, esPredeterminada: false })) : [...p];
      return [...lista, card];
    });
    updateData({ originAddressId: res.data.id });
    setModal(null);
    toast.success('Dirección de origen guardada ✅');
  };

  // ── Guardar dirección DESTINO ──────────────────────────────────────────────
  const handleSaveDestination = async (formData) => {
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
      // ✅ FIX: Guardar idLocker para poder enriquecer si idEstado es null
      idLocker:         formData.idLocker ?? null,
    };
    setDestList((p) => {
      const lista = formData.setAsDefault ? p.map((a) => ({ ...a, esPredeterminada: false })) : [...p];
      return [...lista, card];
    });
    updateData({ destinationAddressId: res.data.id });
    setModal(null);
    toast.success('Dirección de destino guardada ✅');
  };

  // ── Continuar ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    const e = {};
    if (!data.originAddressId)      e.origin = 'Selecciona o añade una dirección de origen';
    if (!data.destinationAddressId) e.dest   = 'Selecciona o añade una dirección de destino';
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

    // ✅ Pasar ambas listas para que el wizard pueda guardar los objetos seleccionados
    onNext({ destList: enrichedDestList, originList });
  };

  return (
    <div>
      <div className="wizard-card">
        <h2 className="wizard-card__title"><IoLocationOutline size={22} style={{ verticalAlign: 'middle' }} /> Recogida y Entrega</h2>
        <p className="wizard-card__subtitle">
          Selecciona las direcciones de origen y destino de tu envío
        </p>

        {(errors.origin || errors.dest) && (
          <div className="addr-error-banner">
            {errors.origin && <span>⚠️ {errors.origin}</span>}
            {errors.dest   && <span>⚠️ {errors.dest}</span>}
          </div>
        )}

        <div className="addr-columns">
          <AddressColumn
            title="Origen" flag="🇪🇸" country="España"
            addresses={originList} selectedId={data.originAddressId}
            loading={loading.origin}
            userInfo={user ? { name: [user.name, user.lastName].filter(Boolean).join(' '), email: user.email } : null}
            onSelect={(id) => { updateData({ originAddressId: id }); setErrors((p) => ({ ...p, origin: null })); }}
            onView={(id) => { const a = originList.find((x) => x.id === id); if (a) setViewDetail({ type: 'origin', data: a }); }}
            onAdd={() => setModal('origin')}
            onDelete={(id) => handleDelete('origin', id)}
            onSetDefault={(id) => handleSetDefault('origin', id)}
          />
          <AddressColumn
            title="Destino" flag="🇻🇪" country="Venezuela"
            addresses={destList} selectedId={data.destinationAddressId}
            loading={loading.dest}
            onSelect={(id) => { updateData({ destinationAddressId: id }); setErrors((p) => ({ ...p, dest: null })); }}
            onView={(id) => { const a = destList.find((x) => x.id === id); if (a) setViewDetail({ type: 'dest', data: a }); }}
            onAdd={() => setModal('dest')}
            onDelete={(id) => handleDelete('dest', id)}
            onSetDefault={(id) => handleSetDefault('dest', id)}
          />
        </div>
      </div>

      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        <button
          className="btn-wizard-next"
          onClick={handleNext}
          disabled={calculating}
        >
          {calculating ? '⏳ Calculando tarifa...' : 'Continuar →'}
        </button>        
      </div>

      {modal === 'origin' && (
        <OriginModal onSave={handleSaveOrigin} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal === 'dest' && (
        <DestinationModal onSave={handleSaveDestination} onClose={() => setModal(null)} saving={saving} allTiendasProp={allTiendas}  />
      )}

      {viewDetail && (
        <div className="addr-detail-overlay" onClick={() => setViewDetail(null)}>
          <div className="addr-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="addr-detail-modal__header">
              <h3>{viewDetail.type === 'origin' ? 'Dirección de Origen' : 'Dirección de Destino'}</h3>
              <button onClick={() => setViewDetail(null)}><IoCloseOutline size={22} /></button>
            </div>
            <div className="addr-detail-modal__body">
              {viewDetail.type === 'origin' ? (
                <>
                  <DetailRow label="Alias" value={viewDetail.data.alias} />
                  <DetailRow label="Dirección" value={viewDetail.data.line1} />
                  <DetailRow label="Ciudad" value={viewDetail.data.city} />
                  <DetailRow label="Provincia" value={viewDetail.data.province} />
                  <DetailRow label="Código Postal" value={viewDetail.data.zip} />
                  <DetailRow label="Teléfono" value={viewDetail.data.phone} />
                  <DetailRow label="Referencia" value={viewDetail.data.referencia} />
                  <DetailRow label="Predeterminada" value={viewDetail.data.esPredeterminada ? 'Sí' : 'No'} />
                </>
              ) : (
                <>
                  <DetailRow label="Alias" value={viewDetail.data.alias} />
                  <DetailRow label="Tipo" value={viewDetail.data.tipoDireccion === 'store' ? 'Retiro en tienda' : 'Domicilio'} />
                  {viewDetail.data.nombreLocker && <DetailRow label="Tienda" value={viewDetail.data.nombreLocker} />}
                  <DetailRow label="Dirección" value={viewDetail.data.line1} />
                  <DetailRow label="Estado" value={viewDetail.data.city} />
                  <DetailRow label="Referencia" value={viewDetail.data.referencia} />
                  <DetailRow label="Predeterminada" value={viewDetail.data.esPredeterminada ? 'Sí' : 'No'} />
                  {(viewDetail.data.contactoNombres || viewDetail.data.contactoTelefono) && (
                    <>
                      <h4 style={{ margin: '20px 0 10px', color: '#022364', fontSize: '15px', fontWeight: '700' }}>
                        <IoPersonOutline size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Contacto de entrega
                      </h4>
                      <DetailRow label="Nombres" value={viewDetail.data.contactoNombres} />
                      <DetailRow label="Apellidos" value={viewDetail.data.contactoApellidos} />
                      <DetailRow label="Email" value={viewDetail.data.contactoEmail} />
                      <DetailRow label="Teléfono" value={viewDetail.data.contactoTelefono} />
                    </>
                  )}
                </>
              )}
            </div>
            <button className="addr-detail-modal__close-btn" onClick={() => setViewDetail(null)}>Cerrar</button>
          </div>
        </div>
      )}

      <CustomAlert {...confirmAlert.alertProps} />
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="addr-detail-modal__row">
      <span className="addr-detail-modal__label">{label}</span>
      <span className="addr-detail-modal__value">{value}</span>
    </div>
  );
};

export default Step2Addresses;