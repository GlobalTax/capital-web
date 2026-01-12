// =====================================================
// CAPITAL RIESGO (PE/VC) - TIPOS TYPESCRIPT
// =====================================================

// Enums y tipos literales
export type CRFundType = 
  | 'private_equity' 
  | 'venture_capital' 
  | 'growth_equity' 
  | 'family_office' 
  | 'corporate' 
  | 'fund_of_funds';

export type CRFundStatus = 
  | 'active' 
  | 'raising' 
  | 'deployed' 
  | 'closed' 
  | 'inactive';

export type CRPersonRole = 
  | 'partner' 
  | 'managing_partner' 
  | 'principal' 
  | 'director' 
  | 'associate' 
  | 'analyst' 
  | 'operating_partner' 
  | 'advisor' 
  | 'other';

export type CRInvestmentStage = 
  | 'seed' 
  | 'series_a' 
  | 'series_b' 
  | 'series_c' 
  | 'growth' 
  | 'buyout' 
  | 'turnaround' 
  | 'special_situations';

export type CRInvestmentType = 
  | 'lead' 
  | 'co_invest' 
  | 'follow_on';

export type CROwnershipType = 
  | 'majority' 
  | 'minority' 
  | 'growth' 
  | 'control';

export type CRPortfolioStatus = 
  | 'active' 
  | 'exited' 
  | 'write_off' 
  | 'partial_exit';

export type CRExitType = 
  | 'trade_sale' 
  | 'ipo' 
  | 'secondary' 
  | 'recap' 
  | 'write_off' 
  | 'merger' 
  | 'spac';

export type CRDealType = 
  | 'acquisition' 
  | 'add_on' 
  | 'exit' 
  | 'recap' 
  | 'follow_on' 
  | 'ipo' 
  | 'merger';

export type CRLPType = 
  | 'pension_fund' 
  | 'sovereign_wealth' 
  | 'endowment' 
  | 'family_office' 
  | 'fund_of_funds' 
  | 'insurance' 
  | 'bank' 
  | 'corporate' 
  | 'other';

export type CRMatchStatus = 
  | 'new' 
  | 'reviewed' 
  | 'contacted' 
  | 'interested' 
  | 'not_fit' 
  | 'won' 
  | 'lost';

export type CRMatchEntityType = 
  | 'operation' 
  | 'mandato' 
  | 'empresa';

// =====================================================
// INTERFACES PRINCIPALES
// =====================================================

