// src/components/AvatarSelector/AvatarSelector.jsx
import React, { useState, useEffect } from 'react';
import './AvatarSelector.styles.scss';

// Configuración de avatares disponibles (igual que en la app)
const AVAILABLE_AVATARS = [
  {
    id: '1',
    source: '/src/assets/images/avatars/Kraken-Original.png',
    name: 'Original'
  },
  {
    id: '2',
    source: '/src/assets/images/avatars/Kraken-Chino.png',
    name: 'Chino'
  },
  {
    id: '3',
    source: '/src/assets/images/avatars/Kraken-Sam.png',
    name: 'Sam'
  },
  {
    id: '4',
    source: '/src/assets/images/avatars/Kraken-Academico.png',
    name: 'Académico'
  },
  {
    id: '5',
    source: '/src/assets/images/avatars/Kraken-Agente.png',
    name: 'Agente'
  }
];

const AvatarSelector = ({ visible, currentAvatarId = '1', onSelect, onCancel }) => {
  const [selectedId, setSelectedId] = useState(currentAvatarId);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      setSelectedId(currentAvatarId);
    } else {
      setIsAnimating(false);
    }
  }, [visible, currentAvatarId]);

  const handleSelect = () => {
    onSelect(selectedId);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('avatar-selector__overlay')) {
      onCancel();
    }
  };

  if (!visible) return null;

  return (
    <div 
      className="avatar-selector__overlay" 
      onClick={handleOverlayClick}
    >
      <div className={`avatar-selector__content ${isAnimating ? 'avatar-selector__content--visible' : ''}`}>
        <div className="avatar-selector__header">
          <h2 className="avatar-selector__title">Selecciona tu Avatar</h2>
          <p className="avatar-selector__subtitle">Elige el que más te represente</p>
        </div>

        <div className="avatar-selector__grid">
          {AVAILABLE_AVATARS.map((avatar) => {
            const isSelected = selectedId === avatar.id;
            
            return (
              <div
                key={avatar.id}
                className={`avatar-selector__option ${isSelected ? 'avatar-selector__option--selected' : ''}`}
                onClick={() => setSelectedId(avatar.id)}
              >
                <div className={`avatar-selector__avatar-container ${isSelected ? 'avatar-selector__avatar-container--selected' : ''}`}>
                  <img 
                    src={avatar.source} 
                    alt={avatar.name}
                    className="avatar-selector__avatar-image"
                  />
                  {isSelected && (
                    <div className="avatar-selector__selected-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="var(--color-primary)" />
                        <path 
                          d="M9 12l2 2l4-4" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className={`avatar-selector__avatar-name ${isSelected ? 'avatar-selector__avatar-name--selected' : ''}`}>
                  {avatar.name}
                </p>
              </div>
            );
          })}
        </div>

        <div className="avatar-selector__buttons">
          <button 
            className="avatar-selector__cancel-btn" 
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button 
            className="avatar-selector__save-btn" 
            onClick={handleSelect}
            type="button"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;