import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SFEnrichmentStats {
  total: number;
  withDescription: number;
  withWebsite: number;
  withSectors: number;
  needsEnrichment: number;
}

export interface SFEnrichmentResult {
  fundId: string;
  fundName: string;
  status: 'enriched' | 'skipped' | 'not_found' | 'error';
  fieldsUpdated: string[];
  errorMessage?: string;
}

export interface SFBatchResult {
  totalProcessed: number;
  enriched: number;
  skipped: number;
  notFound: number;
  errors: number;
  results: SFEnrichmentResult[];
}

// Hook to fetch enrichment stats (preview mode)
export function useSFEnrichmentStats() {
  return useQuery({
    queryKey: ['sf-enrichment-stats'],
    queryFn: async (): Promise<SFEnrichmentStats> => {
      const { data, error } = await supabase.functions.invoke('sf-batch-enrich-funds', {
        body: { mode: 'preview' },
      });

      if (error) {
        console.error('[SF Enrich] Error fetching stats:', error);
        throw new Error(error.message || 'Error fetching enrichment stats');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error');
      }

      return data.stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to execute batch enrichment
export function useSFBatchEnrich() {
  const queryClient = useQueryClient();
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentFund: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<SFBatchResult | null>(null);

  const enrichMutation = useMutation({
    mutationFn: async (params: { limit?: number; fundIds?: string[] }) => {
      setIsEnriching(true);
      setProgress({ current: 0, total: params.limit || 50, currentFund: 'Starting...' });

      const { data, error } = await supabase.functions.invoke('sf-batch-enrich-funds', {
        body: { mode: 'execute', ...params },
      });

      if (error) {
        throw new Error(error.message || 'Enrichment failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error');
      }

      return data as SFBatchResult & { success: boolean };
    },
    onSuccess: (data) => {
      setLastResult(data);
      setProgress(null);
      setIsEnriching(false);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['sf-enrichment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['sf-funds'] });

      toast({
        title: 'Enriquecimiento completado',
        description: `${data.enriched} funds actualizados, ${data.skipped} sin cambios, ${data.notFound} no encontrados`,
      });
    },
    onError: (error: Error) => {
      setProgress(null);
      setIsEnriching(false);

      toast({
        title: 'Error en enriquecimiento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const startEnrichment = useCallback(
    (params: { limit?: number; fundIds?: string[] } = {}) => {
      enrichMutation.mutate(params);
    },
    [enrichMutation]
  );

  const reset = useCallback(() => {
    setLastResult(null);
    setProgress(null);
  }, []);

  return {
    startEnrichment,
    isEnriching,
    progress,
    lastResult,
    reset,
    isPending: enrichMutation.isPending,
    error: enrichMutation.error,
  };
}

// Combined hook for the dashboard
export function useSFEnrichmentDashboard() {
  const stats = useSFEnrichmentStats();
  const batch = useSFBatchEnrich();

  return {
    stats: stats.data,
    isLoadingStats: stats.isLoading,
    statsError: stats.error,
    refetchStats: stats.refetch,
    ...batch,
  };
}
