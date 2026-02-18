// src/core/context/TenantContext.jsx
// ✅ REFACTORIZADO: Llama al backend para obtener configuración dinámica

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../services/axiosInstance';

const TenantContext = createContext({
    tenant: null,
    isLoading: true,
    error: null,
    reloadConfig: () => {}
});

export const TenantProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [tenant, setTenant] = useState(null);
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
            if (authLoading) return;

            // Si no hay usuario, usar config por defecto (Venezuela)
            if (!user || !user.codCliente) {
                console.log('⚠️ [Tenant] No hay usuario, usando config por defecto');
                setTenant(getDefaultConfig());
                setIsLoading(false);
                return;
            }

            // Extraer prefijo del código de cliente
            const prefix = user.codCliente.substring(0, 2).toUpperCase();
            console.log(`🌍 [Tenant] Detectando tenant para: ${user.codCliente} → Prefijo: ${prefix}`);

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
            
            // Fallback a configuración por defecto
            setTenant(getDefaultConfig());
        } finally {
            setIsLoading(false);
        }
    };

    // Configuración por defecto (Venezuela) en caso de error
    const getDefaultConfig = () => ({
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
    });

    // Función para recargar configuración (útil para testing/admin)
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