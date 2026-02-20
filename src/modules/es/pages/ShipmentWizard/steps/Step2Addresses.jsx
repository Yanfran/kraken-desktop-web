// src/modules/es/pages/ShipmentWizard/steps/Step2Addresses.jsx
// Paso 2: Selección de dirección de origen (España) y destino (Venezuela)
// El usuario elige de sus direcciones guardadas o añade una nueva

import React, { useState, useEffect, useCallback } from 'react';
import './Step2Addresses.scss';

// ── Mock service — reemplazar con llamada real al backend ────────────────────
// GET /api/addresses?type=origin  (origin = España, destination = Venezuela)
const mockFetchAddresses = async (type) => {
  await new Promise((r) => setTimeout(r, 400));
  if (type === 'origin') {
    return [
      { id: 1, alias: 'Juan Pérez',    line1: 'Calle de Alcalá, 123, 4º A', city: 'Madrid', zip: '28001', phone: '+34 612 345 678' },
      { id: 2, alias: 'Empresa ABC',   line1: 'Paseo de la Castellana, 456', city: 'Madrid', zip: '28046', phone: '+34 698 765 432' },
      { id: 3, alias: 'Hogar',         line1: 'Avenida de América, 789',     city: 'Madrid', zip: '28002', phone: '+34 655 112 233' },
      { id: 4, alias: 'Familiar',      line1: 'Calle Las Flores, Qta. La Paz', city: 'Madrid', zip: '28001', phone: '+34 424 555 8899' },
    ];
  }
  return [
    { id: 10, alias: 'Ana García',      line1: 'Av. Principal de Las Mercedes, Edif. A, Piso 1', city: 'Caracas', zip: '1060', phone: '+58 414 123 4567' },
    { id: 11, alias: 'Oficina Centro',  line1: 'Av. Urdaneta, Torre B, PB',                       city: 'Caracas', zip: '1010', phone: '+58 412 987 6543' },
    { id: 12, alias: 'Familiar',        line1: 'Calle Las Flores, Qta. La Paz',                   city: 'Valencia', zip: '2001', phone: '+58 424 555 8899' },
  ];
};

// ── Tarjeta de dirección ─────────────────────────────────────────────────────
const AddressCard = ({ address, selected, onSelect, onEdit, onDelete, flag }) => (
  <button
    type="button"
    className={`addr-card ${selected ? 'addr-card--selected' : ''}`}
    onClick={() => onSelect(address.id)}
  >
    {selected && <span className="addr-card__check">✓</span>}
    <div className="addr-card__body">
      <p className="addr-card__alias">{address.alias}</p>
      <p className="addr-card__line">{address.line1}</p>
      <p className="addr-card__line">{address.city} {address.zip}</p>
      <p className="addr-card__phone">{address.phone}</p>
    </div>
    <div className="addr-card__actions" onClick={(e) => e.stopPropagation()}>
      <button className="addr-card__action-btn" onClick={() => onEdit(address)} title="Editar">✏️</button>
      <button className="addr-card__action-btn addr-card__action-btn--danger" onClick={() => onDelete(address.id)} title="Eliminar">🗑️</button>
    </div>
  </button>
);

// ── Modal simple para añadir dirección ──────────────────────────────────────
const AddAddressModal = ({ type, onSave, onClose }) => {
  const [form, setForm] = useState({ alias: '', line1: '', city: '', zip: '', phone: '' });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.alias || !form.line1 || !form.city) return;
    onSave({ ...form, id: Date.now() });
    onClose();
  };

  return (
    <div className="addr-modal-backdrop" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="addr-modal__header">
          <h3>Añadir dirección de {type === 'origin' ? 'Origen 🇪🇸' : 'Destino 🇻🇪'}</h3>
          <button className="addr-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="addr-modal__body">
          <div className="wizard-field">
            <label>Nombre / Alias *</label>
            <input placeholder="Ej. Casa, Oficina..." value={form.alias} onChange={(e) => set('alias', e.target.value)} />
          </div>
          <div className="wizard-field">
            <label>Dirección *</label>
            <input placeholder="Calle, número, piso..." value={form.line1} onChange={(e) => set('line1', e.target.value)} />
          </div>
          <div className="wizard-grid-2">
            <div className="wizard-field">
              <label>Ciudad *</label>
              <input placeholder="Madrid / Caracas..." value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div className="wizard-field">
              <label>Código Postal</label>
              <input placeholder="28001" value={form.zip} onChange={(e) => set('zip', e.target.value)} />
            </div>
          </div>
          <div className="wizard-field">
            <label>Teléfono</label>
            <input placeholder="+34 600 000 000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
        </div>

        <div className="addr-modal__footer">
          <button className="btn-wizard-back" onClick={onClose}>Cancelar</button>
          <button className="btn-wizard-next" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

// ── Columna de direcciones ───────────────────────────────────────────────────
const AddressColumn = ({
  title, flag, country, addresses, selectedId,
  onSelect, onAdd, onEdit, onDelete, loading
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
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            selected={addr.id === selectedId}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            flag={flag}
          />
        ))}

        {/* Botón añadir nueva */}
        <button className="addr-add-btn" onClick={onAdd}>
          <span className="addr-add-btn__icon">+</span>
          <span>Añadir Nueva Dirección</span>
        </button>
      </div>
    )}
  </div>
);

