import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Rastrear.module.scss';
import { 
  searchTrackingNumber, 
  searchTrackingInGuias, 
  validateTrackingNumber,
  generateStepsFromStatus 
} from '../../services/trackingService';
import iconImage from '../../../src/assets/images/icon-kraken-web-rastrear-_1.png'; 

import Tooltip from '../../components/common/Tooltip/Tooltip';

export default function Rastrear() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const navigate = useNavigate();

  // Función principal de búsqueda con validación
  const handleTrackPackage = async () => {
    const validation = validateTrackingNumber(trackingNumber);
    if (!validation.isValid) {
      window.alert(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      // Primero intentar con el endpoint específico de tracking
      let response = await searchTrackingNumber(trackingNumber.trim());

      // Si falla, intentar buscar en las guías existentes como fallback
      if (!response.success) {
        console.log('Intentando búsqueda en guías existentes...');
        response = await searchTrackingInGuias(trackingNumber.trim());
      }

      if (response.success && response.data) {
        // Convertir datos del backend al formato de la interfaz
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
        showMockResult(); // Mostrar resultado mock si no se encuentra
      }
    } catch (error) {
      console.error('Error buscando tracking:', error);
      window.alert(
        'Error de conexión: No se pudo conectar al servidor. Intenta nuevamente.'
      );
      showMockResult(); // Mostrar resultado mock en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Función para mostrar un resultado de ejemplo
  const showMockResult = () => {
    const mockResult = {
      trackingNumber: trackingNumber.toUpperCase() || 'K202509116385 1W3A',
      origin: 'USA',
      status: 'Avance! Comprobado',
      steps: [
        { name: 'Recibido', date: 'Sep 11, 2025 • 16:38', completed: true },
        { name: 'Procesado', date: 'Sep 16, 2025 • 10:54', completed: true },
        { name: 'Rumbo a Venezuela', date: 'Oct 1, 2025 • 1:07', completed: true },
        { name: 'Llegó a Venezuela', date: 'Oct 5, 2025 • 7:45', completed: true },
        { name: 'Avance! Comprobado', date: 'Oct 6, 2025 • 08:50', completed: true, current: true }
      ],
      guiaId: null,
      idGuia: null
    };
    setTrackingResult(mockResult);
  };

  // Resetear búsqueda
  const resetSearch = () => {
    setTrackingNumber('');
    setTrackingResult(null);
  };

  // Ver detalles del paquete
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
        `Información del Paquete\n\n` +
        `Número de rastreo: ${trackingResult.trackingNumber}\n` +
        `Origen: ${trackingResult.origin}\n` +
        `Estado: ${trackingResult.status}\n` +
        `${trackingResult.currentLocation ? `Ubicación: ${trackingResult.currentLocation}\n` : ''}` +
        `${trackingResult.estimatedDelivery ? `Entrega estimada: ${trackingResult.estimatedDelivery}` : ''}\n\n` +
        'Para ver detalles completos, inicia sesión en tu cuenta.'
      );
    }
  };

  // Renderizar cada paso del tracking (exacto de la app)
  const renderTrackingStep = (step, index) => {
    return (
      <div key={index} className={styles.stepRow}>
        <div className={styles.stepIndicator}>
          {step.completed ? (
            <div className={`${styles.stepCircle} ${styles.stepCompleted}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path 
                  d="M10 3L4.5 8.5L2 6" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div className={`${styles.stepCircle} ${styles.stepPending}`} />
          )}
          {index < (trackingResult?.steps?.length - 1 || 7) && <div className={styles.stepLine} />}
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

  // Manejar Enter key en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleTrackPackage();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        <div className={styles.content}>
          <div className={styles.trackingSection}>
            {/* Header con título e icono */}
            <div className={styles.titleContainer}>
              <div className={styles.iconContainer}>
                <img
                  src={iconImage}
                  alt="Tracking Icon"
                  className={styles.calculatorIcon}
                />
              </div>
              <p className={styles.title}>Rastrear Paquete</p>
              <p className={styles.subtitle}>
                Consulta el estado de tu envío en tiempo real
              </p>
            </div>

            {/* Input de búsqueda */}
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.trackingInput}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa tu número de rastreo"
                disabled={isLoading}
              />
              <button
                className={`${styles.trackButton} ${isLoading ? styles.trackButtonDisabled : ''}`}
                onClick={handleTrackPackage}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="white" 
                      strokeWidth="4" 
                      strokeDasharray="32" 
                      strokeDashoffset="0"
                      opacity="0.3"
                    />
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="white" 
                      strokeWidth="4" 
                      strokeDasharray="32" 
                      strokeDashoffset="8"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Resultados del tracking */}
            {trackingResult && (
              <div>
                <div className={styles.resultSection}>
                  <div className={styles.resultHeader}>
                    <p className={styles.resultSubtitle}>
                      Haz seguimiento al estatus de tu paquete
                    </p>

                    {/* Información del tracking */}
                    <div className={styles.trackingInfo}>
                      <div className={styles.labelContainer}>
                        <div className={styles.labelWithTooltip}>
                          <p className={styles.trackingLabel}>Tracking</p>
                          <Tooltip 
                            content="Este es tu número de rastreo único para seguir el progreso de tu paquete." 
                            position="auto"
                          />
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

                    {/* Origen del paquete */}
                    <div className={styles.originContainer}>
                      <p className={styles.originLabel}>Origen</p>
                      <p className={styles.originText}>{trackingResult.origin}</p>
                    </div>
                  </div>

                  {/* Timeline de estados */}
                  <div className={styles.timelineContainer}>
                    {trackingResult.steps.map((step, index) => renderTrackingStep(step, index))}
                  </div>
                </div>

                {/* Link para ver detalles */}
                <button
                  className={styles.packageDetailsLink}
                  onClick={handleVerDetallesTracking}
                  type="button"
                >
                  <p className={styles.packageDetailsText}>
                    Ver detalles del paquete
                  </p>
                </button>

                {/* Botón para nueva búsqueda */}
                <button
                  className={styles.newTrackingButton}
                  onClick={resetSearch}
                  type="button"
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