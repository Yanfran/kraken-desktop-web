import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTenant } from '../core/context/TenantContext';
import Loading from '../components/common/Loading/Loading';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// ===== LAZY LOAD US MODULES =====
const USHome = React.lazy(() => import('../modules/us/pages/Home/HomePage'));
const USPickup = React.lazy(() => import('../modules/us/pages/PickupPage'));
const USStores = React.lazy(() => import('../modules/us/pages/StoresPage'));
const USCalc = React.lazy(() => import('../modules/us/pages/CalculatorPage'));
const USTracking = React.lazy(() => import('../modules/us/pages/TrackingPage'));
const USAddresses = React.lazy(() => import('../modules/us/pages/Addresses/AddressesPage'));

// ===== LAZY LOAD VE MODULES (Existing Pages) =====
// Migraremos esto a modules/venezuela más tarde
const Home = React.lazy(() => import('../pages/Home/Home'));
const Calculator = React.lazy(() => import('../pages/calculator/Calculator/Calculator'));
const PreAlertList = React.lazy(() => import('../pages/PreAlert/List/PreAlertList'));
const PreAlertCreate = React.lazy(() => import('../pages/PreAlert/Create/PreAlertCreate'));
const Guides = React.lazy(() => import('../pages/Guide/Guides'));
const AddressesPage = React.lazy(() => import('../pages/addresses/Addresses'));
const Tracking = React.lazy(() => import('../pages/Tracking/Tracking'));

const TenantRouter = () => {
    const { tenant, isLoading } = useTenant();

    if (isLoading) return <Loading />;

    //console.log("🔀 [Router] Rendering routes for tenant:", tenant.id);

    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* =======================================================
                    RUTAS ESPECÍFICAS DE USA (KU)
                   ======================================================= */}
                {tenant.id === 'US' && (
                    <>
                        <Route path="/home" element={<USHome />} />
                        <Route path="/pickup" element={<USPickup />} />
                        <Route path="/stores" element={<USStores />} />
                        <Route path="/calculator" element={<USCalc />} />
                        <Route path="/tracking" element={<USTracking />} />
                        <Route path="/profile/addresses" element={<USAddresses />} />

                        {/* Redirecciones Home por defecto */}
                        <Route path="/" element={<Navigate to="/home" replace />} />
                    </>
                )}

                {/* =======================================================
                    RUTAS ESPECÍFICAS DE VENEZUELA (KV) - LEGACY
                   ======================================================= */}
                {tenant.id === 'VE' && (
                    <>
                        <Route path="/home" element={<Home />} />
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/pre-alert/list" element={<PreAlertList />} />
                        <Route path="/pre-alert/create" element={<PreAlertCreate />} />
                        <Route path="/guide/guides" element={<Guides />} />
                        <Route path="/addresses" element={<AddressesPage />} />
                        <Route path="/tracking" element={<Tracking />} />

                        {/* Redirecciones Home por defecto */}
                        <Route path="/" element={<Navigate to="/home" replace />} />
                    </>
                )}

                {/* =======================================================
                    RUTAS COMPARTIDAS / FALLBACK
                   ======================================================= */}
                {/* Aquí irían perfil, settings, etc. que son iguales para todos */}

                {/* 404 para rutas no encontradas dentro del tenant */}
                <Route path="*" element={<div className="p-10 text-center">Página no encontrada para {tenant.name}</div>} />
            </Routes>
        </Suspense>
    );
};

export default TenantRouter;
