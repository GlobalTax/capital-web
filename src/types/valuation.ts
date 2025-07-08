
export interface CompanyData {
  // Paso 1: Información básica
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  activityDescription: string;
  employeeRange: string;
  
  // Paso 2: Datos financieros
  revenue: number;
  ebitda: number;
  hasAdjustments: boolean;
  adjustmentAmount: number;
  
  // Paso 3: Características
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

export interface ValuationResult {
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
}

export interface SectorMultiple {
  sector_name: string;
  employee_range: string;
  ebitda_multiple: number;
  revenue_multiple: number;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationState {
  contactName: ValidationResult;
  companyName: ValidationResult;
  email: ValidationResult;
  phone: ValidationResult;
  cif: ValidationResult;
  industry: ValidationResult;
  activityDescription: ValidationResult;
  employeeRange: ValidationResult;
  revenue: ValidationResult;
  ebitda: ValidationResult;
  hasAdjustments: ValidationResult;
  adjustmentAmount: ValidationResult;
  location: ValidationResult;
  ownershipParticipation: ValidationResult;
  competitiveAdvantage: ValidationResult;
}
