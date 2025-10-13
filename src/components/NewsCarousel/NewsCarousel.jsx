// src/components/NewsCarousel/NewsCarousel.jsx
import React, { useState, useRef } from 'react';
import * as IoIcons from 'react-icons/io5'; // Importar TODOS los iconos de Ionicons
import './NewsCarousel.styles.scss';

/**
 * Convierte nombres de iconos de Ionicons (formato React Native)
 * al formato de react-icons/io5
 * Ejemplos:
 * - 'information-circle' → 'IoInformationCircle'
 * - 'newspaper-outline' → 'IoNewspaperOutline'
 * - 'checkmark-circle-outline' → 'IoCheckmarkCircleOutline'
 */
const getIconComponent = (iconName) => {
  if (!iconName) return IoIcons.IoInformationCircle;

  // Convertir de kebab-case a PascalCase
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Agregar prefijo 'Io'
  const iconKey = `Io${pascalCase}`;
  
  // Retornar el componente o un fallback
  return IoIcons[iconKey] || IoIcons.IoInformationCircle;
};

const NewsCarousel = ({ newsItems = null, cardWidth = 320, cardMargin = 10 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  if (!newsItems || !Array.isArray(newsItems) || newsItems.length === 0) {
    return (
      <div className="news-carousel-empty">
        <IoIcons.IoNewspaperOutline size={24} color="#666" />
        <p className="news-carousel-empty__text">
          {!newsItems ? 'Cargando novedades...' : 'No hay novedades disponibles'}
        </p>
      </div>
    );
  }

  const totalWidth = cardWidth + cardMargin * 2;

  const handleScroll = (event) => {
    const scrollPosition = event.target.scrollLeft;
    const index = Math.round(scrollPosition / totalWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        left: index * totalWidth,
        behavior: 'smooth'
      });
    }
  };

  const renderNewsCard = (item, index) => {
    // Obtener el componente de icono dinámicamente
    const IconComponent = getIconComponent(item.iconName);

    return (
      <div
        key={item.id}
        className="news-card-carousel"
        style={{
          width: `${cardWidth}px`,
          marginLeft: `${cardMargin}px`,
          marginRight: `${cardMargin}px`,
          backgroundColor: item.backgroundColor || '#f0f8ff',
        }}
      >
        <div className="news-card-carousel__content">
          <div className="news-card-carousel__text">
            <h3 
              className="news-card-carousel__title"
              style={{ color: item.textColor || '#333' }}
            >
              {item.title}
            </h3>
            <p 
              className="news-card-carousel__description"
              style={{ color: item.textColor || '#666' }}
            >
              {item.text}
            </p>
          </div>
          
          <div className="news-card-carousel__icon-container">
            <div 
              className="news-card-carousel__icon"
              style={{ backgroundColor: `${(item.textColor || '#007AFF')}22` }}
            >
              <IconComponent 
                size={22} 
                color={item.textColor || '#007AFF'} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaginationDots = () => {
    if (newsItems.length <= 1) return null;
    
    return (
      <div className="news-carousel-dots">
        {newsItems.map((_, index) => (
          <button
            key={index}
            className={`news-carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Ir a novedad ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="news-carousel">
      <div
        ref={scrollViewRef}
        className="news-carousel__scroll-container"
        onScroll={handleScroll}
        style={{ 
          paddingLeft: `${cardMargin}px`,
          paddingRight: `${cardMargin}px`
        }}
      >
        {newsItems.map((item, index) => renderNewsCard(item, index))}
      </div>
      
      {renderPaginationDots()}
    </div>
  );
};

export default NewsCarousel;