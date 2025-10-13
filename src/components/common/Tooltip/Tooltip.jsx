// src/components/common/Tooltip/Tooltip.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Tooltip.styles.scss';

const Tooltip = ({ content, children, position = 'auto' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && position === 'auto') {
      calculatePosition();
    }
  }, [isVisible, position]);

  const calculatePosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calcular espacio disponible en cada dirección
    const spaceTop = triggerRect.top;
    const spaceBottom = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    // Determinar la mejor posición
    let bestPosition = 'top';

    // Priorizar arriba si hay espacio
    if (spaceTop >= tooltipRect.height + 10) {
      bestPosition = 'top';
    } 
    // Si no cabe arriba, intentar abajo
    else if (spaceBottom >= tooltipRect.height + 10) {
      bestPosition = 'bottom';
    }
    // Si no cabe arriba ni abajo, intentar a los lados
    else if (spaceLeft >= tooltipRect.width + 10) {
      bestPosition = 'left';
    } else if (spaceRight >= tooltipRect.width + 10) {
      bestPosition = 'right';
    } else {
      // Si no cabe en ningún lado, usar la que tenga más espacio
      const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
      if (maxSpace === spaceTop) bestPosition = 'top';
      else if (maxSpace === spaceBottom) bestPosition = 'bottom';
      else if (maxSpace === spaceLeft) bestPosition = 'left';
      else bestPosition = 'right';
    }

    setTooltipPosition(bestPosition);
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="tooltip-container">
      <div
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children || (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        )}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip-content tooltip-content--${tooltipPosition}`}
        >
          <div className="tooltip-text">{content}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;