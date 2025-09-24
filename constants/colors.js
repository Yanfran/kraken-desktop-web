// src/constants/colors.js
// Sistema de colores centralizado para Kraken Desktop Web

// Esquema de colores para modo claro
const lightColors = {
  // Colores principales - exactos de tu app móvil
  primary: '#FF4500',           // Naranja KRAKEN original
  primaryLight: '#FF7F50',      // Naranja claro original
  primaryContainer: '#FFE0D5',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#8B2500',
  
  secondary: '#0175c8',         // Azul para botones secundarios original
  secondaryContainer: '#D1E4FF',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#001D36',
  
  // Fondos
  background: '#FFFFFF',
  cardBackground: '#F8F8F8',
  surface: '#FEFBFF',
  surfaceContainer: '#F1EDF1',
  surfaceContainerHigh: '#ECE6F0',
  
  // Texto
  textPrimary: '#000000',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  textPlaceholder: '#AAAAAA',
  onSurface: '#1C1B1F',
  
  // Estados
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  disabled: '#BDBDBD',
  
  // Inputs
  inputBackground: '#F5F5F5',
  borderColor: '#D0D0D0',
  border: '#E0E0E0',
  borderLight: '#F3F4F6',
  
  // Navegación
  tabBackground: '#FFFFFF',
  tabActive: '#FF4500',
  tabInactive: '#757575',
  drawerBackground: '#FFFFFF',
  drawerActiveBackground: '#FFE0D5',
  
  // Otros
  separator: '#EEEEEE',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  backgroundLight: '#F8F9FA',
  successLight: '#ECFDF5',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  scrim: '#000000',
};

// Esquema de colores para modo oscuro
const darkColors = {
  // Colores principales adaptados para modo oscuro
  primary: '#FFB085',           // Versión más clara del naranja para contraste
  primaryLight: '#FFCAB0',      
  primaryContainer: '#8B2500',
  onPrimary: '#2D1600',
  onPrimaryContainer: '#FFE0D5',
  
  secondary: '#9CCAFF',         // Azul claro para modo oscuro
  secondaryContainer: '#001D36',
  onSecondary: '#003258',
  onSecondaryContainer: '#D1E4FF',
  
  // Fondos oscuros
  background: '#141218',        // Fondo principal oscuro
  cardBackground: '#1D1B20',    // Cards oscuros
  surface: '#141218',           
  surfaceContainer: '#211F26',  
  surfaceContainerHigh: '#2B2930',
  
  // Texto para modo oscuro
  textPrimary: '#E6E0E9',       // Texto principal claro
  textSecondary: '#CAC4D0',     // Texto secundario
  textLight: '#FFFFFF',         
  textPlaceholder: '#938F99',   // Placeholder oscuro
  onSurface: '#E6E0E9',         
  
  // Estados adaptados
  success: '#4CAF50',           
  error: '#FFB4AB',             // Error claro para contraste
  warning: '#FF9800',           
  info: '#99D5FF',              
  disabled: '#49454F',          
  
  // Inputs oscuros
  inputBackground: '#211F26',   
  borderColor: '#49454F',       
  border: '#49454F',            
  borderLight: '#2B2930',       
  
  // Navegación oscura
  tabBackground: '#1D1B20',     
  tabActive: '#FFB085',         
  tabInactive: '#938F99',       
  drawerBackground: '#1D1B20',  
  drawerActiveBackground: '#8B2500',
  
  // Otros oscuros
  separator: '#2B2930',         
  shadow: '#000000',            
  overlay: 'rgba(0, 0, 0, 0.7)', 
  transparent: 'transparent',   
  backgroundLight: '#1D1B20',   
  successLight: '#1B3B1C',      
  outline: '#938F99',           
  outlineVariant: '#49454F',    
  scrim: '#000000',             
};

// Export por defecto con ambos esquemas
const Colors = {
  light: lightColors,
  dark: darkColors,
};

export default Colors;