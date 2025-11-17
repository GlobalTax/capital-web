import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOperationLocations = () => {
  return useQuery({
    queryKey: ['operation-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_operations')
        .select('display_locations')
        .eq('is_active', true)
        .not('display_locations', 'is', null);

      if (error) throw error;

      // Extract unique locations from all operations
      const allLocations = data
        ?.flatMap(op => op.display_locations || [])
        .filter(Boolean);
      
      const uniqueLocations = [...new Set(allLocations)].sort();
      
      return uniqueLocations;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
