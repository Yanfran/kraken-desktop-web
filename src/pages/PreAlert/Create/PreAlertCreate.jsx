import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Tooltip from '../../../components/common/Tooltip/Tooltip';
import iconImage from '../../../assets/images/icon-kraken-web-parlante_1.png';
import { IoAlertCircleOutline } from 'react-icons/io5';

// Services
import {
  getPaquetesContenidos,
  createPreAlerta,
} from '../../../services/preAlertService';
import {
  getStatesByCountry,
  getMunicipalitiesByState,
  getParishesByMunicipality,
  getDeliveryData,
  getUserAddresses,
} from '../../../services/address/addressService';

// Utils
import {
  formatValueForBackend,
  parseFormattedValue,
} from '../../../utils/currencyUtils';

// Components
import MultiSelectSearchable from '../../../components/common/MultiSelectSearchable/MultiSelectSearchable';
import SearchableSelect from '../../../components/common/SearchableSelect/SearchableSelect';
import LoadingSpinner from '../../../components/common/Loading/Loading';
import CurrencyInput from '../../../components/common/CurrencyInput/CurrencyInput';

import './PreAlertCreate.styles.scss';

const PreAlertCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const [formState, setFormState] = useState({
    trackings: [''],
    contenidos: [],
    valorDeclarado: '',
    currency: 'USD',
    tipoContenido: [],
    facturas: [],
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
    selectedOption: 'default', // 'default', 'store', 'new', o 'addr-{id}'
    showChangeAddress: false, // Nuevo: controla si se muestra el cambio de dirección
    shouldSaveAddress: false, // Guardar para futuros envíos
    setAsDefaultAddress: false, // Establecer como predeterminada
  });

  const [defaultAddressText, setDefaultAddressText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Queries
  const { data: contenidosData, isLoading: isLoadingContenidos } = useQuery({
    queryKey: ['paquetesContenidos'],
    queryFn: getPaquetesContenidos,
    select: (response) => response.data, // ✅ Este está bien
  });

  const { data: deliveryData, isLoading: isLoadingDelivery } = useQuery({
    queryKey: ['deliveryData'],
    queryFn: getDeliveryData,
    select: (response) => response.data, // ✅ Este está bien
  });

  const { data: userAddresses, isLoading: isLoadingUserAddresses } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: getUserAddresses,
    select: (response) => {
      // ✅ Ahora sí retorna el array correcto con esPredeterminada
      return response.data || [];
    },
  });

  const { data: statesData, isLoading: isLoadingStates } = useQuery({
    queryKey: ['states'],
    queryFn: () => getStatesByCountry(1),
    select: (response) =>
      response.data?.map((s) => ({ label: s.name, value: s.id.toString() })) ||
      [],
  });

  const { data: municipalitiesData, isLoading: isLoadingMunicipalities } =
    useQuery({
      queryKey: ['municipalities', addressState.selectedState],
      queryFn: () => getMunicipalitiesByState(addressState.selectedState),
      enabled: !!addressState.selectedState,
      select: (response) =>
        response.data?.map((m) => ({
          label: m.name,
          value: m.id.toString(),
        })) || [],
    });

  const { data: parishesData, isLoading: isLoadingParishes } = useQuery({
    queryKey: ['parishes', addressState.selectedMunicipality],
    queryFn: () => getParishesByMunicipality(addressState.selectedMunicipality),
    enabled: !!addressState.selectedMunicipality,
    select: (response) =>
      response.data?.map((p) => ({ label: p.name, value: p.id.toString() })) ||
      [],
  });

  // Procesar ciudades (solo Caracas ID=50)
  const availableCities = useMemo(() => {
    // Usar ciudadesDisponibles (nuevo del backend)
    if (deliveryData?.ciudadesDisponibles && deliveryData.ciudadesDisponibles.length > 0) {
      return deliveryData.ciudadesDisponibles.map(c => ({
        label: c.name,
        value: c.id.toString(),
      }));
    }
    
    // Fallback
    if (deliveryData?.ciudad) {
      return [{
        label: deliveryData.ciudad.name,
        value: deliveryData.ciudad.id.toString(),
      }];
    }
    
    return [];
  }, [deliveryData]);

  // Filtrar tiendas tipo 2 (Lockers)
  const filteredTiendas = useMemo(() => {
    if (!deliveryData?.tiendas) return [];
    
    return deliveryData.tiendas
        .filter((t) => {
          // ✅ Aceptar tipo 2 (Lockers Kraken) Y tipo 3 (Aliados como MRW)
        const isTipoValido = t.idTiendaTipo === 2 || t.idTiendaTipo === 3 || t.idTiendaTipo === 8;
        
        // Filtrar por ciudad seleccionada
        const matchesCity = addressState.selectedCity 
          ? t.idZonaCiudad === parseInt(addressState.selectedCity)
          : true;
        
        return isTipoValido && matchesCity;
      })
      .map((t) => ({ label: t.nombre, value: t.id.toString() }));
  }, [deliveryData, addressState.selectedCity]); // ⬅️ ¡Agregar dependencia!

  const contentList = useMemo(() => {
    if (!contenidosData) return [];
    return contenidosData.map((c) => ({
      label: c.contenido,
      value: c.id.toString(),
    }));
  }, [contenidosData]);

  const handleCityChange = (newCityId) => {
    // console.log('🏙️ Ciudad cambiada a:', newCityId);
    setAddressState(prev => ({
      ...prev,
      selectedCity: newCityId,
      selectedLocker: ''
    }));
  };

  useEffect(() => {
    // Esperar a que ambos datos estén listos
    if (!userAddresses || !deliveryData) {
      return;
    }

    // Buscar dirección predeterminada
    const defaultAddr = userAddresses.find(
      (a) => a.esPredeterminada === true || a.EsPredeterminada === true
    );

    // Si NO hay dirección predeterminada, usar tienda por defecto
    if (!defaultAddr) {
      const defaultStore =
        deliveryData.tiendas?.find((t) =>
          t.nombre.toLowerCase().includes('chacao')
        ) || deliveryData.tiendas?.[0];

      if (defaultStore && deliveryData.ciudad) {
        setAddressState((prev) => ({
          ...prev,
          deliveryMethod: 'store',
          selectedCity: deliveryData.ciudad.id.toString(),
          selectedLocker: defaultStore.id.toString(),
          selectedOption: 'default',
        }));
        setDefaultAddressText(`Retiro en tienda: ${defaultStore.nombre}`);
      }
      return;
    }

    // Configurar según tipo
    if (defaultAddr.tipoDireccion === 'store') {
      setAddressState((prev) => ({
        ...prev,
        deliveryMethod: 'store',
        selectedCity: defaultAddr.idCiudad?.toString() ?? '',
        selectedLocker: defaultAddr.idLocker?.toString() ?? '',
        selectedOption: 'default',
      }));

      const texto = `Retiro en tienda: ${defaultAddr.nombreLocker ?? 'Locker'}`;
      setDefaultAddressText(defaultAddr.nombreDireccion || texto);
    } else {
      setAddressState((prev) => ({
        ...prev,
        deliveryMethod: 'home',
        selectedState: defaultAddr.idEstado?.toString() ?? '',
        selectedMunicipality: defaultAddr.idMunicipio?.toString() ?? '',
        selectedParish: defaultAddr.idParroquia?.toString() ?? '',
        address: defaultAddr.direccionCompleta ?? '',
        reference: defaultAddr.referencia ?? '',
        addressName: defaultAddr.nombreDireccion ?? '',
        selectedOption: 'default',
      }));

      const parts = [
        defaultAddr.direccionCompleta,
        defaultAddr.nombreParroquia,
        defaultAddr.nombreMunicipio,
        defaultAddr.nombreEstado,
      ].filter(Boolean);

      const texto = parts.join(', ');
      setDefaultAddressText(defaultAddr.nombreDireccion || texto);
    }
  }, [userAddresses, deliveryData]);

  // Handlers
  const updateFormState = useCallback((key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateAddressState = useCallback((key, value) => {
    setAddressState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ✅ NUEVO: Función para formatear tracking en mayúsculas
  const formatTrackingText = (text) => {
    return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const handleUpdateTracking = useCallback(
    (text, index) => {
      const formattedText = formatTrackingText(text);
      const newTrackings = [...formState.trackings];
      newTrackings[index] = formattedText;
      updateFormState('trackings', newTrackings);
    },
    [formState.trackings, updateFormState]
  );

  const handleAddTracking = useCallback(() => {
    updateFormState('trackings', [...formState.trackings, '']);
  }, [formState.trackings, updateFormState]);

  const handleRemoveTracking = useCallback(
    (index) => {
      const newTrackings = formState.trackings.filter((_, i) => i !== index);
      updateFormState('trackings', newTrackings);
    },
    [formState.trackings, updateFormState]
  );

  const handleToggleContentType = useCallback(
    (option) => {
      const currentTypes = Array.isArray(formState.tipoContenido)
        ? formState.tipoContenido
        : [];

      const isSelected = currentTypes.includes(option);
      const newTypes = isSelected
        ? currentTypes.filter((type) => type !== option)
        : [...currentTypes, option];

      updateFormState('tipoContenido', newTypes);
    },
    [formState.tipoContenido, updateFormState]
  );

  // ✅ ACTUALIZADO: Máximo 3 archivos
  const handleFileChange = useCallback(
    async (event) => {
      const files = Array.from(event.target.files);
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const maxFiles = 3; // ✅ CAMBIO: Máximo 3 archivos

      // ✅ Verificar límite ANTES de procesar
      if (formState.facturas.length >= maxFiles) {
        toast.error(t('pre_alert.file_max_error', { max: maxFiles }));
        return;
      }

      const currentFiles = formState.facturas;
      const totalFiles = currentFiles.length + files.length;

      if (totalFiles > maxFiles) {
        const allowedCount = maxFiles - currentFiles.length;
        toast.error(t('pre_alert.file_add_more_error', { count: allowedCount, max: maxFiles }));
        return;
      }

      const validFiles = files.filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name}: ${t('pre_alert.file_invalid_type')}`);
          return false;
        }
        if (file.size > maxSize) {
          toast.error(`${file.name}: ${t('pre_alert.file_max_size')}`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        const updatedFiles = [...formState.facturas, ...validFiles].slice(
          0,
          maxFiles
        );
        updateFormState('facturas', updatedFiles);

        toast.success(
          validFiles.length === 1
            ? t('pre_alert.file_added_one')
            : t('pre_alert.file_added_many', { count: validFiles.length })
        );
      }
    },
    [formState.facturas, updateFormState]
  );

  const handleRemoveFile = useCallback(
    (fileName) => {
      updateFormState(
        'facturas',
        formState.facturas.filter((f) => f.name !== fileName)
      );
    },
    [formState.facturas, updateFormState]
  );

  // ✅ NUEVO: Handlers para cambio de dirección
  const handleChangeAddressToggle = useCallback(() => {
    updateAddressState('showChangeAddress', !addressState.showChangeAddress);
  }, [addressState.showChangeAddress, updateAddressState]);

  const handleSelectSavedAddress = useCallback(
    (addressId) => {
      const addr = userAddresses.find((a) => a.id === addressId);
      if (!addr) return;

      if (addr.tipoDireccion === 'store') {
        setAddressState((prev) => ({
          ...prev,
          deliveryMethod: 'store',
          selectedCity: addr.idCiudad?.toString() ?? '',
          selectedLocker: addr.idLocker?.toString() ?? '',
          selectedOption: `addr-${addr.id}`,
        }));
      } else {
        setAddressState((prev) => ({
          ...prev,
          deliveryMethod: 'home',
          selectedState: addr.idEstado?.toString() ?? '',
          selectedMunicipality: addr.idMunicipio?.toString() ?? '',
          selectedParish: addr.idParroquia?.toString() ?? '',
          address: addr.direccionCompleta ?? '',
          reference: addr.referencia ?? '',
          addressName: addr.nombreDireccion ?? '',
          selectedOption: `addr-${addr.id}`,
        }));
      }
    },
    [userAddresses]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    const hasValidTracking = formState.trackings.some(
      (t) => t.trim().length > 0 && t.trim().length <= 30
    );
    if (!hasValidTracking) {
      newErrors.tracking = t('pre_alert.error_invalid_tracking');
    }

    if (formState.contenidos.length === 0) {
      newErrors.contenidos = t('pre_alert.error_select_content');
    }

    // Validar dirección según el estado actual
    if (addressState.selectedOption === 'store') {
      if (!addressState.selectedCity || !addressState.selectedLocker) {
        newErrors.address = t('pre_alert.error_select_store');
      }
    } else if (addressState.selectedOption === 'new') {
      if (
        !addressState.selectedState ||
        !addressState.selectedMunicipality ||
        !addressState.selectedParish ||
        !addressState.address
      ) {
        newErrors.address = t('pre_alert.error_complete_address');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, addressState]);

  const createMutation = useMutation({
    mutationFn: createPreAlerta,
    onSuccess: () => {
      toast.success(t('pre_alert.create_success'));
      navigate('/pre-alert/list');
    },
    onError: (error) => {
      toast.error(error.message || t('pre_alert.create_error'));
    },
  });

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error(t('pre_alert.error_required_fields'));
    return;
  }

  setIsSubmitting(true);

  try {
    const direccion = {};

    // ✅ CASO 1: Usar dirección predeterminada
    if (addressState.selectedOption === 'default') {
      const defaultAddr = userAddresses?.find((a) => a.esPredeterminada === true);

      if (defaultAddr) {
        // 🔥 CRÍTICO: Usar PascalCase
        direccion.IdDireccion = defaultAddr.id;
        direccion.Tipo = defaultAddr.tipoDireccion;
        
        if (defaultAddr.tipoDireccion === 'store') {
          direccion.Ciudad = defaultAddr.idCiudad?.toString() ?? '';
          direccion.Tienda = defaultAddr.idLocker?.toString() ?? '';
        } else if (defaultAddr.tipoDireccion === 'home') {
          direccion.Estado = defaultAddr.idEstado?.toString() ?? '';
          direccion.Municipio = defaultAddr.idMunicipio?.toString() ?? '';
          direccion.Parroquia = defaultAddr.idParroquia?.toString() ?? '';
          direccion.Direccion = defaultAddr.direccionCompleta ?? '';
          direccion.Referencia = defaultAddr.referencia ?? '';
          direccion.NombreDireccion = defaultAddr.nombreDireccion ?? '';
        }
      } else {
        // Fallback
        if (addressState.deliveryMethod === 'store') {
          direccion.Tipo = 'store';
          direccion.Ciudad = addressState.selectedCity;
          direccion.Tienda = addressState.selectedLocker;
        } else {
          direccion.Tipo = 'home';
          direccion.Estado = addressState.selectedState;
          direccion.Municipio = addressState.selectedMunicipality;
          direccion.Parroquia = addressState.selectedParish;
          direccion.Direccion = addressState.address;
          direccion.Referencia = addressState.reference;
          direccion.NombreDireccion = addressState.addressName;
        }
      }
    }
    // ✅ CASO 2: Nueva tienda
    else if (addressState.selectedOption === 'store') {
      direccion.Tipo = 'store';
      direccion.Ciudad = addressState.selectedCity;
      direccion.Tienda = addressState.selectedLocker;
      
      // Agregar flags si quiere guardar
      if (addressState.shouldSaveAddress) {
        direccion.NombreDireccion = addressState.addressName || 'Tienda sin nombre';
        direccion.GuardarDireccion = true;
        direccion.EstablecerPredeterminada = addressState.setAsDefaultAddress;
      }
    }
    // ✅ CASO 3: Nuevo domicilio
    else if (addressState.selectedOption === 'new') {
      direccion.Tipo = 'home';
      direccion.Estado = addressState.selectedState;
      direccion.Municipio = addressState.selectedMunicipality;
      direccion.Parroquia = addressState.selectedParish;
      direccion.Direccion = addressState.address;
      direccion.Referencia = addressState.reference;
      
      // Agregar flags si quiere guardar
      if (addressState.shouldSaveAddress) {
        direccion.NombreDireccion = addressState.addressName || 'Domicilio sin nombre';
        direccion.GuardarDireccion = true;
        direccion.EstablecerPredeterminada = addressState.setAsDefaultAddress;
      }
    }
    // ✅ CASO 4: Dirección guardada seleccionada
    else if (addressState.selectedOption?.startsWith('addr-')) {
      const addressId = parseInt(addressState.selectedOption.replace('addr-', ''));
      direccion.IdDireccion = addressId;

      const selectedAddr = userAddresses?.find((a) => a.id === addressId);
      if (selectedAddr) {
        direccion.Tipo = selectedAddr.tipoDireccion;
        
        if (selectedAddr.tipoDireccion === 'store') {
          direccion.Ciudad = selectedAddr.idCiudad?.toString() ?? '';
          direccion.Tienda = selectedAddr.idLocker?.toString() ?? '';
        } else {
          direccion.Estado = selectedAddr.idEstado?.toString() ?? '';
          direccion.Municipio = selectedAddr.idMunicipio?.toString() ?? '';
          direccion.Parroquia = selectedAddr.idParroquia?.toString() ?? '';
          direccion.Direccion = selectedAddr.direccionCompleta ?? '';
          direccion.Referencia = selectedAddr.referencia ?? '';
          direccion.NombreDireccion = selectedAddr.nombreDireccion ?? '';
        }
      }
    }

    const formatValueForBackend = (value) => {
      if (!value) return '0';
      return value.toString().replace(/\./g, '').replace(',', '.');
    };

    const valorParaBackend = formatValueForBackend(formState.valorDeclarado);

    const payload = {
      trackings: formState.trackings.filter((t) => t.trim().length > 0),
      contenidos: formState.contenidos,
      direccion,
      tipoContenido: Array.isArray(formState.tipoContenido)
        ? formState.tipoContenido.join(', ')
        : formState.tipoContenido || '',
      ...(valorParaBackend && valorParaBackend !== '0' && {
        valorDeclarado: {
          monto: valorParaBackend,
          moneda: formState.currency,
        },
      }),
      ...(formState.facturas.length > 0 && {
        facturas: formState.facturas,
      }),
    };

    // 🔍 LOG PARA DEBUG
    // console.log('📦 Payload enviado:', JSON.stringify(payload, null, 2));

    await createMutation.mutateAsync(payload);
  } catch (error) {
    console.error('Error en submit:', error);
  } finally {
    setIsSubmitting(false);
  }
};


  // ✅ VERIFICAR SI YA TIENE 4 DIRECCIONES (LÍMITE MÁXIMO)
  const hasReachedMaxAddresses = useMemo(() => {
    return userAddresses && userAddresses.length >= 4;
  }, [userAddresses]);



  const isFormValid = useMemo(() => {
    const hasValidTracking = formState.trackings.some(
      (t) => t.trim().length > 0 && t.trim().length <= 30
    );
    const hasContent = formState.contenidos.length > 0;

     // Validar parroquia si está en modo nueva dirección
    const hasValidAddress =
      addressState.selectedOption !== 'new' ||
      (!!addressState.selectedState &&
        !!addressState.selectedMunicipality &&
        !!addressState.selectedParish &&   // ← Agregar esto
        !!addressState.address);
    
    return hasValidTracking && hasContent && hasValidAddress;
  }, [formState.trackings, formState.contenidos]);

  return (
    <div className="prealert-create" translate="no">
      <div className="prealert-create__content">
        <div className="prealert-create__header">
          <div className="prealert-create__icon">
            <img
              src={iconImage}
              style={{
                width: 50,
                filter:
                  'invert(41%) sepia(99%) saturate(7496%) hue-rotate(358deg) brightness(99%) contrast(101%)',
              }}
              alt=""
            />
          </div>
          <h1 className="prealert-create__title">{t('pre_alert.create_title')}</h1>
          <p className="prealert-create__subtitle">
            {t('pre_alert.create_subtitle')}
          </p>
        </div>

        <form className="prealert-create__form" onSubmit={handleSubmit}>
          {/* SECCIÓN TRACKINGS */}
          <div className="prealert-create__section">
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                {t('pre_alert.tracking_section')}
                <span className="prealert-create__required">*</span>
              </label>
              <Tooltip
                content={t('pre_alert.tracking_tooltip')}
                position="auto"
              />
            </div>

            {formState.trackings.map((tracking, index) => (
              <div key={index} className="prealert-create__tracking-item">
                <input
                  type="text"
                  className="prealert-create__input"
                  placeholder={t('pre_alert.tracking_placeholder')}
                  value={tracking}
                  onChange={(e) => handleUpdateTracking(e.target.value, index)}
                  maxLength={30}
                  style={{ textTransform: 'uppercase' }}
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

            {/* <button
              type="button"
              onClick={handleAddTracking}
              className="prealert-create__add-btn"
            >
              + Añadir Tracking
            </button> */}
          </div>

          {/* SECCIÓN CONTENIDOS */}
          <div className="prealert-create__section" style={{ zIndex: 100 }}>
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                {t('pre_alert.content_section')} ({formState.contenidos.length} {t('pre_alert.content_selected')})
                <span className="prealert-create__required">*</span>
              </label>
              <Tooltip
                content={t('pre_alert.content_tooltip')}
                position="auto"
              />
            </div>

            <MultiSelectSearchable
              options={contentList}
              value={formState.contenidos}
              onChange={(values) => updateFormState('contenidos', values)}
              placeholder={
                formState.contenidos.length > 0
                  ? `${formState.contenidos.length} ${t('pre_alert.content_selected')}`
                  : t('pre_alert.content_placeholder')
              }
              searchPlaceholder={t('pre_alert.content_search_placeholder')}
              disabled={isLoadingContenidos}
              error={!!errors.contenidos}
            />
            {errors.contenidos && (
              <p className="prealert-create__error">{errors.contenidos}</p>
            )}
          </div>

        {/* ✅ SECCIÓN CONSOLIDADA: VALOR DECLARADO Y TIPO DE CONTENIDO */}
          <div className="prealert-create__section">
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                {t('pre_alert.declared_value_section')}
              </label>
              <Tooltip
                content={t('pre_alert.declared_value_tooltip')}
                position="auto"
              />
            </div>

            {/* CONTENEDOR GRID (Moneda | Monto | Tipo Contenido) */}
            <div className="prealert-create__value-type-grid">
              
              {/* COLUMNA 1: Moneda (Pequeña) */}
              <div className="prealert-create__col">
                <label className="prealert-create__label">{t('pre_alert.currency')}</label>
                <select
                  className="prealert-create__select"
                  value={formState.currency}
                  onChange={(e) => updateFormState('currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                  {/* <option value="EUR">EUR</option>
                  <option value="VES">VES</option> */}
                </select>
              </div>

              {/* COLUMNA 2: Monto (Grande) */}
              <div className="prealert-create__col">
                <label className="prealert-create__label">{t('pre_alert.amount')}</label>
                <CurrencyInput
                  className="prealert-create__input prealert-create__input--currency"
                  placeholder="0,00"
                  value={formState.valorDeclarado}
                  onChange={(formattedValue) => {
                    updateFormState('valorDeclarado', formattedValue);
                  }}
                  maxLength={10}
                />
              </div>

              {/* COLUMNA 3: Tipo de Contenido */}
              <div className="prealert-create__col">
                <label className="prealert-create__label">
                  {t('pre_alert.content_type')}
                </label>
                <div className="prealert-create__checkboxes">
                  {['Frágil', 'Líquidos'].map((option) => (
                    <label
                      key={option}
                      className="prealert-create__checkbox-option"
                    >
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

            </div>
          </div>

          {/* ✅ NUEVA SECCIÓN: DIRECCIÓN PREDETERMINADA CON OPCIÓN A CAMBIAR */}
          <div className="prealert-create__section">
            <div className="prealert-create__label-row">
              <label className="prealert-create__label">
                {t('pre_alert.address_section')}
              </label>
              <Tooltip
                content={t('pre_alert.address_tooltip')}
                position="auto"
              />
            </div>

            <div className="prealert-create__address-display">
              <div className="prealert-create__address-card">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{defaultAddressText || t('pre_alert.loading_address')}</span>
              </div>
            </div>

            <label className="prealert-create__checkbox-label">
              <input
                type="checkbox"
                checked={addressState.showChangeAddress}
                onChange={handleChangeAddressToggle}
              />
              <span>
                {t('pre_alert.change_address')}
              </span>
            </label>

            {/* FORMULARIO DE CAMBIO DE DIRECCIÓN */}
            {addressState.showChangeAddress && (
              <div className="prealert-create__address-change">
                <div className="prealert-create__radio-group">
                  {/* ✅ FILTRAR SOLO DIRECCIONES DE TIPO HOME QUE NO SEAN LA PREDETERMINADA */}
                  {userAddresses &&
                    userAddresses
                      .filter(
                        (addr) =>
                          addr.tipoDireccion === 'home' &&
                          !addr.esPredeterminada &&
                          !addr.EsPredeterminada
                      )
                      .map((addr) => (
                        <label
                          key={addr.id}
                          className="prealert-create__radio-option"
                        >
                          <input
                            type="radio"
                            checked={
                              addressState.selectedOption === `addr-${addr.id}`
                            }
                            onChange={() => handleSelectSavedAddress(addr.id)}
                          />
                          <div className="prealert-create__radio-content">
                            <span className="prealert-create__radio-title">
                              {addr.nombreDireccion || `Dirección ${addr.id}`}
                            </span>
                            <span className="prealert-create__radio-subtitle">
                              {addr.direccionCompleta}
                            </span>
                          </div>
                        </label>
                      ))}

                  {/* Opción de Retiro en Tienda */}
                  <label className="prealert-create__radio-option">
                    <input
                      type="radio"
                      checked={addressState.selectedOption === 'store'}
                      onChange={() =>
                        updateAddressState('selectedOption', 'store')
                      }
                    />
                    <span>{t('pre_alert.store_pickup')}</span>
                  </label>

                  {/* Opción de Nueva Dirección */}
                  <label className="prealert-create__radio-option">
                    <input
                      type="radio"
                      checked={addressState.selectedOption === 'new'}
                      onChange={() =>
                        updateAddressState('selectedOption', 'new')
                      }
                    />
                    <span>{t('pre_alert.other_address')}</span>
                  </label>
                </div>

                {/* FORMULARIO RETIRO EN TIENDA */}
                {addressState.selectedOption === 'store' && (
                  <div className="prealert-create__address-form">
                    <h4 className="prealert-create__form-title">
                      {t('pre_alert.store_form_title')}
                    </h4>

                    <div className="prealert-create__row">
                      <div className="prealert-create__col">
                        <label className="prealert-create__label">
                          {t('pre_alert.city')}{' '}
                          <span className="prealert-create__required">*</span>
                        </label>
                        <SearchableSelect
                          options={availableCities}
                          value={addressState.selectedCity}
                          onChange={handleCityChange}
                          placeholder={t('pre_alert.city_placeholder')}
                          disabled={isLoadingDelivery}
                        />
                      </div>

                      <div className="prealert-create__col">
                        <label className="prealert-create__label">
                          {t('pre_alert.store')}{' '}
                          <span className="prealert-create__required">*</span>
                        </label>
                        <SearchableSelect
                          options={filteredTiendas}
                          value={addressState.selectedLocker}
                          onChange={(value) =>
                            updateAddressState('selectedLocker', value)
                          }
                          placeholder={t('pre_alert.store_placeholder')}
                          disabled={
                            !addressState.selectedCity ||
                            filteredTiendas.length === 0
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FORMULARIO ENTREGA A DOMICILIO */}
                {addressState.selectedOption === 'new' && (
                  <div className="prealert-create__address-form">
                    <h4 className="prealert-create__form-title">
                      {t('pre_alert.home_form_title')}
                    </h4>

                    {/* <div className="prealert-create__col">
                      <label className="prealert-create__label">
                        Nombre de la Dirección
                      </label>
                      <input
                        type="text"
                        className="prealert-create__input"
                        placeholder="Ej: Casa, Oficina, etc."
                        value={addressState.addressName}
                        onChange={(e) =>
                          updateAddressState('addressName', e.target.value)
                        }
                      />
                    </div> */}

                    <div className="prealert-create__row prealert-create__row--three">
                      <div className="prealert-create__col">
                        <label className="prealert-create__label">
                          {t('pre_alert.state')}{' '}
                          <span className="prealert-create__required">*</span>
                        </label>
                        <SearchableSelect
                          options={statesData || []}
                          value={addressState.selectedState}
                          onChange={(value) => {
                            updateAddressState('selectedState', value);
                            updateAddressState('selectedMunicipality', '');
                            updateAddressState('selectedParish', '');
                          }}
                          placeholder={t('pre_alert.state_placeholder')}
                          disabled={isLoadingStates}
                        />
                      </div>

                      <div className="prealert-create__col">
                        <label className="prealert-create__label">
                          {t('pre_alert.municipality')}{' '}
                          <span className="prealert-create__required">*</span>
                        </label>
                        <SearchableSelect
                          options={municipalitiesData || []}
                          value={addressState.selectedMunicipality}
                          onChange={(value) => {
                            updateAddressState('selectedMunicipality', value);
                            updateAddressState('selectedParish', '');
                          }}
                          placeholder={t('pre_alert.municipality_placeholder')}
                          disabled={
                            !addressState.selectedState ||
                            isLoadingMunicipalities
                          }
                        />
                      </div>

                      <div className="prealert-create__col">
                        <label className="prealert-create__label">
                          {t('pre_alert.parish')}{' '}
                          <span className="prealert-create__required">*</span>
                        </label>
                        <SearchableSelect
                          options={parishesData || []}
                          value={addressState.selectedParish}
                          onChange={(value) =>
                            updateAddressState('selectedParish', value)
                          }
                          placeholder={t('pre_alert.parish_placeholder')}
                          disabled={
                            !addressState.selectedMunicipality ||
                            isLoadingParishes
                          }
                        />
                      </div>
                    </div>

                    <div className="prealert-create__col">
                      <label className="prealert-create__label">
                        {t('pre_alert.full_address')}{' '}
                        <span className="prealert-create__required">*</span>
                      </label>
                      <textarea
                        className="prealert-create__textarea"
                        placeholder={t('pre_alert.full_address_placeholder')}
                        rows={3}
                        value={addressState.address}
                        onChange={(e) =>
                          updateAddressState('address', e.target.value)
                        }
                      />
                    </div>

                    <div className="prealert-create__col">
                      <label className="prealert-create__label">
                        {t('pre_alert.reference')}
                      </label>
                      <input
                        type="text"
                        className="prealert-create__input"
                        placeholder={t('pre_alert.reference_placeholder')}
                        value={addressState.reference}
                        onChange={(e) =>
                          updateAddressState('reference', e.target.value)
                        }
                      />
                    </div>



                     {/* ✅ NUEVO: CHECKBOXES PARA GUARDAR DIRECCIÓN */}
                    <div className="prealert-create__save-options">
                      {/* ✅ Deshabilitar si alcanzó el límite */}
                      <label 
                        className={`prealert-create__checkbox-label ${hasReachedMaxAddresses ? 'disabled' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={addressState.shouldSaveAddress}
                          onChange={(e) =>
                            updateAddressState('shouldSaveAddress', e.target.checked)
                          }
                          disabled={hasReachedMaxAddresses} // ⬅️ Deshabilitar si alcanzó límite
                        />
                        <span>{t('pre_alert.save_address')}</span>
                      </label>

                      {/* ✅ Mensaje de límite alcanzado */}
                      {hasReachedMaxAddresses && (
                        <div className="prealert-create__limit-warning">
                          <IoAlertCircleOutline size={18} />
                          <span>
                            {t('pre_alert.address_limit_warning')}
                          </span>
                        </div>
                      )}

                      {/* ✅ Mostrar input de nombre solo si shouldSaveAddress está activo */}
                      {addressState.shouldSaveAddress && (
                        <>
                          <div className="prealert-create__col" style={{ marginTop: '12px' }}>
                            <label className="prealert-create__label">
                              {t('pre_alert.save_address_name')}
                            </label>
                            <input
                              type="text"
                              className="prealert-create__input"
                              placeholder={t('pre_alert.save_address_name_placeholder')}
                              value={addressState.addressName}
                              onChange={(e) =>
                                updateAddressState('addressName', e.target.value)
                              }
                            />
                          </div>

                          <label className="prealert-create__checkbox-label" style={{ marginTop: '12px' }}>
                            <input
                              type="checkbox"
                              checked={addressState.setAsDefaultAddress}
                              onChange={(e) =>
                                updateAddressState('setAsDefaultAddress', e.target.checked)
                              }
                            />
                            <span>{t('pre_alert.set_default')}</span>
                          </label>
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN FACTURAS */}
          <div className="prealert-create__section">
            <label className="prealert-create__label">
              {t('pre_alert.invoices_section')} ({formState.facturas.length}/3)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="prealert-create__file-input"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*"
              multiple
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="prealert-create__file-btn"
              disabled={formState.facturas.length >= 3}
              style={
                formState.facturas.length >= 3
                  ? { opacity: 0.5, cursor: 'not-allowed' }
                  : {}
              }
            >
              📎{' '}
              {formState.facturas.length === 0
                ? t('pre_alert.select_files')
                : t('pre_alert.add_more_files')}
            </button>

            {formState.facturas.length === 0 ? (
              <p className="prealert-create__helper-text">
                {t('pre_alert.files_helper')}
              </p>
            ) : (
              <div className="prealert-create__files-list">
                {formState.facturas.map((file, index) => (
                  <div key={index} className="prealert-create__file-item">
                    <div className="prealert-create__file-info">
                      <span className="prealert-create__file-icon">
                        {file.type === 'application/pdf' ? '📄' : '🖼️'}
                      </span>
                      <span className="prealert-create__file-name">
                        {file.name}
                      </span>
                      <span className="prealert-create__file-size">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
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

          {/* BOTÓN SUBMIT */}
          <div className="prealert-create__actions">
            <button
              type="submit"
              className="prealert-create__submit-btn"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>{t('pre_alert.creating')}</span>
                </>
              ) : (
                t('pre_alert.create_submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreAlertCreate;
