import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { useCustomAlert } from '../../../../hooks/useCustomAlert';
import CustomAlert from '../../../../components/common/CustomAlert/CustomAlert';
import {
  IoEyeOutline,
  IoTrashOutline,
  IoStarOutline,
  IoStar,
  IoAdd,
  IoClose,
  IoLocationOutline,
  IoCallOutline,
  IoPersonOutline,
  IoChevronBack,
  IoPencilOutline,
} from 'react-icons/io5';
import {
  fetchUsaOriginAddresses,
  addUsaOriginAddress,
  deleteUsaOriginAddress,
  setUsaOriginDefault,
  updateUsaOriginAddress,
  fetchUsaDestinationAddresses,
  deleteUsaDestinationAddress,
  setUsaDestinationDefault,
} from '../../../../services/us/usAddressService';
import { addDestinationAddress, updateDestinationAddress } from '../../../../services/es/spainAddressService';
import { OriginModal, DestinationModal } from '../ShipmentWizard/steps/Step2Addresses';
import './AddressesPage.scss';

const MAX_ADDRESSES = 4;

const AddressesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const clientId = user?.id ? Number(user.id) : 0;
  const alert = useCustomAlert();

  const [originList, setOriginList] = useState([]);
  const [destList, setDestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [addModal, setAddModal] = useState(null);  // 'origin' | 'dest' | null
  const [editModal, setEditModal] = useState(null); // { type: 'origin'|'dest', data: object } | null
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const [oRes, dRes] = await Promise.allSettled([
      fetchUsaOriginAddresses(clientId),
      fetchUsaDestinationAddresses(clientId),
    ]);
    setOriginList(oRes.status === 'fulfilled' ? oRes.value.data : []);
    setDestList(dRes.status === 'fulfilled' ? dRes.value.data : []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (type, id, name) => {
    alert.showDeleteConfirm(
      name,
      async () => {
        try {
          setDeleting(id);
          const res = type === 'origin'
            ? await deleteUsaOriginAddress(clientId, id)
            : await deleteUsaDestinationAddress(clientId, id);
          if (res.success) {
            alert.hideAlert();
            toast.success('Dirección eliminada');
            load();
          } else {
            alert.hideAlert();
            toast.error(res.message || 'Error al eliminar');
          }
        } catch {
          alert.hideAlert();
          toast.error('Error al eliminar la dirección');
        } finally {
          setDeleting(null);
        }
      },
      () => {}
    );
  };

  const handleSetDefault = async (type, id) => {
    const res = type === 'origin'
      ? await setUsaOriginDefault(clientId, id)
      : await setUsaDestinationDefault(clientId, id);
    if (res.success) { toast.success('Dirección predeterminada actualizada'); load(); }
    else toast.error(res.message || 'Error');
  };

  const handleAddOrigin = async (formData) => {
    setSaving(true);
    const res = await addUsaOriginAddress({ clientId, ...formData, idPais: 2 });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }
    toast.success('Dirección de origen guardada');
    setAddModal(null);
    load();
  };

  const handleAddDest = async (formData) => {
    setSaving(true);
    const res = await addDestinationAddress({ clientId, ...formData });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }
    toast.success('Dirección de destino guardada');
    setAddModal(null);
    load();
  };

  const handleEditOrigin = async (formData) => {
    setSaving(true);
    const res = await updateUsaOriginAddress({ clientId, addressId: editModal.data.id, ...formData });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }
    toast.success('Dirección actualizada');
    setEditModal(null);
    load();
  };

  const handleEditDest = async (formData) => {
    setSaving(true);
    const res = await updateDestinationAddress({ clientId, addressId: editModal.data.id, ...formData });
    setSaving(false);
    if (!res.success) { toast.error(res.message); return; }
    toast.success('Dirección actualizada');
    setEditModal(null);
    load();
  };

  if (loading) {
    return (
      <div className="ku-addr">
        <div className="ku-addr__header-section">
        <button className="ku-addr__back-btn" onClick={() => navigate(-1)}>
          <IoChevronBack size={20} /> <span>Volver</span>
        </button>
        <h1 className="ku-addr__main-title">Mis Direcciones</h1>
        <p className="ku-addr__subtitle">Gestiona tus direcciones de origen y destino</p>
      </div>
        <div className="ku-addr__loading">Cargando direcciones...</div>
      </div>
    );
  }

  return (
    <div className="ku-addr">
      <div className="ku-addr__header-section">
        <button className="ku-addr__back-btn" onClick={() => navigate(-1)}>
          <IoChevronBack size={20} /> <span>Volver</span>
        </button>
        <h1 className="ku-addr__main-title">Mis Direcciones</h1>
        <p className="ku-addr__subtitle">Gestiona tus direcciones de origen y destino</p>
      </div>

      <div className="ku-addr__body">
        {/* ── Origen USA ── */}
        <AddressSection
          title="Origen (USA)"
          flag="us"
          addresses={originList.map((a) => ({
            id: a.id, name: a.alias, line1: a.line1,
            city: [a.city, a.province, a.zip].filter(Boolean).join(', '),
            phone: a.phone, isDefault: a.esPredeterminada,
          }))}
          deleting={deleting}
          onView={(id) => { const a = originList.find((x) => x.id === id); if (a) setViewDetail({ type: 'origin', data: a }); }}
          onEdit={(id) => { const a = originList.find((x) => x.id === id); if (a) setEditModal({ type: 'origin', data: a }); }}
          onDelete={(id, name) => handleDelete('origin', id, name)}
          onSetDefault={(id) => handleSetDefault('origin', id)}
          canAdd={originList.length < MAX_ADDRESSES}
          onAdd={() => setAddModal('origin')}
        />

        <div className="ku-addr__divider" />

        {/* ── Destino Venezuela ── */}
        <AddressSection
          title="Destino (Venezuela)"
          flag="ve"
          addresses={destList.map((a) => ({
            id: a.id,
            name: a.tipoDireccion === 'store' ? `Retiro en tienda: ${a.nombreLocker ?? a.alias}` : `Domicilio: ${a.alias}`,
            line1: a.line1 ?? a.nombreLocker ?? '',
            city: a.city ?? '', phone: a.phone ?? '',
            isDefault: a.esPredeterminada,
          }))}
          deleting={deleting}
          onView={(id) => { const a = destList.find((x) => x.id === id); if (a) setViewDetail({ type: 'dest', data: a }); }}
          onEdit={(id) => { const a = destList.find((x) => x.id === id); if (a) setEditModal({ type: 'dest', data: a }); }}
          onDelete={(id, name) => handleDelete('dest', id, name)}
          onSetDefault={(id) => handleSetDefault('dest', id)}
          canAdd={destList.length < MAX_ADDRESSES}
          onAdd={() => setAddModal('dest')}
        />
      </div>

      {viewDetail && (
        <DetailModal type={viewDetail.type} data={viewDetail.data} onClose={() => setViewDetail(null)} />
      )}

      {addModal === 'origin' && (
        <OriginModal onSave={handleAddOrigin} onClose={() => setAddModal(null)} saving={saving} />
      )}
      {addModal === 'dest' && (
        <DestinationModal onSave={handleAddDest} onClose={() => setAddModal(null)} saving={saving} />
      )}

      {editModal?.type === 'origin' && (
        <OriginModal onSave={handleEditOrigin} onClose={() => setEditModal(null)} saving={saving} initialData={editModal.data} />
      )}
      {editModal?.type === 'dest' && (
        <DestinationModal onSave={handleEditDest} onClose={() => setEditModal(null)} saving={saving} initialData={editModal.data} />
      )}

      <CustomAlert {...alert.alertProps} />
    </div>
  );
};

