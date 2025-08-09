
import { useSecureFormValidation } from './useSecureFormValidation';

// Mantener compatibilidad con la interfaz anterior
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
  // Convertir reglas del formato anterior al nuevo
  const convertedRules = Object.fromEntries(
    Object.entries(validationRules).map(([key, rule]) => [
      key as keyof T,
      (value: any) => {
        const result = rule(value);
        return {
          isValid: result.isValid,
          message: result.message,
          sanitizedValue: value // En el formato anterior no había sanitización
        };
      }
    ])
  ) as any;

  return useSecureFormValidation(initialData, convertedRules);
};
