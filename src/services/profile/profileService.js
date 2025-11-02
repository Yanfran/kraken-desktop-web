// src/services/profile/profileService.js
import { API_URL } from '../../utils/config';

/**
 * Actualizar perfil de usuario
 * @param {Object} profileData - Datos del perfil
 * @returns {Promise} Response de la API
 */
export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await fetch(`${API_URL}/Users/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: profileData.email,
        name: profileData.name,
        lastName: profileData.lastName,
        phone: profileData.phone,
        phoneSecondary: profileData.phoneSecondary || null,
        idType: profileData.idType,
        idNumber: profileData.idNumber,
        birthday: profileData.birthday, // Debe ser un objeto Date o string ISO
        avatarId: profileData.avatarId || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar el perfil');
    }

    return data;
  } catch (error) {
    console.error('Error en updateProfile:', error);
    throw error;
  }
};

/**
 * Obtener datos del perfil del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise} Datos del perfil
 */
export const getProfile = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await fetch(`${API_URL}/Users/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener el perfil');
    }

    return data;
  } catch (error) {
    console.error('Error en getProfile:', error);
    throw error;
  }
};

/**
 * Actualizar avatar del usuario
 * @param {string} avatarId - ID del nuevo avatar
 * @param {string} email - Email del usuario
 * @returns {Promise} Response de la API
 */
export const updateAvatar = async (avatarId, email) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await fetch(`${API_URL}/Users/update-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatarId, email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar el avatar');
    }

    return data;
  } catch (error) {
    console.error('Error en updateAvatar:', error);
    throw error;
  }
};

/**
 * Validar documento según tipo
 * @param {string} type - Tipo de documento (cedula, pasaporte, rif, otro)
 * @param {string} number - Número del documento
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateDocument = (type, number) => {
  const num = number.trim();
  
  if (!num) {
    return { isValid: false, message: 'El número de documento es obligatorio' };
  }
  
  switch (type) {
    case 'cedula':
      if (!/^\d{6,8}$/.test(num)) {
        return { 
          isValid: false, 
          message: 'La cédula debe tener entre 6-8 dígitos numéricos' 
        };
      }
      break;
      
    case 'pasaporte':
      if (num.length < 5 || num.length > 15) {
        return { 
          isValid: false, 
          message: 'El pasaporte debe tener entre 5-15 caracteres' 
        };
      }
      if (!/^[A-Z0-9]+$/i.test(num)) {
        return { 
          isValid: false, 
          message: 'El pasaporte solo puede contener letras y números' 
        };
      }
      break;
      
    case 'rif':
      // Formato: V-12345678-9 o V123456789
      const rifClean = num.replace(/[-\s]/g, '');
      if (!/^[VEJPG]\d{8,9}$/i.test(rifClean)) {
        return { 
          isValid: false, 
          message: 'El RIF debe tener formato válido (ej: V-12345678-9)' 
        };
      }
      break;
      
    case 'otro':
      if (num.length < 5 || num.length > 20) {
        return { 
          isValid: false, 
          message: 'El documento debe tener entre 5-20 caracteres' 
        };
      }
      break;
      
    default:
      return { 
        isValid: false, 
        message: 'Tipo de documento no válido' 
      };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validar edad mínima (18 años)
 * @param {Date|string} birthday - Fecha de nacimiento
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateAge = (birthday) => {
  if (!birthday) {
    return { isValid: false, message: 'La fecha de nacimiento es obligatoria' };
  }

  const birthDate = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Ajustar edad si aún no ha cumplido años este año
  const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ? age - 1
    : age;

  if (adjustedAge < 18) {
    return { 
      isValid: false, 
      message: 'Debes ser mayor de 18 años para registrarte' 
    };
  }

  if (adjustedAge > 120) {
    return { 
      isValid: false, 
      message: 'La fecha de nacimiento no es válida' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validar teléfono
 * @param {string} phone - Número de teléfono
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: 'El teléfono es obligatorio' };
  }

  // Permitir formatos: +58 412 1234567, 04121234567, +1234567890
  const phoneClean = phone.replace(/[\s-]/g, '');
  
  if (!/^\+?\d{10,15}$/.test(phoneClean)) {
    return { 
      isValid: false, 
      message: 'Formato de teléfono inválido (10-15 dígitos)' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validar nombre o apellido
 * @param {string} name - Nombre o apellido
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateName = (name, fieldName = 'nombre') => {
  if (!name || !name.trim()) {
    return { 
      isValid: false, 
      message: `El ${fieldName} es obligatorio` 
    };
  }

  if (name.trim().length < 2) {
    return { 
      isValid: false, 
      message: `El ${fieldName} debe tener al menos 2 caracteres` 
    };
  }

  if (name.trim().length > 50) {
    return { 
      isValid: false, 
      message: `El ${fieldName} no puede exceder 50 caracteres` 
    };
  }

  // Solo letras, espacios, guiones y apóstrofes
  if (!/^[a-záéíóúñü\s'-]+$/i.test(name)) {
    return { 
      isValid: false, 
      message: `El ${fieldName} solo puede contener letras` 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Detectar tipo de documento desde idClienteTipoIdentificacion
 * @param {number} idTipo - ID del tipo de documento de la BD
 * @returns {string} Tipo de documento ('cedula', 'pasaporte', 'rif', 'otro')
 */
export const detectDocumentTypeFromId = (idTipo) => {
  const docMap = {
    1: 'cedula',
    2: 'pasaporte',
    3: 'rif',
    4: 'otro'
  };
  
  return docMap[idTipo] || 'cedula';
};

/**
 * Convertir tipo de documento a ID para la BD
 * @param {string} type - Tipo de documento ('cedula', 'pasaporte', 'rif', 'otro')
 * @returns {number} ID del tipo de documento
 */
export const documentTypeToId = (type) => {
  const typeMap = {
    'cedula': 1,
    'pasaporte': 2,
    'rif': 3,
    'otro': 4
  };
  
  return typeMap[type] || 1;
};


export async function resetPasswordProfile(email, newPassword) {
  const response = await fetchWithLang(`${API_URL}/Users/reset-password-profile`, {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await response.json();
  
  return data;
}

export default {
  updateProfile,
  getProfile,
  updateAvatar,
  validateDocument,
  validateAge,
  validatePhone,
  validateName,
  detectDocumentTypeFromId,
  documentTypeToId,
  resetPasswordProfile
};