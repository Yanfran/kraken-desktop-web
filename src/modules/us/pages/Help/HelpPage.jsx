import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoGlobeOutline,
  IoMailOutline,
  IoLogoWhatsapp,
  IoCubeOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoOpenOutline,
  IoChevronBack,
} from 'react-icons/io5';
import './HelpPage.scss';

const NAVY   = '#1B2B6B';
const ORANGE = '#F05A22';

const sections = [
  {
    icon: IoGlobeOutline,
    title: 'Sitio web',
    description: 'Visita nuestro sitio oficial para más información sobre tarifas, sucursales y servicios.',
    actionLabel: 'krakencourier.com',
    actionUrl: 'https://krakencourier.com',
  },
  {
    icon: IoMailOutline,
    title: 'Correo de soporte',
    description: 'Escríbenos para cualquier consulta o problema con tu envío.',
    actionLabel: 'soporte@krakencourier.com',
    actionUrl: 'mailto:soporte@krakencourier.com',
  },
  {
    icon: IoLogoWhatsapp,
    title: 'WhatsApp',
    description: 'Contáctanos por WhatsApp para una respuesta más rápida.',
    actionLabel: 'Abrir WhatsApp',
    actionUrl: 'https://wa.me/18005556789',
  },
  {
    icon: IoCubeOutline,
    title: '¿Cómo funciona?',
    description:
      '1. Registra tu recogida desde el botón "Nueva Recogida".\n2. Ingresa tu dirección en USA y la de tu destinatario en Venezuela.\n3. Elige la fecha de recogida y confirma el pago.\n4. Rastreamos tu paquete en tiempo real hasta la entrega.',
  },
  {
    icon: IoLocationOutline,
    title: 'Direcciones de casillero',
    description:
      'Guarda tus direcciones de origen (USA) y destino (Venezuela) para usarlas rápidamente en futuros envíos.',
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Seguridad de tu envío',
    description:
      'Todos los envíos están asegurados. En caso de pérdida o daño, contáctanos dentro de las 48 horas siguientes a la entrega.',
  },
];

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="ku-help">
      {/* Header section */}
      <div className="ku-help__header-section">
        <button className="ku-help__back-btn" onClick={() => navigate(-1)}>
          <IoChevronBack size={18} />
          <span>Volver</span>
        </button>
        <h1 className="ku-help__main-title">Centro de Ayuda</h1>
        <p className="ku-help__subtitle">Encuentra respuestas rápidas o contáctanos directamente.</p>
      </div>

      {/* Cards */}
      <div className="ku-help__body">
        {sections.map((item, i) => (
          <div key={i} className="ku-help__card">
            <div className="ku-help__card-icon">
              <item.icon size={22} color={NAVY} />
            </div>
            <div className="ku-help__card-content">
              <h3 className="ku-help__card-title">{item.title}</h3>
              <p className="ku-help__card-desc">{item.description}</p>
              {item.actionUrl && (
                <a
                  href={item.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ku-help__card-link"
                >
                  <span>{item.actionLabel}</span>
                  <IoOpenOutline size={13} color={ORANGE} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
