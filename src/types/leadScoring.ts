
export interface LeadScoringRule {
  id: string;
  name: string;
  trigger_type: string;
  page_pattern?: string;
  points: number;
  description: string;
  is_active: boolean;
  decay_days?: number;
  industry_specific?: string[];
  company_size_filter?: string[];
  created_at: string;
  updated_at: string;
}

export interface LeadBehaviorEvent {
  id: string;
  session_id: string;
  visitor_id: string;
  company_domain?: string;
  event_type: string;
  page_path?: string;
  event_data: Record<string, unknown>;
  points_awarded: number;
  rule_id?: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
}

export interface LeadScore {
  id: string;
  visitor_id: string;
  company_domain?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  total_score: number;
  hot_lead_threshold: number;
  is_hot_lead: boolean;
  last_activity: string;
  first_visit: string;
  visit_count: number;
  email?: string;
  phone?: string;
  contact_name?: string;
  lead_status: string;
  assigned_to?: string;
  notes?: string;
  crm_synced: boolean;
  crm_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadAlert {
  id: string;
  lead_score_id: string;
  alert_type: string;
  threshold_reached?: number;
  message: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  lead_score?: LeadScore;
}

export interface ScheduledEmail {
  id: string;
  lead_score_id: string;
  sequence_id: string;
  step_id: string;
  recipient_email: string;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  error_message?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  lead_score_id: string;
  trigger_data: Record<string, unknown>;
  execution_status: 'pending' | 'running' | 'completed' | 'failed';
  actions_completed: number;
  total_actions: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
