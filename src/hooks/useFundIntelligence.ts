import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FundNews {
  id: string;
  fund_id: string;
  fund_type: 'sf' | 'cr';
  title: string;
  url: string;
  source_name: string | null;
  content_preview: string | null;
  news_date: string | null;
  news_type: string | null;
  relevance_score: number | null;
  ai_summary: string | null;
  is_processed: boolean;
  is_material_change: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FundForIntelligence {
  id: string;
  name: string;
  website: string | null;
  last_scraped_at: string | null;
  scrape_data: Record<string, unknown> | null;
}

type FundRow = { id: string; name: string; website: string | null; last_scraped_at: string | null };

// Fetch SF funds for intelligence
export const useSFFundsForIntelligence = () => {
  return useQuery({
    queryKey: ['sf-funds-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_funds')
        .select('id, name, website, last_scraped_at')
        .eq('is_deleted', false)
        .order('name');

      if (error) throw error;
      const rows = data as unknown as FundRow[];
      return rows.map(f => ({ ...f, scrape_data: null })) as FundForIntelligence[];
    },
  });
};

// Fetch CR funds for intelligence
export const useCRFundsForIntelligence = () => {
  return useQuery({
    queryKey: ['cr-funds-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cr_funds')
        .select('id, name, website, last_scraped_at')
        .eq('is_deleted', false)
        .order('name');

      if (error) throw error;
      const rows = data as unknown as FundRow[];
      return rows.map(f => ({ ...f, scrape_data: null })) as FundForIntelligence[];
    },
  });
};

// Fetch fund news
export const useFundNews = () => {
  return useQuery({
    queryKey: ['fund-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as FundNews[];
    },
  });
};

// Scrape fund website
export const useScrapeFundWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fundId, fundType }: { fundId: string; fundType: 'sf' | 'cr' }) => {
      const { data, error } = await supabase.functions.invoke('fund-scrape-website', {
        body: { fund_id: fundId, fund_type: fundType },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Scrape failed');
      return data;
    },
    onSuccess: () => {
      toast.success('Website escaneada correctamente');
      queryClient.invalidateQueries({ queryKey: ['sf-funds-intelligence'] });
      queryClient.invalidateQueries({ queryKey: ['cr-funds-intelligence'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al escanear: ${error.message}`);
    },
  });
};

// Search fund news
export const useSearchFundNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fundId, fundType }: { fundId: string; fundType: 'sf' | 'cr' }) => {
      const { data, error } = await supabase.functions.invoke('fund-search-news', {
        body: { fund_id: fundId, fund_type: fundType },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Search failed');
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.data?.saved_count || 0} noticias encontradas`);
      queryClient.invalidateQueries({ queryKey: ['fund-news'] });
    },
    onError: (error: Error) => {
      toast.error(`Error en búsqueda: ${error.message}`);
    },
  });
};

// Mark news as processed
export const useMarkNewsProcessed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from('fund_news')
        .update({ is_processed: true })
        .eq('id', newsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-news'] });
    },
  });
};

// Delete news
export const useDeleteFundNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from('fund_news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Noticia eliminada');
      queryClient.invalidateQueries({ queryKey: ['fund-news'] });
    },
  });
};

// Combined hook for the page
export const useFundIntelligence = () => {
  const sfFunds = useSFFundsForIntelligence();
  const crFunds = useCRFundsForIntelligence();
  const news = useFundNews();
  const scrapeMutation = useScrapeFundWebsite();
  const searchMutation = useSearchFundNews();
  const markProcessed = useMarkNewsProcessed();
  const deleteNews = useDeleteFundNews();

  return {
    sfFunds: sfFunds.data || [],
    crFunds: crFunds.data || [],
    news: news.data || [],
    isLoading: sfFunds.isLoading || crFunds.isLoading || news.isLoading,
    scrapeWebsite: scrapeMutation.mutate,
    isScraping: scrapeMutation.isPending,
    searchNews: searchMutation.mutate,
    isSearching: searchMutation.isPending,
    markAsProcessed: markProcessed.mutate,
    deleteNews: deleteNews.mutate,
  };
};