/* ── Sección de direcciones ─────────────────────────────────────────────── */

const AddressSection = ({ title, flag, addresses, deleting, onView, onEdit, onDelete, onSetDefault, canAdd, onAdd }) => (
  <div className="ku-addr__section">
    <h2 className="ku-addr__section-title">
      <img src={`https://flagcdn.com/24x18/${flag}.png`} alt={flag} width="24" height="18" style={{ borderRadius: 2 }} />
      {title}
    </h2>

    {addresses.length === 0 ? (
      <div className="ku-addr__empty">
        <IoLocationOutline size={40} color="#D1D5DB" />
        <p>No tienes direcciones guardadas</p>
      </div>
    ) : (
      addresses.map((addr) => (
        <div key={addr.id} className={`ku-addr__card ${addr.isDefault ? 'ku-addr__card--default' : ''}`}>
          <div className="ku-addr__card-body">
            <IoLocationOutline size={20} color={addr.isDefault ? '#F05A22' : '#6B7280'} />
            <div className="ku-addr__card-info">
              <div className="ku-addr__name-row">
                <span className="ku-addr__name">{addr.name}</span>
                {addr.isDefault && <span className="ku-addr__badge">Predeterminada</span>}
              </div>
              {addr.line1 && <p className="ku-addr__line">{addr.line1}</p>}
              {addr.city && <p className="ku-addr__line">{addr.city}</p>}
              {addr.phone && <p className="ku-addr__line"><IoCallOutline size={13} /> {addr.phone}</p>}
            </div>
          </div>
          <div className="ku-addr__card-actions">
            <button className="ku-addr__action ku-addr__action--view" title="Ver detalle" onClick={() => onView(addr.id)}>
              <IoEyeOutline size={16} />
            </button>
            {/* botón Editar oculto en KU */}
            {!addr.isDefault && (
              <button className="ku-addr__action ku-addr__action--star" title="Marcar como predeterminada" onClick={() => onSetDefault(addr.id)}>
                <IoStarOutline size={16} />
              </button>
            )}
            <button className="ku-addr__action ku-addr__action--delete" title="Eliminar" onClick={() => onDelete(addr.id, addr.name)} disabled={deleting === addr.id}>
              <IoTrashOutline size={16} />
            </button>
          </div>
        </div>
      ))
    )}

    {canAdd ? (
      <button className="ku-addr__add-btn" onClick={onAdd}>
        <IoAdd size={18} /> Añadir dirección
      </button>
    ) : (
      <p className="ku-addr__limit">Máximo {MAX_ADDRESSES} direcciones alcanzado</p>
    )}
  </div>
);

