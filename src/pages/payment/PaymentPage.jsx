// src/pages/Payment/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext'; // Importar hook de tema
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
  IoAlertCircleOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';

// Services
import { getGuiaById } from '@/services/guiasService';
import { 
  processMercantilPayment, 
  getMercantilCardAuth, 
  processMercantilDebitCardPayment 
} from '@/services/payment/paymentService';

// Constantes
const PHONE_CODES = [
  { code: '0412', carrier: 'Digitel' },
  { code: '0414', carrier: 'Movistar' },
  { code: '0416', carrier: 'Movistar' },
  { code: '0424', carrier: 'Digitel' },
  { code: '0426', carrier: 'Movistar' },
];

const ID_TYPES = [
  { code: 'V', name: 'Venezolano' },
  { code: 'E', name: 'Extranjero' },
  { code: 'J', name: 'RIF Jurídico' },
  { code: 'G', name: 'RIF Gubernamental' },
  { code: 'P', name: 'Pasaporte' },
  { code: 'C', name: 'RIF Consorcio' },
];

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn } = useAuth();
  const { actualTheme } = useTheme(); // Obtener tema actual

  // Estados principales
  const [step, setStep] = useState('loading');
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [error, setError] = useState('');

  // Pago múltiple
  const multipleIds = searchParams.get('multiple');
  const isMultiplePayment = !!multipleIds;

  // Estados del formulario
  const [idType, setIdType] = useState('V');
  const [idNumber, setIdNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('0414');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  // Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  // Token de autenticación (obtenido del backend)
  const [authToken, setAuthToken] = useState('');

  // Dropdowns
  const [showIdTypes, setShowIdTypes] = useState(false);
  const [showPhoneCodes, setShowPhoneCodes] = useState(false);

  // Resultado
  const [paymentReference, setPaymentReference] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');

  // Aplicar tema al contenedor principal
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  // Cargar datos de pago
  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }

    loadPaymentData();
  }, [id, isSignedIn, navigate]);

  const loadPaymentData = async () => {
    try {
      setDataLoading(true);
      setDataError('');

      if (isMultiplePayment) {
        const guiaIds = multipleIds.split(',').map(Number);
        // TODO: Implementar carga de múltiples guías
        toast.info('Función de pago múltiple en desarrollo');
      } else {
        const response = await getGuiaById(parseInt(id));
        
        if (response.success) {
          setPaymentData({
            idGuia: response.data.idGuia,
            trackingNumber: response.data.nGuia,
            amount: response.data.detalleFactura.precioBase,
            detalle: response.data.detalleFactura,
            tasaCambio: response.data.detalleFactura.tasaCambio || 102.16,
          });
          setAmount(response.data.detalleFactura.precioBase.toFixed(2));
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

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowIdTypes(false);
      setShowPhoneCodes(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Formateo
  const formatBolivar = (amount) => {
    if (isNaN(amount)) return '0,00 Bs.';
    return amount.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' Bs.';
  };

  const formatUSDReference = (amountVes) => {
    const tasaCambio = paymentData?.tasaCambio || 102.16;
    const usd = amountVes / tasaCambio;
    return `~$${usd.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    const customerId = `${idType}${idNumber}`;
    
    if (!idNumber || idNumber.length < 6) {
      toast.error('El número de identificación debe tener al menos 6 dígitos');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }

    if (paymentMethod === 'mobile') {
      if (!phoneNumber || phoneNumber.length !== 7) {
        toast.error('El número de teléfono debe tener 7 dígitos');
        return false;
      }
    } else {
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
    // Remover el 0 del código de operadora
    const cleanCode = phoneCode.replace(/^0/, ''); // 0414 -> 414
    
    // Formato: 58 + código sin 0 + número
    return `58${cleanCode}${phoneNumber}`; // Ejemplo: 584143177318
  };  

  // Handlers
  const handlePayment = async () => {
    if (!validateForm()) return;

    const customerId = `${idType}${idNumber}`;

    try {
      setIsLoading(true);

      // ✅ ESTRUCTURA EXACTA DE TU APP MÓVIL
      const paymentRequest = {
        amount: amount.toString(),
        customerId,
        originMobileNumber:  formatPhoneForMercantil(phoneCode, phoneNumber),
        tasa: paymentData.tasaCambio,
        twofactorAuth: "00001111",
        idGuia: isMultiplePayment ? multipleIds.split(',').map(Number)[0] : paymentData.idGuia,
        guiasIds: isMultiplePayment 
          ? multipleIds.split(',').map(Number) 
          : [paymentData.idGuia], // ✅ SIEMPRE enviar como array
        isMultiplePayment: isMultiplePayment || false, // ✅ SIEMPRE enviar el flag
      };

      console.log('📤 Enviando solicitud de pago móvil:', paymentRequest);

      const response = await processMercantilPayment(paymentRequest);

      if (response.success) {
        setPaymentReference(response.data?.payment_reference || '');
        setAuthorizationCode(response.data?.authorization_code || '');
        setStep('success');
        toast.success('¡Pago procesado exitosamente!');
      } else {
        setError(response.message || 'Error al procesar el pago');
        setStep('error');
        toast.error(response.message || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Error de conexión al procesar el pago');
      setStep('error');
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardAuth = async () => {
    if (!validateForm()) return;

    const customerId = `${idType}${idNumber}`;

    try {
      setIsLoading(true);

      // 1. Primero autenticar la tarjeta
      const authRequest = {
        customerId,
        cardNumber: cardNumber.replace(/\s/g, ''),
      };

      console.log('🔐 Solicitando autenticación de tarjeta...');

      const authResponse = await getMercantilCardAuth(authRequest);

      if (authResponse.success && authResponse.data?.twofactor_auth) {
        const token = authResponse.data.twofactor_auth;
        setAuthToken(token);
        
        console.log('✅ Token de autenticación obtenido');

        // 2. Procesar el pago con el token obtenido
        const paymentRequest = {
          customerId,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expirationDate,
          cvv,
          amount: amount.toString(),
          twofactorAuth: token,
          tasa: paymentData.tasaCambio,
          ...(isMultiplePayment
            ? { guiasIds: multipleIds.split(',').map(Number), isMultiplePayment: true }
            : { idGuia: paymentData.idGuia }),
        };

        console.log('📤 Procesando pago con tarjeta...');

        const paymentResponse = await processMercantilDebitCardPayment(paymentRequest);

        if (paymentResponse.success) {
          setPaymentReference(paymentResponse.data?.payment_reference || '');
          setAuthorizationCode(paymentResponse.data?.authorization_code || '');
          setStep('success');
          toast.success('¡Pago procesado exitosamente!');
        } else {
          setError(paymentResponse.message || 'Error al procesar el pago');
          setStep('error');
          toast.error(paymentResponse.message || 'Error al procesar el pago');
        }
      } else {
        toast.error(authResponse.message || 'Error en la autenticación de la tarjeta');
        setError(authResponse.message || 'Error en la autenticación');
        setStep('error');
      }
    } catch (error) {
      console.error('Error processing card payment:', error);
      setError('Error de conexión al procesar el pago');
      setStep('error');
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToGuides = () => {
    navigate('/my-guides');
  };

  const handleRetry = () => {
    setError('');
    setStep('form');
  };

  // Renders
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
      <button onClick={() => navigate('/my-guides')} className={styles.btn_primary}>
        Volver a Guías
      </button>
    </div>
  );

  const renderGuiaInfo = () => (
    <div className={styles.guiaInfo}>
      <div className={styles.amountCard}>
        <p className={styles.amountLabel}>
          {isMultiplePayment ? 'Total a pagar:' : 'Monto a pagar:'}
        </p>
        <h2 className={styles.amountValue}>{formatBolivar(parseFloat(amount))}</h2>
        {/* <p className={styles.usdReference}>{formatUSDReference(parseFloat(amount))}</p> */}
        {/* <p className={styles.exchangeRate}>
          Tasa BCV: {paymentData?.tasaCambio?.toFixed(2)} Bs./USD
        </p> */}
        {isMultiplePayment && (
          <p className={styles.multipleNote}>
            Pago por {multipleIds.split(',').length} guías
          </p>
        )}
      </div>
    </div>
  );

  const renderMethodSelection = () => (
    <div className={styles.methodContainer}>
      <h3 className={styles.stepTitle}>Selecciona el Método de Pago</h3>
      <p className={styles.stepDescription}>
        {isMultiplePayment
          ? `Elige cómo deseas realizar el pago para ${multipleIds.split(',').length} guías`
          : 'Elige cómo deseas realizar el pago para tu guía'}
      </p>

      <div className={styles.methodOptions}>
        <div
          className={`${styles.methodOption} ${
            paymentMethod === 'mobile' ? styles.methodOptionActive : ''
          }`}
          onClick={() => setPaymentMethod('mobile')}
        >
          <div className={styles.methodIcon}>
            <IoPhonePortraitOutline size={32} />
          </div>
          <h4>Pago Móvil</h4>
          <p>Transfiere desde tu banco usando pago móvil</p>
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
          <p>Paga directamente con tu tarjeta de débito</p>
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
        {paymentMethod === 'mobile' ? 'Datos del Pago Móvil' : 'Datos de la Tarjeta de Débito'}
      </h3>
      <p className={styles.stepDescription}>
        Completa la información para realizar el pago a través de Mercantil
      </p>

      {/* Cédula/RIF */}
      <div className={styles.inputGroup}>
        <label>Cédula de Identidad / RIF</label>
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
        <small>Resultado: {idType}{idNumber}</small>
      </div>

      {/* Campos específicos según método */}
      {paymentMethod === 'mobile' ? (
        <div className={styles.inputGroup}>
          <label>Número de Teléfono</label>
          <div className={styles.combinedInput}>
            <div
              className={styles.dropdown}
              onClick={(e) => {
                e.stopPropagation();
                setShowPhoneCodes(!showPhoneCodes);
                setShowIdTypes(false);
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
      ) : (
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
                onChange={(e) => setExpirationDate(formatExpirationDate(e.target.value))}
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
        {/* <small>{formatUSDReference(parseFloat(amount))}</small> */}
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
          onClick={paymentMethod === 'mobile' ? handlePayment : handleCardAuth}
          disabled={isLoading}
          className={styles.btn_primary}
        >
          {isLoading ? 'Procesando...' : 'Realizar Pago'}
        </button>
      </div>
    </div>
  );

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
          <span>{paymentMethod === 'mobile' ? 'Pago Móvil' : 'Tarjeta de Débito'}</span>
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

  const renderError = () => (
    <div className={styles.resultContainer}>
      <IoCloseCircleOutline size={64} color="#F44336" />
      <h2>Error en el Proceso</h2>
      <p>{error}</p>

      <div className={styles.buttonRow}>
        <button onClick={handleRetry} className={styles.btn_secondary}>
          <IoArrowBack style={{marginBottom: -4}} /> Reintentar
        </button>
        <button onClick={handleBackToGuides} className={styles.btn_primary}>
          Volver a Guías
        </button>
      </div>
    </div>
  );

  // Render principal
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          {step === 'loading' ? 'Procesando' :
           step === 'method' ? 'Método de Pago' :
           step === 'form' ? (paymentMethod === 'mobile' ? 'Pago Móvil Mercantil' : 'Pago con Tarjeta Mercantil') :
           step === 'success' ? 'Pago Exitoso' :
           'Error de Pago'}
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