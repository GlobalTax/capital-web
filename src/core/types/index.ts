// ============= CORE TYPES =============
// Tipos centralizados para toda la aplicación

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
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
  user_id?: string | null;
  contact_name: string;
  company_name: string;
  cif?: string;
  email: string;
  phone?: string;
  phone_e164?: string;
  whatsapp_opt_in?: boolean;
  industry: string;
  employee_range: string;
  revenue?: number;
  ebitda?: number;
  final_valuation?: number;
  ebitda_multiple_used?: number;
  valuation_range_min?: number;
  valuation_range_max?: number;
  valuation_status?: string;
  current_step?: number;
  completion_percentage?: number;
  time_spent_seconds?: number;
  last_activity_at?: string;
  unique_token?: string;
  location?: string;
  ownership_participation?: string;
  competitive_advantage?: string;
  years_of_operation?: number;
  net_profit_margin?: number;
  growth_rate?: number;
  last_modified_field?: string;
  ip_address?: string | null;
  user_agent?: string;
  email_sent?: boolean;
  email_sent_at?: string;
  email_opened?: boolean;
  email_opened_at?: string;
  email_message_id?: string;
  hubspot_sent?: boolean;
  hubspot_sent_at?: string;
  whatsapp_sent?: boolean;
  whatsapp_sent_at?: string;
  v4_link_sent?: boolean;
  v4_link_sent_at?: string;
  v4_accessed?: boolean;
  v4_accessed_at?: string;
  v4_time_spent?: number;
  v4_scenarios_viewed?: any;
  v4_engagement_score?: number;
  recovery_link_sent?: boolean;
  recovery_link_sent_at?: string;
  abandonment_detected_at?: string;
  immediate_alert_sent?: boolean;
  immediate_alert_sent_at?: string;
  form_submitted_at?: string;
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