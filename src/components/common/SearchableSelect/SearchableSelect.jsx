// src/components/common/SearchableSelect/SearchableSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import './SearchableSelect.styles.scss';

/**
 * Select con funcionalidad de búsqueda
 * @param {Array} options - Array de opciones [{label: string, value: string}]
 * @param {string} value - Valor seleccionado actual
 * @param {function} onChange - Callback cuando cambia la selección
 * @param {string} placeholder - Texto placeholder
 * @param {boolean} disabled - Estado deshabilitado
 * @param {string} className - Clases CSS adicionales
 */
const SearchableSelect = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Buscar...', 
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener el label de la opción seleccionada
  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll al elemento resaltado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  // Handlers
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;

      default:
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <div 
      className={`searchable-select ${isOpen ? 'searchable-select--open' : ''} ${disabled ? 'searchable-select--disabled' : ''} ${className}`}
      ref={containerRef}
    >
      {/* Campo de selección */}
      <div 
        className="searchable-select__field"
        onClick={handleToggle}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="searchable-select__input"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <span className={`searchable-select__value ${!selectedLabel ? 'searchable-select__value--placeholder' : ''}`}>
            {selectedLabel || placeholder}
          </span>
        )}
        
        <svg 
          className={`searchable-select__arrow ${isOpen ? 'searchable-select__arrow--open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none"
        >
          <path 
            d="M5 7.5L10 12.5L15 7.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dropdown de opciones */}
      {isOpen && (
        <div className="searchable-select__dropdown">
          {filteredOptions.length > 0 ? (
            <ul className="searchable-select__list" ref={listRef}>
              {filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`searchable-select__option ${
                    option.value === value ? 'searchable-select__option--selected' : ''
                  } ${
                    index === highlightedIndex ? 'searchable-select__option--highlighted' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                  {option.value === value && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path 
                        d="M13.3333 4L6 11.3333L2.66667 8" 
                        stroke="#FF4500" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="searchable-select__empty">
              No se encontraron resultados para "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;