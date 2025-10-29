// Types específicos para la calculadora de asesores profesionales

export interface AdvisorFormData {
  // Contacto
  contactName: string;
  email: string;
  phone: string;
  phone_e164: string;
  whatsapp_opt_in: boolean;
  
  // Empresa
  companyName: string;
  cif: string;
  industry: string;
  employeeRange: string;
  
  // Financiero (simplificado)
  revenue: number;
  ebitda: number;
}

export interface AdvisorValuationSimpleResult {
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  ebitdaMultiple: number;
  sector: string;
}

export interface AdvisorValidationState {
  contactName: { isValid: boolean; message?: string };
  email: { isValid: boolean; message?: string };
  phone: { isValid: boolean; message?: string };
  phone_e164: { isValid: boolean; message?: string };
  whatsapp_opt_in: { isValid: boolean; message?: string };
  companyName: { isValid: boolean; message?: string };
  cif: { isValid: boolean; message?: string };
  industry: { isValid: boolean; message?: string };
  employeeRange: { isValid: boolean; message?: string };
  revenue: { isValid: boolean; message?: string };
  ebitda: { isValid: boolean; message?: string };
}
