// src/modules/us/pages/GuidesList/UsaGuidesList.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUsaMyShipments } from '../../../../services/us/usGuiasService';
import styles from './UsaGuidesList.module.scss';
import clsx from 'clsx';
import Loading from '../../../../components/common/Loading/Loading';
import { IoCubeOutline, IoChevronForwardOutline } from 'react-icons/io5';

const PAGE_SIZE = 10;
const DELIVERED_STATUSES = [5, 6, 7];

export default function UsaGuidesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [shipments,   setShipments]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [errorMsg,    setErrorMsg]    = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode,    setViewMode]    = useState('list');
  const [activeTab,   setActiveTab]   = useState('activos');
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getUsaMyShipments();
      if (res.success) {
        setShipments(res.data ?? []);
      } else {
        setShipments([]);
        setErrorMsg(res.message ?? 'Error loading shipments');
      }
    } catch {
      setShipments([]);
      setErrorMsg('Error loading shipments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tabFiltered = useMemo(() => {
    if (activeTab === 'activos')
      return shipments.filter(s => !DELIVERED_STATUSES.includes(s.estatusId));
    return shipments.filter(s => DELIVERED_STATUSES.includes(s.estatusId));
  }, [shipments, activeTab]);

  const filtered = useMemo(() => {
    if (!searchQuery) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(s =>
      s.nGuia?.toLowerCase().includes(q) ||
      s.trackingNumber?.toLowerCase().includes(q)
    );
  }, [tabFiltered, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeTab]);

  const handleRowClick = (guiaId) => navigate(`/guide/detail/${guiaId}`);
  const formatUSD = (n = 0) => `$${Number(n).toFixed(2)}`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1>{t('us_guide.title')}</h1>

          <div className={styles.tabsContainer}>
            <button
              className={clsx(styles.tabButton, activeTab === 'activos' && styles.tabButtonActive)}
              onClick={() => setActiveTab('activos')}
            >
              {t('us_guide.tab_active')}
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'historial' && styles.tabButtonActive)}
              onClick={() => setActiveTab('historial')}
            >
              {t('us_guide.tab_history')}
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder={t('us_guide.search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(styles.toggleButton, viewMode === 'list' && styles.active)}
            >
              {t('us_guide.view_list')}
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(styles.toggleButton, viewMode === 'grid' && styles.active)}
            >
              {t('us_guide.view_grid')}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {loading && (
          <div className={styles.loadingSection}>
            <Loading inline message={t('us_guide.loading')} />
          </div>
        )}

        {!loading && errorMsg && (
          <p className={styles.error}>{errorMsg}</p>
        )}

        {!loading && !errorMsg && (
          viewMode === 'list' ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>{t('us_guide.col_guide')}</th>
                    <th>{t('us_guide.col_status')}</th>
                    <th>{t('us_guide.col_weight')}</th>
                    <th>{t('us_guide.col_fob')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? paginated.map(s => (
                    <tr
                      key={s.guiaId}
                      className={styles.tableRow}
                      onClick={() => handleRowClick(s.guiaId)}
                    >
                      <td className={styles.bookmarkCell}>
                        <IoCubeOutline size={20} color="#999" />
                      </td>
                      <td className={styles.guiaCell}>
                        <p className={styles.guiaNumber}>{s.nGuia}</p>
                        {s.trackingNumber && (
                          <p className={styles.guiaSubtext}>{s.trackingNumber}</p>
                        )}
                      </td>
                      <td className={styles.statusCell}>
                        <p className={styles.statusText}>{s.estatus}</p>
                        <p className={styles.dateText}>{s.fechaFormato}</p>
                      </td>
                      <td className={styles.costCell}>
                        {Number(s.peso ?? 0).toFixed(2)} lb
                      </td>
                      <td className={styles.costCell}>
                        {formatUSD(s.valorFOB)} USD
                      </td>
                      <td className={styles.menuCell}>
                        <IoChevronForwardOutline size={18} color="#ccc" />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        <div className={styles.emptyState}>
                          <p className={styles.emptyTitle}>
                            {activeTab === 'activos' ? t('us_guide.no_active') : t('us_guide.no_history')}
                          </p>
                          <p className={styles.emptyDescription}>
                            {activeTab === 'activos'
                              ? 'Your in-transit shipments will appear here'
                              : 'Delivered shipments will appear here'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.guidesList}>
              {paginated.length > 0 ? paginated.map(s => (
                <div
                  key={s.guiaId}
                  className={styles.guiaCard}
                  onClick={() => handleRowClick(s.guiaId)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <IoCubeOutline size={20} color="#FF4500" />
                      <p className={styles.guiaNumber}>{s.nGuia}</p>
                    </div>
                    <span className={clsx(styles.badge, s.tienePago ? styles.badgePaid : styles.badgePending)}>
                      {s.tienePago ? t('us_guide.badge_paid') : t('us_guide.badge_pending')}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>{t('us_guide.card_status')}</span>
                      <span className={styles.statusText}>{s.estatus}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>{t('us_guide.card_date')}</span>
                      <span className={styles.dateText}>{s.fechaFormato}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>{t('us_guide.card_weight')}</span>
                      <span className={styles.guiaSubtext}>{Number(s.peso ?? 0).toFixed(2)} {s.unidadPeso}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>{t('us_guide.card_fob')}</span>
                      <span className={styles.costText}>{formatUSD(s.valorFOB)} USD</span>
                    </div>
                    {s.trackingNumber && (
                      <div className={styles.cardRow}>
                        <span className={styles.cardLabel}>{t('us_guide.card_tracking')}</span>
                        <span className={styles.trackingText}>{s.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>
                    {activeTab === 'activos' ? t('us_guide.no_active') : t('us_guide.no_history')}
                  </p>
                  <p className={styles.emptyDescription}>
                    {activeTab === 'activos'
                      ? t('us_guide.no_active_desc')
                      : t('us_guide.no_history_desc')}
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            {t('us_guide.prev')}
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`e-${idx}`} className={styles.ellipsis}>…</span>
                ) : (
                  <button
                    key={item}
                    className={clsx(styles.pageNumber, item === currentPage && styles.pageNumberActive)}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          >
            {t('us_guide.next')}
          </button>

          <span className={styles.pageInfo}>
            {t('us_guide.total_shipments', { count: filtered.length })}
          </span>
        </div>
      )}
    </div>
  );
}
