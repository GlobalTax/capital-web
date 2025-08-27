export interface CompanyDataMaster {
  // Paso 1: Información básica
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  whatsapp_opt_in: boolean;
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

export interface ValuationResultMaster {
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

export interface SectorMultipleMaster {
  sector_name: string;
  employee_range: string;
  ebitda_multiple: number;
  revenue_multiple: number;
  description: string;
}

export interface ValidationResultMaster {
  isValid: boolean;
  message?: string;
}

export interface ValidationStateMaster {
  contactName: ValidationResultMaster;
  companyName: ValidationResultMaster;
  email: ValidationResultMaster;
  phone: ValidationResultMaster;
  whatsapp_opt_in: ValidationResultMaster;
  cif: ValidationResultMaster;
  industry: ValidationResultMaster;
  activityDescription: ValidationResultMaster;
  employeeRange: ValidationResultMaster;
  revenue: ValidationResultMaster;
  ebitda: ValidationResultMaster;
  hasAdjustments: ValidationResultMaster;
  adjustmentAmount: ValidationResultMaster;
  location: ValidationResultMaster;
  ownershipParticipation: ValidationResultMaster;
  competitiveAdvantage: ValidationResultMaster;
}