import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.scss';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      <div className="terms-wrapper">
        <div className="terms-header">
          <h1 className="terms-header-title">Términos y Condiciones de Registro y Uso del Servicio de Kraken Courier</h1>
        </div>

        <div className="terms-content">
          {/* Sección 1 */}
          <div className="terms-section">
            <h2 className="terms-section-title">1. Identificación de la empresa</h2>
            <p className="terms-section-text">
              El presente documento establece los términos y condiciones aplicables al registro, acceso y uso del servicio de casillero internacional, plataforma web y servicios logísticos prestados por Kraken Courier and Cargo, C.A., identificada con RIF J504893072, código IPOSTEL IP 1023924111, con domicilio fiscal en Calle Páez, Edif. Turiamo Nro. 13, Piso PB, Local 03, Urb. Mis Encantos, Caracas (Chacao), Miranda, Zona Postal 1060, en lo sucesivo denominada "Kraken Courier".
            </p>
            <p className="terms-section-text">
              Para asuntos legales o notificaciones relacionadas con estos términos, el usuario podrá escribir a legal@krakencourier.com.
            </p>
          </div>

          {/* Sección 2 */}
          <div className="terms-section">
            <h2 className="terms-section-title">2. Aceptación de los términos</h2>
            <p className="terms-section-text">
              Al registrarse en la app web, solicitar un casillero, utilizar su cuenta, prealertar paquetes, cargar documentos, enviar mercancía a cualquiera de los almacenes de Kraken Courier o contratar cualquier servicio relacionado, el usuario declara haber leído, entendido y aceptado íntegramente estos términos y condiciones.
            </p>
            <p className="terms-section-text">
              Si el usuario no está de acuerdo con estos términos, no deberá registrarse ni utilizar los servicios de Kraken Courier.
            </p>
          </div>

          {/* Sección 3 */}
          <div className="terms-section">
            <h2 className="terms-section-title">3. Objeto</h2>
            <p className="terms-section-text">
              Estos términos regulan:
            </p>
            <p className="terms-section-text">a) el registro y uso de la cuenta del usuario en la app web;</p>
            <p className="terms-section-text">b) la asignación y uso del casillero;</p>
            <p className="terms-section-text">c) la recepción, procesamiento, almacenaje, transporte, nacionalización, entrega y demás gestiones logísticas asociadas a paquetes o mercancías;</p>
            <p className="terms-section-text">d) la facturación y cobro de los servicios; y</p>
            <p className="terms-section-text">e) el tratamiento de los datos suministrados por el usuario.</p>
          </div>

          {/* Sección 4 */}
          <div className="terms-section">
            <h2 className="terms-section-title">4. Capacidad para contratar</h2>
            <p className="terms-section-text">
              El servicio puede ser utilizado por:
            </p>
            <p className="terms-section-text">a) personas naturales mayores de edad con capacidad legal para contratar; y</p>
            <p className="terms-section-text">b) personas jurídicas, por medio de su representante, empleado o persona debidamente autorizada.</p>
            <p className="terms-section-text">
              Quien registre o utilice una cuenta en nombre de una empresa declara que tiene facultad suficiente para actuar en su nombre y obligarla conforme a estos términos.
            </p>
          </div>

          {/* Sección 5 */}
          <div className="terms-section">
            <h2 className="terms-section-title">5. Modificaciones</h2>
            <p className="terms-section-text">
              Kraken Courier podrá modificar estos términos y condiciones en cualquier momento. La versión vigente será la publicada por Kraken Courier en su app web, sitio web o canales oficiales.
            </p>
            <p className="terms-section-text">
              El uso continuado de la cuenta o del servicio después de su publicación implica aceptación de la versión actualizada.
            </p>
          </div>

          {/* Sección 6 */}
          <div className="terms-section">
            <h2 className="terms-section-title">6. Ley aplicable y jurisdicción</h2>
            <p className="terms-section-text">
              Estos términos se regirán por las leyes de la República Bolivariana de Venezuela.
            </p>
            <p className="terms-section-text">
              Cualquier controversia derivada de la interpretación, ejecución o validez de estos términos, o del uso del servicio, será sometida a los tribunales competentes de la ciudad de Caracas.
            </p>
          </div>

          {/* Sección 7 */}
          <div className="terms-section">
            <h2 className="terms-section-title">7. Registro, cuenta e información del usuario</h2>
            <p className="terms-section-text">
              El usuario garantiza que toda la información suministrada durante el registro y durante el uso de la cuenta es verdadera, exacta, completa y actualizada.
            </p>
            <p className="terms-section-text">
              Esto incluye, entre otros: nombre, apellido o razón social, cédula o RIF, correo electrónico, teléfono, dirección fiscal, dirección de entrega, datos de facturación y cualquier otra información requerida por Kraken Courier.
            </p>
            <p className="terms-section-text">
              El usuario será el único responsable por cualquier inconveniente, retraso, cobro, devolución, retención, error de facturación o imposibilidad de entrega causada por datos incorrectos, incompletos, desactualizados o mal suministrados.
            </p>
          </div>

          {/* Sección 8 */}
          <div className="terms-section">
            <h2 className="terms-section-title">8. Seguridad de la cuenta</h2>
            <p className="terms-section-text">
              El usuario es responsable del uso de su cuenta y de la confidencialidad de sus credenciales de acceso.
            </p>
            <p className="terms-section-text">
              Toda operación realizada desde la cuenta del usuario se presumirá hecha por el propio usuario, salvo prueba clara en contrario notificada oportunamente a Kraken Courier.
            </p>
            <p className="terms-section-text">
              El usuario deberá notificar de inmediato cualquier uso no autorizado, acceso sospechoso o incidente de seguridad.
            </p>
          </div>

          {/* Sección 9 */}
          <div className="terms-section">
            <h2 className="terms-section-title">9. Comunicaciones con el usuario</h2>
            <p className="terms-section-text">
              El usuario autoriza a Kraken Courier a enviar comunicaciones al correo electrónico, teléfono, WhatsApp u otros datos de contacto suministrados, tanto para fines operativos y transaccionales como para fines informativos, promocionales y comerciales.
            </p>
            <p className="terms-section-text">
              Las comunicaciones operativas y transaccionales forman parte esencial del servicio y podrán incluir, entre otras, notificaciones de recepción, procesamiento, cobro, incidencia, entrega, requerimiento de documentos, actualización de datos, seguridad o suspensión de cuenta.
            </p>
            <p className="terms-section-text">
              El correo electrónico registrado por el usuario será el medio principal de comunicación. El usuario es responsable de mantenerlo activo, accesible, correctamente escrito, con capacidad disponible para recibir mensajes y configurado de manera que permita la recepción de comunicaciones de Kraken Courier. Kraken Courier no será responsable si los mensajes son filtrados, rechazados, bloqueados, redirigidos a carpetas no revisadas, no recibidos por saturación de la capacidad del buzón, errores de configuración, inactividad de la cuenta o cualquier otra causa imputable al usuario.
            </p>
            <p className="terms-section-text">
              El mismo criterio aplicará a los números telefónicos o de WhatsApp suministrados por el usuario. La falta de actualización de estos datos no suspende plazos ni libera al usuario de las consecuencias derivadas de notificaciones válidamente emitidas por Kraken Courier.
            </p>
          </div>

          {/* Sección 10 */}
          <div className="terms-section">
            <h2 className="terms-section-title">10. Tratamiento de datos</h2>
            <p className="terms-section-text">
              El usuario autoriza a Kraken Courier a recopilar, almacenar, organizar, consultar, usar y procesar sus datos para fines de registro, validación, prestación del servicio, seguimiento logístico, atención al cliente, facturación, cobranza, prevención de fraude, cumplimiento legal y comunicaciones asociadas al servicio.
            </p>
            <p className="terms-section-text">
              Asimismo, el usuario autoriza a Kraken Courier a compartir, transferir o poner dicha información a disposición de empleados, contratistas, aliados comerciales, proveedores tecnológicos, operadores logísticos, transportistas, agentes de aduana, aseguradoras, pasarelas de pago, empresas relacionadas o autoridades competentes, cuando ello sea necesario o conveniente para la ejecución del servicio, la validación de operaciones, la atención de reclamos, la gestión de cobros, el cumplimiento normativo o la protección de los intereses legítimos de Kraken Courier.
            </p>
            <p className="terms-section-text">
              Kraken Courier adoptará medidas razonables de resguardo de la información, sin garantizar invulnerabilidad absoluta de sus sistemas o de las redes de transmisión.
            </p>
          </div>

          {/* Sección 11 */}
          <div className="terms-section">
            <h2 className="terms-section-title">11. Alcance del servicio</h2>
            <p className="terms-section-text">
              Kraken Courier podrá ofrecer, según disponibilidad operativa:
            </p>
            <p className="terms-section-text">a) asignación de casillero;</p>
            <p className="terms-section-text">b) recepción de paquetes en sus almacenes o direcciones habilitadas;</p>
            <p className="terms-section-text">c) prealerta;</p>
            <p className="terms-section-text">d) procesamiento de paquetes;</p>
            <p className="terms-section-text">e) almacenaje temporal;</p>
            <p className="terms-section-text">f) transporte nacional e internacional;</p>
            <p className="terms-section-text">g) gestión logística y documental;</p>
            <p className="terms-section-text">h) entrega en tienda, agencia, punto autorizado o domicilio;</p>
            <p className="terms-section-text">i) seguimiento del envío; y</p>
            <p className="terms-section-text">j) otros servicios complementarios.</p>
            <p className="terms-section-text">
              En el servicio principal de compras online, Kraken Courier normalmente transporta la mercancía en las mismas condiciones en que la recibe. En determinados servicios especiales o complementarios, Kraken Courier podrá realizar reempaque u otras manipulaciones operativas, cuando así lo considere procedente o cuando el servicio contratado lo contemple.
            </p>
            <p className="terms-section-text">
              Kraken Courier no actúa como vendedor, fabricante, distribuidor, representante de la tienda, intermediario de garantía ni verificador comercial del contenido comprado por el usuario. En consecuencia, no será responsable si la tienda, proveedor o tercero envía un artículo distinto al comprado, con talla, color, modelo, versión, compatibilidad, características o especificaciones diferentes a las seleccionadas por el usuario, ni por mercancía incompleta, defectuosa de origen o distinta a la ofertada.
            </p>
            <p className="terms-section-text">
              Kraken Courier no gestiona devoluciones, cambios ni reclamaciones comerciales ante tiendas, vendedores o proveedores, salvo que expresamente acepte prestar un servicio adicional para ello.
            </p>
            <p className="terms-section-text">
              Si el usuario desea que un paquete sea entregado o devuelto a una tienda, proveedor, empresa de transporte o tercero mientras aún se encuentre en un almacén de Kraken Courier, deberá solicitarlo por escrito a través del correo electrónico oficial y autorizar expresamente la entrega a la persona o empresa que lo retirará. Kraken Courier podrá aceptar o rechazar dicha solicitud a su sola discreción. Si no existe instrucción expresa y oportuna, el paquete podrá continuar su curso logístico normal hacia destino, y el usuario seguirá obligado al pago íntegro del servicio y de los cargos aplicables.
            </p>
            <p className="terms-section-text">
              Kraken Courier podrá operar a través de almacenes, tiendas, agencias, puntos de retiro, direcciones logísticas y demás instalaciones propias o de terceros habilitadas para la recepción, procesamiento, resguardo, transporte o entrega de mercancías.
            </p>
            <p className="terms-section-text">
              Kraken Courier podrá abrir, cerrar, sustituir, reubicar o modificar en cualquier momento la ubicación, dirección o condiciones operativas de sus almacenes, tiendas o puntos de retiro, cuando así lo requieran sus necesidades logísticas, operativas, comerciales o de seguridad. Por regla general, Kraken Courier procurará informar estos cambios a sus usuarios por sus canales oficiales, sin que ello implique obligación de notificación individual efectiva en todos los casos.
            </p>
          </div>

          {/* Sección 12 */}
          <div className="terms-section">
            <h2 className="terms-section-title">12. Declaraciones y responsabilidades del usuario</h2>
            <p className="terms-section-text">
              El usuario declara y acepta que:
            </p>
            <p className="terms-section-text">a) la mercancía es legal y de permitida circulación;</p>
            <p className="terms-section-text">b) no enviará artículos prohibidos, restringidos o peligrosos en contravención de la ley o de las políticas de Kraken Courier;</p>
            <p className="terms-section-text">c) la descripción, cantidad, valor y naturaleza del contenido son veraces;</p>
            <p className="terms-section-text">d) la mercancía ha sido adecuadamente embalada por el remitente, vendedor o proveedor, salvo que Kraken Courier haya prestado expresamente un servicio adicional;</p>
            <p className="terms-section-text">e) asume la responsabilidad por cualquier daño, retraso, gasto, multa, sanción o perjuicio derivado de declaraciones falsas, inexactas o incompletas;</p>
            <p className="terms-section-text">f) si envía compras a los almacenes de Kraken Courier, conoce y acepta el funcionamiento del servicio, sus tarifas, condiciones, limitaciones y cargos asociados;</p>
            <p className="terms-section-text">g) es su responsabilidad informarse previamente sobre el servicio antes de enviar mercancía a cualquier dirección o almacén de Kraken Courier;</p>
            <p className="terms-section-text">h) tiene a su disposición herramientas informativas, incluyendo una calculadora pública de tarifas estimadas, cuya finalidad es orientativa y no sustituye la tarifa final aplicable al paquete efectivamente recibido, procesado y medido;</p>
            <p className="terms-section-text">i) es su responsabilidad enviar sus paquetes a la dirección correcta y vigente indicada por Kraken Courier para el servicio correspondiente; y</p>
            <p className="terms-section-text">j) es su responsabilidad identificar correctamente cada paquete conforme a las instrucciones suministradas por Kraken Courier, incluyendo de forma clara y suficiente el nombre y apellido del titular o razón social, el número de casillero y cualquier otro dato que Kraken Courier exija para su correcta identificación y asociación.</p>
            <p className="terms-section-text">
              El usuario reconoce que, si envía mercancía a los almacenes de Kraken Courier y luego decide no pagar el servicio, ello no lo exime de sus obligaciones de pago ni transfiere a Kraken Courier las consecuencias de su falta de previsión, cálculo o consulta previa.
            </p>
            <p className="terms-section-text">
              Si un paquete es enviado a una dirección incorrecta, desactualizada o no habilitada, o si llega sin identificación suficiente o con datos erróneos, incompletos, ambiguos o inconsistentes, Kraken Courier no será responsable por retrasos, extravíos, bloqueos operativos, falta de procesamiento, falta de asociación a la cuenta del usuario, ni por la imposibilidad de enviarlo a destino.
            </p>
            <p className="terms-section-text">
              Los paquetes que no puedan ser identificados o asociados de forma segura a un usuario podrán quedar retenidos, bloqueados o sin procesamiento hasta tanto el usuario aporte información suficiente y Kraken Courier logre validar razonablemente su titularidad o destino, sin que ello obligue a Kraken Courier a despacharlos, transportarlos o entregarlos mientras subsista la inconsistencia.
            </p>
          </div>

          {/* Sección 13 */}
          <div className="terms-section">
            <h2 className="terms-section-title">13. Facultad de inspección</h2>
            <p className="terms-section-text">
              El usuario autoriza expresamente a Kraken Courier a revisar, abrir, inspeccionar, escanear o verificar el contenido de cualquier envío cuando lo considere razonablemente necesario por motivos de seguridad, cumplimiento normativo, validación operativa, prevención de fraude, gestión aduanera o requerimiento de autoridad competente.
            </p>
          </div>

          {/* Sección 14 */}
          <div className="terms-section">
            <h2 className="terms-section-title">14. Inicio de responsabilidad de Kraken Courier</h2>
            <p className="terms-section-text">
              Kraken Courier solo será responsable por un paquete a partir del momento en que dicho paquete conste como efectivamente recibido y procesado en su sistema.
            </p>
            <p className="terms-section-text">
              La sola afirmación de una tienda, proveedor, courier de última milla o tercero de que el paquete fue "entregado" no será suficiente para imputar responsabilidad a Kraken Courier.
            </p>
            <p className="terms-section-text">
              Si el usuario alega que un paquete fue entregado en almacén pero no aparece recibido en el sistema de Kraken Courier, deberá presentar pruebas suficientes, incluyendo, cuando existan: constancia de entrega, POD, fotografía, nombre y firma de quien recibió, fecha, hora exacta y cualquier otro soporte útil. Kraken Courier se reserva el derecho de valorar libremente dichos soportes.
            </p>
          </div>

          {/* Sección 15 */}
          <div className="terms-section">
            <h2 className="terms-section-title">15. Prealerta, valor declarado y documentos de soporte</h2>
            <p className="terms-section-text">
              El usuario deberá prealertar sus paquetes y suministrar, cuando corresponda, la documentación de respaldo del contenido y valor FOB, incluyendo factura, orden de compra, captura de pantalla de compra, comprobante de pago o cualquier otro documento razonablemente idóneo que permita identificar la mercancía y su valor.
            </p>
            <p className="terms-section-text">
              Kraken Courier podrá tomar como válidos los documentos cargados previamente por el usuario en su casillero o enviados por sus canales oficiales, siempre que resulten suficientes a criterio de Kraken Courier.
            </p>
            <p className="terms-section-text">
              Si el usuario no suministra valor FOB o documentación de respaldo suficiente, Kraken Courier podrá procesar el paquete con la información que logre identificar razonablemente al momento del procesamiento. Esa información quedará registrada en la guía y en el casillero del usuario.
            </p>
            <p className="terms-section-text">
              Una vez procesado el paquete y notificado el usuario, este tendrá un plazo de cuarenta y ocho (48) horas hábiles para solicitar la corrección de la información registrada y consignar los soportes correspondientes a través de los medios oficiales de Kraken Courier.
            </p>
            <p className="terms-section-text">
              Vencido ese lapso sin objeción formal del usuario, se entenderá que el usuario aprueba y acepta la información registrada en la guía, incluyendo la descripción, valor y demás datos asociados al paquete.
            </p>
            <p className="terms-section-text">
              Las solicitudes de corrección deberán hacerse por los canales oficiales de Kraken Courier, incluyendo hola@krakencourier.com y WhatsApp +58 414 254 30 42, o por cualquier otro canal oficial que Kraken Courier habilite en el futuro.
            </p>
          </div>

          {/* Sección 16 */}
          <div className="terms-section">
            <h2 className="terms-section-title">16. Tarifas, cargos y tributos</h2>
            <p className="terms-section-text">
              El usuario acepta pagar todas las tarifas, cargos y conceptos aplicables al servicio, incluyendo flete, seguro, almacenaje, entrega, gestiones documentales, cargos operativos, impuestos, tasas, contribuciones, aranceles y demás montos que correspondan.
            </p>
            <p className="terms-section-text">
              Los aranceles, tributos, tasas o cargos exigidos por autoridades o terceros no se entienden incluidos en el flete, salvo que Kraken Courier lo indique expresamente.
            </p>
            <p className="terms-section-text">
              Si después de procesado o facturado un envío surgieren diferencias de peso, dimensiones, volumen, valor, impuestos, aranceles, almacenaje o cualquier otro cargo aplicable, el usuario deberá pagarlos para que el paquete pueda continuar su curso o ser entregado.
            </p>
          </div>

          {/* Sección 17 */}
          <div className="terms-section">
            <h2 className="terms-section-title">17. Revisión de peso y medidas</h2>
            <p className="terms-section-text">
              Cuando la tarifa dependa del peso, volumen, peso volumétrico, medidas o características del paquete, los datos determinados por Kraken Courier durante el procesamiento serán los aplicables para el cálculo del servicio.
            </p>
            <p className="terms-section-text">
              El usuario tendrá derecho a solicitar la revisión del peso o de las medidas de su paquete cuando considere que los datos registrados inicialmente son errados. Si, realizada la verificación, se determina que existió un error, Kraken Courier corregirá los datos correspondientes y ajustará la tarifa en consecuencia.
            </p>
            <p className="terms-section-text">
              Si de la corrección resulta un monto adicional a pagar, el usuario deberá cancelarlo para que el paquete continúe su curso o pueda ser entregado. Si de la corrección resulta un saldo a favor del usuario y este ya hubiese pagado, Kraken Courier podrá, a su elección, aplicar dicho saldo como crédito a favor del usuario para un envío posterior o efectuar el reembolso por el medio que estime procedente, dentro de un plazo razonable y sujeto a sus controles administrativos y de validación.
            </p>
          </div>

          {/* Sección 18 */}
          <div className="terms-section">
            <h2 className="terms-section-title">18. Pagos en origen y pagos en Venezuela</h2>
            <p className="terms-section-text">
              Algunos servicios podrán ser cobrados por anticipado en origen, incluyendo operaciones en Estados Unidos o Europa, y pagados en la moneda local correspondiente a través de la entidad operativa, aliada, corresponsal o estructura comercial que preste o administre el servicio en dicho país.
            </p>
            <p className="terms-section-text">
              En esos casos, los recibos o facturas podrán emitirse en origen conforme a la normativa aplicable en esa jurisdicción.
            </p>
            <p className="terms-section-text">
              Los servicios cobrados en bolívares en Venezuela serán facturados localmente de conformidad con la normativa aplicable.
            </p>
          </div>

          {/* Sección 19 */}
          <div className="terms-section">
            <h2 className="terms-section-title">19. Facturación con base en los datos del usuario</h2>
            <p className="terms-section-text">
              Las facturas y demás documentos fiscales o comerciales se emitirán con base en la información suministrada por el usuario en su registro o en su cuenta.
            </p>
            <p className="terms-section-text">
              El usuario es responsable de verificar y mantener actualizados sus datos fiscales y de facturación antes de solicitar el servicio o antes de la emisión del documento correspondiente.
            </p>
            <p className="terms-section-text">
              Una vez emitida una factura con base en los datos suministrados por el usuario, Kraken Courier no estará obligada a anularla, sustituirla, corregirla o reemitirla por errores imputables al usuario, incluyendo errores en nombre, apellido, razón social, cédula, RIF, correo, dirección fiscal u otros datos equivalentes.
            </p>
          </div>

          {/* Sección 20 */}
          <div className="terms-section">
            <h2 className="terms-section-title">20. Seguro obligatorio de la mercancía</h2>
            <p className="terms-section-text">
              Toda mercancía transportada por Kraken Courier viaja con seguro o cobertura obligatoria conforme a las condiciones internas del servicio.
            </p>
            <p className="terms-section-text">
              La cobertura se calculará, en principio, sobre el valor declarado por el usuario, siempre que dicho valor esté respaldado por factura, orden de compra, comprobante de pago, captura de pantalla u otro documento razonablemente válido y suficiente a criterio de Kraken Courier.
            </p>
            <p className="terms-section-text">
              Si el usuario no declara un valor o no consigna soportes suficientes, Kraken Courier podrá asignar un valor referencial al momento del procesamiento del paquete. Ese valor será el que se utilizará para fines operativos, de facturación y de eventual cobertura, salvo que el usuario lo objete y corrija oportunamente dentro del plazo establecido en estos términos.
            </p>
          </div>

          {/* Sección 21 */}
          <div className="terms-section">
            <h2 className="terms-section-title">21. Alcance de la cobertura y limitación de responsabilidad</h2>
            <p className="terms-section-text">
              Kraken Courier no garantiza indemnización automática por toda incidencia reportada. Cada caso será evaluado según sus circunstancias, los soportes aportados, el estado del paquete, la oportunidad del reclamo y la determinación de responsabilidad.
            </p>
            <p className="terms-section-text">
              En caso de pérdida total atribuible a Kraken Courier, la eventual indemnización no excederá el valor registrado y aprobado del paquete en la guía o en el sistema.
            </p>
            <p className="terms-section-text">
              En caso de daño parcial, deterioro, avería o afectación del contenido, Kraken Courier solo responderá si, luego de la evaluación correspondiente, se determina razonablemente que el daño le es imputable.
            </p>
            <p className="terms-section-text">
              Kraken Courier no responderá por:
            </p>
            <p className="terms-section-text">a) embalaje insuficiente de origen;</p>
            <p className="terms-section-text">b) defectos propios del producto;</p>
            <p className="terms-section-text">c) desgaste normal, abolladuras leves, rayas, afectaciones menores del empaque o caja exterior que no comprometan de forma sustancial el contenido;</p>
            <p className="terms-section-text">d) daños no reportados al momento de la entrega o retiro;</p>
            <p className="terms-section-text">e) mercancía frágil o sensible mal protegida por el remitente, proveedor o fabricante;</p>
            <p className="terms-section-text">f) retenciones, decomisos o actuaciones de autoridad;</p>
            <p className="terms-section-text">g) errores de vendedores, tiendas, couriers previos o terceros ajenos a Kraken Courier.</p>
          </div>

          {/* Sección 22 */}
          <div className="terms-section">
            <h2 className="terms-section-title">22. Efectos del pago de una indemnización</h2>
            <p className="terms-section-text">
              Si Kraken Courier paga total o parcialmente una indemnización por pérdida, faltante o daño de una mercancía, podrá exigir la entrega de la mercancía, del remanente, de sus partes, accesorios, empaque o restos recuperables, así como ejercer los derechos de recuperación, salvamento, cesión o subrogación que correspondan.
            </p>
          </div>

          {/* Sección 23 */}
          <div className="terms-section">
            <h2 className="terms-section-title">23. Entrega, destino y cambios solicitados por el usuario</h2>
            <p className="terms-section-text">
              El lugar, modalidad o punto de entrega del paquete será el que el usuario tenga registrado en su cuenta como opción predeterminada, o el que conste en la guía o en el sistema al momento del procesamiento.
            </p>
            <p className="terms-section-text">
              Por razones logísticas, operativas, de seguridad, cobertura, disponibilidad, enrutamiento o capacidad de servicio, Kraken Courier podrá modificar el lugar o modalidad de entrega sin previo aviso, cuando ello resulte necesario para la correcta prestación del servicio.
            </p>
            <p className="terms-section-text">
              Una vez que el paquete haya sido procesado y etiquetado, el usuario no podrá exigir cambios de destino, modalidad de entrega, tienda, agencia, punto de retiro o dirección. Kraken Courier podrá estudiar dichas solicitudes de forma excepcional, pero no estará obligada a aceptarlas.
            </p>
            <p className="terms-section-text">
              Cuando Kraken Courier acepte un cambio solicitado por el usuario, podrá aplicar cargos adicionales, nuevos tiempos de tránsito, recálculo de tarifa o condiciones especiales.
            </p>
            <p className="terms-section-text">
              Si la modalidad es entrega a domicilio, el usuario no podrá exigir que la entrega se haga en puntos intermedios, vías públicas, referencias informales, zonas distintas a la dirección registrada o lugares que comprometan la seguridad del personal, del vehículo o de la mercancía.
            </p>
          </div>

          {/* Sección 24 */}
          <div className="terms-section">
            <h2 className="terms-section-title">24. Revisión al momento de la entrega o retiro</h2>
            <p className="terms-section-text">
              Al momento de recibir o retirar un paquete, el usuario o la persona autorizada deberá revisar su estado general antes de firmar, aceptar o retirarse con él.
            </p>
            <p className="terms-section-text">
              Si el empaque presenta señales evidentes de apertura, ruptura, humedad, manipulación irregular, cinta violentada, golpe severo o cualquier condición sospechosa, el usuario deberá reportarlo de inmediato y dejar constancia por el canal indicado por Kraken Courier.
            </p>
            <p className="terms-section-text">
              Si el usuario o su autorizado recibe el paquete, firma conforme o se retira con él sin reportar incidencia inmediata, se presumirá que el paquete fue recibido en condiciones aparentes conformes, y Kraken Courier podrá rechazar reclamos posteriores sobre daños visibles, faltantes aparentes o alteraciones externas detectables al momento de la entrega.
            </p>
          </div>

          {/* Sección 25 */}
          <div className="terms-section">
            <h2 className="terms-section-title">25. Demoras y tiempos de tránsito</h2>
            <p className="terms-section-text">
              Los tiempos de tránsito, fechas estimadas y estatus informados por Kraken Courier son referenciales.
            </p>
            <p className="terms-section-text">
              Kraken Courier no será responsable por retrasos causados por aduana, autoridades, inspecciones, clima, congestión logística, fallas de sistemas, proveedores, transportistas, terceros, fuerza mayor, caso fortuito o cualquier otra circunstancia fuera de su control razonable.
            </p>
          </div>

          {/* Sección 26 */}
          <div className="terms-section">
            <h2 className="terms-section-title">26. Reclamos</h2>
            <p className="terms-section-text">
              Todo reclamo deberá presentarse de forma formal y por escrito a través de hola@krakencourier.com o por cualquier canal oficial que Kraken Courier habilite, indicando al menos:
            </p>
            <p className="terms-section-text">a) número de guía Kraken;</p>
            <p className="terms-section-text">b) nombre y apellido del titular de la cuenta o razón social;</p>
            <p className="terms-section-text">c) correo registrado en el casillero;</p>
            <p className="terms-section-text">d) descripción clara del reclamo; y</p>
            <p className="terms-section-text">e) soportes disponibles.</p>
            <p className="terms-section-text">
              Los faltantes, daños visibles, empaque violentado o irregularidades aparentes deberán ser reportados de inmediato al momento de la entrega o retiro.
            </p>
            <p className="terms-section-text">
              Las incidencias por pérdida, entrega errónea o situaciones no visibles de forma inmediata deberán ser reportadas dentro de los cinco (5) días hábiles siguientes a la entrega, retiro o notificación del hecho.
            </p>
            <p className="terms-section-text">
              Las incidencias relacionadas con valor, descripción o datos del paquete procesado deberán ser reportadas dentro del plazo especial de cuarenta y ocho (48) horas hábiles previsto en estos términos.
            </p>
            <p className="terms-section-text">
              Transcurridos dichos plazos, Kraken Courier podrá considerar el reclamo como extemporáneo y rechazarlo sin necesidad de mayor trámite.
            </p>
          </div>

          {/* Sección 27 */}
          <div className="terms-section">
            <h2 className="terms-section-title">27. Almacenaje, abandono y consecuencias por incumplimiento de pago</h2>
            <p className="terms-section-text">
              Los paquetes que permanezcan sin retiro, sin instrucciones válidas o sin gestión por parte del usuario por un período superior a cuarenta y cinco (45) días calendario podrán ser considerados en abandono operativo.
            </p>
            <p className="terms-section-text">
              Si el paquete permanece detenido por falta de pago por un período superior a quince (15) días calendario, Kraken Courier podrá igualmente considerarlo en abandono operativo.
            </p>
            <p className="terms-section-text">
              En cualquiera de estos casos, Kraken Courier podrá cobrar almacenaje, disponer logísticamente del paquete, devolverlo, desecharlo, rematarlo, compensar gastos pendientes con su valor o adoptar cualquier otra medida permitida por la ley o por sus políticas internas, sin responsabilidad frente al usuario.
            </p>
            <p className="terms-section-text">
              Cuando un usuario incurra en abandono de paquetes o en incumplimiento reiterado de pago, Kraken Courier podrá además suspender parcial o totalmente la cuenta, limitar servicios, retener la entrega de paquetes posteriores o exigir el pago total o parcial de montos pendientes, cargos asociados o una fracción razonable del servicio correspondiente al paquete abandonado antes de autorizar nuevas entregas o liberar envíos futuros.
            </p>
          </div>

          {/* Sección 28 */}
          <div className="terms-section">
            <h2 className="terms-section-title">28. Suspensión o cancelación de la cuenta</h2>
            <p className="terms-section-text">
              Kraken Courier podrá suspender, restringir o cancelar la cuenta del usuario cuando detecte incumplimientos, información falsa, riesgos operativos, fraude, actividad ilícita, uso abusivo de la plataforma, pagos pendientes o cualquier situación que comprometa a Kraken Courier o a terceros.
            </p>
          </div>

          {/* Sección 29 */}
          <div className="terms-section">
            <h2 className="terms-section-title">29. Contacto</h2>
            <p className="terms-section-text">
              Para asuntos legales o relacionados con estos términos, el usuario podrá contactar a Kraken Courier a través de legal@krakencourier.com.
            </p>
          </div>

          {/* Botón de regresar */}
          <button 
            className="terms-back-button" 
            onClick={() => navigate(-1)}
          >
            Aceptar y Volver
          </button>

          {/* Copyright */}
          <p className="terms-copyright">© 2025 Kraken Courier. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;