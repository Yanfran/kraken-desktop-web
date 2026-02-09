import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Contexto de Auth existente
import { getTenantByCode, DEFAULT_TENANT } from '../../config/tenants.config';

// 1. Crear el Contexto
const TenantContext = createContext({
    tenant: DEFAULT_TENANT,
    isLoading: true,
    switchTenant: () => { } // Para debug o admin
});

// 2. Provider Component
export const TenantProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth(); // Dependemos del AuthContext
    const [tenant, setTenant] = useState(DEFAULT_TENANT);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detectTenant = () => {
            setIsLoading(true);

            // Si Auth aún está cargando, esperar
            if (authLoading) return;

            if (user && user.codCliente) {
                // console.log(`🌍 [Tenant] Detectando tenant para: ${user.codCliente}`);
                const detected = getTenantByCode(user.codCliente);
                setTenant(detected);
                // console.log(`✅ [Tenant] Tenant activo: ${detected.name} (${detected.id})`);
            } else {
                // Si no hay usuario login, o no tiene código, podrías usar un default o esperar
                // Por ahora usamos default (VE) para login screen etc.
                setTenant(DEFAULT_TENANT);
            }

            setIsLoading(false);
        };

        detectTenant();
    }, [user, authLoading]);

    const value = {
        tenant,
        isLoading
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
};

// 3. Hook Personalizado
export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant debe usarse dentro de un TenantProvider');
    }
    return context;
};
