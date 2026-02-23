// src/modules/es/pages/ShipmentWizard/steps/Step2Addresses.jsx
// ✅ Paso 2: Selección de dirección de ORIGEN (España) y DESTINO (Venezuela)
//    DestinationModal sigue la misma lógica que /profile/addresses de la app

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
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
// ██  TARJETA DE DIRECCIÓN
// ════════════════════════════════════════════════════════════════════════════
const AddressCard = ({ address, selected, onSelect, onDelete, onSetDefault, flag }) => (
  <button
    type="button"
    className={`addr-card ${selected ? 'addr-card--selected' : ''}`}
    onClick={() => onSelect(address.id)}
  >
    {address.esPredeterminada && (
      <span className="addr-card__badge">⭐ Predeterminada</span>
    )}
    {selected && <span className="addr-card__check">✓</span>}

    <div className="addr-card__body">
      <p className="addr-card__alias">{flag} {address.alias}</p>
      <p className="addr-card__line">{address.line1}</p>
      {address.city && (
        <p className="addr-card__line">
          {address.city}{address.zip ? ` - ${address.zip}` : ''}
        </p>
      )}
      {address.phone && <p className="addr-card__phone">📞 {address.phone}</p>}
      {address.tipoDireccion === 'store' && address.nombreLocker && (
        <p className="addr-card__line">🏪 {address.nombreLocker}</p>
      )}
    </div>

    <div className="addr-card__actions" onClick={(e) => e.stopPropagation()}>
      {!address.esPredeterminada && (
        <button
          className="addr-card__action-btn addr-card__action-btn--star"
          title="Marcar como predeterminada"
          onClick={() => onSetDefault(address.id)}
        >☆</button>
      )}
      <button
        className="addr-card__action-btn addr-card__action-btn--danger"
        title="Eliminar"
        onClick={() => onDelete(address.id)}
      >🗑️</button>
    </div>
  </button>
);

