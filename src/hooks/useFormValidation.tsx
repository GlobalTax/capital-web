
import { useState, useCallback, useMemo } from 'react';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface ValidationRules {
  [key: string]: (value: any) => ValidationResult;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules
) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  // Validar un campo específico
  const validateField = useCallback((field: keyof T, value: any): ValidationResult => {
    const validator = validationRules[field as string];
    if (!validator) {
      return { isValid: true };
    }
    return validator(value);
  }, [validationRules]);

  // Validar todos los campos
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

  // Actualizar un campo
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Validar el campo si ya ha sido tocado
    if (touched.has(field)) {
      const result = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: result.isValid ? undefined : result.message
      }));
    }
  }, [touched, validateField]);

  // Marcar campo como tocado
  const markFieldAsTouched = useCallback((field: keyof T) => {
    setTouched(prev => new Set(prev).add(field));
    
    // Validar el campo cuando se marca como tocado
    const result = validateField(field, data[field]);
    setErrors(prev => ({
      ...prev,
      [field]: result.isValid ? undefined : result.message
    }));
  }, [data, validateField]);

  // Obtener estado de validación de un campo
  const getFieldState = useCallback((field: keyof T) => {
    const isTouched = touched.has(field);
    const hasError = errors[field];
    const isValid = !hasError && isTouched;
    
    return {
      isTouched,
      hasError,
      isValid,
      errorMessage: hasError
    };
  }, [touched, errors]);

  // Estado general de validación
  const isValid = useMemo(() => {
    return Object.keys(validationRules).every(field => {
      const fieldKey = field as keyof T;
      return validateField(fieldKey, data[fieldKey]).isValid;
    });
  }, [data, validationRules, validateField]);

  // Resetear formulario
  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched(new Set());
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    isValid,
    updateField,
    markFieldAsTouched,
    getFieldState,
    validateAll,
    reset
  };
};
