// ============= SF PORTFOLIO SCRAPER HOOK =============
// Hook para extraer adquisiciones desde webs de Search Funds con IA
// Basado en useCRPortfolioScraper.ts

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScrapeResult {
  success: boolean;
  fund_name?: string;
  extracted?: number;
  inserted?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  warnings?: string[];
  companies?: Array<{ company_name: string; status: string; sector?: string; deal_year?: number }>;
  error?: string;
}

interface BatchProgress {
  current: number;
  total: number;
  currentFund: string;
  results: ScrapeResult[];
}

export function useSFPortfolioScraper() {
  const queryClient = useQueryClient();
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Single fund scraping
  const scrapePortfolioMutation = useMutation({
    mutationFn: async ({ fundId, customUrl }: { fundId: string; customUrl?: string }): Promise<ScrapeResult> => {
      const { data, error } = await supabase.functions.invoke('sf-extract-portfolio', {
        body: { fund_id: fundId, custom_url: customUrl }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as ScrapeResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sf_acquisitions'] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      queryClient.invalidateQueries({ queryKey: ['sf-fund'] });
      
      if (data.success && data.extracted && data.extracted > 0) {
        const message = data.updated && data.updated > 0
          ? `Extraídas ${data.inserted} nuevas, ${data.updated} actualizadas de ${data.fund_name}`
          : `Extraídas ${data.inserted} adquisiciones de ${data.fund_name}`;
        toast.success(message);
      } else if (data.success) {
        toast.info(`No se encontraron adquisiciones en ${data.fund_name}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Batch scraping with progress
  const scrapeBatch = useCallback(async (
    fundIds: string[],
    onProgress?: (progress: BatchProgress) => void
  ): Promise<ScrapeResult[]> => {
    if (fundIds.length === 0) return [];

    setIsBatchRunning(true);
    const results: ScrapeResult[] = [];
    const BATCH_SIZE = 3; // Process 3 funds at a time
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches

    try {
      for (let i = 0; i < fundIds.length; i += BATCH_SIZE) {
        const batch = fundIds.slice(i, i + BATCH_SIZE);
        
        // Update progress before processing batch
        const progress: BatchProgress = {
          current: i + 1,
          total: fundIds.length,
          currentFund: `Procesando lote ${Math.floor(i / BATCH_SIZE) + 1}...`,
          results: [...results]
        };
        setBatchProgress(progress);
        onProgress?.(progress);

        // Process batch in parallel
        const batchPromises = batch.map(async (fundId) => {
          try {
            const { data, error } = await supabase.functions.invoke('sf-extract-portfolio', {
              body: { fund_id: fundId }
            });

            if (error) {
              return { 
                success: false, 
                error: error.message,
                fund_name: fundId 
              } as ScrapeResult;
            }

            return data as ScrapeResult;
          } catch (err) {
            return { 
              success: false, 
              error: err instanceof Error ? err.message : 'Unknown error',
              fund_name: fundId 
            } as ScrapeResult;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update progress after batch
        const updatedProgress: BatchProgress = {
          current: Math.min(i + BATCH_SIZE, fundIds.length),
          total: fundIds.length,
          currentFund: batchResults.map(r => r.fund_name).join(', '),
          results: [...results]
        };
        setBatchProgress(updatedProgress);
        onProgress?.(updatedProgress);

        // Delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < fundIds.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      // Invalidate queries after batch is complete
      queryClient.invalidateQueries({ queryKey: ['sf_acquisitions'] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });

      // Calculate summary
      const successCount = results.filter(r => r.success && (r.extracted || 0) > 0).length;
      const totalExtracted = results.reduce((sum, r) => sum + (r.inserted || 0), 0);
      
      toast.success(
        `Scraping completado: ${totalExtracted} adquisiciones de ${successCount}/${fundIds.length} fondos`
      );

      return results;

    } finally {
      setIsBatchRunning(false);
      setBatchProgress(null);
    }
  }, [queryClient]);

  // Cancel batch (best effort)
  const cancelBatch = useCallback(() => {
    setIsBatchRunning(false);
    setBatchProgress(null);
    toast.info('Scraping cancelado');
  }, []);

  return {
    // Single fund
    scrapePortfolio: scrapePortfolioMutation.mutateAsync,
    isScraping: scrapePortfolioMutation.isPending,
    
    // Batch
    scrapeBatch,
    isBatchRunning,
    batchProgress,
    cancelBatch,
  };
}
