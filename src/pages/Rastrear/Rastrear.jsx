import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Rastrear.module.scss';

// You will need to install react-icons: npm install react-icons
// Then import the icons you need, for example:
// import { FaSearch, FaInfoCircle } from 'react-icons/fa';
// For now, using simple placeholders.
const SearchIcon = () => <i className="fa fa-search"></i>; // Replace with actual icon component
const InfoIcon = ({ size, color }) => <i className="fa fa-info-circle" style={{ fontSize: size, color: color }}></i>; // Replace with actual icon component

// Web equivalent for Tooltip
const Tooltip = ({ content, iconSize = 16, iconColor = 'var(--color-text-secondary)', maxWidth = 250 }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.tooltipContainer}>
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)} // For touch devices
        className={styles.tooltipButton}
        style={{ color: iconColor }} // Apply icon color
      >
        <InfoIcon size={iconSize} color={iconColor} />
      </button>
      {visible && (
        <div className={styles.tooltipContent} style={{ maxWidth: maxWidth }}>
          {content}
        </div>
      )}
    </div>
  );
};

export default function Rastrear() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const navigate = useNavigate();

  // Placeholder for tracking services. You'll need to implement these for web.
  const searchTrackingNumber = async (num) => {
    console.log('Searching tracking number (web placeholder):', num);
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve({ success: false, data: null }), 1000));
  };

  const searchTrackingInGuias = async (num) => {
    console.log('Searching tracking in guias (web placeholder):', num);
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve({ success: false, data: null }), 1000));
  };

  const validateTrackingNumber = (num) => {
    if (!num || num.trim() === '') {
      return { isValid: false, message: 'Por favor, ingresa un número de rastreo.' };
    }
    return { isValid: true };
  };

  const handleTrackPackage = async () => {
    const validation = validateTrackingNumber(trackingNumber);
    if (!validation.isValid) {
      window.alert(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      let response = await searchTrackingNumber(trackingNumber.trim());

      if (!response.success) {
        console.log('Intentando búsqueda en guías existentes...');
        response = await searchTrackingInGuias(trackingNumber.trim());
      }

      if (response.success && response.data) {
        const result = {
          trackingNumber: response.data.nGuia || trackingNumber.toUpperCase(),
          origin: response.data.origen || 'USA',
          status: response.data.estatus || 'En proceso',
          currentLocation: response.data.ubicacionActual,
          estimatedDelivery: response.data.fechaEstimadaEntrega,
          steps: generateStepsFromStatus(response.data.estatus, response.data.historialEstatus),
          guiaId: response.data.id,
          idGuia: response.data.idGuia
        };
        setTrackingResult(result);
      } else {
        window.alert(
          'Paquete no encontrado: No se encontró información para este número de rastreo. Verifica que sea correcto.'
        );
        showMockResult(); // Show mock result if not found
      }
    } catch (error) {
      console.error('Error buscando tracking:', error);
      window.alert(
        'Error de conexión: No se pudo conectar al servidor. Intenta nuevamente.'
      );
      showMockResult(); // Show mock result on error
    } finally {
      setIsLoading(false);
    }
  };

  const showMockResult = () => {
    const mockResult = {
      trackingNumber: trackingNumber.toUpperCase() || 'SDSFGASDAFSF',
      origin: 'USA',
      status: 'Tránsito aéreo',
      steps: [
        { name: 'Pre-Alertado', date: '18:30 • Feb 7, 2025', completed: true },
        { name: 'Recibido en Almacén (USA)', date: '08:20 • Feb 10, 2025', completed: true },
        { name: 'Tránsito aéreo', date: '09:50 • Feb 10, 2025', completed: true, current: true },
        { name: 'Aduana', date: '', completed: false },
        { name: 'Recibido en Centro de distribución (VE)', date: '', completed: false },
        { name: 'En ruta', date: '', completed: false },
        { name: 'Disponible en tienda/e-Locker', date: '', completed: false },
        { name: 'Entregado', date: '', completed: false }
      ],
      guiaId: 123,
      idGuia: 123
    };
    setTrackingResult(mockResult);
  };

  const generateStepsFromStatus = (estatus, historial) => {
    if (!historial || historial.length === 0) {
      return [{
        name: estatus || 'En proceso',
        date: 'Estado actual',
        completed: true,
        current: true
      }];
    }

    const processedHistorial = [];
    let lastProcessedEntry = null;

    for (const entry of historial) {
      const estatusLower = entry.estatus?.toLowerCase();

      if (estatusLower === 'procesado') {
        lastProcessedEntry = entry;
      } else {
        if (lastProcessedEntry) {
          processedHistorial.push({
            ...lastProcessedEntry,
            name: 'Procesado'
          });
          lastProcessedEntry = null;
        }
        processedHistorial.push({
          ...entry,
          name: entry.estatus
        });
      }
    }

    if (lastProcessedEntry) {
      processedHistorial.push({
        ...lastProcessedEntry,
        name: 'Procesado'
      });
    }

    const steps = processedHistorial.map((entry, index) => {
      const isLast = index === processedHistorial.length - 1;
      return {
        name: entry.name,
        date: entry.fecha,
        completed: true,
        current: isLast
      };
    });

    return steps;
  };

  const resetSearch = () => {
    setTrackingNumber('');
    setTrackingResult(null);
  };

  const handleVerDetallesTracking = async () => {
    if (!trackingResult) return;

    const guiaId = trackingResult.idGuia || trackingResult.guiaId;

    if (guiaId) {
      navigate(`/guide/detail/${guiaId}`);
      return;
    }

    try {
      console.log('🔍 Buscando guía por número de tracking:', trackingResult.trackingNumber);
      const response = await searchTrackingInGuias(trackingResult.trackingNumber);

      if (response.success && response.data) {
        const foundGuiaId = response.data.idGuia || response.data.id;
        if (foundGuiaId) {
          console.log('✅ Guía encontrada con ID:', foundGuiaId);
          navigate(`/guide/detail/${foundGuiaId}`);
        } else {
          throw new Error('ID de guía no disponible');
        }
      } else {
        throw new Error('Guía no encontrada en el sistema');
      }
    } catch (error) {
      console.log('❌ Error buscando detalles de la guía:', error);
      window.alert(
        `Información del Paquete\n` +
        `Número de rastreo: ${trackingResult.trackingNumber}\n` +
        `Origen: ${trackingResult.origin}\n` +
        `Estado: ${trackingResult.status}\n` +
        `${trackingResult.currentLocation ? `Ubicación: ${trackingResult.currentLocation}\n` : ''}` +
        `${trackingResult.estimatedDelivery ? `Entrega estimada: ${trackingResult.estimatedDelivery}` : ''}\n\n` +
        'Para ver detalles completos, inicia sesión en tu cuenta.'
      );
    }
  };

  const renderTrackingStep = (step, index) => {
    return (
      <div key={index} className={styles.stepRow}>
        <div className={styles.stepIndicator}>
          {step.completed ? (
            <div className={`${styles.stepCircle} ${styles.stepCompleted}`}>
              {/* Placeholder for checkmark icon */}
              <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>✓</span>
            </div>
          ) : (
            <div className={`${styles.stepCircle} ${styles.stepPending}`} />
          )}
          {index < 7 && <div className={styles.stepLine} />}
        </div>
        <div className={styles.stepContent}>
          <p className={`${styles.stepTitle} ${step.completed ? styles.stepTitleCompleted : ''} ${step.current ? styles.stepTitleCurrent : ''}`}>
            {step.name}
          </p>
          {step.date && (
            <p className={styles.stepDate}>{step.date}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          <div className={styles.trackingSection}>
            <div className={styles.titleContainer}>
              <div className={styles.iconContainer}>
                <img
                  src="/images/about/icon-kraken-web-rastrear-_1.png"
                  alt="Tracking Icon"
                  className={styles.calculatorIcon}
                />
              </div>
              <p className={styles.title}>Rastrear Paquete</p>
              <p className={styles.subtitle}>
                Consulta el estado de tu envío en tiempo real
              </p>
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.trackingInput}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ingresa tu número de rastreo"
                disabled={isLoading}
              />
              <button
                className={`${styles.trackButton} ${isLoading ? styles.trackButtonDisabled : ''}`}
                onClick={handleTrackPackage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={{ color: 'var(--color-text-light)', fontSize: 16 }}>Loading...</div>
                ) : (
                  <SearchIcon style={{ color: 'var(--color-text-light)', fontSize: 20 }} />
                )}
              </button>
            </div>

            {trackingResult && (
              <div>
                <div className={styles.resultSection}>
                  <div className={styles.resultHeader}>
                    <p className={styles.resultSubtitle}>
                      Haz seguimiento al estatus de tu paquete
                    </p>

                    <div className={styles.trackingInfo}>
                      <div className={styles.labelContainer}>
                        <div className={styles.labelWithTooltip}>
                          <p className={styles.trackingLabel}>Tracking</p>
                          <Tooltip content="Este es tu número de rastreo único para seguir el progreso de tu paquete." />
                        </div>
                      </div>

                      <div className={styles.trackingNumberContainer}>
                        <p className={styles.trackingNumberText}>
                          {trackingResult.trackingNumber}
                        </p>
                      </div>

                      <p className={styles.trackingHelper}>
                        Escribe el número de rastreo sin espacios, puntos, ni caracteres especiales
                      </p>
                    </div>

                    <div className={styles.originContainer}>
                      <p className={styles.originLabel}>Origen</p>
                      <p className={styles.originText}>{trackingResult.origin}</p>
                    </div>
                  </div>

                  <div className={styles.timelineContainer}>
                    {trackingResult.steps.map((step, index) => renderTrackingStep(step, index))}
                  </div>

                </div>

                <button
                  className={styles.packageDetailsLink}
                  onClick={handleVerDetallesTracking}
                >
                  <p className={styles.packageDetailsText}>
                    Ver detalles del paquete
                  </p>
                </button>

                <button
                  className={styles.newTrackingButton}
                  onClick={resetSearch}
                >
                  <p className={styles.newTrackingButtonText}>
                    Rastrear otro paquete
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}