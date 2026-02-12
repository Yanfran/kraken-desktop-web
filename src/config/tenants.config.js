/**
 * src/config/tenants.config.js
 * ✅ CONFIGURACIÓN FINAL - 3 PAÍSES CON MENÚS DIFERENTES
 */

export const TENANTS = {
  // 🇻🇪 VENEZUELA - CONFIGURACIÓN ORIGINAL
  VE: {
    id: 'VE',
    name: 'Venezuela',
    prefix: 'KV',
    locale: 'es-VE',
    currency: 'USD',
    flag: '🇻🇪',
    
    navigation: {
      // TopNav: Inicio | Calcular | Pre-Alertar | Rastrear
      topMenu: [
        { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
        { id: 'calc', label: 'Calcular', path: '/calculator', icon: 'calculator' },
        { id: 'prealert', label: 'Pre-Alertar', path: '/pre-alert/list', icon: 'bell' },
        { id: 'tracking', label: 'Rastrear', path: '/tracking', icon: 'map-pin' }
      ],
      
      // Sidebar: Casillero + Mis Envíos + Mis Pre-Alertas + Perfil
      sidebar: {
        showCasilleroInfo: true,   // ✅ Mostrar casillero USA/China
        showStoresButton: false,   // ❌ NO mostrar tiendas
        menuItems: [
          { id: 'shipments', label: 'Mis Envíos', path: '/guide/guides' },
          { id: 'prealerts', label: 'Mis Pre-Alertas', path: '/pre-alert/list' },
          { 
            id: 'profile', 
            label: 'Perfil de Usuario', 
            path: '/profile', 
            hasSubMenu: true,
            subItems: [
              { id: 'personal', label: 'Datos Personales', path: '/profile/personal-data' },
              { id: 'addresses', label: 'Mis Direcciones', path: '/profile/addresses' },
              { id: 'password', label: 'Cambiar Contraseña', path: '/change-password' }
            ]
          }
        ]
      }
    }
  },

  // 🇺🇸 USA - CONFIGURACIÓN NUEVA
  US: {
    id: 'US',
    name: 'Estados Unidos',
    prefix: 'KU',
    locale: 'en-US',
    currency: 'USD',
    flag: '🇺🇸',
    
    navigation: {
      // TopNav: Inicio | Calcular | Recogida | Rastrear
      topMenu: [
        { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
        { id: 'calc', label: 'Calcular', path: '/calculator', icon: 'calculator' },
        { id: 'pickup', label: 'Recogida', path: '/pickup', icon: 'box' },
        { id: 'tracking', label: 'Rastrear', path: '/tracking', icon: 'map-pin' }
      ],
      
      // Sidebar: Ver Tiendas + Mis Envíos + Perfil
      sidebar: {
        showCasilleroInfo: false,  // ❌ NO mostrar casillero
        showStoresButton: true,    // ✅ Mostrar tiendas
        menuItems: [
          { id: 'shipments', label: 'Mis Envíos', path: '/guide/guides' },
          { 
            id: 'profile', 
            label: 'Perfil de Usuario', 
            path: '/profile', 
            hasSubMenu: true,
            subItems: [
              { id: 'personal', label: 'Datos Personales', path: '/profile/personal-data' },
              { id: 'addresses', label: 'Mis Direcciones', path: '/profile/addresses' },
              { id: 'password', label: 'Cambiar Contraseña', path: '/change-password' }
            ]
          }
        ]
      }
    }
  },

  // 🇪🇸 ESPAÑA - CONFIGURACIÓN INVENTADA
  ES: {
    id: 'ES',
    name: 'España',
    prefix: 'KE',
    locale: 'es-ES',
    currency: 'EUR',
    flag: '🇪🇸',
    
    navigation: {
      // TopNav: Inicio | Calcular | Rastrear (solo 3 opciones)
      topMenu: [
        { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
        { id: 'calc', label: 'Calcular', path: '/calculator', icon: 'calculator' },
        { id: 'tracking', label: 'Rastrear', path: '/tracking', icon: 'map-pin' }
      ],
      
      // Sidebar: Ver Tiendas + Mis Envíos + Perfil + Soporte
      sidebar: {
        showCasilleroInfo: false,  // ❌ NO mostrar casillero
        showStoresButton: true,    // ✅ Mostrar tiendas
        menuItems: [
          { id: 'shipments', label: 'Mis Envíos', path: '/guide/guides' },
          { 
            id: 'profile', 
            label: 'Perfil de Usuario', 
            path: '/profile', 
            hasSubMenu: true,
            subItems: [
              { id: 'personal', label: 'Datos Personales', path: '/profile/personal-data' },
              { id: 'addresses', label: 'Mis Direcciones', path: '/profile/addresses' },
              { id: 'password', label: 'Cambiar Contraseña', path: '/change-password' }
            ]
          },
          { id: 'support', label: 'Soporte', path: '/support' }
        ]
      }
    }
  }
};

export const DEFAULT_TENANT = TENANTS.VE;

export const getTenantByCode = (clientCode) => {
  if (!clientCode) {
    console.warn('⚠️ [Tenant] No clientCode provided, using DEFAULT_TENANT');
    return DEFAULT_TENANT;
  }
  
  const prefix = clientCode.substring(0, 2).toUpperCase();
  const found = Object.values(TENANTS).find(tenant => tenant.prefix === prefix);
  
  if (!found) {
    console.warn(`⚠️ [Tenant] Prefix "${prefix}" not found, using DEFAULT_TENANT`);
    return DEFAULT_TENANT;
  }
  
  console.log(`✅ [Tenant] Detected: ${found.name} (${found.id}) for prefix "${prefix}"`);
  return found;
};

export const getTenantById = (tenantId) => {
  return TENANTS[tenantId] || null;
};

export const getAllTenants = () => {
  return Object.values(TENANTS);
};