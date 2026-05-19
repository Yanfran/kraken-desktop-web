// src/pages/Payment/PaymentPage.jsx - C2P + P2C + DÉBITO INMEDIATO + CRÉDITO INMEDIATO + TARJETA CRÉDITO
import React, { useState, useEffect, useRef  } from 'react';
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
  IoLockClosedOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
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
  megasoftTCCrearToken,
  megasoftTCVerificarToken,
  megasoftTCPreregistro,
  megasoftTCCobrar,
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
  EX: 'Plataforma transaccional no disponible. Por favor intenta más tarde.',
  EE: 'La transacción venció el tiempo de espera y fue revertida automáticamente. Tu dinero NO fue debitado.',
  XA: 'El banco tardó demasiado en responder y la operación fue cancelada. Tu dinero NO fue debitado.',
  51: 'No tienes saldo suficiente en tu cuenta para cubrir este monto.',
  52: 'La cuenta no está habilitada para este tipo de operación.',
  54: 'La tarjeta o cuenta ha expirado. Contacta a tu banco.',
  55: 'Clave o PIN incorrecto. Verifica e intenta nuevamente.',
  57: 'Transacción no permitida para este tipo de cuenta.',
  61: 'Has superado el límite de monto permitido por tu banco.',
  65: 'Has superado el límite de transacciones permitidas hoy.',
  AG: 'Los datos ingresados no corresponden a ninguna cuenta bancaria registrada. Verifica tu cédula, teléfono y banco.',
  99: 'El número de referencia ingresado no fue encontrado en el sistema bancario.',
  fondos: 'Fondos insuficientes en tu cuenta. Verifica tu saldo.',
  saldo: 'Saldo insuficiente para completar la operación.',
  'not sufficient': 'No tienes saldo suficiente en tu cuenta para cubrir este monto.',
  'insufficient': 'No tienes saldo suficiente en tu cuenta para cubrir este monto.',
  clave: 'La clave es incorrecta. Solicita una nueva a tu banco.',
  codigo: 'El código es incorrecto o ya expiró.',
  otp: 'El código OTP es incorrecto o ya expiró.',
  limite: 'Has superado el límite diario de tu banco.',
  timeout: 'Tu banco tardó demasiado en responder. Intenta nuevamente.',
  rechaz: 'Tu banco rechazó la operación. Contacta a tu banco.',
  'no disponible': 'El servicio del banco no está disponible en este momento.',
  reversada: 'La transacción fue revertida automáticamente. Tu dinero NO fue debitado.',
};

const TIMEOUT_ERROR_CODES = new Set(['EE', 'XA']);
const FUNDS_ERROR_CODES = new Set(['51', '52', '61', '65']);
const DATA_ERROR_CODES = new Set(['AG', 'V0', '99']);
const PLATFORM_ERROR_CODES = new Set(['EX', 'P0', 'A0', 'EE', 'XA']);
const PLATFORM_ERROR_KEYWORDS = ['no disponible', 'timeout', 'plataforma', 'servicio', 'interno megasoft'];

// ============================================================
// TC SESSION — sessionStorage (se borra al cerrar la pestaña)
// ============================================================
const TC_SESSION_KEY = 'megasoft_tc_session';

