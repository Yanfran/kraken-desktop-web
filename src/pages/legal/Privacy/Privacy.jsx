// src/pages/legal/Privacy/Privacy.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Privacy.scss';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-container">
      <div className="privacy-wrapper">
        <div className="privacy-header">
          <h1 className="privacy-header-title">Política de Privacidad</h1>
          <p className="privacy-last-updated">
            Fecha de última actualización: <span className="privacy-date">30 de abril de 2025</span>
          </p>
        </div>

        <div className="privacy-content">
          {/* Introducción */}
          <p className="privacy-intro-text">
            Esta Política de Privacidad describe cómo Kraken Courier Internacional recopila, utiliza y comparte su información personal cuando utiliza nuestra aplicación móvil.
          </p>

          {/* Sección 1 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">1. Información que Recopilamos</h2>
            <p className="privacy-section-text">
              Recopilamos varios tipos de información cuando utiliza nuestra aplicación móvil, incluyendo:
            </p>
            <p className="privacy-section-text">
              <strong>Información que usted nos proporciona:</strong>
            </p>
            <p className="privacy-section-text">• Cuenta: Información de registro como nombre, correo electrónico, teléfono y dirección postal.</p>
            <p className="privacy-section-text">• Envíos: Detalles de los paquetes que desea rastrear.</p>
            <p className="privacy-section-text">• Soporte: Información cuando contacta a atención al cliente.</p>
            <p className="privacy-section-text">
              <strong>Información recopilada automáticamente:</strong>
            </p>
            <p className="privacy-section-text">• Uso: Datos sobre su interacción con la app.</p>
            <p className="privacy-section-text">• Dispositivo: Tipo, sistema operativo, identificadores únicos, IP.</p>
            <p className="privacy-section-text">• Ubicación: Con su consentimiento, para servicios basados en localización.</p>
          </div>

          {/* Sección 2 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">2. Cómo Utilizamos Su Información</h2>
            <p className="privacy-section-text">• Proporcionar servicios: Administrar cuenta, rastrear envíos, soporte.</p>
            <p className="privacy-section-text">• Mejorar y personalizar: Analizar uso para mejorar la app.</p>
            <p className="privacy-section-text">• Comunicarnos con usted: Notificaciones, actualizaciones, promociones.</p>
            <p className="privacy-section-text">• Seguridad y protección: Detectar y prevenir fraude o actividades ilegales.</p>
            <div className="privacy-highlight-box">
              <p className="privacy-section-text">
                <strong>Base legal: </strong>
                Consentimiento, obligaciones contractuales, legales, e intereses legítimos.
              </p>
            </div>
          </div>

          {/* Sección 3 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">3. Compartir Su Información</h2>
            <p className="privacy-section-text">• Socios logísticos y transportistas: Para entrega y seguimiento.</p>
            <p className="privacy-section-text">• Proveedores de servicios: Procesadores de pagos, análisis, soporte.</p>
            <p className="privacy-section-text">• Autoridades aduaneras: Para envíos internacionales.</p>
            <p className="privacy-section-text">• Requisitos legales: Cumplir con obligaciones legales.</p>
            <p className="privacy-section-text">
              <strong>Transferencias internacionales: </strong>
              Protegemos su información al transferirla a otros países.
            </p>
          </div>

          {/* Sección 4 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">4. Almacenamiento y Seguridad</h2>
            <p className="privacy-section-text">
              <strong>Período de retención: </strong>
              Guardamos datos mientras tenga cuenta activa y según lo exija la ley.
            </p>
            <p className="privacy-section-text">
              <strong>Seguridad de datos: </strong>
              Aplicamos medidas técnicas y organizativas para proteger su información.
            </p>
            <div className="privacy-highlight-box">
              <p className="privacy-section-text">
                <strong>Nota importante: </strong>
                Ningún método es 100% seguro; no garantizamos seguridad absoluta.
              </p>
            </div>
          </div>

          {/* Sección 5 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">5. Sus Derechos de Privacidad</h2>
            <p className="privacy-section-text">Dependiendo de su ubicación, puede tener derecho a:</p>
            <p className="privacy-section-text">• Acceso, rectificación, eliminación.</p>
            <p className="privacy-section-text">• Restricción, portabilidad, objeción.</p>
            <p className="privacy-section-text">Para ejercer estos derechos, contáctenos usando la información en "Cómo Contactarnos".</p>
          </div>

          {/* Sección 6 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">6. Cookies y Tecnologías Similares</h2>
            <p className="privacy-section-text">
              Utilizamos cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el uso de la app y personalizar contenido.
            </p>
          </div>

          {/* Sección 7 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">7. Cambios a Esta Política</h2>
            <p className="privacy-section-text">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios materiales publicando la nueva política en la app.
            </p>
            <p className="privacy-section-text">Le recomendamos revisar esta política periódicamente.</p>
          </div>

          {/* Sección 8 */}
          <div className="privacy-section">
            <h2 className="privacy-section-title">8. Cómo Contactarnos</h2>
            <p className="privacy-section-text">
              Si tiene preguntas sobre esta Política de Privacidad, contáctenos a: legal@krakencourier.com
            </p>
          </div>

          {/* Botón de regresar */}
          <button 
            className="privacy-back-button" 
            onClick={() => navigate(-1)}
          >
            Aceptar y Volver
          </button>

          {/* Copyright */}
          <p className="privacy-copyright">© 2025 Kraken Courier Internacional. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;