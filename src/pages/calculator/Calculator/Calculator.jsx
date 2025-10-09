// src/pages/calculator/Calculator/Calculator.jsx
import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../../../components/common/PageHeader/PageHeader';
import TabNavigator from '../../../components/common/TabNavigator/TabNavigator';
import PackageStep from '../../../components/calculator/PackageStep';
import LocationStep from '../../../components/calculator/LocationStep';
import { toast } from 'react-hot-toast';
import './Calculator.scss';

// --- DATOS DE PRUEBA TEMPORALES ---
const mockStates = [
  { label: 'Distrito Capital', value: '1' },
  { label: 'Anzoátegui', value: '2' },
  { label: 'Carabobo', value: '3' },
  { label: 'Miranda', value: '4' },
  { label: 'Zulia', value: '5' },
];

const mockMunicipalities = {
  '1': [ { label: 'Libertador', value: '101' } ],
  '2': [ { label: 'Simón Bolívar', value: '201' }, { label: 'Sotillo', value: '202' } ],
  '3': [ { label: 'Valencia', value: '301' }, { label: 'Naguanagua', value: '302' } ],
  '4': [ { label: 'Baruta', value: '401' }, { label: 'Chacao', value: '402' }, { label: 'Sucre', value: '403' } ],
  '5': [ { label: 'Maracaibo', value: '501' }, { label: 'San Francisco', value: '502' } ],
};
// --- FIN DE DATOS DE PRUEBA ---

const mockContentOptions = [
  { value: '1', label: 'Celulares y Accesorios' },
  { value: '2', label: 'Laptops y Computación' },
  { value: '3', label: 'TV y Videojuegos' },
  { value: '4', label: 'Ropa y Calzado' },
  { value: '5', label: 'Hogar y Cocina' },
];

const StepPlaceholder = ({ title, onBack }) => (
  <div className="step-placeholder">
    <h2>{title}</h2>
    <p>Este es un componente temporal para el paso.</p>
    <div className="step-placeholder__buttons">
      {onBack && <button onClick={onBack}>Volver</button>}
    </div>
  </div>
);

const Calculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [locationData, setLocationData] = useState({
    statesList: mockStates, // Usar datos de prueba
    municipalitiesList: [],
  });

  const [formData, setFormData] = useState({
    selectedState: '',
    selectedMunicipality: '',
    declaredValue: '',
    contenidos: [],
    weight: '',
    weightUnit: 'lb',
    dimensionUnit: 'in',
    dimensions: { length: '', width: '', height: '' },
    isHighValue: false,
    result: null,
  });

  const contentOptions = useMemo(() => mockContentOptions, []);

  const updateForm = (field, value) => {
    setValidationError('');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStateChange = (stateId) => {
    updateForm('selectedState', stateId);
    updateForm('selectedMunicipality', '');
    // Cargar municipios de prueba
    setLocationData(prev => ({ ...prev, municipalitiesList: mockMunicipalities[stateId] || [] }));
  };

  const validateStep1 = () => {
    if (!formData.selectedState) {
      setValidationError('Por favor, selecciona un estado.');
      return false;
    }
    if (!formData.selectedMunicipality) {
      setValidationError('Por favor, selecciona un municipio.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleTabPress = (step) => {
    if (isCalculating) return;
    if (step < currentStep) {
       setCurrentStep(step);
    }
  }

  const handleCalculate = () => {
    console.log("Calculating with data:", formData);
    setIsCalculating(true);
    setTimeout(() => {
      const mockResult = { shipping: 12.50, tax: 5.20, total: 17.70 };
      updateForm('result', mockResult);
      setIsCalculating(false);
      handleNextStep();
    }, 2000);
  };

  const handleWeightUnitToggle = () => {
    const newUnit = formData.weightUnit === 'lb' ? 'kg' : 'lb';
    const newDimUnit = newUnit === 'lb' ? 'in' : 'cm';
    setFormData(prev => ({ ...prev, weightUnit: newUnit, dimensionUnit: newDimUnit }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LocationStep 
            statesList={locationData.statesList}
            municipalitiesList={locationData.municipalitiesList}
            selectedState={formData.selectedState}
            selectedMunicipality={formData.selectedMunicipality}
            onStateChange={handleStateChange}
            onMunicipalityChange={(value) => updateForm('selectedMunicipality', value)}
            onNext={handleNextStep}
            isLoading={isCalculating} // Solo se deshabilita al calcular el final
            validationError={validationError}
          />
        );
      case 2:
        return (
          <PackageStep
            declaredValue={formData.declaredValue}
            contenidos={formData.contenidos}
            weight={formData.weight}
            weightUnit={formData.weightUnit}
            dimensionUnit={formData.dimensionUnit}
            dimensions={formData.dimensions}
            isHighValue={formData.isHighValue}
            isCalculating={isCalculating}
            contentOptions={contentOptions}
            onDeclaredValueChange={(value) => updateForm('declaredValue', value)}
            onContenidosChange={(value) => updateForm('contenidos', value)}
            onWeightChange={(value) => updateForm('weight', value)}
            onWeightUnitToggle={handleWeightUnitToggle}
            onDimensionChange={(dim, value) => updateForm('dimensions', { ...formData.dimensions, [dim]: value })}
            onHighValueChange={(value) => updateForm('isHighValue', value)}
            onCalculate={handleCalculate}
            onBack={handlePrevStep}
          />
        );
      case 3:
        return <StepPlaceholder title="Paso 3: Resultado" onBack={handlePrevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="calculator-page">
      <PageHeader 
        title="Calcula tu envío"
        subtitle="Descubre cuánto te costará traer tus compras desde USA"
      />
      <TabNavigator 
        currentStep={currentStep}
        onTabPress={handleTabPress}
      />
      <div className="calculator-page__content">
        {renderStep()}
      </div>
    </div>
  );
};

export default Calculator;
