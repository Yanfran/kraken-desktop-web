// src/modules/es/pages/ShipmentWizard/ESShipmentWizard.jsx
import React, { useState, useCallback } from 'react';
import { calculateSpainShipping } from '../../../../services/es/spainCalculatorService';
import toast from 'react-hot-toast';
import { fetchMunicipios } from '../../../../services/es/spainAddressService';
import Step1PackageDetails from './steps/Step1PackageDetails';
import Step2Addresses from './steps/Step2Addresses';
import Step3Summary from './steps/Step3Summary';
import Step4Payment from './steps/Step4Payment';
import './ESShipmentWizard.scss';

const STEPS = [
  { id: 1, label: 'Detalles del Envío' },
  { id: 2, label: 'Recogida y Entrega' },
  { id: 3, label: 'Resumen' },
  { id: 4, label: 'Pago' },
];

const INITIAL_STATE = {
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
  originAddressId:      null,
  destinationAddressId: null,

  // ── CAMBIO 2: reemplazar "pricing: null" por "calculationResult: null" ─────
  // ANTES ERA: pricing: null,
  calculationResult: null,   // { cost, weightLbVol, deliveryOptions, breakdowns:{oficina,domicilio} }
  // ──────────────────────────────────────────────────────────────────────────

  seguroActivo: false,
  metodoPago: 'card',
  cardData: {
    numero:     '',
    expiracion: '',
    cvv:        '',
    titular:    '',
    guardar:    false,
  },
};

const ESShipmentWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData,  setWizardData]  = useState(INITIAL_STATE);

  // ── CAMBIO 3: añadir estado "calculating" ─────────────────────────────────
  const [calculating, setCalculating] = useState(false);
  // ──────────────────────────────────────────────────────────────────────────

  const updateData = useCallback((patch) => {
    setWizardData((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── CAMBIO 4: eliminar "goNext" y agregar "handleStep2Next" ───────────────
  // ANTES ERA: const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  //
  // Step2Addresses llama a onNext(destList) pasando su array local de destinos.
  // Aquí buscamos el que tiene el id seleccionado para extraer idEstado/idMunicipio.
  const handleStep2Next = async (destList = []) => {
    const pkg     = wizardData.packages[0];
    const destino = destList.find((d) => d.id === wizardData.destinationAddressId);

    // ── Resolver municipalityId ──────────────────────────────────────────────
    // Para destinos tipo "store" idMunicipio es null (tiendas no tienen municipio).
    // El backend necesita al menos un municipioId para calcular la tarifa en CCS.
    // Solución: si no hay municipio, fetch el primero disponible del estado destino.
    let municipioId = destino?.idMunicipio ?? null;

    if (!municipioId && destino?.idEstado) {
      try {
        const municipios = await fetchMunicipios(destino.idEstado);
        if (municipios.length > 0) {
          municipioId = municipios[0].id;
          console.log(`🏙️ Store destino → municipio fallback: ${municipios[0].id} (${municipios[0].name})`);
        }
      } catch (e) {
        console.warn('⚠️ No se pudo obtener municipio del estado destino:', e);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    // Peso → libras
    const pesoRaw = parseFloat(pkg.peso) || 0;
    const pesoLb  = pkg.unidadPeso?.toLowerCase() === 'kg'
      ? parseFloat((pesoRaw * 2.20462).toFixed(2))
      : pesoRaw;

    // Dimensiones
    const largo = parseFloat(pkg.largo) || 0;
    const ancho = parseFloat(pkg.ancho) || 0;
    const alto  = parseFloat(pkg.alto)  || 0;
    const dims  = (largo > 0 && ancho > 0 && alto > 0)
      ? { length: largo, width: ancho, height: alto }
      : null;

    setCalculating(true);
    const result = await calculateSpainShipping({
      stateId:        destino?.idEstado   ?? 24,
      municipalityId: municipioId,               // ← ya resuelto arriba
      declaredValue:  parseFloat(pkg.valorFOB) || 0,
      weight:         pesoLb,
      weightUnit:     'Lb',
      dimensionUnit:  'cm',
      dimensions:     dims,
      content:        pkg.descripcion || 'General',
    });
    setCalculating(false);

    if (!result.success) {
      toast.error(result.message || 'No se pudo calcular la tarifa.');
      return;
    }

    updateData({ calculationResult: result.data });
    setCurrentStep(3);
  };
  // ──────────────────────────────────────────────────────────────────────────

  // ── CAMBIO 5: actualizar renderStep ───────────────────────────────────────
  // ANTES ERA:
  //   const props = { data: wizardData, updateData, onNext: goNext, onBack: goBack };
  //   switch: case 1/2/3/4 usaban el mismo "props" genérico
  //
  // AHORA: cada case tiene sus propios props, Step2 recibe calculating + handleStep2Next
  const goBack   = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStep = (n) => { if (n < currentStep) setCurrentStep(n); };

  const renderStep = () => {
    const commonProps = { data: wizardData, updateData, onBack: goBack };

    switch (currentStep) {
      case 1:
        return (
          <Step1PackageDetails
            {...commonProps}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Step2Addresses
            {...commonProps}
            calculating={calculating}    // ← para deshabilitar botón mientras calcula
            onNext={handleStep2Next}     // ← recibe destList al invocarlo
          />
        );
      case 3:
        return (
          <Step3Summary
            {...commonProps}
            onNext={() => setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <Step4Payment
            {...commonProps}
            onNext={() => {}}
          />
        );
      default:
        return null;
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="es-wizard">
      <div className="es-wizard__header">
        <div className="es-wizard__steps">
          {STEPS.map((step, idx) => {
            const status =
              currentStep > step.id  ? 'done'   :
              currentStep === step.id ? 'active' : 'pending';

            return (
              <React.Fragment key={step.id}>
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

      <div className="es-wizard__body">
        {renderStep()}
      </div>
    </div>
  );
};

export default ESShipmentWizard;