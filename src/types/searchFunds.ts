// =============================================
// TIPOS PARA EL MÓDULO SEARCH FUNDS
// =============================================

export type SFStatus = 'searching' | 'acquired' | 'holding' | 'exited' | 'inactive';
export type SFInvestmentStyle = 'single' | 'buy_and_build' | 'either';
export type SFPersonRole = 'searcher' | 'partner' | 'principal' | 'advisor';
export type SFBackerType = 'fund' | 'family_office' | 'angel' | 'bank' | 'accelerator' | 'other';
export type SFSupportType = 'search_capital' | 'acquisition_coinvest' | 'both' | 'unknown';
export type SFConfidenceLevel = 'low' | 'medium' | 'high';
export type SFDealType = 'majority' | 'minority' | 'merger' | 'asset' | 'unknown';
export type SFAcquisitionStatus = 'owned' | 'exited' | 'unknown';
export type SFMatchStatus = 'new' | 'reviewed' | 'contacted' | 'not_fit' | 'won';
export type SFOutreachChannel = 'email' | 'linkedin' | 'call' | 'whatsapp' | 'other';
export type SFOutreachStatus = 'draft' | 'sent' | 'replied' | 'bounced' | 'closed';
export type SFCrmEntityType = 'operation' | 'mandato';

export interface SFFund {
  id: string;
  name: string;
  website: string | null;
  country_base: string | null;
  cities: string[] | null;
  status: SFStatus;
  founded_year: number | null;
  description: string | null;
  geography_focus: string[] | null;
  sector_focus: string[] | null;
  sector_exclusions: string[] | null;
  deal_size_min: number | null;
  deal_size_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  investment_style: SFInvestmentStyle;
  notes_internal: string | null;
  source_url: string | null;
  source_last_verified_at: string | null;
  searcher_lead_id: string | null;
  portfolio_url: string | null;
  last_portfolio_scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SFPerson {
  id: string;
  fund_id: string;
  full_name: string;
  role: SFPersonRole;
  email: string | null;
  linkedin_url: string | null;
  phone: string | null;
  location: string | null;
  school: string | null;
  languages: string[] | null;
  is_primary_contact: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended person with fund relation
export interface SFPersonWithFund extends SFPerson {
  fund?: SFFund;
}

export interface SFBacker {
  id: string;
  name: string;
  type: SFBackerType;
  website: string | null;
  country: string | null;
  logo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SFFundBacker {
  id: string;
  fund_id: string;
  backer_id: string;
  support_type: SFSupportType;
  since_year: number | null;
  confidence_level: SFConfidenceLevel;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  backer?: SFBacker;
  fund?: SFFund;
}

export interface SFAcquisition {
  id: string;
  fund_id: string;
  company_name: string;
  country: string | null;
  region: string | null;
  sector: string | null;
  cnae: string | null;
  description: string | null;
  deal_year: number | null;
  deal_type: SFDealType;
  status: SFAcquisitionStatus;
  exit_year: number | null;
  source_url: string | null;
  website: string | null;
  fund_name: string | null;
  evidence: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SFMatchReasons {
  geography?: number;
  sector?: number;
  size?: number;
  evidence?: number;
  excluded?: boolean;
  exclusion_reason?: string;
  details?: string[];
}

export interface SFMatch {
  id: string;
  fund_id: string;
  crm_entity_type: SFCrmEntityType;
  crm_entity_id: string;
  match_score: number | null;
  match_reasons: SFMatchReasons;
  status: SFMatchStatus;
  owner_user_id: string | null;
  last_scored_at: string | null;
  created_at: string;
  updated_at: string;
  fund?: SFFund;
}

export interface SFOutreach {
  id: string;
  fund_id: string;
  crm_entity_type: SFCrmEntityType | null;
  crm_entity_id: string | null;
  person_id: string | null;
  channel: SFOutreachChannel;
  template_key: string | null;
  subject: string | null;
  message_preview: string | null;
  sent_at: string | null;
  status: SFOutreachStatus;
  notes: string | null;
  external_thread_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  person?: SFPerson;
}

// Extended types with relations
export interface SFFundWithRelations extends SFFund {
  people?: SFPerson[];
  acquisitions?: SFAcquisition[];
  fund_backers?: SFFundBacker[];
  matches?: SFMatch[];
  outreach?: SFOutreach[];
}

// Filter types
export interface SFFundFilters {
  search?: string;
  status?: SFStatus | 'all';
  country_base?: string;
  sector?: string;
  ebitda_min?: number;
  ebitda_max?: number;
  revenue_min?: number;
  revenue_max?: number;
}

export interface SFMatchFilters {
  status?: SFMatchStatus | 'all';
  min_score?: number;
  crm_entity_type?: SFCrmEntityType;
}

export interface SFPeopleFilters {
  search?: string;
  role?: SFPersonRole | 'all';
  country?: string;
  fund_id?: string;
}

// Form types
export type SFFundFormData = Omit<SFFund, 'id' | 'created_at' | 'updated_at'>;
export type SFPersonFormData = Omit<SFPerson, 'id' | 'created_at' | 'updated_at'>;
export type SFBackerFormData = Omit<SFBacker, 'id' | 'created_at' | 'updated_at'>;
export type SFAcquisitionFormData = Omit<SFAcquisition, 'id' | 'created_at' | 'updated_at'>;
export type SFOutreachFormData = Omit<SFOutreach, 'id' | 'created_at' | 'updated_at'>;
