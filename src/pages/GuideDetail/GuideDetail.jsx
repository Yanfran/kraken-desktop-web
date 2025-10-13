import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import {
  getGuiaById,
  getGuiaInvoices,
  downloadInvoice,
  downloadAllInvoices,
} from '../../services/guiasService';
import styles from './GuideDetail.module.scss';
import clsx from 'clsx';

// Iconos de react-icons/io5
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoDocumentTextOutline,
  IoReceiptOutline,
  IoCashOutline,
  IoCheckmarkDoneOutline,
} from 'react-icons/io5';

export default function GuideDetail() {
  const { idGuia } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();
  const alert = useCustomAlert();

  const [guiaDetail, setGuiaDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    otrosDetalles: false,
    historialEstatus: false,
  });
  const [isDownloadingInvoices, setIsDownloadingInvoices] = useState(false);

  const loadGuiaDetail = useCallback(async () => {
    if (!idGuia) return;

    try {
      setIsLoading(true);
      const response = await getGuiaById(parseInt(idGuia));
      if (response.success) {
        setGuiaDetail(response.data);
      } else {
        alert.showError('Error al cargar la guía', response.message || 'No se pudieron obtener los detalles.');
      }
    } catch (error) {
      alert.showError('Error de Conexión', 'No se pudieron cargar los detalles de la guía.');
      console.error('Error loading guia detail:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGuia]);

  useEffect(() => {
    console.log('GuideDetail useEffect: Running loadGuiaDetail');
    if (isSignedIn && idGuia) {
      loadGuiaDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGuia, isSignedIn]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Formato de bolívares mejorado
  const formatBolivar = (amount = 0) => {
    return amount.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' Bs.';
  };

  const handlePagar = useCallback(() => {
    if (!guiaDetail) return;
    alert.showConfirm(
      {
        title: 'Proceder al Pago',
        message: `¿Deseas proceder al pago de la guía ${guiaDetail.nGuia}?\n\nMonto: ${formatBolivar(guiaDetail.detalleFactura.total)}`,
        type: 'info',
        confirmText: 'Pagar Ahora',
      },
      () => navigate(`/payment/${guiaDetail.idGuia}`)
    );
  }, [guiaDetail, navigate, alert]);

  // ✅ NUEVA FUNCIÓN: Manejar descarga de facturas (igual que en app móvil)
  const handleVerFactura = useCallback(async () => {
    if (!guiaDetail?.idGuia) {
      alert.showError('Error', 'No se puede obtener información de la guía');
      return;
    }

    try {
      setIsDownloadingInvoices(true);

      // Obtener lista de facturas
      const facturasResponse = await getGuiaInvoices(guiaDetail.idGuia);
      
      if (!facturasResponse.success || !facturasResponse.data) {
        alert.showWarning('Sin facturas', 'No hay facturas disponibles para esta guía');
        return;
      }

      const { facturas: facturasDisponibles } = facturasResponse.data;
      
      if (facturasDisponibles.length === 0) {
        alert.showWarning('Sin facturas', 'No hay facturas cargadas para esta guía');
        return;
      }

      console.log('📄 Facturas encontradas:', facturasDisponibles);

      // Si solo hay una factura, descargarla directamente
      if (facturasDisponibles.length === 1) {
        const factura = facturasDisponibles[0];
        const success = await downloadInvoice(factura.id, factura.nombre);
        
        if (success) {
          alert.showSuccess('Descarga exitosa', `Se inició la descarga de: ${factura.nombre}`);
        } else {
          alert.showError('Error', 'No se pudo descargar la factura');
        }
        return;
      }

      // Si hay múltiples facturas, mostrar opciones
      alert.showConfirm(
        {
          title: 'Facturas disponibles',
          message: `Esta guía tiene ${facturasDisponibles.length} factura(s). ¿Deseas descargar todas?`,
          type: 'info',
          confirmText: 'Descargar todas',
          cancelText: 'Cancelar',
        },
        async () => {
          // Descargar todas las facturas
          try {
            const result = await downloadAllInvoices(guiaDetail.idGuia);
            
            if (result.success) {
              alert.showSuccess('Descarga exitosa', result.message);
            } else {
              alert.showError('Error en descarga', result.message);
            }
          } catch (error) {
            console.error('Error descargando todas las facturas:', error);
            alert.showError('Error', 'No se pudieron descargar las facturas');
          }
        }
      );

    } catch (error) {
      console.error('Error obteniendo facturas:', error);
      alert.showError('Error', 'No se pudieron obtener las facturas de esta guía');
    } finally {
      setIsDownloadingInvoices(false);
    }
  }, [guiaDetail, alert]);

  const puedePagar = () => {
    if (!guiaDetail || guiaDetail.detallePago || guiaDetail.tienePago) return false;
    const fob = guiaDetail.valorFOB || 0;
    const idEstatus = guiaDetail.idEstatus || 0;
    if (fob <= 100) return idEstatus >= 2;
    return idEstatus >= 8;
  };

  // ✅ FUNCIÓN SIMPLIFICADA: Consolidar "Procesado" consecutivos
  const consolidateHistorial = (historial) => {
    if (!historial || historial.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < historial.length; i++) {
      const current = historial[i];
      const currentStatus = current.estatus?.toLowerCase().trim();
      
      // Si es "Procesado"
      if (currentStatus === 'procesado') {
        // Mirar hacia adelante para ver si hay más "Procesado"
        let j = i + 1;
        while (j < historial.length && historial[j].estatus?.toLowerCase().trim() === 'procesado') {
          j++;
        }
        
        // Si encontramos más "Procesado" consecutivos
        if (j > i + 1) {
          // Solo agregar el último "Procesado" del grupo
          result.push({
            ...historial[j - 1],
            estatus: 'Procesado'
          });
          // Saltar todos los "Procesado" que ya procesamos
          i = j - 1;
        } else {
          // Solo hay uno, agregarlo normalmente
          result.push({
            ...current,
            estatus: 'Procesado'
          });
        }
      } else {
        // No es "Procesado", agregar tal cual
        result.push(current);
      }
    }
    
    return result;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando detalles...</p>
      </div>
    );
  }

  if (!guiaDetail) {
    return (
      <div className={styles.errorContainer}>
        <IoAlertCircleOutline size={64} color="#ff6b6b" />
        <h2 className={styles.errorTitle}>Guía no encontrada</h2>
        <p className={styles.errorDescription}>
          No se pudieron cargar los detalles. Intenta de nuevo más tarde.
        </p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  const { 
    prealertado, nGuia, estatus, fecha, origen, contenido, valorFOB, direccionEntrega,
    contieneLiquidos, esFragil, facturaUrl, peso, unidadPeso, medidas,
    historialEstatus, detalleFactura, detallePago 
  } = guiaDetail;

  // ✅ Aplicar consolidación de historial para eliminar "Procesado" duplicados
  const consolidatedHistorial = consolidateHistorial(historialEstatus);

  return (
    <div className={styles.container}>
      <div className={styles.scrollView}>
        
        {/* Alert de Pre-alerta */}
        <div className={clsx(styles.alertContainer, prealertado ? styles.alertSuccess : styles.alertError)}>
          {prealertado ? (
            <IoCheckmarkCircleOutline size={24} style={{color: '#4CAF50'}} />
          ) : (
            <IoCloseCircleOutline size={24} style={{color: '#F44336'}} />
          )}
          <p className={styles.alertText}>
            {prealertado 
              ? 'Pre-alertado - Ahorraste 10% en tu envío' 
              : 'No pre-alertado - Perdiste -10% de descuento'}
          </p>
        </div>

        {/* N° Guía */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>N° Guía</label>
          <p className={styles.sectionValue}>{nGuia}</p>
        </div>

        {/* Estatus y Origen */}
        <div className={styles.row}>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Estatus</label>
            <p className={styles.sectionValue}>{estatus}</p>
            <span className={styles.sectionSubtext}>{fecha}</span>
          </div>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Origen</label>
            <p className={styles.sectionValue}>{origen}</p>
          </div>
        </div>

        {/* Contenido y Valor */}
        <div className={styles.row}>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Contenido</label>
            <p className={styles.sectionValue}>{contenido}</p>
          </div>
          <div className={styles.rowItem}>
            <label className={styles.sectionLabel}>Valor (FOB)</label>
            <p className={styles.sectionValue}>${valorFOB?.toFixed(2)} USD</p>
          </div>
        </div>
        
        {/* Dirección de Entrega */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Dirección de Entrega</label>
          <p className={styles.sectionValue}>{direccionEntrega}</p>
        </div>

        {/* Otros Detalles - Expandible */}
        <div className={styles.expandableHeader} onClick={() => toggleSection('otrosDetalles')}> 
          <h2 className={styles.expandableTitle}>Otros Detalles</h2>
          {expandedSections.otrosDetalles ? (
            <IoChevronUpOutline size={24} />
          ) : (
            <IoChevronDownOutline size={24} />
          )}
        </div>
        {expandedSections.otrosDetalles && (
          <div className={styles.expandableContent}>
            <div className={styles.row}>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Tipo de Contenido</label>
                <p className={styles.sectionValue}>
                  {contieneLiquidos ? "Líquidos" : ""}
                  {esFragil ? (contieneLiquidos ? ", Frágil" : "Frágil") : ""}
                </p>
              </div>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Factura</label>
                <button 
                  onClick={facturaUrl ? handleVerFactura : undefined} 
                  disabled={isDownloadingInvoices || !facturaUrl} 
                  className={styles.linkButton}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <IoDocumentTextOutline size={18} />
                  {facturaUrl ? (isDownloadingInvoices ? 'Descargando...' : 'Ver facturas') : 'Sin factura'}
                </button>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Peso</label>
                <p className={styles.sectionValue}>
                  {peso?.toFixed(2)} ({unidadPeso})
                </p>
              </div>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Medidas</label>
                <p className={styles.sectionValue}>
                  L {medidas?.largo?.toFixed(2)} A {medidas?.ancho?.toFixed(2)} H {medidas?.alto?.toFixed(2)} ({medidas?.unidad})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Estatus - Expandible */}
        <div className={styles.expandableHeader} onClick={() => toggleSection('historialEstatus')}> 
          <h2 className={styles.expandableTitle}>Historial de Estatus</h2>
          {expandedSections.historialEstatus ? (
            <IoChevronUpOutline size={24} />
          ) : (
            <IoChevronDownOutline size={24} />
          )}
        </div>
        {expandedSections.historialEstatus && (
          <div className={styles.expandableContent}>
            {consolidatedHistorial?.map((item, index) => (
              <div key={`${item.estatus}-${index}`} className={styles.historyItem}>
                <IoCheckmarkCircleOutline size={24} color="#28a745" />
                <div className={styles.historyContent}>
                  <p className={styles.historyStatus}>{item.estatus}</p>
                  <span className={styles.historyDate}>{item.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detalle de Factura - TODOS LOS PRECIOS EN BOLÍVARES */}
        {estatus !== "Recibido" && detalleFactura && (
          <div className={styles.facturaSection}>
            <h2 className={styles.facturaTitle}>
              <IoReceiptOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Detalle de Factura
            </h2>
            <div className={styles.facturaTable}>
              <div className={styles.facturaRow}>
                <p className={styles.facturaLabel}>Flete</p>
                <span className={styles.facturaValue}>{formatBolivar(detalleFactura.flete)}</span>
              </div>
              <div className={styles.facturaRow}>
                <p className={styles.facturaLabel}>Seguro</p>
                <span className={styles.facturaValue}>{formatBolivar(detalleFactura.seguro)}</span>
              </div>
              <div className={styles.facturaRow}>
                <p className={styles.facturaLabel}>Promo Prealerta</p>
                <span className={styles.facturaValue}>{formatBolivar(detalleFactura.descuento)}</span>
              </div>
              <div className={clsx(styles.facturaRow, styles.facturaRowBold)}>
                <p className={styles.facturaLabelBold}>SUBTOTAL</p>
                <span className={styles.facturaValueBold}>{formatBolivar(detalleFactura.subtotal)}</span>
              </div>
              <div className={styles.facturaRow}>
                <p className={styles.facturaLabel}>Aduana</p>
                <span className={styles.facturaValue}>{formatBolivar(detalleFactura.aduana)}</span>
              </div>
              <div className={styles.facturaRow}>
                <p className={styles.facturaLabel}>Franqueo Postal</p>
                <span className={styles.facturaValue}>{formatBolivar(detalleFactura.franqueoPostal)}</span>
              </div>
              {detalleFactura.totalAranceles > 0 && (
                <div className={styles.facturaRow}>
                  <p className={styles.facturaLabel}>Aranceles</p>
                  <span className={styles.facturaValue}>{formatBolivar(detalleFactura.totalAranceles)}</span>
                </div>
              )}
              <div className={styles.facturaRow}>
                <p className={styles.facturaLabel}>IVA</p>
                <span className={styles.facturaValue}>{formatBolivar(detalleFactura.iva)}</span>
              </div>
              <div className={clsx(styles.facturaRow, styles.facturaRowTotal)}>
                <p className={styles.facturaTotalLabel}>TOTAL</p>
                <div className={styles.priceContainer}>
                  <span className={styles.facturaTotalValue}>{formatBolivar(detalleFactura.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón de Pago */}
        {puedePagar() && (
          <div className={styles.paymentButtonContainer}>
            <button onClick={handlePagar} className={styles.payButton}>
              <IoCashOutline size={20} style={{ marginRight: 8 }} />
              Pagar Guía
            </button>
          </div>
        )}

        {/* Detalle de Pago - PRECIOS EN BOLÍVARES */}
        {detallePago && (
          <div className={styles.pagoSection}>
            <h2 className={styles.pagoTitle}>
              <IoCheckmarkDoneOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle', color: '#28a745' }} />
              Detalle de Pago
            </h2>
            <div className={styles.pagoTable}>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Método de Pago</p>
                <span className={styles.pagoValue}>{detallePago.metodoPago}</span>
              </div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Id de Transacción</p>
                <span className={styles.pagoValue}>{detallePago.idTransaccion}</span>
              </div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Monto</p>
                <div className={styles.priceContainer}>
                  <span className={styles.pagoValue}>{formatBolivar(detallePago.monto)}</span>
                </div>
              </div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Fecha</p>
                <span className={styles.pagoValue}>{detallePago.fecha}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}