export interface CRFund {
  id: string;
  name: string;
  fund_type: CRFundType | null;
  website: string | null;
  portfolio_url: string | null;
  last_portfolio_scraped_at: string | null;
  country_base: string | null;
  cities: string[] | null;
  status: CRFundStatus | null;
  founded_year: number | null;
  aum: number | null;
  current_fund_number: number | null;
  current_fund_size: number | null;
  description: string | null;
  investment_stage: CRInvestmentStage[] | null;
  geography_focus: string[] | null;
  sector_focus: string[] | null;
  sector_exclusions: string[] | null;
  ticket_min: number | null;
  ticket_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  deal_types: string[] | null;
  notes_internal: string | null;
  source_url: string | null;
  source_last_verified_at: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRPerson {
  id: string;
  fund_id: string;
  full_name: string;
  role: CRPersonRole | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  phone: string | null;
  location: string | null;
  sector_expertise: string[] | null;
  is_primary_contact: boolean | null;
  is_email_verified: boolean | null;
  notes: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRPortfolio {
  id: string;
  fund_id: string;
  company_name: string;
  website: string | null;
  country: string | null;
  sector: string | null;
  investment_year: number | null;
  investment_type: CRInvestmentType | null;
  ownership_type: CROwnershipType | null;
  status: CRPortfolioStatus | null;
  exit_year: number | null;
  exit_type: CRExitType | null;
  description: string | null;
  source_url: string | null;
  notes: string | null;
  fund_name: string | null; // Nombre del fondo específico (Fund I, II, etc.)
  is_deleted: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRLP {
  id: string;
  name: string;
  type: CRLPType | null;
  country: string | null;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  aum: number | null;
  notes: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRFundLP {
  id: string;
  fund_id: string;
  lp_id: string;
  commitment_size: number | null;
  since_year: number | null;
  notes: string | null;
  created_at: string;
}

export interface CRDeal {
  id: string;
  fund_id: string;
  portfolio_id: string | null;
  deal_type: CRDealType | null;
  company_name: string;
  deal_year: number | null;
  deal_value: number | null;
  sector: string | null;
  country: string | null;
  description: string | null;
  source_url: string | null;
  notes: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMatch {
  id: string;
  fund_id: string;
  crm_entity_type: CRMatchEntityType;
  crm_entity_id: string;
  match_score: number | null;
  match_reasons: Record<string, unknown> | null;
  status: CRMatchStatus | null;
  owner_user_id: string | null;
  notes: string | null;
  last_scored_at: string | null;
  contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRFundAuditLog {
  id: string;
  fund_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  changed_at: string;
}

// =====================================================
// TIPOS CON RELACIONES
// =====================================================

export interface CRFundWithRelations extends CRFund {
  people?: CRPerson[];
  portfolio?: CRPortfolio[];
  deals?: CRDeal[];
  matches?: CRMatch[];
  fund_lps?: (CRFundLP & { lp?: CRLP })[];
}

export interface CRPersonWithFund extends CRPerson {
  fund?: CRFund;
}

export interface CRPortfolioWithFund extends CRPortfolio {
  fund?: CRFund;
}

export interface CRDealWithRelations extends CRDeal {
  fund?: CRFund;
  portfolio?: CRPortfolio;
}

export interface CRFundLPWithRelations extends CRFundLP {
  fund?: CRFund;
  lp?: CRLP;
}

// =====================================================
// FILTROS
// =====================================================

export interface CRFundFilters {
  search?: string;
  status?: CRFundStatus | CRFundStatus[];
  fund_type?: CRFundType | CRFundType[];
  country?: string;
  sector?: string;
  ebitda_min?: number;
  ebitda_max?: number;
  ticket_min?: number;
  ticket_max?: number;
  investment_stage?: CRInvestmentStage[];
}

export interface CRPeopleFilters {
  search?: string;
  role?: CRPersonRole | CRPersonRole[];
  fund_id?: string;
  is_primary_contact?: boolean;
}

export interface CRPortfolioFilters {
  search?: string;
  fund_id?: string;
  status?: CRPortfolioStatus | CRPortfolioStatus[];
  sector?: string;
  country?: string;
}

export interface CRDealFilters {
  search?: string;
  fund_id?: string;
  deal_type?: CRDealType | CRDealType[];
  year_from?: number;
  year_to?: number;
}

export interface CRLPFilters {
  search?: string;
  type?: CRLPType | CRLPType[];
  country?: string;
}

export interface CRMatchFilters {
  fund_id?: string;
  status?: CRMatchStatus | CRMatchStatus[];
  crm_entity_type?: CRMatchEntityType;
  min_score?: number;
}

// =====================================================
// TIPOS DE FORMULARIO
// =====================================================

export type CRFundFormData = Omit<CRFund, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'>;
export type CRPersonFormData = Omit<CRPerson, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'>;
export type CRPortfolioFormData = Omit<CRPortfolio, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'>;
export type CRDealFormData = Omit<CRDeal, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'>;
export type CRLPFormData = Omit<CRLP, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'>;
export type CRFundLPFormData = Omit<CRFundLP, 'id' | 'created_at'>;
export type CRMatchFormData = Omit<CRMatch, 'id' | 'created_at' | 'updated_at'>;

// =====================================================
// CONSTANTES Y LABELS
// =====================================================

export const CR_FUND_TYPE_LABELS: Record<CRFundType, string> = {
  private_equity: 'Private Equity',
  venture_capital: 'Venture Capital',
  growth_equity: 'Growth Equity',
  family_office: 'Family Office',
  corporate: 'Corporate VC',
  fund_of_funds: 'Fund of Funds',
};

export const CR_FUND_STATUS_LABELS: Record<CRFundStatus, string> = {
  active: 'Activo',
  raising: 'En levantamiento',
  deployed: 'Desplegado',
  closed: 'Cerrado',
  inactive: 'Inactivo',
};

export const CR_PERSON_ROLE_LABELS: Record<CRPersonRole, string> = {
  partner: 'Partner',
  managing_partner: 'Managing Partner',
  principal: 'Principal',
  director: 'Director',
  associate: 'Associate',
  analyst: 'Analyst',
  operating_partner: 'Operating Partner',
  advisor: 'Advisor',
  other: 'Otro',
};

export const CR_INVESTMENT_STAGE_LABELS: Record<CRInvestmentStage, string> = {
  seed: 'Seed',
  series_a: 'Serie A',
  series_b: 'Serie B',
  series_c: 'Serie C+',
  growth: 'Growth',
  buyout: 'Buyout',
  turnaround: 'Turnaround',
  special_situations: 'Special Situations',
};

export const CR_INVESTMENT_TYPE_LABELS: Record<CRInvestmentType, string> = {
  lead: 'Lead',
  co_invest: 'Co-inversión',
  follow_on: 'Follow-on',
};

export const CR_OWNERSHIP_TYPE_LABELS: Record<CROwnershipType, string> = {
  majority: 'Mayoritario',
  minority: 'Minoritario',
  growth: 'Growth',
  control: 'Control',
};

export const CR_PORTFOLIO_STATUS_LABELS: Record<CRPortfolioStatus, string> = {
  active: 'Activo',
  exited: 'Exit',
  write_off: 'Write-off',
  partial_exit: 'Exit parcial',
};

export const CR_EXIT_TYPE_LABELS: Record<CRExitType, string> = {
  trade_sale: 'Trade Sale',
  ipo: 'IPO',
  secondary: 'Secondary',
  recap: 'Recapitalización',
  write_off: 'Write-off',
  merger: 'Fusión',
  spac: 'SPAC',
};

export const CR_DEAL_TYPE_LABELS: Record<CRDealType, string> = {
  acquisition: 'Adquisición',
  add_on: 'Add-on',
  exit: 'Exit',
  recap: 'Recapitalización',
  follow_on: 'Follow-on',
  ipo: 'IPO',
  merger: 'Fusión',
};

export const CR_LP_TYPE_LABELS: Record<CRLPType, string> = {
  pension_fund: 'Fondo de Pensiones',
  sovereign_wealth: 'Fondo Soberano',
  endowment: 'Endowment',
  family_office: 'Family Office',
  fund_of_funds: 'Fund of Funds',
  insurance: 'Aseguradora',
  bank: 'Banco',
  corporate: 'Corporativo',
  other: 'Otro',
};

export const CR_MATCH_STATUS_LABELS: Record<CRMatchStatus, string> = {
  new: 'Nuevo',
  reviewed: 'Revisado',
  contacted: 'Contactado',
  interested: 'Interesado',
  not_fit: 'No encaja',
  won: 'Ganado',
  lost: 'Perdido',
};
