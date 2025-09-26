// src/pages/PreAlert/PreAlert.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import './PreAlert.styles.scss';

// Services
import { 
  createPreAlerta, 
  getPaquetesContenidos 
} from '@services/preAlertService';
import {
  getDeliveryData,
  getMunicipalitiesByState,
  getParishesByMunicipality,
  getStatesByCountry,
  getUserAddresses
} from '@services/addressService';

// Components
import AppContainer from '@components/common/AppContainer';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import CustomAlert from '@components/alert/CustomAlert';

// Hooks
import { useAuth } from '@hooks/useAuth';

const PreAlert = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [contentList, setContentList] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [states, setStates] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [deliveryData, setDeliveryData] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });

  // Form state
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      trackings: [''],
      contenidos: [],
      valor: '',
      peso: '',
      cantidad: '1',
      tipoEnvio: 'maritimo',
      addressId: null,
      newAddress: {
        nombres: '',
        apellidos: '',
        telefono: '',
        cedula: '',
        email: '',
        direccion: '',
        estadoId: null,
        municipioId: null,
        parroquiaId: null,
        codigoPostal: ''
      },
      useNewAddress: false,
      facturas: []
    }
  });

  const watchedValues = watch();

  // Initialize data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [contentsResponse, addressesResponse, statesResponse] = await Promise.all([
          getPaquetesContenidos(),
          getUserAddresses(),
          getStatesByCountry(1) // Venezuela
        ]);

        if (contentsResponse.success) {
          setContentList(contentsResponse.data.map(item => ({
            label: item.descripcion,
            value: item.id
          })));
        }

        if (addressesResponse.success) {
          setUserAddresses(addressesResponse.data);
        }

        if (statesResponse.success) {
          setStates(statesResponse.data.map(state => ({
            label: state.nombre,
            value: state.id
          })));
        }

      } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert('error', 'Error', 'Error cargando datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);

  // Load municipalities when state changes
  useEffect(() => {
    const loadMunicipalities = async () => {
      if (watchedValues.newAddress?.estadoId) {
        try {
          const response = await getMunicipalitiesByState(watchedValues.newAddress.estadoId);
          if (response.success) {
            setMunicipalities(response.data.map(mun => ({
              label: mun.nombre,
              value: mun.id
            })));
          }
        } catch (error) {
          console.error('Error loading municipalities:', error);
        }
      }
    };

    loadMunicipalities();
  }, [watchedValues.newAddress?.estadoId]);

  // Load parishes when municipality changes
  useEffect(() => {
    const loadParishes = async () => {
      if (watchedValues.newAddress?.municipioId) {
        try {
          const response = await getParishesByMunicipality(watchedValues.newAddress.municipioId);
          if (response.success) {
            setParishes(response.data.map(parish => ({
              label: parish.nombre,
              value: parish.id
            })));
          }
        } catch (error) {
          console.error('Error loading parishes:', error);
        }
      }
    };

    loadParishes();
  }, [watchedValues.newAddress?.municipioId]);

  // Alert utilities
  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: '', title: '', message: '' });
  };

  // Tracking handlers
  const handleAddTracking = () => {
    const currentTrackings = watchedValues.trackings;
    setValue('trackings', [...currentTrackings, '']);
  };

  const handleRemoveTracking = (index) => {
    const currentTrackings = watchedValues.trackings;
    if (currentTrackings.length > 1) {
      const newTrackings = currentTrackings.filter((_, i) => i !== index);
      setValue('trackings', newTrackings);
    }
  };

  const handleUpdateTracking = (index, value) => {
    const currentTrackings = [...watchedValues.trackings];
    currentTrackings[index] = value;
    setValue('trackings', currentTrackings);
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const currentFiles = watchedValues.facturas || [];
      const newFiles = Array.from(files);
      setValue('facturas', [...currentFiles, ...newFiles]);
      toast.success(`${newFiles.length} archivo(s) agregado(s)`);
    }
  };

  // Remove file
  const removeFile = (index) => {
    const currentFiles = watchedValues.facturas;
    const newFiles = currentFiles.filter((_, i) => i !== index);
    setValue('facturas', newFiles);
  };

  // Form submission
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Validate trackings
      const validTrackings = data.trackings.filter(t => t.trim() !== '');
      if (validTrackings.length === 0) {
        showAlert('error', 'Error', 'Debe ingresar al menos un número de tracking');
        return;
      }

      // Prepare payload
      const payload = {
        trackings: validTrackings,
        contenidos: data.contenidos,
        valor: parseFloat(data.valor) || 0,
        peso: parseFloat(data.peso) || 0,
        cantidad: parseInt(data.cantidad) || 1,
        tipoEnvio: data.tipoEnvio,
        useNewAddress: data.useNewAddress,
        addressId: data.useNewAddress ? null : data.addressId,
        newAddress: data.useNewAddress ? data.newAddress : null,
        facturas: data.facturas
      };

      const response = await createPreAlerta(payload);

      if (response.success) {
        showAlert('success', '¡Éxito!', 'Pre-alerta creada exitosamente');
        setTimeout(() => {
          navigate('/pre-alerts');
        }, 2000);
      } else {
        showAlert('error', 'Error', response.message || 'Error al crear pre-alerta');
      }

    } catch (error) {
      console.error('Error creating pre-alert:', error);
      showAlert('error', 'Error', error.message || 'Error al crear pre-alerta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pre-alert">
      <AppContainer>
        <div className="pre-alert__layout">
          {/* Header */}
          <div className="pre-alert__header">
            <div className="pre-alert__header-icon">
              <img 
                src="/src/assets/images/icon-kraken-web-parlante_1.png" 
                alt="Pre-Alert Icon" 
                className="pre-alert__header-icon-img"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
            <h1 className="pre-alert__title">Pre-Alerta tu compra</h1>
            <p className="pre-alert__subtitle">
              Ayúdanos a gestionar tu envío más rápido, avísanos tan pronto 
              recibas el tracking de tu compra
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="pre-alert__form">
            
            {/* Tracking Section */}
            <div className="pre-alert__section">
              <label className="pre-alert__label">
                Número de Tracking
                <span className="pre-alert__label-required">*</span>
              </label>
              
              {watchedValues.trackings.map((tracking, index) => (
                <div key={index} className="pre-alert__tracking-item">
                  <Controller
                    name={`trackings.${index}`}
                    control={control}
                    rules={{ 
                      required: index === 0 ? 'Este campo es obligatorio' : false 
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder={`Tracking ${index + 1}`}
                        className={clsx('pre-alert__input', {
                          'pre-alert__input--error': errors.trackings?.[index]
                        })}
                      />
                    )}
                  />
                  
                  {watchedValues.trackings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTracking(index)}
                      className="pre-alert__remove-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddTracking}
                className="pre-alert__add-btn"
              >
                + Agregar otro tracking
              </button>
            </div>

            {/* Content Section */}
            <div className="pre-alert__section">
              <label className="pre-alert__label">
                Contenido ({watchedValues.contenidos.length} seleccionado{watchedValues.contenidos.length !== 1 ? 's' : ''})
                <span className="pre-alert__label-required">*</span>
              </label>
              
              <Controller
                name="contenidos"
                control={control}
                rules={{ required: 'Seleccione al menos un contenido' }}
                render={({ field }) => (
                  <select
                    {...field}
                    multiple
                    className={clsx('pre-alert__select pre-alert__select--multiple', {
                      'pre-alert__select--error': errors.contenidos
                    })}
                  >
                    {contentList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.contenidos && (
                <span className="pre-alert__error">{errors.contenidos.message}</span>
              )}
            </div>

            {/* Package Details */}
            <div className="pre-alert__section">
              <div className="pre-alert__row">
                <div className="pre-alert__col">
                  <label className="pre-alert__label">Valor (USD)</label>
                  <Controller
                    name="valor"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pre-alert__input"
                      />
                    )}
                  />
                </div>
                
                <div className="pre-alert__col">
                  <label className="pre-alert__label">Peso (lbs)</label>
                  <Controller
                    name="peso"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        className="pre-alert__input"
                      />
                    )}
                  />
                </div>
                
                <div className="pre-alert__col">
                  <label className="pre-alert__label">Cantidad</label>
                  <Controller
                    name="cantidad"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        className="pre-alert__input"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Type */}
            <div className="pre-alert__section">
              <label className="pre-alert__label">Tipo de Envío</label>
              <Controller
                name="tipoEnvio"
                control={control}
                render={({ field }) => (
                  <div className="pre-alert__radio-group">
                    <label className="pre-alert__radio-option">
                      <input
                        {...field}
                        type="radio"
                        value="maritimo"
                        checked={field.value === 'maritimo'}
                      />
                      <span>Marítimo</span>
                    </label>
                    <label className="pre-alert__radio-option">
                      <input
                        {...field}
                        type="radio"
                        value="aereo"
                        checked={field.value === 'aereo'}
                      />
                      <span>Aéreo</span>
                    </label>
                  </div>
                )}
              />
            </div>

            {/* Address Selection */}
            <div className="pre-alert__section">
              <label className="pre-alert__label">Dirección de Entrega</label>
              
              <Controller
                name="useNewAddress"
                control={control}
                render={({ field }) => (
                  <div className="pre-alert__radio-group">
                    <label className="pre-alert__radio-option">
                      <input
                        {...field}
                        type="radio"
                        value={false}
                        checked={!field.value}
                      />
                      <span>Usar dirección guardada</span>
                    </label>
                    <label className="pre-alert__radio-option">
                      <input
                        {...field}
                        type="radio"
                        value={true}
                        checked={field.value}
                      />
                      <span>Usar nueva dirección</span>
                    </label>
                  </div>
                )}
              />

              {!watchedValues.useNewAddress && (
                <Controller
                  name="addressId"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="pre-alert__select">
                      <option value="">Seleccionar dirección</option>
                      {userAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.nombres} {address.apellidos} - {address.direccion}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
            </div>

            {/* New Address Form */}
            {watchedValues.useNewAddress && (
              <div className="pre-alert__section pre-alert__new-address">
                <h3 className="pre-alert__subtitle">Nueva Dirección</h3>
                
                <div className="pre-alert__row">
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Nombres</label>
                    <Controller
                      name="newAddress.nombres"
                      control={control}
                      rules={{ required: watchedValues.useNewAddress ? 'Campo obligatorio' : false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={clsx('pre-alert__input', {
                            'pre-alert__input--error': errors.newAddress?.nombres
                          })}
                        />
                      )}
                    />
                  </div>
                  
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Apellidos</label>
                    <Controller
                      name="newAddress.apellidos"
                      control={control}
                      rules={{ required: watchedValues.useNewAddress ? 'Campo obligatorio' : false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={clsx('pre-alert__input', {
                            'pre-alert__input--error': errors.newAddress?.apellidos
                          })}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="pre-alert__row">
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Teléfono</label>
                    <Controller
                      name="newAddress.telefono"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="pre-alert__input"
                        />
                      )}
                    />
                  </div>
                  
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Cédula</label>
                    <Controller
                      name="newAddress.cedula"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="pre-alert__input"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="pre-alert__col">
                  <label className="pre-alert__label">Email</label>
                  <Controller
                    name="newAddress.email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        className="pre-alert__input"
                      />
                    )}
                  />
                </div>

                <div className="pre-alert__col">
                  <label className="pre-alert__label">Dirección</label>
                  <Controller
                    name="newAddress.direccion"
                    control={control}
                    rules={{ required: watchedValues.useNewAddress ? 'Campo obligatorio' : false }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows="3"
                        className={clsx('pre-alert__textarea', {
                          'pre-alert__textarea--error': errors.newAddress?.direccion
                        })}
                      />
                    )}
                  />
                </div>

                <div className="pre-alert__row">
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Estado</label>
                    <Controller
                      name="newAddress.estadoId"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="pre-alert__select">
                          <option value="">Seleccionar estado</option>
                          {states.map((state) => (
                            <option key={state.value} value={state.value}>
                              {state.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Municipio</label>
                    <Controller
                      name="newAddress.municipioId"
                      control={control}
                      render={({ field }) => (
                        <select 
                          {...field} 
                          className="pre-alert__select"
                          disabled={!watchedValues.newAddress?.estadoId}
                        >
                          <option value="">Seleccionar municipio</option>
                          {municipalities.map((municipality) => (
                            <option key={municipality.value} value={municipality.value}>
                              {municipality.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>

                <div className="pre-alert__row">
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Parroquia</label>
                    <Controller
                      name="newAddress.parroquiaId"
                      control={control}
                      render={({ field }) => (
                        <select 
                          {...field} 
                          className="pre-alert__select"
                          disabled={!watchedValues.newAddress?.municipioId}
                        >
                          <option value="">Seleccionar parroquia</option>
                          {parishes.map((parish) => (
                            <option key={parish.value} value={parish.value}>
                              {parish.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  
                  <div className="pre-alert__col">
                    <label className="pre-alert__label">Código Postal</label>
                    <Controller
                      name="newAddress.codigoPostal"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="pre-alert__input"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="pre-alert__section">
              <label className="pre-alert__label">Facturas (Opcional)</label>
              
              <div className="pre-alert__file-upload">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="pre-alert__file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="pre-alert__file-label">
                  📎 Seleccionar archivos
                </label>
              </div>

              {watchedValues.facturas && watchedValues.facturas.length > 0 && (
                <div className="pre-alert__files-list">
                  {watchedValues.facturas.map((file, index) => (
                    <div key={index} className="pre-alert__file-item">
                      <span className="pre-alert__file-name">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="pre-alert__file-remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pre-alert__actions">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={loading}
                className="pre-alert__submit-btn"
              >
                {loading ? <LoadingSpinner size="small" /> : 'Crear Pre-Alerta'}
              </Button>
            </div>
          </form>
        </div>

        {/* Custom Alert */}
        <CustomAlert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          onConfirm={hideAlert}
        />
      </AppContainer>
    </div>
  );
};

export default PreAlert;