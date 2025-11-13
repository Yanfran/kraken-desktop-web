

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPaquetesContenidos, createPreAlerta, updatePreAlerta } from '../../services/preAlertService';
import { getStatesByCountry, getMunicipalitiesByState, getParishesByMunicipality, getDeliveryData } from '../../services/address/addressService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/Loading/Loading'; // Assuming a LoadingSpinner component exists
import SearchableSelect from '../../components/common/SearchableSelect/SearchableSelect'; // Assuming a SearchableSelect component exists
import MultiSelectSearchable from '../../components/common/MultiSelectSearchable/MultiSelectSearchable';

import './PreAlertForm.styles.scss';

const PreAlertForm = ({ initialData, isEditMode = false }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      trackings: [{ value: '' }],
      contenidos: [],
      valorDeclarado: '',
      moneda: 'USD',
      direccionTipo: 'home',
      idEstado: '',
      idMunicipio: '',
      idParroquia: '',
      direccion: '',
      referencia: '',
      idLocker: '',
    },
  });

  // Effect to pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setValue('valorDeclarado', initialData.valorDeclarado?.toString() || '');
      setValue('moneda', initialData.moneda || 'USD');
      setValue('direccionTipo', initialData.direccionTipo || 'home');

      if (initialData.trackings && initialData.trackings.length > 0) {
        setValue('trackings', initialData.trackings.map(t => ({ value: t })));
      } else {
        setValue('trackings', [{ value: '' }]);
      }

      if (initialData.contenidos && initialData.contenidos.length > 0) {
        setValue('contenidos', initialData.contenidos.map(c => c.id.toString()));
      } else {
        setValue('contenidos', []);
      }

      if (initialData.direccionTipo === 'home' && initialData.direccion) {
        setValue('idEstado', initialData.direccion.idEstado?.toString() || '');
        setValue('idMunicipio', initialData.direccion.idMunicipio?.toString() || '');
        setValue('idParroquia', initialData.direccion.idParroquia?.toString() || '');
        setValue('direccion', initialData.direccion.direccion || '');
        setValue('referencia', initialData.direccion.referencia || '');
      } else if (initialData.direccionTipo === 'store' && initialData.idLocker) {
        setValue('idLocker', initialData.idLocker.toString());
      }

      if (initialData.archivosActuales && initialData.archivosActuales.length > 0) {
        const existingFileMocks = initialData.archivosActuales.map(file => ({
          name: file.nombreArchivo,
          size: file.tamaño || 0,
          type: file.tipoArchivo || 'application/octet-stream',
        }));
        setSelectedFiles(existingFileMocks);
      }
    }
  }, [isEditMode, initialData, setValue]);

  // Effect to pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setValue('valorDeclarado', initialData.valorDeclarado?.toString() || '');
      setValue('moneda', initialData.moneda || 'USD');
      setValue('direccionTipo', initialData.direccionTipo || 'home');

      if (initialData.trackings && initialData.trackings.length > 0) {
        setValue('trackings', initialData.trackings.map(t => ({ value: t })));
      } else {
        setValue('trackings', [{ value: '' }]);
      }

      if (initialData.contenidos && initialData.contenidos.length > 0) {
        setValue('contenidos', initialData.contenidos.map(c => c.id.toString()));
      } else {
        setValue('contenidos', []);
      }

      if (initialData.direccionTipo === 'home' && initialData.direccion) {
        setValue('idEstado', initialData.direccion.idEstado?.toString() || '');
        setValue('idMunicipio', initialData.direccion.idMunicipio?.toString() || '');
        setValue('idParroquia', initialData.direccion.idParroquia?.toString() || '');
        setValue('direccion', initialData.direccion.direccion || '');
        setValue('referencia', initialData.direccion.referencia || '');
      } else if (initialData.direccionTipo === 'store' && initialData.idLocker) {
        setValue('idLocker', initialData.idLocker.toString());
      }

      if (initialData.archivosActuales && initialData.archivosActuales.length > 0) {
        const existingFileMocks = initialData.archivosActuales.map(file => ({
          name: file.nombreArchivo,
          size: file.tamaño || 0,
          type: file.tipoArchivo || 'application/octet-stream',
        }));
        setSelectedFiles(existingFileMocks);
      }
    }
  }, [isEditMode, initialData, setValue]);

  // Effect to pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setValue('valorDeclarado', initialData.valorDeclarado?.toString() || '');
      setValue('moneda', initialData.moneda || 'USD');
      setValue('direccionTipo', initialData.direccionTipo || 'home');

      if (initialData.trackings && initialData.trackings.length > 0) {
        setValue('trackings', initialData.trackings.map(t => ({ value: t })));
      } else {
        setValue('trackings', [{ value: '' }]);
      }

      if (initialData.contenidos && initialData.contenidos.length > 0) {
        setValue('contenidos', initialData.contenidos.map(c => c.id.toString()));
      } else {
        setValue('contenidos', []);
      }

      if (initialData.direccionTipo === 'home' && initialData.direccion) {
        setValue('idEstado', initialData.direccion.idEstado?.toString() || '');
        setValue('idMunicipio', initialData.direccion.idMunicipio?.toString() || '');
        setValue('idParroquia', initialData.direccion.idParroquia?.toString() || '');
        setValue('direccion', initialData.direccion.direccion || '');
        setValue('referencia', initialData.direccion.referencia || '');
      } else if (initialData.direccionTipo === 'store' && initialData.idLocker) {
        setValue('idLocker', initialData.idLocker.toString());
      }

      if (initialData.archivosActuales && initialData.archivosActuales.length > 0) {
        const existingFileMocks = initialData.archivosActuales.map(file => ({
          name: file.nombreArchivo,
          size: file.tamaño || 0,
          type: file.tipoArchivo || 'application/octet-stream',
        }));
        setSelectedFiles(existingFileMocks);
      }
    }
  }, [isEditMode, initialData, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'trackings',
  });

  // Watch for changes in direccionTipo to conditionally render fields
  const direccionTipo = useWatch({
    control,
    name: 'direccionTipo',
    defaultValue: initialData?.direccionTipo || 'home',
  });

  const selectedStateId = useWatch({ control, name: 'idEstado' });
  const selectedMunicipalityId = useWatch({ control, name: 'idMunicipio' });

  // Queries to fetch data for selects
  const { data: contenidosData, isLoading: isLoadingContenidos } = useQuery({
    queryKey: ['paquetesContenidos'],
    queryFn: getPaquetesContenidos,
    select: (response) => response.data, // Extract data from the api response
  });

  const { data: statesData, isLoading: isLoadingStates } = useQuery({
    queryKey: ['states'],
    queryFn: () => getStatesByCountry(1),
    select: (response) => response.data?.map(s => ({ label: s.name, value: s.id.toString() })), // Format for SearchableSelect
  });

  const { data: municipalitiesData, isLoading: isLoadingMunicipalities } = useQuery({
    queryKey: ['municipalities', selectedStateId],
    queryFn: () => getMunicipalitiesByState(selectedStateId),
    enabled: !!selectedStateId,
    select: (response) => response.data?.map(m => ({ label: m.name, value: m.id.toString() })), // Format for SearchableSelect
  });

  const { data: parishesData, isLoading: isLoadingParishes } = useQuery({
    queryKey: ['parishes', selectedMunicipalityId],
    queryFn: () => getParishesByMunicipality(selectedMunicipalityId),
    enabled: !!selectedMunicipalityId,
    select: (response) => response.data?.map(p => ({ label: p.name, value: p.id.toString() })), // Format for SearchableSelect
  });

  const { data: lockersData, isLoading: isLoadingLockers } = useQuery({
    queryKey: ['lockers'],
    queryFn: getDeliveryData,
    select: (response) => {
      // console.log("PreAlertForm: Delivery data (lockers) response:", response);
      return response.data?.tiendas
        .filter(t => t.idTiendaTipo === 2)
        .map(t => ({ label: t.nombre, value: t.id.toString() }));
    }, // Format for SearchableSelect
  });

  // Reset dependent selects when parent changes
  useEffect(() => {
    if (direccionTipo === 'home') {
      setValue('idMunicipio', '');
      setValue('idParroquia', '');
    } else {
      setValue('idLocker', '');
      setValue('idEstado', '');
      setValue('idMunicipio', '');
      setValue('idParroquia', '');
      setValue('direccion', '');
      setValue('referencia', '');
    }
  }, [direccionTipo, setValue]);

  useEffect(() => {
    setValue('idMunicipio', '');
    setValue('idParroquia', '');
  }, [selectedStateId, setValue]);

  useEffect(() => {
    setValue('idParroquia', '');
  }, [selectedMunicipalityId, setValue]);

  // File handling
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const newValidFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Archivo ${file.name}: Tipo no permitido.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`Archivo ${file.name}: Demasiado grande (máx 5MB).`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...newValidFiles]);
  };

  const handleRemoveFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const createMutation = useMutation({
    mutationFn: createPreAlerta,
    onSuccess: () => {
      toast.success('Pre-alerta creada exitosamente!');
      navigate('/pre-alert/list');
    },
    onError: (error) => {
      toast.error(`Error al crear pre-alerta: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePreAlerta(id, payload),
    onSuccess: () => {
      toast.success('Pre-alerta actualizada exitosamente!');
      navigate('/pre-alert/list');
    },
    onError: (error) => {
      toast.error(`Error al actualizar pre-alerta: ${error.message}`);
    },
  });

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  const onSubmit = async (data) => {
    // console.log('Form data:', data);
    const formData = new FormData();

    // Append trackings
    data.trackings.map(t => t.value).filter(Boolean).forEach((tracking, index) => {
      formData.append(`trackings[${index}]`, tracking);
    });

    // Append contenidos
    data.contenidos.map(Number).forEach((contenidoId, index) => {
      formData.append(`contenidos[${index}]`, contenidoId.toString());
    });

    // Append other fields
    formData.append('valorDeclarado', data.valorDeclarado.toString());
    formData.append('moneda', data.moneda);
    formData.append('direccionTipo', data.direccionTipo);

    // Conditional address/locker fields
    if (data.direccionTipo === 'home') {
      formData.append('idEstado', data.idEstado.toString());
      formData.append('idMunicipio', data.idMunicipio.toString());
      formData.append('idParroquia', data.idParroquia.toString());
      formData.append('direccion', data.direccion);
      if (data.referencia) formData.append('referencia', data.referencia);
    } else if (data.direccionTipo === 'store') {
      formData.append('idLocker', data.idLocker.toString());
    }

    // Append files
    selectedFiles.forEach((file) => {
      formData.append('facturas', file);
    });

    // Call mutation
    if (isEditMode && initialData?.id) {
      updateMutation.mutate({ id: initialData.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form className="pre-alert-form" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="pre-alert-form__title">{isEditMode ? 'Editar Pre-Alerta' : 'Crear Pre-Alerta'}</h2>

      {/* Trackings Section */}
      <div className="pre-alert-form__section">
        <label className="pre-alert-form__label">Números de Tracking <span className="pre-alert-form__label-required">*</span></label>
        {fields.map((field, index) => (
          <div key={field.id} className="pre-alert-form__tracking-item">
            <input
              type="text"
              className={`pre-alert-form__input ${errors.trackings?.[index]?.value ? 'pre-alert-form__input--error' : ''}`}
              placeholder="Número de Tracking"
              {...register(`trackings.${index}.value`, { required: 'El tracking es requerido' })}
            />
            {index > 0 && (
              <button type="button" onClick={() => remove(index)} className="pre-alert-form__remove-btn">
                🗑️
              </button>
            )}
            {errors.trackings?.[index]?.value && <p className="pre-alert-form__error">{errors.trackings[index].value.message}</p>}
          </div>
        ))}
        <button type="button" onClick={() => append({ value: '' })} className="pre-alert-form__add-btn">
          Añadir Tracking
        </button>
      </div>

      {/* Contenidos Section */}
      <div className="pre-alert-form__section">
        <label className="pre-alert-form__label">Contenido del Paquete <span className="pre-alert-form__label-required">*</span></label>
        <Controller
          name="contenidos"
          control={control}
          rules={{ required: 'Debe seleccionar al menos un contenido' }}
          render={({ field }) => (
            <MultiSelectSearchable
              options={contenidosData?.map(c => ({ label: c.contenido, value: c.id.toString() })) || []}
              value={field.value}
              onChange={field.onChange}
              placeholder="Seleccione uno o varios contenidos"
              searchPlaceholder="Buscar contenido..."
              disabled={isLoadingContenidos}
              error={!!errors.contenidos}
            />
          )}
        />
        {errors.contenidos && <p className="pre-alert-form__error">{errors.contenidos.message}</p>}
      </div>
      
      {/* Valor Declarado y Moneda */}
      <div className="pre-alert-form__section">
        <div className="pre-alert-form__row">
          <div className="pre-alert-form__col">
            <label className="pre-alert-form__label">Valor Declarado <span className="pre-alert-form__label-required">*</span></label>
            <input
              type="number"
              step="0.01"
              className={`pre-alert-form__input ${errors.valorDeclarado ? 'pre-alert-form__input--error' : ''}`}
              placeholder="Ej: 150.00"
              {...register('valorDeclarado', { required: 'El valor declarado es requerido', min: { value: 0.01, message: 'Debe ser mayor a 0' } })}
            />
            {errors.valorDeclarado && <p className="pre-alert-form__error">{errors.valorDeclarado.message}</p>}
          </div>
          <div className="pre-alert-form__col">
            <label className="pre-alert-form__label">Moneda <span className="pre-alert-form__label-required">*</span></label>
            <select
              className={`pre-alert-form__select ${errors.moneda ? 'pre-alert-form__input--error' : ''}`}
              {...register('moneda', { required: 'La moneda es requerida' })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="VES">VES</option>
            </select>
            {errors.moneda && <p className="pre-alert-form__error">{errors.moneda.message}</p>}
          </div>
        </div>
      </div>

      {/* Tipo de Dirección */}
      <div className="pre-alert-form__section">
        <label className="pre-alert-form__label">Tipo de Entrega <span className="pre-alert-form__label-required">*</span></label>
        <div className="pre-alert-form__radio-group">
          <label className="pre-alert-form__radio-option">
            <input
              type="radio"
              value="home"
              {...register('direccionTipo', { required: 'Debe seleccionar un tipo de entrega' })}
            />
            <span>A Domicilio</span>
          </label>
          <label className="pre-alert-form__radio-option">
            <input
              type="radio"
              value="store"
              {...register('direccionTipo', { required: 'Debe seleccionar un tipo de entrega' })}
            />
            <span>Retiro en Tienda</span>
          </label>
        </div>
        {errors.direccionTipo && <p className="pre-alert-form__error">{errors.direccionTipo.message}</p>}
      </div>

      {/* Conditional Address/Locker Fields */}
      {direccionTipo === 'home' && (
        <div className="pre-alert-form__section pre-alert-form__new-address">
          <h3 className="pre-alert-form__subtitle">Dirección de Domicilio</h3>
          <div className="pre-alert-form__row--three-cols">
            <div className="pre-alert-form__col">
              <label className="pre-alert-form__label">Estado <span className="pre-alert-form__label-required">*</span></label>
              <Controller
                name="idEstado"
                control={control}
                rules={{ required: 'El estado es requerido' }}
                render={({ field }) => (
                  <SearchableSelect
                    options={statesData || []}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccione un estado"
                    disabled={isLoadingStates}
                    className={errors.idEstado ? 'pre-alert-form__input--error' : ''}
                  />
                )}
              />
              {errors.idEstado && <p className="pre-alert-form__error">{errors.idEstado.message}</p>}
            </div>
            <div className="pre-alert-form__col">
              <label className="pre-alert-form__label">Municipio <span className="pre-alert-form__label-required">*</span></label>
              <Controller
                name="idMunicipio"
                control={control}
                rules={{ required: 'El municipio es requerido' }}
                render={({ field }) => (
                  <SearchableSelect
                    options={municipalitiesData || []}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccione un municipio"
                    disabled={!selectedStateId || isLoadingMunicipalities}
                    className={errors.idMunicipio ? 'pre-alert-form__input--error' : ''}
                  />
                )}
              />
              {errors.idMunicipio && <p className="pre-alert-form__error">{errors.idMunicipio.message}</p>}
            </div>
            <div className="pre-alert-form__col">
              <label className="pre-alert-form__label">Parroquia <span className="pre-alert-form__label-required">*</span></label>
              <Controller
                name="idParroquia"
                control={control}
                rules={{ required: 'La parroquia es requerida' }}
                render={({ field }) => (
                  <SearchableSelect
                    options={parishesData || []}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccione una parroquia"
                    disabled={!selectedMunicipalityId || isLoadingParishes}
                    className={errors.idParroquia ? 'pre-alert-form__input--error' : ''}
                  />
                )}
              />
              {errors.idParroquia && <p className="pre-alert-form__error">{errors.idParroquia.message}</p>}
            </div>
          </div>
          <div className="pre-alert-form__col">
            <label className="pre-alert-form__label">Dirección <span className="pre-alert-form__label-required">*</span></label>
            <textarea
              className={`pre-alert-form__textarea ${errors.direccion ? 'pre-alert-form__input--error' : ''}`}
              placeholder="Ej: Calle 1, Edificio X, Apto Y"
              {...register('direccion', { required: 'La dirección es requerida' })}
            ></textarea>
            {errors.direccion && <p className="pre-alert-form__error">{errors.direccion.message}</p>}
          </div>
          <div className="pre-alert-form__col">
            <label className="pre-alert-form__label">Punto de Referencia</label>
            <input
              type="text"
              className="pre-alert-form__input"
              placeholder="Ej: Casa con portón azul"
              {...register('referencia')}
            />
          </div>
        </div>
      )}

      {direccionTipo === 'store' && (
        <div className="pre-alert-form__section">
          <label className="pre-alert-form__label">Tienda/Locker de Retiro <span className="pre-alert-form__label-required">*</span></label>
          <Controller
            name="idLocker"
            control={control}
            rules={{ required: 'Debe seleccionar una tienda/locker' }}
            render={({ field }) => (
              <SearchableSelect
                options={lockersData || []}
                value={field.value}
                onChange={field.onChange}
                placeholder="Seleccione una tienda/locker"
                disabled={isLoadingLockers}
                className={errors.idLocker ? 'pre-alert-form__input--error' : ''}
              />
            )}
          />
          {errors.idLocker && <p className="pre-alert-form__error">{errors.idLocker.message}</p>}
        </div>
      )}

      {/* File Upload Section */}
      <div className="pre-alert-form__section">
        <label className="pre-alert-form__label">Facturas (Opcional)</label>
        <div className="pre-alert-form__file-upload">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="pre-alert-form__file-input"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          />
          <button type="button" onClick={handleFileButtonClick} className="pre-alert-form__file-label">
            📎 Seleccionar Archivos
          </button>
        </div>
        {selectedFiles.length > 0 && (
          <div className="pre-alert-form__files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="pre-alert-form__file-item">
                <span className="pre-alert-form__file-name">{file.name}</span>
                <button type="button" onClick={() => handleRemoveFile(file.name)} className="pre-alert-form__file-remove">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pre-alert-form__actions">
        <button type="submit" className="pre-alert-form__submit-btn" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="small" /> : null}
          {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Pre-Alerta' : 'Crear Pre-Alerta')}
        </button>
      </div>
    </form>
  );
};

export default PreAlertForm;
