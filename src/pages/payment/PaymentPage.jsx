// src/pages/Payment/PaymentPage.jsx - C2P + P2C + DÉBITO INMEDIATO + CRÉDITO INMEDIATO
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import styles from './PaymentPage.module.scss';

import {
  IoPhonePortraitOutline,
  IoCardOutline,
  IoArrowForward,
  IoArrowBack,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCheckmark,
  IoChevronDown,
  IoChevronUp,
  IoShieldCheckmarkOutline,
  IoReceiptOutline,
  IoBusinessOutline,
} from 'react-icons/io5';

import {
  getGuiaById,
  getMultipleGuiasPaymentData,
} from '@/services/guiasService';
import {
  processMegasoftC2PPayment,
  processMegasoftP2CPayment,
  processMegasoftDIAutorizar,
  processMegasoftDIConfirmar,
  processMegasoftCreditoInmediato,
} from '@/services/payment/paymentService';

// ============================================================
// CONSTANTES
// ============================================================
const PHONE_CODES = [
  { code: '0412', carrier: 'Digitel' },
  { code: '0422', carrier: 'Digitel' },
  { code: '0414', carrier: 'Movistar' },
  { code: '0424', carrier: 'Movistar' },
  { code: '0416', carrier: 'Movilnet' },
  { code: '0426', carrier: 'Movilnet' },
];

const ID_TYPES = [
  { code: 'V', name: 'Venezolano' },
  { code: 'E', name: 'Extranjero' },
];

