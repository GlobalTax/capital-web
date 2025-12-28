/**
 * Types for Leads Pipeline CRM
 */

export type LeadStatus = 
  | 'nuevo'
  | 'contactando'
  | 'calificado'
  | 'propuesta_enviada'
  | 'negociacion'
  | 'en_espera'
  | 'ganado'
  | 'perdido'
  | 'archivado';

export interface LeadActivity {
  id: string;
  lead_id: string;
  lead_type: 'valuation' | 'contact' | 'collaborator' | 'acquisition';
  activity_type: ActivityType;
  description: string | null;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
}

export type ActivityType =
  | 'email_confirmation_sent'
  | 'email_opened'
  | 'email_precall_sent'
  | 'email_followup_sent'
  | 'call_attempted'
  | 'call_completed'
  | 'call_no_answer'
  | 'note_added'
  | 'status_changed'
  | 'assigned'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'document_uploaded'
  | 'created';

export interface PipelineLead {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string | null;
  industry: string;
  lead_status_crm: LeadStatus | null;
  final_valuation: number | null;
  revenue: number | null;
  ebitda: number | null;
  created_at: string;
  assigned_to: string | null;
  assigned_at: string | null;
  email_sent: boolean | null;
  email_opened: boolean | null;
  email_opened_at: string | null;
  precall_email_sent: boolean | null;
  precall_email_sent_at: string | null;
  followup_count: number | null;
  call_attempts_count: number | null;
  last_call_attempt_at: string | null;
  notes: string | null;
  valuation_range_min: number | null;
  valuation_range_max: number | null;
}

export interface PipelineColumn {
  id: LeadStatus;
  label: string;
  color: string;
  icon: string;
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'nuevo', label: 'Nuevos', color: 'bg-blue-500', icon: '📥' },
  { id: 'contactando', label: 'Contactando', color: 'bg-yellow-500', icon: '📞' },
  { id: 'calificado', label: 'Calificados', color: 'bg-green-500', icon: '✅' },
  { id: 'propuesta_enviada', label: 'Propuesta Enviada', color: 'bg-purple-500', icon: '📄' },
  { id: 'negociacion', label: 'Negociación', color: 'bg-orange-500', icon: '🤝' },
  { id: 'en_espera', label: 'En Espera', color: 'bg-gray-500', icon: '⏸️' },
  { id: 'ganado', label: 'Ganados', color: 'bg-emerald-600', icon: '🏆' },
  { id: 'perdido', label: 'Perdidos', color: 'bg-red-500', icon: '❌' },
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  email_confirmation_sent: 'Email de confirmación enviado',
  email_opened: 'Email abierto',
  email_precall_sent: 'Email pre-llamada enviado',
  email_followup_sent: 'Email de seguimiento enviado',
  call_attempted: 'Llamada intentada',
  call_completed: 'Llamada completada',
  call_no_answer: 'Llamada sin respuesta',
  note_added: 'Nota añadida',
  status_changed: 'Estado cambiado',
  assigned: 'Lead asignado',
  meeting_scheduled: 'Reunión programada',
  proposal_sent: 'Propuesta enviada',
  document_uploaded: 'Documento subido',
  created: 'Lead creado',
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  email_confirmation_sent: '📧',
  email_opened: '👁️',
  email_precall_sent: '📨',
  email_followup_sent: '📤',
  call_attempted: '📱',
  call_completed: '✅',
  call_no_answer: '📵',
  note_added: '📝',
  status_changed: '🔄',
  assigned: '👤',
  meeting_scheduled: '📅',
  proposal_sent: '📋',
  document_uploaded: '📎',
  created: '🆕',
};
