// src/pages/MyGuides/MyGuides.jsx - VERSIÓN CORREGIDA

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: queryResult, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['guias', currentPage, pageSize, activeTab, debouncedSearch],
    queryFn: () => fetchGuias({ page: currentPage, pageSize, tab: activeTab, search: debouncedSearch }),
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
      toast.error(t('guides.not_available_for_payment'));
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
      toast.error(t('guides.select_at_least_one'));
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
      toast.error(t('guides.no_guide_selected'));
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
      toast.error(t('guides.no_guide_msds'));
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
      toast.error(t('guides.no_guide_nondg'));
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
      toast.error(t('guides.no_valid_guide'));
      return;
    }

    // Validar tipo
    if (file.type !== 'application/pdf') {
      toast.error(t('guides.pdf_only'));
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('guides.file_too_large'));
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
        toast.success(response.message || t('guides.doc_uploaded'));
        await refetch();
      } else {
        toast.error(response.message || t('guides.doc_upload_error'));
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error(t('guides.doc_upload_error'));
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

  // Resetear página al cambiar tab o búsqueda
  React.useEffect(() => { setCurrentPage(1); }, [debouncedSearch, activeTab]);

  // El filtro lo hace el backend
  const filteredGuias = guias;

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
          <h1>{t('guides.list_title')}</h1>
          
          <div className={styles.tabsContainer}>
            <button
              className={clsx(styles.tabButton, activeTab === 'activos' && styles.tabButtonActive)}
              onClick={() => setActiveTab('activos')}
            >
              {t('guides.tab_active')}
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'historial' && styles.tabButtonActive)}
              onClick={() => setActiveTab('historial')}
            >
              {t('guides.tab_history')}
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder={t('guides.search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            className={clsx(styles.selectionModeBtn, selectionMode && styles.active)}
            onClick={toggleSelectionMode}
            title={selectionMode ? t('guides.cancel_selection') : t('guides.select_multiple')}
          >
            {selectionMode ? <IoCheckboxOutline size={20} /> : <IoSquareOutline size={20} />}
            {selectionMode ? t('common.cancel') : t('guides.select')}
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
            <Loading inline message={t('guides.loading')} />
          </div>
        )}
        {isError && <p className={styles.error}>{error.message}</p>}
        {!isLoading && !isError && (
          <div style={{ position: 'relative' }}>
            {isFetching && (
              <div className={styles.fetchingOverlay}>
                <Loading inline message={t('common.refreshing')} />
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
                      <th>{t('guides.guide_number')}</th>
                      <th>{t('guides.status')}</th>
                      <th>{t('guides.origin')}</th>
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
                              {activeTab === 'activos' ? t('guides.no_active') : t('guides.no_history')}
                            </p>
                            <p className={styles.emptyDescription}>
                              {activeTab === 'activos' ? t('guides.no_active_desc') : t('guides.no_history_desc')}
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
            {t('guides.prev')}
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
            {t('guides.next')}
          </button>

          <span className={styles.pageInfo}>
            {pagination.totalRecords} {pagination.totalRecords !== 1 ? t('guides.total_records_plural') : t('guides.total_records')}
          </span>
        </div>
      )}

      {selectionMode && selectedGuias.length > 0 && (
        <div className={styles.floatingPayButton}>
          <button onClick={handleMultiplePayment} className={styles.payBtn}>
            <IoCardOutline size={20} />
            {selectedGuias.length > 1 ? t('guides.pay_selected_plural').replace('{{count}}', selectedGuias.length) : t('guides.pay_selected').replace('{{count}}', selectedGuias.length)}
          </button>
        </div>
      )}
    </div>
  );
}