
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGuias } from '../../services/guiasService';
import styles from './MyGuides.module.scss';
import GuiaCard from './GuiaCard';
import clsx from 'clsx';

import Loading from '../../components/common/Loading/Loading';

export default function MyGuides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const { data: guias = [], isLoading, isError, error } = useQuery({
    queryKey: ['guias'],
    queryFn: fetchGuias,
  });

  const filteredGuias = useMemo(() => {
    if (!searchQuery) {
      return guias;
    }
    return guias.filter(guia =>
      guia.nGuia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guia.tracking?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guia.contenido?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guias, searchQuery]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mis Guías</h1>
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
          <div className={styles.viewToggle}>
            <button onClick={() => setViewMode('grid')} className={clsx(styles.toggleButton, viewMode === 'grid' && styles.active)}>
              Grid
            </button>
            <button onClick={() => setViewMode('list')} className={clsx(styles.toggleButton, viewMode === 'list' && styles.active)}>
              List
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {isLoading && <Loading />}
        {isError && <p className={styles.error}>{error.message}</p>}
        {!isLoading && !isError && (
          <div className={clsx(styles.guidesList, styles[viewMode])}>
            {filteredGuias.length > 0 ? (
              filteredGuias.map(guia => (
                <GuiaCard key={guia.idGuia} guia={guia} viewMode={viewMode} />
              ))
            ) : (
              <p>No se encontraron guías.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
