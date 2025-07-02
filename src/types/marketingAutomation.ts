
import { DatabaseJson } from './common';

// Base types for better type safety
export type TriggerType = 'lead_score_threshold' | 'page_visit' | 'form_submission' | 'time_based' | 'manual';

export type EmailTemplate = 'default' | 'welcome' | 'nurture' | 'follow_up' | 'promotion';

export type AttachmentType = 'pdf' | 'image' | 'document' | 'valuation_report';

export type WorkflowActionType = 'send_email' | 'update_lead_score' | 'add_to_sequence' | 'notify_team' | 'create_task';

// Trigger condition interfaces for type safety
export interface LeadScoreTriggerCondition {
  type: 'lead_score_threshold';
  threshold: number;
  operator: '>=' | '>' | '<=' | '<' | '==';
}

export interface PageVisitTriggerCondition {
  type: 'page_visit';
  page_path: string;
  visit_count?: number;
  time_on_page?: number;
}

export interface FormSubmissionTriggerCondition {
  type: 'form_submission';
  form_type: string;
  field_conditions?: Record<string, string | number | boolean>;
}

export interface TimeBasedTriggerCondition {
  type: 'time_based';
  delay_minutes: number;
  after_event?: string;
}

export interface ManualTriggerCondition {
  type: 'manual';
  requires_approval?: boolean;
}

export type TriggerCondition = 
  | LeadScoreTriggerCondition 
  | PageVisitTriggerCondition 
  | FormSubmissionTriggerCondition 
  | TimeBasedTriggerCondition 
  | ManualTriggerCondition;

// Workflow action types
export interface SendEmailAction {
  type: 'send_email';
  template: EmailTemplate;
  subject: string;
  content: string;
  delay_hours?: number;
}

export interface UpdateLeadScoreAction {
  type: 'update_lead_score';
  points: number;
  reason: string;
}

export interface AddToSequenceAction {
  type: 'add_to_sequence';
  sequence_id: string;
  delay_hours?: number;
}

export interface NotifyTeamAction {
  type: 'notify_team';
  message: string;
  priority: 'low' | 'medium' | 'high';
  recipients: string[];
}

export interface CreateTaskAction {
  type: 'create_task';
  title: string;
  description: string;
  assigned_to?: string;
  due_date?: string;
}

export type WorkflowAction = 
  | SendEmailAction 
  | UpdateLeadScoreAction 
  | AddToSequenceAction 
  | NotifyTeamAction 
  | CreateTaskAction;

// A/B Test variant configuration
export interface FormVariantConfig {
  title: string;
  description: string;
  fields: Array<{
    name: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
    label: string;
    required: boolean;
    options?: string[];
  }>;
  submit_button_text: string;
  styling: {
    primary_color: string;
    background_color: string;
    text_color: string;
  };
}

// Main interfaces compatible with Supabase JSON types
export interface EmailSequence {
  id: string;
  name: string;
  trigger_type: string; // Will be TriggerType but stored as string in DB
  trigger_conditions: DatabaseJson; // Will be TriggerCondition serialized
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
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
  variant_a_config: DatabaseJson; // Will be FormVariantConfig serialized
  variant_b_config: DatabaseJson; // Will be FormVariantConfig serialized
  traffic_split: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  winner_variant?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_conditions: DatabaseJson; // Will be TriggerCondition serialized
  actions: DatabaseJson; // Will be WorkflowAction[] serialized
  is_active: boolean;
  execution_count: number;
  last_executed?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
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

// Type guard functions for runtime type checking with proper type assertion
export function isTriggerCondition(value: any): value is TriggerCondition {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export function isWorkflowAction(value: any): value is WorkflowAction {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export function isFormVariantConfig(value: any): value is FormVariantConfig {
  return typeof value === 'object' && value !== null && 'title' in value && 'fields' in value;
}

// Type conversion utilities for safe casting from database JSON
export function parseTriggerCondition(json: DatabaseJson): TriggerCondition | null {
  try {
    if (isTriggerCondition(json)) {
      return json as TriggerCondition;
    }
    return null;
  } catch {
    return null;
  }
}

export function parseWorkflowActions(json: DatabaseJson): WorkflowAction[] | null {
  try {
    if (Array.isArray(json)) {
      const validActions: WorkflowAction[] = [];
      for (const item of json) {
        if (isWorkflowAction(item)) {
          validActions.push(item as WorkflowAction);
        } else {
          return null; // If any item is invalid, return null
        }
      }
      return validActions;
    }
    return null;
  } catch {
    return null;
  }
}

export function parseFormVariantConfig(json: DatabaseJson): FormVariantConfig | null {
  try {
    if (isFormVariantConfig(json)) {
      return json as FormVariantConfig;
    }
    return null;
  } catch {
    return null;
  }
}

// Typed interfaces for components that need strongly typed data
export interface TypedEmailSequence extends Omit<EmailSequence, 'trigger_conditions' | 'trigger_type'> {
  trigger_type: TriggerType;
  trigger_conditions: TriggerCondition;
}

export interface TypedAutomationWorkflow extends Omit<AutomationWorkflow, 'trigger_conditions' | 'actions'> {
  trigger_conditions: TriggerCondition;
  actions: WorkflowAction[];
}

export interface TypedFormABTest extends Omit<FormABTest, 'variant_a_config' | 'variant_b_config'> {
  variant_a_config: FormVariantConfig;
  variant_b_config: FormVariantConfig;
}

// Email scheduling types
export interface ScheduledEmail {
  id: string;
  lead_score_id: string;
  sequence_id: string;
  step_id: string;
  recipient_email: string;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  created_at: string;
}
