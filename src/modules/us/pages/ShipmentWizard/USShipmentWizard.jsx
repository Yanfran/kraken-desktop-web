// src/modules/es/pages/ShipmentWizard/ESShipmentWizard.jsx
import React, { useState, useCallback } from 'react';
import { calculateSpainShipping } from '../../../../services/es/spainCalculatorService';
import toast from 'react-hot-toast';
import { fetchMunicipios } from '../../../../services/es/spainAddressService';
import Step1PackageDetails from './steps/Step1PackageDetails';
import Step2Addresses from './steps/Step2Addresses';
import Step3CourierSelection from './steps/Step3CourierSelection';
import Step4Summary          from './steps/Step3Summary';   // renombrar import alias
import Step5Payment          from './steps/Step4Payment';   // renombrar import
import './USShipmentWizard.scss'; 

const STEPS = [
  { id: 1, label: 'Detalles del Envío'  },
  { id: 2, label: 'Recogida y Entrega'  },
  { id: 3, label: 'Servicio de Recogida'},  // ← nuevo paso SendSei
  { id: 4, label: 'Resumen'             },
  { id: 5, label: 'Pago'                },
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

  courierId:        null,   // ID del courier seleccionado (ej: 3)
  courierServiceId: null,   // ID del servicio seleccionado (ej: 4)
  courierQuote:     null,   // Objeto completo del quote seleccionado

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
  const handleStep2Next = async ({ destList = [], originList = [] } = {}) => {
      const pkg     = wizardData.packages[0];
      const destino = destList.find((d) => d.id === wizardData.destinationAddressId);

      // ✅ Guard: igual que Venezuela valida estado antes de calcular
      if (!destino) {
          toast.error('Por favor selecciona una dirección de destino.');
          return;
      }

      // ✅ Igual que Calculator.jsx usa el state seleccionado directamente,
      // aquí usamos el idEstado ya enriquecido por Step2Addresses
      const stateId = destino.idEstado ?? null;

      if (!stateId) {
          toast.error('No se pudo determinar el estado de la dirección. Intenta crear la dirección de nuevo.');
          console.error('❌ [ESWizard] destino sin idEstado:', destino);
          return;
      }

      // ── Resolver municipalityId ──────────────────────────────────────────────
      let municipioId = destino?.idMunicipio ?? null;

      if (!municipioId && stateId) {
        try {
          const municipios = await fetchMunicipios(stateId);
          if (municipios.length > 0) {
            municipioId = municipios[0].id;
            console.log(`🏙️ municipio fallback: ${municipios[0].id} (${municipios[0].name})`);
          }
        } catch (e) {
          console.warn('⚠️ No se pudo obtener municipio:', e);
        }
      }

      // ── Para España necesitamos enviarlo en KG al backend ──
      const pesoRaw = parseFloat(pkg.peso) || 0;
      const pesoKg  = pkg.unidadPeso?.toLowerCase() === 'lb'
        ? parseFloat((pesoRaw / 2.20462).toFixed(2))
        : pesoRaw;

      // ── Dimensiones ──
      const largo = parseFloat(pkg.largo) || 0;
      const ancho = parseFloat(pkg.ancho) || 0;
      const alto  = parseFloat(pkg.alto)  || 0;

      setCalculating(true);
      
      // ── Llamada sincronizada con nuestro SpainCalculatorController ──
      const result = await calculateSpainShipping({
        weight:         pesoKg,
        length:         largo,
        width:          ancho,
        height:         alto,
        declaredValue:  parseFloat(pkg.valorFOB) || 0,
      });
      
      setCalculating(false)

      if (!result.success) {
        toast.error(result.message || 'No se pudo calcular la tarifa.');
        return;
      }

       const selectedOrigin = originList.find((a) => a.id === wizardData.originAddressId) ?? null;

      updateData({
        calculationResult:          result,
        selectedOriginAddress:      selectedOrigin,
        selectedDestinationAddress: destino,
      });
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
            calculating={calculating}
            onNext={handleStep2Next}   // handleStep2Next ya llama setCurrentStep(3) al final
          />
        );

      case 3:  // ← NUEVO: selección del courier de recogida
        return (
          <Step3CourierSelection
            {...commonProps}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );

      case 4:  // era case 3
        return (
          <Step4Summary
            {...commonProps}
            onNext={() => setCurrentStep(5)}
            onEditPackage={()    => setCurrentStep(1)}
            onEditAddresses={() => setCurrentStep(2)}
          />
        );

      case 5:  // era case 4
        return (
          <Step5Payment
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
    <div className="us-wizard">
      <div className="us-wizard__header">
        <div className="us-wizard__steps">
          {STEPS.map((step, idx) => {
            const status =
              currentStep > step.id  ? 'done'   :
              currentStep === step.id ? 'active' : 'pending';

            return (
              <React.Fragment key={step.id}>
                <button
                  className={`us-wizard__step us-wizard__step--${status}`}
                  onClick={() => goToStep(step.id)}
                  disabled={status === 'pending'}
                  aria-current={status === 'active' ? 'step' : undefined}
                >
                  <span className="us-wizard__step-circle">
                    {status === 'done' ? '✓' : step.id}
                  </span>
                  <span className="us-wizard__step-label">{step.label}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`us-wizard__connector ${
                      currentStep > step.id ? 'us-wizard__connector--done' : ''
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="us-wizard__body">
        {renderStep()}
      </div>
    </div>
  );
};

export default ESShipmentWizard;