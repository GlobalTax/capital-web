
import { format, subMonths, startOfMonth } from 'date-fns';
import type { BusinessMetrics, ContentAnalytics } from '@/types/dashboard';

export interface ChartDataPoint {
  month: string;
  revenue: number;
  deals: number;
  views: number;
  engagement: number;
}

export interface LeadSourceData {
  source: string;
  value: number;
  color: string;
}

export interface SectorPerformanceData {
  sector: string;
  revenue: number;
  deals: number;
}

export const transformRevenueDataForChart = (
  businessMetrics: BusinessMetrics[]
): ChartDataPoint[] => {
  // Generar datos para los últimos 6 meses si no hay datos suficientes
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(startOfMonth(new Date()), i);
    months.push({
      month: format(date, 'MMM yyyy'),
      revenue: 0,
      deals: 0,
      views: 0,
      engagement: 0
    });
  }

  // Mapear datos reales si existen
  businessMetrics.forEach(metric => {
    const monthKey = format(new Date(metric.period_start), 'MMM yyyy');
    const monthIndex = months.findIndex(m => m.month === monthKey);
    if (monthIndex !== -1) {
      months[monthIndex].revenue = Number(metric.revenue_amount);
      months[monthIndex].deals = metric.deal_count;
    }
  });

  return months;
};

export const transformContentDataForChart = (
  contentMetrics: ContentAnalytics[],
  chartData: ChartDataPoint[]
): ChartDataPoint[] => {
  return chartData.map(point => {
    const monthMetrics = contentMetrics.filter(metric => {
      const metricMonth = format(new Date(metric.period_date), 'MMM yyyy');
      return metricMonth === point.month;
    });

    const totalViews = monthMetrics.reduce((sum, metric) => sum + metric.page_views, 0);
    const avgEngagement = monthMetrics.length > 0 
      ? monthMetrics.reduce((sum, metric) => sum + metric.engagement_score, 0) / monthMetrics.length
      : 0;

    return {
      ...point,
      views: totalViews,
      engagement: Math.round(avgEngagement)
    };
  });
};

export const generateLeadSourceData = (): LeadSourceData[] => {
  return [
    { source: 'Web Orgánico', value: 45, color: '#3b82f6' },
    { source: 'Referencias', value: 25, color: '#10b981' },
    { source: 'LinkedIn', value: 15, color: '#f59e0b' },
    { source: 'Email Marketing', value: 10, color: '#ef4444' },
    { source: 'Otros', value: 5, color: '#8b5cf6' }
  ];
};

export const generateSectorPerformanceData = (): SectorPerformanceData[] => {
  return [
    { sector: 'Tecnología', revenue: 120000, deals: 8 },
    { sector: 'Industrial', revenue: 95000, deals: 6 },
    { sector: 'Healthcare', revenue: 80000, deals: 5 },
    { sector: 'Inmobiliario', revenue: 75000, deals: 4 },
    { sector: 'Retail', revenue: 60000, deals: 3 }
  ];
};
