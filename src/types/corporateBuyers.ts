// =============================================
// CORPORATE BUYERS MODULE - Type Definitions
// =============================================

import type { Json } from '@/integrations/supabase/types';

// Buyer types
export type CorporateBuyerType = 
  | 'corporate' 
  | 'family_office' 
  | 'pe_fund' 
  | 'strategic_buyer' 
  | 'holding';

// Contact roles
export type CorporateContactRole = 
  | 'm_and_a' 
  | 'cxo' 
  | 'owner' 
  | 'business_dev' 
  | 'director' 
  | 'partner' 
  | 'other';

// Main buyer interface
export interface CorporateBuyer {
  id: string;
  name: string;
  website: string | null;
  country_base: string | null;
  cities: string[] | null;
  buyer_type: CorporateBuyerType | null;
  description: string | null;
  investment_thesis: string | null;
  search_keywords: string[] | null;
  sector_focus: string[] | null;
  sector_exclusions: string[] | null;
  geography_focus: string[] | null;
  revenue_min: number | null;
  revenue_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  deal_size_min: number | null;
  deal_size_max: number | null;
  source_url: string | null;
  notes_internal: string | null;
  key_highlights: string[] | null;
  is_active: boolean;
  is_deleted: boolean;
  is_reviewed: boolean;
  created_at: string;
  updated_at: string;
}

// Contact interface
export interface CorporateContact {
  id: string;
  buyer_id: string;
  full_name: string;
  role: CorporateContactRole | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  is_primary_contact: boolean;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  buyer?: CorporateBuyer;
}

// Favorite interface
export interface CorporateFavorite {
  id: string;
  entity_type: 'buyer' | 'contact';
  entity_id: string;
  added_by: string | null;
  created_at: string;
}

// Form data types
export interface CorporateBuyerFormData {
  name: string;
  website?: string;
  country_base?: string;
  cities?: string[];
  buyer_type?: CorporateBuyerType;
  description?: string;
  investment_thesis?: string;
  search_keywords?: string[];
  sector_focus?: string[];
  sector_exclusions?: string[];
  geography_focus?: string[];
  revenue_min?: number;
  revenue_max?: number;
  ebitda_min?: number;
  ebitda_max?: number;
  deal_size_min?: number;
  deal_size_max?: number;
  source_url?: string;
  notes_internal?: string;
  key_highlights?: string[];
  is_active?: boolean;
  enriched_data?: Json;
}

export interface CorporateContactFormData {
  buyer_id: string;
  full_name: string;
  role?: CorporateContactRole;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  is_primary_contact?: boolean;
  notes?: string;
}

// UI Labels
export const BUYER_TYPE_LABELS: Record<CorporateBuyerType, string> = {
  corporate: 'Corporativo',
  family_office: 'Family Office',
  pe_fund: 'Fondo PE',
  strategic_buyer: 'Estratégico',
  holding: 'Holding',
};

export const BUYER_TYPE_COLORS: Record<CorporateBuyerType, string> = {
  corporate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  family_office: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  pe_fund: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  strategic_buyer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  holding: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
};

export const CONTACT_ROLE_LABELS: Record<CorporateContactRole, string> = {
  m_and_a: 'M&A',
  cxo: 'C-Level',
  owner: 'Propietario',
  business_dev: 'Business Dev',
  director: 'Director',
  partner: 'Socio',
  other: 'Otro',
};

// Filter types
export interface CorporateBuyersFilters {
  search?: string;
  buyer_type?: CorporateBuyerType;
  country?: string;
  sector?: string;
  onlyFavorites?: boolean;
}
