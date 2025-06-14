
// Lista de dominios de email temporales/desechables más comunes
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com',
  'tempmail.plus',
  'maildrop.cc',
  'sharklasers.com',
  'guerrillamail.org',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.de',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  'dvd.netflix.com',
  'e4ward.com',
  'gowikibooks.com',
  'gowikicampus.com',
  'gowikifilms.com',
  'gowikigames.com',
  'gowikimusic.com',
  'gowikinetwork.com',
  'gowikitravel.com',
  'gowikitv.com',
  'mailmetrash.com',
  'thankyou2010.com',
  'trash-mail.com',
  'trashinbox.com',
  'trashymail.com',
  'yuurok.com'
];

// Palabras genéricas o sospechosas en nombres de empresa
const GENERIC_COMPANY_WORDS = [
  'test',
  'testing',
  'prueba',
  'empresa',
  'company',
  'business',
  'sample',
  'example',
  'demo',
  'fake',
  'falso',
  'random',
  'asdf',
  'qwerty',
  '123',
  'aaa',
  'bbb',
  'ccc',
  'xxx',
  'yyy',
  'zzz',
  'lalala',
  'hahaha',
  'jajaja',
  'blabla',
  'ninguna',
  'no se',
  'no sé',
  'cualquiera',
  'inventada',
  'inventado'
];

// Patrones de nombres genéricos
const GENERIC_NAME_PATTERNS = [
  /^test\d*$/i,
  /^prueba\d*$/i,
  /^john\s*doe$/i,
  /^jane\s*doe$/i,
  /^usuario\d*$/i,
  /^user\d*$/i,
  /^admin\d*$/i,
  /^administrador\d*$/i,
  /^ejemplo\d*$/i,
  /^sample\d*$/i,
  /^demo\d*$/i,
  /^fake\d*$/i,
  /^falso\d*$/i,
  /^asdf+$/i,
  /^qwerty+$/i,
  /^[a-z]{1,2}$/i, // Nombres muy cortos como "a", "aa"
  /^\d+$/i, // Solo números
  /^[a-z]+\d+$/i, // Patrón como "user123"
];

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'El email es obligatorio' };
  }

  // Validación básica de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Formato de email inválido' };
  }

  // Extraer el dominio
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Verificar si es un dominio de email temporal
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { isValid: false, message: 'No se permiten emails temporales o desechables' };
  }

  // Verificar patrones sospechosos
  const localPart = email.split('@')[0]?.toLowerCase();
  if (localPart.includes('test') || localPart.includes('prueba') || localPart.includes('fake')) {
    return { isValid: false, message: 'El email parece ser de prueba' };
  }

  return { isValid: true };
};

export const validateCompanyName = (companyName: string): { isValid: boolean; message?: string } => {
  if (!companyName) {
    return { isValid: false, message: 'El nombre de empresa es obligatorio' };
  }

  const trimmedName = companyName.trim().toLowerCase();

  // Verificar longitud mínima
  if (trimmedName.length < 2) {
    return { isValid: false, message: 'El nombre de empresa debe tener al menos 2 caracteres' };
  }

  // Verificar patrones genéricos
  for (const pattern of GENERIC_NAME_PATTERNS) {
    if (pattern.test(trimmedName)) {
      return { isValid: false, message: 'Por favor, introduce el nombre real de tu empresa' };
    }
  }

  // Verificar palabras genéricas
  const words = trimmedName.split(/\s+/);
  for (const word of words) {
    if (GENERIC_COMPANY_WORDS.includes(word)) {
      return { isValid: false, message: 'Por favor, introduce el nombre real de tu empresa' };
    }
  }

  // Verificar si es solo números o caracteres repetidos
  if (/^\d+$/.test(trimmedName) || /^(.)\1+$/.test(trimmedName)) {
    return { isValid: false, message: 'Por favor, introduce un nombre de empresa válido' };
  }

  return { isValid: true };
};

export const validateContactName = (contactName: string): { isValid: boolean; message?: string } => {
  if (!contactName) {
    return { isValid: false, message: 'El nombre de contacto es obligatorio' };
  }

  const trimmedName = contactName.trim().toLowerCase();

  // Verificar longitud mínima
  if (trimmedName.length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }

  // Verificar patrones genéricos
  for (const pattern of GENERIC_NAME_PATTERNS) {
    if (pattern.test(trimmedName)) {
      return { isValid: false, message: 'Por favor, introduce tu nombre real' };
    }
  }

  // Verificar si contiene al menos una letra
  if (!/[a-záéíóúüñ]/i.test(trimmedName)) {
    return { isValid: false, message: 'El nombre debe contener al menos una letra' };
  }

  return { isValid: true };
};
