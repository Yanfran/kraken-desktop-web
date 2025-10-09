// src/pages/calculator/Calculator/Calculator.jsx
// ✅ CORREGIDO - Usando los servicios correctos
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CalculatorHeader from '../../../components/calculator/CalculatorHeader';
import LocationStep from '../../../components/calculator/LocationStep';
import PackageStep from '../../../components/calculator/PackageStep';
import ResultStep from '../../../components/calculator/ResultStep';
import axiosInstance from '../../../services/axiosInstance';
import { API_URL } from '../../../utils/config';
// ✅ IMPORTAR LOS SERVICIOS CORRECTOS
import { 
  getStatesByCountry, 
  getMunicipalitiesByState, 
  getParishesByMunicipality 
} from '../../../services/address/addressService';
import './Calculator.scss';

const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

const getInitialCalculation = () => ({
  state: '',
  municipality: '',
  parish: '',
  originCountry: 'US',
  destinationCountry: 'Venezuela',
  currency: 'USD',
  declaredValue: '',
  content: '',
  contenidos: [],
  weight: '',
  weightUnit: 'kg',
  dimensionUnit: 'cm',
  dimensions: {
    length: '',
    width: '',
    height: '',
  },
});

const Calculator = () => {
  // Estado principal consolidado
  const [state, setState] = useState({
    currentStep: 1,
    isLoading: false,
    calculation: getInitialCalculation(),
    result: null,
    isHighValue: false,
  });

  // Datos de ubicación
  const [locationData, setLocationData] = useState({
    statesList: [],
    municipalitiesList: [],
    parishesList: [],
  });

  // Contenidos disponibles
  const [contentOptions, setContentOptions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar municipios cuando cambia el estado
  useEffect(() => {
    if (state.calculation.state) {
      loadMunicipalities(Number(state.calculation.state));
    } else {
      setLocationData(prev => ({
        ...prev,
        municipalitiesList: [],
        parishesList: []
      }));
    }
  }, [state.calculation.state]);

  // Cargar parroquias cuando cambia el municipio
  useEffect(() => {
    if (state.calculation.municipality) {
      loadParishes(Number(state.calculation.municipality));
    } else {
      setLocationData(prev => ({
        ...prev,
        parishesList: []
      }));
    }
  }, [state.calculation.municipality]);

  // Funciones de carga de datos
  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // ✅ USAR EL SERVICIO CORRECTO
      const [estadosResp, contentResp] = await Promise.all([
        getStatesByCountry(1), // Venezuela = 1
        axiosInstance.get(`${API_URL}/PaqueteContenidos/getContent`) // ✅ Endpoint correcto
      ]);
      
      // ✅ MANEJAR RESPUESTA CORRECTA DEL SERVICIO
      const formattedStates = estadosResp.success && estadosResp.data 
        ? estadosResp.data.map(e => ({
            label: e.name,
            value: e.id.toString(),
          }))
        : [];
      
      setLocationData(prev => ({ ...prev, statesList: formattedStates }));
      
      if (contentResp.data?.success && Array.isArray(contentResp.data.data)) {
        const lista = contentResp.data.data.map(e => ({
          label: e.contenido,
          value: e.id.toString(),
        }));
        setContentOptions(lista);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      toast.error('No se pudo cargar los datos iniciales');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadMunicipalities = async (stateId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // ✅ USAR EL SERVICIO CORRECTO
      const response = await getMunicipalitiesByState(stateId);
      
      const formatted = response.success && response.data
        ? response.data.map(m => ({
            label: m.name,
            value: m.id.toString(),
          }))
        : [];
      
      setLocationData(prev => ({ ...prev, municipalitiesList: formatted }));
      
      setState(prev => ({
        ...prev,
        calculation: {
          ...prev.calculation,
          municipality: '',
          parish: ''
        }
      }));
    } catch (error) {
      console.error('Error al cargar municipios:', error);
      toast.error('No se pudo cargar los municipios');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadParishes = async (municipalityId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // ✅ USAR EL SERVICIO CORRECTO
      const response = await getParishesByMunicipality(municipalityId);
      
      const formatted = response.success && response.data
        ? response.data.map(p => ({
            label: p.name,
            value: p.id.toString(),
          }))
        : [];
      
      setLocationData(prev => ({ ...prev, parishesList: formatted }));
      
      setState(prev => ({
        ...prev,
        calculation: {
          ...prev.calculation,
          parish: ''
        }
      }));
    } catch (error) {
      console.error('Error al cargar parroquias:', error);
      toast.error('No se pudo cargar las parroquias');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Navegación entre pasos
  const handleLocationNext = () => {
    if (!state.calculation.state || !state.calculation.municipality) {
      toast.error('Por favor selecciona estado y municipio');
      return;
    }
    setState(prev => ({ ...prev, currentStep: 2 }));
  };

  // Parsear valores con formato
  const parseFormattedValue = (formattedValue) => {
    if (!formattedValue || formattedValue.trim() === '') return 0;
    
    if (formattedValue.includes(',')) {
      const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(cleanValue) || 0;
    }
    return parseFloat(formattedValue) || 0;
  };

  const handlePackageCalculate = async () => {
    if (!state.calculation.contenidos || state.calculation.contenidos.length === 0) {
      toast.error('Por favor selecciona al menos un contenido');
      return;
    }
    
    const declaredValueNum = parseFormattedValue(state.calculation.declaredValue);
    const weightNum = parseFormattedValue(state.calculation.weight);
    
    if (declaredValueNum <= 0 || weightNum <= 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      setIsCalculating(true);
      
      const contentString = state.calculation.contenidos.join(', ');
      
      const calculationForAPI = {
        stateId: parseInt(state.calculation.state),
        municipalityId: state.calculation.municipality ? parseInt(state.calculation.municipality) : undefined,
        declaredValue: declaredValueNum,
        currency: state.calculation.currency,
        content: contentString,
        weight: weightNum,
        weightUnit: state.calculation.weightUnit,
        dimensionUnit: state.calculation.dimensionUnit,
        dimensions: {
          length: parseFloat(state.calculation.dimensions.length) || 0,
          width: parseFloat(state.calculation.dimensions.width) || 0,
          height: parseFloat(state.calculation.dimensions.height) || 0,
        },
      };
      
      const response = await axiosInstance.post(`${API_URL}/Calculator/calculate`, calculationForAPI);
      
      if (response.data?.success) {
        setState(prev => ({ 
          ...prev, 
          result: response.data,
          currentStep: 3 
        }));
        toast.success('Cotización calculada exitosamente');
      } else {
        throw new Error(response.data?.message || 'Error al calcular');
      }
    } catch (error) {
      console.error('Error en cálculo:', error);
      toast.error(error.response?.data?.message || 'Error al calcular el envío');
    } finally {
      setIsCalculating(false);
    }
  };

  // Actualizar cálculo
  const updateCalculation = (updates) => {
    setState(prev => ({
      ...prev,
      calculation: { ...prev.calculation, ...updates }
    }));
  };

  const handleDeclaredValueChange = (formattedValue, numericValue) => {
    setState(prev => ({
      ...prev,
      calculation: { 
        ...prev.calculation, 
        declaredValue: formattedValue 
      }
    }));
  };

  const handleHighValueChange = (newIsHighValue) => {
    setState(prev => ({
      ...prev,
      isHighValue: newIsHighValue
    }));
    
    if (!newIsHighValue) {
      setState(prev => ({
        ...prev,
        calculation: {
          ...prev.calculation,
          dimensions: {
            length: '',
            width: '',
            height: ''
          }
        }
      }));
    }
  };

  const handleWeightUnitToggle = () => {
    const currentWeight = parseFloat(state.calculation.weight) || 0;
    const newUnit = state.calculation.weightUnit === 'kg' ? 'lb' : 'kg';
    let newWeight = currentWeight;
    
    if (newUnit === 'lb' && state.calculation.weightUnit === 'kg') {
      newWeight = currentWeight * KG_TO_LB;
    } else if (newUnit === 'kg' && state.calculation.weightUnit === 'lb') {
      newWeight = currentWeight * LB_TO_KG;
    }

    const formattedWeight = newWeight > 0 ? (Math.round(newWeight * 100) / 100).toString() : '';

    setState(prev => ({
      ...prev,
      calculation: {
        ...prev.calculation,
        weightUnit: newUnit,
        dimensionUnit: newUnit === 'kg' ? 'cm' : 'in',
        weight: formattedWeight
      }
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setState(prev => ({
      ...prev,
      calculation: {
        ...prev.calculation,
        dimensions: {
          ...prev.calculation.dimensions,
          [dimension]: value
        }
      }
    }));
  };

  const handleNewCalculation = () => {
    setState({
      currentStep: 1,
      isLoading: false,
      calculation: getInitialCalculation(),
      result: null,
      isHighValue: false,
    });
  };

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <LocationStep
            statesList={locationData.statesList}
            municipalitiesList={locationData.municipalitiesList}
            parishesList={locationData.parishesList}
            selectedState={state.calculation.state}
            selectedMunicipality={state.calculation.municipality}
            selectedParish={state.calculation.parish}
            onStateChange={(value) => updateCalculation({ state: value })}
            onMunicipalityChange={(value) => updateCalculation({ municipality: value })}
            onParishChange={(value) => updateCalculation({ parish: value })}
            onNext={handleLocationNext}
            isLoading={state.isLoading}
          />
        );
      
      case 2:
        return (
          <PackageStep
            declaredValue={state.calculation.declaredValue}
            currency={state.calculation.currency}
            content={state.calculation.content}
            contenidos={state.calculation.contenidos}
            weight={state.calculation.weight}
            weightUnit={state.calculation.weightUnit}
            dimensionUnit={state.calculation.dimensionUnit}
            dimensions={state.calculation.dimensions}
            isHighValue={state.isHighValue}
            contentOptions={contentOptions}
            onDeclaredValueChange={handleDeclaredValueChange}
            onContentChange={(content) => updateCalculation({ content })}
            onContenidosChange={(contenidos) => updateCalculation({ contenidos })}
            onWeightChange={(weight) => updateCalculation({ weight })}
            onWeightUnitToggle={handleWeightUnitToggle}
            onDimensionChange={handleDimensionChange}
            onCalculate={handlePackageCalculate}
            onBack={() => setState(prev => ({ ...prev, currentStep: 1 }))}
            isCalculating={isCalculating}
            onHighValueChange={handleHighValueChange}
          />
        );
      
      case 3:
        if (!state.result) return null;
        
        const selectedState = locationData.statesList.find(s => s.value === state.calculation.state);
        const selectedMunicipality = locationData.municipalitiesList.find(m => m.value === state.calculation.municipality);
        
        return (
          <ResultStep
            result={state.result}
            selectedState={selectedState}
            selectedMunicipality={selectedMunicipality}
            declaredValue={parseFormattedValue(state.calculation.declaredValue)}
            originCountry={state.calculation.originCountry}
            onNewCalculation={handleNewCalculation}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="calculator-page">
      <div className="calculator-page__container">
        <CalculatorHeader 
          currentStep={state.currentStep}
          title={state.currentStep === 2 ? "Calcula tu envío" : undefined}
          subtitle={state.currentStep === 2 ? "Ingresa los detalles de tu paquete" : 
                   state.currentStep === 3 ? "Resultado de tu cotización" : undefined}
        />
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Calculator;