
import { useState, useCallback, useMemo } from 'react';
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';

interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: any;
}

interface SecurityConfig {
  allowHTML?: boolean;
  maxLength?: number;
  allowedDomains?: string[];
  requireHttps?: boolean;
}

type ValidationRule<T> = (value: T, config?: SecurityConfig) => ValidationResult;

interface ValidationRules<T extends Record<string, any>> {
  [K in keyof T]?: ValidationRule<T[K]>;
}

// Funciones de sanitización
const sanitizeInput = (input: string, config: SecurityConfig = {}): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remover HTML si no está permitido
  if (!config.allowHTML) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Limitar longitud
  if (config.maxLength) {
    sanitized = sanitized.substring(0, config.maxLength);
  }
  
  // Escapar caracteres especiales para prevenir XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized;
};

const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = sanitizeInput(email, { maxLength: 254 });
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, message: 'Email inválido' };
  }
  
  return { isValid: true, sanitizedValue: sanitizedEmail };
};

const validateURL = (url: string, config: SecurityConfig = {}): ValidationResult => {
  try {
    const urlObj = new URL(url);
    
    if (config.requireHttps && urlObj.protocol !== 'https:') {
      return { isValid: false, message: 'Se requiere HTTPS' };
    }
    
    if (config.allowedDomains && !config.allowedDomains.includes(urlObj.hostname)) {
      return { isValid: false, message: 'Dominio no permitido' };
    }
    
    return { isValid: true, sanitizedValue: url };
  } catch {
    return { isValid: false, message: 'URL inválida' };
  }
};

const validateRequired = (value: any): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: 'Campo requerido' };
  }
  return { isValid: true };
};

export const useSecureFormValidation = <T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules<T>,
  securityConfig: SecurityConfig = {}
) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());
  const { handleError } = useCentralizedErrorHandler();

  // Validadores predefinidos
  const validators = useMemo(() => ({
    required: validateRequired,
    email: validateEmail,
    url: (value: string) => validateURL(value, securityConfig),
    text: (value: string) => ({ 
      isValid: true, 
      sanitizedValue: sanitizeInput(value, securityConfig) 
    }),
    number: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) {
        return { isValid: false, message: 'Debe ser un número válido' };
      }
      return { isValid: true, sanitizedValue: num };
    }
  }), [securityConfig]);

  const validateField = useCallback((field: keyof T, value: any): ValidationResult => {
    try {
      const validator = validationRules[field];
      if (!validator) {
        return { isValid: true, sanitizedValue: value };
      }
      return validator(value, securityConfig);
    } catch (error) {
      handleError(error as Error, { 
        component: 'useSecureFormValidation', 
        action: 'validateField',
        metadata: { field: String(field) }
      });
      return { isValid: false, message: 'Error de validación' };
    }
  }, [validationRules, securityConfig, handleError]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const fieldKey = field as keyof T;
      const result = validateField(fieldKey, data[fieldKey]);
      
      if (!result.isValid) {
        newErrors[fieldKey] = result.message;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, validationRules, validateField]);

  const updateField = useCallback((field: keyof T, value: any) => {
    // Validar y sanitizar inmediatamente
    const validationResult = validateField(field, value);
    const finalValue = validationResult.sanitizedValue !== undefined 
      ? validationResult.sanitizedValue 
      : value;
    
    setData(prev => ({ ...prev, [field]: finalValue }));
    
    // Actualizar errores si el campo ya fue tocado
    if (touched.has(field)) {
      setErrors(prev => ({
        ...prev,
        [field]: validationResult.isValid ? undefined : validationResult.message
      }));
    }
  }, [touched, validateField]);

  const markFieldAsTouched = useCallback((field: keyof T) => {
    setTouched(prev => new Set(prev).add(field));
    
    const result = validateField(field, data[field]);
    setErrors(prev => ({
      ...prev,
      [field]: result.isValid ? undefined : result.message
    }));
  }, [data, validateField]);

  const getFieldState = useCallback((field: keyof T) => {
    const isTouched = touched.has(field);
    const errorMessage = errors[field];
    const hasError = Boolean(errorMessage);
    const isValid = !hasError && isTouched;
    
    return {
      isTouched,
      hasError,
      isValid,
      errorMessage
    };
  }, [touched, errors]);

  const isValid = useMemo(() => {
    return Object.keys(validationRules).every(field => {
      const fieldKey = field as keyof T;
      return validateField(fieldKey, data[fieldKey]).isValid;
    });
  }, [data, validationRules, validateField]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched(new Set());
  }, [initialData]);

  const getSanitizedData = useCallback((): T => {
    const sanitized = { ...data };
    Object.keys(validationRules).forEach((field) => {
      const fieldKey = field as keyof T;
      const result = validateField(fieldKey, data[fieldKey]);
      if (result.sanitizedValue !== undefined) {
        sanitized[fieldKey] = result.sanitizedValue;
      }
    });
    return sanitized;
  }, [data, validationRules, validateField]);

  return {
    data,
    errors,
    touched,
    isValid,
    validators,
    updateField,
    markFieldAsTouched,
    getFieldState,
    validateAll,
    reset,
    getSanitizedData
  };
};
