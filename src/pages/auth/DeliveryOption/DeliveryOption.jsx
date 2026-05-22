// src/pages/auth/DeliveryOption/DeliveryOption.jsx
// TU CÓDIGO ORIGINAL + Funcionalidad del backend

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../services/axiosInstance';
import SearchableSelect from '../../../components/common/SearchableSelect/SearchableSelect'
import toast from 'react-hot-toast'; // ✅ IMPORTAR TOAST
import './DeliveryOption.styles.scss';
import { useAuth } from '../../../contexts/AuthContext';
import logoImage from '../../../assets/images/logo.jpg';


const normalizeUserData = (serverUser) => {
  if (!serverUser) return null;
  
  return {
    // ✅ CAMPOS ORIGINALES DEL BACKEND (español)
    id: serverUser.id,
    clienteActivo: serverUser.clienteActivo,
    codCliente: serverUser.codCliente,
    email: serverUser.email,
    sdoEmail: serverUser.sdoEmail,
    nombres: serverUser.nombres,
    apellidos: serverUser.apellidos,
    telefonoCelular: serverUser.telefonoCelular,
    telefonoCelularSecundario: serverUser.telefonoCelularSecundario,
    telefonoCasa: serverUser.telefonoCasa,
    idClienteTipo: serverUser.idClienteTipo,
    genero: serverUser.genero,
    fechaNacimiento: serverUser.fechaNacimiento,
    reg_CodPais: serverUser.reg_CodPais,
    reg_FechaRegistro: serverUser.reg_FechaRegistro,
    idTiendaPorDefecto: serverUser.idTiendaPorDefecto,
    idDestinoFrecuente: serverUser.idDestinoFrecuente,
    idClienteTipoIdentificacion: serverUser.idClienteTipoIdentificacion,
    nroIdentificacionCliente: serverUser.nroIdentificacionCliente,
    idiomaPreferido: serverUser.idiomaPreferido,
    idClienteFormaPago: serverUser.idClienteFormaPago,
    clave: serverUser.clave,
    verificationToken: serverUser.verificationToken,
    verificationDate: serverUser.verificationDate,
    fromGoogle: serverUser.fromGoogle,
    fromEmail: serverUser.fromEmail,
    profileComplete: serverUser.profileComplete,
    passwordResetToken: serverUser.passwordResetToken,
    passwordResetTokenExpiration: serverUser.passwordResetTokenExpiration,
    avatarId: serverUser.avatarId || '1',
    
    // ✅ CAMPOS NORMALIZADOS (inglés) - para el frontend
    name: serverUser.nombres || serverUser.name,
    lastName: serverUser.apellidos || serverUser.lastName,
    phone: serverUser.telefonoCelular || serverUser.phone,
    phoneSecondary: serverUser.telefonoCelularSecundario || serverUser.phoneSecondary,
    nro: serverUser.nroIdentificacionCliente || serverUser.nro,
    birthday: serverUser.fechaNacimiento || serverUser.birthday,
    emailVerified: serverUser.emailVerified ?? serverUser.fromEmail ?? true,
  };
};

