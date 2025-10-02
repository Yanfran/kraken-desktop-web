
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyGuides.module.scss';
import clsx from 'clsx';

export default function GuiaCard({ guia, viewMode }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (guia && guia.idGuia) {
      navigate(`/guide/detail/${guia.idGuia}`);
    }
  };

  const getStatusClass = (status) => {
    return styles.status_default;
  };

  return (
    <div className={clsx(styles.guiaCard, styles[viewMode])} onClick={handleNavigate}>
      <div className={styles.cardHeader}>
        <h3 className={styles.guiaNumber}>{guia.nGuia || 'Sin Número'}</h3>
        <span className={`${styles.statusBadge} ${getStatusClass(guia.estatus)}`}>
          {guia.estatus}
        </span>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.guiaContent}>{guia.contenido}</p>
        <p className={styles.guiaDate}>{guia.fecha}</p>
      </div>
      <div className={styles.cardFooter}>
        <span>Origen: {guia.origen}</span>
        <span>Trackings: {guia.trackings?.length || 0}</span>
      </div>
    </div>
  );
}
