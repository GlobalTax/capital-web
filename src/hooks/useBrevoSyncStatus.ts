import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BrevoSyncStatus {
  isSynced: boolean;
  syncedAt: string | null;
  brevoId: string | null;
  isLoading: boolean;
}

/**
 * Hook to check if a contact has been successfully synced to Brevo
 */
export const useBrevoSyncStatus = (entityId: string | undefined): BrevoSyncStatus => {
  const { data, isLoading } = useQuery({
    queryKey: ['brevo-sync-status', entityId],
    queryFn: async () => {
      if (!entityId) return null;
      
      const { data } = await supabase
        .from('brevo_sync_log')
        .select('id, sync_status, last_sync_at, brevo_id')
        .eq('entity_id', entityId)
        .eq('sync_status', 'success')
        .order('last_sync_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      return data;
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    isSynced: !!data,
    syncedAt: data?.last_sync_at || null,
    brevoId: data?.brevo_id || null,
    isLoading,
  };
};

/**
 * Hook to check sync status for multiple contacts at once
 */
export const useBrevoSyncStatusBulk = (entityIds: string[]): { 
  syncedIds: Set<string>; 
  isLoading: boolean;
} => {
  const { data, isLoading } = useQuery({
    queryKey: ['brevo-sync-status-bulk', entityIds.sort().join(',')],
    queryFn: async () => {
      if (entityIds.length === 0) return [];
      
      const { data } = await supabase
        .from('brevo_sync_log')
        .select('entity_id')
        .in('entity_id', entityIds)
        .eq('sync_status', 'success');
      
      return data || [];
    },
    enabled: entityIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const syncedIds = new Set((data || []).map(item => item.entity_id));

  return {
    syncedIds,
    isLoading,
  };
};
