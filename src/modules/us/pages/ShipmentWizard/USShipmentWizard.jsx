// src/modules/es/pages/ShipmentWizard/ESShipmentWizard.jsx
import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import WizardAuthModal from './WizardAuthModal';
import { calculateUSShipping } from '../../../../services/us/usCalculatorService';
import { addDestinationAddress } from '../../../../services/es/spainAddressService';
import { addUsaOriginAddress } from '../../../../services/us/usAddressService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { fetchMunicipios } from '../../../../services/es/spainAddressService';
import Step1PackageDetails from './steps/Step1PackageDetails';
import Step2Addresses from './steps/Step2Addresses';
import Step3CourierSelection from './steps/Step3CourierSelection';
import Step4Summary          from './steps/Step3Summary';
import Step5Payment          from './steps/Step4Payment';
import {
  IoCubeOutline,
  IoLocationOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoCardOutline,
  IoCheckmarkOutline,
} from 'react-icons/io5';
import './USShipmentWizard.scss';

const STEP_ICONS = [
  <IoCubeOutline size={18} />,
  <IoLocationOutline size={18} />,
  <IoCarOutline size={18} />,
  <IoDocumentTextOutline size={18} />,
  <IoCardOutline size={18} />,
];

const INITIAL_STATE = {
  packages: [
    {
      id: Date.now(),
      largo: '',
      ancho: '',
      alto: '',
      peso: '',
      unidadPeso: 'lb',
      tipoPaquete: 'Caja',
      valorFOB: '',
      descripcion: '',
    },
  ],
  senderName:           '',
  senderLastName:       '',
  senderEmail:          '',
  originAddressId:      null,
  destinationAddressId: null,

  // ── CAMBIO 2: reemplazar "pricing: null" por "calculationResult: null" ─────
  // ANTES ERA: pricing: null,
  calculationResult: null,   // { cost, weightLbVol, deliveryOptions, breakdowns:{oficina,domicilio} }
  // ──────────────────────────────────────────────────────────────────────────

  courierId:        null,   // ID del courier seleccionado (ej: 3)
  courierServiceId: null,   // ID del servicio seleccionado (ej: 4)
  courierQuote:     null,   // Objeto completo del quote seleccionado
  discounts:        null,   // { pickup: { porcentaje, nombre }, dropoff: { porcentaje, nombre } }

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentStep,    setCurrentStep]    = useState(1);
  const [wizardData,     setWizardData]     = useState(INITIAL_STATE);
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [pendingStep4,   setPendingStep4]   = useState(false);

  const STEPS = [
    { id: 1, label: t('us_wizard.step1'), icon: STEP_ICONS[0] },
    { id: 2, label: t('us_wizard.step2'), icon: STEP_ICONS[1] },
    { id: 3, label: t('us_wizard.step3'), icon: STEP_ICONS[2] },
    { id: 4, label: t('us_wizard.step4'), icon: STEP_ICONS[3] },
    { id: 5, label: t('us_wizard.step5'), icon: STEP_ICONS[4] },
  ];

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
          toast.error(t('us_wizard.error_dest'));
          return;
      }

      // ✅ Igual que Calculator.jsx usa el state seleccionado directamente,
      // aquí usamos el idEstado ya enriquecido por Step2Addresses
      const stateId = destino.idEstado ?? null;

      if (!stateId) {
          toast.error(t('us_wizard.error_state'));
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

      const lockerId = destino?.idLocker ?? null;

      // ── Peso en KG para enviar al backend (que convierte internamente a lbs) ──
      const pesoRaw = parseFloat(pkg.peso) || 0;
      const pesoKg  = pkg.unidadPeso?.toLowerCase() === 'lb'
        ? parseFloat((pesoRaw / 2.20462).toFixed(2))
        : pesoRaw;

      setCalculating(true);

      const result = await calculateUSShipping({
        stateId,
        municipalityId: municipioId,
        lockerId,
        weight:        pesoKg,
        weightUnit:    'Kg',
        declaredValue: parseFloat(pkg.valorFOB) || 0,
      });

      
      setCalculating(false)

      if (!result.success) {
        toast.error(result.message || t('us_wizard.error_calc'));
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
            onNext={() => {
              if (!user) {
                setPendingStep4(true);
                setShowAuthModal(true);
              } else {
                setCurrentStep(4);
              }
            }}
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
                    {status === 'done' ? <IoCheckmarkOutline size={18} /> : step.icon}
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

      {showAuthModal && (
        <WizardAuthModal
          email={wizardData.senderEmail}
          name={wizardData.senderName}
          lastName={wizardData.senderLastName}
          onSuccess={async () => {
            // Sync local (guest) addresses to backend with the newly obtained clientId
            try {
              const raw = JSON.parse(localStorage.getItem('userData') ?? '{}');
              const newClientId = raw?.id ? Number(raw.id) : null;
              const patches = {};

              if (newClientId && wizardData.localOriginFormData) {
                const res = await addUsaOriginAddress({ clientId: newClientId, ...wizardData.localOriginFormData, idPais: 2 });
                if (res.success && res.data?.id) {
                  patches.originAddressId = res.data.id;
                  patches.localOriginFormData = null;
                }
              }

              if (newClientId && wizardData.localDestFormData) {
                const res = await addDestinationAddress({ clientId: newClientId, ...wizardData.localDestFormData });
                if (res.success && res.data?.id) {
                  patches.destinationAddressId = res.data.id;
                  patches.localDestFormData = null;
                }
              }

              if (Object.keys(patches).length) updateData(patches);
            } catch (e) {
              console.warn('[WizardSync] Error al sincronizar direcciones:', e);
            }

            setShowAuthModal(false);
            if (pendingStep4) { setPendingStep4(false); setCurrentStep(4); }
          }}
          onCancel={() => { setShowAuthModal(false); setPendingStep4(false); }}
        />
      )}
    </div>
  );
};

export default ESShipmentWizard;