// Componente toggle para cambio de tema
const ThemeToggle = () => {
  const { actualTheme, toggleTheme } = useTheme();
  
  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${actualTheme === 'light' ? 'oscuro' : 'claro'}`}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 20,
        padding: '8px',
        borderRadius: '50%',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = actualTheme === 'light' 
          ? 'rgba(0, 0, 0, 0.1)' 
          : 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {actualTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

const DeliveryOption = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { setUserState } = useAuth();
  const { t } = useTranslation();
  const actualTheme = theme === 'auto' ? 'light' : theme;
  
  // ✅ DATOS DE PERSONAL DATA
  const personalData = location.state || {};
  
  // Estados principales
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Estados para formulario de domicilio
  const [formData, setFormData] = useState({
    state: '',
    municipality: '',
    parish: '',
    address: '',
    reference: '',
    addressName: ''
  });

  // Estados para retiro en tienda
  const [storeData, setStoreData] = useState({
    city: '',
    store: ''
  });

  // Listas para los dropdowns
  const [statesList, setStatesList] = useState([]);
  const [municipalitiesList, setMunicipalitiesList] = useState([]);
  const [parishesList, setParishesList] = useState([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingParishes, setLoadingParishes] = useState(false);

  // ✅ DATOS REALES DEL BACKEND
  const [availableCities, setAvailableCities] = useState([]);
  const [allStores, setAllStores] = useState([]);

  // ✅ AÑADE ESTE useMemo (esta es la lógica de Addresses.jsx)
const filteredStores = useMemo(() => {
    // Si no hay tiendas cargadas, devuelve un array vacío
    if (!allStores || allStores.length === 0) return [];

    return allStores
        .filter((t) => {
            // 1. Lógica de tipo: Aceptar tipo 2 (Lockers) o 3 (Aliados)
            const isTipoValido = t.idTiendaTipo === 2 || t.idTiendaTipo === 3;

            // 2. Lógica de ciudad: Filtrar si hay ciudad seleccionada
            //    Si no hay ciudad (storeData.city es ''), 'matchesCity' es true
            const matchesCity = storeData.city
                ? t.idZonaCiudad === parseInt(storeData.city)
                : true; // Muestra todos los tipos válidos si no hay ciudad

            return isTipoValido && matchesCity;
        })
        .map((t) => ({ 
            label: t.nombre, 
            value: t.id.toString(),
            // Mantenemos estos datos por si los usas en el payload del formulario
            idEstado: t.idEstado,
            idZonaCiudad: t.idZonaCiudad
        }));
}, [allStores, storeData.city]);



  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userEmail = userData.email;

  // ✅ CARGAR DATOS INICIALES DEL BACKEND (IGUAL QUE TU APP)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        
        // 1. Cargar delivery data (ciudades y tiendas)
        const deliveryRes = await axiosInstance.get('/Addresses/delivery-data');
        // console.log('🏪 Delivery data:', deliveryRes.data);
        
       // Dentro de loadInitialData
      if (deliveryRes.data.success) {
        const { ciudad, ciudadesDisponibles, tiendas } = deliveryRes.data.data;
        
        setAllStores(tiendas || []);
        
        // ✅ CAMBIO 1: Usar ciudadesDisponibles si está disponible
        if (ciudadesDisponibles && ciudadesDisponibles.length > 0) {
          const cities = ciudadesDisponibles.map(c => ({
            label: c.name,
            value: c.id.toString()
          }));
          setAvailableCities(cities);
        } else if (ciudad) {
          // Fallback: ciudad única
          setAvailableCities([{
            label: ciudad.name,
            value: ciudad.id.toString()
          }]);
        }
                
      }
        
        // 2. Cargar estados usando location-data (COMO TU APP)
        const statesRes = await axiosInstance.get('/Addresses/location-data?countryId=1');
        // console.log('📍 States:', statesRes.data);
        
        if (statesRes.data.success) {
          const states = statesRes.data.data.map(item => ({
            label: item.name,
            value: item.id.toString()
          }));
          setStatesList(states);
        }
        
      } catch (error) {
        toast.error(t('auth.delivery_load_error'));
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, []);


  // ✅ CARGAR MUNICIPIOS cuando cambia el estado (USANDO location-data)
  useEffect(() => {
    if (!formData.state) {
      setMunicipalitiesList([]);
      setParishesList([]);
      setFormData(prev => ({ ...prev, municipality: '', parish: '' }));
      return;
    }
    
    const loadMunicipalities = async () => {
      try {
        setLoadingMunicipalities(true);
        // ✅ CORRECTO: Usar location-data con stateId
        const res = await axiosInstance.get(`/Addresses/location-data?stateId=${formData.state}`);
        
        if (res.data.success) {
          const municipalities = res.data.data.map(item => ({
            label: item.name,
            value: item.id.toString()
          }));
          setMunicipalitiesList(municipalities);
        }
        
        setFormData(prev => ({ ...prev, municipality: '', parish: '' }));
        setParishesList([]);
      } catch (error) {
        console.error("❌ Error cargando municipios:", error);
        toast.error(t('auth.delivery_municipalities_error'));
      } finally {
        setLoadingMunicipalities(false);
      }
    };
    
    loadMunicipalities();
  }, [formData.state]);

  // ✅ CARGAR PARROQUIAS cuando cambia el municipio (USANDO location-data)
  useEffect(() => {
    if (!formData.municipality) {
      setParishesList([]);
      setFormData(prev => ({ ...prev, parish: '' }));
      return;
    }
    
    const loadParishes = async () => {
      try {
        setLoadingParishes(true);
        // ✅ CORRECTO: Usar location-data con municipalityId
        const res = await axiosInstance.get(`/Addresses/location-data?municipalityId=${formData.municipality}`);
        
        if (res.data.success) {
          const parishes = res.data.data.map(item => ({
            label: item.name,
            value: item.id.toString()
          }));
          setParishesList(parishes);
        }
        
        setFormData(prev => ({ ...prev, parish: '' }));
      } catch (error) {
        console.error("❌ Error cargando parroquias:", error);
        toast.error(t('auth.delivery_parishes_error'));
      } finally {
        setLoadingParishes(false);
      }
    };
    
    loadParishes();
  }, [formData.municipality]);

  // Aplicar tema
  useEffect(() => {
    const container = document.querySelector('.kraken-delivery-option');
    if (container) {
      container.setAttribute('data-theme', actualTheme);
    }
  }, [actualTheme]);

  // Handlers
  const handleOptionChange = (value) => {
    // console.log('🔄 Opción seleccionada:', value);
    setSelectedOption(value);
    
    if (value !== 'home') {
      setFormData({
        state: '',
        municipality: '',
        parish: '',
        address: '',
        reference: '',
        addressName: ''
      });
    }
    if (value !== 'store') {
      setStoreData({
        city: '',
        store: ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStoreInputChange = (field, value) => {
    setStoreData(prev => ({
      ...prev,
      [field]: value,
      // ✅ Si cambia la ciudad, limpiar la tienda seleccionada
      ...(field === 'city' && { store: '' })
    }));
  };

  // Validación
  const isFormValid = () => {
    if (!selectedOption) return false;
    
    if (selectedOption === 'store') {
      return storeData.city && storeData.store;
    }
    
    if (selectedOption === 'home') {
      return formData.state &&
             formData.municipality &&
             formData.parish &&
             formData.address.trim() &&
             formData.addressName.trim();
    }
    
    return false;
  };

  // ✅ SUBMIT AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsLoading(true);

    if (!userEmail) {
      toast.error(t('auth.delivery_user_error'));
      navigate('/login');
      return;
    }
    
    try {
      // Preparar payload según el método
      const payload = {
        email: userEmail,
        ...personalData,
        method: selectedOption,
        delivery: selectedOption === 'home' ? {
          city: '',
          locker: '',
          state: formData.state,
          municipality: formData.municipality,
          parish: formData.parish || '',
          address: formData.address,
          reference: formData.reference || ''
        } : {
          // ✅ PARA STORE: Necesita city Y locker
          city: storeData.city,
          locker: storeData.store,
          state: filteredStores.find(s => s.value === storeData.store)?.idEstado?.toString() || '18',
          municipality: '',
          parish: '',
          address: '',
          reference: formData.reference || ''
        },
        alias: selectedOption === 'home' ? formData.addressName : '',
        setAsDefault: true
      };
      
      // console.log('📤 Enviando payload:', payload);
      
      const response = await axiosInstance.post('/Addresses/register', payload);
      
      if (response.data.success) {

        toast.success(t('auth.delivery_success'));

        // Guardar token
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        // ✅ ACTUALIZAR USUARIO CON LA RESPUESTA DEL SERVIDOR
       if (response.data.user) {          
          
          // ✅ NORMALIZAR DATOS DEL USUARIO
          const normalizedUser = normalizeUserData(response.data.user);
          
          
          // ✅ GUARDAR USUARIO NORMALIZADO
          localStorage.setItem('userData', JSON.stringify(normalizedUser));
          
          // ✅ GUARDAR TOKEN SI EXISTE
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
          }
          
          // ✅ ACTUALIZAR CONTEXTO (aunque luego haremos reload)
          await setUserState(normalizedUser, response.data.token);
                    
          
          // ✅ NAVEGAR A WELCOME
          navigate('/welcome');
          
          // ✅ FORZAR RECARGA DESPUÉS DE UN PEQUEÑO DELAY
          // Esto asegura que el contexto se actualice en todos los componentes
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
       // ✅ MANEJO DETALLADO DE ERRORES
      let errorMessage = t('auth.delivery_save_error');

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          errorMessage = data.message || data.title || t('auth.delivery_save_error');
        } else if (status === 401) {
          errorMessage = t('auth.session_expired') || 'Session expired';
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 404) {
          errorMessage = data.message || data.title || t('auth.delivery_save_error');
        } else if (status === 500) {
          errorMessage = data.message || data.title || t('auth.delivery_save_error');
        } else {
          errorMessage = data.message || data.title || errorMessage;
        }
      } else if (error.request) {
        errorMessage = t('auth.connection_error') || 'Connection error';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOADING INICIAL
  if (isLoadingData) {
    return (
      <div className="kraken-delivery-option" data-theme={actualTheme}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px'
        }}>
          <div className="kraken-delivery-option__spinner"></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('auth.delivery_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kraken-delivery-option" data-theme={actualTheme}>

      {/* <ThemeToggle /> */}

      <div className="kraken-delivery-option__logo">        
        <a 
          href="https://krakencourier.com/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src={logoImage} 
            alt="Kraken Logo" 
            className="kraken-delivery-option__logo-image"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
            }}
          />
        </a>
      </div>

      <div className="kraken-delivery-option__content">
        <h1 className="kraken-delivery-option__title">
          {t('auth.delivery_title')}
        </h1>

        <p className="kraken-delivery-option__subtitle">
          {t('auth.delivery_subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="kraken-delivery-option__form">
          
          {/* Radio Options - TU DISEÑO EXACTO */}
          <div className="kraken-delivery-options">
            
            <label className="kraken-radio-container">
              <input
                type="radio"
                name="deliveryOption"
                value="store"
                checked={selectedOption === 'store'}
                onChange={(e) => handleOptionChange(e.target.value)}
              />
              <span className="kraken-radio-checkmark"></span>
              <span className="kraken-radio-text">{t('auth.delivery_store_option')}</span>
            </label>

            <label className="kraken-radio-container">
              <input
                type="radio"
                name="deliveryOption"
                value="home"
                checked={selectedOption === 'home'}
                onChange={(e) => handleOptionChange(e.target.value)}
              />
              <span className="kraken-radio-checkmark"></span>
              <span className="kraken-radio-text">{t('auth.delivery_home_option')}</span>
            </label>
          </div>

          {/* Formulario de retiro en tienda */}
          {selectedOption === 'store' && (
            <div className="kraken-form-section">
              
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_city')}</label>
                <select
                  className="kraken-form-field__select"
                  value={storeData.city}
                  onChange={(e) => handleStoreInputChange('city', e.target.value)}
                  required
                >
                  <option value="">{t('auth.delivery_select')}</option>
                  {availableCities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_store_label')}</label>
                <select
                  className="kraken-form-field__select"
                  value={storeData.store}
                  onChange={(e) => handleStoreInputChange('store', e.target.value)}
                  required
                  disabled={!storeData.city}
                >
                  <option value="">{t('auth.delivery_select')}</option>
                  {filteredStores.map((store) => (
                    <option key={store.value} value={store.value}>
                      {store.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Formulario de entrega a domicilio */}
          {selectedOption === 'home' && (
            <div className="kraken-form-section">
              
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_state')}</label>
                <SearchableSelect
                  options={statesList}
                  value={formData.state}
                  onChange={(value) => handleInputChange('state', value)}
                  placeholder={t('auth.delivery_search_state')}
                />              
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_municipality')}</label>
                <SearchableSelect
                  options={municipalitiesList}
                  value={formData.municipality}
                  onChange={(value) => handleInputChange('municipality', value)}
                  placeholder={loadingMunicipalities ? t('common.loading') : t('auth.delivery_search_municipality')}
                  disabled={!formData.state || loadingMunicipalities}
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_parish')}</label>
                <SearchableSelect
                  options={parishesList}
                  value={formData.parish}
                  onChange={(value) => handleInputChange('parish', value)}
                  placeholder={loadingParishes ? t('common.loading') : t('auth.delivery_search_parish')}
                  disabled={!formData.municipality || loadingParishes}
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_address')}</label>
                <input
                  type="text"
                  className="kraken-form-field__input"
                  placeholder={t('auth.delivery_address')}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_reference')}</label>
                <input
                  type="text"
                  className="kraken-form-field__input"
                  placeholder={t('auth.delivery_reference')}
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">{t('auth.delivery_address_name')}</label>
                <input
                  type="text"
                  className="kraken-form-field__input"
                  placeholder={t('auth.delivery_address_name')}
                  value={formData.addressName}
                  onChange={(e) => handleInputChange('addressName', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Botones - TU DISEÑO EXACTO */}
          <div className="kraken-delivery-option__buttons">
            <button
              type="submit"
              className={`kraken-delivery-option__button-primary ${isFormValid() ? 'active' : 'inactive'}`}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <div className="kraken-delivery-option__loading">
                  <div className="kraken-delivery-option__spinner"></div>
                  {t('auth.delivery_saving')}
                </div>
              ) : (
                t('auth.delivery_finish')
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/personal-data')}
              className="kraken-delivery-option__button-secondary"
            >
              {t('auth.delivery_back')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryOption;