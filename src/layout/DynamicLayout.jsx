import React, { useState } from 'react';
import { useTenant } from '../core/context/TenantContext';
import Sidebar from '../components/Sidebar/Sidebar'; // Usando el existente por ahora (lo refactorizaremos)
import TopNavigation from '../components/TopNavigation/TopNavigation'; // Usando el existente
import './DynamicLayout.styles.scss'; // Asumiendo estilos compartidos

const DynamicLayout = ({ children }) => {
    const { tenant, isLoading } = useTenant();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (isLoading) {
        return <div className="loading-screen">Cargando configuración...</div>;
    }

    return (
        <div className="app-container">
            {/* Sidebar recibe la config específica del tenant */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                tenantConfig={tenant.navigation?.sidebar} // ✅ Pasamos config
            />

            <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {/* TopNav recibe la config específica */}
                <TopNavigation
                    onToggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                    tenantConfig={tenant.navigation?.topMenu} // ✅ Pasamos config
                />

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DynamicLayout;
