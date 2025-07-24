// ============= CORE TYPES =============
// Tipos centralizados para toda la aplicación

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface MarketingMetrics {
  totalVisitors: number;
  identifiedCompanies: number;
  totalLeads: number;
  qualifiedLeads: number;
  leadConversionRate: number;
  averageLeadScore: number;
  totalRevenue: number;
  contentMetrics: ContentMetrics;
  leadScoring: LeadScoringMetrics;
}

export interface ContentMetrics {
  totalViews: number;
  totalPosts: number;
  averageReadingTime: number;
  topContent: string[];
}

export interface LeadScoringMetrics {
  hotLeads: number;
  mediumLeads: number;
  coldLeads: number;
  totalEvents: number;
  conversionRate: number;
}

export interface ContactLead extends BaseEntity {
  full_name: string;
  company: string;
  email: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  company_size?: string;
  country?: string;
}

export interface LeadScore extends BaseEntity {
  visitor_id: string;
  company_domain?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  total_score: number;
  visit_count: number;
  last_activity: string;
  is_hot_lead: boolean;
  lead_status: 'active' | 'inactive' | 'converted';
}

export interface CompanyValuation extends BaseEntity {
  contact_name: string;
  company_name: string;
  email: string;
  revenue?: number;
  final_valuation?: number;
  industry: string;
  employee_range: string;
}

export interface BlogAnalytics extends BaseEntity {
  post_id: string;
  post_slug: string;
  visitor_id?: string;
  session_id?: string;
  viewed_at: string;
  reading_time?: number;
  scroll_percentage?: number;
}

export interface LeadBehaviorEvent extends BaseEntity {
  visitor_id?: string;
  session_id: string;
  event_type: string;
  page_path?: string;
  company_domain?: string;
  points_awarded: number;
  event_data?: Record<string, any>;
}