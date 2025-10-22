// src/pages/Profile/Addresses/Addresses.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import './Addresses.styles.scss';

// ✅ ICONOS DE IONICONS (mismo estilo que la app)
import { 
  IoLocationOutline,      // 📍 Para ubicaciones
  IoHomeOutline,          // 🏠 Para domicilio  
  IoStorefrontOutline,    // 🏢 Para tienda
  IoTrashOutline,         // 🗑️ Para eliminar
  IoStarOutline,          // ⭐ Para predeterminada
  IoStar,                 // ⭐ Estrella rellena
  IoChevronBack,          // ← Para volver
  IoAdd,                  // + Para agregar
  IoClose,                // ✕ Para cerrar
  IoAlertCircleOutline    // ⚠️ Para aviso de límite
} from 'react-icons/io5';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';
import SearchableSelect from '@components/common/SearchableSelect/SearchableSelect';

// Services
import { 
  getUserAddresses, 
  setDefaultAddress, 
  deleteAddress,
  registerAddress,
  getDeliveryData,
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality
} from '@services/address/addressService';

const Addresses = () => {
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Estado de selección de dirección
  const [selectedOption, setSelectedOption] = useState(null);

  // Estados del formulario
  const [alias, setAlias] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para tienda
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocker, setSelectedLocker] = useState('');
  
  // Estados para domicilio
  const [selectedState, setSelectedState] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedParish, setSelectedParish] = useState('');
  const [address, setAddress] = useState('');

  // ✅ QUERIES para cargar datos
  const { data: userAddresses, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: getUserAddresses,
    select: (response) => response.data || [],
  });

  const { data: deliveryData, isLoading: isLoadingDelivery } = useQuery({
    queryKey: ['deliveryData'],
    queryFn: getDeliveryData,
    enabled: showForm,
    select: (response) => response.data,
  });

  const { data: statesData, isLoading: isLoadingStates } = useQuery({
    queryKey: ['states'],
    queryFn: () => getStatesByCountry(1),
    enabled: showForm && selectedOption === 'home',
    select: (response) =>
      response.data?.map((s) => ({ label: s.name, value: s.id.toString() })) || [],
  });

  const { data: municipalitiesData, isLoading: isLoadingMunicipalities } = useQuery({
    queryKey: ['municipalities', selectedState],
    queryFn: () => getMunicipalitiesByState(selectedState),
    enabled: !!selectedState && selectedOption === 'home',
    select: (response) =>
      response.data?.map((m) => ({ label: m.name, value: m.id.toString() })) || [],
  });

  const { data: parishesData, isLoading: isLoadingParishes } = useQuery({
    queryKey: ['parishes', selectedMunicipality],
    queryFn: () => getParishesByMunicipality(selectedMunicipality),
    enabled: !!selectedMunicipality && selectedOption === 'home',
    select: (response) =>
      response.data?.map((p) => ({ label: p.name, value: p.id.toString() })) || [],
  });

  // ✅ Procesar ciudades y tiendas
  const availableCities = useMemo(() => {
    // Usar ciudadesDisponibles (nuevo del backend)
    if (deliveryData?.ciudadesDisponibles && deliveryData.ciudadesDisponibles.length > 0) {
      return deliveryData.ciudadesDisponibles.map(c => ({
        label: c.name,
        value: c.id.toString(),
      }));
    }
    
    // Fallback: ciudad única
    if (deliveryData?.ciudad) {
      return [{
        label: deliveryData.ciudad.name,
        value: deliveryData.ciudad.id.toString(),
      }];
    }
    
    return [];
  }, [deliveryData]);

  const filteredTiendas = useMemo(() => {
    if (!deliveryData?.tiendas) return [];
    
    return deliveryData.tiendas
      .filter((t) => {
        const isTipo2 = t.idTiendaTipo === 2;
        const matchesCity = selectedCity 
          ? t.idZonaCiudad === parseInt(selectedCity)
          : true;
        return isTipo2 && matchesCity;
      })
      .map((t) => ({ label: t.nombre, value: t.id.toString() }));
  }, [deliveryData, selectedCity]); // ⬅️ ¡Agregar selectedCity!

  // Ordenar direcciones
  const sortedAddresses = useMemo(() => {
    if (!userAddresses) return [];
    return [...userAddresses].sort((a, b) => {
      if (a.esPredeterminada && !b.esPredeterminada) return -1;
      if (!a.esPredeterminada && b.esPredeterminada) return 1;
      return 0;
    });
  }, [userAddresses]);

  // ✅ VERIFICAR SI YA TIENE 3 DIRECCIONES (LÍMITE MÁXIMO)
  const hasReachedMaxAddresses = useMemo(() => {
    return userAddresses && userAddresses.length >= 4;
  }, [userAddresses]);

  // Limpiar campos cuando cambia el estado
  useEffect(() => {
    if (selectedOption === 'home') {
      setSelectedMunicipality('');
      setSelectedParish('');
    }
  }, [selectedState, selectedOption]);

  useEffect(() => {
    if (selectedOption === 'home') {
      setSelectedParish('');
    }
  }, [selectedMunicipality, selectedOption]);

  // Auto-seleccionar primera ciudad al abrir formulario
  useEffect(() => {
    if (showForm && selectedOption === 'store' && !selectedCity && availableCities.length > 0) {
      console.log('🏙️ Auto-seleccionando primera ciudad:', availableCities[0].value);
      setSelectedCity(availableCities[0].value);
    }
  }, [showForm, selectedOption, selectedCity, availableCities]);

  // Handler para cuando cambia la ciudad
  const handleCityChange = (newCityId) => {
    console.log('🏙️ Ciudad cambiada a:', newCityId);
    setSelectedCity(newCityId);
    setSelectedLocker(''); // Limpiar tienda seleccionada
  };

  const validateForm = () => {
    if (!selectedOption) {
      toast.error('Seleccione un tipo de dirección');
      return false;
    }

    if (selectedOption === 'store') {
      // ✅ Para TIENDA: solo validar ciudad y locker
      if (!selectedCity) {
        toast.error('Seleccione una ciudad');
        return false;
      }
      if (!selectedLocker) {
        toast.error('Seleccione una tienda');
        return false;
      }
    } else if (selectedOption === 'home') {
      // ✅ Para DOMICILIO: validar alias, estado, municipio y dirección
      if (!alias.trim()) {
        toast.error('Ingrese un nombre para la dirección');
        return false;
      }
      if (!selectedState) {
        toast.error('Seleccione un estado');
        return false;
      }
      if (!selectedMunicipality) {
        toast.error('Seleccione un municipio');
        return false;
      }
      if (!address.trim()) {
        toast.error('Ingrese una dirección');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      const userDataString = localStorage.getItem('userData');

      // 1. Convertir la cadena JSON a un objeto JavaScript
      const userData = JSON.parse(userDataString); 
      
      // 2. Acceder al campo 'email' del objeto
      const userEmail = userData.email; 

      if (!userId) {
        toast.error('Usuario no autenticado');
        setSubmitting(false);
        return;
      }

      const delivery = selectedOption === 'store'
        ? {
            City: selectedCity,
            Locker: selectedLocker,
            State: null,
            Municipality: null,
            Parish: null,
            Address: null,
            Reference: null, // ✅ Sin referencia para tienda
          }
        : {
            City: null,
            Locker: null,
            State: selectedState,
            Municipality: selectedMunicipality,
            Parish: selectedParish || null,
            Address: address,
            Reference: reference || null,
          };

      const payload = {
        ID: userId,
        Email: userEmail,
        Method: selectedOption === 'store' ? 'store' : 'home',
        Delivery: delivery,
        Alias: selectedOption === 'store' ? '' : alias, // ✅ Alias vacío para tienda
        SetAsDefault: setAsDefault
      };

      const response = await registerAddress(payload);

      if (response.success) {
        toast.success(
          setAsDefault 
            ? '¡Dirección agregada y establecida como predeterminada!' 
            : '¡Dirección agregada exitosamente!'
        );
        resetForm();
        setShowForm(false);
        await refetchAddresses();
      } else {
        toast.error(response.message || 'Error al agregar la dirección');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.message || 'Error al agregar la dirección');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedOption(null);
    setAlias('');
    setSetAsDefault(false);
    setReference('');
    setSelectedCity('');
    setSelectedLocker('');
    setSelectedState('');
    setSelectedMunicipality('');
    setSelectedParish('');
    setAddress('');
  };

  const handleDelete = async (addressId, addressName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la dirección "${addressName}"?`)) {
      return;
    }

    try {
      setDeleting(addressId);
      const response = await deleteAddress(addressId);
      
      if (response.success) {
        toast.success('Dirección eliminada exitosamente');
        await refetchAddresses();
      } else {
        toast.error(response.message || 'Error al eliminar la dirección');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error al eliminar la dirección');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (addressId, addressName) => {
    try {
      setSettingDefault(addressId);
      const response = await setDefaultAddress(addressId);
      
      if (response.success) {
        toast.success(`"${addressName}" establecida como predeterminada`);
        await refetchAddresses();
      } else {
        toast.error(response.message || 'Error al establecer dirección predeterminada');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Error al establecer dirección predeterminada');
    } finally {
      setSettingDefault(null);
    }
  };

  const formatAddress = (address) => {
    if (address.tipoDireccion === 'store') {
      return `Retiro en tienda: ${address.nombreLocker || 'Locker'}`;
    }
    
    const parts = [];
    if (address.direccionCompleta) parts.push(address.direccionCompleta);
    if (address.nombreParroquia) parts.push(address.nombreParroquia);
    if (address.nombreMunicipio) parts.push(address.nombreMunicipio);
    if (address.nombreEstado) parts.push(address.nombreEstado);
    
    return parts.join(', ');
  };

  if (isLoadingAddresses) {
    return (
      <div className="addresses__loading">
        <LoadingSpinner size="large" />
        <p>Cargando direcciones...</p>
      </div>
    );
  }

  const isFormLoading = isLoadingDelivery || (selectedOption === 'home' && isLoadingStates);

  return (
    <div className="addresses">
      <div className="addresses__container">
        {/* Header */}
        <div className="addresses__header">
          <button 
            className="addresses__back-btn"
            onClick={() => navigate(-1)}
          >
            <IoChevronBack size={20} />
            <span>Volver</span>
          </button>
          <h1 className="addresses__title">Mis Direcciones</h1>
          <p className="addresses__subtitle">
            Gestiona tus direcciones de entrega
          </p>
        </div>

        {/* ✅ BOTÓN NUEVA DIRECCIÓN - SOLO SI NO HA LLEGADO AL LÍMITE */}
        {!showForm && !hasReachedMaxAddresses && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            className="addresses__add-btn"
          >
            <IoAdd size={20} />
            <span>Nueva Dirección</span>
          </Button>
        )}

        {/* ✅ MENSAJE CUANDO HA LLEGADO AL LÍMITE DE 3 DIRECCIONES */}
        {!showForm && hasReachedMaxAddresses && (
          <div className="addresses__max-limit">
            <IoAlertCircleOutline size={24} />
            <div className="addresses__max-limit-text">
              <p className="addresses__max-limit-title">Límite de direcciones alcanzado</p>
              <p className="addresses__max-limit-message">
                Has alcanzado el máximo de 3 direcciones guardadas. Elimina una dirección existente para agregar una nueva.
              </p>
            </div>
          </div>
        )}

        {/* Formulario de nueva dirección */}
        {showForm && (
          <div className="addresses__form-card">
            <div className="addresses__form-header">
              <h3>Nueva Dirección</h3>
              <button 
                className="addresses__form-close"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitting || isFormLoading}
              >
                <IoClose size={20} />
              </button>
            </div>

            {isFormLoading ? (
              <div className="addresses__form-loading">
                <LoadingSpinner size="medium" />
                <p>Cargando formulario...</p>
              </div>
            ) : (
              <div className="addresses__form-body">
                {/* Selector de tipo de dirección */}
                <div className="address-selector">
                  <label className={`address-option ${selectedOption === 'store' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="store"
                      checked={selectedOption === 'store'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={submitting}
                    />
                    <IoStorefrontOutline size={20} />
                    <span className="address-option__text">Retiro en Tienda</span>
                  </label>

                  <label className={`address-option ${selectedOption === 'home' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={selectedOption === 'home'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={submitting}
                    />
                    <IoHomeOutline size={20} />
                    <span className="address-option__text">Enviar a otra dirección</span>
                  </label>
                </div>

                {/* Formulario según selección */}
                {selectedOption && (
                  <div className="address-form-fields">
                    
                    {/* Formulario para TIENDA */}
                    {selectedOption === 'store' && (
                      <>
                        <h4 className="form-section-title">Retiro en Tienda</h4>                                                

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              CIUDAD <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={availableCities}
                              value={selectedCity}
                              onChange={handleCityChange} // ⬅️ Usar nuevo handler
                              placeholder="Seleccione una ciudad"
                              disabled={isLoadingDelivery}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              TIENDA <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={filteredTiendas}
                              value={selectedLocker}
                              onChange={setSelectedLocker}
                              placeholder="Seleccione una tienda"
                              disabled={!selectedCity || submitting}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Formulario para DOMICILIO */}
                    {selectedOption === 'home' && (
                      <>
                        {/* Alias */}
                        <div className="form-group">
                          <label className="form-label">
                            NOMBRE DE LA DIRECCIÓN <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Casa, Oficina, etc."
                            value={alias}
                            onChange={e => setAlias(e.target.value)}
                            disabled={submitting}
                          />
                        </div>

                        <h4 className="form-section-title">Entrega a Domicilio</h4>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              ESTADO <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={statesData || []}
                              value={selectedState}
                              onChange={setSelectedState}
                              placeholder="Seleccione un estado"
                              disabled={submitting || isLoadingStates}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              MUNICIPIO <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={municipalitiesData || []}
                              value={selectedMunicipality}
                              onChange={setSelectedMunicipality}
                              placeholder="Seleccione un municipio"
                              disabled={!selectedState || isLoadingMunicipalities || submitting}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">PARROQUIA</label>
                            <SearchableSelect
                              options={parishesData || []}
                              value={selectedParish}
                              onChange={setSelectedParish}
                              placeholder="Seleccione una parroquia (opcional)"
                              disabled={!selectedMunicipality || isLoadingParishes || submitting}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            DIRECCIÓN COMPLETA <span className="required">*</span>
                          </label>
                          <textarea
                            className="form-textarea"
                            placeholder="Ej: Barrio, Vicario 3, Carrera 9 entre Calles 5 y 7"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            rows={3}
                            disabled={submitting}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">PUNTO DE REFERENCIA</label>
                          <textarea
                            className="form-textarea"
                            placeholder="Punto de referencia adicional (opcional)"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            rows={2}
                            disabled={submitting}
                          />
                        </div>
                      </>
                    )}

                    {/* Establecer como predeterminada */}
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={setAsDefault}
                          onChange={e => setSetAsDefault(e.target.checked)}
                          disabled={submitting}
                        />
                        <span>Establecer como dirección predeterminada</span>
                      </label>
                    </div>

                    {/* Botones */}
                    <div className="addresses__form-actions">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <LoadingSpinner size="small" />
                            <span>Guardando...</span>
                          </>
                        ) : (
                          'Guardar Dirección'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Addresses list */}
        {sortedAddresses.length === 0 && !showForm ? (
          <div className="addresses__empty">
            <IoLocationOutline size={48} className="addresses__empty-icon" />
            <h3 className="addresses__empty-title">No tienes direcciones guardadas</h3>
            <p className="addresses__empty-message">
              Agrega tu primera dirección para facilitar tus entregas
            </p>
          </div>
        ) : (
          <div className="addresses__list">
            {sortedAddresses.map((address) => (
              <div 
                key={address.id} 
                className={`address-card ${address.esPredeterminada ? 'is-default' : ''}`}
              >
                <div className="address-card__header">
                  <div className="address-card__icon">
                    {address.tipoDireccion === 'store' ? (
                      <IoStorefrontOutline size={24} />
                    ) : (
                      <IoHomeOutline size={24} />
                    )}
                  </div>
                  <div className="address-card__content-wrapper">
                    <div className="address-card__title-row">
                      <h3 className="address-card__alias">
                        {address.tipoDireccion === 'store' ? 'Retiro en Tienda' : 'Domicilio'}: {address.nombreDireccion || 'Sin nombre'}
                      </h3>
                      {address.esPredeterminada && (
                        <span className="address-card__default-badge">
                          <IoStar size={14} />
                          <span>Predeterminada</span>
                        </span>
                      )}
                    </div>
                    <span className="address-card__type">
                      {address.tipoDireccion === 'store' ? (
                        <>
                          <IoStorefrontOutline size={16} />
                          <span>Tienda</span>
                        </>
                      ) : (
                        <>
                          <IoHomeOutline size={16} />
                          <span>Domicilio</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="address-card__content">
                  <p className="address-card__address">
                    {formatAddress(address)}
                  </p>
                  {address.referencia && (
                    <p className="address-card__reference">
                      <strong>Referencia:</strong> {address.referencia}
                    </p>
                  )}
                </div>

                <div className="address-card__actions">
                  {!address.esPredeterminada && (
                    <button
                      className="address-card__action-btn address-card__action-btn--primary"
                      onClick={() => handleSetDefault(address.id, address.nombreDireccion)}
                      disabled={settingDefault === address.id}
                    >
                      {settingDefault === address.id ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span>Estableciendo...</span>
                        </>
                      ) : (
                        <>
                          <IoStarOutline size={16} />
                          <span>Predeterminada</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    className="address-card__action-btn address-card__action-btn--danger"
                    onClick={() => handleDelete(address.id, address.nombreDireccion)}
                    disabled={deleting === address.id}
                  >
                    {deleting === address.id ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <IoTrashOutline size={16} />
                        <span>Eliminar</span>
                      </>
                    )}
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