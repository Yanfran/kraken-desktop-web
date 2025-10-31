// src/pages/MyGuides/GuiaCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Guides.module.scss';
import clsx from 'clsx';

export default function GuiaCard({ guia, viewMode }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (guia && guia.idGuia) {
      navigate(`/guide/detail/${guia.idGuia}`);
    }
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'pendiente de pago':
        return styles.status_pending;
      case 'pendiente de factura':
        return styles.status_warning;
      case 'pagado':
        return styles.status_paid;
      case 'disponible en e-locker':
        return styles.status_ready;
      case 'entregado':
        return styles.status_delivered;
      case 'procesado':
      case 'rumbo a venezuela':
        return styles.status_transit;
      default:
        return styles.status_default;
    }
  };

  // Determinar si la guía está pagada
  const isPaid = guia.tienePago || guia.estaPagado;

  return (
    <div className={clsx(styles.guiaCard, styles[viewMode])} onClick={handleNavigate}>
      <div className={styles.cardHeader}>
        <h3 className={styles.guiaNumber}>{guia.nGuia || 'Sin Número'}</h3>
        
        <div className={styles.badgesContainer}>
          {/* Badge de estado pagado */}
          {isPaid && (
            <span className={styles.paidBadge}>
              ✓ Pagado
            </span>
          )}
          
          {/* Badge de estatus */}
          <span className={`${styles.statusBadge} ${getStatusClass(guia.estatus)}`}>
            {guia.estatus}
          </span>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <p className={styles.guiaContent}>
          {guia.contenido || 'Sin descripción'}
        </p>
        <p className={styles.guiaDate}>
          {guia.fecha || 'Sin fecha'}
        </p>
      </div>
      
      <div className={styles.cardFooter}>
        <span>Origen: {guia.origen || 'USA'}</span>
        <span>Trackings: {guia.trackings?.length || 0}</span>
      </div>
    </div>
  );
}