// ════════════════════════════════════════════════════════════════════════════
// ██  COLUMNA DE DIRECCIONES
// ════════════════════════════════════════════════════════════════════════════
const AddressColumn = ({
  title, flag, country, addresses, selectedId,
  onSelect, onAdd, onDelete, onSetDefault, loading,
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
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            flag={flag}
          />
        ))}
        <button className="addr-add-btn" onClick={onAdd}>
          <span className="addr-add-btn__icon">+</span>
          <span>Añadir Nueva Dirección</span>
        </button>
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
    if (!form.line1.trim()) e.line1 = 'La dirección es obligatoria';
    if (!form.city.trim())  e.city  = 'La ciudad es obligatoria';
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
            <input placeholder="Ej. Casa, Oficina..." value={form.alias} onChange={(e) => set('alias', e.target.value)} />
            {errors.alias && <span className="field-error">{errors.alias}</span>}
          </div>

          <div className="wizard-field">
            <label>Dirección *</label>
            <input placeholder="Calle de Alcalá 123, 2º A" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
            {errors.line1 && <span className="field-error">{errors.line1}</span>}
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>Ciudad *</label>
              <input placeholder="Madrid" value={form.city} onChange={(e) => set('city', e.target.value)} />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="wizard-field">
              <label>Provincia</label>
              <input placeholder="Madrid" value={form.province} onChange={(e) => set('province', e.target.value)} />
            </div>
          </div>

          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>Código Postal</label>
              <input placeholder="28001" maxLength={10} value={form.zip} onChange={(e) => set('zip', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>Teléfono</label>
              <input placeholder="+34 600 000 000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="wizard-field">
            <label>Referencia adicional</label>
            <input placeholder="Portero automático #3, timbre azul..." value={form.referencia} onChange={(e) => set('referencia', e.target.value)} />
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
  const [tipo, setTipo] = useState('store'); // 'store' | 'home'

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

  const setStore = (k, v) => setStoreForm((p) => ({ ...p, [k]: v }));
  const setHome  = (k, v) => setHomeForm((p) => ({ ...p, [k]: v }));

  // ── Tiendas filtradas por ciudad (idZonaCiudad) ────────────────────────────
  // Mismo patrón que DeliveryOption.jsx → filteredStores
  const filteredTiendas = useMemo(() => {
    if (!allTiendas.length) return [];
    return allTiendas.filter((t) => {
      const tipoValido = t.idTiendaTipo === 2 || t.idTiendaTipo === 3;
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
      if (!homeForm.alias.trim())    e.alias    = 'El nombre de la dirección es obligatorio';
      if (!homeForm.idEstado)        e.idEstado = 'Selecciona un estado';
      if (!homeForm.idMunicipio)     e.idMunicipio = 'Selecciona un municipio';
      if (!homeForm.direccion.trim()) e.direccion = 'La dirección es obligatoria';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

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
            <>
              <div className="wizard-grid-2">
                {/* Ciudad */}
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

                {/* Tienda (se habilita al tener ciudad) */}
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
            </>
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
                  <label>Parroquia <span className="label-optional">(opcional)</span></label>
                  <select
                    value={homeForm.idParroquia}
                    onChange={(e) => setHome('idParroquia', e.target.value)}
                    disabled={!homeForm.idMunicipio}
                  >
                    <option value="">Seleccione una parroquia</option>
                    {parroquias.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dirección completa */}
              <div className="wizard-field">
                <label>Dirección Completa *</label>
                <textarea
                  className="addr-modal__textarea"
                  placeholder="Ej: Barrio, Vicario 3, Carrera 9 entre Calles 5 y 7"
                  rows={3}
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
                <span>Establecer como dirección predeterminada</span>
              </label>
            </>
          )}
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
const Step2Addresses = ({ data, updateData, onNext, onBack }) => {
  const clientId = getClientId();

  const [originList, setOriginList] = useState([]);
  const [destList,   setDestList]   = useState([]);
  const [loading,    setLoading]    = useState({ origin: true, dest: true });
  const [saving,     setSaving]     = useState(false);
  const [modal,      setModal]      = useState(null);
  const [errors,     setErrors]     = useState({});

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
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
    if (!window.confirm('¿Eliminar esta dirección?')) return;
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
      id:              res.data.id,
      alias:           res.data.alias,
      line1:           formData.direccion ?? '',
      tipoDireccion:   formData.tipoDireccion,
      esPredeterminada: res.data.esPredeterminada ?? formData.setAsDefault,
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
    onNext();
  };

  return (
    <div>
      <div className="wizard-card">
        <h2 className="wizard-card__title">📍 Recogida y Entrega</h2>
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
            onSelect={(id) => { updateData({ originAddressId: id }); setErrors((p) => ({ ...p, origin: null })); }}
            onAdd={() => setModal('origin')}
            onDelete={(id) => handleDelete('origin', id)}
            onSetDefault={(id) => handleSetDefault('origin', id)}
          />
          <AddressColumn
            title="Destino" flag="🇻🇪" country="Venezuela"
            addresses={destList} selectedId={data.destinationAddressId}
            loading={loading.dest}
            onSelect={(id) => { updateData({ destinationAddressId: id }); setErrors((p) => ({ ...p, dest: null })); }}
            onAdd={() => setModal('dest')}
            onDelete={(id) => handleDelete('dest', id)}
            onSetDefault={(id) => handleSetDefault('dest', id)}
          />
        </div>
      </div>

      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        <button className="btn-wizard-next" onClick={handleNext}>Continuar →</button>
      </div>

      {modal === 'origin' && (
        <OriginModal onSave={handleSaveOrigin} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal === 'dest' && (
        <DestinationModal onSave={handleSaveDestination} onClose={() => setModal(null)} saving={saving} />
      )}
    </div>
  );
};

export default Step2Addresses;