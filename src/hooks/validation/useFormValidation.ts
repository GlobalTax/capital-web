import { useState, useCallback } from 'react';
import { ValidationRules, ValidationResult } from './types';
import { securityManager } from '@/core/security/SecurityManager';

export type FormErrors<T> = {
  [K in keyof T]?: string;
}

export interface UseFormValidationOptions<T extends Record<string, any>> {
  validationRules: ValidationRules<T>;
  onValidationError?: (errors: FormErrors<T>) => void;
  enableHoneypot?: boolean;
  honeypotFieldName?: string;
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) {
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');

  const validateField = useCallback(
    (fieldName: keyof T, value: any): ValidationResult => {
      const rule = options.validationRules[fieldName];
      if (!rule) {
        return { isValid: true };
      }

      return rule(value);
    },
    [options.validationRules]
  );

  const validateForm = useCallback(
    async (formData: T): Promise<{ isValid: boolean; errors: FormErrors<T> }> => {
      setIsValidating(true);

      try {
        // Check honeypot first (silent rejection)
        if (options.enableHoneypot && honeypotValue) {
          console.warn('[Security] Honeypot triggered - bot detected');
          return {
            isValid: false,
            errors: { honeypot: 'Bot detected' } as FormErrors<T>
          };
        }

        const newErrors: FormErrors<T> = {};
        let hasErrors = false;

        // Validate all fields
        for (const fieldName in options.validationRules) {
          const value = formData[fieldName];
          const result = validateField(fieldName, value);

          if (!result.isValid) {
            newErrors[fieldName] = result.message || 'Invalid value';
            hasErrors = true;
          }

          // Check for XSS attempts
          if (typeof value === 'string' && securityManager.detectXSSAttempt(value)) {
            newErrors[fieldName] = 'Invalid characters detected';
            hasErrors = true;
          }
        }

        setErrors(newErrors);

        if (hasErrors && options.onValidationError) {
          options.onValidationError(newErrors);
        }

        return {
          isValid: !hasErrors,
          errors: newErrors
        };
      } finally {
        setIsValidating(false);
      }
    },
    [
      options,
      validateField,
      honeypotValue
    ]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Honeypot component props
  const honeypotProps = {
    type: 'text' as const,
    name: options.honeypotFieldName || 'website',
    value: honeypotValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypotValue(e.target.value),
    tabIndex: -1,
    autoComplete: 'off',
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none' as const
    },
    'aria-hidden': true
  };

  return {
    errors,
    isValidating,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    honeypotProps,
    setHoneypotValue
  };
}
