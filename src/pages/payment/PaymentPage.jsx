// src/pages/Payment/PaymentPage.jsx - CON MEGASOFT C2P + TARJETA MERCANTIL
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import styles from './PaymentPage.module.scss';

// Icons
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
} from 'react-icons/io5';

// Services
import {
  getGuiaById,
  getMultipleGuiasPaymentData,
} from '@/services/guiasService';
import {
  processMegasoftC2PPayment,
  processMegasoftP2CPayment,
  processCardPaymentUnified,
} from '@/services/payment/paymentService';

// Constantes
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

// Mapeo de errores comunes de Megasoft a mensajes amigables
const MEGASOFT_ERROR_HINTS = {
  // Códigos conocidos del manual
  A0: 'Credenciales del comercio inválidas. Contacta a soporte.',
  V0: 'Datos enviados inválidos. Verifica la cédula, teléfono y banco.',
  P0: 'Error de configuración del servicio de pagos. Intenta más tarde.',
  EX: 'Ocurrió un error inesperado procesando el pago.',

  // Palabras clave comunes en mensajes del banco
  fondos: 'Fondos insuficientes en tu cuenta. Verifica tu saldo.',
  saldo: 'Saldo insuficiente para completar la operación.',
  clave: 'La clave C2P es incorrecta. Solicita una nueva a tu banco.',
  codigo: 'El código C2P es incorrecto o ya expiró.',
  limite: 'Has superado el límite diario de pago móvil de tu banco.',
  timeout: 'Tu banco tardó demasiado en responder. Intenta nuevamente.',
  rechaz: 'Tu banco rechazó la operación. Contacta a tu banco.',
  'no disponible': 'El servicio del banco no está disponible en este momento.',
};

/**
 * Extrae un mensaje amigable desde la respuesta de error del backend
 * @param {Object} response - Respuesta de processMegasoftC2PPayment
 * @returns {{ title: string, message: string, code: string, technicalDetail: string }}
 */
