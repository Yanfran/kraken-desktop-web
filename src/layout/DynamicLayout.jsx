// src/layout/DynamicLayout.jsx
// ✅ VERSIÓN CORREGIDA con validación de tenant null

import React, { useState } from 'react';
import { useTenant } from '../core/context/TenantContext';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNavigation from '../components/TopNavigation/TopNavigation';
import './DynamicLayout.styles.scss';

const DynamicLayout = ({ children }) => {
    const { tenant, isLoading } = useTenant();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // ✅ MIENTRAS ESTÁ CARGANDO
    if (isLoading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                Cargando configuración...
            </div>
        );
    }

    // ✅ SI TENANT ES NULL (error crítico)
    if (!tenant || !tenant.navigation) {
        console.error('❌ [DynamicLayout] Tenant is null or missing navigation');
        return (
            <div className="error-screen" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h2>Error de Configuración</h2>
                <p>No se pudo cargar la configuración del sistema.</p>
                <button 
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#2d5ba6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Recargar Página
                </button>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Sidebar recibe la config específica del tenant */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {/* TopNav recibe la config específica */}
                <TopNavigation
                    onToggleSidebar={toggleSidebar}
                    sidebarOpen={sidebarOpen}
                />

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DynamicLayout;