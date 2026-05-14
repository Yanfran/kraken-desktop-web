// src/pages/Profile/Addresses/Addresses.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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

import { useCustomAlert } from '../../../../hooks/useCustomAlert';
import CustomAlert from '../../../../components/common/CustomAlert/CustomAlert';


const Addresses = () => {
  const navigate = useNavigate();
  const alert = useCustomAlert();
  const { t } = useTranslation();
  
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
          // ✅ Aceptar tipo 2 (Lockers Kraken) Y tipo 3 (Aliados como MRW)
        const isTipoValido = t.idTiendaTipo === 2 || t.idTiendaTipo === 3;
        
        // Filtrar por ciudad seleccionada
        const matchesCity = selectedCity 
          ? t.idZonaCiudad === parseInt(selectedCity)
          : true;
        
        return isTipoValido && matchesCity;
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
      // console.log('🏙️ Auto-seleccionando primera ciudad:', availableCities[0].value);
      setSelectedCity(availableCities[0].value);
    }
  }, [showForm, selectedOption, selectedCity, availableCities]);

  // Handler para cuando cambia la ciudad
  const handleCityChange = (newCityId) => {
    // console.log('🏙️ Ciudad cambiada a:', newCityId);
    setSelectedCity(newCityId);
    setSelectedLocker(''); // Limpiar tienda seleccionada
  };

  const validateForm = () => {
    if (!selectedOption) {
      toast.error(t('my_addresses.error_select_type'));
      return false;
    }

    if (selectedOption === 'store') {
      if (!selectedCity) {
        toast.error(t('my_addresses.error_select_city'));
        return false;
      }
      if (!selectedLocker) {
        toast.error(t('my_addresses.error_select_store'));
        return false;
      }
    } else if (selectedOption === 'home') {
      if (!alias.trim()) {
        toast.error(t('my_addresses.error_address_name'));
        return false;
      }
      if (!selectedState) {
        toast.error(t('my_addresses.error_select_state'));
        return false;
      }
      if (!selectedMunicipality) {
        toast.error(t('my_addresses.error_select_municipality'));
        return false;
      }
      if (!selectedParish) {
        toast.error(t('my_addresses.error_select_parish'));
        return false;
      }
      if (!address.trim()) {
        toast.error(t('my_addresses.error_enter_address'));
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
        toast.error(t('my_addresses.no_auth'));
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
            ? t('my_addresses.save_success_default')
            : t('my_addresses.save_success')
        );
        resetForm();
        setShowForm(false);
        await refetchAddresses();
      } else {
        toast.error(response.message || t('my_addresses.save_error'));
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.message || t('my_addresses.save_error'));
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

    if (userAddresses.length <= 1) {
      alert.showError(
        "Error",
        t('my_addresses.cannot_delete_only'),
      );
      return;
    }

    alert.showDeleteConfirm(
      addressName,
      // onConfirm
      async () => {
        try {
          setDeleting(addressId);
          const response = await deleteAddress(addressId);
          
          if (response.success) {
            alert.hideAlert();
            toast.success(t('my_addresses.delete_success'));
            await refetchAddresses();
          } else {
            toast.error(response.message || t('my_addresses.delete_error'));
          }
        } catch (error) {
           alert.hideAlert();
          console.error('Error deleting address:', error);
          toast.error(t('my_addresses.delete_error'));
        } finally {
          setDeleting(null);
        }
      },
      // onCancel (opcional)
      () => {
        console.log('Eliminación cancelada');
      }
    );
  };

  const handleSetDefault = async (addressId, addressName) => {
    try {
      setSettingDefault(addressId);
      const response = await setDefaultAddress(addressId);
      
      if (response.success) {
        toast.success(`"${addressName}" ${t('my_addresses.default_success')}`);
        await refetchAddresses();
      } else {
        toast.error(response.message || t('my_addresses.default_error'));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error(t('my_addresses.default_error'));
    } finally {
      setSettingDefault(null);
    }
  };

  const formatAddress = (address) => {
    if (address.tipoDireccion === 'store') {
      return `${t('my_addresses.type_store')}: ${address.nombreLocker || 'Locker'}`;
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
        <p>{t('my_addresses.loading')}</p>
      </div>
    );
  }

  const isFormLoading = isLoadingDelivery || (selectedOption === 'home' && isLoadingStates);

  return (
    <div className="addresses">
      <CustomAlert {...alert.alertProps} />
      <div className="addresses__container">
        {/* Header */}
        <div className="addresses__header">
          <button
            className="addresses__back-btn"
            onClick={() => navigate(-1)}
          >
            <IoChevronBack size={20} />
            <span>{t('my_addresses.back')}</span>
          </button>
          <h1 className="addresses__title">{t('my_addresses.title')}</h1>
          <p className="addresses__subtitle">
            {t('my_addresses.subtitle')}
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
            <span>{t('my_addresses.add_btn')}</span>
          </Button>
        )}

        {/* ✅ MENSAJE CUANDO HA LLEGADO AL LÍMITE DE 3 DIRECCIONES */}
        {!showForm && hasReachedMaxAddresses && (
          <div className="addresses__max-limit">
            <IoAlertCircleOutline size={24} />
            <div className="addresses__max-limit-text">
              <p className="addresses__max-limit-title">{t('my_addresses.max_limit_title')}</p>
              <p className="addresses__max-limit-message">
                {t('my_addresses.max_limit_msg')}
              </p>
            </div>
          </div>
        )}

        {/* Formulario de nueva dirección */}
        {showForm && (
          <div className="addresses__form-card">
            <div className="addresses__form-header">
              <h3>{t('my_addresses.form_title')}</h3>
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
                <p>{t('my_addresses.form_loading')}</p>
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
                    <span className="address-option__text">{t('my_addresses.type_store')}</span>
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
                    <span className="address-option__text">{t('my_addresses.type_home')}</span>
                  </label>
                </div>

                {/* Formulario según selección */}
                {selectedOption && (
                  <div className="address-form-fields">
                    
                    {/* Formulario para TIENDA */}
                    {selectedOption === 'store' && (
                      <>
                        <h4 className="form-section-title">{t('my_addresses.store_title')}</h4>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              {t('my_addresses.city')} <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={availableCities}
                              value={selectedCity}
                              onChange={handleCityChange}
                              placeholder={t('my_addresses.city_placeholder')}
                              disabled={isLoadingDelivery}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              {t('my_addresses.store')} <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={filteredTiendas}
                              value={selectedLocker}
                              onChange={setSelectedLocker}
                              placeholder={t('my_addresses.store_placeholder')}
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
                            {t('my_addresses.address_name')} <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder={t('my_addresses.address_name_placeholder')}
                            value={alias}
                            onChange={e => setAlias(e.target.value)}
                            disabled={submitting}
                          />
                        </div>

                        <h4 className="form-section-title">{t('my_addresses.home_title')}</h4>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              {t('my_addresses.state')} <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={statesData || []}
                              value={selectedState}
                              onChange={setSelectedState}
                              placeholder={t('my_addresses.state_placeholder')}
                              disabled={submitting || isLoadingStates}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              {t('my_addresses.municipality')} <span className="required">*</span>
                            </label>
                            <SearchableSelect
                              options={municipalitiesData || []}
                              value={selectedMunicipality}
                              onChange={setSelectedMunicipality}
                              placeholder={t('my_addresses.municipality_placeholder')}
                              disabled={!selectedState || isLoadingMunicipalities || submitting}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">{t('my_addresses.parish')} <span className="required">*</span></label>
                              <SearchableSelect
                                options={parishesData || []}
                                value={selectedParish}
                                onChange={setSelectedParish}
                                placeholder={t('my_addresses.parish_placeholder')}
                                disabled={!selectedMunicipality || isLoadingParishes || submitting}
                              />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            {t('my_addresses.full_address')} <span className="required">*</span>
                          </label>
                          <textarea
                            className="form-textarea"
                            placeholder={t('my_addresses.full_address_placeholder')}
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            rows={3}
                            disabled={submitting}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">{t('my_addresses.reference')}</label>
                          <textarea
                            className="form-textarea"
                            placeholder={t('my_addresses.reference_placeholder')}
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
                        <span>{t('my_addresses.set_default')}</span>
                      </label>
                    </div>

                    {/* Botones */}
                    <div className="addresses__form-actions">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        disabled={submitting}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <LoadingSpinner size="small" />
                            <span>{t('my_addresses.saving')}</span>
                          </>
                        ) : (
                          t('my_addresses.save')
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
            <h3 className="addresses__empty-title">{t('my_addresses.empty_title')}</h3>
            <p className="addresses__empty-message">
              {t('my_addresses.empty_msg')}
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
                        {address.nombreDireccion || 'Sin nombre'}
                      </h3>
                      {address.esPredeterminada && (
                        <span className="address-card__default-badge">
                          <IoStar size={14} />
                          <span>{t('my_addresses.default_badge')}</span>
                        </span>
                      )}
                    </div>
                    <span className="address-card__type">
                      {address.tipoDireccion === 'store' ? (
                        <>
                          <IoStorefrontOutline size={16} />
                          <span>{t('my_addresses.type_store_label')}</span>
                        </>
                      ) : (
                        <>
                          <IoHomeOutline size={16} />
                          <span>{t('my_addresses.type_home_label')}</span>
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
                      <strong>{t('my_addresses.reference_label')}</strong> {address.referencia}
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
                          <span>{t('my_addresses.setting_default')}</span>
                        </>
                      ) : (
                        <>
                          <IoStarOutline size={16} />
                          <span>{t('my_addresses.set_as_default')}</span>
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
                        <span>{t('my_addresses.deleting')}</span>
                      </>
                    ) : (
                      <>
                        <IoTrashOutline size={16} />
                        <span>{t('my_addresses.delete')}</span>
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