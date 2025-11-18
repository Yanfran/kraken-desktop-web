// src/pages/MyGuides/MyGuides.jsx - CON SELECCIÓN MÚLTIPLE

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // 🆕 AGREGAR
import { fetchGuias, uploadGuiaInvoice, calculateSingleGuiaPrice } from '../../services/guiasService';
import styles from './Guides.module.scss';
import GuiaCard from './GuiaCard';
import clsx from 'clsx';
import Loading from '../../components/common/Loading/Loading';
import toast from 'react-hot-toast'; // 🆕 AGREGAR (si no lo tienes)

// 🆕 AGREGAR ICONOS
import { IoCheckboxOutline, IoSquareOutline, IoCardOutline } from 'react-icons/io5';

export default function Guides() {
  const navigate = useNavigate(); // 🆕 AGREGAR
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('activos');
  
  // Estados para carga de factura
  const [uploadingInvoice, setUploadingInvoice] = useState({});
  const [selectedGuiaForUpload, setSelectedGuiaForUpload] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const fileInputRef = useRef(null);

  // Estado para costos calculados
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [calculatingCosts, setCalculatingCosts] = useState({});

  // 🆕 ESTADOS PARA SELECCIÓN MÚLTIPLE
  const [selectedGuias, setSelectedGuias] = useState([]); // Array de IDs
  const [selectionMode, setSelectionMode] = useState(false); // Modo selección activo

  const { data: guias = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['guias'],
    queryFn: fetchGuias,
  });

  // Calcular costo para una guía (igual que antes)
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

  // 🆕 FUNCIONES DE SELECCIÓN MÚLTIPLE
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedGuias([]); // Limpiar selección al activar
    }
  };

  const toggleGuiaSelection = (guiaId, guia) => {
    // Solo permitir seleccionar guías que se pueden pagar
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
      setSelectedGuias([]); // Deseleccionar todas
    } else {
      setSelectedGuias(payableGuias); // Seleccionar todas las pagables
    }
  };

  // 🆕 NAVEGAR A PAGO MÚLTIPLE
  const handleMultiplePayment = () => {
    if (selectedGuias.length === 0) {
      toast.error('Selecciona al menos una guía para pagar');
      return;
    }

    if (selectedGuias.length === 1) {
      // Pago individual
      navigate(`/payment/${selectedGuias[0]}`);
    } else {
      // Pago múltiple
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

  // Iniciar carga de factura
  const handleCargarFactura = (guia, e) => {
    if (e) e.stopPropagation();
    
    if (!guia) {
      alert('No se puede cargar factura sin seleccionar una guía');
      return;
    }

    setSelectedGuiaForUpload(guia);
    setOpenMenuId(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Procesar archivo seleccionado
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (!selectedGuiaForUpload) {
      alert('No hay guía seleccionada');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. El tamaño máximo es 5MB');
      event.target.value = '';
      return;
    }

    const isValidType = file.type.includes('pdf') || 
                       file.type.includes('image') ||
                       /\.(pdf|jpg|jpeg|png|gif)$/i.test(file.name);

    if (!isValidType) {
      alert('Tipo de archivo no válido. Solo se permiten PDF o imágenes (JPG, PNG, GIF)');
      event.target.value = '';
      return;
    }

    const guiaId = selectedGuiaForUpload.idGuia;
    setUploadingInvoice(prev => ({ ...prev, [guiaId]: true }));

    try {
      const base64String = await fileToBase64(file);
      
      if (!base64String || !base64String.startsWith('data:')) {
        throw new Error('Base64 inválido');
      }
      
      const uploadResult = await uploadGuiaInvoice(guiaId, file);
      
      if (uploadResult.success) {
        alert(`✅ Factura cargada exitosamente\n\nLa factura "${file.name}" se ha cargado correctamente para la guía ${selectedGuiaForUpload.nGuia || guiaId}`);
        refetch();
      } else {
        alert(`❌ Error al cargar factura\n\n${uploadResult.message || 'No se pudo cargar la factura. Inténtalo nuevamente.'}`);
      }
    } catch (error) {
      console.error('❌ Error cargando factura:', error);
      alert('❌ Error al cargar factura\n\nNo se pudo cargar la factura. Inténtalo nuevamente.');
    } finally {
      setUploadingInvoice(prev => ({ ...prev, [guiaId]: false }));
      setSelectedGuiaForUpload(null);
      event.target.value = '';
    }
  };

  // Filtrado por tabs y búsqueda
  const filteredGuias = useMemo(() => {
    let result = guias;

    if (activeTab === 'activos') {
      result = result.filter(guia => !guia.tienePago && !guia.estaPagado);
    } else if (activeTab === 'historial') {
      result = result.filter(guia => guia.tienePago || guia.estaPagado);
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

  // 🆕 CONTADOR DE GUÍAS PAGABLES
  const payableGuiasCount = useMemo(() => {
    return filteredGuias.filter(guia => sePuedePagar(guia)).length;
  }, [filteredGuias]);

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,image/*,application/pdf"
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

          {/* 🆕 BOTÓN MODO SELECCIÓN */}
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
                      {/* 🆕 COLUMNA CHECKBOX */}
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
                      {/* <th>Costo del envío</th> */}
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
                          sePuedePagar={sePuedePagar(guia)}
                          isUploadingInvoice={uploadingInvoice[guia.idGuia] || false}
                          onCargarFactura={handleCargarFactura}
                          openMenuId={openMenuId}
                          setOpenMenuId={setOpenMenuId}
                          calculatedCost={calculatedCosts[guia.idGuia]}
                          isCalculatingCost={calculatingCosts[guia.idGuia]}
                          // 🆕 PROPS PARA SELECCIÓN
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
                      sePuedePagar={sePuedePagar(guia)}
                      isUploadingInvoice={uploadingInvoice[guia.idGuia] || false}
                      onCargarFactura={handleCargarFactura}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      calculatedCost={calculatedCosts[guia.idGuia]}
                      isCalculatingCost={calculatingCosts[guia.idGuia]}
                      // 🆕 PROPS PARA SELECCIÓN
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

      {/* 🆕 BOTÓN FLOTANTE PARA PAGAR SELECCIONADAS */}
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