// =============================================
// TIPOS: Sistema de Valoración Profesional
// Valoraciones Pro - Intranet Capittal
// =============================================

/**
 * Datos financieros de un año fiscal
 */
export interface FinancialYear {
  year: number;
  revenue: number;       // Facturación
  ebitda: number;        // EBITDA reportado
  netProfit: number;     // Resultado neto
  employees?: number;    // Empleados (opcional)
}

/**
 * Ajuste de normalización del EBITDA
 */
export interface NormalizationAdjustment {
  id: string;
  concept: string;
  amount: number;
  type: 'add' | 'subtract';
  description?: string;
}

/**
 * Conceptos predefinidos de normalización
 */
export const NORMALIZATION_CONCEPTS = [
  { id: 'owner_salary', label: 'Salario propietario no de mercado', defaultType: 'add' as const },
  { id: 'related_rent', label: 'Alquiler a partes relacionadas', defaultType: 'add' as const },
  { id: 'personal_expenses', label: 'Gastos personales imputados', defaultType: 'add' as const },
  { id: 'extraordinary_income', label: 'Ingresos extraordinarios', defaultType: 'subtract' as const },
  { id: 'extraordinary_expenses', label: 'Gastos extraordinarios', defaultType: 'add' as const },
  { id: 'accelerated_depreciation', label: 'Amortización acelerada', defaultType: 'add' as const },
  { id: 'non_recurring_legal', label: 'Costes legales no recurrentes', defaultType: 'add' as const },
  { id: 'one_time_consulting', label: 'Consultoría puntual', defaultType: 'add' as const },
  { id: 'covid_adjustments', label: 'Ajustes COVID-19', defaultType: 'add' as const },
  { id: 'family_salaries', label: 'Salarios familiares no de mercado', defaultType: 'add' as const },
  { id: 'other', label: 'Otro ajuste', defaultType: 'add' as const },
] as const;

/**
 * Sectores disponibles para valoración
 */
export const VALUATION_SECTORS = [
  'Alimentación & Distribución',
  'Logística & Transporte (3PL)',
  'Seguridad / PCI (servicios)',
  'IT Services / MSP',
  'Salud (servicios)',
  'Industriales / Servicios técnicos',
  'Energía / Servicios energéticos',
  'Telecom fijo / FTTH',
  'Retail & Comercio',
  'Construcción & Inmobiliario',
  'Educación & Formación',
  'Hostelería & Turismo',
  'Servicios Profesionales',
  'Manufactura',
  'Agricultura & Agroalimentario',
  'Otro',
] as const;

export type ValuationSector = typeof VALUATION_SECTORS[number];

/**
 * Celda de la matriz de sensibilidad
 */
export interface SensitivityCell {
  ebitdaVariation: number;  // -10%, 0%, +10%
  multiple: number;
  valuation: number;
}

/**
 * Matriz de sensibilidad completa
 */
export interface SensitivityMatrix {
  rows: {
    label: string;
    ebitdaFactor: number;
    cells: SensitivityCell[];
  }[];
  multiples: number[];
}

/**
 * Estado del formulario de valoración
 */
export type ValuationStatus = 'draft' | 'generated' | 'sent' | 'viewed';

/**
 * Datos completos de una valoración profesional
 */
export interface ProfessionalValuationData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Asesor
  createdBy?: string;
  advisorName?: string;
  advisorEmail?: string;
  
  // Cliente
  clientName: string;
  clientCompany: string;
  clientCif?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientLogoUrl?: string;
  
  // Sector
  sector: ValuationSector | string;
  sectorDescription?: string;
  
  // Financieros
  financialYears: FinancialYear[];
  normalizationAdjustments: NormalizationAdjustment[];
  reportedEbitda?: number;
  normalizedEbitda?: number;
  
  // Múltiplos
  ebitdaMultipleLow?: number;
  ebitdaMultipleHigh?: number;
  ebitdaMultipleUsed?: number;
  multipleJustification?: string;
  
  // Resultados
  valuationLow?: number;
  valuationHigh?: number;
  valuationCentral?: number;
  
  // Sensibilidad
  sensitivityMatrix?: SensitivityMatrix;
  
  // Contexto
  valuationContext?: string;
  strengths?: string;
  weaknesses?: string;
  internalNotes?: string;
  
  // PDF y estado
  pdfUrl?: string;
  status: ValuationStatus;
  
  // Email
  sentAt?: string;
  sentTo?: string;
  emailSubject?: string;
  emailOpened?: boolean;
  emailOpenedAt?: string;
  
  // Versionado
  version?: number;
  parentId?: string;
  
  // Vinculación
  linkedLeadId?: string;
  linkedLeadType?: string;
  linkedOperationId?: string;
}

/**
 * Datos para crear una nueva valoración
 */
export type CreateProfessionalValuationData = Omit<
  ProfessionalValuationData,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy'
>;

/**
 * Paso del formulario de valoración
 */
