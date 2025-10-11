// ============= VALUATION TYPES =============
// Definiciones de tipos para valoraciones de empresas

export interface CompanyData {
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  employeeRange: string;
  revenue: number;
  ebitda: number;
  location: string;
  whatsapp_opt_in?: boolean;
}

export interface ExtendedCompanyData extends CompanyData {
  // Campos adicionales para valoraciones avanzadas
  netProfit?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  cashFlow?: number;
  marketShare?: number;
  growthRate?: number;
  customerBase?: number;
  recurringRevenue?: number;
  
  // Campos cualitativos
  businessModel?: string;
  competitiveAdvantage?: string;
  ownershipParticipation?: string;
  exitTimeline?: string;
  
  // Metadata
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface TaxData {
  taxRegime?: string;
  effectiveTaxRate?: number;
  deferredTaxes?: number;
  taxCredits?: number;
  estimatedTaxImpact?: number;
}

export interface ValuationResult {
  enterpriseValue: number;
  equityValue: number;
  multiple: number;
  method: string;
  confidence: 'low' | 'medium' | 'high';
  details: {
    methodology: string;
    assumptions: string[];
    adjustments: Record<string, number>;
  };
}

export interface ComprehensiveResult extends ValuationResult {
  taxAnalysis?: {
    currentTaxLiability: number;
    optimizedTaxLiability: number;
    potentialSavings: number;
    recommendations: string[];
  };
  marketComparison?: {
    industryAverage: number;
    percentile: number;
    similarCompanies: Array<{
      name: string;
      multiple: number;
      revenue: number;
    }>;
  };
}

export interface ValuationState {
  companyData: ExtendedCompanyData;
  taxData?: TaxData;
  currentStep: number;
  result: ValuationResult | ComprehensiveResult | null;
  isCalculating: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface SectorMultiple {
  sector: string;
  ev_revenue_min: number;
  ev_revenue_max: number;
  ev_ebitda_min: number;
  ev_ebitda_max: number;
  sample_size: number;
  updated_at: string;
}

export interface CalculatorConfig {
  version: 'v1' | 'v2' | 'v3' | 'v4' | 'master' | 'standalone';
  steps: number;
  features: {
    autosave: boolean;
    taxCalculation: boolean;
    comprehensiveAnalysis: boolean;
    pdfGeneration: boolean;
  };
  fields: {
    required: Array<keyof ExtendedCompanyData>;
    optional: Array<keyof ExtendedCompanyData>;
  };
}
