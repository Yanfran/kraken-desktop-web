// src/modules/us/pages/GuidesList/UsaGuidesList.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUsaMyShipments } from '../../../../services/us/usGuiasService';
import styles from './UsaGuidesList.module.scss';
import clsx from 'clsx';
import Loading from '../../../../components/common/Loading/Loading';
import { IoCubeOutline, IoChevronForwardOutline, IoSearchOutline } from 'react-icons/io5';

const PAGE_SIZE = 10;
const DELIVERED_STATUSES = [5, 6, 7];

export default function UsaGuidesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [shipments,   setShipments]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [errorMsg,    setErrorMsg]    = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className={styles.page}>

      {/* ── Search ── */}
      <div className={styles.searchWrap}>
        <IoSearchOutline size={16} className={styles.searchIcon} />
        <input
          type="text"
          placeholder={t('us_guide.search_placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={clsx(styles.tab, activeTab === 'activos' && styles.tabActive)}
          onClick={() => setActiveTab('activos')}
        >
          {t('us_guide.tab_active')}
        </button>
        <button
          className={clsx(styles.tab, activeTab === 'historial' && styles.tabActive)}
          onClick={() => setActiveTab('historial')}
        >
          {t('us_guide.tab_history')}
        </button>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className={styles.loadingWrap}>
          <Loading inline message={t('us_guide.loading')} />
        </div>
      )}

      {!loading && errorMsg && (
        <p className={styles.error}>{errorMsg}</p>
      )}

      {!loading && !errorMsg && (
        <>
          <div className={styles.list}>
            {paginated.length > 0 ? paginated.map(s => (
              <div
                key={s.guiaId}
                className={styles.row}
                onClick={() => handleRowClick(s.guiaId)}
              >
                <IoCubeOutline size={26} className={styles.rowIcon} />

                <div className={styles.rowBody}>
                  <div className={styles.rowTop}>
                    <span className={styles.guiaNum}>{s.nGuia}</span>
                    <span className={clsx(styles.badge, s.tienePago ? styles.badgePaid : styles.badgePending)}>
                      {s.tienePago ? t('us_guide.badge_paid') : t('us_guide.badge_pending')}
                    </span>
                  </div>
                  {s.trackingNumber && (
                    <span className={styles.tracking}>{s.trackingNumber}</span>
                  )}
                  <div className={styles.rowBottom}>
                    <span className={styles.status}>{s.estatus}</span>
                    <span className={styles.date}>{s.fechaFormato}</span>
                  </div>
                  <div className={styles.rowBottom}>
                    <span className={styles.weight}>{Number(s.peso ?? 0).toFixed(2)} {s.unidadPeso ?? 'lb'}</span>
                    <span className={styles.cost}>{formatUSD(s.totalPagado ?? s.valorFOB)} USD</span>
                  </div>
                </div>

                <IoChevronForwardOutline size={16} className={styles.chevron} />
              </div>
            )) : (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>
                  {activeTab === 'activos' ? t('us_guide.no_active') : t('us_guide.no_history')}
                </p>
                <p className={styles.emptyDesc}>
                  {activeTab === 'activos' ? t('us_guide.no_active_desc') : t('us_guide.no_history_desc')}
                </p>
              </div>
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
                        className={clsx(styles.pageNum, item === currentPage && styles.pageNumActive)}
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
        </>
      )}
    </div>
  );
}
