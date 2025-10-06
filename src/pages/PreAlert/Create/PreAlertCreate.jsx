// src/pages/PreAlert/Create/PreAlertCreate.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Services
import { getPaquetesContenidos, createPreAlerta } from '../../../services/preAlertService';
import { getStatesByCountry, getMunicipalitiesByState, getParishesByMunicipality, getDeliveryData, getUserAddresses } from '../../../services/address/addressService';

// Components
import MultiSelectSearchable from '../../../components/common/MultiSelectSearchable/MultiSelectSearchable';
import SearchableSelect from '../../../components/common/SearchableSelect/SearchableSelect';
import LoadingSpinner from '../../../components/common/Loading/Loading';

import './PreAlertCreate.styles.scss';

const PreAlertCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formState, setFormState] = useState({
    trackings: [''],
    contenidos: [],
    valorDeclarado: '',
    currency: 'USD',
    tipoContenido: [],
    facturas: []
  });

  const [addressState, setAddressState] = useState({
    deliveryMethod: 'store',
    selectedCity: '',
    selectedLocker: '',
    selectedState: '',
    selectedMunicipality: '',
    selectedParish: '',
    address: '',
    reference: '',
    addressName: '',
    selectedOption: 'new'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Queries
  const { data: contenidosData, isLoading: isLoadingContenidos } = useQuery({
    queryKey: ['paquetesContenidos'],
    queryFn: getPaquetesContenidos,
    select: (response) => response.data,
  });

  const { data: deliveryData, isLoading: isLoadingDelivery } = useQuery({
    queryKey: ['deliveryData'],
    queryFn: getDeliveryData,
    select: (response) => response.data,
  });

  const { data: userAddresses } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: getUserAddresses,
    select: (response) => response.data || [],
  });

  const { data: statesData, isLoading: isLoadingStates } = useQuery({
    queryKey: ['states'],
    queryFn: () => getStatesByCountry(1),
    select: (response) => response.data?.map(s => ({ label: s.name, value: s.id.toString() })),
  });

  const { data: municipalitiesData, isLoading: isLoadingMunicipalities } = useQuery({
    queryKey: ['municipalities', addressState.selectedState],
    queryFn: () => getMunicipalitiesByState(addressState.selectedState),
    enabled: !!addressState.selectedState,
    select: (response) => response.data?.map(m => ({ label: m.name, value: m.id.toString() })),
  });

  const { data: parishesData, isLoading: isLoadingParishes } = useQuery({
    queryKey: ['parishes', addressState.selectedMunicipality],
    queryFn: () => getParishesByMunicipality(addressState.selectedMunicipality),
    enabled: !!addressState.selectedMunicipality,
    select: (response) => response.data?.map(p => ({ label: p.name, value: p.id.toString() })),
  });

  // ✅ Procesar ciudades (solo Caracas ID=50)
  const availableCities = useMemo(() => {
    if (!deliveryData?.ciudad) return [];
    return [{ label: deliveryData.ciudad.name, value: deliveryData.ciudad.id.toString() }];
  }, [deliveryData]);

  // ✅ Filtrar tiendas tipo 2 (Lockers)
  const filteredTiendas = useMemo(() => {
    if (!deliveryData?.tiendas) return [];
    return deliveryData.tiendas
      .filter(t => t.idTiendaTipo === 2)
      .map(t => ({ label: t.nombre, value: t.id.toString() }));
  }, [deliveryData]);

  const contentList = useMemo(() => {
    if (!contenidosData) return [];
    return contenidosData.map(c => ({ label: c.contenido, value: c.id.toString() }));
  }, [contenidosData]);

  // ✅ Auto-cargar dirección predeterminada o ciudad por defecto
  useEffect(() => {
    if (!userAddresses || userAddresses.length === 0) {
      if (deliveryData?.ciudad && addressState.deliveryMethod === 'store') {
        setAddressState(prev => ({
          ...prev,
          selectedCity: deliveryData.ciudad.id.toString()
        }));
      }
      return;
    }

    const defaultAddr = userAddresses.find(a => a.esPredeterminada);
    if (defaultAddr) {
      if (defaultAddr.tipoDireccion === 'store') {
        setAddressState(prev => ({
          ...prev,
          deliveryMethod: 'store',
          selectedCity: defaultAddr.idCiudad?.toString() ?? '',
          selectedLocker: defaultAddr.idLocker?.toString() ?? '',
          selectedOption: 'store'
        }));
      } else {
        setAddressState(prev => ({
          ...prev,
          deliveryMethod: 'home',
          selectedState: defaultAddr.idEstado?.toString() ?? '',
          selectedMunicipality: defaultAddr.idMunicipio?.toString() ?? '',
          selectedParish: defaultAddr.idParroquia?.toString() ?? '',
          address: defaultAddr.direccionCompleta ?? '',
          reference: defaultAddr.referencia ?? '',
          addressName: defaultAddr.nombreDireccion ?? '',
          selectedOption: `addr-${defaultAddr.id}`
        }));
      }
    }
  }, [userAddresses, deliveryData]);

  // ✅ Auto-seleccionar Caracas cuando cambia a "store"
  useEffect(() => {
    if (addressState.deliveryMethod === 'store' && availableCities.length > 0 && !addressState.selectedCity) {
      setAddressState(prev => ({
        ...prev,
        selectedCity: availableCities[0].value
      }));
    }
  }, [addressState.deliveryMethod, availableCities, addressState.selectedCity]);

  // Handlers
  const updateFormState = useCallback((key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateAddressState = useCallback((key, value) => {
    setAddressState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleUpdateTracking = useCallback((text, index) => {
    const newTrackings = [...formState.trackings];
    newTrackings[index] = text;
    updateFormState('trackings', newTrackings);
  }, [formState.trackings, updateFormState]);

  const handleAddTracking = useCallback(() => {
    updateFormState('trackings', [...formState.trackings, '']);
  }, [formState.trackings, updateFormState]);

  const handleRemoveTracking = useCallback((index) => {
    const newTrackings = formState.trackings.filter((_, i) => i !== index);
    updateFormState('trackings', newTrackings);
  }, [formState.trackings, updateFormState]);

  const handleToggleContentType = useCallback((option) => {
    const currentTypes = Array.isArray(formState.tipoContenido) 
      ? formState.tipoContenido 
      : [];
    
    const isSelected = currentTypes.includes(option);
    const newTypes = isSelected 
      ? currentTypes.filter(type => type !== option)
      : [...currentTypes, option];
    
    updateFormState('tipoContenido', newTypes);
  }, [formState.tipoContenido, updateFormState]);

  const handleFileChange = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 5;

    if (formState.facturas.length + files.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Tipo no permitido`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: Máximo 5MB`);
        return false;
      }
      return true;
    });

    updateFormState('facturas', [...formState.facturas, ...validFiles]);
  }, [formState.facturas, updateFormState]);

  const handleRemoveFile = useCallback((fileName) => {
    updateFormState('facturas', formState.facturas.filter(f => f.name !== fileName));
  }, [formState.facturas, updateFormState]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    const hasValidTracking = formState.trackings.some(
      t => t.trim().length > 0 && t.trim().length <= 30
    );
    if (!hasValidTracking) {
      newErrors.tracking = 'Debe ingresar al menos un tracking válido';
    }

    if (formState.contenidos.length === 0) {
      newErrors.contenidos = 'Debe seleccionar al menos un contenido';
    }

    if (addressState.deliveryMethod === 'store') {
      if (!addressState.selectedCity || !addressState.selectedLocker) {
        newErrors.address = 'Debe seleccionar ciudad y tienda';
      }
    } else {
      if (addressState.selectedOption === 'new') {
        if (!addressState.selectedState || !addressState.selectedMunicipality || 
            !addressState.selectedParish || !addressState.address) {
          newErrors.address = 'Complete todos los campos de dirección';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, addressState]);

  const createMutation = useMutation({
    mutationFn: createPreAlerta,
    onSuccess: () => {
      toast.success('¡Pre-alerta creada exitosamente!');
      navigate('/pre-alert/list');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear pre-alerta');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const direccion = {
        tipo: addressState.deliveryMethod
      };

      if (addressState.deliveryMethod === 'store') {
        direccion.ciudad = addressState.selectedCity;
        direccion.tienda = addressState.selectedLocker;
      } else {
        if (addressState.selectedOption === 'new') {
          direccion.estado = addressState.selectedState;
          direccion.municipio = addressState.selectedMunicipality;
          direccion.parroquia = addressState.selectedParish;
          direccion.direccion = addressState.address;
          direccion.referencia = addressState.reference;
          direccion.nombreDireccion = addressState.addressName;
        } else {
          const addressId = parseInt(addressState.selectedOption.replace('addr-', ''));
          direccion.idDireccion = addressId;
        }
      }

      const formatValueForBackend = (value) => {
        if (!value) return '0';
        return value.toString().replace(/\./g, '').replace(',', '.');
      };

      const valorParaBackend = formatValueForBackend(formState.valorDeclarado);

      const payload = {
        trackings: formState.trackings.filter(t => t.trim().length > 0),
        contenidos: formState.contenidos,
        direccion,
        tipoContenido: Array.isArray(formState.tipoContenido) 
          ? formState.tipoContenido.join(', ')
          : formState.tipoContenido || '',
        ...(valorParaBackend && valorParaBackend !== '0' && {
          valorDeclarado: {
            monto: valorParaBackend,
            moneda: formState.currency
          }
        }),
        ...(formState.facturas.length > 0 && {
          facturas: formState.facturas.map(f => ({
            nombre: f.name,
            uri: URL.createObjectURL(f),
            tipo: f.type,
            tamaño: f.size
          }))
        })
      };

      console.log('Payload a enviar:', payload);
      
      await createMutation.mutateAsync(payload);
      
    } catch (error) {
      console.error('Error en submit:', error);
      toast.error(error.message || 'Error al enviar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    const hasValidTracking = formState.trackings.some(
      t => t.trim().length > 0 && t.trim().length <= 30
    );
    const hasContent = formState.contenidos.length > 0;
    return hasValidTracking && hasContent;
  }, [formState.trackings, formState.contenidos]);

  return (
    <div className="prealert-create">
      <div className="prealert-create__content">
        <div className="prealert-create__header">
          <div className="prealert-create__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <h1 className="prealert-create__title">Pre-Alerta tu compra</h1>
          <p className="prealert-create__subtitle">
            Ayúdanos a gestionar tu envío más rápido, avísanos tan pronto recibas el tracking de tu compra
          </p>
        </div>

        <form className="prealert-create__form" onSubmit={handleSubmit}>
          
          <div className="prealert-create__section">
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                Números de Tracking
                <span className="prealert-create__required">*</span>
              </label>
              <div className="prealert-create__tooltip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span className="prealert-create__tooltip-text">
                  Ingresa el o los números de tracking que te proporcionó la tienda
                </span>
              </div>
            </div>

            {formState.trackings.map((tracking, index) => (
              <div key={index} className="prealert-create__tracking-item">
                <input
                  type="text"
                  className="prealert-create__input"
                  placeholder="Número de Tracking"
                  value={tracking}
                  onChange={(e) => handleUpdateTracking(e.target.value, index)}
                  maxLength={30}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTracking(index)}
                    className="prealert-create__remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {errors.tracking && (
              <p className="prealert-create__error">{errors.tracking}</p>
            )}
            
            <button
              type="button"
              onClick={handleAddTracking}
              className="prealert-create__add-btn"
            >
              + Añadir Tracking
            </button>
          </div>

          <div className="prealert-create__section" style={{ zIndex: 100 }}>
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                Contenido ({formState.contenidos.length} seleccionado{formState.contenidos.length !== 1 ? 's' : ''})
                <span className="prealert-create__required">*</span>
              </label>
              <div className="prealert-create__tooltip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span className="prealert-create__tooltip-text">
                  Selecciona uno o más productos o categorías del contenido de tu paquete
                </span>
              </div>
            </div>

            <MultiSelectSearchable
              options={contentList}
              value={formState.contenidos}
              onChange={(values) => updateFormState('contenidos', values)}
              placeholder={
                formState.contenidos.length > 0
                  ? `${formState.contenidos.length} contenido(s) seleccionado(s)`
                  : "Seleccionar contenidos"
              }
              searchPlaceholder="Buscar contenido..."
              disabled={isLoadingContenidos}
              error={!!errors.contenidos}
            />
            {errors.contenidos && (
              <p className="prealert-create__error">{errors.contenidos}</p>
            )}
          </div>

          <div className="prealert-create__section">
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                Valor Declarado (Opcional)
              </label>
              <div className="prealert-create__tooltip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span className="prealert-create__tooltip-text">
                  Ingresa el valor total de tu compra según la factura
                </span>
              </div>
            </div>

            <div className="prealert-create__row">
              <div className="prealert-create__col">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="prealert-create__input"
                  placeholder="0.00"
                  value={formState.valorDeclarado}
                  onChange={(e) => updateFormState('valorDeclarado', e.target.value)}
                />
              </div>

              <div className="prealert-create__col prealert-create__col--small">
                <select
                  className="prealert-create__select"
                  value={formState.currency}
                  onChange={(e) => updateFormState('currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="prealert-create__section">
            <label className="prealert-create__label">
              Tipo de Contenido (Opcional)
            </label>
            <div className="prealert-create__checkboxes">
              {['Frágil', 'Líquidos'].map(option => (
                <label key={option} className="prealert-create__checkbox-option">
                  <input
                    type="checkbox"
                    checked={(formState.tipoContenido || []).includes(option)}
                    onChange={() => handleToggleContentType(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="prealert-create__section">
            <label className="prealert-create__label">
              Tipo de Entrega
              <span className="prealert-create__required">*</span>
            </label>

            <div className="prealert-create__radio-group">
              <label className="prealert-create__radio-option">
                <input
                  type="radio"
                  checked={addressState.deliveryMethod === 'home'}
                  onChange={() => updateAddressState('deliveryMethod', 'home')}
                />
                <span>A Domicilio</span>
              </label>

              <label className="prealert-create__radio-option">
                <input
                  type="radio"
                  checked={addressState.deliveryMethod === 'store'}
                  onChange={() => updateAddressState('deliveryMethod', 'store')}
                />
                <span>Retiro en Tienda</span>
              </label>
            </div>
          </div>

          {addressState.deliveryMethod === 'home' && (
            <div className="prealert-create__section prealert-create__address-section">
              <h3 className="prealert-create__section-title">Dirección de Entrega</h3>

              <div className="prealert-create__radio-group">
                {userAddresses.map(addr => (
                  <label key={addr.id} className="prealert-create__radio-option">
                    <input
                      type="radio"
                      checked={addressState.selectedOption === `addr-${addr.id}`}
                      onChange={() => updateAddressState('selectedOption', `addr-${addr.id}`)}
                    />
                    <span>{addr.nombreDireccion || `Dirección ${addr.id}`}</span>
                  </label>
                ))}
                <label className="prealert-create__radio-option">
                  <input
                    type="radio"
                    checked={addressState.selectedOption === 'new'}
                    onChange={() => updateAddressState('selectedOption', 'new')}
                  />
                  <span>Nueva Dirección</span>
                </label>
              </div>

              {addressState.selectedOption === 'new' && (
                <>
                  <div className="prealert-create__row prealert-create__row--three">
                    <div className="prealert-create__col">
                      <label className="prealert-create__label">
                        Estado <span className="prealert-create__required">*</span>
                      </label>
                      <SearchableSelect
                        options={statesData || []}
                        value={addressState.selectedState}
                        onChange={(value) => updateAddressState('selectedState', value)}
                        placeholder="Seleccionar estado"
                        disabled={isLoadingStates}
                      />
                    </div>

                    <div className="prealert-create__col">
                      <label className="prealert-create__label">
                        Municipio <span className="prealert-create__required">*</span>
                      </label>
                      <SearchableSelect
                        options={municipalitiesData || []}
                        value={addressState.selectedMunicipality}
                        onChange={(value) => updateAddressState('selectedMunicipality', value)}
                        placeholder="Seleccionar municipio"
                        disabled={!addressState.selectedState || isLoadingMunicipalities}
                      />
                    </div>

                    <div className="prealert-create__col">
                      <label className="prealert-create__label">
                        Parroquia <span className="prealert-create__required">*</span>
                      </label>
                      <SearchableSelect
                        options={parishesData || []}
                        value={addressState.selectedParish}
                        onChange={(value) => updateAddressState('selectedParish', value)}
                        placeholder="Seleccionar parroquia"
                        disabled={!addressState.selectedMunicipality || isLoadingParishes}
                      />
                    </div>
                  </div>

                  <div className="prealert-create__col">
                    <label className="prealert-create__label">
                      Dirección <span className="prealert-create__required">*</span>
                    </label>
                    <textarea
                      className="prealert-create__textarea"
                      placeholder="Ej: Calle 1, Edificio X, Apto Y"
                      rows={3}
                      value={addressState.address}
                      onChange={(e) => updateAddressState('address', e.target.value)}
                    />
                  </div>

                  <div className="prealert-create__col">
                    <label className="prealert-create__label">Punto de Referencia</label>
                    <input
                      type="text"
                      className="prealert-create__input"
                      placeholder="Ej: Casa con portón azul"
                      value={addressState.reference}
                      onChange={(e) => updateAddressState('reference', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {addressState.deliveryMethod === 'store' && (
            <div className="prealert-create__section prealert-create__address-section">
              <h3 className="prealert-create__section-title">Selecciona una tienda</h3>

              <div className="prealert-create__row">
                <div className="prealert-create__col">
                  <label className="prealert-create__label">
                    Ciudad
                    <span className="prealert-create__required">*</span>
                  </label>
                  <SearchableSelect
                    options={availableCities}
                    value={addressState.selectedCity}
                    onChange={(value) => {
                      updateAddressState('selectedCity', value);
                      updateAddressState('selectedLocker', '');
                    }}
                    placeholder="Seleccione una ciudad"
                    disabled={isLoadingDelivery}
                  />
                </div>

                <div className="prealert-create__col">
                  <label className="prealert-create__label">
                    Tienda/Locker
                    <span className="prealert-create__required">*</span>
                  </label>
                  <SearchableSelect
                    options={filteredTiendas}
                    value={addressState.selectedLocker}
                    onChange={(value) => updateAddressState('selectedLocker', value)}
                    placeholder="Seleccione una tienda"
                    disabled={!addressState.selectedCity || filteredTiendas.length === 0}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="prealert-create__section">
            <label className="prealert-create__label">Facturas (Opcional)</label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="prealert-create__file-input"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="prealert-create__file-btn"
            >
              📎 Seleccionar Archivos (Max 5)
            </button>

            {formState.facturas.length > 0 && (
              <div className="prealert-create__files-list">
                {formState.facturas.map((file, index) => (
                  <div key={index} className="prealert-create__file-item">
                    <span className="prealert-create__file-name">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="prealert-create__file-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="prealert-create__actions">
            <button
              type="submit"
              className="prealert-create__submit-btn"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Creando...</span>
                </>
              ) : (
                'Crear Pre-Alerta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreAlertCreate;