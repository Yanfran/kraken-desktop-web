// src/modules/es/pages/RedsysPagoResultado/RedsysPagoResultado.jsx
import { useEffect, useState, useRef  } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { vincularGuiaASesion, consultarEstadoPago } from '../../../../services/es/spainPaymentService';
import {
  createSendSeiShipment,
  createSendSeiPickup,
  getPickupResult,
  getNextBusinessDays,
  PICKUP_SLOT,
  openSpainLabel,
  formatHorarioSeur,
} from '../../../../services/es/sendSeiService';
import { createSpainGuia } from '../../../../services/es/spainGuiaService';
import './RedsysPagoResultado.scss';

const toKg = (peso, unidad) => {
  const n = parseFloat(peso || 0);
  return String(unidad).toLowerCase() === 'lb' ? (n / 2.20462).toFixed(2) : n.toFixed(2);
};

export default function RedsysPagoResultado() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();

  const estado = searchParams.get('estado');
  const pedido = searchParams.get('pedido');

  const [fase,  setFase]  = useState('verificando');
  const [guia,  setGuia]  = useState(null);
  const [error, setError] = useState(null);
  const [labelError, setLabelError] = useState(null);

  const descargarEtiqueta = async () => {
    setLabelError(null);
    const res = await openSpainLabel(guia.nGuia);
    if (!res.success)
      setLabelError('La etiqueta todavía no está disponible. Vuelve a intentarlo en unos minutos desde el detalle del envío.');
  };

    // ✅ Guardia anti-doble ejecución (React Strict Mode ejecuta useEffect 2 veces en dev)
  const yaEjecutado = useRef(false);

  useEffect(() => {
    // ✅ Si ya se ejecutó, salir inmediatamente
    if (yaEjecutado.current) return;
    yaEjecutado.current = true;

    if (estado === 'ko') { limpiar(); setFase('ko'); return; }
    if (!pedido)          { setFase('error'); return; }
    procesarPagoOk();
  }, []);



  const limpiar = () => {
    sessionStorage.removeItem('ke_pago_pendiente');
    sessionStorage.removeItem('ke_pago_progreso');
  };

  // Progreso post-pago por pedido: si la página se recarga o falla a mitad, no se
  // vuelve a crear el envío en SendSei (cada envío se cobra) ni la recogida.
  const leerProgreso = (numeroPedido) => {
    try {
      const p = JSON.parse(sessionStorage.getItem('ke_pago_progreso') ?? 'null');
      return p?.numeroPedido === numeroPedido ? p : { numeroPedido };
    } catch { return { numeroPedido }; }
  };
  const guardarProgreso = (p) => {
    try { sessionStorage.setItem('ke_pago_progreso', JSON.stringify(p)); } catch { /* sin storage */ }
  };

  const procesarPagoOk = async () => {
    try {
      // 1. Recuperar datos del wizard
      const raw = sessionStorage.getItem('ke_pago_pendiente');
      if (!raw) { setFase('ok_sin_datos'); return; }

      const { numeroPedido, total, wizardData } = JSON.parse(raw);
      const { courierId, courierServiceId,
              selectedOriginAddress: origin,
              packages, courierQuote,
              deliveryMethod, pickupDate, pickupTimeFrom, pickupTimeTo, dropoffPoint } = wizardData;
      const pkg = packages?.[0] ?? {};
      const esDropOff = deliveryMethod === 'dropoff';

      // 1.5 Confirmar el pago antes de crear nada. El backend ya confirma el pago de forma
      //     síncrona en verificar-retorno (antes de redirigir aquí), así que normalmente ya
      //     está APROBADO. El webhook notificacion queda como respaldo si ese camino falla.
      //     Si se rechazó → "ko". Si aún no hay confirmación → "pendiente": no se crea el
      //     envío ni la guía (el backend también lo exige).
      setFase('verificando');
      // Primero se paga y después se crea todo (igual que USA). La confirmación normalmente
      // ya está lista al llegar aquí, pero se espera hasta ~90s antes de rendirse por si el
      // banco/red tardan, o si tocó caer en el camino de respaldo (webhook) — si el
      // cliente ve "pendiente" aunque el pago sí se vaya a confirmar segundos después.
      const MAX_INTENTOS = 30;
      const INTERVALO_MS = 3000;
      let estadoPago = null;

      for (let intento = 0; intento < MAX_INTENTOS; intento++) {
        const res = await consultarEstadoPago(numeroPedido);
        if (res.success && res.data?.procesado) {
          estadoPago = res.data;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS));
      }

      if (estadoPago && !estadoPago.autorizado) {
        limpiar();
        setFase('ko');
        return;
      }

      // Sin confirmación todavía: NO se crea nada. El cliente puede volver a verificar.
      if (!estadoPago?.autorizado) {
        setFase('pendiente');
        return;
      }

      const progreso = leerProgreso(numeroPedido);

      // 2. Crear shipment SendSei (una sola vez por pedido)
      setFase('creando_envio');
      const shipmentRes = progreso.shipment
        ? { success: true, data: progreso.shipment }
        : await createSendSeiShipment({
        courierId, courierServiceId,
        insuredAmount: total > 0 ? parseFloat(total).toFixed(2) : null,
        origin: {
          fullName:      origin.fullName  ?? origin.alias ?? 'Cliente',
          company:       null,
          email:         origin.email     ?? 'noreply@krakencourier.com',
          phoneNumber:   origin.phone     ?? '000000000',
          address:       origin.line1     ?? origin.address ?? '',
          addressNumber: origin.addressNumber || 'S/N',
          postalCode:    origin.postalCode ?? origin.zip ?? '',
          city:          origin.city      ?? '',
        },
        // El destino siempre es el almacén Kraken España: el backend lo resuelve
        // desde su propia configuración (AlmacenKE), igual que en USA (KU).
        destination: {},
        originPickupPointCode: esDropOff ? dropoffPoint?.pudo_id : null,
        numeroPedidoRedsys: numeroPedido,
        packages: [{
          weightKg:           toKg(pkg.peso, pkg.unidadPeso),
          lengthCm:           String(parseFloat(pkg.largo || 0)),
          widthCm:            String(parseFloat(pkg.ancho || 0)),
          heightCm:           String(parseFloat(pkg.alto  || 0)),
          contentDescription: (pkg.descripcion ?? 'Mercancía general').slice(0, 50),
          declaredValue:      String(parseFloat(pkg.valorFOB ?? '0')),
        }],
      });

      if (!shipmentRes.success || !shipmentRes.data?.uuid)
        throw new Error('Error creando envío con el courier.');

      const shipmentUuid = shipmentRes.data.uuid;
      progreso.shipment = shipmentRes.data;
      guardarProgreso(progreso);

      // 3. Crear pickup (solo recogida a domicilio; en drop-off el cliente lleva el paquete al punto)
      //    Si SendSei no agenda la recogida, la guía se crea igual con pickupPendiente
      //    y el cliente la reagenda desde el detalle (mismo criterio que USA).
      let pickupRes  = { data: progreso.pickupData ?? null };
      let pickupCode = progreso.pickupCode ?? null;
      if (!esDropOff && !progreso.pickupIntentado) {
        pickupRes = await createSendSeiPickup(
          pickupDate ?? getNextBusinessDays(1)[0].iso,
          pickupTimeFrom ?? PICKUP_SLOT.from,
          pickupTimeTo ?? PICKUP_SLOT.to,
          [shipmentUuid], 'Recogida Kraken Courier'
        );
        const pickupResult = getPickupResult(pickupRes.data);
        if (pickupResult.ok) pickupCode = pickupResult.pickup.pickup_code;
        else console.warn('[RedsysPagoResultado] Recogida no agendada:', pickupResult.message ?? pickupRes.error);
        guardarProgreso({ ...progreso, pickupIntentado: true, pickupData: pickupRes.data, pickupCode });
      }

      // 4. Crear guía
      setFase('creando_guia');
      // Reintento: si la respuesta se pierde (timeout/red) la guía puede existir ya;
      // el backend la devuelve por numeroPedidoRedsys sin duplicarla.
      let guiaRes = null;
      for (let intento = 0; intento < 3 && !guiaRes?.nGuia; intento++) {
        if (intento > 0) await new Promise((r) => setTimeout(r, 3000));
        guiaRes = await createSpainGuia(
          wizardData, shipmentUuid, pickupCode,
          shipmentRes.data, pickupRes.data, numeroPedido
        );
      }

      if (!guiaRes?.nGuia) throw new Error(guiaRes?.error ?? 'Error creando la guía.');

      // 5. ✅ Vincular NGuia a la sesión pre-registrada
      //    Si ya se confirmó el pago → VincularGuia marca TienePago=true automáticamente
      //    Si aún no se confirma → cuando llegue (verificar-retorno o webhook) encontrará
      //    el NGuia y lo marcará
      await vincularGuiaASesion(numeroPedido, guiaRes.nGuia, guiaRes.guiaId);

      limpiar();
      setGuia({
        nGuia:          guiaRes.nGuia,
        guiaId:         guiaRes.guiaId,
        courierName:    courierQuote?.courier ?? null,
        courierService: courierQuote?.service ?? null,
        courierTotal:   courierQuote?.total   ?? null,
        esDropOff,
        dropoffPoint:   esDropOff ? dropoffPoint : null,
        labelUrl:       shipmentRes.data?.label_url ?? null,
        pickupCode,
        pickupPendiente: !esDropOff && !pickupCode,
      });
      setFase('ok');

    } catch (err) {
      console.error('[RedsysPagoResultado]', err);
      setError(err.message);
      setFase('error_post_pago');
    }
  };

  // ── Renders ───────────────────────────────────────────────────────────────
  const FASES_CARGA = {
    verificando:   'Verificando tu pago...',
    creando_envio: 'Registrando el envío con el courier...',
    creando_guia:  'Generando tu guía de envío...',
  };

  if (FASES_CARGA[fase]) return (
    <div className="redsys-resultado redsys-resultado--verificando">
      <div className="redsys-resultado__spinner" />
      <h2>{FASES_CARGA[fase]}</h2>
      <p>Por favor no cierres esta ventana.</p>
    </div>
  );

  if (fase === 'ok') return (
    <div className="redsys-resultado redsys-resultado--ok">
      <div className="redsys-resultado__icon">✅</div>
      <h2>¡Pago Confirmado!</h2>
      <p>Tu envío ha sido registrado correctamente.</p>
      {guia?.nGuia && (
        <div className="redsys-resultado__guia">
          <span className="redsys-resultado__guia-label">Tu número de guía</span>
          <span className="redsys-resultado__guia-number">{guia.nGuia}</span>
        </div>
      )}
      {guia?.courierName && (
        <div className="redsys-resultado__courier">
          🚚 {guia.courierName} — {guia.courierService}
          {guia.courierTotal && <strong> €{Number(guia.courierTotal).toFixed(2)}</strong>}
        </div>
      )}
      {guia?.esDropOff && guia.dropoffPoint && (
        <div className="redsys-resultado__punto">
          <span className="redsys-resultado__punto-label">📍 Entrega en punto SEUR</span>
          <strong className="redsys-resultado__punto-nombre">{guia.dropoffPoint.name}</strong>
          <span className="redsys-resultado__punto-direccion">
            {guia.dropoffPoint.address}, {guia.dropoffPoint.postal_code} {guia.dropoffPoint.city}
          </span>
          {formatHorarioSeur(guia.dropoffPoint.hours).length > 0 && (
            <ul className="redsys-resultado__horario">
              {formatHorarioSeur(guia.dropoffPoint.hours).map((h) => (
                <li key={h.dia}><span>{h.dia}</span><span>{h.horas}</span></li>
              ))}
            </ul>
          )}
          <p className="redsys-resultado__punto-nota">
            Imprime la etiqueta, pégala en el paquete y llévalo a este punto.
          </p>
        </div>
      )}
      {guia?.pickupCode && (
        <div className="redsys-resultado__courier">📅 Recogida agendada — código <strong>{guia.pickupCode}</strong></div>
      )}
      {guia?.pickupPendiente && (
        <div className="redsys-resultado__courier" style={{ color: '#B45309' }}>
          ⚠️ El courier no pudo agendar la recogida automáticamente. Puedes reagendarla sin coste
          desde el detalle de tu envío.
        </div>
      )}
      <div className="redsys-resultado__actions">
        {guia?.labelUrl && (
          <button onClick={descargarEtiqueta} className="btn-secondary">🖨️ Descargar etiqueta</button>
        )}
        <button onClick={() => navigate('/home')}                     className="btn-primary">Ir al Inicio</button>
        <button onClick={() => navigate(`/tracking/${guia?.nGuia}`)}  className="btn-secondary">🔍 Rastrear envío</button>
      </div>
      {labelError && <p className="redsys-resultado__label-error">⚠️ {labelError}</p>}
    </div>
  );

  if (fase === 'ko') return (
    <div className="redsys-resultado redsys-resultado--ko">
      <div className="redsys-resultado__icon">❌</div>
      <h2>Pago No Procesado</h2>
      <p>La tarjeta fue denegada o cancelaste el pago.</p>
      <p style={{ fontSize: '0.82rem' }}>No se realizó ningún cargo ni se creó ningún envío.</p>
      <div className="redsys-resultado__actions">
        <button onClick={() => navigate('/pickup')} className="btn-primary">← Volver a intentar</button>
        <button onClick={() => navigate('/home')}   className="btn-secondary">Ir al Inicio</button>
      </div>
    </div>
  );

  if (fase === 'pendiente') return (
    <div className="redsys-resultado redsys-resultado--verificando">
      <div className="redsys-resultado__icon">⏳</div>
      <h2>Pago en verificación</h2>
      <p>Todavía no recibimos la confirmación del banco. Tu envío se creará en cuanto el pago esté confirmado.</p>
      <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>N.º de pedido: <strong>{pedido}</strong></p>
      <div className="redsys-resultado__actions">
        <button onClick={() => procesarPagoOk()} className="btn-primary">🔄 Volver a verificar</button>
        <button onClick={() => navigate('/home')} className="btn-secondary">Ir al Inicio</button>
      </div>
    </div>
  );

  if (fase === 'ok_sin_datos') return (
    <div className="redsys-resultado redsys-resultado--ok">
      <div className="redsys-resultado__icon">✅</div>
      <h2>¡Pago Confirmado!</h2>
      <p>El pago fue procesado. Revisa tus envíos para ver el estado.</p>
      <div className="redsys-resultado__actions">
        <button onClick={() => navigate('/home')} className="btn-primary">Ir al Inicio</button>
      </div>
    </div>
  );

  return (
    <div className="redsys-resultado redsys-resultado--error">
      <div className="redsys-resultado__icon">⚠️</div>
      <h2>Error procesando el envío</h2>
      <p>{error ?? 'Ocurrió un error inesperado.'}</p>
      <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
        El pago fue recibido. Contacta soporte indicando: <strong>{pedido}</strong>
      </p>
      <div className="redsys-resultado__actions">
        <button onClick={() => navigate('/home')} className="btn-primary">Ir al Inicio</button>
      </div>
    </div>
  );
}