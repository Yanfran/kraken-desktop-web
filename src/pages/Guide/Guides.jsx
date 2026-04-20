// src/pages/MyGuides/MyGuides.jsx - VERSIÓN CORREGIDA

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  fetchGuias, 
  uploadGuiaInvoice, 
  uploadGuiaMSDS,
  uploadGuiaNONDG,
  calculateSingleGuiaPrice 
} from '../../services/guiasService';
import styles from './Guides.module.scss';
import GuiaCard from './GuiaCard';
import clsx from 'clsx';
import Loading from '../../components/common/Loading/Loading';
import toast from 'react-hot-toast';

import { IoCheckboxOutline, IoSquareOutline, IoCardOutline } from 'react-icons/io5';

export default function Guides() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('activos');
  
  // Estados para carga de documentos
  const [uploadingInvoice, setUploadingInvoice] = useState({});
  const [uploadingMSDS, setUploadingMSDS] = useState({});
  const [uploadingNONDG, setUploadingNONDG] = useState({});
  
  const [selectedGuiaForUpload, setSelectedGuiaForUpload] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  
  const [openMenuId, setOpenMenuId] = useState(null);

  React.useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);
  
  // Refs para cada tipo de documento
  const fileInputRef = useRef(null);
  const msdsInputRef = useRef(null);
  const nondgInputRef = useRef(null);

  // Estado para costos calculados
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [calculatingCosts, setCalculatingCosts] = useState({});

  // Estados para selección múltiple
  const [selectedGuias, setSelectedGuias] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: queryResult, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['guias', currentPage, pageSize, activeTab],
    queryFn: () => fetchGuias({ page: currentPage, pageSize, tab: activeTab }),
    keepPreviousData: true,
  });

  const guias = queryResult?.data ?? [];
  const pagination = queryResult?.pagination ?? null;

  // Calcular costo para una guía
  const calculateCost = useCallback(async (guia) => {
    if (!guia || !guia.idGuia) return null;
    
    if (calculatedCosts[guia.idGuia]) {
      return calculatedCosts[guia.idGuia];
    }

    if (calculatingCosts[guia.idGuia]) {
      return null;
    }

    setCalculatingCosts(prev => ({ ...prev, [guia.idGuia]: true }));

    try {
      const response = await calculateSingleGuiaPrice(guia.idGuia);
      
      if (response.success && response.data?.detalleFactura) {
        const precioBaseUSD = response.data.detalleFactura.precioBaseUSD || 0;
        const costoFormateado = `$${parseFloat(precioBaseUSD).toFixed(2)}`;
        
        setCalculatedCosts(prev => ({
          ...prev,
          [guia.idGuia]: costoFormateado
        }));
        
        return costoFormateado;
      } else {
        const fallback = guia.valorFOB 
          ? `$${parseFloat(guia.valorFOB).toFixed(2)}` 
          : '$0.00';
        
        setCalculatedCosts(prev => ({
          ...prev,
          [guia.idGuia]: fallback
        }));
        
        return fallback;
      }
    } catch (error) {
      console.error('Error calculando costo:', error);
      const fallback = guia.valorFOB 
        ? `$${parseFloat(guia.valorFOB).toFixed(2)}` 
        : '$0.00';
      
      setCalculatedCosts(prev => ({
        ...prev,
        [guia.idGuia]: fallback
      }));
      
      return fallback;
    } finally {
      setCalculatingCosts(prev => ({ ...prev, [guia.idGuia]: false }));
    }
  }, [calculatedCosts, calculatingCosts]);

  React.useEffect(() => {
    if (guias.length > 0) {
      guias.slice(0, 10).forEach(guia => {
        if (!calculatedCosts[guia.idGuia] && !calculatingCosts[guia.idGuia]) {
          calculateCost(guia);
        }
      });
    }
  }, [guias, calculateCost, calculatedCosts, calculatingCosts]);

  // ============================================
  // ✅ FUNCIONES CORREGIDAS - VERIFICAN SI YA FUE CARGADO
  // ============================================

  /**
   * Verifica si necesita factura Y si NO ha sido cargada
   */
  const necesitaFactura = (guia) => {
    if (!guia) return false;
    
    const estatus = guia.estatus?.toLowerCase();
    const idEstatusActual = guia.idEstatusActual || 0;
    const requiereFactura = estatus === 'pendiente de factura' || idEstatusActual === 3;
    
    // ✅ Verificar si ya fue cargada
    const yaFueCargada = guia.invoiceCargado === true || !!guia.invoiceUrl;
    
    // Solo mostrar si se requiere Y NO ha sido cargada
    return requiereFactura && !yaFueCargada;
  };

  /**
   * ✅ CORREGIDO: Verifica si necesita MSDS Y si NO ha sido cargada
   */
  const necesitaMSDS = (guia) => {
    if (!guia) return false;
    
    const requiereMSDS = guia.msds === true;
    
    // ✅ Verificar si ya fue cargada
    const yaFueCargada = guia.msdsCargado === true || !!guia.msdsUrl;
    
    // Solo mostrar si se requiere Y NO ha sido cargada
    return requiereMSDS && !yaFueCargada;
  };

  /**
   * ✅ CORREGIDO: Verifica si necesita NONDG Y si NO ha sido cargada
   */
  const necesitaNONDG = (guia) => {
    if (!guia) return false;
    
    const requiereNONDG = guia.nondg === true;
    
    // ✅ Verificar si ya fue cargada
    const yaFueCargada = guia.nondgCargado === true || !!guia.nondgUrl;
    
    // Solo mostrar si se requiere Y NO ha sido cargada
    return requiereNONDG && !yaFueCargada;
  };

  // Verificar si se puede pagar
  const sePuedePagar = (guia) => {
    if (!guia) return false;
    const fob = guia.valorFOB || 0;
    const idEstatusActual = guia.idEstatusActual || 0;
    const tienePago = guia.tienePago || guia.estaPagado || false;
    
    if (tienePago) return false;
    
    if (fob <= 100) {
      return idEstatusActual >= 2;
    } else {
      // return idEstatusActual >= 8;
      return idEstatusActual >= 2;
    }
  };

  // Funciones de selección múltiple
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedGuias([]);
    }
  };

  const toggleGuiaSelection = (guiaId, guia) => {
    if (!sePuedePagar(guia)) {
      toast.error('Esta guía no está disponible para pago');
      return;
    }

    setSelectedGuias(prev => {
      if (prev.includes(guiaId)) {
        return prev.filter(id => id !== guiaId);
      } else {
        return [...prev, guiaId];
      }
    });
  };

  const selectAllPayableGuias = () => {
    const payableGuias = filteredGuias
      .filter(guia => sePuedePagar(guia))
      .map(guia => guia.idGuia);
    
    if (selectedGuias.length === payableGuias.length) {
      setSelectedGuias([]);
    } else {
      setSelectedGuias(payableGuias);
    }
  };

  const handleMultiplePayment = () => {
    if (selectedGuias.length === 0) {
      toast.error('Selecciona al menos una guía para pagar');
      return;
    }

    if (selectedGuias.length === 1) {
      navigate(`/payment/${selectedGuias[0]}`);
    } else {
      const idsParam = selectedGuias.join(',');
      navigate(`/payment/multiple?multiple=${idsParam}`);
    }
  };

  // ============================================
  // 📄 HANDLERS PARA CARGAR DOCUMENTOS
  // ============================================
  
  const handleCargarFactura = (guia, e) => {
    if (e) e.stopPropagation();
    
    if (!guia) {
      toast.error('No se puede cargar factura sin seleccionar una guía');
      return;
    }

    setSelectedGuiaForUpload(guia);
    setUploadType('invoice');
    setOpenMenuId(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCargarMSDS = (guia, e) => {
    if (e) e.stopPropagation();
    
    if (!guia) {
      toast.error('No se puede cargar MSDS sin seleccionar una guía');
      return;
    }

    setSelectedGuiaForUpload(guia);
    setUploadType('msds');
    setOpenMenuId(null);
    
    if (msdsInputRef.current) {
      msdsInputRef.current.click();
    }
  };

  const handleCargarNONDG = (guia, e) => {
    if (e) e.stopPropagation();
    
    if (!guia) {
      toast.error('No se puede cargar NONDG sin seleccionar una guía');
      return;
    }

    setSelectedGuiaForUpload(guia);
    setUploadType('nondg');
    setOpenMenuId(null);
    
    if (nondgInputRef.current) {
      nondgInputRef.current.click();
    }
  };

  // ============================================
  // 📤 PROCESAR ARCHIVOS SELECCIONADOS
  // ============================================

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedGuiaForUpload || !selectedGuiaForUpload.idGuia) {
      toast.error('No se ha seleccionado una guía válida');
      return;
    }

    // Validar tipo
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar 5MB');
      return;
    }

    const guiaId = selectedGuiaForUpload.idGuia;

    try {
      let response;
      
      if (uploadType === 'msds') {
        setUploadingMSDS(prev => ({ ...prev, [guiaId]: true }));
        response = await uploadGuiaMSDS(guiaId, file);
      } else if (uploadType === 'nondg') {
        setUploadingNONDG(prev => ({ ...prev, [guiaId]: true }));
        response = await uploadGuiaNONDG(guiaId, file);
      } else {
        setUploadingInvoice(prev => ({ ...prev, [guiaId]: true }));
        response = await uploadGuiaInvoice(guiaId, file);
      }

      if (response.success) {
        toast.success(response.message || 'Documento subido exitosamente');
        // ✅ Recargar guías para actualizar el estado
        await refetch();
      } else {
        toast.error(response.message || 'Error al subir documento');
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error('Error al subir documento');
    } finally {
      if (uploadType === 'msds') {
        setUploadingMSDS(prev => ({ ...prev, [guiaId]: false }));
      } else if (uploadType === 'nondg') {
        setUploadingNONDG(prev => ({ ...prev, [guiaId]: false }));
      } else {
        setUploadingInvoice(prev => ({ ...prev, [guiaId]: false }));
      }
      
      setSelectedGuiaForUpload(null);
      setUploadType(null);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (msdsInputRef.current) msdsInputRef.current.value = '';
      if (nondgInputRef.current) nondgInputRef.current.value = '';
    }
  };

  // Resetear página al filtrar
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, activeTab]);

  // El filtro de tabs lo hace el backend; aquí solo filtramos por búsqueda local
  const filteredGuias = useMemo(() => {
    if (!searchQuery) return guias;
    const q = searchQuery.toLowerCase();
    return guias.filter(guia =>
      guia.nGuia?.toLowerCase().includes(q) ||
      guia.tracking?.toLowerCase().includes(q) ||
      guia.contenido?.toLowerCase().includes(q)
    );
  }, [guias, searchQuery]);

  const payableGuiasCount = useMemo(() => {
    return filteredGuias.filter(guia => sePuedePagar(guia)).length;
  }, [filteredGuias]);

  return (
    <div className={styles.container}>
      {/* Inputs ocultos para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={msdsInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange} 
      />
      <input
        ref={nondgInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1>Listado de Envíos</h1>
          
          <div className={styles.tabsContainer}>
            <button
              className={clsx(styles.tabButton, activeTab === 'activos' && styles.tabButtonActive)}
              onClick={() => setActiveTab('activos')}
            >
              Activos
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'historial' && styles.tabButtonActive)}
              onClick={() => setActiveTab('historial')}
            >
              Historial
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por N° de Guía, Tracking o Contenido..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            className={clsx(styles.selectionModeBtn, selectionMode && styles.active)}
            onClick={toggleSelectionMode}
            title={selectionMode ? 'Cancelar selección' : 'Seleccionar múltiples'}
          >
            {selectionMode ? <IoCheckboxOutline size={20} /> : <IoSquareOutline size={20} />}
            {selectionMode ? 'Cancelar' : 'Seleccionar'}
          </button>

          <div className={styles.viewToggle}>
            <button 
              onClick={() => setViewMode('list')} 
              className={clsx(styles.toggleButton, viewMode === 'list' && styles.active)}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={clsx(styles.toggleButton, viewMode === 'grid' && styles.active)}
            >
              Grid
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loadingSection}>
            <Loading inline message="Cargando envíos..." />
          </div>
        )}
        {isError && <p className={styles.error}>{error.message}</p>}
        {!isLoading && !isError && (
          <div style={{ position: 'relative' }}>
            {isFetching && (
              <div className={styles.fetchingOverlay}>
                <Loading inline message="Actualizando..." />
              </div>
            )}
            {viewMode === 'list' ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {selectionMode && (
                        <th style={{ width: '50px' }}>
                          <button
                            className={styles.selectAllBtn}
                            onClick={selectAllPayableGuias}
                            title="Seleccionar todas las pagables"
                          >
                            {selectedGuias.length === payableGuiasCount && payableGuiasCount > 0 ? (
                              <IoCheckboxOutline size={20} />
                            ) : (
                              <IoSquareOutline size={20} />
                            )}
                          </button>
                        </th>
                      )}
                      <th></th>
                      <th>N° Guía</th>
                      <th>Estatus</th>
                      <th>Origen</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuias.length > 0 ? (
                      filteredGuias.map(guia => (
                        <GuiaCard 
                          key={guia.idGuia} 
                          guia={guia} 
                          viewMode="list"
                          necesitaFactura={necesitaFactura(guia)}
                          necesitaMSDS={necesitaMSDS(guia)}
                          necesitaNONDG={necesitaNONDG(guia)}
                          sePuedePagar={sePuedePagar(guia)}
                          isUploadingInvoice={uploadingInvoice[guia.idGuia] || false}
                          isUploadingMSDS={uploadingMSDS[guia.idGuia] || false}
                          isUploadingNONDG={uploadingNONDG[guia.idGuia] || false}
                          onCargarFactura={handleCargarFactura}
                          onCargarMSDS={handleCargarMSDS}
                          onCargarNONDG={handleCargarNONDG}
                          openMenuId={openMenuId}
                          setOpenMenuId={setOpenMenuId}
                          calculatedCost={calculatedCosts[guia.idGuia]}
                          isCalculatingCost={calculatingCosts[guia.idGuia]}
                          selectionMode={selectionMode}
                          isSelected={selectedGuias.includes(guia.idGuia)}
                          onToggleSelection={() => toggleGuiaSelection(guia.idGuia, guia)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={selectionMode ? "7" : "6"} className={styles.emptyCell}>
                          <div className={styles.emptyState}>
                            <p className={styles.emptyTitle}>
                              {activeTab === 'activos' 
                                ? 'No tienes guías activas' 
                                : 'No hay historial de pagos'
                              }
                            </p>
                            <p className={styles.emptyDescription}>
                              {activeTab === 'activos'
                                ? 'Las guías pendientes de pago aparecerán aquí'
                                : 'Tus guías pagadas aparecerán en esta sección'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.guidesList}>
                {filteredGuias.length > 0 ? (
                  filteredGuias.map(guia => (
                    <GuiaCard 
                      key={guia.idGuia} 
                      guia={guia} 
                      viewMode="grid"
                      necesitaFactura={necesitaFactura(guia)}
                      necesitaMSDS={necesitaMSDS(guia)}
                      necesitaNONDG={necesitaNONDG(guia)}
                      sePuedePagar={sePuedePagar(guia)}
                      isUploadingInvoice={uploadingInvoice[guia.idGuia] || false}
                      isUploadingMSDS={uploadingMSDS[guia.idGuia] || false}
                      isUploadingNONDG={uploadingNONDG[guia.idGuia] || false}
                      onCargarFactura={handleCargarFactura}
                      onCargarMSDS={handleCargarMSDS}
                      onCargarNONDG={handleCargarNONDG}
                      openMenuId={openMenuId}
                          setOpenMenuId={setOpenMenuId}
                          calculatedCost={calculatedCosts[guia.idGuia]}
                          isCalculatingCost={calculatingCosts[guia.idGuia]}
                          selectionMode={selectionMode}
                          isSelected={selectedGuias.includes(guia.idGuia)}
                          onToggleSelection={() => toggleGuiaSelection(guia.idGuia, guia)}
                        />
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>
                          {activeTab === 'activos' 
                            ? 'No tienes guías activas' 
                            : 'No hay historial de pagos'
                          }
                        </p>
                        <p className={styles.emptyDescription}>
                          {activeTab === 'activos'
                            ? 'Las guías pendientes de pago aparecerán aquí'
                            : 'Tus guías pagadas aparecerán en esta sección'
                          }
                        </p>
                      </div>
                    )}
              </div>
            )}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={!pagination.hasPreviousPage}
          >
            ← Anterior
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p =>
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - currentPage) <= 2
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`ellipsis-${idx}`} className={styles.ellipsis}>…</span>
                ) : (
                  <button
                    key={item}
                    className={clsx(styles.pageNumber, item === currentPage && styles.pageNumberActive)}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!pagination.hasNextPage}
          >
            Siguiente →
          </button>

          <span className={styles.pageInfo}>
            {pagination.totalRecords} envío{pagination.totalRecords !== 1 ? 's' : ''} en total
          </span>
        </div>
      )}

      {selectionMode && selectedGuias.length > 0 && (
        <div className={styles.floatingPayButton}>
          <button onClick={handleMultiplePayment} className={styles.payBtn}>
            <IoCardOutline size={20} />
            Pagar {selectedGuias.length} guía{selectedGuias.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}