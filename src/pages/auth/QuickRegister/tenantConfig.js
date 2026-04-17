export const TENANT_CONFIG = {
  // KV: {
  //   pais: 'VE',
  //   bandera: '🇻🇪',
  //   titulo: 'Registro Rápido 🇻🇪',
  //   subtitulo: 'Crea tu cuenta en Kraken Venezuela',
  //   endpoint: '/auth/register',
  //   telefonoPrefijo: '+58',
  //   telefonoDigitos: 11,
  //   telefonoPlaceholder: '04141234567',
  //   telefonoHint: '11 dígitos sin prefijo (ej: 0414...)',
  //   tiposDocumento: [
  //     { value: 'V', label: 'Venezolano (V)' },
  //     { value: 'E', label: 'Extranjero (E)' },
  //     { value: 'J', label: 'Jurídico (J)' },
  //     { value: 'P', label: 'Pasaporte (P)' },
  //   ],
  //   documentos: {
  //     V: { maxLength: 8,  placeholder: '12345678',      hint: 'Solo números, sin puntos ni guiones' },
  //     E: { maxLength: 8,  placeholder: '12345678',      hint: 'Solo números' },
  //     J: { maxLength: 9,  placeholder: '123456789',     hint: 'RIF sin guiones' },
  //     P: { maxLength: 15, placeholder: 'Nro. pasaporte', hint: '6-15 caracteres alfanuméricos' },
  //   },
  //   tipoDocumentoDefault: 'V',
  //   validateDoc: (tipo, valor) => {
  //     if (tipo === 'V' || tipo === 'E') return /^\d{6,8}$/.test(valor);
  //     if (tipo === 'J') return /^\d{8,9}$/.test(valor);
  //     return valor.length >= 6 && valor.length <= 15;
  //   },
  //   docErrorMsg: (tipo, documentos) =>
  //     `Documento inválido — ${documentos[tipo]?.hint ?? ''}`,
  // },

  KE: {
    pais: 'ES',
    bandera: '🇪🇸',
    titulo: 'Registro Rápido 🇪🇸',
    subtitulo: 'Crea tu cuenta en Kraken España',
    endpoint: '/auth/register',
    telefonoPrefijo: '+34',
    telefonoDigitos: 9,
    telefonoPlaceholder: '612 345 678',
    telefonoHint: '9 dígitos sin prefijo',
    tiposDocumento: [
      { value: 'dni',       label: 'DNI' },
      { value: 'nie',       label: 'NIE' },
      { value: 'pasaporte', label: 'Pasaporte' },
    ],
    documentos: {
      dni:       { maxLength: 9,  placeholder: '12345678A',      hint: '8 dígitos + letra' },
      nie:       { maxLength: 9,  placeholder: 'X1234567A',      hint: 'X/Y/Z + 7 dígitos + letra' },
      pasaporte: { maxLength: 15, placeholder: 'Nro. pasaporte', hint: '6-15 caracteres alfanuméricos' },
    },
    tipoDocumentoDefault: 'dni',
    validateDoc: (tipo, valor) => {
      if (tipo === 'dni') return /^[0-9]{8}[A-Z]$/i.test(valor);
      if (tipo === 'nie') return /^[XYZ][0-9]{7}[A-Z]$/i.test(valor);
      return valor.length >= 6 && valor.length <= 15;
    },
    docErrorMsg: (tipo, documentos) =>
      `Documento inválido — ${documentos[tipo]?.hint ?? ''}`,
  },

  KU: {
    pais: 'US',
    bandera: '🇺🇸',
    titulo: 'Quick Register 🇺🇸',
    subtitulo: 'Create your Kraken USA account',
    endpoint: '/auth/register',
    telefonoPrefijo: '+1',
    telefonoDigitos: 10,
    telefonoPlaceholder: '305 123 4567',
    telefonoHint: '10 digits without prefix',
    tiposDocumento: [
      { value: 'ssn',      label: 'SSN' },
      { value: 'passport', label: 'Passport' },
      { value: 'dl',       label: "Driver's License" },
    ],
    documentos: {
      ssn:      { maxLength: 11, placeholder: '123-45-6789',        hint: 'Social Security Number' },
      passport: { maxLength: 15, placeholder: 'Passport No.',       hint: '6-15 alphanumeric characters' },
      dl:       { maxLength: 20, placeholder: "Driver's License No.", hint: 'State ID / Driver License' },
    },
    tipoDocumentoDefault: 'ssn',
    validateDoc: (tipo, valor) => {
      if (tipo === 'ssn') return /^\d{3}-?\d{2}-?\d{4}$/.test(valor);
      return valor.length >= 6 && valor.length <= 20;
    },
    docErrorMsg: (tipo, documentos) =>
      `Invalid document — ${documentos[tipo]?.hint ?? ''}`,
  },
};