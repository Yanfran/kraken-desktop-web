// src/pages/Profile/Addresses/Addresses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Addresses.styles.scss';

// Components
import Button from '@components/common/Button/Button';
import LoadingSpinner from '@components/common/Loading/Loading';
import SearchableSelect from '@components/common/SearchableSelect/SearchableSelect';

// Services
import { 
  getUserAddresses, 
  setDefaultAddress, 
  deleteAddress,
  getDeliveryData,
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality
} from '@services/address/addressService';
import axiosInstance from '@services/axiosInstance';

const Addresses = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Estado de selección de dirección
  const [selectedOption, setSelectedOption] = useState(null); // 'store', 'home', 'addr-{id}'

  // Estados del formulario
  const [alias, setAlias] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para tienda
  const [cities, setCities] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocker, setSelectedLocker] = useState('');
  
  // Estados para domicilio
  const [states, setStates] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedParish, setSelectedParish] = useState('');
  const [address, setAddress] = useState('');
  
  // Estados de carga del formulario
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingParishes, setLoadingParishes] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    if (showForm && cities.length === 0) {
      loadFormData();
    }
  }, [showForm]);

  useEffect(() => {
    if (selectedState && selectedOption === 'home') {
      loadMunicipalities(selectedState);
    } else {
      setMunicipalities([]);
      setSelectedMunicipality('');
      setParishes([]);
      setSelectedParish('');
    }
  }, [selectedState, selectedOption]);

  useEffect(() => {
    if (selectedMunicipality && selectedOption === 'home') {
      loadParishes(selectedMunicipality);
    } else {
      setParishes([]);
      setSelectedParish('');
    }
  }, [selectedMunicipality, selectedOption]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getUserAddresses();
      
      if (response.success) {
        const sortedAddresses = (response.data || []).sort((a, b) => {
          if (a.esPredeterminada && !b.esPredeterminada) return -1;
          if (!a.esPredeterminada && b.esPredeterminada) return 1;
          return 0;
        });
        setAddresses(sortedAddresses);
      } else {
        toast.error(response.message || 'Error al cargar las direcciones');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      setLoadingForm(true);
      
      const deliveryData = await getDeliveryData();
      if (deliveryData.success && deliveryData.data) {
        const cityOptions = (deliveryData.data.cities || []).map(city => ({
          label: city.nombreCiudad,
          value: city.id.toString()
        }));
        setCities(cityOptions);
        setLockers(deliveryData.data.lockers || []);
      }
      
      const statesData = await getStatesByCountry('242');
      if (statesData.success && statesData.data) {
        const stateOptions = (statesData.data || []).map(state => ({
          label: state.nombreEstado,
          value: state.id.toString()
        }));
        setStates(stateOptions);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Error al cargar los datos del formulario');
    } finally {
      setLoadingForm(false);
    }
  };

  const loadMunicipalities = async (stateId) => {
    try {
      setLoadingMunicipalities(true);
      const data = await getMunicipalitiesByState(stateId);
      if (data.success && data.data) {
        const municipalityOptions = (data.data || []).map(mun => ({
          label: mun.nombreMunicipio,
          value: mun.id.toString()
        }));
        setMunicipalities(municipalityOptions);
      }
    } catch (error) {
      console.error('Error loading municipalities:', error);
      toast.error('Error al cargar municipios');
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  const loadParishes = async (municipalityId) => {
    try {
      setLoadingParishes(true);
      const data = await getParishesByMunicipality(municipalityId);
      if (data.success && data.data) {
        const parishOptions = (data.data || []).map(par => ({
          label: par.nombreParroquia,
          value: par.id.toString()
        }));
        setParishes(parishOptions);
      }
    } catch (error) {
      console.error('Error loading parishes:', error);
      toast.error('Error al cargar parroquias');
    } finally {
      setLoadingParishes(false);
    }
  };

  const filteredLockers = selectedCity
    ? lockers
        .filter(l => l.idCiudad?.toString() === selectedCity)
        .map(l => ({
          label: l.nombreLocker,
          value: l.id.toString()
        }))
    : [];

  const validateForm = () => {
    if (!selectedOption) {
      toast.error('Seleccione un tipo de dirección');
      return false;
    }

    if (!alias.trim()) {
      toast.error('Ingrese un alias para la dirección');
      return false;
    }

    if (selectedOption === 'store') {
      if (!selectedCity) {
        toast.error('Seleccione una ciudad');
        return false;
      }
      if (!selectedLocker) {
        toast.error('Seleccione una tienda/locker');
        return false;
      }
    } else if (selectedOption === 'home') {
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
      const userEmail = localStorage.getItem('userEmail');

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
            Reference: reference || null,
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
        Alias: alias,
        SetAsDefault: setAsDefault
      };

      const response = await axiosInstance.post('/Addresses/register-address', payload);

      if (response.data.success) {
        toast.success(
          setAsDefault 
            ? '¡Dirección agregada y establecida como predeterminada!' 
            : '¡Dirección agregada exitosamente!'
        );
        resetForm();
        setShowForm(false);
        await loadAddresses();
      } else {
        toast.error(response.data.message || 'Error al agregar la dirección');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.response?.data?.message || 'Error al agregar la dirección');
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
        await loadAddresses();
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
        await loadAddresses();
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
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            className="addresses__add-btn"
          >
            + Nueva Dirección
          </Button>
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
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            {loadingForm ? (
              <div className="addresses__form-loading">
                <LoadingSpinner size="medium" />
                <p>Cargando formulario...</p>
              </div>
            ) : (
              <div className="addresses__form-body">
                {/* Selector de tipo de dirección */}
                <div className="address-selector">
                  {/* Retiro en Tienda */}
                  <label className={`address-option ${selectedOption === 'store' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="store"
                      checked={selectedOption === 'store'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={submitting}
                    />
                    <span className="address-option__text">Retiro en Tienda</span>
                  </label>

                  {/* Enviar a otra dirección */}
                  <label className={`address-option ${selectedOption === 'home' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={selectedOption === 'home'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={submitting}
                    />
                    <span className="address-option__text">Enviar a otra dirección</span>
                  </label>
                </div>

                {/* Formulario según selección */}
                {selectedOption && (
                  <div className="address-form-fields">
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
                              options={cities}
                              value={selectedCity}
                              onChange={setSelectedCity}
                              placeholder="Seleccione una ciudad"
                              disabled={submitting}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              TIENDA/LOCKER <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={filteredLockers}
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
                        <h4 className="form-section-title">Entrega a Domicilio</h4>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              ESTADO <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={states}
                              value={selectedState}
                              onChange={setSelectedState}
                              placeholder="Seleccione un estado"
                              disabled={submitting}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              MUNICIPIO <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={municipalities}
                              value={selectedMunicipality}
                              onChange={setSelectedMunicipality}
                              placeholder="Seleccione un municipio"
                              disabled={!selectedState || loadingMunicipalities || submitting}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">PARROQUIA</label>
                            <SearchableSelect
                              options={parishes}
                              value={selectedParish}
                              onChange={setSelectedParish}
                              placeholder="Seleccione una parroquia (opcional)"
                              disabled={!selectedMunicipality || loadingParishes || submitting}
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
        {addresses.length === 0 && !showForm ? (
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
                    <h3 className="address-card__alias">
                      {address.nombreDireccion || 'Dirección'}
                    </h3>
                    {address.esPredeterminada && (
                      <span className="address-card__default-badge">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <span className="address-card__type">
                    {address.tipoDireccion === 'store' ? '🏢 Retiro en Tienda' : '🏠 Domicilio'}
                  </span>
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
                        '⭐ Predeterminar'
                      )}
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
                    onClick={() => handleDelete(address.id, address.nombreDireccion)}
                    disabled={deleting === address.id}
                  >
                    {deleting === address.id ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      '🗑️ Eliminar'
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