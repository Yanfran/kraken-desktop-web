// src/pages/auth/DeliveryOption/DeliveryOption.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import './DeliveryOption.styles.scss';


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
  const { theme } = useTheme();
  const actualTheme = theme === 'auto' ? 'light' : theme;
  
  // Estados principales
  const [selectedOption, setSelectedOption] = useState(''); // 'store' o 'home'
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Datos mock
  const mockStates = [
    { label: 'Distrito Capital', value: 'distrito_capital' },
    { label: 'Miranda', value: 'miranda' },
    { label: 'Carabobo', value: 'carabobo' },
    { label: 'Zulia', value: 'zulia' }
  ];

  // Ciudades disponibles para retiro en tienda
  const availableCities = [
    { label: 'Caracas', value: 'caracas' },
    { label: 'Valencia', value: 'valencia' },
    { label: 'Maracaibo', value: 'maracaibo' },
    { label: 'Barquisimeto', value: 'barquisimeto' }
  ];

  // Tiendas por ciudad
  const storesByCity = {
    caracas: [
      { label: 'Tienda Centro Comercial Sambil', value: 'sambil_caracas' },
      { label: 'Tienda Centro Comercial CCCT', value: 'ccct_caracas' },
      { label: 'Tienda Las Mercedes', value: 'las_mercedes' }
    ],
    valencia: [
      { label: 'Tienda Centro Comercial Sambil Valencia', value: 'sambil_valencia' },
      { label: 'Tienda Carabobo Plaza', value: 'carabobo_plaza' }
    ],
    maracaibo: [
      { label: 'Tienda Centro Comercial Sambil Maracaibo', value: 'sambil_maracaibo' }
    ],
    barquisimeto: [
      { label: 'Tienda Centro Comercial Sambil Barquisimeto', value: 'sambil_barquisimeto' }
    ]
  };

  const mockMunicipalities = {
    distrito_capital: [
      { label: 'Libertador', value: 'libertador' }
    ],
    miranda: [
      { label: 'Chacao', value: 'chacao' },
      { label: 'Baruta', value: 'baruta' },
      { label: 'Sucre', value: 'sucre' }
    ],
    carabobo: [
      { label: 'Valencia', value: 'valencia' },
      { label: 'Puerto Cabello', value: 'puerto_cabello' }
    ],
    zulia: [
      { label: 'Maracaibo', value: 'maracaibo' },
      { label: 'San Francisco', value: 'san_francisco' }
    ]
  };

  const mockParishes = {
    libertador: [
      { label: 'Catedral', value: 'catedral' },
      { label: 'San Juan', value: 'san_juan' },
      { label: 'Santa Teresa', value: 'santa_teresa' }
    ],
    chacao: [
      { label: 'Chacao', value: 'chacao_parish' }
    ],
    baruta: [
      { label: 'Baruta', value: 'baruta_parish' },
      { label: 'El Cafetal', value: 'el_cafetal' }
    ],
    valencia: [
      { label: 'Valencia', value: 'valencia_parish' },
      { label: 'Miguel Peña', value: 'miguel_pena' }
    ],
    puerto_cabello: [
      { label: 'Borburata', value: 'borburata' }
    ],
    maracaibo: [
      { label: 'Bolívar', value: 'bolivar' },
      { label: 'Coquivacoa', value: 'coquivacoa' }
    ],
    san_francisco: [
      { label: 'San Francisco', value: 'san_francisco_parish' }
    ]
  };

  // Cargar estados iniciales
  useEffect(() => {
    setStatesList(mockStates);
  }, []);

  // Cargar municipios cuando cambia el estado
  useEffect(() => {
    if (formData.state) {
      setLoadingMunicipalities(true);
      setTimeout(() => {
        setMunicipalitiesList(mockMunicipalities[formData.state] || []);
        setLoadingMunicipalities(false);
        setFormData(prev => ({ ...prev, municipality: '', parish: '' }));
      }, 300);
    }
  }, [formData.state]);

  // Cargar parroquias cuando cambia el municipio
  useEffect(() => {
    if (formData.municipality) {
      setLoadingParishes(true);
      setTimeout(() => {
        setParishesList(mockParishes[formData.municipality] || []);
        setLoadingParishes(false);
        setFormData(prev => ({ ...prev, parish: '' }));
      }, 300);
    }
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
    console.log('🔄 Opción seleccionada:', value); // Debug
    setSelectedOption(value);
    
    // Limpiar formularios al cambiar de opción
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
    console.log('🏪 Store input cambiado:', field, value); // Debug
    setStoreData(prev => ({
      ...prev,
      [field]: value
    }));
    // Si cambia la ciudad, limpiar la tienda
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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsLoading(true);
    
    try {
      const deliveryData = {
        type: selectedOption,
        ...(selectedOption === 'home' && { formData }),
        ...(selectedOption === 'store' && { storeData })
      };
      
      console.log('Delivery data:', deliveryData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
     navigate('/welcome');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kraken-delivery-option" data-theme={actualTheme}>

      {/* Toggle de tema */}
      <ThemeToggle />

      {/* Logo */}
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

      {/* Contenido principal */}
      <div className="kraken-delivery-option__content">
        <h1 className="kraken-delivery-option__title">
          ¿En dónde deseas recibir tus paquetes?
        </h1>
        
        <p className="kraken-delivery-option__subtitle">
          Esta es la dirección predeterminada en la que recibirás tu paquete. 
          Siempre que pre-alertes podrás elegir otro método de entrega.
        </p>

        <form onSubmit={handleSubmit} className="kraken-delivery-option__form">
          
          {/* Radio Options - Exactamente como en móvil */}
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
              
              {/* Ciudad */}
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Ciudad</label>
                <select
                  className="kraken-form-field__select"
                  value={storeData.city}
                  onChange={(e) => handleStoreInputChange('city', e.target.value)}
                  required
                >
                  <option value="">Caracas</option>
                  {availableCities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Retiro en Tienda */}
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Retiro en Tienda</label>
                <select
                  className="kraken-form-field__select"
                  value={storeData.store}
                  onChange={(e) => handleStoreInputChange('store', e.target.value)}
                  required
                >
                  <option value="">Seleccione</option>
                  {storeData.city && storesByCity[storeData.city]?.map((store) => (
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
              
              {/* Estado */}
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Estado</label>
                <select
                  className="kraken-form-field__select"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                >
                  <option value="">Seleccione</option>
                  {statesList.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Municipio */}
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Municipio</label>
                <select
                  className="kraken-form-field__select"
                  value={formData.municipality}
                  onChange={(e) => handleInputChange('municipality', e.target.value)}
                  required
                  disabled={!formData.state || loadingMunicipalities}
                >
                  <option value="">
                    {loadingMunicipalities ? 'Cargando...' : 'Seleccione'}
                  </option>
                  {municipalitiesList.map((municipality) => (
                    <option key={municipality.value} value={municipality.value}>
                      {municipality.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parroquia */}
              <div className="kraken-form-field">
                <label className="kraken-form-field__label">Parroquia (opcional)</label>
                <select
                  className="kraken-form-field__select"
                  value={formData.parish}
                  onChange={(e) => handleInputChange('parish', e.target.value)}
                  disabled={!formData.municipality || loadingParishes}
                >
                  <option value="">
                    {loadingParishes ? 'Cargando...' : 'Seleccione'}
                  </option>
                  {parishesList.map((parish) => (
                    <option key={parish.value} value={parish.value}>
                      {parish.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dirección */}
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

              {/* Punto de referencia */}
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

              {/* Nombre para esta dirección */}
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

          {/* Botones - Exactamente como en móvil */}
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
              onClick={() => navigate('/auth/personal-data')}
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