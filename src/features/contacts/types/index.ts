// ============= CONTACTS TYPES =============
// Definiciones de tipos para gestión de contactos

export type ContactOrigin = 
  | 'valuations' 
  | 'contact_leads' 
  | 'collaborator_applications'
  | 'newsletter_subscriptions';

export type ContactStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'converted' 
  | 'lost';

export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Contact {
  id: string;
  origin: ContactOrigin;
  email: string;
  name?: string;
  company_name?: string;
  phone?: string;
  status: ContactStatus;
  priority?: ContactPriority;
  score?: number;
  created_at: string;
  updated_at?: string;
  last_contact_at?: string;
  notes?: string;
  tags?: string[];
  
  // Campos específicos de valoraciones
  industry?: string;
  employee_range?: string;
  revenue?: number;
  ebitda?: number;
  
  // Campos específicos de colaboradores
  specialization?: string;
  experience?: string;
  
  // Metadata
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ContactsFilters {
  search?: string;
  origin?: ContactOrigin;
  status?: ContactStatus;
  priority?: ContactPriority;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface ContactUpdate {
  status?: ContactStatus;
  priority?: ContactPriority;
  notes?: string;
  tags?: string[];
  last_contact_at?: string;
}

export interface ContactStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
}

export interface ContactAction {
  id: string;
  contact_id: string;
  action_type: 'email' | 'call' | 'meeting' | 'note';
  description: string;
  created_at: string;
  created_by: string;
}
