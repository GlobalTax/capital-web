// Specific types for dashboard data and analytics

export interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
  currency: string;
  type: 'deal' | 'recurring' | 'one_time';
}

export interface ContentDataPoint {
  date: string;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_time_on_page: number;
  conversion_rate: number;
}

export interface MetricDataPoint {
  period: string;
  value: number;
  change_percentage?: number;
  target?: number;
}

export interface LeadScoringMetrics {
  totalLeads: number;
  hotLeadsCount: number;
  averageScore: number;
  conversionRate: string;
  leadsByStatus: Record<string, number>;
  topSources: Array<{ domain: string; count: number }>;
}

export interface PerformanceMetrics {
  queryExecutionTime: number;
  cacheHitRate: number;
  rateLimitHits: number;
  errorRate: number;
  avgResponseTime: number;
}

export interface WorkflowTriggerData {
  lead_id: string;
  score: number;
  company_domain?: string;
  trigger_type: string;
  conditions_met: string[];
}

export interface ActivityFeedItem {
  id: string;
  type: 'lead_created' | 'alert_triggered' | 'workflow_executed' | 'form_submitted';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, string | number | boolean>;
}