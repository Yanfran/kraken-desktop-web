/**
 * Utilidades para manejo de valores monetarios
 * Formato: 1.234,56 (miles: punto, decimal: coma)
 */

/**
 * Convierte un valor decimal de la base de datos al formato de CurrencyInput
 * @param {number|string} dbValue - Valor de la BD (ej: 185.1, "185.1", 1850.03)
 * @returns {string} Valor formateado (ej: "185,10", "1.850,03")
 */
export const formatDecimalFromDB = (dbValue) => {
  if (!dbValue && dbValue !== 0) return '';
  
  const numericValue = typeof dbValue === 'string' ? parseFloat(dbValue) : dbValue;
  
  if (isNaN(numericValue) || numericValue === 0) return '';
  
  // Convertir a string con 2 decimales fijos
  const fixed = numericValue.toFixed(2);
  
  // Separar parte entera y decimal
  const [integerPart, decimalPart] = fixed.split('.');
  
  // Formatear parte entera con separadores de miles (puntos)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retornar en formato "1.234,56"
  return `${formattedInteger},${decimalPart}`;
};

/**
 * Convierte del formato CurrencyInput al valor decimal para el backend
 * @param {string} formattedValue - Valor del CurrencyInput (ej: "185,10", "1.850,03")
 * @returns {string} Valor decimal como string (ej: "185.10", "1850.03")
 */
export const formatValueForBackend = (formattedValue) => {
  // Si está vacío o es cadena vacía, devolver "0"
  if (!formattedValue || formattedValue.trim() === '') return "0";
  
  // Remover puntos (separadores de miles) y reemplazar coma por punto (decimal)
  const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
  return cleanValue;
};

/**
 * Convierte valor formateado a número
 * @param {string} formattedValue - Valor formateado (ej: "1.850,10")
 * @returns {number} Valor numérico (ej: 1850.10)
 */
export const parseFormattedValue = (formattedValue) => {
  if (!formattedValue) return 0;
  
  // Si viene del CurrencyInput (formato: "1.850,10")
  if (formattedValue.includes(',')) {
    const backendValue = formatValueForBackend(formattedValue);
    return parseFloat(backendValue) || 0;
  }
  
  // Si es valor simple (formato: "185.10")
  return parseFloat(formattedValue) || 0;
};

/**
 * Valida que un valor monetario sea válido
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const isValidCurrencyValue = (value) => {
  if (!value) return true; // Vacío es válido (opcional)
  
  // Debe coincidir con el formato: números, puntos y una coma
  const regex = /^\d{1,3}(\.\d{3})*(,\d{2})?$/;
  return regex.test(value);
};

/**
 * Formatea un valor para mostrar en la UI
 * @param {number|string} value - Valor a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @returns {string} Valor formateado con símbolo (ej: "$1.850,35")
 */
export const formatCurrencyDisplay = (value, currency = 'USD') => {
  const formatted = formatDecimalFromDB(value);
  if (!formatted) return '$0,00';
  
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    VES: 'Bs.'
  };
  
  const symbol = symbols[currency] || '$';
  return `${symbol}${formatted}`;
};

// Ejemplos de uso:
// formatDecimalFromDB(185.1) → "185,10"
// formatDecimalFromDB(1850.03) → "1.850,03"
// formatValueForBackend("185,10") → "185.10"
// formatValueForBackend("1.850,03") → "1850.03"
// parseFormattedValue("1.850,10") → 1850.10
// isValidCurrencyValue("1.850,35") → true
// formatCurrencyDisplay(1850.35, 'USD') → "$1.850,35"