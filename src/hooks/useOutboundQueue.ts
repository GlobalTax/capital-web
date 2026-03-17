import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OutboundQueueJob {
  id: string;
  campaign_id: string;
  send_type: 'initial' | 'document' | 'followup';
  sequence_id: string | null;
  email_ids: string[];
  interval_ms: number;
  max_per_hour: number | null;
  scheduled_at: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress_current: number;
  progress_total: number;
  last_processed_at: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = 'outbound-send-queue';

export function useOutboundQueue(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY, campaignId];

  const { data: jobs = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await (supabase as any)
        .from('outbound_send_queue')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as OutboundQueueJob[];
    },
    enabled: !!campaignId,
    refetchInterval: 10000, // Poll every 10s for progress updates
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createJob = useMutation({
    mutationFn: async (params: {
      campaignId: string;
      sendType: 'initial' | 'document' | 'followup';
      sequenceId?: string;
      emailIds: string[];
      intervalMs: number;
      maxPerHour: number | null;
      scheduledAt: Date;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await (supabase as any)
        .from('outbound_send_queue')
        .insert({
          campaign_id: params.campaignId,
          send_type: params.sendType,
          sequence_id: params.sequenceId || null,
          email_ids: params.emailIds,
          interval_ms: params.intervalMs,
          max_per_hour: params.maxPerHour,
          scheduled_at: params.scheduledAt.toISOString(),
          status: 'pending',
          progress_current: 0,
          progress_total: params.emailIds.length,
          created_by: user?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as OutboundQueueJob;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Envío programado correctamente');
    },
    onError: (e: any) => {
      toast.error('Error programando envío: ' + e.message);
    },
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const { error } = await (supabase as any)
        .from('outbound_send_queue')
        .update({ status })
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });

  // Derived state
  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'running');
  const hasActiveJob = activeJobs.length > 0;

  return {
    jobs,
    activeJobs,
    hasActiveJob,
    isLoading,
    createJob,
    updateJobStatus,
    invalidate,
  };
}
