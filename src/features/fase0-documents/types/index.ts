// =====================================================
// FASE 0 DOCUMENTS - Types
// NDA Advisor-Cliente + Propuestas de Mandato
// =====================================================

export type Fase0DocumentType = 'nda' | 'mandato_venta' | 'mandato_compra';
export type Fase0DocumentStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired' | 'cancelled';
export type Fase0LeadType = 'contact' | 'valuation' | 'company_valuation';

// Sección de un template
export interface Fase0TemplateSection {
  id: string;
  title: string;
  content: string;
}

// Estructura de honorarios para mandatos
export interface Fase0FeeStructure {
  retainer_default?: number;
  success_fee_default?: number;
  min_fee_default?: number;
}

// Template de documento
export interface Fase0DocumentTemplate {
  id: string;
  document_type: Fase0DocumentType;
  name: string;
  version: string;
  sections: Fase0TemplateSection[];
  available_variables: string[];
  fee_structure: Fase0FeeStructure | null;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Datos para rellenar el documento
export interface Fase0FilledData {
  // Datos del cliente
  cliente_nombre?: string;
  cliente_empresa?: string;
  cliente_cif?: string;
  cliente_direccion?: string;
  cliente_cargo?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  
  // Datos del advisor
  advisor_nombre?: string;
  advisor_cargo?: string;
  advisor_experiencia?: string;
  
  // Datos del documento
  ciudad?: string;
  fecha_documento?: string;
  numero_referencia?: string;
  tipo_operacion?: string;
  duracion_años?: string;
  
  // Datos de valoración/sector
  sector?: string;
  valoracion_min?: string;
  valoracion_max?: string;
  inversion_min?: string;
  inversion_max?: string;
  
  // Datos de honorarios
  retainer?: string;
  success_fee_pct?: string;
  honorario_minimo?: string;
  duracion_mandato?: string;
  fecha_validez?: string;
  
  // Campos adicionales dinámicos
  [key: string]: string | undefined;
}

// Documento generado
export interface Fase0Document {
  id: string;
  template_id: string | null;
  document_type: Fase0DocumentType;
  lead_id: string;
  lead_type: Fase0LeadType;
  reference_number: string;
  filled_data: Fase0FilledData;
  status: Fase0DocumentStatus;
  pdf_url: string | null;
  pdf_storage_path: string | null;
  valid_until: string | null;
  sent_at: string | null;
  sent_to_email: string | null;
  sent_by: string | null;
  viewed_at: string | null;
  view_count: number;
  signed_at: string | null;
  signature_data: Record<string, unknown> | null;
  signed_by_name: string | null;
  signed_by_ip: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Para crear un documento
export interface CreateFase0DocumentInput {
  template_id?: string;
  document_type: Fase0DocumentType;
  lead_id: string;
  lead_type: Fase0LeadType;
  filled_data: Fase0FilledData;
  valid_until?: string;
  notes?: string;
}

// Para actualizar un template
export interface UpdateFase0TemplateInput {
  name?: string;
  version?: string;
  sections?: Fase0TemplateSection[];
  available_variables?: string[];
  fee_structure?: Fase0FeeStructure;
  description?: string;
  is_active?: boolean;
}

// Labels para UI
export const FASE0_DOCUMENT_TYPE_LABELS: Record<Fase0DocumentType, string> = {
  nda: 'NDA Advisor-Cliente',
  mandato_venta: 'Propuesta Mandato - Venta',
  mandato_compra: 'Propuesta Mandato - Compra',
};

export const FASE0_STATUS_LABELS: Record<Fase0DocumentStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviado',
  viewed: 'Visto',
  signed: 'Firmado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

export const FASE0_STATUS_COLORS: Record<Fase0DocumentStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  signed: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

// Variables disponibles por tipo de documento
export const FASE0_VARIABLES_BY_TYPE: Record<Fase0DocumentType, string[]> = {
  nda: [
    'cliente_nombre',
    'cliente_empresa', 
    'cliente_cif',
    'cliente_direccion',
    'cliente_cargo',
    'advisor_nombre',
    'advisor_cargo',
    'ciudad',
    'fecha_documento',
    'tipo_operacion',
    'duracion_años',
  ],
  mandato_venta: [
    'cliente_nombre',
    'cliente_empresa',
    'cliente_cif',
    'cliente_cargo',
    'sector',
    'valoracion_min',
    'valoracion_max',
    'retainer',
    'success_fee_pct',
    'honorario_minimo',
    'duracion_mandato',
    'fecha_validez',
    'advisor_nombre',
    'advisor_cargo',
    'advisor_experiencia',
    'fecha_documento',
    'numero_referencia',
  ],
  mandato_compra: [
    'cliente_nombre',
    'cliente_empresa',
    'cliente_cif',
    'cliente_cargo',
    'sector',
    'inversion_min',
    'inversion_max',
    'retainer',
    'success_fee_pct',
    'honorario_minimo',
    'duracion_mandato',
    'fecha_validez',
    'advisor_nombre',
    'advisor_cargo',
    'advisor_experiencia',
    'fecha_documento',
    'numero_referencia',
  ],
};

// Labels para variables
export const FASE0_VARIABLE_LABELS: Record<string, string> = {
  cliente_nombre: 'Nombre del cliente',
  cliente_empresa: 'Empresa del cliente',
  cliente_cif: 'CIF del cliente',
  cliente_direccion: 'Dirección del cliente',
  cliente_cargo: 'Cargo del cliente',
  cliente_email: 'Email del cliente',
  cliente_telefono: 'Teléfono del cliente',
  advisor_nombre: 'Nombre del advisor',
  advisor_cargo: 'Cargo del advisor',
  advisor_experiencia: 'Experiencia del advisor',
  ciudad: 'Ciudad',
  fecha_documento: 'Fecha del documento',
  numero_referencia: 'Número de referencia',
  tipo_operacion: 'Tipo de operación',
  duracion_años: 'Duración (años)',
  sector: 'Sector',
  valoracion_min: 'Valoración mínima',
  valoracion_max: 'Valoración máxima',
  inversion_min: 'Inversión mínima',
  inversion_max: 'Inversión máxima',
  retainer: 'Retainer (€)',
  success_fee_pct: 'Success Fee (%)',
  honorario_minimo: 'Honorario mínimo (€)',
  duracion_mandato: 'Duración mandato (meses)',
  fecha_validez: 'Fecha de validez',
};
