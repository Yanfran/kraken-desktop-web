// src/core/context/TenantContext.jsx
// ✅ VERSIÓN CORREGIDA que NUNCA retorna tenant null

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../services/axiosInstance';

const TenantContext = createContext({
    tenant: null,
    isLoading: true,
    error: null,
    reloadConfig: () => {}
});

// ✅ CONFIGURACIÓN POR DEFECTO (Venezuela) - Siempre disponible
const DEFAULT_CONFIG = {
    id: 'VE',
    name: 'Venezuela',
    prefix: 'KV',
    locale: 'es-VE',
    currency: 'USD',
    flag: '🇻🇪',
    navigation: {
        topMenu: [
            { id: 'home', label: 'Inicio', path: '/home', icon: 'home' },
            { id: 'calculator', label: 'Calcular', path: '/calculator', icon: 'calculator' },
            { id: 'pre-alert', label: 'Pre-Alertar', path: '/pre-alert/list', icon: 'bell' },
            { id: 'tracking', label: 'Rastrear', path: '/tracking', icon: 'map-pin' }
        ],
        sidebar: {
            showCasilleroInfo: true,
            showStoresButton: false,
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
};

export const TenantProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    // ✅ CRÍTICO: Inicializar con DEFAULT_CONFIG, no con null
    const [tenant, setTenant] = useState(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTenantConfig();
    }, [user, authLoading]);

    const loadTenantConfig = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Esperar a que Auth termine de cargar
            if (authLoading) {
                return;
            }

            // Si no hay usuario, usar config por defecto (Venezuela)
            if (!user || !user.codCliente) {
                console.log('⚠️ [Tenant] No hay usuario, usando config por defecto');
                setTenant(DEFAULT_CONFIG);
                setIsLoading(false);
                return;
            }

            // Extraer prefijo del código de cliente
            const prefix = user.codCliente.substring(0, 2).toUpperCase();
            console.log(`🌍 [Tenant] Detectando tenant para: ${user.codCliente} → Prefix: ${prefix}`);

            // 🔥 LLAMAR AL BACKEND
            const response = await axiosInstance.get(`/Tenant/config/${prefix}`);

            if (response.data.success) {
                setTenant(response.data.data);
                console.log(`✅ [Tenant] Configuración cargada desde BD:`, response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al cargar configuración');
            }

        } catch (err) {
            console.error('❌ [Tenant] Error al cargar configuración:', err);
            setError(err.message);
            
            // ✅ CRÍTICO: Siempre usar fallback, nunca dejar tenant como null
            console.log('⚠️ [Tenant] Usando configuración por defecto debido a error');
            setTenant(DEFAULT_CONFIG);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para recargar configuración
    const reloadConfig = () => {
        console.log('🔄 [Tenant] Recargando configuración...');
        loadTenantConfig();
    };

    const value = {
        tenant,
        isLoading,
        error,
        reloadConfig
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant debe usarse dentro de un TenantProvider');
    }
    return context;
};