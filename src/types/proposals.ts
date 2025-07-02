export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';

export type ServiceType = 
  | 'venta_empresas' 
  | 'due_diligence' 
  | 'valoraciones' 
  | 'asesoramiento_legal' 
  | 'planificacion_fiscal' 
  | 'reestructuraciones';

export interface FeeTemplate {
  id: string;
  name: string;
  service_type: ServiceType;
  description?: string;
  base_fee_percentage: number;
  minimum_fee: number;
  success_fee_percentage: number;
  template_sections: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeProposal {
  id: string;
  proposal_number: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  service_type: ServiceType;
  template_id?: string;
  transaction_value?: number;
  estimated_fee?: number;
  base_fee_percentage: number;
  success_fee_percentage: number;
  minimum_fee: number;
  proposal_title: string;
  proposal_content: any;
  sections: any;
  terms_and_conditions?: string;
  status: ProposalStatus;
  valid_until?: string;
  unique_url?: string;
  contact_lead_id?: string;
  company_valuation_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  viewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface ProposalSection {
  id: string;
  name: string;
  service_type?: ServiceType;
  content_template?: string;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  section_type: string;
  created_at: string;
}

export interface ProposalActivity {
  id: string;
  proposal_id: string;
  activity_type: string;
  ip_address?: string;
  user_agent?: string;
  activity_data: any;
  created_at: string;
}

export interface CreateProposalData {
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  service_type: ServiceType;
  template_id?: string;
  transaction_value?: number;
  proposal_title: string;
  base_fee_percentage?: number;
  success_fee_percentage?: number;
  minimum_fee?: number;
  valid_until?: string;
  contact_lead_id?: string;
  company_valuation_id?: string;
}

export interface ProposalStats {
  total_proposals: number;
  sent_proposals: number;
  viewed_proposals: number;
  approved_proposals: number;
  total_value: number;
  conversion_rate: number;
  avg_response_time: number;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  venta_empresas: 'Venta de Empresas',
  due_diligence: 'Due Diligence',
  valoraciones: 'Valoraciones',
  asesoramiento_legal: 'Asesoramiento Legal',
  planificacion_fiscal: 'Planificación Fiscal',
  reestructuraciones: 'Reestructuraciones'
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  viewed: 'Vista',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  expired: 'Expirada'
};