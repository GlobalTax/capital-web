// =============================================
// BATCH ENRICH CORPORATE BUYERS HOOK
// =============================================

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchEnrichResult {
  buyer_id: string;
  buyer_name: string;
  status: 'enriched' | 'skipped' | 'error' | 'no_website';
  fields_updated: string[];
  error_message?: string;
}

export interface BatchEnrichResponse {
  success: boolean;
  total_processed: number;
  enriched: number;
  skipped: number;
  errors: number;
  no_website: number;
  results: BatchEnrichResult[];
}

export interface BatchEnrichProgress {
  isProcessing: boolean;
  results: BatchEnrichResponse | null;
}

export function useBatchEnrichCorporateBuyers() {
  const queryClient = useQueryClient();
  const [results, setResults] = useState<BatchEnrichResponse | null>(null);

  const batchEnrichMutation = useMutation({
    mutationFn: async ({ 
      buyerIds, 
      force = false 
    }: { 
      buyerIds: string[]; 
      force?: boolean;
    }): Promise<BatchEnrichResponse> => {
      const { data, error } = await supabase.functions.invoke(
        'corporate-buyer-batch-enrich',
        { 
          body: { 
            buyer_ids: buyerIds, 
            force 
          } 
        }
      );

      if (error) {
        console.error('Batch enrich error:', error);
        throw new Error(error.message || 'Error en enriquecimiento batch');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido');
      }

      return data as BatchEnrichResponse;
    },
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });
      queryClient.invalidateQueries({ queryKey: ['corporate-buyer'] });
      
      if (data.enriched > 0) {
        toast.success(`${data.enriched} compradores enriquecidos correctamente`);
      } else if (data.skipped === data.total_processed) {
        toast.info('Todos los compradores ya estaban completos');
      } else {
        toast.warning('No se pudo enriquecer ningún comprador');
      }
    },
    onError: (error) => {
      console.error('Batch enrichment error:', error);
      toast.error(error instanceof Error ? error.message : 'Error en enriquecimiento batch');
    }
  });

  const reset = useCallback(() => {
    setResults(null);
  }, []);

  return {
    startBatchEnrich: batchEnrichMutation.mutate,
    isProcessing: batchEnrichMutation.isPending,
    results,
    reset,
    error: batchEnrichMutation.error,
  };
}
