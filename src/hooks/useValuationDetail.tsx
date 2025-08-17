import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { Database } from '@/integrations/supabase/types';

type CompanyValuation = Database['public']['Tables']['company_valuations']['Row'];

const fetchValuationDetail = async (id: string, userId: string): Promise<CompanyValuation> => {
  const { data, error } = await supabase
    .from('company_valuations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useValuationDetail = (id: string, userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_VALUATION_DETAIL, id],
    queryFn: () => fetchValuationDetail(id, userId!),
    enabled: !!id && !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};