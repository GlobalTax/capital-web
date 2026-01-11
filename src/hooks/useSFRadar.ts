import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SFSearchQueryFilters {
  country?: string | null;
  intent?: string | null;
  isActive?: boolean;
}

// Fetch search queries
export const useSFSearchQueries = (filters?: SFSearchQueryFilters) => {
  return useQuery({
    queryKey: ['sf-search-queries', filters],
    queryFn: async () => {
      let query = supabase
        .from('sf_search_queries')
        .select('*')
        .order('country_code', { ascending: true })
        .order('priority', { ascending: false });

      if (filters?.country) {
        query = query.eq('country_code', filters.country);
      }
      if (filters?.intent) {
        query = query.eq('intent', filters.intent);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

// Fetch scraped URLs
export const useSFScrapedUrls = (filters?: { isRelevant?: boolean | null }) => {
  return useQuery({
    queryKey: ['sf-scraped-urls', filters],
    queryFn: async () => {
      let query = supabase
        .from('sf_scraped_urls')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (filters?.isRelevant !== undefined) {
        if (filters.isRelevant === null) {
          query = query.is('is_relevant', null);
        } else {
          query = query.eq('is_relevant', filters.isRelevant);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

// Execute a radar query (placeholder - would integrate with Firecrawl)
export const useExecuteRadarQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (queryId: string) => {
      // Update last_executed_at
      const { error } = await supabase
        .from('sf_search_queries')
        .update({ last_executed_at: new Date().toISOString() })
        .eq('id', queryId);

      if (error) throw error;

      // TODO: Integrate with Firecrawl search
      // For now, just update the timestamp
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-search-queries'] });
      queryClient.invalidateQueries({ queryKey: ['sf-scraped-urls'] });
    }
  });
};

// Extract profile from URL
export const useExtractProfileFromUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, markdown }: { url?: string; markdown?: string }) => {
      const { data, error } = await supabase.functions.invoke('sf-extract-profile', {
        body: { url, page_markdown: markdown }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-scraped-urls'] });
      queryClient.invalidateQueries({ queryKey: ['sf-funds'] });
    }
  });
};

// Check URL relevance
export const useCheckUrlRelevance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, title, snippet, markdown }: { 
      url: string; 
      title?: string; 
      snippet?: string; 
      markdown?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('sf-relevance-filter', {
        body: { url, title, snippet, page_markdown: markdown }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-scraped-urls'] });
    }
  });
};

// Generate queries for a country
export const useGenerateQueries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ country, countryCode }: { country: string; countryCode: string }) => {
      const { data, error } = await supabase.functions.invoke('sf-generate-queries', {
        body: { country, country_code: countryCode }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-search-queries'] });
      toast.success('Queries generadas correctamente');
    },
    onError: () => {
      toast.error('Error al generar queries');
    }
  });
};

// Fetch AI prompts
export const useSFAIPrompts = () => {
  return useQuery({
    queryKey: ['sf-ai-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_ai_prompts')
        .select('*')
        .eq('is_active', true)
        .order('key', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
};

// Update AI prompt
export const useUpdateSFAIPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: { 
        system_prompt?: string; 
        user_prompt_template?: string;
        model?: string;
        temperature?: number;
        max_tokens?: number;
      }
    }) => {
      const { data, error } = await supabase
        .from('sf_ai_prompts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-ai-prompts'] });
      toast.success('Prompt actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar prompt');
    }
  });
};
