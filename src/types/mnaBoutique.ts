// ============= MNA BOUTIQUES TYPES =============

// Status types
export type MNABoutiqueStatus = 'active' | 'inactive' | 'acquired' | 'closed';
export type MNABoutiqueTier = 'tier_1' | 'tier_2' | 'tier_3' | 'regional' | 'specialist';
export type MNASpecialization = 'sell_side' | 'buy_side' | 'capital_raise' | 'due_diligence' | 'valuation' | 'restructuring' | 'debt_advisory';
export type MNAPersonRole = 'partner' | 'managing_director' | 'director' | 'vp' | 'associate' | 'analyst' | 'other';
export type MNADealType = 'sell_side' | 'buy_side' | 'capital_raise' | 'due_diligence' | 'valuation' | 'restructuring' | 'other';
export type MNARoleInDeal = 'advisor_seller' | 'advisor_buyer' | 'lead_advisor' | 'co_advisor' | 'valuation' | 'dd_provider';

// Main boutique interface
export interface MNABoutique {
  id: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  country_base: string | null;
  cities: string[];
  founded_year: number | null;
  employee_count: number | null;
  employee_count_source: string | null;
  description: string | null;
  specialization: string[];
  sector_focus: string[];
  geography_focus: string[];
  deal_size_min: number | null;
  deal_size_max: number | null;
  status: MNABoutiqueStatus;
  tier: MNABoutiqueTier | null;
  notes_internal: string | null;
  source_url: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  people?: MNABoutiquePerson[];
  deals?: MNABoutiqueDeal[];
  people_count?: number;
  deals_count?: number;
}

// Person associated with a boutique
export interface MNABoutiquePerson {
  id: string;
  boutique_id: string;
  full_name: string;
  role: MNAPersonRole | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  phone: string | null;
  location: string | null;
  sector_expertise: string[];
  is_primary_contact: boolean;
  notes: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  boutique?: MNABoutique;
}

// Deal/Track record
export interface MNABoutiqueDeal {
  id: string;
  boutique_id: string;
  company_name: string;
  deal_type: MNADealType | null;
  deal_year: number | null;
  deal_value: number | null;
  deal_value_currency: string;
  sector: string | null;
  country: string | null;
  acquirer_name: string | null;
  role_in_deal: MNARoleInDeal | null;
  description: string | null;
  source_url: string | null;
  notes: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  boutique?: MNABoutique;
}

// Filters
export interface MNABoutiqueFilters {
  search?: string;
  status?: MNABoutiqueStatus;
  tier?: MNABoutiqueTier;
  country?: string;
  specialization?: string;
  showDeleted?: boolean;
}

export interface MNABoutiquePeopleFilters {
  search?: string;
  boutique_id?: string;
  role?: MNAPersonRole;
  showDeleted?: boolean;
}

export interface MNABoutiqueDealFilters {
  search?: string;
  boutique_id?: string;
  deal_type?: MNADealType;
  year?: number;
  showDeleted?: boolean;
}

// Labels for UI
export const MNA_BOUTIQUE_STATUS_LABELS: Record<MNABoutiqueStatus, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  acquired: 'Adquirida',
  closed: 'Cerrada',
};

export const MNA_TIER_LABELS: Record<MNABoutiqueTier, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
  regional: 'Regional',
  specialist: 'Especialista',
};

export const MNA_SPECIALIZATION_LABELS: Record<MNASpecialization, string> = {
  sell_side: 'Sell-Side',
  buy_side: 'Buy-Side',
  capital_raise: 'Capital Raise',
  due_diligence: 'Due Diligence',
  valuation: 'Valoración',
  restructuring: 'Reestructuración',
  debt_advisory: 'Deuda',
};

export const MNA_PERSON_ROLE_LABELS: Record<MNAPersonRole, string> = {
  partner: 'Partner',
  managing_director: 'Managing Director',
  director: 'Director',
  vp: 'VP',
  associate: 'Associate',
  analyst: 'Analyst',
  other: 'Otro',
};

export const MNA_DEAL_TYPE_LABELS: Record<MNADealType, string> = {
  sell_side: 'Sell-Side',
  buy_side: 'Buy-Side',
  capital_raise: 'Capital Raise',
  due_diligence: 'Due Diligence',
  valuation: 'Valoración',
  restructuring: 'Reestructuración',
  other: 'Otro',
};

export const MNA_ROLE_IN_DEAL_LABELS: Record<MNARoleInDeal, string> = {
  advisor_seller: 'Asesor Vendedor',
  advisor_buyer: 'Asesor Comprador',
  lead_advisor: 'Lead Advisor',
  co_advisor: 'Co-Advisor',
  valuation: 'Valoración',
  dd_provider: 'Due Diligence',
};

// Form types
export interface MNABoutiqueFormData {
  name: string;
  website?: string;
  linkedin_url?: string;
  country_base?: string;
  cities?: string[];
  founded_year?: number;
  employee_count?: number;
  employee_count_source?: string;
  description?: string;
  specialization?: string[];
  sector_focus?: string[];
  geography_focus?: string[];
  deal_size_min?: number;
  deal_size_max?: number;
  status?: MNABoutiqueStatus;
  tier?: MNABoutiqueTier;
  notes_internal?: string;
}

export interface MNABoutiquePersonFormData {
  boutique_id: string;
  full_name: string;
  role?: MNAPersonRole;
  title?: string;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  location?: string;
  sector_expertise?: string[];
  is_primary_contact?: boolean;
  notes?: string;
}

export interface MNABoutiqueDealFormData {
  boutique_id: string;
  company_name: string;
  deal_type?: MNADealType;
  deal_year?: number;
  deal_value?: number;
  deal_value_currency?: string;
  sector?: string;
  country?: string;
  acquirer_name?: string;
  role_in_deal?: MNARoleInDeal;
  description?: string;
  source_url?: string;
  notes?: string;
}
