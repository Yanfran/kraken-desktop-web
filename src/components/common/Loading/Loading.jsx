// src/components/common/Loading/Loading.jsx
import React from 'react';
import './Loading.styles.scss';

/**
 * Componente Loading circular minimalista con color naranja Kraken
 * @param {string} message - Mensaje a mostrar (default: 'Cargando...')
 * @param {boolean} inline - Si es true, se muestra sin overlay (para usar dentro de componentes)
 * @param {boolean} minimal - Versión aún más compacta sin posicionamiento fijo
 * @param {boolean} double - Spinner con doble anillo giratorio
 */
const Loading = ({ 
  message = 'Cargando...',
  inline = false,
  minimal = false,
  double = false
}) => {
  const className = `loading ${inline ? 'loading--inline' : ''} ${minimal ? 'loading--minimal' : ''} ${double ? 'loading--double' : ''}`;
  
  return (
    <div className={className}>
      <div className="loading__container">
        <div className="loading__spinner"></div>
        {message && <p className="loading__message">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;













// // 1. Loading fullscreen (default) - 50px
// <Loading message="Cargando datos..." />

// // 2. Loading inline - 40px, sin overlay
// <Loading message="Procesando..." inline />

// // 3. Loading minimal - 35px, ultra compacto
// <Loading message="Espera..." minimal />

// // 4. Loading doble anillo - Más elaborado (opcional)
// <Loading message="Cargando..." double />



// import Loading from '@components/common/Loading/Loading';

// const Dashboard = () => {
//   const [isLoading, setIsLoading] = useState(true);
  
//   if (isLoading) {
//     return <Loading message="Cargando dashboard..." />;
//   }
  
//   return <div>Tu contenido...</div>;
// };