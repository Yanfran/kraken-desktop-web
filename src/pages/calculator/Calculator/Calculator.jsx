// src/pages/calculator/Calculator/Calculator.jsx
// ✅ ACTUALIZADO CON SELECTOR DE PAÍS Y LÓGICA DE DIMENSIONES
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import CalculatorHeader from '../../../components/calculator/CalculatorHeader';
import LocationStep from '../../../components/calculator/LocationStep';
import PackageStep from '../../../components/calculator/PackageStep';
import ResultStep from '../../../components/calculator/ResultStep';
import axiosInstance from '../../../services/axiosInstance';
import { API_URL } from '../../../utils/config';
import './Calculator.scss';
import './calculator-fixes.scss';

const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

const getInitialCalculation = () => ({
  state: '',
  originCountry: 'US', // 🆕 País de origen (US por defecto)
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
  const { t } = useTranslation();

  const [state, setState] = useState({
    currentStep: 1,
    isLoading: false,
    calculation: getInitialCalculation(),
    result: null,
    isHighValue: false,
  });

  const [locationData, setLocationData] = useState({
    statesList: [],
  });

  const [contentOptions, setContentOptions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // 🆕 Nueva calculadora (16/11/2026): estados SIN restringir por cobertura de
      // tienda — la calculadora cotiza para cualquier estado, distinto del formulario
      // real de direcciones (que sí restringe por spa_tbTiendaParroquias).
      const [estadosResp, contentResp] = await Promise.all([
        axiosInstance.get(`${API_URL}/Calculator/estados`),
        axiosInstance.get(`${API_URL}/PaqueteContenidos/getContent`)
      ]);

      const formattedStates = estadosResp.data?.success && estadosResp.data?.data
        ? estadosResp.data.data.map(e => ({
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
      toast.error(t('calculator.error_load_data'));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLocationNext = () => {
    if (!state.calculation.state) {
      toast.error(t('calculator.error_select_state'));
      return;
    }
    setState(prev => ({ ...prev, currentStep: 2 }));
  };

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
      toast.error(t('calculator.error_select_content'));
      return;
    }

    const declaredValueNum = parseFormattedValue(state.calculation.declaredValue);
    const weightNum = parseFormattedValue(state.calculation.weight);

    if (declaredValueNum <= 0 || weightNum <= 0) {
      toast.error(t('calculator.error_complete_fields'));
      return;
    }

    // ✅ PARSING Y VALIDACIÓN DE DIMENSIONES CORREGIDA
    const lengthNum = parseFormattedValue(state.calculation.dimensions.length);
    const widthNum = parseFormattedValue(state.calculation.dimensions.width);
    const heightNum = parseFormattedValue(state.calculation.dimensions.height);
    
    console.log('Dimensiones parseadas:', lengthNum, widthNum, heightNum); // Debug
    
    // ✅ Validación corregida: Solo si es China Y faltan dimensiones
    if (state.calculation.originCountry === 'CN' && (lengthNum <= 0 || widthNum <= 0 || heightNum <= 0)) {
      toast.error(t('calculator.error_china_dimensions'));
      return;
    }
     
    
    try {
      setIsCalculating(true);
      
      const contentString = state.calculation.contenidos.join(', ');
      
      const calculationForAPI = {
        stateId: parseInt(state.calculation.state),
        declaredValue: declaredValueNum,
        currency: state.calculation.currency,
        content: contentString,
        weight: weightNum,
        weightUnit: state.calculation.weightUnit,
        dimensionUnit: state.calculation.dimensionUnit,
        paisOrigen: state.calculation.originCountry, // 🆕 ENVIAR PAÍS DE ORIGEN
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
        toast.success(t('calculator.success_calculated'));
      } else {
        throw new Error(response.data?.message || 'Error al calcular');
      }
    } catch (error) {      
      toast.error(error.response?.data?.message || 'Error al calcular el envío');
    } finally {
      setIsCalculating(false);
    }
  };

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

  // 🆕 Handler para cambio de país de origen
  const handleOriginCountryChange = (newCountry) => {      
    // Limpiar dimensiones al cambiar de país
    setState(prev => ({
      ...prev,
      calculation: {
        ...prev.calculation,
        originCountry: newCountry,
        dimensions: {
          length: '',
          width: '',
          height: ''
        }
      }
    }));
  };

  const handleHighValueChange = (newIsHighValue) => {
    setState(prev => ({
      ...prev,
      isHighValue: newIsHighValue
    }));
    
    // Si se vuelve a bajo valor, limpiar dimensiones
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

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <LocationStep
            statesList={locationData.statesList}
            selectedState={state.calculation.state}
            originCountry={state.calculation.originCountry} // 🆕 Pasar país
            onStateChange={(value) => updateCalculation({ state: value })}
            onOriginCountryChange={handleOriginCountryChange} // 🆕 Callback
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
            originCountry={state.calculation.originCountry} // 🆕 Pasar país
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

        return (
          <ResultStep
            result={state.result}
            selectedState={selectedState}
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
          title={state.currentStep === 2 ? t('calculator.step2_title') : undefined}
          subtitle={state.currentStep === 2 ? t('calculator.step2_subtitle') :
                   state.currentStep === 3 ? t('calculator.step3_subtitle') : undefined}
        />
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Calculator;