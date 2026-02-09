/**
 * src/config/tenants.config.js
 * Configuración centralizada de Tenants (Países) para Kraken Courier.
 * Define la estructura de navegación, prefijos y moneda para cada país.
 */

// Rutas de componentes dinámicos (usamos strings para el Router dinámico)
export const MODULE_PATHS = {
    US: '../modules/us',
    VE: '../modules/venezuela',
    ES: '../modules/spain' // Para futuro
};

export const TENANTS = {
    US: {
        id: 'US',
        name: 'Estados Unidos',
        prefix: 'KU', // Prefijo de CodCliente
        locale: 'en-US',
        currency: 'USD',
        flag: '🇺🇸',
        // Configuración de Navegación
        navigation: {
            topMenu: [
                { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
                { id: 'calc', label: 'Calcular', path: '/calculator', icon: 'calculator' },
                { id: 'pickup', label: 'Recogida', path: '/pickup', icon: 'box' }, // Screen Nueva
                { id: 'tracking', label: 'Rastrear', path: '/tracking', icon: 'map-pin' }
            ],
            sidebar: {
                showCasilleroInfo: false, // USA no muestra casillero info tradicional en sidebar
                showStoresButton: true,   // Botón para ver tiendas físicas
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
    VE: {
        id: 'VE',
        name: 'Venezuela',
        prefix: 'KV',
        locale: 'es-VE',
        currency: 'USD', // O VES si aplica
        flag: '🇻🇪',
        navigation: {
            topMenu: [
                { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
                { id: 'prealert', label: 'Pre-Alertas', path: '/pre-alert/list', icon: 'bell' },
                { id: 'guides', label: 'Guías', path: '/guide/guides', icon: 'file-text' }
            ],
            sidebar: {
                showCasilleroInfo: true, // Muestra info de casillero (Miami/China)
                showStoresButton: false,
                menuItems: [
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
    ES: {
        id: 'ES', // Placeholder para España
        name: 'España',
        prefix: 'KE',
        locale: 'es-ES',
        currency: 'EUR',
        flag: '🇪🇸',
        navigation: {
             topMenu: [
                { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
                { id: 'calc', label: 'Calcular', path: '/calculator', icon: 'calculator' },
                { id: 'tracking', label: 'Rastrear', path: '/tracking', icon: 'map-pin' }
            ],
            sidebar: {
                showCasilleroInfo: false,
                showStoresButton: true,
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
    }
};

export const DEFAULT_TENANT = TENANTS.VE; // Por defecto Venezuela si no coincide nada

/**
 * Detecta el tenant basado en el código de cliente
 * @param {string} clientCode - El código completo (ej. KU000123)
 * @returns {object} Configuración del tenant encontrado o DEFAULT
 */
export const getTenantByCode = (clientCode) => {
    if (!clientCode) return DEFAULT_TENANT;
    
    const prefix = clientCode.substring(0, 2).toUpperCase();
    
    const found = Object.values(TENANTS).find(t => t.prefix === prefix);
    return found || DEFAULT_TENANT;
};
