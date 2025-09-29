// src/components/auth/PasswordValidator/PasswordValidator.jsx
import React from 'react';
import './PasswordValidator.styles.scss';

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una mayúscula (A-Z)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una minúscula (a-z)');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe incluir al menos un número (0-9)');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Debe incluir al menos un carácter especial (!@#$%...)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const PasswordValidator = ({ password = '', visible = true }) => {
  if (!visible) return null;

  const rules = [
    {
      id: 'length',
      label: 'Mínimo 8 caracteres',
      isValid: password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'Al menos una mayúscula (A-Z)',
      isValid: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'Al menos una minúscula (a-z)',
      isValid: /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'Al menos un número (0-9)',
      isValid: /[0-9]/.test(password)
    },
    {
      id: 'special',
      label: 'Al menos un carácter especial (!@#$%...)',
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  ];

  return (
    <div className="password-validator">
      <p className="password-validator__title">Requisitos de la contraseña:</p>
      
      <ul className="password-validator__rules">
        {rules.map(rule => (
          <li 
            key={rule.id} 
            className={`password-validator__rule ${rule.isValid ? 'password-validator__rule--valid' : 'password-validator__rule--invalid'}`}
          >
            <span className="password-validator__icon">
              {rule.isValid ? '✓' : '✗'}
            </span>
            <span className="password-validator__text">
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordValidator;