// constants/colors.js
// Sistema de colores centralizado basado en tu Colors.ts de React Native con soporte para modo oscuro

// Esquema de colores para modo claro (basado en tu constants/Colors.ts actual)
const lightColors = {
  // Colores principales - exactos de tu app móvil
  primary: '#FF4500',           // Naranja KRAKEN original
  primaryLight: '#FF7F50',      // Naranja claro original
  primaryContainer: '#FFE0D5',  // Container del primary para modo claro
  onPrimary: '#FFFFFF',         // Texto sobre primary
  onPrimaryContainer: '#8B2500', // Texto sobre container
  
  secondary: '#0175c8',         // Azul para botones secundarios original
  secondaryContainer: '#D1E4FF', // Container del secondary
  onSecondary: '#FFFFFF',       // Texto sobre secondary
  onSecondaryContainer: '#001D36', // Texto sobre secondary container
  
  // Fondos - exactos de tu Colors.ts
  background: '#FFFFFF',
  cardBackground: '#F8F8F8',
  surface: '#FEFBFF',
  surfaceContainer: '#F1EDF1',
  surfaceContainerHigh: '#ECE6F0',
  
  // Texto - exactos de tu Colors.ts
  textPrimary: '#000000',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  textPlaceholder: '#AAAAAA',
  onSurface: '#1C1B1F',
  
  // Estados - exactos de tu Colors.ts
  success: '#4CAF50',
  error: '#F44336',            // Tu error actual
  warning: '#FF9800',
  info: '#2196F3',
  disabled: '#BDBDBD',
  
  // Inputs - exactos de tu Colors.ts
  inputBackground: '#F5F5F5',
  borderColor: '#D0D0D0',
  border: '#E0E0E0',
  borderLight: '#F3F4F6',
  
  // Navegación - exactos de tu Colors.ts
  tabBackground: '#FFFFFF',
  tabActive: '#FF4500',
  tabInactive: '#757575',
  drawerBackground: '#FFFFFF',
  drawerActiveBackground: '#FFE0D5',
  
  // Otros - exactos de tu Colors.ts
  separator: '#EEEEEE',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  backgroundLight: '#F8F9FA',
  successLight: '#ECFDF5',
  
  // Nuevos colores específicos para modo claro
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  scrim: '#000000',
};

// Esquema de colores para modo oscuro (adaptado de tu paleta)
const darkColors = {
  // Colores principales adaptados para modo oscuro
  primary: '#FFB085',           // Versión más clara del naranja para contraste
  primaryLight: '#FFCAB0',      // Versión aún más clara
  primaryContainer: '#8B2500',  // Container más oscuro
  onPrimary: '#2D1600',         // Texto oscuro sobre primary claro
  onPrimaryContainer: '#FFE0D5', // Texto claro sobre container oscuro
  
  secondary: '#9CCAFF',         // Azul claro para modo oscuro
  secondaryContainer: '#001D36', // Container oscuro
  onSecondary: '#003258',       // Texto sobre secondary
  onSecondaryContainer: '#D1E4FF', // Texto sobre container
  
  // Fondos oscuros
  background: '#141218',        // Fondo principal oscuro
  cardBackground: '#1D1B20',    // Cards oscuros
  surface: '#141218',           // Superficie principal
  surfaceContainer: '#211F26',  // Container de superficie
  surfaceContainerHigh: '#2B2930', // Container alto
  
  // Texto para modo oscuro
  textPrimary: '#E6E0E9',       // Texto principal claro
  textSecondary: '#CAC4D0',     // Texto secundario
  textLight: '#FFFFFF',         // Mantiene blanco
  textPlaceholder: '#938F99',   // Placeholder oscuro
  onSurface: '#E6E0E9',         // Texto sobre superficie
  
  // Estados adaptados
  success: '#4CAF50',           // Mantiene verde
  error: '#FFB4AB',             // Error claro para contraste
  warning: '#FF9800',           // Mantiene naranja
  info: '#99D5FF',              // Info claro
  disabled: '#49454F',          // Disabled oscuro
  
  // Inputs oscuros
  inputBackground: '#211F26',   // Input oscuro
  borderColor: '#49454F',       // Borde oscuro
  border: '#49454F',            // Borde general
  borderLight: '#2B2930',       // Borde claro oscuro
  
  // Navegación oscura
  tabBackground: '#1D1B20',     // Tab oscuro
  tabActive: '#FFB085',         // Active con primary oscuro
  tabInactive: '#938F99',       // Inactive oscuro
  drawerBackground: '#1D1B20',  // Drawer oscuro
  drawerActiveBackground: '#8B2500', // Active background oscuro
  
  // Otros oscuros
  separator: '#2B2930',         // Separador oscuro
  shadow: '#000000',            // Mantiene negro
  overlay: 'rgba(0, 0, 0, 0.7)', // Overlay más fuerte
  transparent: 'transparent',   // Mantiene transparente
  backgroundLight: '#1D1B20',   // Fondo claro oscuro
  successLight: '#1B3B1C',      // Success light oscuro
  
  // Específicos para modo oscuro
  outline: '#938F99',           // Outline claro
  outlineVariant: '#49454F',    // Outline variant oscuro
  scrim: '#000000',             // Mantiene negro
};

// Export por defecto con ambos esquemas
const Colors = {
  light: lightColors,
  dark: darkColors,
};

export default Colors;