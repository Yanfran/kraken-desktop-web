import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Terms.scss';

const termsData = {
  es: {
    title: "Términos y Condiciones de Registro y Uso del Servicio de Kraken Courier",
    button: "Aceptar y Volver",
    copyright: "© 2025 Kraken Courier. Todos los derechos reservados.",
    sections: [
      {
        title: "1. Identificación de la empresa",
        paragraphs: [
          "El presente documento establece los términos y condiciones aplicables al registro, acceso y uso del servicio de casillero internacional, plataforma web y servicios logísticos prestados por Kraken Courier and Cargo, C.A., identificada con RIF J504893072, código IPOSTEL IP 1023924111, con domicilio fiscal en Calle Páez, Edif. Turiamo Nro. 13, Piso PB, Local 03, Urb. Mis Encantos, Caracas (Chacao), Miranda, Zona Postal 1060, en lo sucesivo denominada \"Kraken Courier\".",
          "Para asuntos legales o notificaciones relacionadas con estos términos, el usuario podrá escribir a legal@krakencourier.com.",
        ],
      },
      {
        title: "2. Aceptación de los términos",
        paragraphs: [
          "Al registrarse en la app web, solicitar un casillero, utilizar su cuenta, prealertar paquetes, cargar documentos, enviar mercancía a cualquiera de los almacenes de Kraken Courier o contratar cualquier servicio relacionado, el usuario declara haber leído, entendido y aceptado íntegramente estos términos y condiciones.",
          "Si el usuario no está de acuerdo con estos términos, no deberá registrarse ni utilizar los servicios de Kraken Courier.",
        ],
      },
      {
        title: "3. Objeto",
        paragraphs: [
          "Estos términos regulan:",
          "a) el registro y uso de la cuenta del usuario en la app web;",
          "b) la asignación y uso del casillero;",
          "c) la recepción, procesamiento, almacenaje, transporte, nacionalización, entrega y demás gestiones logísticas asociadas a paquetes o mercancías;",
          "d) la facturación y cobro de los servicios; y",
          "e) el tratamiento de los datos suministrados por el usuario.",
        ],
      },
      {
        title: "4. Capacidad para contratar",
        paragraphs: [
          "El servicio puede ser utilizado por:",
          "a) personas naturales mayores de edad con capacidad legal para contratar; y",
          "b) personas jurídicas, por medio de su representante, empleado o persona debidamente autorizada.",
          "Quien registre o utilice una cuenta en nombre de una empresa declara que tiene facultad suficiente para actuar en su nombre y obligarla conforme a estos términos.",
        ],
      },
      {
        title: "5. Modificaciones",
        paragraphs: [
          "Kraken Courier podrá modificar estos términos y condiciones en cualquier momento. La versión vigente será la publicada por Kraken Courier en su app web, sitio web o canales oficiales.",
          "El uso continuado de la cuenta o del servicio después de su publicación implica aceptación de la versión actualizada.",
        ],
      },
      {
        title: "6. Ley aplicable y jurisdicción",
        paragraphs: [
          "Estos términos se regirán por las leyes de la República Bolivariana de Venezuela.",
          "Cualquier controversia derivada de la interpretación, ejecución o validez de estos términos, o del uso del servicio, será sometida a los tribunales competentes de la ciudad de Caracas.",
        ],
      },
      {
        title: "7. Registro, cuenta e información del usuario",
        paragraphs: [
          "El usuario garantiza que toda la información suministrada durante el registro y durante el uso de la cuenta es verdadera, exacta, completa y actualizada.",
          "Esto incluye, entre otros: nombre, apellido o razón social, cédula o RIF, correo electrónico, teléfono, dirección fiscal, dirección de entrega, datos de facturación y cualquier otra información requerida por Kraken Courier.",
          "El usuario será el único responsable por cualquier inconveniente, retraso, cobro, devolución, retención, error de facturación o imposibilidad de entrega causada por datos incorrectos, incompletos, desactualizados o mal suministrados.",
        ],
      },
      {
        title: "8. Seguridad de la cuenta",
        paragraphs: [
          "El usuario es responsable del uso de su cuenta y de la confidencialidad de sus credenciales de acceso.",
          "Toda operación realizada desde la cuenta del usuario se presumirá hecha por el propio usuario, salvo prueba clara en contrario notificada oportunamente a Kraken Courier.",
          "El usuario deberá notificar de inmediato cualquier uso no autorizado, acceso sospechoso o incidente de seguridad.",
        ],
      },
      {
        title: "9. Comunicaciones con el usuario",
        paragraphs: [
          "El usuario autoriza a Kraken Courier a enviar comunicaciones al correo electrónico, teléfono, WhatsApp u otros datos de contacto suministrados, tanto para fines operativos y transaccionales como para fines informativos, promocionales y comerciales.",
          "Las comunicaciones operativas y transaccionales forman parte esencial del servicio y podrán incluir, entre otras, notificaciones de recepción, procesamiento, cobro, incidencia, entrega, requerimiento de documentos, actualización de datos, seguridad o suspensión de cuenta.",
          "El correo electrónico registrado por el usuario será el medio principal de comunicación. El usuario es responsable de mantenerlo activo, accesible, correctamente escrito, con capacidad disponible para recibir mensajes y configurado de manera que permita la recepción de comunicaciones de Kraken Courier. Kraken Courier no será responsable si los mensajes son filtrados, rechazados, bloqueados, redirigidos a carpetas no revisadas, no recibidos por saturación de la capacidad del buzón, errores de configuración, inactividad de la cuenta o cualquier otra causa imputable al usuario.",
          "El mismo criterio aplicará a los números telefónicos o de WhatsApp suministrados por el usuario. La falta de actualización de estos datos no suspende plazos ni libera al usuario de las consecuencias derivadas de notificaciones válidamente emitidas por Kraken Courier.",
        ],
      },
      {
        title: "10. Tratamiento de datos",
        paragraphs: [
          "El usuario autoriza a Kraken Courier a recopilar, almacenar, organizar, consultar, usar y procesar sus datos para fines de registro, validación, prestación del servicio, seguimiento logístico, atención al cliente, facturación, cobranza, prevención de fraude, cumplimiento legal y comunicaciones asociadas al servicio.",
          "Asimismo, el usuario autoriza a Kraken Courier a compartir, transferir o poner dicha información a disposición de empleados, contratistas, aliados comerciales, proveedores tecnológicos, operadores logísticos, transportistas, agentes de aduana, aseguradoras, pasarelas de pago, empresas relacionadas o autoridades competentes, cuando ello sea necesario o conveniente para la ejecución del servicio, la validación de operaciones, la atención de reclamos, la gestión de cobros, el cumplimiento normativo o la protección de los intereses legítimos de Kraken Courier.",
          "Kraken Courier adoptará medidas razonables de resguardo de la información, sin garantizar invulnerabilidad absoluta de sus sistemas o de las redes de transmisión.",
        ],
      },
      {
        title: "11. Alcance del servicio",
        paragraphs: [
          "Kraken Courier podrá ofrecer, según disponibilidad operativa:",
          "a) asignación de casillero;",
          "b) recepción de paquetes en sus almacenes o direcciones habilitadas;",
          "c) prealerta;",
          "d) procesamiento de paquetes;",
          "e) almacenaje temporal;",
          "f) transporte nacional e internacional;",
          "g) gestión logística y documental;",
          "h) entrega en tienda, agencia, punto autorizado o domicilio;",
          "i) seguimiento del envío; y",
          "j) otros servicios complementarios.",
          "En el servicio principal de compras online, Kraken Courier normalmente transporta la mercancía en las mismas condiciones en que la recibe. En determinados servicios especiales o complementarios, Kraken Courier podrá realizar reempaque u otras manipulaciones operativas, cuando así lo considere procedente o cuando el servicio contratado lo contemple.",
          "Kraken Courier no actúa como vendedor, fabricante, distribuidor, representante de la tienda, intermediario de garantía ni verificador comercial del contenido comprado por el usuario. En consecuencia, no será responsable si la tienda, proveedor o tercero envía un artículo distinto al comprado, con talla, color, modelo, versión, compatibilidad, características o especificaciones diferentes a las seleccionadas por el usuario, ni por mercancía incompleta, defectuosa de origen o distinta a la ofertada.",
          "Kraken Courier no gestiona devoluciones, cambios ni reclamaciones comerciales ante tiendas, vendedores o proveedores, salvo que expresamente acepte prestar un servicio adicional para ello.",
          "Si el usuario desea que un paquete sea entregado o devuelto a una tienda, proveedor, empresa de transporte o tercero mientras aún se encuentre en un almacén de Kraken Courier, deberá solicitarlo por escrito a través del correo electrónico oficial y autorizar expresamente la entrega a la persona o empresa que lo retirará. Kraken Courier podrá aceptar o rechazar dicha solicitud a su sola discreción. Si no existe instrucción expresa y oportuna, el paquete podrá continuar su curso logístico normal hacia destino, y el usuario seguirá obligado al pago íntegro del servicio y de los cargos aplicables.",
          "Kraken Courier podrá operar a través de almacenes, tiendas, agencias, puntos de retiro, direcciones logísticas y demás instalaciones propias o de terceros habilitadas para la recepción, procesamiento, resguardo, transporte o entrega de mercancías.",
          "Kraken Courier podrá abrir, cerrar, sustituir, reubicar o modificar en cualquier momento la ubicación, dirección o condiciones operativas de sus almacenes, tiendas o puntos de retiro, cuando así lo requieran sus necesidades logísticas, operativas, comerciales o de seguridad. Por regla general, Kraken Courier procurará informar estos cambios a sus usuarios por sus canales oficiales, sin que ello implique obligación de notificación individual efectiva en todos los casos.",
        ],
      },
      {
        title: "12. Declaraciones y responsabilidades del usuario",
        paragraphs: [
          "El usuario declara y acepta que:",
          "a) la mercancía es legal y de permitida circulación;",
          "b) no enviará artículos prohibidos, restringidos o peligrosos en contravención de la ley o de las políticas de Kraken Courier;",
          "c) la descripción, cantidad, valor y naturaleza del contenido son veraces;",
          "d) la mercancía ha sido adecuadamente embalada por el remitente, vendedor o proveedor, salvo que Kraken Courier haya prestado expresamente un servicio adicional;",
          "e) asume la responsabilidad por cualquier daño, retraso, gasto, multa, sanción o perjuicio derivado de declaraciones falsas, inexactas o incompletas;",
          "f) si envía compras a los almacenes de Kraken Courier, conoce y acepta el funcionamiento del servicio, sus tarifas, condiciones, limitaciones y cargos asociados;",
          "g) es su responsabilidad informarse previamente sobre el servicio antes de enviar mercancía a cualquier dirección o almacén de Kraken Courier;",
          "h) tiene a su disposición herramientas informativas, incluyendo una calculadora pública de tarifas estimadas, cuya finalidad es orientativa y no sustituye la tarifa final aplicable al paquete efectivamente recibido, procesado y medido;",
          "i) es su responsabilidad enviar sus paquetes a la dirección correcta y vigente indicada por Kraken Courier para el servicio correspondiente; y",
          "j) es su responsabilidad identificar correctamente cada paquete conforme a las instrucciones suministradas por Kraken Courier, incluyendo de forma clara y suficiente el nombre y apellido del titular o razón social, el número de casillero y cualquier otro dato que Kraken Courier exija para su correcta identificación y asociación.",
          "El usuario reconoce que, si envía mercancía a los almacenes de Kraken Courier y luego decide no pagar el servicio, ello no lo exime de sus obligaciones de pago ni transfiere a Kraken Courier las consecuencias de su falta de previsión, cálculo o consulta previa.",
          "Si un paquete es enviado a una dirección incorrecta, desactualizada o no habilitada, o si llega sin identificación suficiente o con datos erróneos, incompletos, ambiguos o inconsistentes, Kraken Courier no será responsable por retrasos, extravíos, bloqueos operativos, falta de procesamiento, falta de asociación a la cuenta del usuario, ni por la imposibilidad de enviarlo a destino.",
          "Los paquetes que no puedan ser identificados o asociados de forma segura a un usuario podrán quedar retenidos, bloqueados o sin procesamiento hasta tanto el usuario aporte información suficiente y Kraken Courier logre validar razonablemente su titularidad o destino, sin que ello obligue a Kraken Courier a despacharlos, transportarlos o entregarlos mientras subsista la inconsistencia.",
        ],
      },
      {
        title: "13. Facultad de inspección",
        paragraphs: [
          "El usuario autoriza expresamente a Kraken Courier a revisar, abrir, inspeccionar, escanear o verificar el contenido de cualquier envío cuando lo considere razonablemente necesario por motivos de seguridad, cumplimiento normativo, validación operativa, prevención de fraude, gestión aduanera o requerimiento de autoridad competente.",
        ],
      },
      {
        title: "14. Inicio de responsabilidad de Kraken Courier",
        paragraphs: [
          "Kraken Courier solo será responsable por un paquete a partir del momento en que dicho paquete conste como efectivamente recibido y procesado en su sistema.",
          "La sola afirmación de una tienda, proveedor, courier de última milla o tercero de que el paquete fue \"entregado\" no será suficiente para imputar responsabilidad a Kraken Courier.",
          "Si el usuario alega que un paquete fue entregado en almacén pero no aparece recibido en el sistema de Kraken Courier, deberá presentar pruebas suficientes, incluyendo, cuando existan: constancia de entrega, POD, fotografía, nombre y firma de quien recibió, fecha, hora exacta y cualquier otro soporte útil. Kraken Courier se reserva el derecho de valorar libremente dichos soportes.",
        ],
      },
      {
        title: "15. Prealerta, valor declarado y documentos de soporte",
        paragraphs: [
          "El usuario deberá prealertar sus paquetes y suministrar, cuando corresponda, la documentación de respaldo del contenido y valor FOB, incluyendo factura, orden de compra, captura de pantalla de compra, comprobante de pago o cualquier otro documento razonablemente idóneo que permita identificar la mercancía y su valor.",
          "Kraken Courier podrá tomar como válidos los documentos cargados previamente por el usuario en su casillero o enviados por sus canales oficiales, siempre que resulten suficientes a criterio de Kraken Courier.",
          "Si el usuario no suministra valor FOB o documentación de respaldo suficiente, Kraken Courier podrá procesar el paquete con la información que logre identificar razonablemente al momento del procesamiento. Esa información quedará registrada en la guía y en el casillero del usuario.",
          "Una vez procesado el paquete y notificado el usuario, este tendrá un plazo de cuarenta y ocho (48) horas hábiles para solicitar la corrección de la información registrada y consignar los soportes correspondientes a través de los medios oficiales de Kraken Courier.",
          "Vencido ese lapso sin objeción formal del usuario, se entenderá que el usuario aprueba y acepta la información registrada en la guía, incluyendo la descripción, valor y demás datos asociados al paquete.",
          "Las solicitudes de corrección deberán hacerse por los canales oficiales de Kraken Courier, incluyendo hola@krakencourier.com y WhatsApp +58 414 254 30 42, o por cualquier otro canal oficial que Kraken Courier habilite en el futuro.",
        ],
      },
      {
        title: "16. Tarifas, cargos y tributos",
        paragraphs: [
          "El usuario acepta pagar todas las tarifas, cargos y conceptos aplicables al servicio, incluyendo flete, seguro, almacenaje, entrega, gestiones documentales, cargos operativos, impuestos, tasas, contribuciones, aranceles y demás montos que correspondan.",
          "Los aranceles, tributos, tasas o cargos exigidos por autoridades o terceros no se entienden incluidos en el flete, salvo que Kraken Courier lo indique expresamente.",
          "Si después de procesado o facturado un envío surgieren diferencias de peso, dimensiones, volumen, valor, impuestos, aranceles, almacenaje o cualquier otro cargo aplicable, el usuario deberá pagarlos para que el paquete pueda continuar su curso o ser entregado.",
        ],
      },
      {
        title: "17. Revisión de peso y medidas",
        paragraphs: [
          "Cuando la tarifa dependa del peso, volumen, peso volumétrico, medidas o características del paquete, los datos determinados por Kraken Courier durante el procesamiento serán los aplicables para el cálculo del servicio.",
          "El usuario tendrá derecho a solicitar la revisión del peso o de las medidas de su paquete cuando considere que los datos registrados inicialmente son errados. Si, realizada la verificación, se determina que existió un error, Kraken Courier corregirá los datos correspondientes y ajustará la tarifa en consecuencia.",
          "Si de la corrección resulta un monto adicional a pagar, el usuario deberá cancelarlo para que el paquete continúe su curso o pueda ser entregado. Si de la corrección resulta un saldo a favor del usuario y este ya hubiese pagado, Kraken Courier podrá, a su elección, aplicar dicho saldo como crédito a favor del usuario para un envío posterior o efectuar el reembolso por el medio que estime procedente, dentro de un plazo razonable y sujeto a sus controles administrativos y de validación.",
        ],
      },
      {
        title: "18. Pagos en origen y pagos en Venezuela",
        paragraphs: [
          "Algunos servicios podrán ser cobrados por anticipado en origen, incluyendo operaciones en Estados Unidos o Europa, y pagados en la moneda local correspondiente a través de la entidad operativa, aliada, corresponsal o estructura comercial que preste o administre el servicio en dicho país.",
          "En esos casos, los recibos o facturas podrán emitirse en origen conforme a la normativa aplicable en esa jurisdicción.",
          "Los servicios cobrados en bolívares en Venezuela serán facturados localmente de conformidad con la normativa aplicable.",
        ],
      },
      {
        title: "19. Facturación con base en los datos del usuario",
        paragraphs: [
          "Las facturas y demás documentos fiscales o comerciales se emitirán con base en la información suministrada por el usuario en su registro o en su cuenta.",
          "El usuario es responsable de verificar y mantener actualizados sus datos fiscales y de facturación antes de solicitar el servicio o antes de la emisión del documento correspondiente.",
          "Una vez emitida una factura con base en los datos suministrados por el usuario, Kraken Courier no estará obligada a anularla, sustituirla, corregirla o reemitirla por errores imputables al usuario, incluyendo errores en nombre, apellido, razón social, cédula, RIF, correo, dirección fiscal u otros datos equivalentes.",
        ],
      },
      {
        title: "20. Seguro obligatorio de la mercancía",
        paragraphs: [
          "Toda mercancía transportada por Kraken Courier viaja con seguro o cobertura obligatoria conforme a las condiciones internas del servicio.",
          "La cobertura se calculará, en principio, sobre el valor declarado por el usuario, siempre que dicho valor esté respaldado por factura, orden de compra, comprobante de pago, captura de pantalla u otro documento razonablemente válido y suficiente a criterio de Kraken Courier.",
          "Si el usuario no declara un valor o no consigna soportes suficientes, Kraken Courier podrá asignar un valor referencial al momento del procesamiento del paquete. Ese valor será el que se utilizará para fines operativos, de facturación y de eventual cobertura, salvo que el usuario lo objete y corrija oportunamente dentro del plazo establecido en estos términos.",
        ],
      },
      {
        title: "21. Alcance de la cobertura y limitación de responsabilidad",
        paragraphs: [
          "Kraken Courier no garantiza indemnización automática por toda incidencia reportada. Cada caso será evaluado según sus circunstancias, los soportes aportados, el estado del paquete, la oportunidad del reclamo y la determinación de responsabilidad.",
          "En caso de pérdida total atribuible a Kraken Courier, la eventual indemnización no excederá el valor registrado y aprobado del paquete en la guía o en el sistema.",
          "En caso de daño parcial, deterioro, avería o afectación del contenido, Kraken Courier solo responderá si, luego de la evaluación correspondiente, se determina razonablemente que el daño le es imputable.",
          "Kraken Courier no responderá por:",
          "a) embalaje insuficiente de origen;",
          "b) defectos propios del producto;",
          "c) desgaste normal, abolladuras leves, rayas, afectaciones menores del empaque o caja exterior que no comprometan de forma sustancial el contenido;",
          "d) daños no reportados al momento de la entrega o retiro;",
          "e) mercancía frágil o sensible mal protegida por el remitente, proveedor o fabricante;",
          "f) retenciones, decomisos o actuaciones de autoridad;",
          "g) errores de vendedores, tiendas, couriers previos o terceros ajenos a Kraken Courier.",
        ],
      },
      {
        title: "22. Efectos del pago de una indemnización",
        paragraphs: [
          "Si Kraken Courier paga total o parcialmente una indemnización por pérdida, faltante o daño de una mercancía, podrá exigir la entrega de la mercancía, del remanente, de sus partes, accesorios, empaque o restos recuperables, así como ejercer los derechos de recuperación, salvamento, cesión o subrogación que correspondan.",
        ],
      },
      {
        title: "23. Entrega, destino y cambios solicitados por el usuario",
        paragraphs: [
          "El lugar, modalidad o punto de entrega del paquete será el que el usuario tenga registrado en su cuenta como opción predeterminada, o el que conste en la guía o en el sistema al momento del procesamiento.",
          "Por razones logísticas, operativas, de seguridad, cobertura, disponibilidad, enrutamiento o capacidad de servicio, Kraken Courier podrá modificar el lugar o modalidad de entrega sin previo aviso, cuando ello resulte necesario para la correcta prestación del servicio.",
          "Una vez que el paquete haya sido procesado y etiquetado, el usuario no podrá exigir cambios de destino, modalidad de entrega, tienda, agencia, punto de retiro o dirección. Kraken Courier podrá estudiar dichas solicitudes de forma excepcional, pero no estará obligada a aceptarlas.",
          "Cuando Kraken Courier acepte un cambio solicitado por el usuario, podrá aplicar cargos adicionales, nuevos tiempos de tránsito, recálculo de tarifa o condiciones especiales.",
          "Si la modalidad es entrega a domicilio, el usuario no podrá exigir que la entrega se haga en puntos intermedios, vías públicas, referencias informales, zonas distintas a la dirección registrada o lugares que comprometan la seguridad del personal, del vehículo o de la mercancía.",
        ],
      },
      {
        title: "24. Revisión al momento de la entrega o retiro",
        paragraphs: [
          "Al momento de recibir o retirar un paquete, el usuario o la persona autorizada deberá revisar su estado general antes de firmar, aceptar o retirarse con él.",
          "Si el empaque presenta señales evidentes de apertura, ruptura, humedad, manipulación irregular, cinta violentada, golpe severo o cualquier condición sospechosa, el usuario deberá reportarlo de inmediato y dejar constancia por el canal indicado por Kraken Courier.",
          "Si el usuario o su autorizado recibe el paquete, firma conforme o se retira con él sin reportar incidencia inmediata, se presumirá que el paquete fue recibido en condiciones aparentes conformes, y Kraken Courier podrá rechazar reclamos posteriores sobre daños visibles, faltantes aparentes o alteraciones externas detectables al momento de la entrega.",
        ],
      },
      {
        title: "25. Demoras y tiempos de tránsito",
        paragraphs: [
          "Los tiempos de tránsito, fechas estimadas y estatus informados por Kraken Courier son referenciales.",
          "Kraken Courier no será responsable por retrasos causados por aduana, autoridades, inspecciones, clima, congestión logística, fallas de sistemas, proveedores, transportistas, terceros, fuerza mayor, caso fortuito o cualquier otra circunstancia fuera de su control razonable.",
        ],
      },
      {
        title: "26. Reclamos",
        paragraphs: [
          "Todo reclamo deberá presentarse de forma formal y por escrito a través de hola@krakencourier.com o por cualquier canal oficial que Kraken Courier habilite, indicando al menos:",
          "a) número de guía Kraken;",
          "b) nombre y apellido del titular de la cuenta o razón social;",
          "c) correo registrado en el casillero;",
          "d) descripción clara del reclamo; y",
          "e) soportes disponibles.",
          "Los faltantes, daños visibles, empaque violentado o irregularidades aparentes deberán ser reportados de inmediato al momento de la entrega o retiro.",
          "Las incidencias por pérdida, entrega errónea o situaciones no visibles de forma inmediata deberán ser reportadas dentro de los cinco (5) días hábiles siguientes a la entrega, retiro o notificación del hecho.",
          "Las incidencias relacionadas con valor, descripción o datos del paquete procesado deberán ser reportadas dentro del plazo especial de cuarenta y ocho (48) horas hábiles previsto en estos términos.",
          "Transcurridos dichos plazos, Kraken Courier podrá considerar el reclamo como extemporáneo y rechazarlo sin necesidad de mayor trámite.",
        ],
      },
      {
        title: "27. Almacenaje, abandono y consecuencias por incumplimiento de pago",
        paragraphs: [
          "Los paquetes que permanezcan sin retiro, sin instrucciones válidas o sin gestión por parte del usuario por un período superior a cuarenta y cinco (45) días calendario podrán ser considerados en abandono operativo.",
          "Si el paquete permanece detenido por falta de pago por un período superior a quince (15) días calendario, Kraken Courier podrá igualmente considerarlo en abandono operativo.",
          "En cualquiera de estos casos, Kraken Courier podrá cobrar almacenaje, disponer logísticamente del paquete, devolverlo, desecharlo, rematarlo, compensar gastos pendientes con su valor o adoptar cualquier otra medida permitida por la ley o por sus políticas internas, sin responsabilidad frente al usuario.",
          "Cuando un usuario incurra en abandono de paquetes o en incumplimiento reiterado de pago, Kraken Courier podrá además suspender parcial o totalmente la cuenta, limitar servicios, retener la entrega de paquetes posteriores o exigir el pago total o parcial de montos pendientes, cargos asociados o una fracción razonable del servicio correspondiente al paquete abandonado antes de autorizar nuevas entregas o liberar envíos futuros.",
        ],
      },
      {
        title: "28. Suspensión o cancelación de la cuenta",
        paragraphs: [
          "Kraken Courier podrá suspender, restringir o cancelar la cuenta del usuario cuando detecte incumplimientos, información falsa, riesgos operativos, fraude, actividad ilícita, uso abusivo de la plataforma, pagos pendientes o cualquier situación que comprometa a Kraken Courier o a terceros.",
        ],
      },
      {
        title: "29. Contacto",
        paragraphs: [
          "Para asuntos legales o relacionados con estos términos, el usuario podrá contactar a Kraken Courier a través de legal@krakencourier.com.",
        ],
      },
    ],
  },
  en: {
    title: "Terms and Conditions for Registration and Use of Kraken Courier Services",
    button: "Accept and Go Back",
    copyright: "© 2025 Kraken Courier. All rights reserved.",
    sections: [
      {
        title: "1. Company Identification",
        paragraphs: [
          "This document establishes the terms and conditions applicable to the registration, access and use of the international mailbox service, web platform and logistics services provided by Kraken Courier and Cargo, C.A., identified with RIF J504893072, IPOSTEL code IP 1023924111, with registered address at Calle Páez, Edif. Turiamo No. 13, Ground Floor, Unit 03, Urb. Mis Encantos, Caracas (Chacao), Miranda, Postal Zone 1060, hereinafter referred to as \"Kraken Courier\".",
          "For legal matters or notifications related to these terms, the user may write to legal@krakencourier.com.",
        ],
      },
      {
        title: "2. Acceptance of Terms",
        paragraphs: [
          "By registering on the web app, requesting a mailbox, using their account, pre-alerting packages, uploading documents, sending merchandise to any of Kraken Courier's warehouses or contracting any related service, the user declares to have read, understood and fully accepted these terms and conditions.",
          "If the user does not agree with these terms, they should not register or use Kraken Courier's services.",
        ],
      },
      {
        title: "3. Purpose",
        paragraphs: [
          "These terms govern:",
          "a) the registration and use of the user's account on the web app;",
          "b) the assignment and use of the mailbox;",
          "c) the reception, processing, storage, transportation, customs clearance, delivery and other associated logistics management of packages or merchandise;",
          "d) billing and collection of services; and",
          "e) the processing of data provided by the user.",
        ],
      },
      {
        title: "4. Capacity to Contract",
        paragraphs: [
          "The service may be used by:",
          "a) natural persons of legal age with the legal capacity to contract; and",
          "b) legal entities, through their representative, employee or duly authorized person.",
          "Whoever registers or uses an account on behalf of a company declares that they have sufficient authority to act on its behalf and bind it under these terms.",
        ],
      },
      {
        title: "5. Modifications",
        paragraphs: [
          "Kraken Courier may modify these terms and conditions at any time. The current version will be the one published by Kraken Courier on its web app, website or official channels.",
          "Continued use of the account or service after publication implies acceptance of the updated version.",
        ],
      },
      {
        title: "6. Applicable Law and Jurisdiction",
        paragraphs: [
          "These terms shall be governed by the laws of the Bolivarian Republic of Venezuela.",
          "Any dispute arising from the interpretation, execution or validity of these terms, or from the use of the service, shall be submitted to the competent courts of the city of Caracas.",
        ],
      },
      {
        title: "7. Registration, Account and User Information",
        paragraphs: [
          "The user guarantees that all information provided during registration and during the use of the account is true, accurate, complete and up to date.",
          "This includes, among others: first name, last name or company name, ID or RIF, email address, phone, tax address, delivery address, billing information and any other information required by Kraken Courier.",
          "The user will be solely responsible for any inconvenience, delay, charge, return, retention, billing error or impossibility of delivery caused by incorrect, incomplete, outdated or improperly provided data.",
        ],
      },
      {
        title: "8. Account Security",
        paragraphs: [
          "The user is responsible for the use of their account and the confidentiality of their access credentials.",
          "All operations performed from the user's account will be presumed to have been made by the user themselves, unless there is clear evidence to the contrary notified to Kraken Courier in a timely manner.",
          "The user must immediately notify any unauthorized use, suspicious access or security incident.",
        ],
      },
      {
        title: "9. Communications with the User",
        paragraphs: [
          "The user authorizes Kraken Courier to send communications to the email address, phone, WhatsApp or other contact details provided, both for operational and transactional purposes as well as for informational, promotional and commercial purposes.",
          "Operational and transactional communications are an essential part of the service and may include, among others, notifications of receipt, processing, billing, incidents, delivery, document requirements, data updates, security or account suspension.",
          "The email address registered by the user will be the primary means of communication. The user is responsible for keeping it active, accessible, correctly written, with available capacity to receive messages and configured in a way that allows the receipt of communications from Kraken Courier. Kraken Courier will not be responsible if messages are filtered, rejected, blocked, redirected to unreviewed folders, not received due to mailbox capacity saturation, configuration errors, account inactivity or any other cause attributable to the user.",
          "The same criteria will apply to phone or WhatsApp numbers provided by the user. Failure to update this information does not suspend deadlines or release the user from the consequences derived from notifications validly issued by Kraken Courier.",
        ],
      },
      {
        title: "10. Data Processing",
        paragraphs: [
          "The user authorizes Kraken Courier to collect, store, organize, consult, use and process their data for the purposes of registration, validation, service provision, logistics tracking, customer service, billing, collection, fraud prevention, legal compliance and service-related communications.",
          "Likewise, the user authorizes Kraken Courier to share, transfer or make such information available to employees, contractors, commercial partners, technology providers, logistics operators, carriers, customs agents, insurance companies, payment gateways, related companies or competent authorities, when necessary or appropriate for the execution of the service, validation of operations, handling of claims, debt collection management, regulatory compliance or protection of Kraken Courier's legitimate interests.",
          "Kraken Courier will adopt reasonable safeguards for the information, without guaranteeing absolute invulnerability of its systems or transmission networks.",
        ],
      },
      {
        title: "11. Scope of Service",
        paragraphs: [
          "Kraken Courier may offer, subject to operational availability:",
          "a) mailbox assignment;",
          "b) package reception at its warehouses or authorized addresses;",
          "c) pre-alert;",
          "d) package processing;",
          "e) temporary storage;",
          "f) domestic and international transportation;",
          "g) logistics and documentary management;",
          "h) delivery to store, agency, authorized point or home address;",
          "i) shipment tracking; and",
          "j) other complementary services.",
          "In the main online shopping service, Kraken Courier normally transports merchandise in the same condition in which it receives it. In certain special or complementary services, Kraken Courier may perform repackaging or other operational handling, when it deems it appropriate or when the contracted service contemplates it.",
          "Kraken Courier does not act as seller, manufacturer, distributor, store representative, warranty intermediary or commercial verifier of the content purchased by the user. Consequently, it will not be responsible if the store, supplier or third party sends an item different from the one purchased, with a different size, color, model, version, compatibility, characteristics or specifications from those selected by the user, nor for incomplete, originally defective or different merchandise from what was offered.",
          "Kraken Courier does not manage returns, exchanges or commercial claims with stores, sellers or suppliers, unless it expressly agrees to provide an additional service for this purpose.",
          "If the user wishes a package to be delivered or returned to a store, supplier, transport company or third party while it is still in a Kraken Courier warehouse, they must request it in writing through the official email and expressly authorize delivery to the person or company that will collect it. Kraken Courier may accept or reject such request at its sole discretion. If there is no express and timely instruction, the package may continue its normal logistics course to destination, and the user will remain obligated to fully pay for the service and applicable charges.",
          "Kraken Courier may operate through warehouses, stores, agencies, pickup points, logistics addresses and other own or third-party facilities authorized for the reception, processing, safekeeping, transportation or delivery of merchandise.",
          "Kraken Courier may open, close, replace, relocate or modify at any time the location, address or operational conditions of its warehouses, stores or pickup points, when its logistics, operational, commercial or security needs require it. As a general rule, Kraken Courier will endeavor to inform these changes to its users through its official channels, without implying an obligation of effective individual notification in all cases.",
        ],
      },
      {
        title: "12. User Declarations and Responsibilities",
        paragraphs: [
          "The user declares and accepts that:",
          "a) the merchandise is legal and permitted to circulate;",
          "b) they will not send prohibited, restricted or dangerous items in contravention of the law or Kraken Courier policies;",
          "c) the description, quantity, value and nature of the contents are truthful;",
          "d) the merchandise has been adequately packaged by the sender, seller or supplier, unless Kraken Courier has expressly provided an additional service;",
          "e) they assume responsibility for any damage, delay, expense, fine, penalty or harm derived from false, inaccurate or incomplete statements;",
          "f) if they send purchases to Kraken Courier's warehouses, they know and accept the functioning of the service, its rates, conditions, limitations and associated charges;",
          "g) it is their responsibility to find out about the service beforehand before sending merchandise to any Kraken Courier address or warehouse;",
          "h) they have informational tools available, including a public calculator of estimated rates, whose purpose is guidance and does not replace the final rate applicable to the package effectively received, processed and measured;",
          "i) it is their responsibility to send their packages to the correct and current address indicated by Kraken Courier for the corresponding service; and",
          "j) it is their responsibility to correctly identify each package in accordance with the instructions provided by Kraken Courier, including clearly and sufficiently the name and surname of the holder or company name, the mailbox number and any other data required by Kraken Courier for its correct identification and association.",
          "The user acknowledges that, if they send merchandise to Kraken Courier's warehouses and then decide not to pay for the service, this does not exempt them from their payment obligations nor transfer to Kraken Courier the consequences of their lack of foresight, calculation or prior consultation.",
          "If a package is sent to an incorrect, outdated or unauthorized address, or if it arrives without sufficient identification or with erroneous, incomplete, ambiguous or inconsistent data, Kraken Courier will not be responsible for delays, losses, operational blockages, lack of processing, failure to associate with the user's account, or the impossibility of sending it to its destination.",
          "Packages that cannot be identified or securely associated with a user may be held, blocked or left unprocessed until the user provides sufficient information and Kraken Courier can reasonably validate their ownership or destination, without obligating Kraken Courier to dispatch, transport or deliver them while the inconsistency remains.",
        ],
      },
      {
        title: "13. Inspection Authority",
        paragraphs: [
          "The user expressly authorizes Kraken Courier to review, open, inspect, scan or verify the content of any shipment when it deems it reasonably necessary for security reasons, regulatory compliance, operational validation, fraud prevention, customs management or requirement of a competent authority.",
        ],
      },
      {
        title: "14. Start of Kraken Courier Liability",
        paragraphs: [
          "Kraken Courier will only be responsible for a package from the moment it appears as effectively received and processed in its system.",
          "The mere statement from a store, supplier, last-mile courier or third party that the package was \"delivered\" will not be sufficient to attribute responsibility to Kraken Courier.",
          "If the user claims that a package was delivered to the warehouse but does not appear as received in Kraken Courier's system, they must present sufficient evidence, including, where available: proof of delivery, POD, photograph, name and signature of the recipient, exact date and time, and any other useful supporting document. Kraken Courier reserves the right to freely assess such evidence.",
        ],
      },
      {
        title: "15. Pre-alert, Declared Value and Supporting Documents",
        paragraphs: [
          "The user must pre-alert their packages and provide, when applicable, supporting documentation for the content and FOB value, including invoice, purchase order, screenshot of purchase, proof of payment or any other reasonably suitable document that allows identification of the merchandise and its value.",
          "Kraken Courier may accept previously uploaded documents by the user in their mailbox or sent through official channels, as long as they are sufficient at Kraken Courier's discretion.",
          "If the user does not provide FOB value or sufficient supporting documentation, Kraken Courier may process the package with the information it can reasonably identify at the time of processing. This information will be recorded in the guide and in the user's mailbox.",
          "Once the package is processed and the user notified, they will have a period of forty-eight (48) business hours to request correction of the recorded information and submit the corresponding supporting documents through Kraken Courier's official channels.",
          "After that period expires without formal objection from the user, it will be understood that the user approves and accepts the information recorded in the guide, including the description, value and other data associated with the package.",
          "Correction requests must be made through Kraken Courier's official channels, including hola@krakencourier.com and WhatsApp +58 414 254 30 42, or through any other official channel that Kraken Courier may establish in the future.",
        ],
      },
      {
        title: "16. Rates, Charges and Taxes",
        paragraphs: [
          "The user agrees to pay all applicable rates, charges and concepts for the service, including freight, insurance, storage, delivery, documentary management, operational charges, taxes, fees, contributions, customs duties and other applicable amounts.",
          "Customs duties, taxes, fees or charges required by authorities or third parties are not included in the freight, unless Kraken Courier expressly indicates otherwise.",
          "If, after a shipment has been processed or invoiced, differences arise in weight, dimensions, volume, value, taxes, customs duties, storage or any other applicable charge, the user must pay them so that the package can continue its course or be delivered.",
        ],
      },
      {
        title: "17. Weight and Measurement Review",
        paragraphs: [
          "When the rate depends on the weight, volume, volumetric weight, measurements or characteristics of the package, the data determined by Kraken Courier during processing will be applicable for calculating the service.",
          "The user will have the right to request a review of the weight or measurements of their package when they believe that the initially recorded data is incorrect. If, after verification, it is determined that there was an error, Kraken Courier will correct the corresponding data and adjust the rate accordingly.",
          "If the correction results in an additional amount to be paid, the user must pay it so that the package can continue its course or be delivered. If the correction results in a credit balance for the user and they have already paid, Kraken Courier may, at its discretion, apply said balance as a credit for the user for a future shipment or make the refund by the means it deems appropriate, within a reasonable period and subject to its administrative and validation controls.",
        ],
      },
      {
        title: "18. Payments at Origin and Payments in Venezuela",
        paragraphs: [
          "Some services may be charged in advance at origin, including operations in the United States or Europe, and paid in the corresponding local currency through the operative entity, partner, correspondent or commercial structure that provides or administers the service in that country.",
          "In those cases, receipts or invoices may be issued at origin in accordance with applicable regulations in that jurisdiction.",
          "Services charged in bolivars in Venezuela will be invoiced locally in accordance with applicable regulations.",
        ],
      },
      {
        title: "19. Invoicing Based on User Data",
        paragraphs: [
          "Invoices and other tax or commercial documents will be issued based on the information provided by the user in their registration or account.",
          "The user is responsible for verifying and keeping their tax and billing information up to date before requesting the service or before the corresponding document is issued.",
          "Once an invoice has been issued based on the data provided by the user, Kraken Courier will not be obligated to void, substitute, correct or reissue it for errors attributable to the user, including errors in name, surname, company name, ID number, RIF, email, tax address or other equivalent data.",
        ],
      },
      {
        title: "20. Mandatory Merchandise Insurance",
        paragraphs: [
          "All merchandise transported by Kraken Courier travels with mandatory insurance or coverage in accordance with the internal conditions of the service.",
          "Coverage will be calculated, in principle, on the value declared by the user, provided that said value is supported by invoice, purchase order, proof of payment, screenshot or other reasonably valid and sufficient document at Kraken Courier's discretion.",
          "If the user does not declare a value or does not submit sufficient supporting documents, Kraken Courier may assign a reference value at the time of package processing. That value will be used for operational, billing and eventual coverage purposes, unless the user objects and corrects it in a timely manner within the period established in these terms.",
        ],
      },
      {
        title: "21. Scope of Coverage and Limitation of Liability",
        paragraphs: [
          "Kraken Courier does not guarantee automatic compensation for every reported incident. Each case will be evaluated according to its circumstances, the supporting evidence provided, the condition of the package, the timeliness of the claim and the determination of liability.",
          "In the event of total loss attributable to Kraken Courier, any eventual compensation will not exceed the registered and approved value of the package in the guide or system.",
          "In the event of partial damage, deterioration, damage or impairment of the contents, Kraken Courier will only be liable if, after the corresponding evaluation, it is reasonably determined that the damage is attributable to it.",
          "Kraken Courier will not be liable for:",
          "a) insufficient original packaging;",
          "b) product defects;",
          "c) normal wear and tear, minor dents, scratches, minor impairments to the outer packaging or box that do not substantially compromise the contents;",
          "d) damages not reported at the time of delivery or pickup;",
          "e) fragile or sensitive merchandise poorly protected by the sender, supplier or manufacturer;",
          "f) seizures, confiscations or authority actions;",
          "g) errors by sellers, stores, prior couriers or third parties unrelated to Kraken Courier.",
        ],
      },
      {
        title: "22. Effects of Paying Compensation",
        paragraphs: [
          "If Kraken Courier pays total or partial compensation for loss, shortage or damage to merchandise, it may demand delivery of the merchandise, the remainder, its parts, accessories, packaging or recoverable remains, as well as exercise the recovery, salvage, assignment or subrogation rights that correspond.",
        ],
      },
      {
        title: "23. Delivery, Destination and Changes Requested by the User",
        paragraphs: [
          "The place, modality or delivery point of the package will be the one the user has registered in their account as the default option, or the one recorded in the guide or system at the time of processing.",
          "For logistical, operational, security, coverage, availability, routing or service capacity reasons, Kraken Courier may modify the place or modality of delivery without prior notice, when necessary for the proper provision of the service.",
          "Once the package has been processed and labeled, the user cannot demand changes of destination, delivery modality, store, agency, pickup point or address. Kraken Courier may study such requests on an exceptional basis, but will not be obligated to accept them.",
          "When Kraken Courier accepts a change requested by the user, it may apply additional charges, new transit times, rate recalculation or special conditions.",
          "If the modality is home delivery, the user cannot demand that delivery be made at intermediate points, public roads, informal references, areas different from the registered address or places that compromise the security of the personnel, vehicle or merchandise.",
        ],
      },
      {
        title: "24. Inspection at the Time of Delivery or Pickup",
        paragraphs: [
          "At the time of receiving or picking up a package, the user or authorized person must check its general condition before signing, accepting or leaving with it.",
          "If the packaging shows obvious signs of opening, breakage, moisture, irregular handling, tampered tape, severe impact or any suspicious condition, the user must report it immediately and record it through the channel indicated by Kraken Courier.",
          "If the user or their authorized person receives the package, signs conforming or leaves with it without reporting an immediate incident, it will be presumed that the package was received in apparent conforming conditions, and Kraken Courier may reject subsequent claims about visible damage, apparent shortages or external alterations detectable at the time of delivery.",
        ],
      },
      {
        title: "25. Delays and Transit Times",
        paragraphs: [
          "Transit times, estimated dates and statuses reported by Kraken Courier are for reference only.",
          "Kraken Courier will not be responsible for delays caused by customs, authorities, inspections, weather, logistics congestion, system failures, suppliers, carriers, third parties, force majeure, fortuitous event or any other circumstance beyond its reasonable control.",
        ],
      },
      {
        title: "26. Claims",
        paragraphs: [
          "All claims must be submitted formally and in writing through hola@krakencourier.com or through any official channel that Kraken Courier may establish, indicating at least:",
          "a) Kraken guide number;",
          "b) account holder's name and surname or company name;",
          "c) email registered in the mailbox;",
          "d) clear description of the claim; and",
          "e) available supporting documents.",
          "Shortages, visible damage, tampered packaging or apparent irregularities must be reported immediately at the time of delivery or pickup.",
          "Incidents of loss, erroneous delivery or situations not immediately visible must be reported within five (5) business days following delivery, pickup or notification of the event.",
          "Incidents related to the value, description or data of the processed package must be reported within the special period of forty-eight (48) business hours provided in these terms.",
          "After such periods expire, Kraken Courier may consider the claim untimely and reject it without need for further processing.",
        ],
      },
      {
        title: "27. Storage, Abandonment and Consequences of Non-Payment",
        paragraphs: [
          "Packages that remain without pickup, without valid instructions or without management by the user for a period exceeding forty-five (45) calendar days may be considered in operational abandonment.",
          "If the package remains on hold due to non-payment for a period exceeding fifteen (15) calendar days, Kraken Courier may equally consider it in operational abandonment.",
          "In either case, Kraken Courier may charge storage, logistically dispose of the package, return it, discard it, auction it, offset pending expenses with its value or adopt any other measure permitted by law or its internal policies, without liability to the user.",
          "When a user incurs in package abandonment or repeated non-payment, Kraken Courier may also partially or fully suspend the account, limit services, withhold delivery of subsequent packages or require full or partial payment of outstanding amounts, associated charges or a reasonable fraction of the service corresponding to the abandoned package before authorizing new deliveries or releasing future shipments.",
        ],
      },
      {
        title: "28. Suspension or Cancellation of Account",
        paragraphs: [
          "Kraken Courier may suspend, restrict or cancel the user's account when it detects non-compliance, false information, operational risks, fraud, illegal activity, abusive use of the platform, outstanding payments or any situation that compromises Kraken Courier or third parties.",
        ],
      },
      {
        title: "29. Contact",
        paragraphs: [
          "For legal matters or matters related to these terms, the user may contact Kraken Courier through legal@krakencourier.com.",
        ],
      },
    ],
  },
};

const Terms = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'es';
  const data = termsData[lang];

  return (
    <div className="terms-container">
      <div className="terms-wrapper">
        <div className="terms-header">
          <h1 className="terms-header-title">{data.title}</h1>
        </div>

        <div className="terms-content">
          {data.sections.map((section, idx) => (
            <div className="terms-section" key={idx}>
              <h2 className="terms-section-title">{section.title}</h2>
              {section.paragraphs.map((p, pIdx) => (
                <p className="terms-section-text" key={pIdx}>{p}</p>
              ))}
            </div>
          ))}

          <button className="terms-back-button" onClick={() => navigate(-1)}>
            {data.button}
          </button>

          <p className="terms-copyright">{data.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
