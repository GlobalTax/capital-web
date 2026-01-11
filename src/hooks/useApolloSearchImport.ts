import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= TYPES =============

export interface ApolloSearchCriteria {
  person_titles?: string[];
  person_locations?: string[];
  person_seniorities?: string[];
  q_keywords?: string;
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  organization_industries?: string[];
  page?: number;
  per_page?: number;
}

export interface ApolloPersonResult {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: {
    id: string;
    name: string;
    website_url?: string;
    linkedin_url?: string;
    primary_domain?: string;
    industry?: string;
    estimated_num_employees?: number;
    city?: string;
    country?: string;
  };
  phone_numbers?: Array<{ raw_number: string; sanitized_number: string; type: string }>;
  seniority?: string;
}

export interface ApolloSearchPreset {
  id: string;
  name: string;
  description: string;
  criteria: ApolloSearchCriteria;
}

export interface ApolloImportJob {
  id: string;
  search_criteria: ApolloSearchCriteria;
  total_results: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  credits_used: number;
  status: 'pending' | 'searching' | 'previewing' | 'importing' | 'completed' | 'failed' | 'cancelled';
  preview_data?: ApolloPersonResult[];
  import_results?: any[];
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ImportResults {
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  details: Array<{
    name: string;
    success: boolean;
    action: 'created' | 'updated' | 'skipped';
    personId?: string;
    error?: string;
  }>;
}

// ============= HOOKS =============

export const useApolloPresets = () => {
  return useQuery({
    queryKey: ['apollo-presets'],
    queryFn: async (): Promise<ApolloSearchPreset[]> => {
      const { data, error } = await supabase.functions.invoke('apollo-search-import', {
        body: { action: 'get_presets' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.presets;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useApolloImportHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ['apollo-import-history', limit],
    queryFn: async (): Promise<ApolloImportJob[]> => {
      const { data, error } = await supabase.functions.invoke('apollo-search-import', {
        body: { action: 'get_history', limit },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.imports;
    },
    refetchInterval: 10000, // Refresh every 10s for live updates
  });
};

export const useApolloSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      criteria: ApolloSearchCriteria; 
      import_id?: string;
    }): Promise<{ people: ApolloPersonResult[]; pagination: any }> => {
      const { data, error } = await supabase.functions.invoke('apollo-search-import', {
        body: { 
          action: 'search', 
          criteria: params.criteria,
          import_id: params.import_id,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return { people: data.people, pagination: data.pagination };
    },
    onSuccess: (data) => {
      toast.success(`Encontradas ${data.people.length} personas`);
    },
    onError: (error: Error) => {
      toast.error(`Error en búsqueda: ${error.message}`);
    },
  });
};

export const useCreateApolloImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (criteria: ApolloSearchCriteria): Promise<string> => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('apollo-search-import', {
        body: { 
          action: 'create_import', 
          criteria,
          user_id: userData?.user?.id,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.import_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apollo-import-history'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creando import: ${error.message}`);
    },
  });
};

export const useImportApolloSelected = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      import_id: string;
      people: ApolloPersonResult[];
      enrich?: boolean;
    }): Promise<ImportResults> => {
      const { data, error } = await supabase.functions.invoke('apollo-search-import', {
        body: { 
          action: 'import_selected',
          import_id: params.import_id,
          people: params.people,
          enrich: params.enrich || false,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['apollo-import-history'] });
      queryClient.invalidateQueries({ queryKey: ['sf_people'] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      
      toast.success(
        `Importación completada: ${results.imported} nuevos, ${results.updated} actualizados`
      );
    },
    onError: (error: Error) => {
      toast.error(`Error en importación: ${error.message}`);
    },
  });
};

// ============= COMBINED HOOK =============

export const useApolloSearchImport = () => {
  const presets = useApolloPresets();
  const history = useApolloImportHistory();
  const search = useApolloSearch();
  const createImport = useCreateApolloImport();
  const importSelected = useImportApolloSelected();

  return {
    presets: presets.data || [],
    presetsLoading: presets.isLoading,
    
    history: history.data || [],
    historyLoading: history.isLoading,
    refetchHistory: history.refetch,
    
    search: search.mutateAsync,
    isSearching: search.isPending,
    searchResults: search.data,
    
    createImport: createImport.mutateAsync,
    isCreatingImport: createImport.isPending,
    
    importSelected: importSelected.mutateAsync,
    isImporting: importSelected.isPending,
    importResults: importSelected.data,
  };
};
