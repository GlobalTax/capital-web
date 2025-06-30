
export interface ApolloCompany {
  id: string;
  company_domain: string;
  company_name: string;
  employee_count?: number;
  industry?: string;
  revenue_range?: string;
  location?: string;
  founded_year?: number;
  technologies?: string[];
  is_target_account: boolean;
  apollo_id?: string;
  last_enriched: string;
  created_at: string;
  updated_at: string;
}

export interface AdConversion {
  id: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  conversion_type: string;
  conversion_value: number;
  conversion_name?: string;
  visitor_id?: string;
  company_domain?: string;
  created_at: string;
}

export interface LinkedInIntelligence {
  id: string;
  company_domain: string;
  company_name: string;
  recent_hires: number;
  growth_signals: string[];
  decision_makers: any[];
  company_updates: string[];
  funding_signals: any;
  optimal_outreach_timing?: string;
  confidence_score: number;
  last_updated: string;
  created_at: string;
}

export interface AttributionTouchpoint {
  id: string;
  visitor_id: string;
  company_domain?: string;
  touchpoint_order: number;
  channel: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  page_path?: string;
  attribution_weight: number;
  conversion_value: number;
  timestamp: string;
  session_id?: string;
  created_at: string;
}

export interface IntegrationLog {
  id: string;
  integration_type: string;
  operation: string;
  company_domain?: string;
  status: 'pending' | 'success' | 'error';
  data_payload: any;
  error_message?: string;
  execution_time_ms?: number;
  created_at: string;
}

export interface IntegrationConfig {
  id: string;
  integration_name: string;
  is_active: boolean;
  config_data: any;
  last_sync?: string;
  sync_frequency_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationsMetrics {
  apolloEnrichments: number;
  adConversions: number;
  linkedinSignals: number;
  totalTouchpoints: number;
  successRate: number;
  avgEnrichmentTime: number;
}
