import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OperationsStats {
  activeOperations: number;
  averageValuation: number;
  uniqueSectors: number;
}

export const useOperationsStats = () => {
  return useQuery({
    queryKey: ['operations-stats'],
    queryFn: async (): Promise<OperationsStats> => {
      // Get active operations count and average valuation
      const { data: operations, error: operationsError } = await supabase
        .from('company_operations')
        .select('valuation_amount, sector')
        .eq('is_active', true);

      if (operationsError) {
        console.error('Error fetching operations stats:', operationsError);
        throw operationsError;
      }

      const activeOperations = operations?.length || 0;
      
      // Calculate average valuation
      const validValuations = operations?.filter(op => op.valuation_amount && op.valuation_amount > 0) || [];
      const averageValuation = validValuations.length > 0 
        ? validValuations.reduce((sum, op) => sum + (op.valuation_amount || 0), 0) / validValuations.length
        : 0;

      // Count unique sectors
      const uniqueSectors = new Set(operations?.map(op => op.sector).filter(Boolean)).size;

      return {
        activeOperations,
        averageValuation,
        uniqueSectors
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};