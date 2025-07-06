
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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

  // System metrics generation disabled after cleanup
  console.log('System metrics generation disabled after cleanup');
};
