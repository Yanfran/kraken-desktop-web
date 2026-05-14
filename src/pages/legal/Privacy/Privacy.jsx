import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Privacy.scss';

const privacyData = {
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Fecha de última actualización:",
    lastUpdatedDate: "30 de abril de 2025",
    intro: "Esta Política de Privacidad describe cómo Kraken Courier Internacional recopila, utiliza y comparte su información personal cuando utiliza nuestra aplicación móvil.",
    button: "Aceptar y Volver",
    copyright: "© 2025 Kraken Courier Internacional. Todos los derechos reservados.",
    sections: [
      {
        title: "1. Información que Recopilamos",
        items: [
          { type: "text", content: "Recopilamos varios tipos de información cuando utiliza nuestra aplicación móvil, incluyendo:" },
          { type: "html", content: "<strong>Información que usted nos proporciona:</strong>" },
          { type: "text", content: "• Cuenta: Información de registro como nombre, correo electrónico, teléfono y dirección postal." },
          { type: "text", content: "• Envíos: Detalles de los paquetes que desea rastrear." },
          { type: "text", content: "• Soporte: Información cuando contacta a atención al cliente." },
          { type: "html", content: "<strong>Información recopilada automáticamente:</strong>" },
          { type: "text", content: "• Uso: Datos sobre su interacción con la app." },
          { type: "text", content: "• Dispositivo: Tipo, sistema operativo, identificadores únicos, IP." },
          { type: "text", content: "• Ubicación: Con su consentimiento, para servicios basados en localización." },
        ],
      },
      {
        title: "2. Cómo Utilizamos Su Información",
        items: [
          { type: "text", content: "• Proporcionar servicios: Administrar cuenta, rastrear envíos, soporte." },
          { type: "text", content: "• Mejorar y personalizar: Analizar uso para mejorar la app." },
          { type: "text", content: "• Comunicarnos con usted: Notificaciones, actualizaciones, promociones." },
          { type: "text", content: "• Seguridad y protección: Detectar y prevenir fraude o actividades ilegales." },
          { type: "highlight", content: "<strong>Base legal: </strong>Consentimiento, obligaciones contractuales, legales, e intereses legítimos." },
        ],
      },
      {
        title: "3. Compartir Su Información",
        items: [
          { type: "text", content: "• Socios logísticos y transportistas: Para entrega y seguimiento." },
          { type: "text", content: "• Proveedores de servicios: Procesadores de pagos, análisis, soporte." },
          { type: "text", content: "• Autoridades aduaneras: Para envíos internacionales." },
          { type: "text", content: "• Requisitos legales: Cumplir con obligaciones legales." },
          { type: "html", content: "<strong>Transferencias internacionales: </strong>Protegemos su información al transferirla a otros países." },
        ],
      },
      {
        title: "4. Almacenamiento y Seguridad",
        items: [
          { type: "html", content: "<strong>Período de retención: </strong>Guardamos datos mientras tenga cuenta activa y según lo exija la ley." },
          { type: "html", content: "<strong>Seguridad de datos: </strong>Aplicamos medidas técnicas y organizativas para proteger su información." },
          { type: "highlight", content: "<strong>Nota importante: </strong>Ningún método es 100% seguro; no garantizamos seguridad absoluta." },
        ],
      },
      {
        title: "5. Sus Derechos de Privacidad",
        items: [
          { type: "text", content: "Dependiendo de su ubicación, puede tener derecho a:" },
          { type: "text", content: "• Acceso, rectificación, eliminación." },
          { type: "text", content: "• Restricción, portabilidad, objeción." },
          { type: "text", content: "Para ejercer estos derechos, contáctenos usando la información en \"Cómo Contactarnos\"." },
        ],
      },
      {
        title: "6. Cookies y Tecnologías Similares",
        items: [
          { type: "text", content: "Utilizamos cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el uso de la app y personalizar contenido." },
        ],
      },
      {
        title: "7. Cambios a Esta Política",
        items: [
          { type: "text", content: "Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios materiales publicando la nueva política en la app." },
          { type: "text", content: "Le recomendamos revisar esta política periódicamente." },
        ],
      },
      {
        title: "8. Cómo Contactarnos",
        items: [
          { type: "text", content: "Si tiene preguntas sobre esta Política de Privacidad, contáctenos a: legal@krakencourier.com" },
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated:",
    lastUpdatedDate: "April 30, 2025",
    intro: "This Privacy Policy describes how Kraken Courier Internacional collects, uses and shares your personal information when you use our mobile application.",
    button: "Accept and Go Back",
    copyright: "© 2025 Kraken Courier Internacional. All rights reserved.",
    sections: [
      {
        title: "1. Information We Collect",
        items: [
          { type: "text", content: "We collect several types of information when you use our mobile application, including:" },
          { type: "html", content: "<strong>Information you provide to us:</strong>" },
          { type: "text", content: "• Account: Registration information such as name, email, phone and postal address." },
          { type: "text", content: "• Shipments: Details of the packages you want to track." },
          { type: "text", content: "• Support: Information when you contact customer service." },
          { type: "html", content: "<strong>Automatically collected information:</strong>" },
          { type: "text", content: "• Usage: Data about your interaction with the app." },
          { type: "text", content: "• Device: Type, operating system, unique identifiers, IP." },
          { type: "text", content: "• Location: With your consent, for location-based services." },
        ],
      },
      {
        title: "2. How We Use Your Information",
        items: [
          { type: "text", content: "• Providing services: Managing account, tracking shipments, support." },
          { type: "text", content: "• Improving and personalizing: Analyzing usage to improve the app." },
          { type: "text", content: "• Communicating with you: Notifications, updates, promotions." },
          { type: "text", content: "• Security and protection: Detecting and preventing fraud or illegal activities." },
          { type: "highlight", content: "<strong>Legal basis: </strong>Consent, contractual obligations, legal obligations, and legitimate interests." },
        ],
      },
      {
        title: "3. Sharing Your Information",
        items: [
          { type: "text", content: "• Logistics partners and carriers: For delivery and tracking." },
          { type: "text", content: "• Service providers: Payment processors, analytics, support." },
          { type: "text", content: "• Customs authorities: For international shipments." },
          { type: "text", content: "• Legal requirements: Complying with legal obligations." },
          { type: "html", content: "<strong>International transfers: </strong>We protect your information when transferring it to other countries." },
        ],
      },
      {
        title: "4. Storage and Security",
        items: [
          { type: "html", content: "<strong>Retention period: </strong>We keep data while you have an active account and as required by law." },
          { type: "html", content: "<strong>Data security: </strong>We apply technical and organizational measures to protect your information." },
          { type: "highlight", content: "<strong>Important note: </strong>No method is 100% secure; we do not guarantee absolute security." },
        ],
      },
      {
        title: "5. Your Privacy Rights",
        items: [
          { type: "text", content: "Depending on your location, you may have the right to:" },
          { type: "text", content: "• Access, rectification, deletion." },
          { type: "text", content: "• Restriction, portability, objection." },
          { type: "text", content: "To exercise these rights, contact us using the information in \"How to Contact Us\"." },
        ],
      },
      {
        title: "6. Cookies and Similar Technologies",
        items: [
          { type: "text", content: "We use cookies and similar technologies to improve the user experience, analyze app usage and personalize content." },
        ],
      },
      {
        title: "7. Changes to This Policy",
        items: [
          { type: "text", content: "We may update this Privacy Policy occasionally. We will notify you about material changes by posting the new policy in the app." },
          { type: "text", content: "We recommend reviewing this policy periodically." },
        ],
      },
      {
        title: "8. How to Contact Us",
        items: [
          { type: "text", content: "If you have questions about this Privacy Policy, contact us at: legal@krakencourier.com" },
        ],
      },
    ],
  },
};

const Privacy = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'es';
  const data = privacyData[lang];

  return (
    <div className="privacy-container">
      <div className="privacy-wrapper">
        <div className="privacy-header">
          <h1 className="privacy-header-title">{data.title}</h1>
          <p className="privacy-last-updated">
            {data.lastUpdated} <span className="privacy-date">{data.lastUpdatedDate}</span>
          </p>
        </div>

        <div className="privacy-content">
          <p className="privacy-intro-text">{data.intro}</p>

          {data.sections.map((section, idx) => (
            <div className="privacy-section" key={idx}>
              <h2 className="privacy-section-title">{section.title}</h2>
              {section.items.map((item, iIdx) => {
                if (item.type === 'highlight') {
                  return (
                    <div className="privacy-highlight-box" key={iIdx}>
                      <p
                        className="privacy-section-text"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                  );
                }
                if (item.type === 'html') {
                  return (
                    <p
                      key={iIdx}
                      className="privacy-section-text"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  );
                }
                return (
                  <p key={iIdx} className="privacy-section-text">{item.content}</p>
                );
              })}
            </div>
          ))}

          <button className="privacy-back-button" onClick={() => navigate(-1)}>
            {data.button}
          </button>

          <p className="privacy-copyright">{data.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
