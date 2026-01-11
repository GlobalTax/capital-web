import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchSFFunds,
  fetchCRFunds,
  fetchFundNews,
  scrapeFundWebsite,
  searchFundNews,
  markNewsAsProcessed,
  deleteFundNews,
  type FundNews,
  type FundForIntelligence,
} from '@/lib/api/fundIntelligenceApi';

export type { FundNews, FundForIntelligence };

// Fetch SF funds for intelligence
export const useSFFundsForIntelligence = () => {
  return useQuery({
    queryKey: ['sf-funds-intelligence'],
    queryFn: fetchSFFunds,
  });
};

// Fetch CR funds for intelligence
export const useCRFundsForIntelligence = () => {
  return useQuery({
    queryKey: ['cr-funds-intelligence'],
    queryFn: fetchCRFunds,
  });
};

// Fetch fund news
export const useFundNews = () => {
  return useQuery({
    queryKey: ['fund-news'],
    queryFn: fetchFundNews,
  });
};

// Scrape fund website
export const useScrapeFundWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fundId, fundType }: { fundId: string; fundType: 'sf' | 'cr' }) =>
      scrapeFundWebsite(fundId, fundType),
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
    mutationFn: ({ fundId, fundType }: { fundId: string; fundType: 'sf' | 'cr' }) =>
      searchFundNews(fundId, fundType),
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
    mutationFn: markNewsAsProcessed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-news'] });
    },
  });
};

// Delete news
export const useDeleteFundNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFundNews,
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
  const deleteNewsM = useDeleteFundNews();

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
    deleteNews: deleteNewsM.mutate,
  };
};
