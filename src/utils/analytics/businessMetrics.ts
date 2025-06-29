
import { subMonths, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { DateRange, BusinessMetrics } from '@/types/dashboard';

export const fetchRevenueMetrics = async (dateRange: DateRange, sectors?: string[]): Promise<BusinessMetrics[]> => {
  let query = supabase
    .from('business_metrics')
    .select('*')
    .gte('period_start', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('period_end', format(dateRange.end, 'yyyy-MM-dd'))
    .order('period_start', { ascending: false });

  // Nota: business_metrics no tiene campo sector directo, 
  // se podría extender la tabla o filtrar por otro criterio
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching revenue metrics:', error);
    return [];
  }

  return data || [];
};

export const fetchHistoricalRevenueMetrics = async (sectors?: string[]): Promise<BusinessMetrics[]> => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 6);
  
  let query = supabase
    .from('business_metrics')
    .select('*')
    .gte('period_start', format(startDate, 'yyyy-MM-dd'))
    .lte('period_end', format(endDate, 'yyyy-MM-dd'))
    .order('period_start', { ascending: true });

  // Aplicar filtro de sectores si se proporciona
  // Nota: requeriría relación con tablas que tengan sector
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching historical revenue metrics:', error);
    return [];
  }

  return data || [];
};
