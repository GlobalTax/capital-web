
export interface SectorReportRequest {
  sector: string;
  reportType: 'market-analysis' | 'ma-trends' | 'valuation-multiples' | 'due-diligence' | 'esg-sustainability' | 'tech-disruption' | 'geographic-comparison';
  period: 'quarter' | 'year' | '3-years' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  depth: 'basic' | 'intermediate' | 'advanced';
  includeData: {
    multiples: boolean;
    caseStudies: boolean;
    statistics: boolean;
    visualizations: boolean;
    infographics: boolean;
    heatmaps: boolean;
  };
  targetAudience: 'investors' | 'entrepreneurs' | 'advisors' | 'executives';
  customFocus?: string;
  geography?: string[];
  templateId?: string;
  visualization?: {
    includeCharts: boolean;
    chartTypes: string[];
    includeInfographics: boolean;
    includeHeatmaps: boolean;
  };
}

export interface SectorReportResult {
  id: string;
  title: string;
  content: string;
  sector: string;
  reportType: string;
  generatedAt: Date;
  wordCount: number;
  sections: {
    executiveSummary: string;
    marketAnalysis: string;
    opportunities: string;
    conclusions: string;
    methodology?: string;
    appendix?: string;
  };
  metadata: {
    includeData: SectorReportRequest['includeData'];
    period: string;
    depth: string;
    estimatedReadTime?: number;
    confidence?: number;
    dataQuality?: 'high' | 'medium' | 'low';
    geography?: string[];
    templateUsed?: string;
  };
  visualizations?: {
    charts: ChartData[];
    infographics: InfographicData[];
    heatmaps: HeatmapData[];
  };
  collaboration?: {
    comments: Comment[];
    versions: ReportVersion[];
    sharedWith: SharedPermission[];
  };
}

export interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  data: any[];
  config: any;
}

export interface InfographicData {
  id: string;
  title: string;
  elements: InfographicElement[];
}

export interface InfographicElement {
  type: 'stat' | 'icon' | 'text' | 'chart';
  content: any;
  position: { x: number; y: number };
  style: any;
}

export interface HeatmapData {
  id: string;
  title: string;
  data: { sector: string; region: string; activity: number; value: number }[];
  config: any;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  section?: string;
  resolved: boolean;
}

export interface ReportVersion {
  id: string;
  version: number;
  title: string;
  createdAt: Date;
  createdBy: string;
  changes: string;
  content: string;
}

export interface SharedPermission {
  userId: string;
  email: string;
  permission: 'view' | 'comment' | 'edit';
  sharedAt: Date;
}

export interface SectorData {
  multiples?: any[];
  caseStudies?: any[];
  statistics?: any[];
  marketData?: any[];
  esgData?: any[];
  techTrends?: any[];
  geographicData?: any[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<SectorReportRequest>;
  category: 'quick' | 'investor' | 'strategic' | 'specialized' | 'esg' | 'tech' | 'geographic';
  estimatedTime: string;
  targetWords: string;
  audience: string[];
  features: string[];
  premium?: boolean;
}

export interface SmartTemplate extends ReportTemplate {
  intelligentSuggestions: {
    sectors: string[];
    audiences: string[];
    commonCombinations: Partial<SectorReportRequest>[];
  };
  adaptiveConfig: {
    sectorSpecificFocus: Record<string, string>;
    audienceOptimization: Record<string, Partial<SectorReportRequest>>;
  };
}

export interface ReportAnalytics {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  totalWords: number;
  averageWords: number;
  popularSectors: { sector: string; count: number }[];
  popularTypes: { type: string; count: number }[];
  timeDistribution: { hour: number; count: number }[];
  templateUsage: { templateId: string; count: number }[];
  collaborationStats: {
    sharedReports: number;
    totalComments: number;
    averageVersions: number;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'word' | 'powerpoint' | 'web' | 'markdown';
  style: 'corporate' | 'modern' | 'classic' | 'minimal';
  branding: {
    logo?: string;
    colors: string[];
    fonts: string[];
  };
  includeVisualizations: boolean;
  interactive: boolean;
}
