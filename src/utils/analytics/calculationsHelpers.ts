
import type { 
  AdvancedDashboardStats, 
  BusinessMetrics, 
  ContentAnalytics, 
  SystemMetrics 
} from '@/types/dashboard';

export const calculateAdvancedMetrics = (
  revenueData: BusinessMetrics[],
  contentData: ContentAnalytics[],
  systemData: SystemMetrics[]
): AdvancedDashboardStats => {
  // Calculate business metrics
  const currentRevenue = revenueData[0]?.revenue_amount || 0;
  const previousRevenue = revenueData[1]?.revenue_amount || 0;
  const monthlyGrowth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;

  const avgDealSize = revenueData[0]?.avg_deal_size || 0;
  const conversionRate = revenueData[0]?.conversion_rate || 0;

  // Calculate content metrics
  const totalViews = contentData.reduce((sum, item) => sum + item.page_views, 0);
  const avgEngagement = contentData.length > 0 
    ? contentData.reduce((sum, item) => sum + item.engagement_score, 0) / contentData.length
    : 0;

  // Calculate system metrics
  const latestSystemMetrics = systemData[0];
  const apiResponseTime = latestSystemMetrics?.api_response_time || 0;
  const errorRate = latestSystemMetrics?.error_rate || 0;
  const uptime = latestSystemMetrics?.uptime_percentage || 100;
  const activeUsers = latestSystemMetrics?.active_users || 0;
  const serverLoad = latestSystemMetrics?.server_load || 0;

  return {
    totalRevenue: currentRevenue,
    monthlyGrowth,
    avgDealSize,
    conversionRate,
    blogViewsThisMonth: totalViews,
    topPerformingPosts: [], // Se llenará por separado
    contentEngagement: avgEngagement,
    apiResponseTime,
    errorRate,
    uptime,
    totalLeads: 0, // Se calculará desde contact_leads
    activeUsers,
    serverLoad
  };
};
