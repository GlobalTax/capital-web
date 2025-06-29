
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { 
  AdvancedDashboardStats, 
  DateRange, 
  BusinessMetrics, 
  ContentAnalytics, 
  SystemMetrics,
  BlogPost 
} from '@/types/dashboard';

export const fetchRevenueMetrics = async (dateRange: DateRange): Promise<BusinessMetrics[]> => {
  const { data, error } = await supabase
    .from('business_metrics')
    .select('*')
    .gte('period_start', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('period_end', format(dateRange.end, 'yyyy-MM-dd'))
    .order('period_start', { ascending: false });

  if (error) {
    console.error('Error fetching revenue metrics:', error);
    return [];
  }

  return data || [];
};

export const fetchContentMetrics = async (dateRange: DateRange): Promise<ContentAnalytics[]> => {
  const { data, error } = await supabase
    .from('content_analytics')
    .select('*')
    .gte('period_date', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('period_date', format(dateRange.end, 'yyyy-MM-dd'))
    .order('period_date', { ascending: false });

  if (error) {
    console.error('Error fetching content metrics:', error);
    return [];
  }

  return data || [];
};

export const fetchSystemMetrics = async (): Promise<SystemMetrics[]> => {
  const { data, error } = await supabase
    .from('system_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching system metrics:', error);
    return [];
  }

  return data || [];
};

export const fetchTopPerformingPosts = async (): Promise<BlogPost[]> => {
  const { data: contentData, error: contentError } = await supabase
    .from('content_analytics')
    .select(`
      blog_post_id,
      page_views,
      engagement_score,
      blog_posts (
        id,
        title,
        slug
      )
    `)
    .not('blog_post_id', 'is', null)
    .order('page_views', { ascending: false })
    .limit(5);

  if (contentError) {
    console.error('Error fetching top performing posts:', contentError);
    return [];
  }

  return contentData?.map(item => ({
    id: item.blog_post_id!,
    title: (item.blog_posts as any)?.title || 'Unknown',
    slug: (item.blog_posts as any)?.slug || '',
    views: item.page_views,
    engagement_score: item.engagement_score
  })) || [];
};

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

export const generateSampleMetrics = async () => {
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  // Generar métricas de negocio de ejemplo
  const { error: businessError } = await supabase
    .from('business_metrics')
    .upsert({
      revenue_amount: Math.floor(Math.random() * 100000) + 50000,
      deal_count: Math.floor(Math.random() * 20) + 5,
      conversion_rate: Math.random() * 20 + 5,
      avg_deal_size: Math.floor(Math.random() * 50000) + 10000,
      period_start: format(startDate, 'yyyy-MM-dd'),
      period_end: format(endDate, 'yyyy-MM-dd')
    });

  // Generar métricas de contenido de ejemplo
  const { error: contentError } = await supabase
    .from('content_analytics')
    .upsert({
      page_views: Math.floor(Math.random() * 1000) + 100,
      unique_visitors: Math.floor(Math.random() * 500) + 50,
      avg_time_on_page: Math.floor(Math.random() * 300) + 60,
      bounce_rate: Math.random() * 50 + 20,
      engagement_score: Math.random() * 100 + 50,
      period_date: format(currentDate, 'yyyy-MM-dd')
    });

  // Generar métricas del sistema de ejemplo
  const { error: systemError } = await supabase
    .from('system_metrics')
    .insert({
      api_response_time: Math.random() * 500 + 100,
      error_rate: Math.random() * 5,
      uptime_percentage: 99 + Math.random(),
      active_users: Math.floor(Math.random() * 100) + 10,
      server_load: Math.random() * 80 + 10
    });

  if (businessError) console.error('Error generating business metrics:', businessError);
  if (contentError) console.error('Error generating content metrics:', contentError);
  if (systemError) console.error('Error generating system metrics:', systemError);
};
