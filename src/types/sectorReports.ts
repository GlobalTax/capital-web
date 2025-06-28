
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
  };
}

export interface SectorData {
  multiples?: any[];
  caseStudies?: any[];
  statistics?: any[];
}
