// src/pages/Profile/Addresses/Addresses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Addresses.styles.scss';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';

const Addresses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // TODO: Integrate with your API
      // const response = await getAddresses();
      
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAddresses([
        {
          id: 1,
          alias: 'Casa',
          type: 'home',
          address: 'Av. Principal, Edificio Torre, Piso 5, Apto 5-A',
          city: 'Caracas',
          state: 'Distrito Capital',
          isDefault: true
        },
        {
          id: 2,
          alias: 'Oficina',
          type: 'home',
          address: 'Calle Comercio, Centro Empresarial, Piso 10',
          city: 'Valencia',
          state: 'Carabobo',
          isDefault: false
        }
      ]);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
      // TODO: Integrate with your API
      // await deleteAddress(addressId);
      
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast.success('Dirección eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error al eliminar la dirección');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      // TODO: Integrate with your API
      // await setDefaultAddress(addressId);
      
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      );
      toast.success('Dirección predeterminada actualizada');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Error al actualizar la dirección predeterminada');
    }
  };

  if (loading) {
    return (
      <div className="addresses__loading">
        <LoadingSpinner size="large" />
        <p>Cargando direcciones...</p>
      </div>
    );
  }

  return (
    <div className="addresses">
      <div className="addresses__container">
        {/* Header */}
        <div className="addresses__header">
          <button 
            className="addresses__back-btn"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
          <h1 className="addresses__title">Mis Direcciones</h1>
          <p className="addresses__subtitle">
            Gestiona tus direcciones de entrega
          </p>
        </div>

        {/* Add new address button */}
        <Button
          variant="primary"
          onClick={() => toast.info('Función de agregar dirección próximamente')}
          className="addresses__add-btn"
        >
          + Nueva Dirección
        </Button>

        {/* Addresses list */}
        {addresses.length === 0 ? (
          <div className="addresses__empty">
            <span className="addresses__empty-icon">📍</span>
            <h3 className="addresses__empty-title">No tienes direcciones guardadas</h3>
            <p className="addresses__empty-message">
              Agrega tu primera dirección para facilitar tus entregas
            </p>
          </div>
        ) : (
          <div className="addresses__list">
            {addresses.map((address) => (
              <div key={address.id} className="address-card">
                <div className="address-card__header">
                  <div className="address-card__title-row">
                    <h3 className="address-card__alias">{address.alias}</h3>
                    {address.isDefault && (
                      <span className="address-card__default-badge">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <span className="address-card__type">
                    {address.type === 'home' ? '🏠 Domicilio' : '🏢 Tienda'}
                  </span>
                </div>

                <div className="address-card__content">
                  <p className="address-card__address">{address.address}</p>
                  <p className="address-card__location">
                    {address.city}, {address.state}
                  </p>
                </div>

                <div className="address-card__actions">
                  {!address.isDefault && (
                    <button
                      className="address-card__action-btn address-card__action-btn--primary"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Predeterminar
                    </button>
                  )}
                  <button
                    className="address-card__action-btn address-card__action-btn--secondary"
                    onClick={() => toast.info('Función de editar próximamente')}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="address-card__action-btn address-card__action-btn--danger"
                    onClick={() => handleDelete(address.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;