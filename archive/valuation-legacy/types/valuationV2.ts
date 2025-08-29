
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
}

export interface TaxSimulatorData {
  taxpayerType: 'individual' | 'company';
  acquisitionValue: number;
  acquisitionDate: string; // Nuevo: fecha de adquisición
  yearsHeld: number;
  salePercentage: number;
  currentTaxBase?: number; // Para sociedades
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  reinvestmentQualifies: boolean; // Cumple requisitos art. 42 LIS
  vitaliciaPlan: boolean; // Nuevo: plan de renta vitalicia para personas físicas
  vitaliciaAmount: number; // Nuevo: importe a reinvertir en renta vitalicia
}

export interface TaxCalculationResult {
  salePrice: number;
  acquisitionValue: number;
  capitalGain: number;
  deductibleExpenses: number;
  taxableGain: number;
  taxRate: number;
  totalTax: number;
  netAfterTax: number;
  reinvestmentBenefit: number;
  vitaliciaBenefit: number; // Nuevo: beneficio por renta vitalicia
  abatementBenefit: number; // Nuevo: beneficio por coeficientes de abatimiento
  effectiveTaxRate: number;
  taxBreakdown: {
    description: string;
    amount: number;
    rate: number;
  }[];
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
