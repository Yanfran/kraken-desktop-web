import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Services
import {
  getPaquetesContenidos,
  createPreAlerta,
  getPreAlertaById,
  updatePreAlerta,
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

import './PreAlertEdit.styles.scss'; // Will create this style file later

const PreAlertEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params
  const fileInputRef = useRef(null);

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
  });

  const [defaultAddressText, setDefaultAddressText] = useState(
    'Cargando dirección...'
  );
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

  // Fetch pre-alert data for editing
  const { data: preAlertaData, isLoading: isLoadingPreAlerta } = useQuery({
    queryKey: ['preAlerta', id],
    queryFn: () => getPreAlertaById(Number(id)),
    enabled: !!id, // Only fetch if ID is available
    select: (response) => response.data,
  });

  // Process cities (solo Caracas ID=50)
  const availableCities = useMemo(() => {
    if (!deliveryData?.ciudad) return [];
    return [
      {
        label: deliveryData.ciudad.name,
        value: deliveryData.ciudad.id.toString(),
      },
    ];
  }, [deliveryData]);

  // Filtrar tiendas tipo 2 (Lockers)
  const filteredTiendas = useMemo(() => {
    if (!deliveryData?.tiendas) return [];
    return deliveryData.tiendas
      .filter((t) => t.idTiendaTipo === 2)
      .map((t) => ({ label: t.nombre, value: t.id.toString() }));
  }, [deliveryData]);

  const contentList = useMemo(() => {
    if (!contenidosData) return [];
    return contenidosData.map((c) => ({
      label: c.contenido,
      value: c.id.toString(),
    }));
  }, [contenidosData]);

  // Effect to populate form when preAlertaData is loaded
  useEffect(() => {
    if (preAlertaData) {
      setFormState({
        trackings: preAlertaData.trackings || [preAlertaData.tracking].filter(Boolean) || [''],
        contenidos: preAlertaData.contenidos?.map(c => c.id.toString()) || [],
        valorDeclarado: parseFormattedValue(preAlertaData.valorDeclarado?.monto) || '',
        currency: preAlertaData.valorDeclarado?.moneda || 'USD',
        tipoContenido: preAlertaData.tipoContenido?.split(', ').filter(Boolean) || [],
        facturas: preAlertaData.archivosActuales?.map(file => ({
          name: file.nombreArchivo,
          uri: file.rutaArchivo, // Assuming URI is available for existing files
          type: file.tipoArchivo, // Assuming type is available
          size: file.tamaño,
        })) || [],
      });

      // Populate address state
      if (preAlertaData.direccionTipo === 'store') {
        setAddressState(prev => ({
          ...prev,
          deliveryMethod: 'store',
          selectedCity: preAlertaData.idCiudad?.toString() || '',
          selectedLocker: preAlertaData.idLocker?.toString() || '',
          selectedOption: 'store',
        }));
        setDefaultAddressText(`Retiro en tienda: ${preAlertaData.nombreLocker || 'Locker'}`);
      } else if (preAlertaData.direccionTipo === 'home') {
        // Check if it's a saved address
        const savedAddress = userAddresses?.find(addr => addr.id === preAlertaData.idDireccion);
        if (savedAddress) {
          setAddressState(prev => ({
            ...prev,
            deliveryMethod: 'home',
            selectedState: savedAddress.idEstado?.toString() || '',
            selectedMunicipality: savedAddress.idMunicipio?.toString() || '',
            selectedParish: savedAddress.idParroquia?.toString() || '',
            address: savedAddress.direccionCompleta || '',
            reference: savedAddress.referencia || '',
            addressName: savedAddress.nombreDireccion || '',
            selectedOption: `addr-${savedAddress.id}`,
          }));
        } else {
          // It's a new address or not found in saved addresses
          setAddressState(prev => ({
            ...prev,
            deliveryMethod: 'home',
            selectedState: preAlertaData.idEstado?.toString() || '',
            selectedMunicipality: preAlertaData.idMunicipio?.toString() || '',
            selectedParish: preAlertaData.idParroquia?.toString() || '',
            address: preAlertaData.direccion || '',
            reference: preAlertaData.referencia || '',
            addressName: preAlertaData.nombreDireccion || '',
            selectedOption: 'new',
          }));
        }

        const parts = [
          preAlertaData.direccion,
          preAlertaData.nombreParroquia,
          preAlertaData.nombreMunicipio,
          preAlertaData.nombreEstado,
        ].filter(Boolean);
        setDefaultAddressText(preAlertaData.nombreDireccion || parts.join(', '));
      }
      setAddressState(prev => ({ ...prev, showChangeAddress: true })); // Always show change address section for editing
    }
  }, [preAlertaData, userAddresses]);

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
        toast.error(`Solo puedes seleccionar máximo ${maxFiles} archivos`);
        return;
      }

      const currentFiles = formState.facturas;
      const totalFiles = currentFiles.length + files.length;

      if (totalFiles > maxFiles) {
        const allowedCount = maxFiles - currentFiles.length;
        toast.error(
          `Solo puedes agregar ${allowedCount} archivo(s) más. Máximo ${maxFiles} archivos en total.`
        );
        return;
      }

      const validFiles = files.filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(
            `${file.name}: Tipo no permitido. Solo PDF e imágenes (JPG, PNG, GIF, WEBP)`
          );
          return false;
        }
        if (file.size > maxSize) {
          toast.error(`${file.name}: Máximo 5MB`);
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
          `Se ${
            validFiles.length === 1
              ? 'agregó 1 archivo'
              : `agregaron ${validFiles.length} archivos`
          } correctamente.`
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
      newErrors.tracking = 'Debe ingresar al menos un tracking válido';
    }

    if (formState.contenidos.length === 0) {
      newErrors.contenidos = 'Debe seleccionar al menos un contenido';
    }

    // Validar dirección según el estado actual
    if (addressState.selectedOption === 'store') {
      if (!addressState.selectedCity || !addressState.selectedLocker) {
        newErrors.address = 'Debe seleccionar ciudad y tienda';
      }
    } else if (addressState.selectedOption === 'new') {
      if (
        !addressState.selectedState ||
        !addressState.selectedMunicipality ||
        !addressState.address
      ) {
        newErrors.address = 'Complete todos los campos de dirección';
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

  const updateMutation = useMutation({
    mutationFn: (data) => updatePreAlerta(Number(id), data),
    onSuccess: () => {
      toast.success('¡Pre-alerta actualizada exitosamente!');
      navigate('/pre-alert/list');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar pre-alerta');
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
      const direccion = {};

      // ✅ CASO 1: Usar dirección predeterminada (selectedOption === 'default')
      if (addressState.selectedOption === 'default') {
        const defaultAddr = userAddresses?.find(
          (a) => a.esPredeterminada === true
        );

        if (defaultAddr) {          
          direccion.idDireccion = defaultAddr.id;
          direccion.tipo = defaultAddr.tipoDireccion;
        } else {
          // Fallback: si no hay predeterminada pero está en modo 'default',
          // crear nueva dirección con los datos actuales          
          if (addressState.deliveryMethod === 'store') {
            direccion.tipo = 'store';
            direccion.ciudad = addressState.selectedCity;
            direccion.tienda = addressState.selectedLocker;
          } else {
            direccion.tipo = 'home';
            direccion.estado = addressState.selectedState;
            direccion.municipio = addressState.selectedMunicipality;
            direccion.parroquia = addressState.selectedParish;
            direccion.direccion = addressState.address;
            direccion.referencia = addressState.reference;
            direccion.nombreDireccion = addressState.addressName;
          }
        }
      }
      // ✅ CASO 2: Nueva tienda
      else if (addressState.selectedOption === 'store') {        
        direccion.tipo = 'store';
        direccion.ciudad = addressState.selectedCity;
        direccion.tienda = addressState.selectedLocker;
      }
      // ✅ CASO 3: Nuevo domicilio
      else if (addressState.selectedOption === 'new') {        
        direccion.tipo = 'home';
        direccion.estado = addressState.selectedState;
        direccion.municipio = addressState.selectedMunicipality;
        direccion.parroquia = addressState.selectedParish;
        direccion.direccion = addressState.address;
        direccion.referencia = addressState.reference;
        direccion.nombreDireccion = addressState.addressName;
      }
      // ✅ CASO 4: Dirección guardada seleccionada (addr-{id})
      else if (addressState.selectedOption?.startsWith('addr-')) {
        const addressId = parseInt(
          addressState.selectedOption.replace('addr-', '')
        );        
        direccion.idDireccion = addressId;

        // Buscar el tipo de dirección
        const selectedAddr = userAddresses?.find((a) => a.id === addressId);
        if (selectedAddr) {
          direccion.tipo = selectedAddr.tipoDireccion;
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
      ...(valorParaBackend &&
        valorParaBackend !== '0' && {
          valorDeclarado: {
            monto: valorParaBackend,
            moneda: formState.currency,
          },
        }),
      // ✅ CAMBIO CRÍTICO: Enviar los archivos File directos (sin URL.createObjectURL)
      ...(formState.facturas.length > 0 && {
        facturas: formState.facturas // ✅ Array de objetos File nativos del navegador
      }),
    };
      

      if (id) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error('Error en submit:', error);
      toast.error(error.message || 'Error al enviar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    const hasValidTracking = formState.trackings.some(
      (t) => t.trim().length > 0 && t.trim().length <= 30
    );
    const hasContent = formState.contenidos.length > 0;
    return hasValidTracking && hasContent;
  }, [formState.trackings, formState.contenidos]);

  if (isLoadingPreAlerta || isLoadingContenidos || isLoadingDelivery || isLoadingUserAddresses || isLoadingStates || isLoadingMunicipalities || isLoadingParishes) {
    return (
      <div className="prealert-edit">
        <div className="prealert-edit__loading">
          <LoadingSpinner />
          <p>Cargando pre-alerta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prealert-edit">
      <div className="prealert-edit__content">
        <div className="prealert-edit__header">
          <div className="prealert-edit__icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="prealert-edit__title">Editar Pre-Alerta</h1>
          <p className="prealert-edit__subtitle">
            Modifica los detalles de tu pre-alerta existente
          </p>
        </div>

        <form className="prealert-edit__form" onSubmit={handleSubmit}>
          {/* SECCIÓN TRACKINGS */}
          <div className="prealert-edit__section">
            <div className="prealert-edit__label-row">
              <label className="prealert-edit__label">
                Números de Tracking
                <span className="prealert-edit__required">*</span>
              </label>
              <div className="prealert-edit__tooltip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="prealert-edit__tooltip-text">
                  Ingresa el o los números de tracking que te proporcionó la
                  tienda
                </span>
              </div>
            </div>

            {formState.trackings.map((tracking, index) => (
              <div key={index} className="prealert-edit__tracking-item">
                <input
                  type="text"
                  className="prealert-edit__input"
                  placeholder="Ejemplo: 1ZE9889W04276202"
                  value={tracking}
                  onChange={(e) => handleUpdateTracking(e.target.value, index)}
                  maxLength={30}
                  style={{ textTransform: 'uppercase' }}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTracking(index)}
                    className="prealert-edit__remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {errors.tracking && (
              <p className="prealert-edit__error">{errors.tracking}</p>
            )}

            <button
              type="button"
              onClick={handleAddTracking}
              className="prealert-edit__add-btn"
            >
              + Añadir Tracking
            </button>
          </div>

          {/* SECCIÓN CONTENIDOS */}
          <div className="prealert-edit__section" style={{ zIndex: 100 }}>
            <div className="prealert-edit__label-row">
              <label className="prealert-edit__label">
                Contenido ({formState.contenidos.length} seleccionado
                {formState.contenidos.length !== 1 ? 's' : ''})
                <span className="prealert-edit__required">*</span>
              </label>
              <div className="prealert-edit__tooltip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="prealert-edit__tooltip-text">
                  Selecciona uno o más productos o categorías del contenido de
                  tu paquete
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
                  : 'Seleccionar contenidos'
              }
              searchPlaceholder="Buscar contenido..."
              disabled={isLoadingContenidos}
              error={!!errors.contenidos}
            />
            {errors.contenidos && (
              <p className="prealert-edit__error">{errors.contenidos}</p>
            )}
          </div>

          {/* SECCIÓN VALOR DECLARADO */}
          <div className="prealert-edit__section">
            <div className="prealert-edit__label-row">
              <label className="prealert-edit__label">
                Valor Declarado (Opcional)
              </label>
              <div className="prealert-edit__tooltip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="prealert-edit__tooltip-text">
                  Debes ingresar el monto total de los artículos contenidos en
                  el paquete
                </span>
              </div>
            </div>

            <div className="prealert-edit__row">
              <div className="prealert-edit__col prealert-edit__col--small">
                <select
                  className="prealert-edit__select"
                  value={formState.currency}
                  onChange={(e) => updateFormState('currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                </select>
              </div>

              <div className="prealert-edit__col">
                <CurrencyInput
                  className="prealert-edit__input prealert-edit__input--currency"
                  placeholder="0,00"
                  value={formState.valorDeclarado}
                  onChange={(formattedValue, numericValue) => {
                    // ✅ Solo guardar valores reales, no enviar "0,01" por escribir "1"
                    if (numericValue > 0) {
                      updateFormState('valorDeclarado', formattedValue);
                    } else {
                      updateFormState('valorDeclarado', '');
                    }
                  }}
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN TIPO DE CONTENIDO */}
          <div className="prealert-edit__section">
            <label className="prealert-edit__label">
              Tipo de Contenido (Opcional)
            </label>
            <div className="prealert-edit__checkboxes">
              {['Frágil', 'Líquidos'].map((option) => (
                <label
                  key={option}
                  className="prealert-edit__checkbox-option"
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

          {/* ✅ NUEVA SECCIÓN: DIRECCIÓN PREDETERMINADA CON OPCIÓN A CAMBIAR */}
          <div className="prealert-edit__section">
            <div className="prealert-edit__label-row">
              <label className="prealert-edit__label">
                Dirección de Entrega Predeterminada
              </label>
              <div className="prealert-edit__tooltip">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="prealert-edit__tooltip-text">
                  Esta es la dirección en la que recibirás todos tus paquetes.
                  Si no la modificas ahora, tu paquete será enviado allí y no
                  podrás cambiarla después de que llegue a nuestro almacén.
                </span>
              </div>
            </div>

            <div className="prealert-edit__address-display">
              <div className="prealert-edit__address-card">
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
                <span>{defaultAddressText}</span>
              </div>
            </div>

            <label className="prealert-edit__checkbox-label">
              <input
                type="checkbox"
                checked={addressState.showChangeAddress}
                onChange={handleChangeAddressToggle}
              />
              <span>
                ¿Deseas cambiar la dirección de entrega de este paquete?
              </span>
            </label>

            {/* FORMULARIO DE CAMBIO DE DIRECCIÓN */}
            {addressState.showChangeAddress && (
              <div className="prealert-edit__address-change">
                <div className="prealert-edit__radio-group">
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
                          className="prealert-edit__radio-option"
                        >
                          <input
                            type="radio"
                            checked={
                              addressState.selectedOption === `addr-${addr.id}`
                            }
                            onChange={() => handleSelectSavedAddress(addr.id)}
                          />
                          <div className="prealert-edit__radio-content">
                            <span className="prealert-edit__radio-title">
                              {addr.nombreDireccion || `Dirección ${addr.id}`}
                            </span>
                            <span className="prealert-edit__radio-subtitle">
                              {addr.direccionCompleta}
                            </span>
                          </div>
                        </label>
                      ))}

                  {/* Opción de Retiro en Tienda */}
                  <label className="prealert-edit__radio-option">
                    <input
                      type="radio"
                      checked={addressState.selectedOption === 'store'}
                      onChange={() =>
                        updateAddressState('selectedOption', 'store')
                      }
                    />
                    <span>Retiro en Tienda</span>
                  </label>

                  {/* Opción de Nueva Dirección */}
                  <label className="prealert-edit__radio-option">
                    <input
                      type="radio"
                      checked={addressState.selectedOption === 'new'}
                      onChange={() =>
                        updateAddressState('selectedOption', 'new')
                      }
                    />
                    <span>Enviar a otra dirección</span>
                  </label>
                </div>

                {/* FORMULARIO RETIRO EN TIENDA */}
                {addressState.selectedOption === 'store' && (
                  <div className="prealert-edit__address-form">
                    <h4 className="prealert-edit__form-title">
                      Retiro en Tienda
                    </h4>

                    <div className="prealert-edit__row">
                      <div className="prealert-edit__col">
                        <label className="prealert-edit__label">
                          Ciudad{' '}
                          <span className="prealert-edit__required">*</span>
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

                      <div className="prealert-edit__col">
                        <label className="prealert-edit__label">
                          Tienda/Locker{' '}
                          <span className="prealert-edit__required">*</span>
                        </label>
                        <SearchableSelect
                          options={filteredTiendas}
                          value={addressState.selectedLocker}
                          onChange={(value) =>
                            updateAddressState('selectedLocker', value)
                          }
                          placeholder="Seleccione una tienda"
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
                  <div className="prealert-edit__address-form">
                    <h4 className="prealert-edit__form-title">
                      Entrega a Domicilio
                    </h4>

                    <div className="prealert-edit__col">
                      <label className="prealert-edit__label">
                        Nombre de la Dirección
                      </label>
                      <input
                        type="text"
                        className="prealert-edit__input"
                        placeholder="Ej: Casa, Oficina, etc."
                        value={addressState.addressName}
                        onChange={(e) =>
                          updateAddressState('addressName', e.target.value)
                        }
                      />
                    </div>

                    <div className="prealert-edit__row prealert-edit__row--three">
                      <div className="prealert-edit__col">
                        <label className="prealert-edit__label">
                          Estado{' '}
                          <span className="prealert-edit__required">*</span>
                        </label>
                        <SearchableSelect
                          options={statesData || []}
                          value={addressState.selectedState}
                          onChange={(value) => {
                            updateAddressState('selectedState', value);
                            updateAddressState('selectedMunicipality', '');
                            updateAddressState('selectedParish', '');
                          }}
                          placeholder="Seleccionar estado"
                          disabled={isLoadingStates}
                        />
                      </div>

                      <div className="prealert-edit__col">
                        <label className="prealert-edit__label">
                          Municipio{' '}
                          <span className="prealert-edit__required">*</span>
                        </label>
                        <SearchableSelect
                          options={municipalitiesData || []}
                          value={addressState.selectedMunicipality}
                          onChange={(value) => {
                            updateAddressState('selectedMunicipality', value);
                            updateAddressState('selectedParish', '');
                          }}
                          placeholder="Seleccionar municipio"
                          disabled={
                            !addressState.selectedState ||
                            isLoadingMunicipalities
                          }
                        />
                      </div>

                      <div className="prealert-edit__col">
                        <label className="prealert-edit__label">
                          Parroquia{' '}
                          <span className="prealert-edit__required">*</span>
                        </label>
                        <SearchableSelect
                          options={parishesData || []}
                          value={addressState.selectedParish}
                          onChange={(value) =>
                            updateAddressState('selectedParish', value)
                          }
                          placeholder="Seleccionar parroquia"
                          disabled={
                            !addressState.selectedMunicipality ||
                            isLoadingParishes
                          }
                        />
                      </div>
                    </div>

                    <div className="prealert-edit__col">
                      <label className="prealert-edit__label">
                        Dirección Completa{' '}
                        <span className="prealert-edit__required">*</span>
                      </label>
                      <textarea
                        className="prealert-edit__textarea"
                        placeholder="Ej: Calle 1, Edificio X, Apto Y"
                        rows={3}
                        value={addressState.address}
                        onChange={(e) =>
                          updateAddressState('address', e.target.value)
                        }
                      />
                    </div>

                    <div className="prealert-edit__col">
                      <label className="prealert-edit__label">
                        Punto de Referencia
                      </label>
                      <input
                        type="text"
                        className="prealert-edit__input"
                        placeholder="Ej: Casa con portón azul"
                        value={addressState.reference}
                        onChange={(e) =>
                          updateAddressState('reference', e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN FACTURAS */}
          <div className="prealert-edit__section">
            <label className="prealert-edit__label">
              Facturas ({formState.facturas.length}/3)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="prealert-edit__file-input"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*"
              multiple
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="prealert-edit__file-btn"
              disabled={formState.facturas.length >= 3}
              style={
                formState.facturas.length >= 3
                  ? { opacity: 0.5, cursor: 'not-allowed' }
                  : {}
              }
            >
              📎{' '}
              {formState.facturas.length === 0
                ? 'Seleccionar Archivos (Max 3)'
                : 'Agregar más archivos'}
            </button>

            {formState.facturas.length === 0 ? (
              <p className="prealert-edit__helper-text">
                Máximo 3 archivos (PDF, imágenes - JPG, PNG, GIF, WEBP)
              </p>
            ) : (
              <div className="prealert-edit__files-list">
                {formState.facturas.map((file, index) => (
                  <div key={index} className="prealert-edit__file-item">
                    <div className="prealert-edit__file-info">
                      <span className="prealert-edit__file-icon">
                        {file.type === 'application/pdf' ? '📄' : '🖼️'}
                      </span>
                      <span className="prealert-edit__file-name">
                        {file.name}
                      </span>
                      <span className="prealert-edit__file-size">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="prealert-edit__file-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="prealert-edit__actions">
            <button
              type="submit"
              className="prealert-edit__submit-btn"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Actualizando...</span>
                </>
              ) : (
                'Actualizar Pre-Alerta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreAlertEdit;