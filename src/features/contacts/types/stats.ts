// ============= CONTACTS STATS TYPES =============
// Definiciones de tipos para el panel de estadísticas con costes

export interface ContactStatsMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  uniqueLeads: number;
  totalCost: number;
  cpl: number;              // Coste por Lead
  cplQualified: number;     // Coste por Lead Calificado
  cplUnique: number;        // Coste por Lead Único
  cacEstimated: number;     // CAC estimado
  cplVariation: number;     // Variación vs periodo anterior (%)
  previousPeriodLeads: number;
  previousPeriodCost: number;
}

export interface ChannelMetrics {
  channel: string;
  channelLabel: string;
  leads: number;
  cost: number;
  cpl: number;
  qualifiedLeads: number;
  cplQualified: number;
  avgEbitda: number;
  avgRevenue: number;
  highEbitdaLeads: number;
  costPerHighEbitdaLead: number;
}

export interface FunnelStage {
  stage: string;
  stageLabel: string;
  count: number;
  accumulatedCost: number;
  costPerStage: number;
  conversionRate: number;
  color: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  dateLabel: string;
  leads: number;
  cost: number;
  cpl: number;
  qualifiedLeads: number;
}

export interface QualityMetric {
  channel: string;
  channelLabel: string;
  avgEbitda: number;
  avgRevenue: number;
  highValueLeads: number;
  highValuePercentage: number;
  costPerHighValueLead: number;
  qualityScore: number; // 0-100
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'recommendation';
  title: string;
  description: string;
  metric?: string;
  change?: number;
  priority: number;
}

export interface StatsFilters {
  dateFrom: string;
  dateTo: string;
  periodLabel?: string;
  channels?: string[];
  showCosts: boolean;
  compareWithPrevious: boolean;
}

export interface CostConfig {
  channel: string;
  dailyCost?: number;
  monthlyCost?: number;
  startDate?: string;
  endDate?: string;
  source?: string;
}

export type PeriodGranularity = 'daily' | 'weekly' | 'monthly';
