import React, { useState, useEffect } from 'react';
import './CurrencyInput.scss';

/**
 * CurrencyInput - Componente para entrada de valores monetarios
 * Formato: 1.234,56 (separador de miles: punto, decimal: coma)
 */
const CurrencyInput = ({ 
  value, 
  onChange, 
  placeholder = "0,00",
  maxLength = 10,
  disabled = false,
  className = "",
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState('');

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && value !== '') {
      setInternalValue(value);
    } else {
      setInternalValue('');
    }
  }, [value]);

  // Formatear número a formato de moneda
  const formatCurrency = (numericString) => {
    if (!numericString || numericString === '0') return '0,00';
    
    const paddedNumber = numericString.padStart(3, '0');
    const integerPart = paddedNumber.slice(0, -2);
    const decimalPart = paddedNumber.slice(-2);
    
    // Remover ceros iniciales del entero
    const cleanIntegerPart = integerPart.replace(/^0+/, '') || '0';
    
    // Formatear parte entera con separadores de miles
    const formattedInteger = cleanIntegerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedInteger},${decimalPart}`;
  };

  // Convertir formato de moneda a número decimal
  const parseToDecimal = (formattedValue) => {
    if (!formattedValue) return 0;
    const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  // Extraer solo dígitos
  const extractDigits = (text) => {
    return text.replace(/[^\d]/g, '');
  };

  // Manejar cambio de texto
  const handleTextChange = (e) => {
    const text = e.target.value;
    const digits = extractDigits(text);
    
    if (!digits) {
      setInternalValue('');
      onChange('', 0);
      return;
    }
    
    if (digits.length > maxLength) {
      return;
    }
    
    const formatted = formatCurrency(digits);
    const numericValue = parseToDecimal(formatted);
    
    setInternalValue(formatted);
    onChange(formatted, numericValue);
  };

  // Manejar blur (perder foco)
  const handleBlur = () => {
    if (!internalValue || internalValue.trim() === '') {
      setInternalValue('');
      onChange('', 0);
    }
  };

  return (
    <input
      type="text"
      value={internalValue}
      onChange={handleTextChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`currency-input ${className}`}
      inputMode="numeric"
      {...props}
    />
  );
};

export default CurrencyInput;