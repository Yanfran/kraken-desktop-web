
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

// Componente de placeholder para íconos
const Icon = ({ name }) => <span className={styles.iconPlaceholder}>{`[${name}]`}</span>;

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
  }, [idGuia, alert.showError]);

  useEffect(() => {
    if (isSignedIn) {
      loadGuiaDetail();
    }
  }, [idGuia, isSignedIn, loadGuiaDetail]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const formatCurrency = (amount = 0) => `USD ${amount.toFixed(2)}`;
  const formatBolivar = (amount = 0) =>
    amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs.';

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

  const handleVerFactura = useCallback(async () => {
    if (!guiaDetail?.idGuia) return;
    try {
      setIsDownloadingInvoices(true);
      const response = await getGuiaInvoices(guiaDetail.idGuia);
      if (response.success && response.data.facturas?.length > 0) {
        if (response.data.facturas.length === 1) {
          const f = response.data.facturas[0];
          await downloadInvoice(f.id, f.nombre);
          alert.showSuccess("Descarga iniciada.");
        } else {
          alert.showConfirm(
            {
              title: 'Facturas disponibles',
              message: `Esta guía tiene ${response.data.facturas.length} facturas. ¿Qué deseas hacer?`,
              confirmText: 'Descargar todas',
            },
            () => downloadAllInvoices(guiaDetail.idGuia).then(() => alert.showSuccess("Descarga de todas las facturas iniciada.")),
          );
        }
      } else {
        alert.showWarning("Sin facturas", "No hay facturas disponibles para esta guía.");
      }
    } catch (e) {
      alert.showError("Error", "No se pudieron obtener las facturas.");
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

  if (isLoading) {
    return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Cargando detalles...</p></div>;
  }

  if (!guiaDetail) {
    return (
      <div className={styles.errorContainer}>
        <Icon name="alert-circle" />
        <h2 className={styles.errorTitle}>Guía no encontrada</h2>
        <p className={styles.errorDescription}>No se pudieron cargar los detalles. Intenta de nuevo más tarde.</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    );
  }

  const { 
    prealertado, nGuia, estatus, fecha, origen, contenido, valorFOB, direccionEntrega,
    contieneLiquidos, esFragil, facturaUrl, peso, unidadPeso, medidas,
    historialEstatus, detalleFactura, detallePago 
  } = guiaDetail;

  return (
    <div className={styles.container}>
      <div className={styles.scrollView}>
        <div className={clsx(styles.alertContainer, prealertado ? styles.alertSuccess : styles.alertError)}>
          <Icon name={prealertado ? "checkmark-circle" : "close-circle"} />
          <p className={styles.alertText}>{prealertado ? 'Pre-alertado - Ahorraste 10% en tu envío' : 'No pre-alertado - Perdiste -10% de descuento'}</p>
        </div>

        <div className={styles.section}><label className={styles.sectionLabel}>N° Guía</label><p className={styles.sectionValue}>{nGuia}</p></div>

        <div className={styles.row}>
          <div className={styles.rowItem}><label className={styles.sectionLabel}>Estatus</label><p className={styles.sectionValue}>{estatus}</p><span className={styles.sectionSubtext}>{fecha}</span></div>
          <div className={styles.rowItem}><label className={styles.sectionLabel}>Origen</label><p className={styles.sectionValue}>{origen}</p></div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowItem}><label className={styles.sectionLabel}>Contenido</label><p className={styles.sectionValue}>{contenido}</p></div>
          <div className={styles.rowItem}><label className={styles.sectionLabel}>Valor (FOB)</label><p className={styles.sectionValue}>{formatCurrency(valorFOB)}</p></div>
        </div>
        
        <div className={styles.section}><label className={styles.sectionLabel}>Dirección de Entrega</label><p className={styles.sectionValue}>{direccionEntrega}</p></div>

        <div className={styles.expandableHeader} onClick={() => toggleSection('otrosDetalles')}> 
          <h2 className={styles.expandableTitle}>Otros Detalles</h2><Icon name={expandedSections.otrosDetalles ? "chevron-up" : "chevron-down"} />
        </div>
        {expandedSections.otrosDetalles && (
          <div className={styles.expandableContent}>
            <div className={styles.row}>
              <div className={styles.rowItem}><label className={styles.sectionLabel}>Tipo de Contenido</label><p className={styles.sectionValue}>{contieneLiquidos ? "Líquidos" : ""}{esFragil ? (contieneLiquidos ? ", Frágil" : "Frágil") : ""}</p></div>
              <div className={styles.rowItem}><label className={styles.sectionLabel}>Factura</label><button onClick={facturaUrl ? handleVerFactura : undefined} disabled={isDownloadingInvoices || !facturaUrl} className={styles.linkButton}>{facturaUrl ? 'Ver' : 'Sin factura'}</button></div>
            </div>
            <div className={styles.row}>
              <div className={styles.rowItem}><label className={styles.sectionLabel}>Peso</label><p className={styles.sectionValue}>{peso?.toFixed(2)} ({unidadPeso})</p></div>
              <div className={styles.rowItem}><label className={styles.sectionLabel}>Medidas</label><p className={styles.sectionValue}>L {medidas?.largo?.toFixed(2)} A {medidas?.ancho?.toFixed(2)} H {medidas?.alto?.toFixed(2)} ({medidas?.unidad})</p></div>
            </div>
          </div>
        )}

        <div className={styles.expandableHeader} onClick={() => toggleSection('historialEstatus')}> 
          <h2 className={styles.expandableTitle}>Historial de Estatus</h2><Icon name={expandedSections.historialEstatus ? "chevron-up" : "chevron-down"} />
        </div>
        {expandedSections.historialEstatus && (
          <div className={styles.expandableContent}>
            {historialEstatus.map((item, index) => (
              <div key={`${item.estatus}-${index}`} className={styles.historyItem}>
                <Icon name="checkmark-circle" />
                <div className={styles.historyContent}><p className={styles.historyStatus}>{item.estatus}</p><span className={styles.historyDate}>{item.fecha}</span></div>
              </div>
            ))}
          </div>
        )}

        {estatus !== "Recibido" && detalleFactura && (
          <div className={styles.facturaSection}>
            <h2 className={styles.facturaTitle}>Detalle de Factura</h2>
            <div className={styles.facturaTable}>
              <div className={styles.facturaRow}><p className={styles.facturaLabel}>Flete</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.fleteUSD)}</span></div>
              <div className={styles.facturaRow}><p className={styles.facturaLabel}>Seguro</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.seguroUSD)}</span></div>
              <div className={styles.facturaRow}><p className={styles.facturaLabel}>Promo Prealerta</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.descuentoUSD)}</span></div>
              <div className={clsx(styles.facturaRow, styles.facturaRowBold)}><p className={styles.facturaLabelBold}>SUBTOTAL</p><span className={styles.facturaValueBoldUSD}>{formatCurrency(detalleFactura.subtotalUSD)}</span></div>
              <div className={styles.facturaRow}><p className={styles.facturaLabel}>Aduana</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.aduanaUSD)}</span></div>
              <div className={styles.facturaRow}><p className={styles.facturaLabel}>Franqueo Postal</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.franqueoPostalUSD)}</span></div>
              {detalleFactura.totalAranceles > 0 && <div className={styles.facturaRow}><p className={styles.facturaLabel}>Aranceles</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.totalAranceles)}</span></div>}
              <div className={styles.facturaRow}><p className={styles.facturaLabel}>IVA</p><span className={styles.facturaValueUSD}>{formatCurrency(detalleFactura.ivaUSD)}</span></div>
              <div className={clsx(styles.facturaRow, styles.facturaRowTotal)}>
                <p className={styles.facturaTotalLabel}>TOTAL</p>
                <div className={styles.priceContainer}>
                  <span className={styles.facturaTotalValueUSD}>{formatCurrency(detalleFactura.totalUSD)}</span>
                  <span className={styles.facturaTotalBsReference}>{formatBolivar(detalleFactura.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {puedePagar() && (
          <div className={styles.paymentButtonContainer}>
            <button onClick={handlePagar} className={styles.payButton}>Pagar Guía</button>
          </div>
        )}

        {detallePago && (
          <div className={styles.pagoSection}>
            <h2 className={styles.pagoTitle}>Detalle de Pago</h2>
            <div className={styles.pagoTable}>
              <div className={styles.pagoRow}><p className={styles.pagoLabel}>Método de Pago</p><span className={styles.pagoValue}>{detallePago.metodoPago}</span></div>
              <div className={styles.pagoRow}><p className={styles.pagoLabel}>Id de Transacción</p><span className={styles.pagoValue}>{detallePago.idTransaccion}</span></div>
              <div className={styles.pagoRow}>
                <p className={styles.pagoLabel}>Monto</p>
                <div className={styles.priceContainer}>
                  <span className={styles.pagoValueUSD}>{formatCurrency(detallePago.montoUSD)}</span>
                  <span className={styles.pagoBsReference}>({formatBolivar(detallePago.monto)})</span>
                </div>
              </div>
              <div className={styles.pagoRow}><p className={styles.pagoLabel}>Fecha</p><span className={styles.pagoValue}>{detallePago.fecha}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
