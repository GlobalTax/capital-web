// ============= ADVANCED FORM VALIDATION HOOK =============
// Hook avanzado para validación de formularios con reglas personalizables

import { useState, useCallback, useEffect } from 'react';
import { devLogger } from '@/utils/devLogger';

export interface ValidationRule {
  name: string;
  test: (value: any, formData: Record<string, any>) => boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface FieldConfig {
  required?: boolean;
  rules?: ValidationRule[];
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  touchedFields: Set<string>;
  validatingFields: Set<string>;
}

export interface UseFormValidationProps {
  fields: Record<string, FieldConfig>;
  onValidationChange?: (state: FormValidationState) => void;
  validateOnMount?: boolean;
}

// Reglas de validación predefinidas
export const commonValidationRules = {
  email: {
    name: 'email',
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Email no válido'
  },
  phone: {
    name: 'phone',
    test: (value: string) => /^[\+]?[0-9\s\-\(\)]{9,}$/.test(value),
    message: 'Teléfono no válido'
  },
  minLength: (min: number) => ({
    name: 'minLength',
    test: (value: string) => !value || value.length >= min,
    message: `Mínimo ${min} caracteres`
  }),
  maxLength: (max: number) => ({
    name: 'maxLength',
    test: (value: string) => !value || value.length <= max,
    message: `Máximo ${max} caracteres`
  }),
  pattern: (regex: RegExp, message: string) => ({
    name: 'pattern',
    test: (value: string) => !value || regex.test(value),
    message
  }),
  numeric: {
    name: 'numeric',
    test: (value: string) => !value || /^\d+(\.\d+)?$/.test(value),
    message: 'Debe ser un número válido'
  },
  range: (min: number, max: number) => ({
    name: 'range',
    test: (value: string) => {
      const num = parseFloat(value);
      return !value || (!isNaN(num) && num >= min && num <= max);
    },
    message: `Debe estar entre ${min} y ${max}`
  }),
  url: {
    name: 'url',
    test: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'URL no válida'
  },
  strongPassword: {
    name: 'strongPassword',
    test: (value: string) => {
      if (!value) return true;
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
    },
    message: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
  },
  matchField: (fieldName: string) => ({
    name: 'matchField',
    test: (value: string, formData: Record<string, any>) => {
      return !value || value === formData[fieldName];
    },
    message: `Debe coincidir con ${fieldName}`
  })
};

export const useFormValidation = ({
  fields,
  onValidationChange,
  validateOnMount = false
}: UseFormValidationProps) => {
  const [validationState, setValidationState] = useState<FormValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    infos: [],
    touchedFields: new Set(),
    validatingFields: new Set()
  });

  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});

  const validateField = useCallback((
    fieldName: string, 
    value: any, 
    formData: Record<string, any>
  ): ValidationError[] => {
    const fieldConfig = fields[fieldName];
    if (!fieldConfig) return [];

    const errors: ValidationError[] = [];

    // Validación requerido
    if (fieldConfig.required && (!value || String(value).trim() === '')) {
      errors.push({
        field: fieldName,
        message: 'Este campo es obligatorio',
        severity: 'error'
      });
    }

    // Aplicar reglas personalizadas
    if (fieldConfig.rules && value) {
      fieldConfig.rules.forEach(rule => {
        if (!rule.test(value, formData)) {
          errors.push({
            field: fieldName,
            message: rule.message,
            severity: rule.severity || 'error'
          });
        }
      });
    }

    return errors;
  }, [fields]);

  const validateAllFields = useCallback((formData: Record<string, any>): ValidationError[] => {
    const allErrors: ValidationError[] = [];
    
    Object.keys(fields).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName], formData);
      allErrors.push(...fieldErrors);
    });

    return allErrors;
  }, [fields, validateField]);

  const updateValidationState = useCallback((
    errors: ValidationError[],
    touchedFields?: Set<string>
  ) => {
    const newState: FormValidationState = {
      isValid: !errors.some(e => e.severity === 'error'),
      errors: errors.filter(e => e.severity === 'error'),
      warnings: errors.filter(e => e.severity === 'warning'),
      infos: errors.filter(e => e.severity === 'info'),
      touchedFields: touchedFields || validationState.touchedFields,
      validatingFields: new Set()
    };

    setValidationState(newState);
    onValidationChange?.(newState);

    devLogger.debug('Validation state updated', {
      isValid: newState.isValid,
      errorCount: newState.errors.length,
      warningCount: newState.warnings.length
    }, 'form-validation');
  }, [validationState.touchedFields, onValidationChange]);

  const validateSingleField = useCallback((
    fieldName: string,
    value: any,
    formData: Record<string, any>,
    immediate = false
  ) => {
    const fieldConfig = fields[fieldName];
    if (!fieldConfig) return;

    // Limpiar timer anterior si existe
    if (debounceTimers[fieldName]) {
      clearTimeout(debounceTimers[fieldName]);
    }

    const doValidation = () => {
      setValidationState(prev => ({
        ...prev,
        validatingFields: new Set([...prev.validatingFields, fieldName])
      }));

      const fieldErrors = validateField(fieldName, value, formData);
      
      // Actualizar errores para este campo específico
      setValidationState(prev => {
        const otherErrors = prev.errors.filter(e => e.field !== fieldName);
        const otherWarnings = prev.warnings.filter(e => e.field !== fieldName);
        const otherInfos = prev.infos.filter(e => e.field !== fieldName);
        
        const allErrors = [
          ...otherErrors,
          ...otherWarnings,
          ...otherInfos,
          ...fieldErrors
        ];

        const newState: FormValidationState = {
          isValid: !allErrors.some(e => e.severity === 'error'),
          errors: allErrors.filter(e => e.severity === 'error'),
          warnings: allErrors.filter(e => e.severity === 'warning'),
          infos: allErrors.filter(e => e.severity === 'info'),
          touchedFields: prev.touchedFields,
          validatingFields: new Set([...prev.validatingFields].filter(f => f !== fieldName))
        };

        onValidationChange?.(newState);
        return newState;
      });
    };

    if (immediate || !fieldConfig.debounceMs) {
      doValidation();
    } else {
      const timer = setTimeout(doValidation, fieldConfig.debounceMs);
      setDebounceTimers(prev => ({ ...prev, [fieldName]: timer }));
    }
  }, [fields, debounceTimers, validateField, onValidationChange]);

  const validateForm = useCallback((formData: Record<string, any>) => {
    const allErrors = validateAllFields(formData);
    updateValidationState(allErrors);
    return allErrors.filter(e => e.severity === 'error').length === 0;
  }, [validateAllFields, updateValidationState]);

  const markFieldTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, fieldName])
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      errors: prev.errors.filter(e => e.field !== fieldName),
      warnings: prev.warnings.filter(e => e.field !== fieldName),
      infos: prev.infos.filter(e => e.field !== fieldName)
    }));
  }, []);

  const reset = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      infos: [],
      touchedFields: new Set(),
      validatingFields: new Set()
    });
    
    // Limpiar timers
    Object.values(debounceTimers).forEach(clearTimeout);
    setDebounceTimers({});
  }, [debounceTimers]);

  const getFieldError = useCallback((fieldName: string) => {
    return validationState.errors.find(e => e.field === fieldName);
  }, [validationState.errors]);

  const getFieldWarning = useCallback((fieldName: string) => {
    return validationState.warnings.find(e => e.field === fieldName);
  }, [validationState.warnings]);

  const isFieldValid = useCallback((fieldName: string) => {
    return !validationState.errors.some(e => e.field === fieldName);
  }, [validationState.errors]);

  const isFieldTouched = useCallback((fieldName: string) => {
    return validationState.touchedFields.has(fieldName);
  }, [validationState.touchedFields]);

  const isFieldValidating = useCallback((fieldName: string) => {
    return validationState.validatingFields.has(fieldName);
  }, [validationState.validatingFields]);

  // Validación inicial si se solicita
  useEffect(() => {
    if (validateOnMount) {
      const initialErrors = validateAllFields({});
      updateValidationState(initialErrors);
    }
  }, [validateOnMount, validateAllFields, updateValidationState]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(clearTimeout);
    };
  }, [debounceTimers]);

  return {
    validationState,
    validateField: validateSingleField,
    validateForm,
    markFieldTouched,
    clearFieldError,
    reset,
    getFieldError,
    getFieldWarning,
    isFieldValid,
    isFieldTouched,
    isFieldValidating
  };
};

export default useFormValidation;