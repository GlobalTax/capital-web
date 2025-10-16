// ============= UNIFIED VALUATION TYPES =============
// Consolidated types for all calculator versions

// ============= BASE TYPES =============
export interface BaseCompanyData {
  // Contact Information
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  phone_e164?: string;
  
  // Company Details
  industry: string;
  cif?: string;
  
  // Financial Data
  revenue: number;
  ebitda: number;
  
  // Settings
  whatsapp_opt_in: boolean;
}

// ============= EXTENDED COMPANY DATA =============
export interface ExtendedCompanyData extends BaseCompanyData {
  // Additional Business Info
  activityDescription?: string;
  employeeRange?: string;
  location?: string;
  ownershipParticipation?: string;
  competitiveAdvantage?: string;
  
  // Financial Adjustments
  hasAdjustments?: boolean;
  adjustmentAmount?: number;
  
  // Company Characteristics
  yearsOfOperation?: number;
  growthRate?: number;
  netProfitMargin?: number;
  
  // Calculated Values
  baseValuation?: number;
}

// ============= TAX DATA =============
export interface TaxData {
  acquisitionValue: number;
  acquisitionDate: string;
  taxpayerType: 'individual' | 'company';
  salePercentage: number;
  
  // Tax Planning Options
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  vitaliciaPlan: boolean;
  vitaliciaAmount: number;
  
  // Optional
  currentTaxBase?: number;
}

// ============= VALUATION SCENARIOS =============
export interface ValuationScenario {
  id: string;
  name: string;
  type: 'conservative' | 'base' | 'optimistic' | 'custom';
  multiplier: number;
  description?: string;
  color: string;
}

export interface ScenarioResult {
  scenario: ValuationScenario;
  valuation: number;
  totalTax: number;
  netReturn: number;
  roi: number;
  effectiveTaxRate: number;
  taxCalculation?: TaxCalculationResult;
}

// ============= TAX CALCULATION =============
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

// ============= VALUATION RESULTS =============
export interface ValuationResult {
  finalValuation: number;
  ebitdaMultiple?: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
}

export interface ComprehensiveResult {
  baseResult: ValuationResult;
  scenarios: ScenarioResult[];
  bestScenario: ScenarioResult;
  recommendations: string[];
}

// ============= SECTOR DATA =============
export interface SectorMultiple {
  sector_name: string;
  employee_range: string;
  ebitda_multiple: number;
  revenue_multiple: number;
  description: string;
}

// ============= CALCULATOR CONFIG =============
export interface CalculatorConfig {
  version: 'v1' | 'v2' | 'v2-meta' | 'v3' | 'v4' | 'master' | 'standalone';
  steps: number;
  features: {
    autosave: boolean;
    tracking: boolean;
    taxCalculation: boolean;
    scenarios: boolean;
    realTime: boolean;
    standalone: boolean;
    redirectOnCalculate?: boolean; // 🔥 NUEVO: Flag para redirección
    redirectUrl?: string; // 🔥 NUEVO: URL de destino
  };
  ui: {
    theme: 'default' | 'minimal' | 'advanced';
    showProgress: boolean;
    showSaveStatus: boolean;
    customTitle?: string; // Clave de traducción personalizada para título
    customSubtitle?: string; // Clave de traducción personalizada para subtítulo
    showMetaBadge?: boolean; // Mostrar badge "Meta Ads" para identificación
  };
}

// ============= STATE MANAGEMENT =============
export interface CalculatorState {
  currentStep: number;
  companyData: ExtendedCompanyData;
  taxData?: TaxData;
  result?: ValuationResult | ComprehensiveResult;
  scenarios?: ScenarioResult[];
  customMultiplier?: number;
  isCalculating: boolean;
  showValidation: boolean;
  errors: Record<string, string | string[]>;
  touched: Record<string, boolean>;
}

// ============= FORM VALIDATION =============
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationState {
  [field: string]: ValidationResult;
}

// ============= TRACKING =============
export interface TrackingEvent {
  type: string;
  data: any;
  timestamp: Date;
  calculatorVersion: string;
}

// ============= API RESPONSES =============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ============= DISTRIBUTION DATA =============
export interface DistributionData {
  name: string;
  value: number;
  color: string;
}

// ============= UTILITY TYPES =============
export type AnyCompanyData = BaseCompanyData | ExtendedCompanyData;
export type AnyResult = ValuationResult | ComprehensiveResult;
export type CalculatorVersion = CalculatorConfig['version'];