// src/pages/Addresses/AddressesPage.jsx
// ✅ PÁGINA DE GESTIÓN DE DIRECCIONES

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AddressModal from './components/AddressModal';
import './AddressesPage.scss';

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock data inicial
  useEffect(() => {
    const mockAddresses = [
      {
        id: 1,
        name: 'Roberto Gómez',
        street: 'Av. Diagonal 550, 2º A',
        city: 'Barcelona',
        postalCode: '08029',
        phone: '+34 612 345 678',
        isDefault: true,
        type: 'origin', // 'origin' o 'destination'
        lat: 41.3874,
        lng: 2.1686
      },
      {
        id: 2,
        name: 'Ana Martínez',
        street: 'Calle Mayor 12, 3º D',
        city: 'Madrid',
        postalCode: '28013',
        phone: '+34 91 555 1234',
        isDefault: false,
        type: 'destination',
        lat: 40.4168,
        lng: -3.7038
      },
      {
        id: 3,
        name: 'Luis Rodríguez',
        street: 'Av. de América 23',
        city: 'Sevilla',
        postalCode: '41005',
        phone: '+34 954 111 222',
        isDefault: false,
        type: 'destination',
        lat: 37.3891,
        lng: -5.9845
      },
      {
        id: 4,
        name: 'Laura Sánchez',
        street: 'Paseo de la Castellana 100',
        city: 'Madrid',
        postalCode: '28046',
        phone: '+34 91 123 4567',
        isDefault: false,
        type: 'destination',
        lat: 40.4473,
        lng: -3.6891
      },
      {
        id: 5,
        name: 'Carlos Pérez',
        street: 'Gran Vía 1',
        city: 'Zaragoza',
        postalCode: '50001',
        phone: '+34 976 777 888',
        isDefault: false,
        type: 'destination',
        lat: 41.6488,
        lng: -0.8891
      },
      {
        id: 6,
        name: 'Elena Díaz',
        street: 'C. de Valencia 25',
        city: 'Valencia',
        postalCode: '46001',
        phone: '+34 96 333 4444',
        isDefault: false,
        type: 'destination',
        lat: 39.4699,
        lng: -0.3763
      }
    ];
    setAddresses(mockAddresses);
  }, []);

  // Filtrar direcciones
  const filteredAddresses = addresses.filter(addr =>
    addr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAddresses = filteredAddresses.slice(startIndex, endIndex);

  // Crear nueva dirección
  const handleCreate = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  // Editar dirección
  const handleEdit = (address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  // Eliminar dirección
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
      toast.success('Dirección eliminada');
    }
  };

  // Marcar como predeterminada
  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setAddresses(updatedAddresses);
    toast.success('Dirección marcada como predeterminada');
  };

  // Guardar dirección (crear o actualizar)
  const handleSaveAddress = (addressData) => {
    if (editingAddress) {
      // Actualizar existente
      const updated = addresses.map(addr =>
        addr.id === editingAddress.id ? { ...addressData, id: addr.id } : addr
      );
      setAddresses(updated);
      toast.success('Dirección actualizada');
    } else {
      // Crear nueva
      const newAddress = {
        ...addressData,
        id: Date.now(),
        isDefault: addresses.length === 0 // Primera dirección es predeterminada
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Dirección creada');
    }
    setModalOpen(false);
  };

  return (
    <div className="addresses-page">
      {/* Header */}
      <div className="addresses-page__header">
        <h1 className="addresses-page__title">Mis Direcciones</h1>
        <div className="addresses-page__countries">
          <div className="addresses-page__country">
            <span className="addresses-page__flag">🇪🇸</span>
            <span>España (Origen)</span>
          </div>
          <div className="addresses-page__country">
            <span className="addresses-page__flag">🇻🇪</span>
            <span>Venezuela (Destino)</span>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="addresses-page__controls">
        <div className="addresses-page__search">
          <span className="addresses-page__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="addresses-page__search-input"
          />
        </div>

        <button
          className="addresses-page__filter-btn"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <span>🔽</span>
          <span>Filtrar por</span>
        </button>

        <button className="addresses-page__batch-btn">
          <span>Acciones en lote</span>
          <span>🔽</span>
        </button>
      </div>

      {/* Grid de direcciones */}
      <div className="addresses-page__grid">
        {currentAddresses.map((address) => (
          <div
            key={address.id}
            className={`addresses-page__card ${address.isDefault ? 'addresses-page__card--default' : ''}`}
          >
            {address.isDefault && (
              <span className="addresses-page__badge">Predeterminada</span>
            )}

            <div className="addresses-page__card-content">
              <h3 className="addresses-page__name">{address.name}</h3>
              <p className="addresses-page__street">{address.street}</p>
              <p className="addresses-page__city">
                {address.postalCode} {address.city}
              </p>
              <p className="addresses-page__phone">
                <span>📞</span> {address.phone}
              </p>
            </div>

            <div className="addresses-page__actions">
              <button
                className="addresses-page__action-btn"
                onClick={() => handleEdit(address)}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="addresses-page__action-btn"
                onClick={() => handleDelete(address.id)}
                title="Eliminar"
              >
                🗑️
              </button>
              <button
                className={`addresses-page__action-btn ${address.isDefault ? 'active' : ''}`}
                onClick={() => handleSetDefault(address.id)}
                title="Marcar como predeterminada"
              >
                {address.isDefault ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        ))}

        {/* Botón Nueva Dirección */}
        <button className="addresses-page__add-card" onClick={handleCreate}>
          <span className="addresses-page__add-icon">+</span>
          <span className="addresses-page__add-text">Nueva Dirección</span>
        </button>
      </div>

      {/* Footer con contador y paginación */}
      <div className="addresses-page__footer">
        <p className="addresses-page__counter">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAddresses.length)} de {filteredAddresses.length} direcciones
        </p>

        <div className="addresses-page__pagination">
          <button
            className="addresses-page__page-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            // Mostrar solo algunas páginas
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  className={`addresses-page__page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={pageNum}>...</span>;
            }
            return null;
          })}

          <button
            className="addresses-page__page-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      </div>

      {/* Modal para crear/editar */}
      {modalOpen && (
        <AddressModal
          address={editingAddress}
          onSave={handleSaveAddress}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AddressesPage;