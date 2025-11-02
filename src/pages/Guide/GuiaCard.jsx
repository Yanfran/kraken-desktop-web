// src/pages/MyGuides/GuiaCard.jsx - CON COSTO CALCULADO

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Guides.module.scss';
import clsx from 'clsx';

// Icons
import { 
  IoChevronBack,
  IoCallOutline,
  IoCalendarOutline,
  IoPersonOutline,  
  IoSaveOutline,
  IoLocationOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoHelpOutline,
  IoTrashOutline,
  IoCardOutline,
  IoStorefrontOutline,
  IoHomeOutline,
  IoDocumentTextOutline
} from 'react-icons/io5';

export default function GuiaCard({ 
  guia, 
  viewMode,
  necesitaFactura = false,
  sePuedePagar = false,
  isUploadingInvoice = false,
  onCargarFactura,
  openMenuId,
  setOpenMenuId,
  calculatedCost,
  isCalculatingCost = false
}) {
  const navigate = useNavigate();

  console.log('Navegando a detalle de guía:', guia);
  const handleNavigate = () => {
    if (guia && guia.idGuia) {
      navigate(`/guide/detail/${guia.idGuia}`);
    }
  };

  const handlePay = (e) => {
    e.stopPropagation();
    if (guia && guia.idGuia) {
      navigate(`/payment/${guia.idGuia}`);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === guia.idGuia ? null : guia.idGuia);
  };

  const isPaid = guia.tienePago || guia.estaPagado;
  const isMenuOpen = openMenuId === guia.idGuia;

  // 🆕 Obtener costo a mostrar
  const getCosto = () => {
    if (isCalculatingCost) {
      return '...';
    }
    
    if (calculatedCost) {
      return calculatedCost;
    }
    
    // Fallback a valorFOB
    return guia.valorFOB 
      ? `$${parseFloat(guia.valorFOB).toFixed(2)}` 
      : '$0.00';
  };

  const formatBolivarFromShipment = (shipment) => {
    if (!shipment) return '0,00 Bs.';
    const df = shipment.calculationData?.detalleFactura || {};
    const tasa = shipment.calculationData?.tasaCambio || shipment.tasaCambio || 0;

    let value = 0;
    if (typeof df.precioBase === 'number') {
      value = df.precioBase;
    } else if (typeof df.precioBaseUSD === 'number' && tasa) {
      value = df.precioBaseUSD * tasa;
    } else if (typeof shipment.valorFOB === 'number' && tasa) {
      value = shipment.valorFOB * tasa;
    }

    return Number(value || 0).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' Bs.';
  };


  // MODO LISTA (TABLA)
  if (viewMode === 'list') {
    return (
      <tr className={styles.tableRow} onClick={handleNavigate}>
        <td className={styles.bookmarkCell}>
          <button className={styles.bookmarkBtn} onClick={(e) => e.stopPropagation()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </td>
        
        <td className={styles.guiaCell}>
          <div className={styles.guiaNumber}>{guia.nGuia || 'Sin Número'}</div>
          <div className={styles.guiaSubtext}>{guia.contenido || 'TV'}</div>
        </td>
        
        <td className={styles.statusCell}>
          <div className={styles.statusText}>{guia.estatus || 'Pendiente de Pago'}</div>
          <div className={styles.dateText}>{guia.fecha || 'Feb 7, 2025 • 09:30'}</div>
        </td>
        
        {/* <td className={styles.costCell}>
          {getCosto()}
        </td> */}
        
        <td className={styles.originCell}>
          {guia.origen || 'USA'}
        </td>
        
        <td className={styles.menuCell}>
          <div className={styles.menuWrapper}>
            <button 
              className={styles.menuButton}
              onClick={toggleMenu}
            >
              ⋮
            </button>
            
            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <button 
                  className={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                >
                  <span className="menu-dropdown__icon"><IoEyeOutline size={18}/></span>
                  Ver detalle
                </button>
                
                {necesitaFactura && (
                  <button 
                    className={clsx(styles.menuItem, styles.menuItem_warning)}
                    onClick={(e) => onCargarFactura(guia, e)}
                    disabled={isUploadingInvoice}
                  >
                    <IoDocumentTextOutline size={18} style={{ color: '#f59e0b' }}/>
                    {isUploadingInvoice ? 'Cargando...' : 'Cargar Factura'}
                  </button>
                )}
                
                {sePuedePagar && (
                  <button 
                    className={clsx(styles.menuItem, styles.menuItem_primary)}
                    onClick={handlePay}
                  >
                    <span className="menu-dropdown__icon"><IoCardOutline size={18}/></span>
                    Pagar
                  </button>
                )}
                
                <button 
                  className={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Ayuda para guía ${guia.nGuia || guia.idGuia}`);
                  }}
                >
                  <span className="menu-dropdown__icon"><IoHelpOutline size={18}/></span>
                  Ayuda
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // MODO GRID (CARD)
  return (
    <div className={styles.guiaCard} onClick={handleNavigate}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <button className={styles.bookmarkBtn} onClick={(e) => e.stopPropagation()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <h3 className={styles.guiaNumber}>{guia.nGuia || 'Sin Número'}</h3>
        </div>
        
        <div className={styles.menuWrapper}>
          <button 
            className={styles.menuButton}
            onClick={toggleMenu}
          >
            ⋮
          </button>
          
          {isMenuOpen && (
            <div className={styles.menuDropdown}>
              <button 
                className={styles.menuItem}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
              >
                <span className="menu-dropdown__icon"><IoEyeOutline size={18}/></span>
                Ver detalle
              </button>
              
              {necesitaFactura && (
                <button 
                  className={clsx(styles.menuItem, styles.menuItem_warning)}
                  onClick={(e) => onCargarFactura(guia, e)}
                  disabled={isUploadingInvoice}
                >
                  <IoDocumentTextOutline size={18} style={{ color: '#f59e0b' }}/>
                  {isUploadingInvoice ? 'Cargando...' : 'Cargar Factura'}
                </button>
              )}
              
              {sePuedePagar && (
                <button 
                  className={clsx(styles.menuItem, styles.menuItem_primary)}
                  onClick={handlePay}
                >
                  <span className="menu-dropdown__icon"><IoCardOutline size={18}/></span>
                  Pagar
                </button>
              )}
              
              <button 
                className={styles.menuItem}
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Ayuda para guía ${guia.nGuia || guia.idGuia}`);
                }}
              >
                <span className="menu-dropdown__icon"><IoHelpOutline size={18}/></span>
                Ayuda
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Estatus:</span>
          <span className={styles.statusText}>{guia.estatus || 'Pendiente de Pago'}</span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Fecha:</span>
          <span className={styles.dateText}>{guia.fecha || 'Feb 7, 2025 • 09:30'}</span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Contenido:</span>
          <span className={styles.guiaSubtext}>{guia.contenido || 'TV'}</span>
        </div>
        {/* <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Costo:</span>
          <span className={styles.costText}>{getCosto()}</span>
        </div> */}
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Origen:</span>
          <span>{guia.origen || 'USA'}</span>
        </div>
      </div>
    </div>
  );
}