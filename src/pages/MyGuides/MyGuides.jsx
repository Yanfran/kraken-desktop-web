// src/pages/MyGuides/MyGuides.jsx
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
  const [activeTab, setActiveTab] = useState('activos'); // 'activos' o 'historial'

  const { data: guias = [], isLoading, isError, error } = useQuery({
    queryKey: ['guias'],
    queryFn: fetchGuias,
  });

  // Filtrado por tabs y búsqueda
  const filteredGuias = useMemo(() => {
    let result = guias;

    // Primero filtrar por tab
    if (activeTab === 'activos') {
      // Activos: guías que NO tienen pago (tienePago = false o estaPagado = false)
      result = result.filter(guia => !guia.tienePago && !guia.estaPagado);
    } else if (activeTab === 'historial') {
      // Historial: guías que SÍ tienen pago (tienePago = true o estaPagado = true)
      result = result.filter(guia => guia.tienePago || guia.estaPagado);
    }

    // Luego aplicar búsqueda si existe
    if (searchQuery) {
      result = result.filter(guia =>
        guia.nGuia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guia.tracking?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guia.contenido?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [guias, searchQuery, activeTab]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>📦</span>
          </div>
          <h1>Mis Guías</h1>
          <p className={styles.subtitle}>
            Gestiona tus envíos activos e historial de pagos
          </p>
        </div>

        {/* Tabs para Activos y Historial */}
        <div className={styles.tabsContainer}>
          <button
            className={clsx(styles.tabButton, activeTab === 'activos' && styles.tabButtonActive)}
            onClick={() => setActiveTab('activos')}
          >
            Activos
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === 'historial' && styles.tabButtonActive)}
            onClick={() => setActiveTab('historial')}
          >
            Historial
          </button>
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
          <div className={styles.viewToggle}>
            <button 
              onClick={() => setViewMode('grid')} 
              className={clsx(styles.toggleButton, viewMode === 'grid' && styles.active)}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={clsx(styles.toggleButton, viewMode === 'list' && styles.active)}
            >
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
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
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
      </div>
    </div>
  );
}