const tcLoadSessionData = () => {
  try {
    const raw = sessionStorage.getItem(TC_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};

const tcClearSessionData = () => {
  try { sessionStorage.removeItem(TC_SESSION_KEY); } catch (_) {}
};

const extractMegasoftError = (response) => {
  const data = response?.data || {};
  const backendMessage = response?.message || '';
  const megasoftCode = data.responseCode || data.ResponseCode || '';
  const megasoftMsg = data.responseMessage || data.ResponseMessage || '';
  const fullText = `${megasoftMsg} ${backendMessage}`.toLowerCase();

  const isPlatformError = (code, text) =>
    PLATFORM_ERROR_CODES.has(code) ||
    PLATFORM_ERROR_KEYWORDS.some((kw) => text.includes(kw));

  if (megasoftCode && MEGASOFT_ERROR_HINTS[megasoftCode]) {
    const isTimeout = TIMEOUT_ERROR_CODES.has(megasoftCode);
    const isFundsError = FUNDS_ERROR_CODES.has(megasoftCode);
    const isDataError = DATA_ERROR_CODES.has(megasoftCode);
    return {
      title: isTimeout
        ? 'Tiempo de espera agotado'
        : isFundsError
        ? 'Fondos insuficientes'
        : isDataError
        ? 'Datos incorrectos'
        : isPlatformError(megasoftCode, fullText)
        ? 'Servicio no disponible'
        : 'Pago no procesado',
      message: MEGASOFT_ERROR_HINTS[megasoftCode],
      code: megasoftCode,
      technicalDetail: megasoftMsg || backendMessage,
      isTimeout,
      isFundsError,
      isDataError,
      suggestions: isTimeout
        ? [
            'Tu dinero NO fue debitado — la transacción fue revertida automáticamente.',
            'Puedes reintentar el pago con seguridad.',
            'Si el problema persiste, intenta más tarde o contacta a soporte.',
          ]
        : isFundsError
        ? [
            'Verifica el saldo disponible en tu cuenta bancaria.',
            'Recuerda que algunos bancos reservan un monto mínimo en cuenta.',
            'Si crees que tienes saldo, contacta a tu banco para confirmar.',
          ]
        : isDataError
        ? megasoftCode === '99'
          ? [
              'Verifica que el número de referencia ingresado sea correcto.',
              'Las referencias P2C son válidas por tiempo limitado — puede haber expirado.',
              'Asegúrate de copiar el número completo sin espacios ni errores.',
              'Si el problema persiste, genera una nueva referencia desde tu banco.',
            ]
          : [
              'Verifica que la cédula ingresada sea correcta.',
              'Confirma que el número de teléfono esté registrado en tu banco.',
              'Asegúrate de haber seleccionado el banco correcto.',
              'Si los datos son correctos, contacta a tu banco para verificar tu cuenta.',
            ]
        : null,
    };
  }

  for (const [keyword, hint] of Object.entries(MEGASOFT_ERROR_HINTS)) {
    if (keyword.length > 2 && fullText.includes(keyword)) {
      const isFundsKw = keyword === 'fondos' || keyword === 'saldo' || keyword === 'not sufficient' || keyword === 'insufficient';
      return {
        title: isFundsKw
          ? 'Fondos insuficientes'
          : isPlatformError(megasoftCode, fullText)
          ? 'Servicio no disponible'
          : 'Pago no procesado',
        message: hint,
        code: megasoftCode || 'N/A',
        technicalDetail: megasoftMsg || backendMessage,
        isFundsError: isFundsKw,
        suggestions: isFundsKw
          ? [
              'Verifica el saldo disponible en tu cuenta bancaria.',
              'Recuerda que algunos bancos reservan un monto mínimo en cuenta.',
              'Si crees que tienes saldo, contacta a tu banco para confirmar.',
            ]
          : null,
      };
    }
  }

  return {
    title: isPlatformError(megasoftCode, fullText)
      ? 'Servicio no disponible'
      : 'No pudimos procesar el pago',
    message: megasoftMsg || backendMessage || 'Error desconocido al procesar el pago.',
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

  const submittingRef = useRef(false);

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
  const [paymentVoucher, setPaymentVoucher] = useState('');
  const [paymentMethodLabel, setPaymentMethodLabel] = useState('');

  // Detalles guía múltiple
  const [showGuiasDetails, setShowGuiasDetails] = useState(false);

  // TC — Tarjeta de Crédito Tradicional
  const [tcSubStep, setTcSubStep] = useState('tc_datos'); // tc_datos | tc_verificar | tc_confirmar
  const [tcToken, setTcToken] = useState('');
  const [tcControl, setTcControl] = useState('');
  const [tcPan, setTcPan] = useState('');
  const [tcPanLast4, setTcPanLast4] = useState('');
  const [tcPanDisplay, setTcPanDisplay] = useState('');
  const [tcCvv, setTcCvv] = useState('');
  const [tcCvvConfirm, setTcCvvConfirm] = useState('');
  const [tcExp, setTcExp] = useState('');
  const [tcNombreTitular, setTcNombreTitular] = useState('');
  const [tcMonto1, setTcMonto1] = useState('');
  const [tcMonto2, setTcMonto2] = useState('');
  const [tcIntentosRestantes, setTcIntentosRestantes] = useState(null);
  const [tcError, setTcError] = useState('');
  const [tcVerifiedFromStorage, setTcVerifiedFromStorage] = useState(false);

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
          restoreTCSessionIfAvailable(multipleIds);
        } else {
          setDataError(response.message || 'Error al cargar datos de pago múltiple');
          setStep('loading');
        }
      } else {
        const response = await getGuiaById(parseInt(id));
        console.log('Datos de pago múltiple cargados:', response);
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
          restoreTCSessionIfAvailable(id?.toString());
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

    if (submittingRef.current) {
      console.warn('⚠️ Click duplicado bloqueado (C2P)');
      return;
    }

    if (!validateForm()) return;
    submittingRef.current = true;
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
        setPaymentVoucher(data.voucher || '');
        setPaymentMethodLabel('Pago Móvil C2P');
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
      submittingRef.current = false
    }
  };

  const handleP2CPayment = async () => {
    if (submittingRef.current) {
      console.warn('⚠️ Click duplicado bloqueado (C2P)');
      return;
    }
    if (!validateForm()) return;
    submittingRef.current = true;
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
        setPaymentVoucher(data.voucher || '');
        setPaymentMethodLabel('Pago Móvil P2C');
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
      submittingRef.current = false;
    }
  };

  // DI Fase 1 — Autorizar
  const handleDIAutorizar = async () => {
    if (submittingRef.current) {
      console.warn('⚠️ Click duplicado bloqueado (C2P)');
      return;
    }
    if (!validateForm()) return;
    submittingRef.current = true;
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
      submittingRef.current = false;
    }
  };

  // DI Fase 2 — Confirmar OTP
  const handleDIConfirmar = async () => {
    if (submittingRef.current) {
      console.warn('⚠️ Click duplicado bloqueado (C2P)');
      return;
    }
    submittingRef.current = true;
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
        setPaymentVoucher(data.voucher || '');
        setPaymentMethodLabel('Débito Inmediato');
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
      submittingRef.current = false;
    }
  };

  // CI — Crédito Inmediato
  const handleCreditoInmediato = async () => {
    if (submittingRef.current) {
      console.warn('⚠️ Click duplicado bloqueado (C2P)');
      return;
    }
    submittingRef.current = true;
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
        setPaymentVoucher(data.voucher || '');
        setPaymentMethodLabel('Crédito Inmediato');
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
      submittingRef.current = false;
    }
  };

  // TC — restaurar sesión guardada
  const restoreTCSessionIfAvailable = (guiaCtx) => {
    const session = tcLoadSessionData();
    if (
      session &&
      session.guiaContext === guiaCtx &&
      session.tcToken &&
      session.tcSubStep &&
      session.tcSubStep !== 'tc_datos'
    ) {
      setIdType(session.idType || 'V');
      setIdNumber(session.idNumber || '');
      setTcPanLast4(session.tcPanLast4 || '');
      setTcExp(session.tcExp || '');
      setTcNombreTitular(session.tcNombreTitular || '');
      setTcToken(session.tcToken);
      setTcSubStep(session.tcSubStep);
      setPaymentMethod('tarjetaCredito');
      setStep('form');
      toast('Retomando tu pago donde lo dejaste', { icon: '↩️', duration: 4000 });
    } else {
      setStep('method');
    }
  };

  // TC — guardar sesión
  const tcSaveSession = (overrides = {}) => {
    const guiaCtx = isMultiplePayment ? multipleIds : id?.toString();
    try {
      sessionStorage.setItem(TC_SESSION_KEY, JSON.stringify({
        guiaContext: guiaCtx,
        tcSubStep: overrides.tcSubStep ?? tcSubStep,
        tcToken: overrides.tcToken ?? tcToken,
        idType,
        idNumber,
        tcPanLast4: overrides.tcPanLast4 ?? tcPanLast4,
        tcExp,
        tcNombreTitular,
      }));
    } catch (_) {}
  };

  // TC — helpers de localStorage (token verificado permanente)
  const tcLocalStorageKey = () => `megasoft_tc_token_${idType}${idNumber}`;

  const tcSaveVerifiedToken = (token, pan4) => {
    try {
      localStorage.setItem(tcLocalStorageKey(), JSON.stringify({ token, pan4, verified: true }));
    } catch (_) {}
  };

  const tcLoadSavedToken = () => {
    try {
      const raw = localStorage.getItem(tcLocalStorageKey());
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  };

  const tcClearSavedToken = () => {
    try { localStorage.removeItem(tcLocalStorageKey()); } catch (_) {}
  };

  const tcResetState = () => {
    tcClearSessionData();
    setTcSubStep('tc_datos');
    setTcToken('');
    setTcControl('');
    setTcPan('');
    setTcPanLast4('');
    setTcPanDisplay('');
    setTcCvv('');
    setTcCvvConfirm('');
    setTcExp('');
    setTcNombreTitular('');
    setTcMonto1('');
    setTcMonto2('');
    setTcIntentosRestantes(null);
    setTcError('');
    setTcVerifiedFromStorage(false);
  };

  const handleTCPanChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setTcPan(raw);
    setTcPanDisplay(raw.replace(/(.{4})/g, '$1 ').trim());
  };

  const handleTCExpChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    setTcExp(val);
  };

  // TC Paso 2 — Tokenizar tarjeta
  const handleTCCrearToken = async () => {
    if (submittingRef.current) return;
    setTcError('');

    if (!idNumber || idNumber.length < 6)
      return toast.error('La cédula debe tener al menos 6 dígitos');
    if (!tcPan || tcPan.length !== 16)
      return toast.error('El número de tarjeta debe tener 16 dígitos');
    if (!tcNombreTitular.trim())
      return toast.error('Ingresa el nombre del titular');
    if (!tcExp || tcExp.length !== 5)
      return toast.error('Ingresa la fecha de vencimiento en formato MM/YY');
    if (!tcCvv || tcCvv.length < 3)
      return toast.error('El CVV debe tener 3 o 4 dígitos');

    const [mm, yy] = tcExp.split('/').map(Number);
    if (!mm || !yy || mm < 1 || mm > 12)
      return toast.error('Fecha de vencimiento inválida');
    const now = new Date();
    const curYear = now.getFullYear() % 100;
    const curMonth = now.getMonth() + 1;
    if (yy < curYear || (yy === curYear && mm < curMonth))
      return toast.error('La tarjeta ha vencido');

    // Revisar token guardado en localStorage
    const saved = tcLoadSavedToken();
    if (saved?.verified && saved?.token) {
      setTcToken(saved.token);
      setTcVerifiedFromStorage(true);
      setTcSubStep('tc_confirmar');
      toast.success(`Tarjeta guardada (****${saved.pan4}) lista para usar`);
      return;
    }

    submittingRef.current = true;
    try {
      setIsLoading(true);
      const response = await megasoftTCCrearToken({
        customerId: `${idType}${idNumber}`,
        nombreCompleto: getNombreCompleto(),
        pan: tcPan,
        cvv: tcCvv,
        exp: tcExp.replace('/', ''),
        nombreTitular: tcNombreTitular.toUpperCase(),
      });
      if (response.success) {
        const pan4 = tcPan.slice(-4);
        setTcToken(response.token);
        setTcPanLast4(pan4);
        setTcSubStep('tc_verificar');
        tcSaveSession({ tcSubStep: 'tc_verificar', tcToken: response.token, tcPanLast4: pan4 });
        toast.success('Tarjeta tokenizada. Revisa tu estado de cuenta para los cobros de prueba.', { duration: 6000 });
      } else {
        setTcError(response.message || 'No se pudo tokenizar la tarjeta. Verifica los datos.');
      }
    } catch (err) {
      setTcError('Error de conexión al tokenizar la tarjeta.');
    } finally {
      setIsLoading(false);
      submittingRef.current = false;
    }
  };

  // TC Paso 3 — Verificar montos
  const handleTCVerificar = async () => {
    if (submittingRef.current) return;
    setTcError('');

    if (!tcMonto1.trim() || !tcMonto2.trim())
      return toast.error('Ingresa ambos montos de verificación');

    submittingRef.current = true;
    try {
      setIsLoading(true);
      const response = await megasoftTCVerificarToken(tcToken, {
        montoverificacion1: tcMonto1.replace('.', ','),
        montoverificacion2: tcMonto2.replace('.', ','),
      });
      if (response.success) {
        tcSaveVerifiedToken(tcToken, tcPanLast4 || tcPan.slice(-4));
        tcSaveSession({ tcSubStep: 'tc_confirmar' });
        setTcSubStep('tc_confirmar');
        toast.success('¡Tarjeta verificada exitosamente!');
      } else {
        const intentos = response.intentosRestantes ?? null;
        setTcIntentosRestantes(intentos);
        if (intentos === 0) {
          setTcError('Token bloqueado. Los montos fueron incorrectos demasiadas veces. Inicia el proceso con una nueva tarjeta.');
          tcClearSavedToken();
        } else {
          setTcError(
            intentos !== null
              ? `Montos incorrectos. Te quedan ${intentos} intento${intentos === 1 ? '' : 's'}.`
              : response.message || 'Montos de verificación incorrectos.'
          );
        }
      }
    } catch (err) {
      setTcError('Error de conexión al verificar la tarjeta.');
    } finally {
      setIsLoading(false);
      submittingRef.current = false;
    }
  };

  // TC Pasos 4+5 — Preregistro + Cobrar
  const handleTCCobrar = async () => {
    if (submittingRef.current) return;
    setTcError('');

    if (!tcCvvConfirm || tcCvvConfirm.length < 3)
      return toast.error('Ingresa el CVV de tu tarjeta para confirmar el pago');

    submittingRef.current = true;
    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const preregistro = await megasoftTCPreregistro();
      if (!preregistro.success) {
        setErrorDetails({
          title: 'Error al iniciar pago',
          message: preregistro.message || 'No se pudo iniciar la transacción. Intenta de nuevo.',
          code: 'PREREGISTRO',
          technicalDetail: '',
        });
        setStep('error');
        return;
      }

      const response = await megasoftTCCobrar({
        customerId: `${idType}${idNumber}`,
        token: tcToken,
        control: preregistro.control,
        cvv: tcCvvConfirm,
        amount: amount.toString(),
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment ? paymentData.guiaIds : [paymentData.idGuia],
        isMultiplePayment,
      });

      if (response.success) {
        tcClearSessionData();
        const data = response.data || {};
        setPaymentReference(data.paymentReference || data.PaymentReference || '');
        setAuthorizationCode(data.authorizationCode || data.AuthorizationCode || '');
        setPaymentVoucher(data.voucher || '');
        setPaymentMethodLabel('Tarjeta de Crédito');
        setStep('success');
        toast.success('¡Pago con tarjeta aprobado!');
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (err) {
      console.error('Error TC Cobrar:', err);
      setErrorDetails({
        title: 'Error de conexión',
        message: 'No pudimos conectar con el servicio de pagos.',
        code: 'NETWORK',
        technicalDetail: err.message || '',
      });
      setStep('error');
    } finally {
      setIsLoading(false);
      submittingRef.current = false;
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

        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'tarjetaCredito' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('tarjetaCredito')}
        >
          <div className={styles.methodIcon}><IoCardOutline size={32} /></div>
          <h4>Tarjeta de Crédito</h4>
          <p>Paga con tu tarjeta de crédito de forma segura</p>
        </div>
      </div>

      <button
        onClick={() => {
          if (paymentMethod === 'tarjetaCredito') tcResetState();
          setStep('form');
        }}
        className={styles.btn_primary}
      >
        Continuar <IoArrowForward />
      </button>
    </div>
  );

  const renderTCStep = (activeIndex) => {
    const steps = ['Datos de tarjeta', 'Verificación', 'Confirmación'];
    return (
      <div className={styles.tcStepper}>
        {steps.map((label, i) => {
          const isActive = i === activeIndex;
          const isCompleted = i < activeIndex;
          return (
            <div
              key={i}
              className={`${styles.tcStepItem} ${isActive ? styles.tcStepActive : ''} ${isCompleted ? styles.tcStepCompleted : ''}`}
            >
              {i > 0 && <div className={styles.tcStepConnector} />}
              <div className={styles.tcStepCircle}>
                {isCompleted ? <IoCheckmark size={14} /> : i + 1}
              </div>
              <span className={styles.tcStepLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTarjetaCreditoForm = () => {
    // Sub-paso 1: datos de tarjeta
    if (tcSubStep === 'tc_datos') {
      return (
        <div className={styles.formContainer}>
          <h3 className={styles.stepTitle}>Tarjeta de Crédito</h3>
          <p className={styles.stepDescription}>Ingresa los datos de tu tarjeta de crédito</p>

          {renderTCStep(0)}

          {/* Cédula */}
          <div className={styles.inputGroup}>
            <label>Cédula de Identidad</label>
            <div className={styles.combinedInput}>
              <div
                className={styles.dropdown}
                onClick={(e) => { e.stopPropagation(); setShowIdTypes(!showIdTypes); setShowPhoneCodes(false); }}
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
                  <div key={type.code} className={styles.dropdownItem}
                    onClick={(e) => { e.stopPropagation(); setIdType(type.code); setShowIdTypes(false); }}
                  >
                    {type.code} - {type.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Número de tarjeta */}
          <div className={styles.inputGroup}>
            <label>Número de tarjeta</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={tcPanDisplay}
              onChange={handleTCPanChange}
              maxLength={19}
              className={styles.tcPanInput}
            />
            <small>{tcPan.length}/16 dígitos</small>
          </div>

          {/* Titular */}
          <div className={styles.inputGroup}>
            <label>Nombre del titular (como aparece en la tarjeta)</label>
            <input
              type="text"
              placeholder="JOSE PEREZ"
              value={tcNombreTitular}
              onChange={(e) => setTcNombreTitular(e.target.value.toUpperCase())}
              maxLength={26}
            />
          </div>

          {/* Vencimiento + CVV */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Vencimiento (MM/YY)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="07/27"
                value={tcExp}
                onChange={handleTCExpChange}
                maxLength={5}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IoLockClosedOutline size={15} /> CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="•••"
                value={tcCvv}
                onChange={(e) => setTcCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
              />
            </div>
          </div>

          {tcError && (
            <div className={styles.tcErrorInline}>
              <IoWarningOutline size={18} /> {tcError}
            </div>
          )}

          <div className={styles.buttonRow}>
            <button
              onClick={() => { tcResetState(); setStep('method'); }}
              className={styles.btn_secondary}
              disabled={isLoading}
            >
              <IoArrowBack /> Volver
            </button>
            <button
              onClick={handleTCCrearToken}
              disabled={isLoading}
              className={styles.btn_primary}
            >
              {isLoading ? 'Procesando...' : 'Tokenizar Tarjeta'} <IoArrowForward />
            </button>
          </div>
        </div>
      );
    }

    // Sub-paso 2: verificación de montos
    if (tcSubStep === 'tc_verificar') {
      return (
        <div className={styles.formContainer}>
          <h3 className={styles.stepTitle}>Verificación de Tarjeta</h3>
          <p className={styles.stepDescription}>Confirma los cobros de prueba para validar tu tarjeta</p>

          {renderTCStep(1)}

          <div className={styles.tcInfoBox}>
            <IoInformationCircleOutline size={22} />
            <div>
              <strong>Revisa tu estado de cuenta</strong>
              <p>
                Realizamos 2 cobros de prueba a tu tarjeta (****{tcPanLast4 || tcPan.slice(-4)}).
                Ingresa los montos exactos que aparecen en tu estado de cuenta o app bancaria.
                Usa coma como separador decimal (ej: 0,58).
              </p>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Monto 1</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={tcMonto1}
                onChange={(e) => setTcMonto1(e.target.value.replace(/[^0-9,]/g, '').slice(0, 6))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Monto 2</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={tcMonto2}
                onChange={(e) => setTcMonto2(e.target.value.replace(/[^0-9,]/g, '').slice(0, 6))}
              />
            </div>
          </div>

          {tcError && (
            <div className={`${styles.tcErrorInline} ${tcIntentosRestantes === 0 ? styles.tcErrorBlocked : ''}`}>
              <IoWarningOutline size={18} /> {tcError}
              {tcIntentosRestantes === 0 && (
                <button
                  className={styles.tcRestartLink}
                  onClick={() => { tcClearSavedToken(); tcResetState(); }}
                >
                  Iniciar con nueva tarjeta
                </button>
              )}
            </div>
          )}

          <div className={styles.buttonRow}>
            <button
              onClick={() => { setTcError(''); setTcSubStep('tc_datos'); }}
              className={styles.btn_secondary}
              disabled={isLoading || tcIntentosRestantes === 0}
            >
              <IoArrowBack /> Volver
            </button>
            <button
              onClick={handleTCVerificar}
              disabled={isLoading || tcIntentosRestantes === 0}
              className={styles.btn_primary}
            >
              {isLoading ? 'Verificando...' : 'Verificar'} <IoCheckmark />
            </button>
          </div>
        </div>
      );
    }

    // Sub-paso 3: confirmación del pago
    return (
      <div className={styles.formContainer}>
        <h3 className={styles.stepTitle}>Confirmar Pago</h3>
        <p className={styles.stepDescription}>Revisa el resumen y confirma el pago con tu tarjeta</p>

        {renderTCStep(2)}

        <div className={styles.tcSummaryBox}>
          <div className={styles.tcSummaryRow}>
            <span>Tarjeta</span>
            <span>****{tcVerifiedFromStorage ? tcLoadSavedToken()?.pan4 : (tcPanLast4 || tcPan.slice(-4))}</span>
          </div>
          <div className={styles.tcSummaryRow}>
            <span>{isMultiplePayment ? 'Total a pagar' : 'Monto'}</span>
            <span><strong>{formatBolivar(parseFloat(amount))}</strong></span>
          </div>
          {isMultiplePayment && (
            <div className={styles.tcSummaryRow}>
              <span>Guías</span>
              <span>{paymentData.guiaIds.length} guías</span>
            </div>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IoLockClosedOutline size={15} /> CVV (confirma tu tarjeta)
          </label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="•••"
            value={tcCvvConfirm}
            onChange={(e) => setTcCvvConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            autoFocus
          />
          <small>Por seguridad, ingresa el CVV nuevamente para confirmar el cobro</small>
        </div>

        {tcError && (
          <div className={styles.tcErrorInline}>
            <IoWarningOutline size={18} /> {tcError}
          </div>
        )}

        <div className={styles.buttonRow}>
          <button
            onClick={() => {
              setTcError('');
              setTcCvvConfirm('');
              setTcSubStep(tcVerifiedFromStorage ? 'tc_datos' : 'tc_verificar');
            }}
            className={styles.btn_secondary}
            disabled={isLoading}
          >
            <IoArrowBack /> Volver
          </button>
          <button
            onClick={handleTCCobrar}
            disabled={isLoading || !tcCvvConfirm}
            className={styles.btn_primary}
          >
            {isLoading ? 'Procesando pago...' : `Pagar ${formatBolivar(parseFloat(amount))}`}
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (paymentMethod === 'tarjetaCredito') return renderTarjetaCreditoForm();

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDIConfirmar();
          }}
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
        : paymentMethod === 'tarjetaCredito' ? 'Tarjeta de Crédito'
        : 'Tarjeta de Débito';

    const voucherLines = paymentVoucher
      ? paymentVoucher.split('\n').map((l) => l.trim())
      : [];

    return (
      <div className={styles.resultContainer}>
        <div className={styles.successIconWrapper}>
          <IoCheckmarkCircleOutline size={72} color="#4CAF50" />
        </div>
        <h2 className={styles.successTitle}>¡Pago Exitoso!</h2>
        <p className={styles.successSubtitle}>
          {isMultiplePayment
            ? `El pago para ${multipleIds.split(',').length} guías se procesó correctamente.`
            : `El pago para la guía ${paymentData.trackingNumber} se procesó correctamente.`}
        </p>

        <div className={styles.resultDetails}>
          {voucherLines.length > 0 && (
            <>
              <div className={styles.voucherSectionHeader}>
                <span className={styles.voucherSectionLine} />
                <span className={styles.voucherSectionLabel}>VOUCHER</span>
                <span className={styles.voucherSectionLine} />
              </div>
              <div className={styles.voucherBody}>
                {voucherLines.map((line, i) => (
                  <div key={i} className={styles.voucherLine}>
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
              <div className={styles.voucherSectionHeader}>
                <span className={styles.voucherSectionLine} />
              </div>
            </>
          )}

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

    const defaultSuggestions = [
      'Verifica que los datos ingresados sean correctos',
      'Asegúrate de tener saldo suficiente en tu cuenta',
      'Si usaste OTP, solicita uno nuevo y vuelve a intentar',
      'Si el problema persiste, contacta a soporte de Kraken Courier',
    ];
    const suggestions = info.suggestions || defaultSuggestions;

    return (
      <div className={styles.errorContainerDetailed}>
        <div className={styles.errorIconWrapper}>
          <IoCloseCircleOutline size={80} />
        </div>
        <h2 className={styles.errorTitle}>{info.title}</h2>

        {info.isTimeout && (
          <div className={styles.timeoutBanner}>
            Tu dinero <strong>NO fue debitado</strong> — la transacción fue revertida automáticamente por el banco.
          </div>
        )}

        {info.isFundsError && (
          <div className={styles.fundsBanner}>
            El pago no se completó por <strong>saldo insuficiente</strong>. Tu cuenta no fue afectada.
          </div>
        )}

        {info.isDataError && (
          <div className={styles.dataBanner}>
            {info.code === '99'
              ? <>Verifica que el <strong>número de referencia</strong> sea correcto y no haya expirado.</>
              : <>Revisa los <strong>datos ingresados</strong> — cédula, teléfono y banco — antes de reintentar.</>
            }
          </div>
        )}

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
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
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
      if (paymentMethod === 'tarjetaCredito') return 'Tarjeta de Crédito';
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