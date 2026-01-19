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
  falsePositives: number;
}

// Helper to detect false positives (marked as sent but with provider error)
const hasFalsePositive = (entry: EmailOutboxEntry): boolean => {
  if (entry.status !== 'sent') return false;
  if (entry.provider_message_id) return false; // Has valid message ID
  
  const response = entry.provider_response as any;
  if (!response) return true; // No response = suspicious
  if (response.error) return true; // Has error
  if (!response.data?.id) return true; // No data.id
  
  return false;
};

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

  // Calculate stats including false positives
  const falsePositivesCount = entries?.filter(hasFalsePositive).length || 0;
  
  const stats: EmailOutboxStats = entries ? {
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    sending: entries.filter(e => e.status === 'sending').length,
    sent: entries.filter(e => e.status === 'sent').length,
    failed: entries.filter(e => e.status === 'failed').length,
    retrying: entries.filter(e => e.status === 'retrying').length,
    successRate: entries.length > 0 
      ? (entries.filter(e => e.status === 'sent' && !hasFalsePositive(e)).length / entries.length) * 100 
      : 0,
    falsePositives: falsePositivesCount
  } : {
    total: 0, pending: 0, sending: 0, sent: 0, failed: 0, retrying: 0, successRate: 0, falsePositives: 0
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

  // Fix false positives (entries marked as sent but with provider errors)
  const fixFalsePositivesMutation = useMutation({
    mutationFn: async () => {
      // Get entries that are "sent" but without proper message ID
      const { data: sentEntries, error: fetchError } = await supabase
        .from('email_outbox')
        .select('id, provider_response, provider_message_id')
        .eq('status', 'sent');

      if (fetchError) throw fetchError;

      // Filter false positives
      const falsePositives = sentEntries?.filter(e => {
        if (e.provider_message_id) return false;
        const response = e.provider_response as any;
        if (!response) return true;
        if (response.error) return true;
        if (!response.data?.id) return true;
        return false;
      }) || [];

      if (falsePositives.length === 0) {
        return { fixed: 0 };
      }

      // Mark as pending for retry
      const { error: updateError } = await supabase
        .from('email_outbox')
        .update({ 
          status: 'pending', 
          attempts: 0,
          last_error: 'Corregido: falso positivo detectado',
          next_retry_at: new Date().toISOString()
        })
        .in('id', falsePositives.map(e => e.id));

      if (updateError) throw updateError;

      // Trigger retry function
      await supabase.functions.invoke('retry-failed-emails');

      return { fixed: falsePositives.length };
    },
    onSuccess: (data) => {
      if (data.fixed === 0) {
        toast.info('No hay falsos positivos que corregir');
      } else {
        toast.success(`${data.fixed} email(s) corregido(s) y marcado(s) para reenvío`);
      }
      queryClient.invalidateQueries({ queryKey: ['email-outbox'] });
    },
    onError: (error: any) => {
      toast.error(`Error al corregir falsos positivos: ${error.message}`);
    }
  });

  // Regenerate missing email outbox entries for valuations without emails sent
  const regenerateMissingMutation = useMutation({
    mutationFn: async () => {
      // Find company_valuations with email_sent = false and no outbox entry
      const { data: missingValuations, error: fetchError } = await supabase
        .from('company_valuations')
        .select('id, email, contact_name, company_name, created_at')
        .eq('email_sent', false)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      if (!missingValuations || missingValuations.length === 0) {
        return { created: 0, message: 'No hay valoraciones pendientes' };
      }

      // Check which ones already have outbox entries
      const valuationIds = missingValuations.map(v => v.id);
      const { data: existingOutbox } = await supabase
        .from('email_outbox')
        .select('valuation_id')
        .in('valuation_id', valuationIds);

      const existingIds = new Set(existingOutbox?.map(e => e.valuation_id) || []);
      const toCreate = missingValuations.filter(v => !existingIds.has(v.id));

      if (toCreate.length === 0) {
        return { created: 0, message: 'Todas las valoraciones ya tienen entrada en outbox' };
      }

      // Create outbox entries
      const entries = toCreate.map(v => ({
        valuation_id: v.id,
        valuation_type: 'standard' as const,
        recipient_email: v.email || 'unknown',
        recipient_name: v.contact_name,
        email_type: 'both' as const,
        status: 'pending' as const,
        attempts: 0,
        max_attempts: 3,
        metadata: { 
          companyName: v.company_name, 
          source: 'recovery',
          originalCreatedAt: v.created_at
        }
      }));

      const { error: insertError } = await supabase
        .from('email_outbox')
        .insert(entries);

      if (insertError) throw insertError;

      // Trigger retry function
      await supabase.functions.invoke('retry-failed-emails');

      return { created: toCreate.length };
    },
    onSuccess: (data) => {
      if (data.created === 0) {
        toast.info(data.message || 'No hay emails pendientes que regenerar');
      } else {
        toast.success(`${data.created} email(s) creado(s) y encolado(s) para envío`);
      }
      queryClient.invalidateQueries({ queryKey: ['email-outbox'] });
    },
    onError: (error: any) => {
      toast.error(`Error al regenerar emails: ${error.message}`);
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
    fixFalsePositives: fixFalsePositivesMutation.mutate,
    regenerateMissing: regenerateMissingMutation.mutate,
    isRetrying: retryEmailMutation.isPending || retryAllFailedMutation.isPending,
    isFixingFalsePositives: fixFalsePositivesMutation.isPending,
    isRegeneratingMissing: regenerateMissingMutation.isPending
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
