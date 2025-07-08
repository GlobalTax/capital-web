
import { validateEmail, validateCompanyName, validateContactName, validateSpanishPhone } from '@/utils/validationUtils';
import { validateCIF } from '@/utils/valuationValidation';
import { CompanyData } from '@/types/valuation';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface ValidationRules {
  [key: string]: (value: any) => ValidationResult;
}

export const createValidationRules = (): ValidationRules => ({
  contactName: (value: string) => validateContactName(value),
  
  companyName: (value: string) => validateCompanyName(value),
  
  email: (value: string) => validateEmail(value),
  
  phone: (value: string) => validateSpanishPhone(value),
  
  cif: (value: string) => {
    if (!value) return { isValid: true }; // CIF es opcional
    return value ? { 
      isValid: validateCIF(value), 
      message: validateCIF(value) ? undefined : 'El CIF no es válido' 
    } : { isValid: true };
  },
  
  industry: (value: string) => ({
    isValid: Boolean(value),
    message: value ? undefined : 'El sector es obligatorio'
  }),
  
  activityDescription: (value: string) => ({
    isValid: Boolean(value),
    message: value ? undefined : 'La descripción de actividad es obligatoria'
  }),
  
  employeeRange: (value: string) => ({
    isValid: Boolean(value),
    message: value ? undefined : 'El rango de empleados es obligatorio'
  }),
  
  revenue: (value: number) => ({
    isValid: value > 0,
    message: value > 0 ? undefined : 'Los ingresos deben ser mayores a 0'
  }),
  
  ebitda: (value: number) => ({
    isValid: value > 0,
    message: value > 0 ? undefined : 'El EBITDA debe ser mayor a 0'
  }),
  
  hasAdjustments: (value: boolean) => ({
    isValid: true, // Campo siempre válido
    message: undefined
  }),
  
  adjustmentAmount: (value: number) => ({
    isValid: true, // Campo opcional
    message: undefined
  }),
  
  location: (value: string) => ({
    isValid: Boolean(value),
    message: value ? undefined : 'La ubicación es obligatoria'
  }),
  
  ownershipParticipation: (value: string) => ({
    isValid: Boolean(value),
    message: value ? undefined : 'El porcentaje de participación es obligatorio'
  }),
  
  competitiveAdvantage: (value: string) => ({
    isValid: Boolean(value),
    message: value ? undefined : 'La ventaja competitiva es obligatoria'
  })
});

// Función para validar por pasos
export const validateStepFields = (step: number, data: CompanyData, validationRules: ValidationRules): boolean => {
  const stepFields = getStepFields(step);
  
  return stepFields.every(field => {
    const validator = validationRules[field];
    if (!validator) return true;
    return validator(data[field as keyof CompanyData]).isValid;
  });
};

// Obtener campos por paso
export const getStepFields = (step: number): string[] => {
  switch (step) {
    case 1:
      return ['contactName', 'companyName', 'email', 'phone', 'industry', 'activityDescription', 'employeeRange'];
    case 2:
      return ['revenue', 'ebitda'];
    case 3:
      return ['location', 'ownershipParticipation', 'competitiveAdvantage'];
    default:
      return [];
  }
};
