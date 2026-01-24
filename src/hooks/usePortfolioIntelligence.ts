import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PortfolioNews {
  id: string;
  portfolio_id: string | null;
  fund_id: string;
  company_name: string;
  title: string;
  url: string;
  source_name: string | null;
  content_preview: string | null;
  news_date: string | null;
  news_type: string | null;
  relevance_score: number | null;
  ai_summary: string | null;
  is_processed: boolean;
  is_exit_signal: boolean;
  is_acquisition_signal: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PortfolioChange {
  id: string;
  fund_id: string;
  change_type: 'new_company' | 'exit' | 'status_change' | 'info_update';
  company_name: string;
  company_name_normalized: string | null;
  detected_data: Record<string, unknown> | null;
  existing_portfolio_id: string | null;
  is_confirmed: boolean;
  is_dismissed: boolean;
  confirmed_at: string | null;
  dismissed_at: string | null;
  dismiss_reason: string | null;
  metadata: Record<string, unknown> | null;
  detected_at: string;
}

// Fetch portfolio news
export function usePortfolioNews(filters?: {
  fundId?: string;
  isExitSignal?: boolean;
  isProcessed?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portfolioNews', filters],
    queryFn: async () => {
      let query = supabase
        .from('portfolio_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.fundId) {
        query = query.eq('fund_id', filters.fundId);
      }
      if (filters?.isExitSignal !== undefined) {
        query = query.eq('is_exit_signal', filters.isExitSignal);
      }
      if (filters?.isProcessed !== undefined) {
        query = query.eq('is_processed', filters.isProcessed);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PortfolioNews[];
    },
  });
}

// Fetch portfolio changes
export function usePortfolioChanges(filters?: {
  fundId?: string;
  changeType?: string;
  pendingOnly?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portfolioChanges', filters],
    queryFn: async () => {
      let query = supabase
        .from('portfolio_changes')
        .select('*')
        .order('detected_at', { ascending: false });

      if (filters?.fundId) {
        query = query.eq('fund_id', filters.fundId);
      }
      if (filters?.changeType) {
        query = query.eq('change_type', filters.changeType);
      }
      if (filters?.pendingOnly) {
        query = query.eq('is_confirmed', false).eq('is_dismissed', false);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PortfolioChange[];
    },
  });
}

// Mark news as processed
export function useMarkNewsProcessed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from('portfolio_news')
        .update({ is_processed: true })
        .eq('id', newsId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioNews'] });
    },
  });
}

// Delete portfolio news
export function useDeletePortfolioNews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from('portfolio_news')
        .delete()
        .eq('id', newsId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioNews'] });
      toast.success('Noticia eliminada');
    },
  });
}

// Confirm portfolio change (new company or exit)
export function useConfirmChange() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ changeId, action }: { changeId: string; action: 'confirm' | 'dismiss'; reason?: string }) => {
      const updates = action === 'confirm' 
        ? { is_confirmed: true, confirmed_at: new Date().toISOString() }
        : { is_dismissed: true, dismissed_at: new Date().toISOString() };

      const { error } = await supabase
        .from('portfolio_changes')
        .update(updates)
        .eq('id', changeId);
      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolioChanges'] });
      toast.success(action === 'confirm' ? 'Cambio confirmado' : 'Cambio descartado');
    },
  });
}

// Scan portfolio news
export function useScanPortfolioNews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params?: { fund_id?: string; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke('cr-portfolio-news-scan', {
        body: params || {},
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Scan failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolioNews'] });
      const { companies_scanned, total_news_found, exit_signals_found } = data.data;
      toast.success(
        `Scan completado: ${companies_scanned} empresas, ${total_news_found} noticias, ${exit_signals_found} señales de exit`
      );
    },
    onError: (error: Error) => {
      toast.error(`Error en scan: ${error.message}`);
    },
  });
}

// Scan portfolio diff
export function useScanPortfolioDiff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params?: { fund_id?: string; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke('cr-portfolio-diff-scan', {
        body: params || {},
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Diff scan failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolioChanges'] });
      const { funds_scanned, total_new_companies, total_possible_exits } = data.data;
      toast.success(
        `Diff completado: ${funds_scanned} fondos, ${total_new_companies} nuevas empresas, ${total_possible_exits} posibles exits`
      );
    },
    onError: (error: Error) => {
      toast.error(`Error en diff: ${error.message}`);
    },
  });
}

// Combined hook for page usage
export function usePortfolioIntelligence() {
  const portfolioNewsQuery = usePortfolioNews({ limit: 50 });
  const exitSignalsQuery = usePortfolioNews({ isExitSignal: true, limit: 20 });
  const pendingChangesQuery = usePortfolioChanges({ pendingOnly: true, limit: 50 });
  
  const scanNewsMutation = useScanPortfolioNews();
  const scanDiffMutation = useScanPortfolioDiff();
  const markProcessedMutation = useMarkNewsProcessed();
  const deleteNewsMutation = useDeletePortfolioNews();
  const confirmChangeMutation = useConfirmChange();

  return {
    // Data
    portfolioNews: portfolioNewsQuery.data || [],
    exitSignals: exitSignalsQuery.data || [],
    pendingChanges: pendingChangesQuery.data || [],
    
    // Loading states
    isLoadingNews: portfolioNewsQuery.isLoading,
    isLoadingExits: exitSignalsQuery.isLoading,
    isLoadingChanges: pendingChangesQuery.isLoading,
    
    // Scan actions
    scanNews: scanNewsMutation.mutateAsync,
    scanDiff: scanDiffMutation.mutateAsync,
    isScanningNews: scanNewsMutation.isPending,
    isScanningDiff: scanDiffMutation.isPending,
    
    // CRUD actions
    markAsProcessed: markProcessedMutation.mutateAsync,
    deleteNews: deleteNewsMutation.mutateAsync,
    confirmChange: confirmChangeMutation.mutateAsync,
    
    // Refetch
    refetchAll: () => {
      portfolioNewsQuery.refetch();
      exitSignalsQuery.refetch();
      pendingChangesQuery.refetch();
    },
  };
}
