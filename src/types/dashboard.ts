
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  views?: number;
  engagement_score?: number;
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
