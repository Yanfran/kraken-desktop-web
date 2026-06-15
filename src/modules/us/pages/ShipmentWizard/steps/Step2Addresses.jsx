// src/modules/es/pages/ShipmentWizard/steps/Step2Addresses.jsx
// ✅ Paso 2: Selección de dirección de ORIGEN (España) y DESTINO (Venezuela)
//    DestinationModal sigue la misma lógica que /profile/addresses de la app

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
        <button className="addr-add-btn" onClick={onAdd}>
          <span className="addr-add-btn__icon">+</span>
          <span>{t('us_wizard.add_address')}</span>
        </button>
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
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.alias.trim()) e.alias = t('us_wizard.error_alias');
    if (!form.line1.trim()) e.line1 = t('us_wizard.error_address');
    if (!form.city.trim())  e.city  = t('us_wizard.error_city_req');
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
              <input placeholder="28001" maxLength={10} value={form.zip} onChange={(e) => set('zip', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>{t('us_wizard.field_phone')}</label>
              <input
                placeholder="+1 305 555 0123"
                value={form.phone}
                onChange={(e) => set('phone', sanitizePhone(e.target.value))}
                maxLength={20}
                inputMode="tel"
              />
            </div>
          </div>

          <div className="wizard-field">
            <label>{t('us_wizard.field_ref')}</label>
            <input placeholder="Portero automático #3, timbre azul..." value={form.referencia} onChange={(e) => set('referencia', e.target.value)} />
          </div>

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
    nombres: '', apellidos: '', email: '', telefono: '',
    telefonoAdicional: '', numeroIdentificacion: '',
    informacionAdicional: '', referenciaContacto: '',
  });
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
    if (!contactoForm.telefono.trim()) e.telefono = t('us_wizard.error_phone');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

    const contactoPayload = {
      contactoNombres:              contactoForm.nombres,
      contactoApellidos:            contactoForm.apellidos,
      contactoEmail:                contactoForm.email,
      contactoTelefono:             contactoForm.telefono,
      contactoTelefonoAdicional:    contactoForm.telefonoAdicional,
      contactoNumeroIdentificacion: contactoForm.numeroIdentificacion,
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

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>{t('us_wizard.field_contact_phone')} *</label>
              <input
                placeholder="Ej. 0412-1234567"
                value={contactoForm.telefono}
                onChange={(e) => { setContacto('telefono', sanitizePhone(e.target.value)); setErrors(p => ({ ...p, telefono: '' })); }}
                className={errors.telefono ? 'input--error' : ''}
                maxLength={20}
                inputMode="tel"
              />
              {errors.telefono && <span className="field-error">{errors.telefono}</span>}
            </div>
            <div className="wizard-field">
              <label>{t('us_wizard.field_phone2')} <span className="label-optional">({t('common.optional')})</span></label>
              <input
                placeholder="Opcional"
                value={contactoForm.telefonoAdicional}
                onChange={(e) => setContacto('telefonoAdicional', sanitizePhone(e.target.value))}
                maxLength={20}
                inputMode="tel"
              />
            </div>
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>{t('us_wizard.field_email')} <span className="label-optional">({t('common.optional')})</span></label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={contactoForm.email}
                onChange={(e) => setContacto('email', e.target.value)}
              />
            </div>
            <div className="wizard-field">
              <label>{t('us_wizard.field_id')} <span className="label-optional">({t('common.optional')})</span></label>
              <input
                placeholder="Ej. V-12345678"
                value={contactoForm.numeroIdentificacion}
                onChange={(e) => setContacto('numeroIdentificacion', e.target.value)}
              />
            </div>
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
  const clientId = getClientId();

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
    setSaving(true);
    const res = await addOriginAddress({ clientId, ...formData });
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
    toast.success(t('us_wizard.dest_saved'));
  };

  // ── Continuar ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    const e = {};
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