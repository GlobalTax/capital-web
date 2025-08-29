// ============= UNIFIED VALIDATION ENGINE =============
// Single validation engine for all calculator versions

import { ExtendedCompanyData, CalculatorConfig, ValidationResult } from '../types/unified.types';

// ============= VALIDATION RULES =============
interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

const validationRules: Record<string, ValidationRule> = {
  contactName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿñÑ\s.\-]+$/,
    message: 'El nombre debe tener entre 2 y 100 caracteres y solo contener letras'
  },
  
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'El nombre de la empresa debe tener entre 2 y 100 caracteres'
  },
  
  email: {
    required: true,
    pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    maxLength: 254,
    message: 'Introduce un email válido'
  },
  
  phone: {
    required: true,
    pattern: /^[+]?[0-9\s.()-]+$/,
    message: 'El teléfono es obligatorio e introduce un formato válido'
  },
  
  industry: {
    required: true,
    minLength: 2,
    message: 'Selecciona un sector'
  },
  
  revenue: {
    required: true,
    min: 1000,
    max: 1000000000,
    message: 'La facturación debe estar entre €1.000 y €1.000M'
  },
  
  ebitda: {
    required: true,
    min: 0,
    max: 100000000,
    message: 'El EBITDA debe ser un valor positivo'
  },
  
  employeeRange: {
    required: true,
    message: 'Selecciona el rango de empleados'
  },
  
  location: {
    required: false,
    minLength: 2,
    maxLength: 100,
    message: 'La ubicación debe tener entre 2 y 100 caracteres'
  },
  
  cif: {
    required: false,
    pattern: /^[A-HJ-NP-SUVW][0-9]{7}[0-9A-J]$/,
    message: 'CIF no válido (formato: A12345674)'
  },
  
  activityDescription: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'La descripción debe tener entre 10 y 500 caracteres'
  }
};

// ============= STEP FIELD MAPPING =============
const getFieldsForStep = (step: number, config: CalculatorConfig): (keyof ExtendedCompanyData)[] => {
  switch (config.version) {
    case 'v1':
    case 'master':
      switch (step) {
        case 1: return ['contactName', 'companyName', 'cif', 'email', 'phone', 'industry', 'activityDescription', 'employeeRange'];
        case 2: return ['revenue', 'ebitda', 'hasAdjustments', 'adjustmentAmount'];
        case 3: return ['location', 'ownershipParticipation', 'competitiveAdvantage'];
        default: return [];
      }
    
    case 'v2':
      switch (step) {
        case 1: return ['contactName', 'companyName', 'email', 'phone', 'industry', 'activityDescription', 'employeeRange', 'revenue', 'ebitda'];
        case 2: return ['location', 'ownershipParticipation', 'competitiveAdvantage'];
        default: return [];
      }
    
    case 'v3':
    case 'v4':
    case 'standalone':
      // These versions typically load with pre-filled data
      return ['contactName', 'companyName', 'email', 'phone', 'industry', 'revenue', 'ebitda'];
    
    default:
      return [];
  }
};

// ============= VALIDATION FUNCTIONS =============
const validateField = (
  field: keyof ExtendedCompanyData,
  value: any,
  data: ExtendedCompanyData
): ValidationResult => {
  const rule = validationRules[field as keyof typeof validationRules];
  if (!rule) return { isValid: true };

  // Required check
  if (rule.required && (!value || value === '' || value === 0)) {
    return { isValid: false, message: rule.message || `${field} es requerido` };
  }

  // Skip other validations if not required and empty
  if (!rule.required && (!value || value === '')) {
    return { isValid: true };
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.trim().length < rule.minLength) {
      return { isValid: false, message: rule.message };
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return { isValid: false, message: rule.message };
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return { isValid: false, message: rule.message };
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return { isValid: false, message: rule.message };
    }
    
    if (rule.max !== undefined && value > rule.max) {
      return { isValid: false, message: rule.message };
    }
  }

  // Custom validations
  if (field === 'ebitda' && data.revenue && value > data.revenue) {
    return { isValid: false, message: 'El EBITDA no puede ser mayor que la facturación' };
  }

  if (field === 'adjustmentAmount' && data.hasAdjustments && (!value || value === 0)) {
    return { isValid: false, message: 'Especifica el importe del ajuste' };
  }

  return { isValid: true };
};

// ============= MAIN VALIDATION FUNCTION =============
export const validateCalculatorData = (
  data: ExtendedCompanyData,
  step: number,
  config: CalculatorConfig
): { isValid: boolean; errors: Record<string, string> } => {
  const fieldsToValidate = getFieldsForStep(step, config);
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const field of fieldsToValidate) {
    const validation = validateField(field, data[field], data);
    if (!validation.isValid) {
      errors[field] = validation.message || `${field} is invalid`;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// ============= SPECIFIC VALIDATORS =============
export const validateEmail = (email: string): boolean => {
  return validationRules.email.pattern.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return !phone || validationRules.phone.pattern!.test(phone);
};

export const validateCIF = (cif: string): boolean => {
  return !cif || validationRules.cif.pattern!.test(cif);
};

export const validateFinancialData = (revenue: number, ebitda: number): { isValid: boolean; message?: string } => {
  if (revenue <= 0) {
    return { isValid: false, message: 'La facturación debe ser mayor que 0' };
  }
  
  if (ebitda < 0) {
    return { isValid: false, message: 'El EBITDA no puede ser negativo' };
  }
  
  if (ebitda > revenue) {
    return { isValid: false, message: 'El EBITDA no puede ser mayor que la facturación' };
  }
  
  return { isValid: true };
};

// ============= BUSINESS LOGIC VALIDATORS =============
export const validateBusinessLogic = (data: ExtendedCompanyData): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Check EBITDA margin
  if (data.revenue && data.ebitda) {
    const margin = (data.ebitda / data.revenue) * 100;
    if (margin > 50) {
      warnings.push('El margen EBITDA parece muy alto. Verifica los datos.');
    } else if (margin < 5) {
      warnings.push('El margen EBITDA es bajo. Considera revisar la rentabilidad.');
    }
  }
  
  // Check revenue vs employee range
  if (data.revenue && data.employeeRange) {
    const revenuePerEmployee = getEstimatedRevenuePerEmployee(data.employeeRange);
    if (revenuePerEmployee && data.revenue / revenuePerEmployee > 3) {
      warnings.push('La facturación por empleado parece muy alta para el sector.');
    }
  }
  
  return { isValid: warnings.length === 0, warnings };
};

// ============= HELPER FUNCTIONS =============
const getEstimatedRevenuePerEmployee = (employeeRange: string): number | null => {
  const ranges: Record<string, number> = {
    '1': 100000,
    '2-5': 80000,
    '6-10': 75000,
    '11-25': 70000,
    '26-50': 65000,
    '51-100': 60000,
    '101-250': 55000,
    '251-500': 50000,
    '500+': 45000
  };
  
  return ranges[employeeRange] || null;
};

// ============= EXPORT VALIDATION UTILITIES =============
export const getFieldError = (
  field: keyof ExtendedCompanyData,
  data: ExtendedCompanyData,
  touched: Record<string, boolean>
): string | null => {
  if (!touched[field]) return null;
  
  const validation = validateField(field, data[field], data);
  return validation.isValid ? null : validation.message || null;
};

export const isStepComplete = (
  step: number,
  data: ExtendedCompanyData,
  config: CalculatorConfig
): boolean => {
  const validation = validateCalculatorData(data, step, config);
  return validation.isValid;
};