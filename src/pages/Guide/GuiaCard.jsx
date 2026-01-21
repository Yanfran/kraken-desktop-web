// src/pages/MyGuides/GuiaCard.jsx - CON MSDS Y NONDG

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Guides.module.scss';
import clsx from 'clsx';

// Icons
import { 
  IoEyeOutline,
  IoHelpOutline,
  IoCardOutline,
  IoDocumentTextOutline,
  IoCheckboxOutline,
  IoSquareOutline,
  IoShieldCheckmarkOutline,  // 🆕 ICONO PARA MSDS
  IoWarningOutline           // 🆕 ICONO PARA NONDG
} from 'react-icons/io5';

export default function GuiaCard({ 
  guia, 
  viewMode,
  necesitaFactura = false,
  necesitaMSDS = false,        // 🆕 PROP
  necesitaNONDG = false,       // 🆕 PROP
  sePuedePagar = false,
  isUploadingInvoice = false,
  isUploadingMSDS = false,     // 🆕 PROP
  isUploadingNONDG = false,    // 🆕 PROP
  onCargarFactura,
  onCargarMSDS,                // 🆕 HANDLER
  onCargarNONDG,               // 🆕 HANDLER
  openMenuId,
  setOpenMenuId,
  calculatedCost,
  isCalculatingCost = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (selectionMode) {
      onToggleSelection();
      return;
    }

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

  const getCosto = () => {
    if (isCalculatingCost) {
      return '...';
    }
    
    if (calculatedCost) {
      return calculatedCost;
    }
    
    return guia.valorFOB 
      ? `$${parseFloat(guia.valorFOB).toFixed(2)}` 
      : '$0.00';
  };

  // Helper: formatear ISO date a "10 dic 2025 • 15:54"
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;

    const datePart = d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const timePart = d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const capitalizedDate = datePart.replace(/\b([a-zñáéíóúü])/g, (m) => m.toUpperCase());

    return `${capitalizedDate} • ${timePart}`;
  };

  // MODO LISTA (TABLA)
  if (viewMode === 'list') {
    return (
      <tr 
        className={clsx(styles.tableRow, isSelected && styles.selected)} 
        onClick={handleNavigate}
      >
        {selectionMode && (
          <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.checkboxBtn}
              onClick={onToggleSelection}
              disabled={!sePuedePagar}
            >
              {isSelected ? (
                <IoCheckboxOutline size={24} style={{ color: '#10b981' }} />
              ) : (
                <IoSquareOutline size={24} style={{ color: '#999' }} />
              )}
            </button>
          </td>
        )}

        <td className={styles.bookmarkCell}>
          <button className={styles.bookmarkBtn} onClick={(e) => e.stopPropagation()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </td>
        
        <td className={styles.guiaCell}>
          <div className={styles.guiaNumber}>{guia.nGuia || 'Sin Número'}</div>
          <div className={styles.guiaSubtext}>{guia.contenido || ''}</div>
        </td>
        
        <td className={styles.statusCell}>
          <div className={styles.statusText}>{guia.estatus || ''}</div>
          <div className={styles.dateText}>{ formatDateTime(guia.fechaEstatus || '') }</div>
        </td>
        
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
                
                {/* ============================================ */}
                {/* 🆕 BOTÓN CARGAR FACTURA */}
                {/* ============================================ */}
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

                {/* ============================================ */}
                {/* 🆕 BOTÓN CARGAR MSDS */}
                {/* ============================================ */}
                {necesitaMSDS && (
                  <button 
                    className={clsx(styles.menuItem, styles.menuItem_info)}
                    onClick={(e) => onCargarMSDS(guia, e)}
                    disabled={isUploadingMSDS}
                  >
                    <IoShieldCheckmarkOutline size={18} style={{ color: '#3b82f6' }}/>
                    {isUploadingMSDS ? 'Cargando...' : 'Cargar MSDS'}
                  </button>
                )}

                {/* ============================================ */}
                {/* 🆕 BOTÓN CARGAR NONDG */}
                {/* ============================================ */}
                {necesitaNONDG && (
                  <button 
                    className={clsx(styles.menuItem, styles.menuItem_success)}
                    onClick={(e) => onCargarNONDG(guia, e)}
                    disabled={isUploadingNONDG}
                  >
                    <IoWarningOutline size={18} style={{ color: '#10b981' }}/>
                    {isUploadingNONDG ? 'Cargando...' : 'Cargar NONDG'}
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
    <div 
      className={clsx(styles.guiaCard, isSelected && styles.selected)} 
      onClick={handleNavigate}
    >
      {selectionMode && (
        <div 
          className={styles.cardCheckbox}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.checkboxBtn}
            onClick={onToggleSelection}
            disabled={!sePuedePagar}
          >
            {isSelected ? (
              <IoCheckboxOutline size={28} style={{ color: '#10b981' }} />
            ) : (
              <IoSquareOutline size={28} style={{ color: '#999' }} />
            )}
          </button>
        </div>
      )}

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
              
              {/* ============================================ */}
              {/* 🆕 BOTONES PARA GRID MODE */}
              {/* ============================================ */}
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

              {necesitaMSDS && (
                <button 
                  className={clsx(styles.menuItem, styles.menuItem_info)}
                  onClick={(e) => onCargarMSDS(guia, e)}
                  disabled={isUploadingMSDS}
                >
                  <IoShieldCheckmarkOutline size={18} style={{ color: '#3b82f6' }}/>
                  {isUploadingMSDS ? 'Cargando...' : 'Cargar MSDS'}
                </button>
              )}

              {necesitaNONDG && (
                <button 
                  className={clsx(styles.menuItem, styles.menuItem_success)}
                  onClick={(e) => onCargarNONDG(guia, e)}
                  disabled={isUploadingNONDG}
                >
                  <IoWarningOutline size={18} style={{ color: '#10b981' }}/>
                  {isUploadingNONDG ? 'Cargando...' : 'Cargar NONDG'}
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
          <span className={styles.dateText}>{ formatDateTime(guia.fechaEstatus || '') }</span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Contenido:</span>
          <span className={styles.guiaSubtext}>{guia.contenido || 'TV'}</span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Origen:</span>
          <span>{guia.origen || 'USA'}</span>
        </div>
      </div>
    </div>
  );
}