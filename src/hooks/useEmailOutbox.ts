import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailOutboxEntry {
  id: string;
  valuation_id: string | null;
  valuation_type: 'standard' | 'professional';
  recipient_email: string;
  recipient_name: string | null;
  email_type: 'client' | 'internal' | 'both';
  subject: string | null;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  max_attempts: number;
  provider_name: string | null;
  provider_message_id: string | null;
  provider_response: Record<string, any> | null;
  last_error: string | null;
  error_details: Record<string, any> | null;
  created_at: string;
  first_attempt_at: string | null;
  last_attempt_at: string | null;
  sent_at: string | null;
  next_retry_at: string | null;
  metadata: Record<string, any> | null;
}

export interface EmailOutboxFilters {
  status?: string;
  valuation_type?: string;
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface EmailOutboxStats {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  retrying: number;
  successRate: number;
}

export function useEmailOutbox(filters: EmailOutboxFilters = {}) {
  const queryClient = useQueryClient();

  // Fetch outbox entries
  const {
    data: entries,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['email-outbox', filters],
    queryFn: async () => {
      let query = supabase
        .from('email_outbox')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.valuation_type && filters.valuation_type !== 'all') {
        query = query.eq('valuation_type', filters.valuation_type);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      if (filters.search) {
        query = query.or(`recipient_email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmailOutboxEntry[];
    },
    staleTime: 30000 // 30 seconds
  });

  // Calculate stats
  const stats: EmailOutboxStats = entries ? {
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    sending: entries.filter(e => e.status === 'sending').length,
    sent: entries.filter(e => e.status === 'sent').length,
    failed: entries.filter(e => e.status === 'failed').length,
    retrying: entries.filter(e => e.status === 'retrying').length,
    successRate: entries.length > 0 
      ? (entries.filter(e => e.status === 'sent').length / entries.length) * 100 
      : 0
  } : {
    total: 0, pending: 0, sending: 0, sent: 0, failed: 0, retrying: 0, successRate: 0
  };

  // Retry single email
  const retryEmailMutation = useMutation({
    mutationFn: async (entryId: string) => {
      // Mark as pending for retry
      const { error: updateError } = await supabase
        .from('email_outbox')
        .update({ 
          status: 'pending', 
          next_retry_at: new Date().toISOString() 
        })
        .eq('id', entryId);

      if (updateError) throw updateError;

      // Trigger retry function
      const { error: invokeError } = await supabase.functions.invoke('retry-failed-emails');
      
      if (invokeError) throw invokeError;
      
      return true;
    },
    onSuccess: () => {
      toast.success('Email marcado para reintento');
      queryClient.invalidateQueries({ queryKey: ['email-outbox'] });
    },
    onError: (error: any) => {
      toast.error(`Error al reintentar: ${error.message}`);
    }
  });

  // Retry all failed emails
  const retryAllFailedMutation = useMutation({
    mutationFn: async () => {
      // Mark all failed as pending
      const { error: updateError } = await supabase
        .from('email_outbox')
        .update({ 
          status: 'pending', 
          next_retry_at: new Date().toISOString(),
          attempts: 0
        })
        .eq('status', 'failed');

      if (updateError) throw updateError;

      // Trigger retry function
      const { data, error: invokeError } = await supabase.functions.invoke('retry-failed-emails');
      
      if (invokeError) throw invokeError;
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data?.processed || 0} emails marcados para reintento`);
      queryClient.invalidateQueries({ queryKey: ['email-outbox'] });
    },
    onError: (error: any) => {
      toast.error(`Error al reintentar todos: ${error.message}`);
    }
  });

  // Delete old entries (older than 30 days)
  const cleanupOldEntriesMutation = useMutation({
    mutationFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('email_outbox')
        .delete()
        .eq('status', 'sent')
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Entradas antiguas eliminadas');
      queryClient.invalidateQueries({ queryKey: ['email-outbox'] });
    },
    onError: (error: any) => {
      toast.error(`Error en limpieza: ${error.message}`);
    }
  });

  return {
    entries: entries || [],
    stats,
    isLoading,
    error,
    refetch,
    retryEmail: retryEmailMutation.mutate,
    retryAllFailed: retryAllFailedMutation.mutate,
    cleanupOldEntries: cleanupOldEntriesMutation.mutate,
    isRetrying: retryEmailMutation.isPending || retryAllFailedMutation.isPending
  };
}

// Hook for getting email status for a specific valuation
export function useValuationEmailStatus(valuationId: string | null) {
  return useQuery({
    queryKey: ['email-outbox', 'valuation', valuationId],
    queryFn: async () => {
      if (!valuationId) return null;

      const { data, error } = await supabase
        .from('email_outbox')
        .select('*')
        .eq('valuation_id', valuationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as EmailOutboxEntry | null;
    },
    enabled: !!valuationId
  });
}
