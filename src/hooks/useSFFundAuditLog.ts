import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SFFundAuditLog {
  id: string;
  fund_id: string;
  user_id: string | null;
  user_email: string | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_fields: string[] | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

export const useSFFundAuditLog = (fundId: string | undefined) => {
  return useQuery({
    queryKey: ['sf_fund_audit_log', fundId],
    queryFn: async () => {
      if (!fundId) return [];
      
      const { data, error } = await supabase
        .from('sf_fund_audit_log')
        .select('*')
        .eq('fund_id', fundId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SFFundAuditLog[];
    },
    enabled: !!fundId,
  });
};
