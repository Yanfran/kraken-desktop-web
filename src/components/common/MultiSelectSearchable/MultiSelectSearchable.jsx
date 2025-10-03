import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './MultiSelectSearchable.styles.scss';

const MultiSelectSearchable = ({
  options,
  value, // Array of selected values
  onChange, // Callback with array of selected values
  placeholder,
  searchPlaceholder,
  disabled,
  className,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option.value) // Don't show already selected options in the dropdown
  );

  const handleToggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
      setSearchTerm(''); // Clear search term when opening/closing
    }
  }, [disabled]);

  const handleSelectOption = useCallback((optionValue) => {
    const newValue = [...value, optionValue];
    onChange(newValue);
    setSearchTerm(''); // Clear search term after selection
    setIsOpen(false); // Close dropdown after selection
  }, [value, onChange]);

  const handleRemoveOption = useCallback((optionValue) => {
    const newValue = value.filter(val => val !== optionValue);
    onChange(newValue);
  }, [value, onChange]);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOptionLabels = value.map(selectedValue => {
    const option = options.find(opt => opt.value === selectedValue);
    return option ? option.label : selectedValue;
  });

  return (
    <div
      className={`multi-select-searchable ${className} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}
      ref={dropdownRef}
    >
      <div
        className="multi-select-searchable__control"
        onClick={handleToggleDropdown}
      >
        <div className="multi-select-searchable__value-container">
          {value.length === 0 ? (
            <div className="multi-select-searchable__placeholder">
              {placeholder}
            </div>
          ) : (
            <div className="multi-select-searchable__selected-summary">
              {value.length} seleccionado{value.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="multi-select-searchable__indicators">
          <span className={`multi-select-searchable__dropdown-indicator ${isOpen ? 'open' : ''}`}></span>
        </div>
      </div>

      {isOpen && (
        <div className="multi-select-searchable__menu">
          <div className="multi-select-searchable__search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="multi-select-searchable__search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking search input
            />
          </div>
          <div className="multi-select-searchable__options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className="multi-select-searchable__option"
                  onClick={() => handleSelectOption(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="multi-select-searchable__no-options">
                No hay opciones
              </div>
            )}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="multi-select-searchable__selected-chips">
          {selectedOptionLabels.map(label => {
            const selectedValue = options.find(opt => opt.label === label)?.value;
            return (
              <div key={selectedValue} className="multi-select-searchable__chip">
                <span>{label}</span>
                <button
                  type="button"
                  className="multi-select-searchable__chip-remove"
                  onClick={() => handleRemoveOption(selectedValue)}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

MultiSelectSearchable.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.bool,
};

MultiSelectSearchable.defaultProps = {
  placeholder: 'Seleccione...',
  searchPlaceholder: 'Buscar...',
  disabled: false,
  className: '',
  error: false,
};

export default MultiSelectSearchable;
