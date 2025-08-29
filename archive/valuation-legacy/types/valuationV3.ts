// Tipos para la Calculadora de Valoración V3 - Cliente
export interface CompanyDataV3 {
  // Datos pre-cargados del cliente
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  revenue: number;
  ebitda: number;
  baseValuation: number;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  type: 'conservative' | 'base' | 'optimistic' | 'custom';
  multiplier: number;
  description: string;
  color: string;
}

export interface TaxScenarioData {
  acquisitionValue: number;
  acquisitionDate: string;
  taxpayerType: 'individual' | 'company';
  salePercentage: number;
  currentTaxBase?: number;
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  vitaliciaPlan: boolean;
  vitaliciaAmount: number;
}

export interface ScenarioResult {
  scenario: ScenarioConfig;
  valuation: number;
  taxCalculation: TaxCalculationResult;
  roi: number;
  netReturn: number;
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

export interface ScenarioComparison {
  scenarios: ScenarioResult[];
  bestScenario: ScenarioResult;
  recommendations: string[];
}