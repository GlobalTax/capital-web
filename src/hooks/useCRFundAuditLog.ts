import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CRFundAuditLog } from '@/types/capitalRiesgo';

export function useCRFundAuditLog(fundId: string | undefined) {
  return useQuery({
    queryKey: ['cr-fund-audit-log', fundId],
    queryFn: async () => {
      if (!fundId) return [];

      const { data, error } = await supabase
        .from('cr_fund_audit_log')
        .select('*')
        .eq('fund_id', fundId)
        .order('changed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as CRFundAuditLog[];
    },
    enabled: !!fundId,
  });
}
