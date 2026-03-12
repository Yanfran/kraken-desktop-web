import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/services/axiosInstance';
import './TrackingPage.scss';

const STATUS_STEPS = ['Registrado', 'Recogido', 'En tránsito', 'En reparto', 'Entregado'];

const getStepIndex = (status) => {
  const idx = STATUS_STEPS.findIndex(s =>
    s.toLowerCase() === status?.toLowerCase()
  );
  return idx === -1 ? 0 : idx;
};

export default function TrackingPage() {
  const { nGuia }  = useParams();
  const navigate   = useNavigate();
  const [input,    setInput]   = useState('');
  const [data,     setData]    = useState(null);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState(null);
  const [searched, setSearched] = useState(''); // NGuia que se buscó

  // Si viene con parámetro en la URL, buscar automáticamente
  useEffect(() => {
    if (nGuia) {
      setInput(nGuia);
      buscar(nGuia);
    }
  }, [nGuia]);

  const buscar = (numero) => {
    const clean = (numero ?? input)?.trim()?.toUpperCase();
    if (!clean) return;

    setLoading(true);
    setError(null);
    setData(null);
    setSearched(clean);

    axiosInstance.get(`/spain/guia/tracking/${clean}`)
      .then(res => {
        if (res.data.success) setData(res.data.data);
        else setError('No se encontró información para este número de guía.');
      })
      .catch(() => setError('Error al consultar el tracking. Intenta nuevamente.'))
      .finally(() => setLoading(false));
  };

  const activeStep = data ? getStepIndex(data.currentStatus) : 0;

  return (
    <div className="ke-tracking">

      {/* Header */}
      <div className="ke-tracking__header">
        <button className="ke-tracking__back" onClick={() => navigate('/home')}>
          ← Inicio
        </button>
        <h1 className="ke-tracking__title">Seguimiento de Envío</h1>
      </div>

      {/* Buscador — siempre visible */}
      <div className="ke-tracking__search">
        <input
          className="ke-tracking__search-input"
          type="text"
          placeholder="Ingresa tu número de guía (ej: K202603...)"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          disabled={loading}
        />
        <button
          className="ke-tracking__search-btn"
          onClick={() => buscar()}
          disabled={loading || !input.trim()}
        >
          {loading ? <span className="ke-tracking__btn-spinner" /> : '🔍 Rastrear'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="ke-tracking__loading">
          <div className="ke-tracking__spinner" />
          <p>Consultando tracking...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="ke-tracking__error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Resultado */}
      {data && !loading && (
        <>
          {/* NGuia destacado */}
          <div className="ke-tracking__guia-box">
            <p className="ke-tracking__guia-label">Número de Guía</p>
            <p className="ke-tracking__guia-number">{searched}</p>
            {data.source === 'sendsei' && data.trackingNumber && (
              <p className="ke-tracking__guia-sub">
                Tracking courier: <strong>{data.trackingNumber}</strong>
              </p>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="ke-tracking__steps">
            {STATUS_STEPS.map((step, i) => (
              <div
                key={step}
                className={[
                  'ke-tracking__step',
                  i <= activeStep ? 'ke-tracking__step--done'   : '',
                  i === activeStep ? 'ke-tracking__step--active' : '',
                ].join(' ')}
              >
                <div className="ke-tracking__step-circle">
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <span className="ke-tracking__step-label">{step}</span>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`ke-tracking__step-line ${i < activeStep ? 'ke-tracking__step-line--done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Info general */}
          <div className="ke-tracking__info-grid">
            <div className="ke-tracking__info-item">
              <span className="ke-tracking__info-label">Estatus actual</span>
              <span className="ke-tracking__info-value ke-tracking__info-value--status">
                {data.currentStatus}
              </span>
            </div>
            <div className="ke-tracking__info-item">
              <span className="ke-tracking__info-label">Courier</span>
              <span className="ke-tracking__info-value">{data.courier ?? 'N/A'}</span>
            </div>
            {data.estimatedDelivery && (
              <div className="ke-tracking__info-item">
                <span className="ke-tracking__info-label">Entrega estimada</span>
                <span className="ke-tracking__info-value">
                  {new Date(data.estimatedDelivery).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
            {data.createdAt && (
              <div className="ke-tracking__info-item">
                <span className="ke-tracking__info-label">Fecha de registro</span>
                <span className="ke-tracking__info-value">
                  {new Date(data.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>

          {/* Historial */}
          {data.statusHistory?.length > 0 && (
            <div className="ke-tracking__history">
              <h3 className="ke-tracking__history-title">Historial de estatus</h3>
              <ul className="ke-tracking__history-list">
                {[...data.statusHistory].reverse().map((h, i) => (
                  <li key={i} className="ke-tracking__history-item">
                    <div className="ke-tracking__history-dot" />
                    <div className="ke-tracking__history-content">
                      <span className="ke-tracking__history-status">{h.status}</span>
                      {h.note && (
                        <span className="ke-tracking__history-note">{h.note}</span>
                      )}
                      <span className="ke-tracking__history-date">
                        {h.timestamp
                          ? new Date(h.timestamp).toLocaleString('es-ES')
                          : '—'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Estado vacío — sin búsqueda aún */}
      {!data && !loading && !error && (
        <div className="ke-tracking__empty">
          <span className="ke-tracking__empty-icon">📦</span>
          <p>Ingresa tu número de guía para consultar el estado de tu envío.</p>
        </div>
      )}
    </div>
  );
}