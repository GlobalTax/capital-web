// ============= CONTACTS V2 TYPES =============
// Simplified type definitions for the new contacts system

export type ContactOrigin = 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';

export interface Contact {
  id: string;
  origin: ContactOrigin;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  lead_received_at?: string;
  status: string;
  
  // Source tracking
  source_project?: string;
  
  // Business data
  cif?: string;
  final_valuation?: number;
  ebitda?: number;
  revenue?: number;
  industry?: string;
  employee_range?: string;
  location?: string;
  company_size?: string;
  
  // Email tracking
  email_sent?: boolean;
  email_sent_at?: string;
  email_opened?: boolean;
  
  // Priority & scoring
  priority?: 'hot' | 'warm' | 'cold';
  is_hot_lead?: boolean;
  
  // CRM fields
  lead_status_crm?: string | null;
  assigned_to?: string;
  assigned_to_name?: string | null;
  
  // Recurrence
  valuation_count?: number;
  
  // Empresa vinculada
  empresa_id?: string;
  empresa_nombre?: string;
  empresa_facturacion?: number;
  
  // AI Classification
  ai_sector_pe?: string;
  ai_sector_name?: string;
  ai_tags?: string[];
  
  // Apollo
  apollo_status?: 'none' | 'running' | 'ok' | 'needs_review' | 'error';
  apollo_candidates?: any[];
  
  // Channel & Form
  acquisition_channel_id?: string;
  acquisition_channel_name?: string;
  lead_form?: string;
  lead_form_name?: string;
}

export interface ContactFilters {
  search?: string;
  origin?: ContactOrigin | 'all';
  status?: string;
  emailStatus?: 'all' | 'opened' | 'sent' | 'not_contacted';
  dateFrom?: string;
  dateTo?: string;
  dateRangeLabel?: string;
  revenueMin?: number;
  revenueMax?: number;
  ebitdaMin?: number;
  ebitdaMax?: number;
  acquisitionChannelId?: string;
  leadFormId?: string;
  showUniqueContacts?: boolean;
}

export interface ContactStats {
  total: number;
  uniqueContacts: number;
  hot: number;
  qualified: number;
  byOrigin: Record<ContactOrigin, number>;
  totalValuation: number;
}

export type TabType = 'favorites' | 'directory' | 'pipeline' | 'stats';
