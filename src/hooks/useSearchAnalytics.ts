import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchAnalyticsEntry {
  id: string;
  user_id: string | null;
  search_query: string;
  search_type: string;
  filters_applied: unknown;
  results_count: number;
  result_clicked_id: string | null;
  result_clicked_type: string | null;
  search_source: string;
  session_id: string | null;
  created_at: string;
}

interface SearchAnalyticsStats {
  totalSearches: number;
  uniqueQueries: number;
  avgResultsCount: number;
  clickThroughRate: number;
  topSearches: { query: string; count: number }[];
  searchesByType: { type: string; count: number }[];
  searchesWithNoResults: { query: string; count: number }[];
  recentSearches: SearchAnalyticsEntry[];
  dailyTrend: { date: string; count: number }[];
}

export function useSearchAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['search-analytics', days],
    queryFn: async (): Promise<SearchAnalyticsStats> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: allSearches, error } = await supabase
        .from('search_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const searches = (allSearches || []) as SearchAnalyticsEntry[];
      
      const totalSearches = searches.length;
      const uniqueQueries = new Set(searches.map(s => s.search_query.toLowerCase().trim())).size;
      const avgResultsCount = searches.length > 0
        ? searches.reduce((sum, s) => sum + (s.results_count || 0), 0) / searches.length
        : 0;
      const clickedSearches = searches.filter(s => s.result_clicked_id).length;
      const clickThroughRate = totalSearches > 0 ? (clickedSearches / totalSearches) * 100 : 0;
      
      const queryCount: Record<string, number> = {};
      searches.forEach(s => {
        const q = s.search_query.toLowerCase().trim();
        queryCount[q] = (queryCount[q] || 0) + 1;
      });
      const topSearches = Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const typeCount: Record<string, number> = {};
      searches.forEach(s => {
        typeCount[s.search_type] = (typeCount[s.search_type] || 0) + 1;
      });
      const searchesByType = Object.entries(typeCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      
      const noResultsCount: Record<string, number> = {};
      searches.filter(s => s.results_count === 0).forEach(s => {
        const q = s.search_query.toLowerCase().trim();
        noResultsCount[q] = (noResultsCount[q] || 0) + 1;
      });
      const searchesWithNoResults = Object.entries(noResultsCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const recentSearches = searches.slice(0, 50);
      
      const dailyCount: Record<string, number> = {};
      searches.forEach(s => {
        const date = s.created_at.split('T')[0];
        dailyCount[date] = (dailyCount[date] || 0) + 1;
      });
      const dailyTrend = Object.entries(dailyCount)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalSearches,
        uniqueQueries,
        avgResultsCount: Math.round(avgResultsCount * 10) / 10,
        clickThroughRate: Math.round(clickThroughRate * 10) / 10,
        topSearches,
        searchesByType,
        searchesWithNoResults,
        recentSearches,
        dailyTrend,
      };
    },
  });
}

export function useTrackSearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      query: string;
      type?: string;
      source?: string;
      resultsCount?: number;
      filters?: Record<string, unknown>;
    }) => {
      const { error } = await supabase.from('search_analytics').insert({
        user_id: user?.id || null,
        search_query: params.query,
        search_type: params.type || 'global',
        search_source: params.source || 'global_search',
        results_count: params.resultsCount || 0,
        filters_applied: params.filters || null,
        session_id: sessionStorage.getItem('session_id') || null,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-analytics'] });
    },
  });
}

export function useTrackSearchClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      searchId: string;
      clickedId: string;
      clickedType: string;
    }) => {
      const { error } = await supabase
        .from('search_analytics')
        .update({
          result_clicked_id: params.clickedId,
          result_clicked_type: params.clickedType,
        })
        .eq('id', params.searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-analytics'] });
    },
  });
}
