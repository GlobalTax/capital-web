
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

export const fetchHistoricalRevenueMetrics = async (): Promise<BusinessMetrics[]> => {
  const endDate = new Date();
  const startDate = subMonths(startDate, 6);
  
  const { data, error } = await supabase
    .from('business_metrics')
    .select('*')
    .gte('period_start', format(startDate, 'yyyy-MM-dd'))
    .lte('period_end', format(endDate, 'yyyy-MM-dd'))
    .order('period_start', { ascending: true });

  if (error) {
    console.error('Error fetching historical revenue metrics:', error);
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

export const fetchHistoricalContentMetrics = async (): Promise<ContentAnalytics[]> => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 6);
  
  const { data, error } = await supabase
    .from('content_analytics')
    .select('*')
    .gte('period_date', format(startDate, 'yyyy-MM-dd'))
    .lte('period_date', format(endDate, 'yyyy-MM-dd'))
    .order('period_date', { ascending: true });

  if (error) {
    console.error('Error fetching historical content metrics:', error);
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
  
  // Generar datos históricos para los últimos 6 meses
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(currentDate, i));
    const monthEnd = endOfMonth(subMonths(currentDate, i));
    months.push({ start: monthStart, end: monthEnd });
  }

  // Generar métricas de negocio históricas
  for (const month of months) {
    const baseRevenue = 50000 + Math.random() * 50000;
    const dealCount = Math.floor(Math.random() * 15) + 5;
    
    const { error: businessError } = await supabase
      .from('business_metrics')
      .upsert({
        revenue_amount: baseRevenue,
        deal_count: dealCount,
        conversion_rate: Math.random() * 15 + 10,
        avg_deal_size: baseRevenue / dealCount,
        period_start: format(month.start, 'yyyy-MM-dd'),
        period_end: format(month.end, 'yyyy-MM-dd')
      });

    if (businessError) {
      console.error('Error generating business metrics:', businessError);
    }
  }

  // Generar métricas de contenido históricas
  for (const month of months) {
    const daysInMonth = month.end.getDate();
    for (let day = 1; day <= Math.min(daysInMonth, 5); day++) {
      const date = new Date(month.start.getFullYear(), month.start.getMonth(), day);
      
      const { error: contentError } = await supabase
        .from('content_analytics')
        .upsert({
          page_views: Math.floor(Math.random() * 800) + 200,
          unique_visitors: Math.floor(Math.random() * 400) + 100,
          avg_time_on_page: Math.floor(Math.random() * 240) + 120,
          bounce_rate: Math.random() * 40 + 30,
          engagement_score: Math.random() * 80 + 40,
          period_date: format(date, 'yyyy-MM-dd')
        });

      if (contentError) {
        console.error('Error generating content metrics:', contentError);
      }
    }
  }

  // Generar métricas del sistema
  const { error: systemError } = await supabase
    .from('system_metrics')
    .insert({
      api_response_time: Math.random() * 400 + 150,
      error_rate: Math.random() * 3,
      uptime_percentage: 99.5 + Math.random() * 0.4,
      active_users: Math.floor(Math.random() * 80) + 20,
      server_load: Math.random() * 70 + 20
    });

  if (systemError) {
    console.error('Error generating system metrics:', systemError);
  }
};
