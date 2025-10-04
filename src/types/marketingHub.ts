
export interface MarketingMetrics {
  // Traffic Intelligence
  totalVisitors: number;
  companyVisitors: number;
  identifiedCompanies: number;
  
  // Lead Generation
  totalLeads: number;
  qualifiedLeads: number;
  leadConversionRate: number;
  
  // Content Performance
  downloadCount: number;
  topPerformingContent: string[];
  contentToLeadRate: number;
  totalBlogPosts: number;
  publishedPosts: number;
  averageReadingTime: number;
  totalViews: number;
  totalRevenue: number;
  
  // Email Marketing
  emailOpenRate: number;
  emailClickRate: number;
  sequenceCompletionRate: number;
}

export interface ContentPerformance {
  id: string;
  title: string;
  type: 'blog' | 'lead_magnet' | 'case_study' | 'whitepaper';
  views: number;
  downloads: number;
  leads_generated: number;
  conversion_rate: number;
  engagement_score: number;
}

export interface LeadScoringAnalytics {
  scoreDistribution: {
    cold: number; // 0-40
    warm: number; // 41-70
    hot: number; // 71-100
  };
  averageScoreByIndustry: Record<string, number>;
  scoringTrends: {
    date: string;
    average_score: number;
    hot_leads: number;
  }[];
}

export interface EmailMarketingMetrics {
  campaigns: {
    id: string;
    name: string;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
    roi: number;
  }[];
  sequences: {
    id: string;
    name: string;
    total_enrolled: number;
    completed: number;
    completion_rate: number;
    avg_open_rate: number;
    avg_click_rate: number;
  }[];
}

export interface ROIAnalytics {
  totalInvestment: number;
  totalRevenue: number;
  overallROI: number;
  channelROI: {
    channel: string;
    investment: number;
    revenue: number;
    roi: number;
    leads: number;
    cost_per_lead: number;
  }[];
  monthlyROI: {
    month: string;
    investment: number;
    revenue: number;
    roi: number;
  }[];
}
