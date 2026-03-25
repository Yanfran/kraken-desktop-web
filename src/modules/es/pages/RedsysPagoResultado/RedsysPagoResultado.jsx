// src/modules/es/pages/RedsysPagoResultado/RedsysPagoResultado.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { vincularGuiaASesion } from '../../../../services/es/spainPaymentService'; // ✅ solo esta
import { createSendSeiShipment, createSendSeiPickup } from '../../../../services/es/sendSeiService';
import { createSpainGuia } from '../../../../services/es/spainGuiaService';
import './RedsysPagoResultado.scss';

const KRAKEN_WAREHOUSE = {
  fullName: 'Kraken Courier España', email: 'operaciones@krakencourier.com',
  phoneNumber: '+34600000000', address: 'Calle Mayor',
  addressNumber: '1', postalCode: '28013', city: 'Madrid',
};

const getNextBusinessDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function RedsysPagoResultado() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();

  const estado = searchParams.get('estado');
  const pedido = searchParams.get('pedido');

  const [fase,  setFase]  = useState('verificando');
  const [guia,  setGuia]  = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (estado === 'ko') { limpiar(); setFase('ko'); return; }
    if (!pedido)          { setFase('error'); return; }
    procesarPagoOk();
  }, []);

  const limpiar = () => sessionStorage.removeItem('ke_pago_pendiente');

  const procesarPagoOk = async () => {
    try {
      // 1. Recuperar datos del wizard
      const raw = sessionStorage.getItem('ke_pago_pendiente');
      if (!raw) { setFase('ok_sin_datos'); return; }

      const { numeroPedido, total, wizardData } = JSON.parse(raw);
      const { courierId, courierServiceId,
              selectedOriginAddress: origin,
              packages, courierQuote } = wizardData;
      const pkg = packages?.[0] ?? {};

      // 2. Crear shipment SendSei
      setFase('creando_envio');
      const shipmentRes = await createSendSeiShipment({
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
        destination: KRAKEN_WAREHOUSE,
        packages: [{
          weightKg:           String(parseFloat(pkg.peso  || 0)),
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

      // 3. Crear pickup
      const pickupRes = await createSendSeiPickup(
        getNextBusinessDate(), '09:00', '14:00',
        [shipmentUuid], 'Recogida Kraken Courier'
      );
      const pickupCode = pickupRes.data?.pickups?.[0]?.pickup_code ?? null;

      // 4. Crear guía
      setFase('creando_guia');
      const guiaRes = await createSpainGuia(
        wizardData, shipmentUuid, pickupCode,
        shipmentRes.data, pickupRes.data
      );

      if (!guiaRes?.nGuia) throw new Error('Error creando la guía.');

      // 5. ✅ Vincular NGuia a la sesión pre-registrada
      //    Si el webhook ya llegó → VincularGuia marca TienePago=true automáticamente
      //    Si el webhook aún no llegó → cuando llegue encontrará el NGuia y lo marcará
      await vincularGuiaASesion(numeroPedido, guiaRes.nGuia, guiaRes.guiaId);

      limpiar();
      setGuia({
        nGuia:          guiaRes.nGuia,
        courierName:    courierQuote?.courier ?? null,
        courierService: courierQuote?.service ?? null,
        courierTotal:   courierQuote?.total   ?? null,
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
    creando_envio: 'Registrando recogida con el courier...',
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
      <div className="redsys-resultado__actions">
        <button onClick={() => navigate('/home')}                     className="btn-primary">Ir al Inicio</button>
        <button onClick={() => navigate(`/tracking/${guia?.nGuia}`)}  className="btn-secondary">🔍 Rastrear envío</button>
      </div>
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