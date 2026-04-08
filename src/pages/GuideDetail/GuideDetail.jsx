import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import {
  getGuiaById,
  getGuiaInvoices,
  downloadInvoice,
  downloadAllInvoices,
  getFiscalInvoices,
} from '../../services/guiasService';
import styles from './GuideDetail.module.scss';
import clsx from 'clsx';
import CustomAlert from '../../components/common/CustomAlert/CustomAlert';

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
  IoCloudDownloadOutline, // ← NUEVO
} from 'react-icons/io5';

export default function GuideDetail() {
  const { idGuia } = useParams();
  const navigate   = useNavigate();
  const { user, isSignedIn } = useAuth();
  const alert = useCustomAlert();

  const [guiaDetail, setGuiaDetail]                       = useState(null);
  const [isLoading, setIsLoading]                         = useState(true);
  const [expandedSections, setExpandedSections]           = useState({
    otrosDetalles   : false,
    historialEstatus: false,
  });
  const [isDownloadingInvoices, setIsDownloadingInvoices] = useState(false);

  // ── Facturas fiscales HKA ─────────────────────────────────────────────
  const [fiscalInvoices,      setFiscalInvoices]      = useState([]);
  const [isLoadingFiscal,     setIsLoadingFiscal]     = useState(false);
  const [openingPdfId,        setOpeningPdfId]        = useState(null);
  const [downloadingPdfId,    setDownloadingPdfId]    = useState(null);
  const [isDownloadingComercial, setIsDownloadingComercial] = useState(false);
  // ─────────────────────────────────────────────────────────────────────

  const loadGuiaDetail = useCallback(async () => {
    if (!idGuia) return;
    try {
      setIsLoading(true);
      const response = await getGuiaById(parseInt(idGuia));

      if (response.success) {
        setGuiaDetail(response.data);

        // Siempre intenta cargar facturas fiscales HKA (no bloqueante)
        setIsLoadingFiscal(true);
        getFiscalInvoices(parseInt(idGuia))
          .then((res) => {
            if (res.success && res.data?.facturas?.length > 0) {
              setFiscalInvoices(res.data.facturas);
            }
          })
          .catch(() => { /* silencioso */ })
          .finally(() => setIsLoadingFiscal(false));

      } else {
        alert.showError(
          'Error al cargar la guía',
          response.message || 'No se pudieron obtener los detalles.'
        );
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
    if (isSignedIn && idGuia) {
      loadGuiaDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGuia, isSignedIn]);

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const formatBolivar = (amount = 0) =>
    amount.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' Bs.';

  // ── Pagar ─────────────────────────────────────────────────────────────
  const handlePagar = useCallback(() => {
    if (!guiaDetail) return;

    const totalDetail = guiaDetail.detalleFactura.detalles.find(
      (d) => d.categoria === 'TOTAL_BS'
    );
    const montoPagar      = totalDetail ? totalDetail.montoBs : 0;
    const montoFormateado = montoPagar.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' Bs.';

    alert.showConfirm(
      {
        title      : 'Proceder al Pago',
        message    : `¿Deseas proceder al pago de la guía ${guiaDetail.nGuia}?\n\nMonto: ${montoFormateado}`,
        type       : 'info',
        confirmText: 'Pagar Ahora',
      },
      () => navigate(`/payment/${guiaDetail.idGuia}`)
    );
  }, [guiaDetail, navigate, alert]);

  // ── Ver factura comercial (abre visor / confirma si hay varias) ───────
  const handleVerFactura = useCallback(async () => {
    if (!guiaDetail?.idGuia) {
      alert.showError('Error', 'No se puede obtener información de la guía');
      return;
    }
    try {
      setIsDownloadingInvoices(true);
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

      alert.showConfirm(
        {
          title      : 'Facturas disponibles',
          message    : `Esta guía tiene ${facturasDisponibles.length} factura(s). ¿Deseas descargar todas?`,
          type       : 'info',
          confirmText: 'Descargar todas',
          cancelText : 'Cancelar',
        },
        async () => {
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

  // ── Descargar factura comercial directamente (sin visor) ──────────────
  const handleDescargarFacturaComercial = useCallback(async () => {
    if (!guiaDetail?.idGuia) return;

    setIsDownloadingComercial(true);
    try {
      const facturasResponse = await getGuiaInvoices(guiaDetail.idGuia);

      if (!facturasResponse.success || !facturasResponse.data?.facturas?.length) {
        alert.showWarning('Sin facturas', 'No hay facturas disponibles para descargar.');
        return;
      }

      const { facturas } = facturasResponse.data;

      if (facturas.length === 1) {
        const success = await downloadInvoice(facturas[0].id, facturas[0].nombre);
        if (!success) alert.showError('Error', 'No se pudo descargar la factura.');
        return;
      }

      const result = await downloadAllInvoices(guiaDetail.idGuia);
      if (result.success) {
        alert.showSuccess('Descarga exitosa', result.message);
      } else {
        alert.showError('Error', result.message);
      }
    } catch {
      alert.showError('Error', 'No se pudo descargar la factura.');
    } finally {
      setIsDownloadingComercial(false);
    }
  }, [guiaDetail, alert]);

  // ── Ver PDF fiscal en nueva pestaña ───────────────────────────────────
  const handleVerFiscalInvoice = useCallback(
    async (factura) => {
      if (!factura.pdfBase64) {
        alert.showWarning('PDF no disponible', 'No se pudo obtener el PDF en este momento.');
        return;
      }
      setOpeningPdfId(factura.numeroDocumento);
      try {
        const base64Content = factura.pdfBase64.split(',')[1] ?? factura.pdfBase64;
        const byteChars     = atob(base64Content);
        const byteNums      = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob    = new Blob([byteNums], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      } catch {
        alert.showError('Error', 'No se pudo abrir el PDF. Intenta de nuevo.');
      } finally {
        setOpeningPdfId(null);
      }
    },
    [alert]
  );

  // ── Descargar PDF fiscal ──────────────────────────────────────────────
  const handleDescargarFiscalInvoice = useCallback(
    async (factura) => {
      if (!factura.pdfBase64) return;
      setDownloadingPdfId(factura.numeroDocumento);
      try {
        const base64Content = factura.pdfBase64.split(',')[1] ?? factura.pdfBase64;
        const byteChars     = atob(base64Content);
        const byteNums      = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteNums], { type: 'application/pdf' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `Factura_${factura.numeroDocumento}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        alert.showError('Error', 'No se pudo descargar el PDF. Intenta de nuevo.');
      } finally {
        setDownloadingPdfId(null);
      }
    },
    [alert]
  );
  // ─────────────────────────────────────────────────────────────────────

  const puedePagar = () => {
    if (!guiaDetail || guiaDetail.detallePago || guiaDetail.tienePago) return false;
    const fob       = guiaDetail.valorFOB  || 0;
    const idEstatus = guiaDetail.idEstatus || 0;
    if (fob <= 100) return idEstatus >= 2;
    return idEstatus >= 8;
  };

  const consolidateHistorial = (historial) => {
    if (!historial || historial.length === 0) return [];
    const result = [];
    for (let i = 0; i < historial.length; i++) {
      const current       = historial[i];
      const currentStatus = current.estatus?.toLowerCase().trim();
      if (currentStatus === 'procesado') {
        let j = i + 1;
        while (
          j < historial.length &&
          historial[j].estatus?.toLowerCase().trim() === 'procesado'
        ) { j++; }
        if (j > i + 1) {
          result.push({ ...historial[j - 1], estatus: 'Procesado' });
          i = j - 1;
        } else {
          result.push({ ...current, estatus: 'Procesado' });
        }
      } else {
        result.push(current);
      }
    }
    return result;
  };

  // ── Guards ────────────────────────────────────────────────────────────
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
    prealertado, nGuia, estatus, fecha, origen, contenido, valorFOB,
    direccionEntrega, contieneLiquidos, esFragil, facturaUrl, peso,
    unidadPeso, medidas, historialEstatus, detalleFactura, detallePago,
  } = guiaDetail;

  const consolidatedHistorial = consolidateHistorial(historialEstatus);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <CustomAlert {...alert.alertProps} />
      <div className={styles.scrollView}>

        {/* Banner prealerta */}
        <div className={clsx(styles.alertContainer, prealertado ? styles.alertSuccess : styles.alertError)}>
          {prealertado
            ? <IoCheckmarkCircleOutline size={24} style={{ color: '#4CAF50' }} />
            : <IoCloseCircleOutline    size={24} style={{ color: '#F44336' }} />}
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

        {/* Dirección */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Dirección de Entrega</label>
          <p className={styles.sectionValue}>{direccionEntrega}</p>
        </div>

        {/* Otros Detalles */}
        <div className={styles.expandableHeader} onClick={() => toggleSection('otrosDetalles')}>
          <h2 className={styles.expandableTitle}>Otros Detalles</h2>
          {expandedSections.otrosDetalles
            ? <IoChevronUpOutline size={24} />
            : <IoChevronDownOutline size={24} />}
        </div>

        {expandedSections.otrosDetalles && (
          <div className={styles.expandableContent}>
            <div className={styles.row}>

              {/* Tipo de Contenido */}
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Tipo de Contenido</label>
                <p className={styles.sectionValue}>
                  {contieneLiquidos ? 'Líquidos' : ''}
                  {esFragil ? (contieneLiquidos ? ', Frágil' : 'Frágil') : ''}
                </p>
              </div>

              {/* Factura */}
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Factura</label>

                {/* 1. Factura comercial — Ver + Descargar */}
                {facturaUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <button
                      onClick={handleVerFactura}
                      disabled={isDownloadingInvoices}
                      className={styles.linkButton}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <IoDocumentTextOutline size={18} />
                      {isDownloadingInvoices ? 'Cargando...' : 'Ver factura'}
                    </button>

                    <button
                      onClick={handleDescargarFacturaComercial}
                      disabled={isDownloadingComercial}
                      className={styles.linkButton}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Descargar factura"
                    >
                      <IoCloudDownloadOutline size={18} />
                      {isDownloadingComercial ? 'Descargando…' : 'Descargar'}
                    </button>
                  </div>
                )}

                {/* 2. Cargando fiscal */}
                {isLoadingFiscal && (
                  <span style={{ fontSize: '12px', color: '#757575' }}>
                    Cargando factura fiscal…
                  </span>
                )}

                {/* 3. Facturas fiscales HKA — Ver + Descargar */}
                {!isLoadingFiscal && fiscalInvoices.map((fact) => (
                  <div
                    key={fact.numeroDocumento}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
                  >
                    {/* Ver en nueva pestaña */}
                    <button
                      onClick={() => handleVerFiscalInvoice(fact)}
                      disabled={openingPdfId === fact.numeroDocumento || !fact.pdfBase64}
                      className={styles.linkButton}
                      style={{
                        display   : 'flex',
                        alignItems: 'center',
                        gap       : '6px',
                        opacity   : !fact.pdfBase64 ? 0.45 : 1,
                      }}
                    >
                      <IoDocumentTextOutline size={18} />
                      {openingPdfId === fact.numeroDocumento
                        ? 'Abriendo…'
                        : fact.pdfBase64
                          ? `Factura fiscal ${fact.numeroDocumento}`
                          : `Factura ${fact.numeroDocumento} (no disponible)`}
                    </button>

                    {/* Descargar PDF */}
                    {fact.pdfBase64 && (
                      <button
                        onClick={() => handleDescargarFiscalInvoice(fact)}
                        disabled={downloadingPdfId === fact.numeroDocumento}
                        className={styles.linkButton}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Descargar PDF"
                      >
                        <IoCloudDownloadOutline size={18} />
                        {downloadingPdfId === fact.numeroDocumento ? 'Descargando…' : 'Descargar'}
                      </button>
                    )}
                  </div>
                ))}

                {/* 4. Sin ninguna factura */}
                {!facturaUrl && !isLoadingFiscal && fiscalInvoices.length === 0 && (
                  <button
                    disabled
                    className={styles.linkButton}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IoDocumentTextOutline size={18} />
                    Sin factura
                  </button>
                )}
              </div>

            </div>

            {/* Peso y Medidas */}
            <div className={styles.row}>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Peso</label>
                <p className={styles.sectionValue}>{peso?.toFixed(2)} ({unidadPeso})</p>
              </div>
              <div className={styles.rowItem}>
                <label className={styles.sectionLabel}>Medidas</label>
                <p className={styles.sectionValue}>
                  L {medidas?.largo?.toFixed(2)} A {medidas?.ancho?.toFixed(2)}{' '}
                  H {medidas?.alto?.toFixed(2)} ({medidas?.unidad})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Estatus */}
        <div className={styles.expandableHeader} onClick={() => toggleSection('historialEstatus')}>
          <h2 className={styles.expandableTitle}>Historial de Estatus</h2>
          {expandedSections.historialEstatus
            ? <IoChevronUpOutline size={24} />
            : <IoChevronDownOutline size={24} />}
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

        {/* Detalle de Factura */}
        {estatus !== 'Recibido' && detalleFactura && (
          <div className={styles.facturaSection}>
            <h2 className={styles.facturaTitle}>
              <IoReceiptOutline size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Detalle de Factura
            </h2>

            {detalleFactura.detalles && detalleFactura.detalles.length > 0 ? (
              <div className={styles.facturaTable}>
                {detalleFactura.detalles.map((detalle) => {
                  const isSubtotal  = detalle.categoria === 'SUBTOTAL';
                  const isTotal     = detalle.categoria === 'TOTAL_BS';
                  const isDescuento = detalle.esDescuento;

                  if (detalle.montoBs === 0 && !isSubtotal && !isTotal) return null;

                  const rowClass = clsx(styles.facturaRow, {
                    [styles.facturaRowBold]     : isSubtotal,
                    [styles.facturaRowTotal]    : isTotal,
                    [styles.facturaRowDescuento]: isDescuento,
                  });
                  const labelClass = isTotal
                    ? styles.facturaTotalLabel
                    : isSubtotal ? styles.facturaLabelBold : styles.facturaLabel;
                  const valueClass = isTotal
                    ? styles.facturaTotalValue
                    : isSubtotal ? styles.facturaValueBold : styles.facturaValue;

                  return (
                    <div key={detalle.numLinea} className={rowClass}>
                      <p className={labelClass}>{detalle.descripcionItem}</p>
                      <span className={valueClass}>{formatBolivar(detalle.montoBs)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.facturaTable}>
                <p className={styles.noDataText}>No hay detalles de factura disponibles</p>
              </div>
            )}
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

        {/* Detalle de Pago */}
        {detallePago && (
          <div className={styles.pagoSection}>
            <h2 className={styles.pagoTitle}>
              <IoCheckmarkDoneOutline
                size={22}
                style={{ marginRight: 8, verticalAlign: 'middle', color: '#28a745' }}
              />
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