/* ── Modal de detalle ───────────────────────────────────────────────────── */

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="ku-detail__row">
      <span className="ku-detail__label">{label}</span>
      <span className="ku-detail__value">{value}</span>
    </div>
  );
};

const DetailModal = ({ type, data, onClose }) => {
  if (!data) return null;
  const isOrigin = type === 'origin';

  return (
    <div className="ku-detail__overlay" onClick={onClose}>
      <div className="ku-detail" onClick={(e) => e.stopPropagation()}>
        <div className="ku-detail__header">
          <h3>{isOrigin ? 'Dirección de Origen' : 'Dirección de Destino'}</h3>
          <button onClick={onClose}><IoClose size={22} /></button>
        </div>
        <div className="ku-detail__body">
          {isOrigin ? (
            <>
              <DetailRow label="Alias" value={data.alias} />
              <DetailRow label="Dirección" value={data.line1} />
              <DetailRow label="Ciudad" value={data.city} />
              <DetailRow label="Estado / Provincia" value={data.province} />
              <DetailRow label="Código Postal" value={data.zip} />
              <DetailRow label="Teléfono" value={data.phone} />
              <DetailRow label="Referencia" value={data.referencia} />
              <DetailRow label="Predeterminada" value={data.esPredeterminada ? 'Sí' : 'No'} />
            </>
          ) : (
            <>
              <DetailRow label="Alias" value={data.alias} />
              <DetailRow label="Tipo" value={data.tipoDireccion === 'store' ? 'Retiro en tienda' : 'Domicilio'} />
              {data.nombreLocker && <DetailRow label="Tienda" value={data.nombreLocker} />}
              <DetailRow label="Dirección" value={data.line1} />
              <DetailRow label="Estado" value={data.city} />
              <DetailRow label="Referencia" value={data.referencia} />
              <DetailRow label="Predeterminada" value={data.esPredeterminada ? 'Sí' : 'No'} />
              {(data.contactoNombres || data.contactoTelefono) && (
                <>
                  <h4 className="ku-detail__contact-title">
                    <IoPersonOutline size={16} /> Contacto de entrega
                  </h4>
                  <DetailRow label="Nombres" value={data.contactoNombres} />
                  <DetailRow label="Apellidos" value={data.contactoApellidos} />
                  <DetailRow label="Email" value={data.contactoEmail} />
                  <DetailRow label="Teléfono" value={data.contactoTelefono} />
                  <DetailRow label="Identificación" value={data.contactoIdentificacion} />
                </>
              )}
            </>
          )}
        </div>
        <button className="ku-detail__close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default AddressesPage;
