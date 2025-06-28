
export interface CompanyDataV2 {
  // Paso 1: Información básica
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  
  // Paso 2: Datos financieros
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  
  // Paso 3: Características
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;

  // Paso 4: Datos fiscales (nuevos)
  acquisitionCost: number;
  yearsHeld: number;
  salePercentage: number;
  taxRegime: 'general' | 'pyme' | 'startup';
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  previousCapitalGains: number;
}

export interface TaxCalculationResult {
  salePrice: number;
  acquisitionCost: number;
  capitalGain: number;
  taxableGain: number;
  taxRate: number;
  totalTax: number;
  netAfterTax: number;
  reinvestmentBenefit: number;
  effectiveTaxRate: number;
}

export interface ValuationResultV2 {
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
  taxImpact?: TaxCalculationResult;
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
