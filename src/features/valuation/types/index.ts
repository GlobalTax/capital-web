// Unified Valuation Types
export interface BaseCompanyData {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  revenue: number;
  ebitda: number;
}

export interface ExtendedCompanyData extends BaseCompanyData {
  cif: string;
  phone_e164: string;
  whatsapp_opt_in: boolean;
  activityDescription: string;
  employeeRange: string;
  hasAdjustments: boolean;
  adjustmentAmount: number;
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

export interface CompactCompanyData extends BaseCompanyData {
  baseValuation: number;
  whatsapp_opt_in: boolean;
}

export interface TaxSimulationData {
  acquisitionValue: number;
  acquisitionDate: string;
  taxpayerType: 'individual' | 'company';
  salePercentage: number;
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  vitaliciaPlan: boolean;
  vitaliciaAmount: number;
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

export interface TaxCalculationResult {
  salePrice: number;
  acquisitionValue: number;
  capitalGain: number;
  deductibleExpenses: number;
  taxableGain: number;
  totalTax: number;
  netAfterTax: number;
  effectiveTaxRate: number;
  reinvestmentBenefit: number;
  vitaliciaBenefit: number;
  abatementBenefit: number;
  taxBreakdown: {
    description: string;
    amount: number;
    rate: number;
  }[];
}

export interface ScenarioResult {
  id: string;
  name: string;
  multiplier: number;
  valuation: number;
  totalTax: number;
  netReturn: number;
  roi: number;
  effectiveTaxRate: number;
  color: string;
}

export type CalculationStrategy = 'simple' | 'extended' | 'compact' | 'master';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}