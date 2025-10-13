// src/pages/auth/DeliveryOption/DeliveryOption.jsx
// TU CÓDIGO ORIGINAL + Funcionalidad del backend

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import axiosInstance from '../../../services/axiosInstance';
import SearchableSelect from '../../../components/common/SearchableSelect/SearchableSelect'
import './DeliveryOption.styles.scss';
import { useAuth } from '../../../contexts/AuthContext';

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
  const [filteredStores, setFilteredStores] = useState([]);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userEmail = userData.email;

  // ✅ CARGAR DATOS INICIALES DEL BACKEND (IGUAL QUE TU APP)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        
        // 1. Cargar delivery data (ciudades y tiendas)
        const deliveryRes = await axiosInstance.get('/Addresses/delivery-data');
        console.log('🏪 Delivery data:', deliveryRes.data);
        
        if (deliveryRes.data.success) {
          const { ciudad, tiendas } = deliveryRes.data.data;
          
          setAllStores(tiendas);
          
          if (ciudad) {
            setAvailableCities([{
              label: ciudad.name,
              value: ciudad.id.toString()
            }]);
          }
          
          const storesType2 = tiendas
            .filter(t => t.idTiendaTipo === 2)
            .map(t => ({
              label: t.nombre,
              value: t.id.toString(),
              idEstado: t.idEstado
            }));
          
          setFilteredStores(storesType2);
        }
        
        // 2. Cargar estados usando location-data (COMO TU APP)
        const statesRes = await axiosInstance.get('/Addresses/location-data?countryId=1');
        console.log('📍 States:', statesRes.data);
        
        if (statesRes.data.success) {
          const states = statesRes.data.data.map(item => ({
            label: item.name,
            value: item.id.toString()
          }));
          setStatesList(states);
        }
        
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
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
    console.log('🔄 Opción seleccionada:', value);
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
    console.log('🏪 Store input cambiado:', field, value);
    setStoreData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'city') {
      setStoreData(prev => ({
        ...prev,
        store: ''
      }));
    }
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
      alert('No se pudo identificar al usuario. Inicia sesión nuevamente.');
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
      
      console.log('📤 Enviando payload:', payload);
      
      const response = await axiosInstance.post('/Addresses/register', payload);
      
      if (response.data.success) {
        // Guardar token
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        // ✅ ACTUALIZAR USUARIO CON LA RESPUESTA DEL SERVIDOR
        if (response.data.user) {
          console.log('💾 Guardando usuario actualizado:', response.data.user);
          localStorage.setItem('userData', JSON.stringify(response.data.user));
          
          // Actualizar el contexto
          await setUserState(response.data.user, response.data.token);
          
          // ✅ ESPERAR A QUE EL CONTEXTO SE ACTUALICE
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        navigate('/welcome');
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.title ||
                       'Error al guardar la dirección';
      alert(errorMsg);
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
          <p style={{ color: 'var(--color-text-secondary)' }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kraken-delivery-option" data-theme={actualTheme}>

      {/* <ThemeToggle /> */}

      <div className="kraken-delivery-option__logo">
        <img
          src="/src/assets/images/logo.jpg"
          alt="Kraken Logo"
          className="kraken-delivery-option__logo-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23FF4500' text-anchor='middle' dy='0.3em'%3EKRAKEN%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      <div className="kraken-delivery-option__content">
        <h1 className="kraken-delivery-option__title">
          ¿En dónde deseas recibir tus paquetes?
        </h1>
        
        <p className="kraken-delivery-option__subtitle">
          Esta es la dirección predeterminada en la que recibirás tu paquete. 
          Siempre que pre-alertes podrás elegir otro método de entrega.
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
              <span className="kraken-radio-text">Retiro en tienda</span>
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
              <span className="kraken-radio-text">Entrega a domicilio</span>
            </label>
          </div>

          {/* Formulario de retiro en tienda */}
          {selectedOption === 'store' && (
            <div className="kraken-form-section">
              
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Ciudad</label>
                <select
                  className="kraken-form-field__select"
                  value={storeData.city}
                  onChange={(e) => handleStoreInputChange('city', e.target.value)}
                  required
                >
                  <option value="">Seleccione</option>
                  {availableCities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Retiro en Tienda</label>
                <select
                  className="kraken-form-field__select"
                  value={storeData.store}
                  onChange={(e) => handleStoreInputChange('store', e.target.value)}
                  required
                  disabled={!storeData.city}
                >
                  <option value="">Seleccione</option>
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
                <label className="kraken-form-field__label">Estado</label>                
                <SearchableSelect
                  options={statesList}
                  value={formData.state}
                  onChange={(value) => handleInputChange('state', value)}
                  placeholder="Buscar estado..."
                />              
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Municipio</label>
                <SearchableSelect
                  options={municipalitiesList}
                  value={formData.municipality}
                  onChange={(value) => handleInputChange('municipality', value)}
                  placeholder={loadingMunicipalities ? "Cargando..." : "Buscar municipio..."}
                  disabled={!formData.state || loadingMunicipalities}
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Parroquia (opcional)</label>                
                <SearchableSelect
                  options={parishesList}
                  value={formData.parish}
                  onChange={(value) => handleInputChange('parish', value)}
                  placeholder={loadingParishes ? "Cargando..." : "Buscar parroquia..."}
                  disabled={!formData.municipality || loadingParishes}
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Dirección</label>
                <input
                  type="text"
                  className="kraken-form-field__input"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Punto de referencia (opcional)</label>
                <input
                  type="text"
                  className="kraken-form-field__input"
                  placeholder="Punto de referencia"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                />
              </div>

              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Nombre para esta dirección (ej. Casa)</label>
                <input
                  type="text"
                  className="kraken-form-field__input"
                  placeholder="Nombre para esta dirección"
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
                  Guardando...
                </div>
              ) : (
                'Finalizar Registro'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/personal-data')}
              className="kraken-delivery-option__button-secondary"
            >
              Anterior
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryOption;