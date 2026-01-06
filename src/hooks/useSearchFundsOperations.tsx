import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFundOperation {
  id: string;
  company_name: string;
  sector: string;
  subsector: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  geographic_location: string | null;
  project_status: string | null;
  short_description: string | null;
  is_featured: boolean | null;
}

interface UseSearchFundsOperationsResult {
  operations: SearchFundOperation[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch operations that match Search Fund criteria:
 * - Revenue: €1M - €20M
 * - EBITDA: €100K - €3M
 * - Deal type: sale
 * - Status: active
 */
export const useSearchFundsOperations = (limit: number = 4): UseSearchFundsOperationsResult => {
  const { data: operations = [], isLoading, error } = useQuery({
    queryKey: ['searchFundsOperations', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_operations')
        .select(`
          id,
          company_name,
          sector,
          subsector,
          revenue_amount,
          ebitda_amount,
          geographic_location,
          project_status,
          short_description,
          is_featured
        `)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .eq('deal_type', 'sale')
        .gte('revenue_amount', 1000000)
        .lte('revenue_amount', 20000000)
        .gte('ebitda_amount', 100000)
        .lte('ebitda_amount', 3000000)
        .order('is_featured', { ascending: false })
        .order('ebitda_amount', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SearchFundOperation[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    operations,
    isLoading,
    error: error as Error | null,
  };
};
