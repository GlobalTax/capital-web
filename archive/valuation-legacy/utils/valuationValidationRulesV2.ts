
import { CompanyDataV2 } from '@/types/valuationV2';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface ValidationRules {
  [key: string]: (value: any) => ValidationResult;
}

export const createValidationRulesV2 = (): ValidationRules => {
  return {
    // Paso 1: Información básica
    contactName: (value: string) => ({
      isValid: value.trim().length >= 2,
      message: 'El nombre debe tener al menos 2 caracteres'
    }),
    companyName: (value: string) => ({
      isValid: value.trim().length >= 2,
      message: 'El nombre de la empresa debe tener al menos 2 caracteres'
    }),
    email: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        message: 'Ingrese un email válido'
      };
    },
    phone: (value: string) => ({
      isValid: value.trim().length >= 9,
      message: 'El teléfono debe tener al menos 9 dígitos'
    }),
    cif: (value: string) => ({
      isValid: value.trim().length >= 8,
      message: 'El CIF debe tener al menos 8 caracteres'
    }),
    industry: (value: string) => ({
      isValid: value.trim().length > 0,
      message: 'Seleccione un sector'
    }),
    employeeRange: (value: string) => ({
      isValid: value.trim().length > 0,
      message: 'Seleccione un rango de empleados'
    }),

    // Paso 2: Datos financieros
    revenue: (value: number) => ({
      isValid: value > 0,
      message: 'Los ingresos deben ser mayor a 0'
    }),
    ebitda: (value: number) => ({
      isValid: value > 0,
      message: 'El EBITDA debe ser mayor a 0'
    }),

    // Paso 3: Características
    location: (value: string) => ({
      isValid: value.trim().length > 0,
      message: 'Seleccione una ubicación'
    }),
    ownershipParticipation: (value: string) => ({
      isValid: value.trim().length > 0,
      message: 'Seleccione el nivel de participación'
    }),
    competitiveAdvantage: (value: string) => ({
      isValid: value.trim().length >= 10,
      message: 'Describa la ventaja competitiva (mínimo 10 caracteres)'
    })
  };
};

export const getStepFieldsV2 = (step: number): string[] => {
  switch (step) {
    case 1:
      return ['contactName', 'companyName', 'email', 'phone', 'cif', 'industry', 'employeeRange'];
    case 2:
      return ['revenue', 'ebitda'];
    case 3:
      return ['location', 'ownershipParticipation', 'competitiveAdvantage'];
    default:
      return [];
  }
};

export const validateStepFieldsV2 = (
  step: number, 
  data: CompanyDataV2, 
  rules: ValidationRules
): boolean => {
  const stepFields = getStepFieldsV2(step);
  
  return stepFields.every(field => {
    const validator = rules[field];
    if (!validator) return true;
    
    const fieldValue = data[field as keyof CompanyDataV2];
    return validator(fieldValue).isValid;
  });
};
