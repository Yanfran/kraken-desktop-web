// src/pages/calculator/Calculator/Calculator.jsx
import React, { useState, useMemo } from 'react';
import CalculatorHeader from '../../../components/calculator/CalculatorHeader';
import PackageStep from '../../../components/calculator/PackageStep';
import './Calculator.scss';

// Mock data - en un futuro esto vendría de una API
const mockContentOptions = [
  { value: '1', label: 'Celulares y Accesorios' },
  { value: '2', label: 'Laptops y Computación' },
  { value: '3', label: 'TV y Videojuegos' },
  { value: '4', label: 'Ropa y Calzado' },
  { value: '5', label: 'Hogar y Cocina' },
  { value: '6', label: 'Juguetes y Bebés' },
  { value: '7', label: 'Libros y Coleccionables' },
  { value: '8', label: 'Repuestos y Accesorios de Vehículos' },
];

// Componentes dummy para los otros pasos
const StepPlaceholder = ({ title, onNext, onBack }) => (
  <div className="step-placeholder">
    <h2>{title}</h2>
    <p>Este es un componente temporal para el paso.</p>
    <div className="step-placeholder__buttons">
      {onBack && <button onClick={onBack}>Volver</button>}
      {onNext && <button onClick={onNext}>Siguiente</button>}
    </div>
  </div>
);


const Calculator = () => {
  const [currentStep, setCurrentStep] = useState(2); // Empezamos en el paso del paquete
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [calculatorData, setCalculatorData] = useState({
    // Step 1: Ruta
    origin: 'USA',
    destination: 'VEN',
    // Step 2: Paquete
    declaredValue: '',
    contenidos: [],
    weight: '',
    weightUnit: 'lb', // 'kg' or 'lb'
    dimensionUnit: 'in', // 'cm' or 'in'
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    isHighValue: false,
    // Step 3: Resultado
    result: null,
  });

  const contentOptions = useMemo(() => mockContentOptions, []);

  const handleTabPress = (step) => {
    // Permitir navegación solo si no se está calculando
    if (!isCalculating) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (field, value) => {
    setCalculatorData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    console.log("Calculating with data:", calculatorData);
    setIsCalculating(true);
    // Simular llamada a API
    setTimeout(() => {
      const mockResult = {
        shipping: 12.50,
        tax: 5.20,
        total: 17.70,
      };
      updateData('result', mockResult);
      setIsCalculating(false);
      handleNextStep(); // Ir al paso de resultados
    }, 2000);
  };

  const handleWeightUnitToggle = () => {
    const newUnit = calculatorData.weightUnit === 'lb' ? 'kg' : 'lb';
    const newDimUnit = newUnit === 'lb' ? 'in' : 'cm';
    setCalculatorData(prev => ({
      ...prev,
      weightUnit: newUnit,
      dimensionUnit: newDimUnit,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPlaceholder title="Paso 1: Ruta" onNext={handleNextStep} />;
      case 2:
        return (
          <PackageStep
            declaredValue={calculatorData.declaredValue}
            contenidos={calculatorData.contenidos}
            weight={calculatorData.weight}
            weightUnit={calculatorData.weightUnit}
            dimensionUnit={calculatorData.dimensionUnit}
            dimensions={calculatorData.dimensions}
            isHighValue={calculatorData.isHighValue}
            isCalculating={isCalculating}
            contentOptions={contentOptions}
            onDeclaredValueChange={(value) => updateData('declaredValue', value)}
            onContenidosChange={(value) => updateData('contenidos', value)}
            onWeightChange={(value) => updateData('weight', value)}
            onWeightUnitToggle={handleWeightUnitToggle}
            onDimensionChange={(dim, value) => updateData('dimensions', { ...calculatorData.dimensions, [dim]: value })}
            onHighValueChange={(value) => updateData('isHighValue', value)}
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
      <CalculatorHeader 
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
