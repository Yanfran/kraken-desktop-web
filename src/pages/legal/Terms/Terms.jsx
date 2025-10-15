// src/pages/legal/Terms/Terms.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.scss';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      <div className="terms-wrapper">
        <div className="terms-header">
          <h1 className="terms-header-title">Términos y Condiciones</h1>
        </div>

        <div className="terms-content">
          {/* Sección 1 */}
          <div className="terms-section">
            <h2 className="terms-section-title">1. Aceptación de los Términos</h2>
            <p className="terms-section-text">
              Al descargar, instalar o utilizar la aplicación móvil de Kraken Courier ("la Aplicación"), usted acepta quedar vinculado por estos Términos y Condiciones.
            </p>
            <p className="terms-section-text">
              Esta Aplicación es operada por Kraken Courier Internacional. A lo largo de estos términos, los términos "nosotros", "nos" y "nuestro" se refieren a Kraken Courier Internacional.
            </p>
          </div>

          {/* Sección 2 */}
          <div className="terms-section">
            <h2 className="terms-section-title">2. Cuenta y Registro</h2>
            <p className="terms-section-text">
              Para utilizar ciertas funciones de la Aplicación, es necesario registrarse y crear una cuenta. Al registrarse, usted acepta proporcionar información precisa, actualizada y completa.
            </p>
            <p className="terms-section-text">
              Usted es responsable de mantener la confidencialidad de su contraseña y cuenta, y acepta toda la responsabilidad por cualquier actividad que ocurra bajo su cuenta.
            </p>
            <p className="terms-section-text">
              Nos reservamos el derecho de suspender o terminar su cuenta si alguna información proporcionada resulta ser inexacta, falsa o engañosa.
            </p>
          </div>

          {/* Sección 3 */}
          <div className="terms-section">
            <h2 className="terms-section-title">3. Servicios de Seguimiento</h2>
            <p className="terms-section-text">
              La Aplicación proporciona servicios de seguimiento de envíos internacionales. La información se proporciona según la disponibilidad de los datos de nuestros socios logísticos.
            </p>
            <p className="terms-section-text">
              No garantizamos la precisión, puntualidad o disponibilidad continua de la información de seguimiento.
            </p>
            <p className="terms-section-text">
              Los tiempos de entrega estimados son aproximados y pueden verse afectados por factores fuera de nuestro control, como condiciones climáticas, inspecciones aduaneras o eventos de fuerza mayor.
            </p>
          </div>

          {/* Sección 4 */}
          <div className="terms-section">
            <h2 className="terms-section-title">4. Política de Privacidad</h2>
            <p className="terms-section-text">
              El uso de la Aplicación está sujeto a nuestra Política de Privacidad, que describe cómo recopilamos, utilizamos, compartimos y protegemos su información personal.
            </p>
            <p className="terms-section-text">
              Al utilizar la Aplicación, usted consiente la recopilación y uso de su información como se describe en dicha política.
            </p>
          </div>

          {/* Sección 5 */}
          <div className="terms-section">
            <h2 className="terms-section-title">5. Limitación de Responsabilidad</h2>
            <p className="terms-section-text">
              En la máxima medida permitida por la ley, Kraken Courier Internacional no será responsable por daños directos, indirectos, incidentales, especiales, consecuentes o punitivos derivados de:
            </p>
            <p className="terms-section-text">• El uso o la imposibilidad de usar la Aplicación.</p>
            <p className="terms-section-text">• Cualquier cambio realizado en la Aplicación.</p>
            <p className="terms-section-text">• Acceso no autorizado o alteración de datos.</p>
            <p className="terms-section-text">• Declaraciones o conducta de terceros.</p>
            <p className="terms-section-text">• Retrasos o fallas en los envíos rastreados.</p>
          </div>

          {/* Sección 6 */}
          <div className="terms-section">
            <h2 className="terms-section-title">6. Propiedad Intelectual</h2>
            <p className="terms-section-text">
              La Aplicación y su contenido original son propiedad de Kraken Courier Internacional y están protegidos por leyes internacionales de derechos de autor, marcas registradas y otras leyes.
            </p>
            <p className="terms-section-text">
              No se le concede ningún derecho para usar nuestras marcas registradas sin consentimiento previo por escrito.
            </p>
          </div>

          {/* Sección 7 */}
          <div className="terms-section">
            <h2 className="terms-section-title">7. Modificaciones</h2>
            <p className="terms-section-text">
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Si el cambio es material, le proporcionaremos al menos 30 días de aviso antes de que entre en vigor.
            </p>
            <p className="terms-section-text">
              Al continuar usando la Aplicación después de los cambios, usted acepta estar sujeto a los términos revisados.
            </p>
          </div>

          {/* Sección 8 */}
          <div className="terms-section">
            <h2 className="terms-section-title">8. Terminación</h2>
            <p className="terms-section-text">
              Podemos terminar su cuenta y acceso a la Aplicación inmediatamente si incumple estos Términos. Tras la terminación, su derecho a usar la Aplicación cesará inmediatamente.
            </p>
            <p className="terms-section-text">
              Si desea cerrar su cuenta, simplemente deje de usar la Aplicación y/o desinstálela.
            </p>
          </div>

          {/* Sección 9 */}
          <div className="terms-section">
            <h2 className="terms-section-title">9. Legislación Aplicable</h2>
            <p className="terms-section-text">
              Estos Términos se regirán por las leyes del país donde Kraken Courier Internacional tiene su sede principal, sin tener en cuenta disposiciones sobre conflictos de leyes.
            </p>
            <p className="terms-section-text">
              Cualquier disputa será resuelta en los tribunales ubicados en dicho país.
            </p>
          </div>

          {/* Sección 10 */}
          <div className="terms-section">
            <h2 className="terms-section-title">10. Contacto</h2>
            <p className="terms-section-text">Si tiene preguntas, contáctenos:</p>
            <p className="terms-section-text">• Correo electrónico: legal@krakencourier.com</p>
            <p className="terms-section-text">• Teléfono: +1-800-KRAKEN</p>
            <p className="terms-section-text">• Correo postal: Kraken Courier Internacional, Sede Corporativa, 123 Shipping Lane, Global City, 10001</p>
          </div>

          {/* Botón de regresar */}
          <button 
            className="terms-back-button" 
            onClick={() => navigate(-1)}
          >
            Aceptar y Volver
          </button>

          {/* Copyright */}
          <p className="terms-copyright">© 2025 Kraken Courier Internacional. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;