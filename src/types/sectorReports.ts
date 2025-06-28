
export interface SectorReportRequest {
  sector: string;
  reportType: 'market-analysis' | 'ma-trends' | 'valuation-multiples' | 'due-diligence';
  period: 'quarter' | 'year' | '3-years' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  depth: 'basic' | 'intermediate' | 'advanced';
  includeData: {
    multiples: boolean;
    caseStudies: boolean;
    statistics: boolean;
  };
  targetAudience: 'investors' | 'entrepreneurs' | 'advisors' | 'executives';
  customFocus?: string;
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
  };
  metadata: {
    includeData: SectorReportRequest['includeData'];
    period: string;
    depth: string;
    estimatedReadTime?: number;
    confidence?: number;
    dataQuality?: 'high' | 'medium' | 'low';
  };
}

export interface SectorData {
  multiples?: any[];
  caseStudies?: any[];
  statistics?: any[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<SectorReportRequest>;
  category: 'quick' | 'investor' | 'strategic' | 'specialized';
  estimatedTime: string;
  targetWords: string;
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
}
