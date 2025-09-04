
import { validateEmail, validateCompanyName, validateContactName, validateSpanishPhone } from '@/utils/validationUtils';
import { CompanyData, ValidationState } from '@/types/valuation';

// Función para validar CIF español
export const validateCIF = (cif: string): boolean => {
  if (!cif || cif.length !== 9) return false;
  
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  if (!cifRegex.test(cif.toUpperCase())) return false;
  
  const letter = cif.charAt(0).toUpperCase();
  const numbers = cif.substring(1, 8);
  const control = cif.charAt(8).toUpperCase();
  
  // Calcular dígito de control
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    let digit = parseInt(numbers.charAt(i));
    if (i % 2 === 1) { // posiciones pares (índice impar)
      sum += digit;
    } else { // posiciones impares (índice par)
      digit *= 2;
      sum += digit > 9 ? digit - 9 : digit;
    }
  }
  
  const controlNumber = (10 - (sum % 10)) % 10;
  const controlLetter = 'JABCDEFGHI'.charAt(controlNumber);
  
  // Verificar según el tipo de organización
  const numberControl = ['A', 'B', 'E', 'H'].includes(letter);
  const letterControl = ['K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'W'].includes(letter);
  
  if (numberControl) {
    return control === controlNumber.toString();
  } else if (letterControl) {
    return control === controlLetter;
  } else {
    return control === controlNumber.toString() || control === controlLetter;
  }
};

export const createValidationState = (companyData: CompanyData): ValidationState => {
  return {
    contactName: validateContactName(companyData.contactName),
    companyName: validateCompanyName(companyData.companyName),
    email: validateEmail(companyData.email),
    phone: validateSpanishPhone(companyData.phone),
    phone_e164: { isValid: true, message: undefined },
    whatsapp_opt_in: { isValid: true, message: undefined },
    cif: companyData.cif ? { isValid: validateCIF(companyData.cif), message: validateCIF(companyData.cif) ? undefined : 'El CIF no es válido' } : { isValid: true },
    industry: { isValid: Boolean(companyData.industry), message: companyData.industry ? undefined : 'El sector es obligatorio' },
    activityDescription: { isValid: true, message: undefined },
    employeeRange: { isValid: Boolean(companyData.employeeRange), message: companyData.employeeRange ? undefined : 'El rango de empleados es obligatorio' },
    revenue: { isValid: companyData.revenue > 0, message: companyData.revenue > 0 ? undefined : 'Los ingresos deben ser mayores a 0' },
    ebitda: { isValid: companyData.ebitda > 0, message: companyData.ebitda > 0 ? undefined : 'El EBITDA debe ser mayor a 0' },
    hasAdjustments: { isValid: true, message: undefined },
    adjustmentAmount: { isValid: true, message: undefined },
    location: { isValid: Boolean(companyData.location), message: companyData.location ? undefined : 'La ubicación es obligatoria' },
    ownershipParticipation: { isValid: Boolean(companyData.ownershipParticipation), message: companyData.ownershipParticipation ? undefined : 'El porcentaje de participación es obligatorio' },
    competitiveAdvantage: { isValid: Boolean(companyData.competitiveAdvantage), message: companyData.competitiveAdvantage ? undefined : 'La ventaja competitiva es obligatoria' }
  };
};

export const validateStepData = (step: number, validationState: ValidationState): boolean => {
  switch (step) {
    case 1:
      return validationState.contactName.isValid && 
             validationState.companyName.isValid && 
             validationState.email.isValid &&
             validationState.phone.isValid &&
             validationState.industry.isValid &&
             validationState.employeeRange.isValid;
    case 2:
      return validationState.revenue.isValid && 
             validationState.ebitda.isValid;
    case 3:
      return validationState.location.isValid && 
             validationState.ownershipParticipation.isValid && 
             validationState.competitiveAdvantage.isValid;
    default:
      return true;
  }
};
