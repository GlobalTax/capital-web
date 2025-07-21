
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para prefetching estratégico
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchMarketingData = useCallback(() => {
    // Prefetch datos de marketing para navegación anticipada
    queryClient.prefetchQuery({
      queryKey: ['marketing_metrics_enhanced'],
      queryFn: async () => {
        const [contactLeadsRes, leadScoresRes] = await Promise.all([
          supabase.from('contact_leads').select('*').limit(100),
          supabase.from('lead_scores').select('*').limit(100)
        ]);
        return { contactLeads: contactLeadsRes.data, leadScores: leadScoresRes.data };
      },
      staleTime: 2 * 60 * 1000 // 2 minutos
    });
  }, [queryClient]);

  const prefetchLeadData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['hotLeads'],
      queryFn: async () => {
        const { data } = await supabase
          .from('lead_scores')
          .select('id, visitor_id, company_name, total_score, is_hot_lead')
          .eq('is_hot_lead', true)
          .order('total_score', { ascending: false })
          .limit(20);
        return data;
      },
      staleTime: 60 * 1000 // 1 minuto
    });
  }, [queryClient]);

  return { prefetchMarketingData, prefetchLeadData };
};
