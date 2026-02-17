import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NDATrackingEvent {
  id: string;
  recipient_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  performed_by: string | null;
  created_at: string | null;
}

export const useNDATrackingEvents = (recipientId: string | undefined) => {
  return useQuery({
    queryKey: ['nda-tracking-events', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];

      const { data, error } = await supabase
        .from('nda_tracking_events')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as NDATrackingEvent[];
    },
    enabled: !!recipientId,
  });
};
