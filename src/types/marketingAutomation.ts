
export interface EmailSequence {
  id: string;
  name: string;
  trigger_type: string;
  trigger_conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  subject: string;
  content: string;
  email_template: string;
  include_attachment: boolean;
  attachment_type?: string;
  is_active: boolean;
}

export interface FormABTest {
  id: string;
  test_name: string;
  page_path: string;
  variant_a_config: Record<string, any>;
  variant_b_config: Record<string, any>;
  traffic_split: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  winner_variant?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active: boolean;
  execution_count: number;
  last_executed?: string;
}

export interface ABTestResults {
  variantA: {
    views: number;
    conversions: number;
    rate: number;
  };
  variantB: {
    views: number;
    conversions: number;
    rate: number;
  };
}
