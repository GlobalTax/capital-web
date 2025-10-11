// ============= DASHBOARD TYPES =============
// Tipos consolidados para el sistema de dashboard

export interface BaseWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'alert';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
  permissions?: string[];
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: BaseWidget[];
  columns: number;
  isDefault?: boolean;
  isShared?: boolean;
  sharedWith?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
}

export interface AdvancedDashboardStats {
  // Business metrics
  totalRevenue: number;
  monthlyGrowth: number;
  avgDealSize: number;
  conversionRate: number;
  
  // Content metrics
  blogViewsThisMonth: number;
  topPerformingPosts: BlogPost[];
  contentEngagement: number;
  
  // System metrics
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  
  // Additional metrics
  totalLeads: number;
  activeUsers: number;
  serverLoad: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  views?: number;
  engagement_score?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BusinessMetrics {
  revenue_amount: number;
  deal_count: number;
  conversion_rate: number;
  avg_deal_size: number;
  period_start: string;
  period_end: string;
}

export interface ContentAnalytics {
  blog_post_id?: string;
  page_views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
  engagement_score: number;
  period_date: string;
}

export interface SystemMetrics {
  api_response_time: number;
  error_rate: number;
  uptime_percentage: number;
  active_users: number;
  server_load: number;
  recorded_at: string;
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

export interface ActivityFeedItem {
  id: string;
  type: 'lead_created' | 'alert_triggered' | 'workflow_executed' | 'form_submitted';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, string | number | boolean>;
}

// Chart data types
export interface ConversionChartData {
  stage: string;
  count: number;
}
