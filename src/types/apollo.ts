// ============= APOLLO API TYPES =============
// Types for Apollo.io enrichment data

export type ApolloStatus = 'none' | 'running' | 'ok' | 'needs_review' | 'error';

// Generic email domains to exclude from domain-based enrichment
export const GENERIC_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'yahoo.es',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'msn.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'gmx.es',
];

// Apollo Organization data (summarized for storage)
export interface ApolloOrgData {
  id: string;
  name: string;
  primary_domain?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  website_url?: string;
  logo_url?: string;
  industry?: string;
  industries?: string[];
  estimated_num_employees?: number;
  annual_revenue?: number;
  annual_revenue_printed?: string;
  city?: string;
  state?: string;
  country?: string;
  short_description?: string;
  founded_year?: number;
  keywords?: string[];
  phone?: string;
  technology_names?: string[];
  suborganizations?: string[];
  raw_address?: string;
  seo_description?: string;
}

// Apollo Person data for decision makers
export interface ApolloPerson {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  title?: string;
  seniority?: string;
  linkedin_url?: string;
  email?: string;
  email_status?: string;
  phone_numbers?: string[];
  city?: string;
  country?: string;
  organization?: {
    id: string;
    name: string;
  };
}

// Apollo candidate for needs_review status
export interface ApolloCandidate {
  id: string;
  name: string;
  primary_domain?: string;
  logo_url?: string;
  industry?: string;
  estimated_num_employees?: number;
  city?: string;
  country?: string;
  linkedin_url?: string;
  short_description?: string;
}

// Enrichment request/response types
export interface EnrichLeadRequest {
  lead_id: string;
}

export interface EnrichLeadResponse {
  success: boolean;
  status: ApolloStatus;
  message?: string;
  candidates?: ApolloCandidate[];
  org_data?: ApolloOrgData;
  people_data?: ApolloPerson[];
}

export interface ConfirmMatchRequest {
  lead_id: string;
  apollo_org_id: string;
}

export interface ConfirmMatchResponse {
  success: boolean;
  status: ApolloStatus;
  message?: string;
  org_data?: ApolloOrgData;
  people_data?: ApolloPerson[];
}

// Utility function to check if email domain is generic
export const isGenericEmailDomain = (domain: string): boolean => {
  return GENERIC_EMAIL_DOMAINS.includes(domain.toLowerCase());
};

// Utility function to extract domain from email
export const extractEmailDomain = (email: string): string | null => {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  return isGenericEmailDomain(domain) ? null : domain;
};
