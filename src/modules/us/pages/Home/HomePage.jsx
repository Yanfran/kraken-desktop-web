// src/modules/us/pages/Home/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../../services/axiosInstance';
import './HomePage.scss';

// ── Helper de color por estatus ───────────────────────────────────────────────
const getStatusColor = (estatus = '') => {
  const s = estatus.toLowerCase();
  if (s.includes('entregad')) return 'green';
  if (s.includes('tránsito') || s.includes('transito') || s.includes('proceso')) return 'orange';
  if (s.includes('registrad') || s.includes('recibid')) return 'blue';
  return 'gray';
};

const HomePage = () => {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { t }        = useTranslation();
  const [shipments,  setShipments]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  // ── Cargar envíos reales del cliente ─────────────────────────────────────
  useEffect(() => {
    axiosInstance.get('/spain/guia/my-shipments') // mismo endpoint por ahora
      .then(res => {
        if (res.data?.success) setShipments(res.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Stats calculadas ──────────────────────────────────────────────────────
  const activos    = shipments.filter(s => !s.estatus?.toLowerCase().includes('entregad')).length;
  const entregados = shipments.filter(s =>  s.estatus?.toLowerCase().includes('entregad')).length;
  const esteMes    = shipments.filter(s => {
    if (!s.fecha) return false;
    const f = new Date(s.fecha);
    const now = new Date();
    return f.getMonth() === now.getMonth() && f.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: t('us_home.stat_active'),     value: activos },
    { label: t('us_home.stat_delivered'),  value: entregados },
    { label: t('us_home.stat_this_month'), value: esteMes },
    { label: t('us_home.stat_total'),      value: shipments.length },
  ];

  return (
    <div className="container">
      <div className="us-home__header" style={{ marginLeft: '20px' }}>
        <h1 className="us-home__title">
          {t('us_home.greeting', { name: user?.nombre ?? user?.name ?? 'Bienvenido' })}
        </h1>
        <p className="us-home__subtitle">
          {t('us_home.subtitle')}
        </p>
      </div>

      <div className="us-home">

        {/* Botón Nueva Recogida */}
        <button className="us-home__pickup-btn" onClick={() => navigate('/pickup')}>
          <span className="us-home__pickup-icon">📦</span>
          <span className="us-home__pickup-text">{t('us_home.new_pickup')}</span>
        </button>

        {/* Grid Principal */}
        <div className="us-home__grid">

          {/* Columna Izquierda — Envíos Recientes */}
          <div className="us-home__left">
            <section className="us-home__section">
              <h2 className="us-home__section-title">{t('us_home.recent_shipments')}</h2>

              {loading && (
                <p style={{ color: '#999', fontSize: '0.9rem' }}>{t('us_home.loading')}</p>
              )}

              {!loading && shipments.length === 0 && (
                <p style={{ color: '#999', fontSize: '0.9rem' }}>
                  {t('us_home.no_shipments')}
                </p>
              )}

              <div className="us-home__shipments">
                {shipments.slice(0, 5).map((s) => (
                  <div
                    key={s.guiaId}
                    className="us-home__shipment-item"
                    onClick={() => navigate(`/guide/detail/${s.guiaId}`)}
                  >
                    <div className="us-home__shipment-info">
                      <span className="us-home__shipment-id">{s.nGuia}</span>
                      <span className={`us-home__shipment-status us-home__shipment-status--${getStatusColor(s.estatus)}`}>
                        {s.estatus}
                      </span>
                    </div>
                    <div className="us-home__shipment-action">
                      <span className="us-home__shipment-label">{s.fechaFormato}</span>
                      <span className="us-home__shipment-arrow">›</span>
                    </div>
                  </div>
                ))}
              </div>

              {shipments.length > 5 && (
                <button
                  className="us-home__view-all"
                  onClick={() => navigate('/guide/guides')}
                >
                  <span>{t('us_home.view_all', { count: shipments.length })}</span>
                  <span className="us-home__view-all-arrow">→</span>
                </button>
              )}
            </section>
          </div>

          {/* Columna Derecha */}
          <div className="us-home__right">

            {/* Ruta Frecuente */}
            <section className="us-home__section">
              <h2 className="us-home__section-title">{t('us_home.frequent_route')}</h2>
              <div className="us-home__route">
                <span className="us-home__route-flag">🇺🇸</span>
                <span className="us-home__route-text">{t('us_home.route_text')}</span>
                <span className="us-home__route-flag">🇻🇪</span>
              </div>
            </section>

            {/* Acciones rápidas */}
            <section className="us-home__section">
              <h2 className="us-home__section-title">{t('us_home.quick_actions')}</h2>
              <div className="us-home__addresses">
                <div
                  className="us-home__address-card"
                  onClick={() => navigate('/tracking')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="us-home__address-icon">🔍</span>
                  <span className="us-home__address-name">{t('us_home.track_package')}</span>
                </div>
                <div
                  className="us-home__address-card"
                  onClick={() => navigate('/calculator')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="us-home__address-icon">🧮</span>
                  <span className="us-home__address-name">{t('us_home.calculator')}</span>
                </div>
                {/* <div
                  className="us-home__address-card"
                  onClick={() => navigate('/profile/addresses')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="us-home__address-icon">📍</span>
                  <span className="us-home__address-name">Mis direcciones</span>
                </div> */}
                <div
                  className="us-home__address-card"
                  onClick={() => navigate('/pickup')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="us-home__address-icon">📦</span>
                  <span className="us-home__address-name">{t('us_home.new_pickup_action')}</span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Estadísticas */}
        <div className="us-home__stats">
          {stats.map((stat, i) => (
            <div key={i} className="us-home__stat-card">
              <h3 className="us-home__stat-label">{stat.label}</h3>
              <p className="us-home__stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;