
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  message?: string;
  sanitizedValue?: any;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'El email es obligatorio' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Por favor, introduce un email válido' };
  }
  
  return { isValid: true };
};

export const validateContactName = (name: string): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'El nombre es obligatorio' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // Phone is optional
  }
  
  const phoneRegex = /^[+]?[\d\s\-()]{9,}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Por favor, introduce un teléfono válido' };
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} es obligatorio` };
  }
  
  return { isValid: true };
};

export const validateCompanyName = (name: string): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: true }; // Company name is optional
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'El nombre de empresa debe tener al menos 2 caracteres' };
  }
  
  return { isValid: true };
};

export const validateSpanishPhone = (phone: string): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // Phone is optional
  }
  
  const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, error: 'Por favor, introduce un teléfono español válido' };
  }
  
  return { isValid: true, sanitizedValue: phone.replace(/\s/g, '') };
};

export const formatSpanishPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('34')) {
    return '+34 ' + cleaned.slice(2);
  }
  return '+34 ' + cleaned;
};
