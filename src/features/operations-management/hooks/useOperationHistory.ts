import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OperationHistoryEntry } from '../types/history';

export const useOperationHistory = (operationId: string) => {
  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: ['operation-history', operationId],
    queryFn: async (): Promise<OperationHistoryEntry[]> => {
      const { data, error } = await supabase
        .from('operation_history')
        .select(`
          *,
          user:admin_users!operation_history_changed_by_fkey(
            full_name,
            email
          )
        `)
        .eq('operation_id', operationId)
        .order('changed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  return { 
    history: history || [], 
    isLoading, 
    error,
    refetch
  };
};
