// ============================================================
// TIPOS PARA SECTOR DOSSIER - MVP
// ============================================================

/**
 * Request para generar un dossier de sector
 */
export interface SectorDossierRequest {
  sector: string;
  subsector?: string;
  leadId?: string; // Opcional: si viene del contexto de un lead
  leadType?: 'valuation' | 'contact' | 'collaborator';
  forceRegenerate?: boolean;
  depth?: 'basic' | 'detailed' | 'comprehensive';
  customFocus?: string;
}

/**
 * Perfil de un competidor en el sector
 */
export interface CompetitorProfile {
  name: string;
  sector: string;
  subsector?: string;
  valuationAmount: number;
  valuationCurrency: string;
  ebitdaMultiple?: number;
  revenueAmount?: number;
  year: number;
  dealType?: string;
  highlights?: string[];
}

/**
 * Múltiplos de valoración por sector
 */
export interface SectorMultiples {
  sectorName: string;
  revenueMultiple: { min: number; median: number; max: number };
  ebitdaMultiple: { min: number; median: number; max: number };
  netProfitMultiple: { min: number; median: number; max: number };
}

/**
 * Estadísticas de transacciones del sector
 */
export interface TransactionStats {
  totalDeals: number;
  totalValue: number;
  averageValuation: number;
  yearRange: string;
}

/**
 * Datos completos del dossier de sector
 */
export interface SectorDossierData {
  sector: string;
  subsector?: string;
  competitors: CompetitorProfile[];
  valuationMultiples: SectorMultiples[];
  transactionStats: TransactionStats;
  caseStudies?: any[];
}

/**
 * Reporte de dossier de sector almacenado en DB
 */
export interface SectorDossierReport {
  id: string;
  lead_id?: string;
  sector: string;
  subsector?: string;
  report_sector_dossier: string | null;
  generation_status: 'pending' | 'processing' | 'completed' | 'failed';
  tokens_used?: number;
  cost_usd?: number;
  processing_time_seconds?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

/**
 * Opciones de profundidad del análisis
 */
export type DossierDepth = 'basic' | 'detailed' | 'comprehensive';

/**
 * Configuración del dossier
 */
export interface DossierConfig {
  maxTokens: number;
  temperature: number;
  includeCompetitors: boolean;
  includeMultiples: boolean;
  includeCaseStudies: boolean;
}
