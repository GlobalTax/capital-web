// ============= CALCULATOR ERRORS HOOK =============
// Hook para obtener errores de calculadora con filtros y estadísticas

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export type ErrorType = 'calculation' | 'submission' | 'validation' | 'network' | 'unknown';
export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface CalculatorErrorFilters {
  dateRange: DateRange;
  errorType: 'all' | ErrorType;
}

export interface CalculatorError {
  id: string;
  error_type: ErrorType;
  error_message: string;
  error_stack: string | null;
  component: string | null;
  action: string | null;
  company_data: {
    email?: string;
    contact_name?: string;
    company_name?: string;
    [key: string]: unknown;
  } | null;
  current_step: number | null;
  unique_token: string | null;
  source_project: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface CalculatorErrorStats {
  total: number;
  byType: Record<ErrorType, number>;
  lastError: string | null;
}

const getDateFromRange = (range: DateRange): Date | null => {
  switch (range) {
    case '7d':
      return subDays(new Date(), 7);
    case '30d':
      return subDays(new Date(), 30);
    case '90d':
      return subDays(new Date(), 90);
    case 'all':
    default:
      return null;
  }
};

export const useCalculatorErrors = (filters: CalculatorErrorFilters) => {
  const { dateRange, errorType } = filters;

  const query = useQuery({
    queryKey: ['calculator-errors', dateRange, errorType],
    queryFn: async (): Promise<{ data: CalculatorError[]; stats: CalculatorErrorStats }> => {
      let queryBuilder = supabase
        .from('calculator_errors')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date filter
      const dateFrom = getDateFromRange(dateRange);
      if (dateFrom) {
        queryBuilder = queryBuilder.gte('created_at', dateFrom.toISOString());
      }

      // Apply error type filter
      if (errorType !== 'all') {
        queryBuilder = queryBuilder.eq('error_type', errorType);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Calculate stats from ALL data (for the period, regardless of type filter)
      let statsQuery = supabase
        .from('calculator_errors')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateFrom) {
        statsQuery = statsQuery.gte('created_at', dateFrom.toISOString());
      }

      const { data: allData, error: statsError } = await statsQuery;
      if (statsError) throw statsError;

      const byType: Record<ErrorType, number> = {
        calculation: 0,
        submission: 0,
        validation: 0,
        network: 0,
        unknown: 0,
      };

      (allData || []).forEach((item) => {
        const type = item.error_type as ErrorType;
        if (byType[type] !== undefined) {
          byType[type]++;
        }
      });

      const stats: CalculatorErrorStats = {
        total: allData?.length || 0,
        byType,
        lastError: allData?.[0]?.created_at || null,
      };

      return {
        data: (data || []) as CalculatorError[],
        stats,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data || [],
    stats: query.data?.stats || { total: 0, byType: { calculation: 0, submission: 0, validation: 0, network: 0, unknown: 0 }, lastError: null },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
