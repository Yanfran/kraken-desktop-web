
import React, { useState, useEffect, useMemo } from 'react';
import { getGuias } from '../../services/guiasService';
import styles from './MyGuides.module.scss';
import GuiaCard from './GuiaCard';
import clsx from 'clsx'; // Import clsx

export default function MyGuides() {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const loadGuias = async () => {
      try {
        setLoading(true);
        const response = await getGuias();
        if (response.success) {
          setGuias(response.data || []);
        } else {
          setError(response.message || 'Error al cargar las guías.');
        }
      } catch (err) {
        setError('Error de conexión al cargar las guías.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGuias();
  }, []);

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
        {loading && <p>Cargando guías...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
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