export interface ValuationFormStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

/**
 * Props para el formulario de valoración
 */
export interface ProfessionalValuationFormProps {
  initialData?: Partial<ProfessionalValuationData>;
  onSave?: (data: ProfessionalValuationData) => void;
  onGeneratePdf?: (data: ProfessionalValuationData) => void;
  onSendEmail?: (data: ProfessionalValuationData, email: string) => void;
}

/**
 * Resultado del cálculo de valoración
 */
export interface ValuationCalculationResult {
  normalizedEbitda: number;
  multipleLow: number;
  multipleHigh: number;
  multipleUsed: number;
  valuationLow: number;
  valuationHigh: number;
  valuationCentral: number;
  sensitivityMatrix: SensitivityMatrix;
}

export type { ValuationCalculationResult as ValuationResult };

/**
 * Convertir datos de la base de datos a tipo TypeScript
 */
export function mapDbToProfessionalValuation(dbRow: any): ProfessionalValuationData {
  return {
    id: dbRow.id,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
    createdBy: dbRow.created_by,
    advisorName: dbRow.advisor_name,
    advisorEmail: dbRow.advisor_email,
    clientName: dbRow.client_name,
    clientCompany: dbRow.client_company,
    clientCif: dbRow.client_cif,
    clientEmail: dbRow.client_email,
    clientPhone: dbRow.client_phone,
    clientLogoUrl: dbRow.client_logo_url,
    sector: dbRow.sector,
    sectorDescription: dbRow.sector_description,
    financialYears: dbRow.financial_years || [],
    normalizationAdjustments: dbRow.normalization_adjustments || [],
    reportedEbitda: dbRow.reported_ebitda,
    normalizedEbitda: dbRow.normalized_ebitda,
    ebitdaMultipleLow: dbRow.ebitda_multiple_low,
    ebitdaMultipleHigh: dbRow.ebitda_multiple_high,
    ebitdaMultipleUsed: dbRow.ebitda_multiple_used,
    multipleJustification: dbRow.multiple_justification,
    valuationLow: dbRow.valuation_low,
    valuationHigh: dbRow.valuation_high,
    valuationCentral: dbRow.valuation_central,
    sensitivityMatrix: dbRow.sensitivity_matrix,
    valuationContext: dbRow.valuation_context,
    strengths: dbRow.strengths,
    weaknesses: dbRow.weaknesses,
    internalNotes: dbRow.internal_notes,
    pdfUrl: dbRow.pdf_url,
    status: dbRow.status || 'draft',
    sentAt: dbRow.sent_at,
    sentTo: dbRow.sent_to,
    emailSubject: dbRow.email_subject,
    emailOpened: dbRow.email_opened,
    emailOpenedAt: dbRow.email_opened_at,
    version: dbRow.version,
    parentId: dbRow.parent_id,
    linkedLeadId: dbRow.linked_lead_id,
    linkedLeadType: dbRow.linked_lead_type,
    linkedOperationId: dbRow.linked_operation_id,
  };
}

/**
 * Convertir datos TypeScript a formato de base de datos
 */
export function mapProfessionalValuationToDb(data: Partial<ProfessionalValuationData>): Record<string, any> {
  const mapped: Record<string, any> = {
    advisor_name: data.advisorName,
    advisor_email: data.advisorEmail,
    client_name: data.clientName,
    client_company: data.clientCompany,
    client_cif: data.clientCif,
    client_email: data.clientEmail,
    client_phone: data.clientPhone,
    client_logo_url: data.clientLogoUrl,
    sector: data.sector,
    sector_description: data.sectorDescription,
    financial_years: data.financialYears,
    normalization_adjustments: data.normalizationAdjustments,
    reported_ebitda: data.reportedEbitda,
    normalized_ebitda: data.normalizedEbitda,
    ebitda_multiple_low: data.ebitdaMultipleLow,
    ebitda_multiple_high: data.ebitdaMultipleHigh,
    ebitda_multiple_used: data.ebitdaMultipleUsed,
    multiple_justification: data.multipleJustification,
    valuation_low: data.valuationLow,
    valuation_high: data.valuationHigh,
    valuation_central: data.valuationCentral,
    sensitivity_matrix: data.sensitivityMatrix,
    valuation_context: data.valuationContext,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    internal_notes: data.internalNotes,
    pdf_url: data.pdfUrl,
    status: data.status,
    sent_at: data.sentAt,
    sent_to: data.sentTo,
    email_subject: data.emailSubject,
    email_opened: data.emailOpened,
    email_opened_at: data.emailOpenedAt,
    version: data.version,
    parent_id: data.parentId,
    linked_lead_id: data.linkedLeadId,
    linked_lead_type: data.linkedLeadType,
    linked_operation_id: data.linkedOperationId,
  };

  // Filtrar campos undefined para evitar errores de inserción en la BD
  return Object.fromEntries(
    Object.entries(mapped).filter(([_, value]) => value !== undefined)
  );
}
