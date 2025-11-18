export interface Operation {
  id: string;
  company_name: string;
  sector: string;
  subsector?: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  ebitda_multiple?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  is_deleted: boolean;
  logo_url?: string;
  featured_image_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  status?: string;
  display_locations: string[];
  growth_percentage?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  assigned_to?: string | null;
  assigned_at?: string | null;
  assigned_by?: string | null;
  source_lead_id?: string | null;
  source_lead_type?: string | null;
}

export interface OperationsKPIs {
  totalOperations: number;
  totalValue: number;
  averageValue: number;
  averageTimeToClose: number;
  conversionRate: number;
  pipelineValue: number;
  winRateBySector: Record<string, number>;
  monthlyGrowth: number;
}

export interface SectorDistribution {
  sector: string;
  count: number;
  value: number;
  percentage: number;
}

export interface TemporalData {
  month: string;
  count: number;
  value: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  dropOffRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'created' | 'updated' | 'status_change' | 'featured';
  operation_id: string;
  operation_name: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export interface OperationsAnalytics {
  kpis: OperationsKPIs;
  sectorDistribution: SectorDistribution[];
  temporalData: TemporalData[];
  pipelineStages: PipelineStage[];
  recentActivity: RecentActivity[];
  topSectors: { sector: string; value: number; count: number }[];
}