const extractMegasoftError = (response) => {
  const data = response?.data || {};
  const backendMessage = response?.message || '';
  const megasoftCode = data.responseCode || data.ResponseCode || '';
  const megasoftMsg = data.responseMessage || data.ResponseMessage || '';

  // 1. Buscar por código exacto
  if (megasoftCode && MEGASOFT_ERROR_HINTS[megasoftCode]) {
    return {
      title: 'Pago rechazado',
      message: MEGASOFT_ERROR_HINTS[megasoftCode],
      code: megasoftCode,
      technicalDetail: megasoftMsg || backendMessage,
    };
  }

  // 2. Buscar por palabra clave en el mensaje
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

  // 3. Fallback: usar el mensaje del backend tal cual
  return {
    title: 'No pudimos procesar el pago',
    message:
      megasoftMsg || backendMessage || 'Error desconocido al procesar el pago.',
    code: megasoftCode || 'N/A',
    technicalDetail: backendMessage,
  };
};

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn } = useAuth();
  const { actualTheme } = useTheme();

  // Estados principales
  const [step, setStep] = useState('loading');
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  // 🆕 Pago múltiple
  const multipleIds = searchParams.get('multiple');
  const isMultiplePayment = !!multipleIds;
  const [guiasDetails, setGuiasDetails] = useState([]);

  // Estados del formulario
  const [idType, setIdType] = useState('V');
  const [idNumber, setIdNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('0414');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [twofactorAuth, setTwofactorAuth] = useState(''); // ← Clave C2P de 8 dígitos

  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const [showIdTypes, setShowIdTypes] = useState(false);
  const [showPhoneCodes, setShowPhoneCodes] = useState(false);

  const [paymentReference, setPaymentReference] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');

  const [showGuiasDetails, setShowGuiasDetails] = useState(false);

  const [selectedBank, setSelectedBank] = useState('0105');
  const [showBanks, setShowBanks] = useState(false);
  // P2C específicos
  const [p2cReferencia, setP2cReferencia] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }
    loadPaymentData();
  }, [id, isSignedIn, navigate]);

  // 🆕 CARGAR DATOS - SOPORTA SIMPLE Y MÚLTIPLE
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
            guiaIds: guiaIds,
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
          setDataError(
            response.message || 'Error al cargar datos de pago múltiple'
          );
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

  // Cerrar dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      setShowIdTypes(false);
      setShowPhoneCodes(false);
      setShowBanks(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Formateo
  const formatBolivar = (amount) => {
    if (isNaN(amount)) return '0,00 Bs.';
    return (
      amount.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' Bs.'
    );
  };

  const formatUSDReference = (amountVes) => {
    const tasaCambio = paymentData?.tasaCambio || 102.16;
    const usd = amountVes / tasaCambio;
    return `~$${usd.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} USD`;
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpirationDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Validaciones
  const validateForm = () => {
    if (!idNumber || idNumber.length < 6) {
      toast.error('El número de identificación debe tener al menos 6 dígitos');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }

    // ===== PAGO MÓVIL C2P =====
    if (paymentMethod === 'mobile') {
      if (!selectedBank) {
        toast.error('Debes seleccionar el banco emisor');
        return false;
      }
      if (!phoneNumber || phoneNumber.length !== 7) {
        toast.error('El número de teléfono debe tener 7 dígitos');
        return false;
      }
      if (
        !twofactorAuth ||
        twofactorAuth.length !== 8 ||
        !/^\d{8}$/.test(twofactorAuth)
      ) {
        toast.error('La clave C2P debe ser de 8 dígitos numéricos');
        return false;
      }
    }
    // ===== PAGO MÓVIL P2C =====
    else if (paymentMethod === 'p2c') {
      if (!selectedBank) {
        toast.error(
          'Debes seleccionar el banco desde donde realizaste el pago'
        );
        return false;
      }
      if (!phoneNumber || phoneNumber.length !== 7) {
        toast.error('El número de teléfono debe tener 7 dígitos');
        return false;
      }
      if (!p2cReferencia || p2cReferencia.length < 4) {
        toast.error('Ingresa la referencia bancaria del pago realizado');
        return false;
      }
    }
    // ===== TARJETA =====
    else {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
        toast.error('Ingresa un número de tarjeta válido');
        return false;
      }
      if (!expirationDate || expirationDate.length !== 5) {
        toast.error('Ingresa una fecha de vencimiento válida (MM/YY)');
        return false;
      }
      if (!cvv || cvv.length !== 3) {
        toast.error('El CVV debe tener 3 dígitos');
        return false;
      }
      if (!cardholderName || cardholderName.length < 5) {
        toast.error('Ingresa el nombre completo del tarjetahabiente');
        return false;
      }
    }

    return true;
  };

  const formatPhoneForMercantil = (phoneCode, phoneNumber) => {
    const cleanCode = phoneCode.replace(/^0/, '');
    return `58${cleanCode}${phoneNumber}`;
  };

  // Helper para obtener el nombre completo del usuario
  const getNombreCompleto = () => {
    const nombres = user?.name || user?.nombres || '';
    const apellidos = user?.lastName || user?.apellidos || '';
    const completo = `${nombres} ${apellidos}`.trim();
    return completo || 'Cliente Kraken';
  };

  // 🐙 PAGO MÓVIL C2P VÍA MEGASOFT
  const handlePayment = async () => {
    if (!validateForm()) return;

    const customerId = `${idType}${idNumber}`;

    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const paymentRequest = {
        customerId,
        nombreCompleto: getNombreCompleto(),
        originMobileNumber: formatPhoneForMercantil(phoneCode, phoneNumber),
        destinationBankId: selectedBank,
        amount: amount.toString(),
        codigoC2P: twofactorAuth,
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment
          ? paymentData.guiaIds
          : [paymentData.idGuia],
        isMultiplePayment: isMultiplePayment,
      };

      console.log('📤 Enviando pago C2P Megasoft:', {
        ...paymentRequest,
        codigoC2P: '********',
      });

      const response = await processMegasoftC2PPayment(paymentRequest);

      if (response.success) {
        const data = response.data || {};
        setPaymentReference(
          data.paymentReference || data.PaymentReference || ''
        );
        setAuthorizationCode(
          data.authorizationCode || data.AuthorizationCode || ''
        );
        setStep('success');
        toast.success('¡Pago procesado exitosamente!');
      } else {
        // ✅ Extraer error detallado
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errInfo = {
        title: 'Error de conexión',
        message:
          'No pudimos conectar con el servicio de pagos. Verifica tu conexión e intenta nuevamente.',
        code: 'NETWORK',
        technicalDetail: error.message || 'Network error',
      };
      setErrorDetails(errInfo);
      setError(errInfo.message);
      setStep('error');
      toast.error(errInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🐙 PAGO P2C VÍA MEGASOFT
  const handleP2CPayment = async () => {
    if (!validateForm()) return;

    const customerId = `${idType}${idNumber}`;
    // P2C usa teléfono local sin prefijo de país
    const telefonoLocal = `${phoneCode}${phoneNumber}`;

    try {
      setIsLoading(true);
      setError('');
      setErrorDetails(null);

      const paymentRequest = {
        customerId,
        nombreCompleto: getNombreCompleto(),
        originMobileNumber: telefonoLocal,
        destinationBankId: selectedBank,
        amount: amount.toString(),
        referencia: p2cReferencia,
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment
          ? paymentData.guiaIds
          : [paymentData.idGuia],
        isMultiplePayment: isMultiplePayment,
      };

      console.log('📤 Enviando pago P2C Megasoft:', {
        ...paymentRequest,
        referencia: `***${p2cReferencia.slice(-4)}`,
      });

      const response = await processMegasoftP2CPayment(paymentRequest);

      if (response.success) {
        const data = response.data || {};
        setPaymentReference(
          data.paymentReference || data.PaymentReference || ''
        );
        setAuthorizationCode(
          data.authorizationCode || data.AuthorizationCode || ''
        );
        setStep('success');
        toast.success('¡Pago P2C procesado exitosamente!');
      } else {
        const errInfo = extractMegasoftError(response);
        setErrorDetails(errInfo);
        setError(errInfo.message);
        setStep('error');
        toast.error(errInfo.message, { duration: 5000 });
      }
    } catch (error) {
      console.error('Error processing P2C payment:', error);
      const errInfo = {
        title: 'Error de conexión',
        message:
          'No pudimos conectar con el servicio de pagos. Verifica tu conexión e intenta nuevamente.',
        code: 'NETWORK',
        technicalDetail: error.message || 'Network error',
      };
      setErrorDetails(errInfo);
      setError(errInfo.message);
      setStep('error');
      toast.error(errInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 PAGO CON TARJETA (sigue con Mercantil — se migrará a Megasoft en fase posterior)
  const handleCardPayment = async () => {
    if (!validateForm()) return;

    const customerId = `${idType}${idNumber}`;

    try {
      setIsLoading(true);
      setError('');

      toast.loading('Procesando pago... Esto puede tardar hasta 2 minutos', {
        duration: 120000,
        id: 'processing-payment',
      });

      const paymentData_request = {
        customerId,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expirationDate,
        cvv,
        amount: parseFloat(amount),
        paymentMethod: 'tdd',
        tasa: paymentData.tasaCambio,
        idGuia: isMultiplePayment ? paymentData.guiaIds[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment
          ? paymentData.guiaIds
          : [paymentData.idGuia],
        isMultiplePayment: isMultiplePayment,
      };

      const paymentResult =
        await processCardPaymentUnified(paymentData_request);

      toast.dismiss('processing-payment');

      if (!paymentResult.success) {
        if (paymentResult.isTimeout) {
          setError(
            'El pago tardó demasiado. Por favor, verifica el estado de tu pago ' +
              'en "Mis Guías" antes de intentar nuevamente.'
          );
          toast.error('Timeout: Verifica el estado en "Mis Guías"', {
            duration: 5000,
          });
          setStep('error');
          return;
        }

        setError(paymentResult.message || 'Error al procesar el pago');
        toast.error(paymentResult.message || 'Error al procesar el pago');
        setStep('error');
        return;
      }

      setPaymentReference(
        paymentResult.data?.paymentReference ||
          paymentResult.data?.payment_reference ||
          'N/A'
      );
      setAuthorizationCode(
        paymentResult.data?.authorizationCode ||
          paymentResult.data?.authorization_code ||
          'N/A'
      );

      toast.success('¡Pago procesado exitosamente!');
      setStep('success');
    } catch (error) {
      console.error('❌ Error en handleCardPayment:', error);

      toast.dismiss('processing-payment');

      if (error.isTimeout || error.code === 'TIMEOUT') {
        setError(
          'La operación tardó demasiado. Verifica tu conexión e intenta nuevamente.'
        );
        toast.error('Timeout: Verifica tu conexión', { duration: 5000 });
      } else {
        setError(error.message || 'Error al procesar el pago');
        toast.error(error.message || 'Error al procesar el pago');
      }

      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToGuides = () => {
    navigate('/guide/guides');
  };

  const handleRetry = () => {
    setError('');
    setErrorDetails(null); // ← agregar esto
    setStep('form');
  };

  // 🆕 RENDER INFO DE GUÍA(S)
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
              {showGuiasDetails
                ? 'Ocultar detalles'
                : 'Ver detalles de cada guía'}
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
      <button
        onClick={() => navigate('/guide/guides')}
        className={styles.btn_primary}
      >
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
          <div className={styles.methodIcon}>
            <IoPhonePortraitOutline size={32} />
          </div>
          <h4>Pago Móvil P2C</h4>
          <p>Ya realizaste el pago desde tu banco, solo envía la referencia</p>
        </div>

        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'mobile' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('mobile')}
        >
          <div className={styles.methodIcon}>
            <IoPhonePortraitOutline size={32} />
          </div>
          <h4>Pago Móvil C2P</h4>
          <p>Autoriza el pago con una clave de 8 dígitos de tu banco</p>
        </div>        

        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'debit' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('debit')}
        >
          <div className={styles.methodIcon}>
            <IoCardOutline size={32} />
          </div>
          <h4>Tarjeta de Débito</h4>
          <p>Paga directamente con tu tarjeta de débito Mercantil</p>
        </div>
      </div>

      <button onClick={() => setStep('form')} className={styles.btn_primary}>
        Continuar <IoArrowForward />
      </button>
    </div>
  );

  const renderPaymentForm = () => (
    <div className={styles.formContainer}>
      <h3 className={styles.stepTitle}>
        {paymentMethod === 'mobile'
          ? 'Datos del Pago Móvil C2P'
          : paymentMethod === 'p2c'
            ? 'Datos del Pago Móvil P2C'
            : 'Datos de la Tarjeta de Débito'}
      </h3>
      <p className={styles.stepDescription}>
        {paymentMethod === 'mobile'
          ? 'Completa la información para realizar el pago C2P'
          : paymentMethod === 'p2c'
            ? 'Ingresa los datos del pago móvil que ya realizaste desde tu banco'
            : 'Completa la información para realizar el pago a través de Mercantil'}
      </p>

      {/* Cédula — igual para todos */}
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

      {/* ===== PAGO MÓVIL C2P ===== */}
      {paymentMethod === 'mobile' && (
        <>
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
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ''))
                }
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
            <small>Asociado al pago móvil</small>
          </div>

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
            <small>Banco desde donde realizarás el pago móvil</small>
          </div>

          <div className={styles.inputGroup}>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <IoShieldCheckmarkOutline size={18} />
              Clave de pago
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="12345678"
              value={twofactorAuth}
              onChange={(e) =>
                setTwofactorAuth(
                  e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
                )
              }
              maxLength={8}
            />
            <small>Código (C2P) de 8 dígitos enviado por tu banco</small>
          </div>
        </>
      )}

      {/* ===== PAGO MÓVIL P2C ===== */}
      {paymentMethod === 'p2c' && (
        <>
          <div className={styles.p2cInstructions}>
            <IoReceiptOutline size={20} />
            <div>
              <strong>¿Cómo funciona?</strong>
              <p>
                Realiza un pago móvil desde tu banco al teléfono de Kraken
                Courier, luego ingresa la <strong>referencia bancaria</strong>{' '}
                que tu banco te devolvió.
              </p>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Tu Número de Teléfono (desde el que pagaste)</label>
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
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ''))
                }
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

          <div className={styles.inputGroup}>
            <label>Banco desde donde pagaste</label>
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

          <div className={styles.inputGroup}>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <IoReceiptOutline size={18} />
              Referencia bancaria
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00404963"
              value={p2cReferencia}
              onChange={(e) =>
                setP2cReferencia(
                  e.target.value.replace(/[^0-9]/g, '').slice(0, 15)
                )
              }
              maxLength={15}
            />
            <small>
              Número de referencia que te dio tu banco al realizar el pago móvil
            </small>
          </div>
        </>
      )}

      {/* ===== TARJETA DE DÉBITO ===== */}
      {paymentMethod === 'debit' && (
        <>
          <div className={styles.inputGroup}>
            <label>Número de Tarjeta</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formatCardNumber(cardNumber)}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              maxLength={19}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Fecha de Vencimiento</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expirationDate}
                onChange={(e) =>
                  setExpirationDate(formatExpirationDate(e.target.value))
                }
                maxLength={5}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength={3}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Nombre del Tarjetahabiente</label>
            <input
              type="text"
              placeholder="NOMBRE APELLIDO"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
            />
          </div>
        </>
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
            paymentMethod === 'mobile'
              ? handlePayment
              : paymentMethod === 'p2c'
                ? handleP2CPayment
                : handleCardPayment
          }
          disabled={isLoading}
          className={styles.btn_primary}
        >
          {isLoading ? 'Procesando...' : 'Realizar Pago'}
        </button>
      </div>
    </div>
  );

  // ✅ RENDER SUCCESS MEJORADO
  const renderSuccess = () => (
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
          <span>
            {paymentMethod === 'mobile'
              ? 'Pago Móvil C2P'
              : paymentMethod === 'p2c'
              ? 'Pago Móvil P2C'
              : 'Tarjeta de Débito'}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span>Cédula/RIF:</span>
          <span>
            {idType}
            {idNumber}
          </span>
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

  // ❌ RENDER ERROR MEJORADO
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

        {/* Card con detalles técnicos */}
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
                <span className={styles.errorTechnical}>
                  {info.technicalDetail}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sugerencias según contexto */}
        <div className={styles.errorSuggestions}>
          <h4>¿Qué puedes hacer?</h4>
          <ul>
            <li>Verifica que los datos ingresados sean correctos</li>
            <li>Asegúrate de tener saldo suficiente en tu cuenta</li>
            <li>Solicita una nueva clave C2P a tu banco si es necesario</li>
            <li>
              Si el problema persiste, contacta a soporte de Kraken Courier
            </li>
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          {step === 'loading'
  ? 'Procesando'
  : step === 'method'
  ? 'Método de Pago'
  : step === 'form'
  ? paymentMethod === 'mobile'
    ? 'Pago Móvil C2P'
    : paymentMethod === 'p2c'
    ? 'Pago Móvil P2C'
    : 'Pago con Tarjeta Mercantil'
  : step === 'success'
  ? 'Pago Exitoso'
  : 'Error de Pago'}
        </h1>
      </div>

      <div className={styles.content}>
        {step === 'loading' && dataLoading && renderLoadingState()}
        {step === 'loading' && !dataLoading && dataError && renderErrorState()}

        {step !== 'loading' && paymentData && (
          <>
            {renderGuiaInfo()}
            {step === 'method' && renderMethodSelection()}
            {step === 'form' && renderPaymentForm()}
            {step === 'success' && renderSuccess()}
            {step === 'error' && renderError()}
          </>
        )}
      </div>
    </div>
  );
}