const BANCOS_VENEZUELA = [
  { code: '0102', name: 'Banco de Venezuela' },
  { code: '0104', name: 'Venezolano de Crédito' },
  { code: '0105', name: 'Banco Mercantil' },
  { code: '0108', name: 'BBVA Provincial' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0115', name: 'Banco Exterior' },
  { code: '0128', name: 'Banco Caroní' },
  { code: '0134', name: 'Banesco' },
  { code: '0137', name: 'Banco Sofitasa' },
  { code: '0138', name: 'Banco Plaza' },
  { code: '0146', name: 'Bangente' },
  { code: '0151', name: 'Banco Fondo Común' },
  { code: '0156', name: '100% Banco' },
  { code: '0157', name: 'Delsur' },
  { code: '0163', name: 'Banco del Tesoro' },
  { code: '0168', name: 'Bancrecer' },
  { code: '0169', name: 'R4 Banco' },
  { code: '0171', name: 'Banco Activo' },
  { code: '0172', name: 'Bancamiga' },
  { code: '0173', name: 'Banco Internacional' },
  { code: '0174', name: 'Banplus' },
  { code: '0175', name: 'Banco Digital' },
  { code: '0177', name: 'Banfanb' },
  { code: '0178', name: 'N58 Banco' },
  { code: '0191', name: 'Banco Nacional de Crédito' },
];

const MEGASOFT_ERROR_HINTS = {
  A0: 'Credenciales del comercio inválidas. Contacta a soporte.',
  V0: 'Datos enviados inválidos. Verifica la cédula, teléfono y banco.',
  P0: 'Error de configuración del servicio de pagos. Intenta más tarde.',
  EX: 'Ocurrió un error inesperado procesando el pago.',
  fondos: 'Fondos insuficientes en tu cuenta. Verifica tu saldo.',
  saldo: 'Saldo insuficiente para completar la operación.',
  clave: 'La clave es incorrecta. Solicita una nueva a tu banco.',
  codigo: 'El código es incorrecto o ya expiró.',
  otp: 'El código OTP es incorrecto o ya expiró.',
  limite: 'Has superado el límite diario de tu banco.',
  timeout: 'Tu banco tardó demasiado en responder. Intenta nuevamente.',
  rechaz: 'Tu banco rechazó la operación. Contacta a tu banco.',
  'no disponible': 'El servicio del banco no está disponible en este momento.',
};

const extractMegasoftError = (response) => {
  const data = response?.data || {};
  const backendMessage = response?.message || '';
  const megasoftCode = data.responseCode || data.ResponseCode || '';
  const megasoftMsg = data.responseMessage || data.ResponseMessage || '';

  if (megasoftCode && MEGASOFT_ERROR_HINTS[megasoftCode]) {
    return {
      title: 'Pago rechazado',
      message: MEGASOFT_ERROR_HINTS[megasoftCode],
      code: megasoftCode,
      technicalDetail: megasoftMsg || backendMessage,
    };
  }

  const fullText = `${megasoftMsg} ${backendMessage}`.toLowerCase();
  for (const [keyword, hint] of Object.entries(MEGASOFT_ERROR_HINTS)) {
    if (keyword.length > 2 && fullText.includes(keyword)) {
      return {
        title: 'Pago rechazado',
        message: hint,
        code: megasoftCode || 'N/A',
        technicalDetail: megasoftMsg || backendMessage,
      };
    }
  }

  return {
    title: 'No pudimos procesar el pago',
    message:
      megasoftMsg || backendMessage || 'Error desconocido al procesar el pago.',
    code: megasoftCode || 'N/A',
    technicalDetail: backendMessage,
  };
};

// ============================================================
// COMPONENTE
// ============================================================
export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn } = useAuth();
  const { actualTheme } = useTheme();

  // Estados principales
  const [step, setStep] = useState('loading'); // loading | method | form | otp | success | error
  const [paymentMethod, setPaymentMethod] = useState('p2c');
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  // Pago múltiple
  const multipleIds = searchParams.get('multiple');
  const isMultiplePayment = !!multipleIds;
  const [guiasDetails, setGuiasDetails] = useState([]);

  // Formulario común
  const [idType, setIdType] = useState('V');
  const [idNumber, setIdNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('0414');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('0105');

  // C2P
  const [twofactorAuth, setTwofactorAuth] = useState('');

  // P2C
  const [p2cReferencia, setP2cReferencia] = useState('');

  // DI / CI — selector de identificación
  const [diIdMethod, setDiIdMethod] = useState('telefono'); // 'telefono' | 'cuenta'
  const [cuentaCliente, setCuentaCliente] = useState('');

  // DI — flujo OTP
  const [otpCode, setOtpCode] = useState('');
  const [diControl, setDiControl] = useState('');
  const [diPagoId, setDiPagoId] = useState(null);
  const [diMontoGuardado, setDiMontoGuardado] = useState(0);

  // Dropdowns
  const [showIdTypes, setShowIdTypes] = useState(false);
  const [showPhoneCodes, setShowPhoneCodes] = useState(false);
  const [showBanks, setShowBanks] = useState(false);

  // Resultado
  const [paymentReference, setPaymentReference] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');

  // Detalles guía múltiple
  const [showGuiasDetails, setShowGuiasDetails] = useState(false);

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }
    loadPaymentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isSignedIn, navigate]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowIdTypes(false);
      setShowPhoneCodes(false);
      setShowBanks(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ============================================================
  // CARGAR DATOS
  // ============================================================
  const loadPaymentData = async () => {
    try {
      setDataLoading(true);
      setDataError('');

      if (isMultiplePayment) {
        const guiaIds = multipleIds.split(',').map(Number);
        const response = await getMultipleGuiasPaymentData(guiaIds);

        if (response.success && response.data) {
          const data = response.data;
          setPaymentData({
            isMultiple: true,
            guiaIds,
            trackingNumbers: data.trackingNumbers || [],
            amount: data.amount || 0,
            amount_usd: data.amount_usd || 0,
            tasaCambio: data.detalle?.tasaCambio || 102.16,
            detalle: data.detalle,
            aranceles: data.aranceles,
          });
          setGuiasDetails(data.detalle?.guias || []);
          setAmount(data.amount?.toFixed(2) || '0.00');
          setStep('method');
        } else {
          setDataError(response.message || 'Error al cargar datos de pago múltiple');
          setStep('loading');
        }
      } else {
        const response = await getGuiaById(parseInt(id));
        if (response.success) {
          setPaymentData({
            isMultiple: false,
            idGuia: response.data.idGuia,
            trackingNumber: response.data.nGuia,
            amount: response.data.detalleFactura.precioTotal,
            tasaCambio: response.data.detalleFactura.tasaCambio || 102.16,
            detalle: response.data.detalleFactura,
          });
          setAmount(response.data.detalleFactura.precioTotal.toFixed(2));
          setStep('method');
        } else {
          setDataError(response.message || 'Error al cargar datos de pago');
          setStep('loading');
        }
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      setDataError('Error de conexión al cargar los datos');
      setStep('loading');
    } finally {
      setDataLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const formatBolivar = (amt) => {
    if (isNaN(amt)) return '0,00 Bs.';
    return (
      amt.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' Bs.'
    );
  };

  const formatPhoneForMercantil = (code, num) => `58${code.replace(/^0/, '')}${num}`;

  const buildTelefonoLocal = () => `${phoneCode}${phoneNumber}`;

  const getNombreCompleto = () => {
    const nombres = user?.name || user?.nombres || '';
    const apellidos = user?.lastName || user?.apellidos || '';
    return `${nombres} ${apellidos}`.trim() || 'Cliente Kraken';
  };

  // ============================================================
  // VALIDACIÓN
  // ============================================================
  const validateForm = () => {
    if (!idNumber || idNumber.length < 6) {
      toast.error('El número de identificación debe tener al menos 6 dígitos');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }

    if (paymentMethod === 'c2p') {
      if (!selectedBank) return toast.error('Debes seleccionar el banco emisor'), false;
      if (!phoneNumber || phoneNumber.length !== 7)
        return toast.error('El número de teléfono debe tener 7 dígitos'), false;
      if (!twofactorAuth || !/^\d{8}$/.test(twofactorAuth))
        return toast.error('La clave C2P debe ser de 8 dígitos numéricos'), false;
    } else if (paymentMethod === 'p2c') {
      if (!selectedBank) return toast.error('Debes seleccionar el banco'), false;
      if (!phoneNumber || phoneNumber.length !== 7)
        return toast.error('El número de teléfono debe tener 7 dígitos'), false;
      if (!p2cReferencia || p2cReferencia.length < 4)
        return toast.error('Ingresa la referencia bancaria del pago realizado'), false;
    } else if (paymentMethod === 'debitoInmediato' || paymentMethod === 'creditoInmediato') {
      if (!selectedBank) return toast.error('Debes seleccionar el banco emisor'), false;
      if (diIdMethod === 'cuenta') {
        if (!cuentaCliente || cuentaCliente.length < 15)
          return toast.error('Ingresa un número de cuenta bancaria válido (20 dígitos)'), false;
      } else {
        if (!phoneNumber || phoneNumber.length !== 7)
          return toast.error('El número de teléfono debe tener 7 dígitos'), false;
      }
    }
    return true;
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleC2PPayment = async () => {
    if (!validateForm()) return;
    const customerId = `${idType}${idNumber}`;
    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const request = {
        customerId,
        nombreCompleto: getNombreCompleto(),
        originMobileNumber: formatPhoneForMercantil(phoneCode, phoneNumber),
        destinationBankId: selectedBank,
        amount: amount.toString(),
        codigoC2P: twofactorAuth,
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment ? paymentData.guiaIds : [paymentData.idGuia],
        isMultiplePayment,
      };

      const response = await processMegasoftC2PPayment(request);
      if (response.success) {
        const data = response.data || {};
        setPaymentReference(data.paymentReference || data.PaymentReference || '');
        setAuthorizationCode(data.authorizationCode || data.AuthorizationCode || '');
        setStep('success');
        toast.success('¡Pago procesado exitosamente!');
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (err) {
      console.error('Error C2P:', err);
      setError('Error de conexión');
      setErrorDetails({
        title: 'Error de conexión',
        message: 'No pudimos conectar con el servicio de pagos.',
        code: 'NETWORK',
        technicalDetail: err.message || '',
      });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleP2CPayment = async () => {
    if (!validateForm()) return;
    const customerId = `${idType}${idNumber}`;
    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const request = {
        customerId,
        nombreCompleto: getNombreCompleto(),
        originMobileNumber: buildTelefonoLocal(),
        destinationBankId: selectedBank,
        amount: amount.toString(),
        referencia: p2cReferencia,
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment ? paymentData.guiaIds : [paymentData.idGuia],
        isMultiplePayment,
      };

      const response = await processMegasoftP2CPayment(request);
      if (response.success) {
        const data = response.data || {};
        setPaymentReference(data.paymentReference || data.PaymentReference || '');
        setAuthorizationCode(data.authorizationCode || data.AuthorizationCode || '');
        setStep('success');
        toast.success('¡Pago P2C procesado exitosamente!');
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (err) {
      console.error('Error P2C:', err);
      setError('Error de conexión');
      setErrorDetails({
        title: 'Error de conexión',
        message: 'No pudimos conectar con el servicio de pagos.',
        code: 'NETWORK',
        technicalDetail: err.message || '',
      });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // DI Fase 1 — Autorizar
  const handleDIAutorizar = async () => {
    if (!validateForm()) return;
    const customerId = `${idType}${idNumber}`;
    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const request = {
        customerId,
        nombreCompleto: getNombreCompleto(),
        cuentaCliente: diIdMethod === 'cuenta' ? cuentaCliente : null,
        telefonoCliente: diIdMethod === 'telefono' ? buildTelefonoLocal() : null,
        codigoBanco: selectedBank,
        amount: amount.toString(),
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment ? paymentData.guiaIds : [paymentData.idGuia],
        isMultiplePayment,
      };

      const response = await processMegasoftDIAutorizar(request);
      if (response.success) {
        const data = response.data || {};
        setDiControl(data.control || '');
        setDiPagoId(data.pagoId || null);
        setDiMontoGuardado(parseFloat(amount));
        setStep('otp');
        toast.success('Revisa tu teléfono. Te enviamos un código OTP por SMS.', {
          duration: 6000,
        });
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (err) {
      console.error('Error DI Autorizar:', err);
      setError('Error de conexión');
      setErrorDetails({
        title: 'Error de conexión',
        message: 'No pudimos conectar con el servicio de pagos.',
        code: 'NETWORK',
        technicalDetail: err.message || '',
      });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // DI Fase 2 — Confirmar OTP
  const handleDIConfirmar = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error('Ingresa el código OTP que recibiste por SMS');
      return;
    }
    const customerId = `${idType}${idNumber}`;
    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const response = await processMegasoftDIConfirmar({
        control: diControl,
        pagoId: diPagoId,
        codigoOtp: otpCode,
        customerId,
        telefonoCliente: diIdMethod === 'telefono' ? buildTelefonoLocal() : null,
      });

      if (response.success) {
        const data = response.data || {};
        setPaymentReference(data.paymentReference || data.PaymentReference || '');
        setAuthorizationCode(data.authorizationCode || data.AuthorizationCode || '');
        setStep('success');
        toast.success('¡Pago confirmado exitosamente!');
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (err) {
      console.error('Error DI Confirmar:', err);
      setError('Error de conexión');
      setErrorDetails({
        title: 'Error de conexión',
        message: 'No pudimos conectar con el servicio de pagos.',
        code: 'NETWORK',
        technicalDetail: err.message || '',
      });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // CI — Crédito Inmediato
  const handleCreditoInmediato = async () => {
    if (!validateForm()) return;
    const customerId = `${idType}${idNumber}`;
    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const request = {
        customerId,
        nombreCompleto: getNombreCompleto(),
        cuentaCliente: diIdMethod === 'cuenta' ? cuentaCliente : null,
        telefonoCliente: diIdMethod === 'telefono' ? buildTelefonoLocal() : null,
        codigoBanco: selectedBank,
        amount: amount.toString(),
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment ? paymentData.guiaIds : [paymentData.idGuia],
        isMultiplePayment,
      };

      const response = await processMegasoftCreditoInmediato(request);
      if (response.success) {
        const data = response.data || {};
        setPaymentReference(data.paymentReference || data.PaymentReference || '');
        setAuthorizationCode(data.authorizationCode || data.AuthorizationCode || '');
        setStep('success');
        toast.success('¡Pago procesado exitosamente!');
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (err) {
      console.error('Error CI:', err);
      setError('Error de conexión');
      setErrorDetails({
        title: 'Error de conexión',
        message: 'No pudimos conectar con el servicio de pagos.',
        code: 'NETWORK',
        technicalDetail: err.message || '',
      });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToGuides = () => navigate('/guide/guides');

  const handleRetry = () => {
    setError('');
    setErrorDetails(null);
    setOtpCode('');
    setStep('form');
  };

  // ============================================================
  // RENDERS
  // ============================================================
  const renderGuiaInfo = () => (
    <div className={styles.guiaInfo}>
      <div className={styles.amountCard}>
        <p className={styles.amountLabel}>
          {isMultiplePayment ? 'Total a pagar:' : 'Monto a pagar:'}
        </p>
        <h2 className={styles.amountValue}>
          {formatBolivar(parseFloat(amount))}
        </h2>

        {isMultiplePayment && (
          <>
            <div className={styles.multipleNote}>
              <IoReceiptOutline size={16} />
              {` Pago por ${paymentData.guiaIds.length} guías`}
            </div>
            <button
              className={styles.toggleDetailsBtn}
              onClick={() => setShowGuiasDetails(!showGuiasDetails)}
            >
              {showGuiasDetails ? 'Ocultar detalles' : 'Ver detalles de cada guía'}
              {showGuiasDetails ? <IoChevronUp /> : <IoChevronDown />}
            </button>
            {showGuiasDetails && guiasDetails.length > 0 && (
              <div className={styles.guiasDetailsList}>
                {guiasDetails.map((guia, index) => (
                  <div key={index} className={styles.guiaDetailItem}>
                    <div className={styles.guiaDetailHeader}>
                      <span className={styles.guiaDetailTrack}>
                        {guia.trackingNumber || `Guía ${guia.guiaId}`}
                      </span>
                      <span className={styles.guiaDetailAmount}>
                        {formatBolivar(guia.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando información de pago...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className={styles.errorContainer}>
      <IoCloseCircleOutline size={64} color="#F44336" />
      <h2>Error al Cargar</h2>
      <p>{dataError}</p>
      <button onClick={() => navigate('/guide/guides')} className={styles.btn_primary}>
        Volver a Guías
      </button>
    </div>
  );

  const renderMethodSelection = () => (
    <div className={styles.methodContainer}>
      <h3 className={styles.stepTitle}>Selecciona el Método de Pago</h3>
      <p className={styles.stepDescription}>
        {isMultiplePayment
          ? `Elige cómo deseas realizar el pago para ${paymentData.guiaIds.length} guías`
          : 'Elige cómo deseas realizar el pago para tu guía'}
      </p>

      <div className={styles.methodOptions}>
        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'p2c' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('p2c')}
        >
          <div className={styles.methodIcon}><IoPhonePortraitOutline size={32} /></div>
          <h4>Pago Móvil P2C</h4>
          <p>Ya pagaste desde tu banco, solo envía la referencia</p>
        </div>

        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'c2p' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('c2p')}
        >
          <div className={styles.methodIcon}><IoPhonePortraitOutline size={32} /></div>
          <h4>Pago Móvil C2P</h4>
          <p>Autoriza con una clave de 8 dígitos de tu banco</p>
        </div>

        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'debitoInmediato' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('debitoInmediato')}
        >
          <div className={styles.methodIcon}><IoCardOutline size={32} /></div>
          <h4>Débito Inmediato</h4>
          <p>Paga con tu cuenta de débito, te enviaremos un OTP</p>
        </div>

        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'creditoInmediato' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('creditoInmediato')}
        >
          <div className={styles.methodIcon}><IoBusinessOutline size={32} /></div>
          <h4>Crédito Inmediato</h4>
          <p>Paga con tu cuenta de crédito directamente</p>
        </div>
      </div>

      <button onClick={() => setStep('form')} className={styles.btn_primary}>
        Continuar <IoArrowForward />
      </button>
    </div>
  );

  const renderPaymentForm = () => {
    const isDI = paymentMethod === 'debitoInmediato';
    const isCI = paymentMethod === 'creditoInmediato';
    const isInmediato = isDI || isCI;
    const isC2P = paymentMethod === 'c2p';
    const isP2C = paymentMethod === 'p2c';

    return (
      <div className={styles.formContainer}>
        <h3 className={styles.stepTitle}>
          {isC2P ? 'Datos del Pago Móvil C2P'
            : isP2C ? 'Datos del Pago Móvil P2C'
            : isDI ? 'Datos del Débito Inmediato'
            : 'Datos del Crédito Inmediato'}
        </h3>
        <p className={styles.stepDescription}>
          {isC2P ? 'Completa la información para realizar el pago C2P'
            : isP2C ? 'Ingresa los datos del pago móvil que ya realizaste'
            : isDI ? 'Recibirás un OTP por SMS para confirmar el pago'
            : 'Ingresa los datos de tu cuenta para el cobro directo'}
        </p>

        {/* Cédula */}
        <div className={styles.inputGroup}>
          <label>Cédula de Identidad</label>
          <div className={styles.combinedInput}>
            <div
              className={styles.dropdown}
              onClick={(e) => {
                e.stopPropagation();
                setShowIdTypes(!showIdTypes);
                setShowPhoneCodes(false);
              }}
            >
              <span>{idType}</span>
              {showIdTypes ? <IoChevronUp /> : <IoChevronDown />}
            </div>
            <input
              type="text"
              placeholder="12345678"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
              maxLength={9}
            />
          </div>
          {showIdTypes && (
            <div className={styles.dropdownMenu}>
              {ID_TYPES.map((type) => (
                <div
                  key={type.code}
                  className={styles.dropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdType(type.code);
                    setShowIdTypes(false);
                  }}
                >
                  {type.code} - {type.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banco — común a todos */}
        <div className={styles.inputGroup}>
          <label>Banco Emisor</label>
          <div
            className={styles.bankSelect}
            onClick={(e) => {
              e.stopPropagation();
              setShowBanks(!showBanks);
              setShowIdTypes(false);
              setShowPhoneCodes(false);
            }}
          >
            <span className={styles.bankSelected}>
              {BANCOS_VENEZUELA.find((b) => b.code === selectedBank)?.name ||
                'Selecciona un banco'}
            </span>
            {showBanks ? <IoChevronUp /> : <IoChevronDown />}
          </div>
          {showBanks && (
            <div className={styles.dropdownMenu}>
              {BANCOS_VENEZUELA.map((banco) => (
                <div
                  key={banco.code}
                  className={styles.dropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBank(banco.code);
                    setShowBanks(false);
                  }}
                >
                  {banco.code} - {banco.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selector cuenta/teléfono — solo DI/CI */}
        {isInmediato && (
          <div className={styles.inputGroup}>
            <label>¿Cómo identificas tu cuenta?</label>
            <div className={styles.idMethodToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  diIdMethod === 'telefono' ? styles.toggleBtnActive : ''
                }`}
                onClick={() => setDiIdMethod('telefono')}
              >
                <IoPhonePortraitOutline size={18} /> Por Teléfono
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  diIdMethod === 'cuenta' ? styles.toggleBtnActive : ''
                }`}
                onClick={() => setDiIdMethod('cuenta')}
              >
                <IoBusinessOutline size={18} /> Por Cuenta
              </button>
            </div>
          </div>
        )}

        {/* Teléfono — C2P, P2C, DI/CI con telefono */}
        {(isC2P || isP2C || (isInmediato && diIdMethod === 'telefono')) && (
          <div className={styles.inputGroup}>
            <label>Número de Teléfono</label>
            <div className={styles.combinedInput}>
              <div
                className={styles.dropdown}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhoneCodes(!showPhoneCodes);
                  setShowIdTypes(false);
                  setShowBanks(false);
                }}
              >
                <span>{phoneCode}</span>
                {showPhoneCodes ? <IoChevronUp /> : <IoChevronDown />}
              </div>
              <input
                type="text"
                placeholder="1234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={7}
              />
            </div>
            {showPhoneCodes && (
              <div className={styles.dropdownMenu}>
                {PHONE_CODES.map((phone) => (
                  <div
                    key={phone.code}
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoneCode(phone.code);
                      setShowPhoneCodes(false);
                    }}
                  >
                    {phone.code} - {phone.carrier}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cuenta bancaria — DI/CI con cuenta */}
        {isInmediato && diIdMethod === 'cuenta' && (
          <div className={styles.inputGroup}>
            <label>Número de Cuenta Bancaria</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="01050000001234567890"
              value={cuentaCliente}
              onChange={(e) =>
                setCuentaCliente(e.target.value.replace(/\D/g, '').slice(0, 20))
              }
              maxLength={20}
            />
            <small>Cuenta bancaria de 20 dígitos</small>
          </div>
        )}

        {/* Clave C2P */}
        {isC2P && (
          <div className={styles.inputGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IoShieldCheckmarkOutline size={18} /> Clave de pago (C2P)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="12345678"
              value={twofactorAuth}
              onChange={(e) =>
                setTwofactorAuth(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))
              }
              maxLength={8}
            />
            <small>Código C2P de 8 dígitos enviado por tu banco</small>
          </div>
        )}

        {/* Referencia P2C */}
        {isP2C && (
          <>
            <div className={styles.p2cInstructions}>
              <IoReceiptOutline size={20} />
              <div>
                <strong>¿Cómo funciona?</strong>
                <p>
                  Realiza un pago móvil desde tu banco al teléfono de Kraken Courier,
                  luego ingresa la <strong>referencia bancaria</strong> que tu banco te devolvió.
                </p>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IoReceiptOutline size={18} /> Referencia bancaria
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="00404963"
                value={p2cReferencia}
                onChange={(e) =>
                  setP2cReferencia(e.target.value.replace(/[^0-9]/g, '').slice(0, 15))
                }
                maxLength={15}
              />
              <small>Número de referencia que te dio tu banco</small>
            </div>
          </>
        )}

        {/* Aviso DI */}
        {isDI && (
          <div className={styles.p2cInstructions}>
            <IoShieldCheckmarkOutline size={20} />
            <div>
              <strong>Autorización en 2 pasos</strong>
              <p>
                Al continuar, tu banco enviará un <strong>código OTP por SMS</strong>{' '}
                que tendrás que ingresar en la siguiente pantalla.
              </p>
            </div>
          </div>
        )}

        {/* Aviso CI */}
        {isCI && (
          <div className={styles.p2cInstructions}>
            <IoShieldCheckmarkOutline size={20} />
            <div>
              <strong>Cobro directo a crédito</strong>
              <p>
                El monto será cargado directamente a tu cuenta de crédito sin pasos adicionales.
              </p>
            </div>
          </div>
        )}

        {/* Monto */}
        <div className={styles.inputGroup}>
          <label>Monto a Pagar</label>
          <input
            type="text"
            value={formatBolivar(parseFloat(amount))}
            disabled
            className={styles.disabled}
          />
        </div>

        {/* Botones */}
        <div className={styles.buttonRow}>
          <button
            onClick={() => setStep('method')}
            className={styles.btn_secondary}
            disabled={isLoading}
          >
            <IoArrowBack /> Volver
          </button>
          <button
            onClick={
              isC2P ? handleC2PPayment
                : isP2C ? handleP2CPayment
                : isDI ? handleDIAutorizar
                : handleCreditoInmediato
            }
            disabled={isLoading}
            className={styles.btn_primary}
          >
            {isLoading ? 'Procesando...' : isDI ? 'Solicitar OTP' : 'Realizar Pago'}
          </button>
        </div>
      </div>
    );
  };

  // Paso OTP (Fase 2 de DI)
  const renderOtpStep = () => (
    <div className={styles.formContainer}>
      <div className={styles.otpIconWrapper}>
        <IoShieldCheckmarkOutline size={64} />
      </div>

      <h3 className={styles.stepTitle}>Ingresa tu código OTP</h3>
      <p className={styles.stepDescription}>
        Tu banco te envió un código por SMS al teléfono asociado a tu cuenta.
        Ingrésalo aquí para confirmar el pago de{' '}
        <strong>{formatBolivar(diMontoGuardado)}</strong>.
      </p>

      <div className={styles.inputGroup}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IoShieldCheckmarkOutline size={18} /> Código OTP
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="1234567891"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
          maxLength={10}
          autoFocus
          className={styles.otpInput}
        />
        <small>El código puede tardar hasta 2 minutos en llegar</small>
      </div>

      <div className={styles.buttonRow}>
        <button
          onClick={() => {
            setOtpCode('');
            setDiControl('');
            setDiPagoId(null);
            setStep('form');
          }}
          className={styles.btn_secondary}
          disabled={isLoading}
        >
          <IoArrowBack /> Cancelar
        </button>
        <button
          onClick={handleDIConfirmar}
          disabled={isLoading || !otpCode}
          className={styles.btn_primary}
        >
          {isLoading ? 'Confirmando...' : 'Confirmar Pago'} <IoCheckmark />
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => {
    const methodLabel =
      paymentMethod === 'c2p' ? 'Pago Móvil C2P'
        : paymentMethod === 'p2c' ? 'Pago Móvil P2C'
        : paymentMethod === 'debitoInmediato' ? 'Débito Inmediato'
        : paymentMethod === 'creditoInmediato' ? 'Crédito Inmediato'
        : 'Tarjeta de Débito';

    return (
      <div className={styles.resultContainer}>
        <IoCheckmarkCircleOutline size={64} color="#4CAF50" />
        <h2>¡Pago Exitoso!</h2>
        <p>
          {isMultiplePayment
            ? `El pago para ${multipleIds.split(',').length} guías se procesó correctamente.`
            : `El pago para la guía ${paymentData.trackingNumber} se procesó correctamente.`}
        </p>

        <div className={styles.resultDetails}>
          <div className={styles.detailRow}>
            <span>Método:</span>
            <span>{methodLabel}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Cédula/RIF:</span>
            <span>{idType}{idNumber}</span>
          </div>
          {paymentReference && (
            <div className={styles.detailRow}>
              <span>Referencia:</span>
              <span>{paymentReference}</span>
            </div>
          )}
          {authorizationCode && (
            <div className={styles.detailRow}>
              <span>Código Autorización:</span>
              <span>{authorizationCode}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span>Monto:</span>
            <span>{formatBolivar(parseFloat(amount))}</span>
          </div>
        </div>

        <button onClick={handleBackToGuides} className={styles.btn_primary}>
          Volver a Mis Guías <IoCheckmark />
        </button>
      </div>
    );
  };

  const renderError = () => {
    const info = errorDetails || {
      title: 'Error en el proceso',
      message: error || 'Ocurrió un error inesperado',
      code: 'N/A',
      technicalDetail: '',
    };

    return (
      <div className={styles.errorContainerDetailed}>
        <div className={styles.errorIconWrapper}>
          <IoCloseCircleOutline size={80} />
        </div>
        <h2 className={styles.errorTitle}>{info.title}</h2>
        <p className={styles.errorMessage}>{info.message}</p>

        {(info.code !== 'N/A' || info.technicalDetail) && (
          <div className={styles.errorDetailsCard}>
            {info.code && info.code !== 'N/A' && (
              <div className={styles.errorDetailRow}>
                <span>Código</span>
                <span className={styles.errorCode}>{info.code}</span>
              </div>
            )}
            {info.technicalDetail && info.technicalDetail !== info.message && (
              <div className={styles.errorDetailRow}>
                <span>Detalle</span>
                <span className={styles.errorTechnical}>{info.technicalDetail}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.errorSuggestions}>
          <h4>¿Qué puedes hacer?</h4>
          <ul>
            <li>Verifica que los datos ingresados sean correctos</li>
            <li>Asegúrate de tener saldo suficiente en tu cuenta</li>
            <li>Si usaste OTP, solicita uno nuevo y vuelve a intentar</li>
            <li>Si el problema persiste, contacta a soporte de Kraken Courier</li>
          </ul>
        </div>

        <div className={styles.buttonRow}>
          <button onClick={handleRetry} className={styles.btn_secondary}>
            <IoArrowBack style={{ marginBottom: -4 }} /> Reintentar
          </button>
          <button onClick={handleBackToGuides} className={styles.btn_primary}>
            Volver a Guías
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // HEADER TITLE
  // ============================================================
  const getHeaderTitle = () => {
    if (step === 'loading') return 'Procesando';
    if (step === 'method') return 'Método de Pago';
    if (step === 'otp') return 'Confirmación OTP';
    if (step === 'success') return 'Pago Exitoso';
    if (step === 'error') return 'Error de Pago';
    if (step === 'form') {
      if (paymentMethod === 'c2p') return 'Pago Móvil C2P';
      if (paymentMethod === 'p2c') return 'Pago Móvil P2C';
      if (paymentMethod === 'debitoInmediato') return 'Débito Inmediato';
      if (paymentMethod === 'creditoInmediato') return 'Crédito Inmediato';
    }
    return 'Pago';
  };

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{getHeaderTitle()}</h1>
      </div>

      <div className={styles.content}>
        {step === 'loading' && dataLoading && renderLoadingState()}
        {step === 'loading' && !dataLoading && dataError && renderErrorState()}

        {step !== 'loading' && paymentData && (
          <>
            {renderGuiaInfo()}
            {step === 'method' && renderMethodSelection()}
            {step === 'form' && renderPaymentForm()}
            {step === 'otp' && renderOtpStep()}
            {step === 'success' && renderSuccess()}
            {step === 'error' && renderError()}
          </>
        )}
      </div>
    </div>
  );
}