// Tipos para la Calculadora de Valoración V4 - Ultra-Rápida
export interface CompanyDataV4 {
  id?: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  revenue: number;
  ebitda: number;
  baseValuation: number;
  whatsapp_opt_in: boolean;
}

export interface TaxDataV4 {
  acquisitionValue: number;
  acquisitionDate: string;
  taxpayerType: 'individual' | 'company';
  salePercentage: number;
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  vitaliciaPlan: boolean;
  vitaliciaAmount: number;
}

export interface ScenarioResultV4 {
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

export interface DistributionData {
  name: string;
  value: number;
  color: string;
}