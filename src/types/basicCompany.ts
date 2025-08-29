// Basic company data types for simple calculator
export interface BasicCompanyData {
  id?: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  revenue: number;
  ebitda: number;
  baseValuation: number;
  whatsapp_opt_in?: boolean;
}

export interface BasicValuationResult {
  baseValuation: number;
  minValuation: number;
  maxValuation: number;
  ebitdaMultiple: number;
  revenueMultiple: number;
  companyData: BasicCompanyData;
}