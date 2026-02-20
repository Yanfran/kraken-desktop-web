// src/modules/es/pages/ShipmentWizard/ESShipmentWizard.jsx
// Wizard de creación de envíos para España (KE) — 4 pasos
import React, { useState, useCallback } from 'react';
import Step1PackageDetails from './steps/Step1PackageDetails';
import Step2Addresses from './steps/Step2Addresses';
import Step3Summary from './steps/Step3Summary';
import Step4Payment from './steps/Step4Payment';
import './ESShipmentWizard.scss';

// ─── Definición de pasos ────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Detalles del Envío' },
  { id: 2, label: 'Recogida y Entrega' },
  { id: 3, label: 'Resumen' },
  { id: 4, label: 'Pago' },
];

// ─── Estado inicial del wizard ──────────────────────────────────────────────
const INITIAL_STATE = {
  // Paso 1 — paquetes
  packages: [
    {
      id: Date.now(),
      largo: '',
      ancho: '',
      alto: '',
      peso: '',
      unidadPeso: 'kg',
      tipoPaquete: 'Caja',
      valorFOB: '',
      descripcion: '',
    },
  ],

  // Paso 2 — direcciones
  originAddressId: null,
  destinationAddressId: null,

  // Paso 3 — opciones de servicio calculadas por backend
  pricing: null,       // { envioBase, pesoVolumetrico, seguro, subtotal, iva, total, totalUSD }
  seguroActivo: false,

  // Paso 4 — método de pago
  metodoPago: 'card',  // 'card' | 'paypal' | 'transfer'
  cardData: {
    numero: '',
    expiracion: '',
    cvv: '',
    titular: '',
    guardar: false,
  },
};

// ─── Componente principal ────────────────────────────────────────────────────
const ESShipmentWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(INITIAL_STATE);

  // Actualiza una sección del estado sin mutar el resto
  const updateData = useCallback((patch) => {
    setWizardData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStep = (n) => { if (n < currentStep) setCurrentStep(n); };

  // Render del paso activo
  const renderStep = () => {
    const props = { data: wizardData, updateData, onNext: goNext, onBack: goBack };
    switch (currentStep) {
      case 1: return <Step1PackageDetails {...props} />;
      case 2: return <Step2Addresses {...props} />;
      case 3: return <Step3Summary {...props} />;
      case 4: return <Step4Payment {...props} />;
      default: return null;
    }
  };

  return (
    <div className="es-wizard">
      {/* ── Barra de progreso superior ── */}
      <div className="es-wizard__header">
        <div className="es-wizard__steps">
          {STEPS.map((step, idx) => {
            const status =
              currentStep > step.id ? 'done' :
              currentStep === step.id ? 'active' : 'pending';

            return (
              <React.Fragment key={step.id}>
                {/* Nodo de paso */}
                <button
                  className={`es-wizard__step es-wizard__step--${status}`}
                  onClick={() => goToStep(step.id)}
                  disabled={status === 'pending'}
                  aria-current={status === 'active' ? 'step' : undefined}
                >
                  <span className="es-wizard__step-circle">
                    {status === 'done' ? '✓' : step.id}
                  </span>
                  <span className="es-wizard__step-label">{step.label}</span>
                </button>

                {/* Conector entre pasos */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`es-wizard__connector ${
                      currentStep > step.id ? 'es-wizard__connector--done' : ''
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Contenido del paso activo ── */}
      <div className="es-wizard__body">
        {renderStep()}
      </div>
    </div>
  );
};

export default ESShipmentWizard;