// ── Componente principal del paso 2 ─────────────────────────────────────────
const Step2Addresses = ({ data, updateData, onNext, onBack }) => {
  const [originList, setOriginList] = useState([]);
  const [destList,   setDestList]   = useState([]);
  const [loading, setLoading] = useState({ origin: true, dest: true });
  const [modal, setModal]    = useState(null); // null | 'origin' | 'dest'
  const [errors, setErrors]  = useState({});

  // Carga inicial de direcciones
  useEffect(() => {
    mockFetchAddresses('origin').then((r) => {
      setOriginList(r);
      setLoading((p) => ({ ...p, origin: false }));
    });
    mockFetchAddresses('dest').then((r) => {
      setDestList(r);
      setLoading((p) => ({ ...p, dest: false }));
    });
  }, []);

  const handleDelete = useCallback((type, id) => {
    if (type === 'origin') {
      setOriginList((p) => p.filter((a) => a.id !== id));
      if (data.originAddressId === id) updateData({ originAddressId: null });
    } else {
      setDestList((p) => p.filter((a) => a.id !== id));
      if (data.destinationAddressId === id) updateData({ destinationAddressId: null });
    }
  }, [data, updateData]);

  const handleSave = (type, addr) => {
    if (type === 'origin') {
      setOriginList((p) => [...p, addr]);
      updateData({ originAddressId: addr.id });
    } else {
      setDestList((p) => [...p, addr]);
      updateData({ destinationAddressId: addr.id });
    }
  };

  const handleNext = () => {
    const e = {};
    if (!data.originAddressId)      e.origin = 'Selecciona una dirección de origen';
    if (!data.destinationAddressId) e.dest   = 'Selecciona una dirección de destino';
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <div>
      <div className="wizard-card">
        <h2 className="wizard-card__title">📍 Recogida y Entrega</h2>
        <p className="wizard-card__subtitle">Selecciona las direcciones de origen y destino de tu envío</p>

        {/* Aviso de errores */}
        {(errors.origin || errors.dest) && (
          <div className="addr-error-banner">
            {errors.origin && <span>⚠️ {errors.origin}</span>}
            {errors.dest   && <span>⚠️ {errors.dest}</span>}
          </div>
        )}

        <div className="addr-columns">
          <AddressColumn
            title="Origen"
            flag="🇪🇸"
            country="España"
            addresses={originList}
            selectedId={data.originAddressId}
            loading={loading.origin}
            onSelect={(id) => { updateData({ originAddressId: id }); setErrors((p) => ({ ...p, origin: null })); }}
            onAdd={() => setModal('origin')}
            onEdit={() => {/* TODO: abrir modal de edición */}}
            onDelete={(id) => handleDelete('origin', id)}
          />

          <AddressColumn
            title="Destino"
            flag="🇻🇪"
            country="Venezuela"
            addresses={destList}
            selectedId={data.destinationAddressId}
            loading={loading.dest}
            onSelect={(id) => { updateData({ destinationAddressId: id }); setErrors((p) => ({ ...p, dest: null })); }}
            onAdd={() => setModal('dest')}
            onEdit={() => {/* TODO: abrir modal de edición */}}
            onDelete={(id) => handleDelete('dest', id)}
          />
        </div>
      </div>

      <div className="wizard-actions">
        <button className="btn-wizard-back" onClick={onBack}>← Volver</button>
        <button className="btn-wizard-next" onClick={handleNext}>Continuar →</button>
      </div>

      {/* Modal para añadir dirección */}
      {modal && (
        <AddAddressModal
          type={modal}
          onSave={(addr) => handleSave(modal, addr)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default Step2Addresses;