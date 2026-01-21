// src/pages/MyGuides/MyGuides.jsx - CON MSDS Y NONDG

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  fetchGuias, 
  uploadGuiaInvoice, 
  uploadGuiaMSDS,      // 🆕 IMPORTAR
  uploadGuiaNONDG,     // 🆕 IMPORTAR
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
  const [uploadingMSDS, setUploadingMSDS] = useState({});        // 🆕 ESTADO MSDS
  const [uploadingNONDG, setUploadingNONDG] = useState({});      // 🆕 ESTADO NONDG
  
  const [selectedGuiaForUpload, setSelectedGuiaForUpload] = useState(null);
  const [uploadType, setUploadType] = useState(null);  // 🆕 'invoice' | 'msds' | 'nondg'
  
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Refs para cada tipo de documento
  const fileInputRef = useRef(null);
  const msdsInputRef = useRef(null);   // 🆕 REF MSDS
  const nondgInputRef = useRef(null);  // 🆕 REF NONDG

  // Estado para costos calculados
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [calculatingCosts, setCalculatingCosts] = useState({});

  // Estados para selección múltiple
  const [selectedGuias, setSelectedGuias] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const { data: guias = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['guias'],
    queryFn: fetchGuias,
  });

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

  // Verificar si necesita factura
  const necesitaFactura = (guia) => {
    if (!guia) return false;
    const estatus = guia.estatus?.toLowerCase();
    const idEstatusActual = guia.idEstatusActual || 0;
    return estatus === 'pendiente de factura' || idEstatusActual === 3;
  };

  // 🆕 Verificar si necesita MSDS
  const necesitaMSDS = (guia) => {
    if (!guia) return false;
    return guia.msds === true;
  };

  // 🆕 Verificar si necesita NONDG
  const necesitaNONDG = (guia) => {
    if (!guia) return false;
    return guia.nondg === true;
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
      return idEstatusActual >= 8;
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

  // Convertir File a Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (!result || typeof result !== 'string' || result.length < 50) {
          reject(new Error('Error al leer el archivo'));
          return;
        }
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // ============================================
  // 🆕 HANDLERS PARA CARGAR DOCUMENTOS
  // ============================================
  
  // Iniciar carga de factura
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

  // 🆕 Iniciar carga de MSDS
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

  // 🆕 Iniciar carga de NONDG
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
  // 🆕 PROCESAR ARCHIVOS SELECCIONADOS
  // ============================================

  // Handler genérico para archivos
  // ============================================
// 🔧 PROCESAR ARCHIVOS SELECCIONADOS (CORREGIDO)
// ============================================

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que haya una guía seleccionada
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
      
      // ✅ CORRECCIÓN: Setear estado correctamente (como objeto)
      if (uploadType === 'msds') {
        setUploadingMSDS(prev => ({ ...prev, [guiaId]: true }));
        response = await uploadGuiaMSDS(guiaId, file);
      } else if (uploadType === 'nondg') {
        setUploadingNONDG(prev => ({ ...prev, [guiaId]: true }));
        response = await uploadGuiaNONDG(guiaId, file);
      } else {
        // invoice
        setUploadingInvoice(prev => ({ ...prev, [guiaId]: true }));
        response = await uploadGuiaInvoice(guiaId, file);
      }

      if (response.success) {
        toast.success(response.message || 'Documento subido exitosamente');
        // Recargar guías
        refetch();
      } else {
        toast.error(response.message || 'Error al subir documento');
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error('Error al subir documento');
    } finally {
      // ✅ CORRECCIÓN: Limpiar estado correctamente
      if (uploadType === 'msds') {
        setUploadingMSDS(prev => ({ ...prev, [guiaId]: false }));
      } else if (uploadType === 'nondg') {
        setUploadingNONDG(prev => ({ ...prev, [guiaId]: false }));
      } else {
        setUploadingInvoice(prev => ({ ...prev, [guiaId]: false }));
      }
      
      // Limpiar selección
      setSelectedGuiaForUpload(null);
      setUploadType(null);
      
      // Limpiar inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (msdsInputRef.current) msdsInputRef.current.value = '';
      if (nondgInputRef.current) nondgInputRef.current.value = '';
    }
  };

  // Filtrado por tabs y búsqueda
  const filteredGuias = useMemo(() => {
    let result = guias;

    if (activeTab === 'activos') {
      const estatusHistorial = ['entregado', 'completado'];
      result = result.filter(guia => {
        const estatus = guia.estatus?.toLowerCase();
        return !estatusHistorial.includes(estatus);
      });
    } else if (activeTab === 'historial') {
      const estatusHistorial = ['entregado'];
      result = result.filter(guia => {
        const estatus = guia.estatus?.toLowerCase();
        return estatusHistorial.includes(estatus);
      });
    }

    if (searchQuery) {
      result = result.filter(guia =>
        guia.nGuia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guia.tracking?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guia.contenido?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [guias, searchQuery, activeTab]);

  const payableGuiasCount = useMemo(() => {
    return filteredGuias.filter(guia => sePuedePagar(guia)).length;
  }, [filteredGuias]);

  return (
    <div className={styles.container}>
      {/* 🆕 INPUTS PARA ARCHIVOS (INVISIBLES) */}
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
        {isLoading && <Loading />}
        {isError && <p className={styles.error}>{error.message}</p>}
        {!isLoading && !isError && (
          <>
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
                          necesitaMSDS={necesitaMSDS(guia)}           // 🆕 PROP
                          necesitaNONDG={necesitaNONDG(guia)}         // 🆕 PROP
                          sePuedePagar={sePuedePagar(guia)}
                          isUploadingInvoice={uploadingInvoice[guia.idGuia] || false}
                          isUploadingMSDS={uploadingMSDS[guia.idGuia] || false}    // 🆕 PROP
                          isUploadingNONDG={uploadingNONDG[guia.idGuia] || false}  // 🆕 PROP
                          onCargarFactura={handleCargarFactura}
                          onCargarMSDS={handleCargarMSDS}            // 🆕 HANDLER
                          onCargarNONDG={handleCargarNONDG}          // 🆕 HANDLER
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
                      necesitaMSDS={necesitaMSDS(guia)}             // 🆕 PROP
                      necesitaNONDG={necesitaNONDG(guia)}           // 🆕 PROP
                      sePuedePagar={sePuedePagar(guia)}
                      isUploadingInvoice={uploadingInvoice[guia.idGuia] || false}
                      isUploadingMSDS={uploadingMSDS[guia.idGuia] || false}      // 🆕 PROP
                      isUploadingNONDG={uploadingNONDG[guia.idGuia] || false}    // 🆕 PROP
                      onCargarFactura={handleCargarFactura}
                      onCargarMSDS={handleCargarMSDS}              // 🆕 HANDLER
                      onCargarNONDG={handleCargarNONDG}            // 🆕 HANDLER
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
          </>
        )}
      </div>

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