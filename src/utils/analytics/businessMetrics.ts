
import { subMonths, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { DateRange, BusinessMetrics } from '@/types/dashboard';

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
  const startDate = subMonths(endDate, 6);
  
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
