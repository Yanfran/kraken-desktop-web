// src/pages/Addresses/components/AddressModal.jsx
// ✅ MODAL PARA CREAR/EDITAR DIRECCIÓN CON GOOGLE MAPS

import React, { useState, useEffect, useRef } from 'react';
import './AddressModal.scss';

const AddressModal = ({ address, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    postalCode: '',
    phone: '',
    type: 'destination', // 'origin' o 'destination'
    lat: 40.4168, // Madrid por defecto
    lng: -3.7038,
    ...address
  });

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  // Inicializar Google Maps
  useEffect(() => {
    // Función para inicializar el mapa
    const initMap = () => {
      if (!window.google || !window.google.maps) {
        console.warn('Google Maps aún no está cargado, esperando...');
        return false;
      }

      setMapsLoaded(true);

      // Crear mapa
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: formData.lat, lng: formData.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Crear marcador
      const marker = new window.google.maps.Marker({
        position: { lat: formData.lat, lng: formData.lng },
        map: map,
        draggable: true,
        title: 'Arrastra para ajustar la ubicación'
      });

      // Geocoder para obtener dirección desde coordenadas
      const geocoder = new window.google.maps.Geocoder();
      geocoderRef.current = geocoder;

      // Cuando se arrastra el marcador
      marker.addListener('dragend', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setFormData(prev => ({
          ...prev,
          lat: lat,
          lng: lng
        }));

        // Obtener dirección de las coordenadas
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            const street = `${getComponent(addressComponents, 'route')} ${getComponent(addressComponents, 'street_number')}`;
            const city = getComponent(addressComponents, 'locality');
            const postalCode = getComponent(addressComponents, 'postal_code');

            setFormData(prev => ({
              ...prev,
              street: street || prev.street,
              city: city || prev.city,
              postalCode: postalCode || prev.postalCode
            }));
          }
        });
      });

      // Click en el mapa para mover el marcador
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        marker.setPosition({ lat, lng });

        setFormData(prev => ({
          ...prev,
          lat: lat,
          lng: lng
        }));

        // Obtener dirección
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            const street = `${getComponent(addressComponents, 'route')} ${getComponent(addressComponents, 'street_number')}`;
            const city = getComponent(addressComponents, 'locality');
            const postalCode = getComponent(addressComponents, 'postal_code');

            setFormData(prev => ({
              ...prev,
              street: street || prev.street,
              city: city || prev.city,
              postalCode: postalCode || prev.postalCode
            }));
          }
        });
      });

      markerRef.current = marker;
      return true;
    };

    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps) {
      const cleanup = initMap();
      if (cleanup) {
        return () => {
          if (markerRef.current && window.google) {
            window.google.maps.event.clearInstanceListeners(markerRef.current);
          }
        };
      }
    } else {
      // Esperar a que se cargue Google Maps
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  // Helper para obtener componente de dirección
  const getComponent = (components, type) => {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : '';
  };

  // Buscar dirección y centrar mapa
  const handleSearchAddress = () => {
    if (!geocoderRef.current) return;

    const fullAddress = `${formData.street}, ${formData.city}, ${formData.postalCode}`;

    geocoderRef.current.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        setFormData(prev => ({
          ...prev,
          lat: lat,
          lng: lng
        }));

        // Actualizar mapa y marcador
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        }
        if (mapRef.current) {
          const map = new window.google.maps.Map(mapRef.current);
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!formData.street.trim()) {
      alert('La dirección es obligatoria');
      return;
    }
    if (!formData.city.trim()) {
      alert('La ciudad es obligatoria');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="address-modal">
      <div className="address-modal__overlay" onClick={onClose} />

      <div className="address-modal__content">
        <div className="address-modal__header">
          <h2 className="address-modal__title">
            {address ? 'Editar Dirección' : 'Nueva Dirección'}
          </h2>
          <button className="address-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="address-modal__form">
          {/* Tipo de dirección */}
          <div className="address-modal__field">
            <label className="address-modal__label">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="address-modal__select"
            >
              <option value="origin">🇪🇸 Origen (España)</option>
              <option value="destination">🇻🇪 Destino (Venezuela)</option>
            </select>
          </div>

          {/* Nombre */}
          <div className="address-modal__field">
            <label className="address-modal__label">Nombre del destinatario *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className="address-modal__input"
              required
            />
          </div>

          {/* Dirección */}
          <div className="address-modal__field">
            <label className="address-modal__label">Dirección *</label>
            <div className="address-modal__input-group">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Ej: Calle Mayor 123, 2º A"
                className="address-modal__input"
                required
              />
              <button
                type="button"
                className="address-modal__search-btn"
                onClick={handleSearchAddress}
                title="Buscar en el mapa"
              >
                🔍
              </button>
            </div>
          </div>

          {/* Ciudad y Código Postal */}
          <div className="address-modal__row">
            <div className="address-modal__field">
              <label className="address-modal__label">Ciudad *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ej: Madrid"
                className="address-modal__input"
                required
              />
            </div>

            <div className="address-modal__field">
              <label className="address-modal__label">Código Postal</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Ej: 28013"
                className="address-modal__input"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="address-modal__field">
            <label className="address-modal__label">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: +34 612 345 678"
              className="address-modal__input"
            />
          </div>

          {/* Mapa de Google */}
          <div className="address-modal__field">
            <label className="address-modal__label">
              Ubicación en el mapa
              <span className="address-modal__hint">
                (Arrastra el marcador o haz click en el mapa)
              </span>
            </label>
            {mapsLoaded ? (
              <>
                <div ref={mapRef} className="address-modal__map" />
                <p className="address-modal__coordinates">
                  📍 Lat: {formData.lat.toFixed(6)}, Lng: {formData.lng.toFixed(6)}
                </p>
              </>
            ) : (
              <div className="address-modal__map address-modal__map--loading">
                <p>⏳ Cargando mapa...</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                  Puedes continuar llenando el formulario
                </p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="address-modal__actions">
            <button
              type="button"
              className="address-modal__btn address-modal__btn--cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="address-modal__btn address-modal__btn--save"
            >
              {address ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;