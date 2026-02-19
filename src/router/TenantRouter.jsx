// src/router/TenantRouter.jsx
// ✅ VERSIÓN COMPLETA CON TODAS LAS RUTAS PARA VENEZUELA

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTenant } from '../core/context/TenantContext';
import Loading from '../components/common/Loading/Loading';

// ============================================
// LAZY LOAD - PÁGINAS VENEZUELA (KV)
// ============================================
const Home = React.lazy(() => import('../pages/Home/Home'));
const Calculator = React.lazy(() => import('../pages/calculator/Calculator/Calculator'));
const Tracking = React.lazy(() => import('../pages/Tracking/Tracking'));

// Pre-Alertas
const PreAlertList = React.lazy(() => import('../pages/PreAlert/List/PreAlertList'));
const PreAlertCreate = React.lazy(() => import('../pages/PreAlert/Create/PreAlertCreate'));

// Guías
const Guides = React.lazy(() => import('../pages/Guide/Guides'));
const GuideDetail = React.lazy(() => import('../pages/GuideDetail/GuideDetail'));

// Perfil
const PersonalDataPage = React.lazy(() => import('../pages/profile/Profile/PersonalData/PersonalData'));
const AddressesPage = React.lazy(() => import('../pages/addresses/Addresses'));
const ChangePassword = React.lazy(() => import('../pages/profile/Profile/ChangePassword/ChangePassword'));

// Billing/Pagos
const Billing = React.lazy(() => import('../pages/Billing/Billing'));
const Payment = React.lazy(() => import('../pages/payment/PaymentPage'));

// Paquetes
// const Packages = React.lazy(() => import('../pages/Packages/PackagesList'));

// Dashboard (si existe)
// const Dashboard = React.lazy(() => import('../pages/Dashboard/Dashboard'));

// ============================================
// LAZY LOAD - PÁGINAS USA (KU)
// ============================================
const USHome = React.lazy(() => import('../modules/us/pages/Home/HomePage'));
const USPickup = React.lazy(() => import('../modules/us/pages/PickupPage'));
const USStores = React.lazy(() => import('../modules/us/pages/StoresPage'));
const USCalc = React.lazy(() => import('../modules/us/pages/CalculatorPage'));
const USTracking = React.lazy(() => import('../modules/us/pages/TrackingPage'));
const USAddresses = React.lazy(() => import('../modules/us/pages/Addresses/AddressesPage'));


// ============================================
// LAZY LOAD - PÁGINAS ES (Ke)
// ============================================
const ESHome = React.lazy(() => import('../modules/es/pages/Home/HomePage'));
const TenantRouter = () => {
    const { tenant, isLoading } = useTenant();

    if (isLoading) return <Loading />;

    // Normalizar identificadores del tenant para evitar problemas de mayúsculas
    const tenantId = tenant?.id?.toString?.().toUpperCase?.() || '';
    const tenantPrefix = tenant?.prefix?.toString?.().toUpperCase?.() || '';

    // Traza para debugging rápido
    console.log('[TenantRouter] tenantId:', tenantId, 'tenantPrefix:', tenantPrefix, 'tenant:', tenant);

    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* =======================================================
                    🇻🇪 VENEZUELA (KV) - TODAS LAS RUTAS
                   ======================================================= */}
                {(tenantId === 'VE' || tenantPrefix === 'KV') && (
                    <>
                        {/* Página principal */}
                        <Route path="/home" element={<Home />} />
                        
                        {/* Calculadora */}
                        <Route path="/calculator" element={<Calculator />} />
                        
                        {/* Pre-Alertas */}
                        <Route path="/pre-alert/list" element={<PreAlertList />} />
                        <Route path="/pre-alert/create" element={<PreAlertCreate />} />
                        
                        {/* Guías */}
                        <Route path="/guide/guides" element={<Guides />} />
                        <Route path="/guide/:id" element={<GuideDetail />} />
                        
                        {/* Tracking */}
                        <Route path="/tracking" element={<Tracking />} />
                        
                        {/* Perfil */}
                        <Route path="/profile" element={<Navigate to="/profile/personal-data" replace />} />
                        <Route path="/profile/personal-data" element={<PersonalDataPage />} />
                        <Route path="/profile/addresses" element={<AddressesPage />} />
                        <Route path="/addresses" element={<AddressesPage />} /> {/* Alias */}
                        <Route path="/change-password" element={<ChangePassword />} />
                        
                        {/* Billing y Pagos */}
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/payment/:id" element={<Payment />} />
                        
                        {/* Paquetes */}
                        {/* <Route path="/packages" element={<Packages />} /> */}
                        
                        {/* Dashboard (si existe) */}
                        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                        
                        {/* Redirección por defecto */}
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        
                        {/* 404 para Venezuela */}
                        <Route path="*" element={
                            <div className="p-10 text-center">
                                <h2>Página no encontrada</h2>
                                <p>La ruta solicitada no existe para Venezuela</p>
                            </div>
                        } />
                    </>
                )}

                {/* =======================================================
                    🇺🇸 USA (KU) - RUTAS
                   ======================================================= */}
                {(tenantId === 'US' || tenantPrefix === 'KU') && (
                    <>
                        <Route path="/home" element={<USHome />} />
                        <Route path="/pickup" element={<USPickup />} />
                        <Route path="/stores" element={<USStores />} />
                        <Route path="/calculator" element={<USCalc />} />
                        <Route path="/tracking" element={<USTracking />} />
                        <Route path="/profile/addresses" element={<USAddresses />} />
                        
                        {/* Redirección por defecto */}
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        
                        {/* 404 para USA */}
                        <Route path="*" element={
                            <div className="p-10 text-center">
                                <h2>Page not found</h2>
                                <p>The requested route does not exist for USA</p>
                            </div>
                        } />
                    </>
                )}

                {/* =======================================================
                    🇪🇸 ESPAÑA (KE) - RUTAS FUTURAS
                   ======================================================= */}
                {(tenantId === 'ES' || tenantPrefix === 'KE') && (
                    <>
                        <Route path="/home" element={<ESHome />} />

                        {/* Tracking */}
                        <Route path="/tracking" element={<Tracking />} />

                        {/* Perfil */}
                        <Route path="/profile" element={<Navigate to="/profile/personal-data" replace />} />
                        <Route path="/profile/personal-data" element={<PersonalDataPage />} />
                        <Route path="/profile/addresses" element={<AddressesPage />} />
                        <Route path="/addresses" element={<AddressesPage />} />
                        <Route path="/change-password" element={<ChangePassword />} />

                        {/* Si hay home España, puede agregarse aquí; por ahora redirigimos al tracking */}
                        <Route path="/" element={<Navigate to="/tracking" replace />} />

                        <Route path="*" element={
                            <div className="p-10 text-center">
                                <h2>Página no encontrada</h2>
                                <p>La ruta solicitada no existe para España</p>
                            </div>
                        } />
                    </>
                )}

                {/* Fallback global si no coincide ningún tenant */}
                <Route path="*" element={
                    <div className="p-10 text-center">
                        <h2>Error de configuración</h2>
                        <p>No se pudo determinar el país del usuario</p>
                    </div>
                } />
            </Routes>
        </Suspense>
    );
};

export default TenantRouter;