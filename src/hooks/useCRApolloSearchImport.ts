import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= TYPES =============

export interface CRApolloSearchCriteria {
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

export interface CRApolloPersonResult {
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

export interface CRApolloSearchPreset {
  id: string;
  name: string;
  description: string;
  criteria: CRApolloSearchCriteria;
}

export interface CRApolloImportJob {
  id: string;
  search_criteria: CRApolloSearchCriteria;
  total_results: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  credits_used: number;
  status: 'pending' | 'searching' | 'previewing' | 'importing' | 'completed' | 'failed' | 'cancelled';
  preview_data?: CRApolloPersonResult[];
  import_results?: any[];
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface CRImportResults {
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

export const useCRApolloPresets = () => {
  return useQuery({
    queryKey: ['cr-apollo-presets'],
    queryFn: async (): Promise<CRApolloSearchPreset[]> => {
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
        body: { action: 'get_presets' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.presets;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useCRApolloImportHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ['cr-apollo-import-history', limit],
    queryFn: async (): Promise<CRApolloImportJob[]> => {
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
        body: { action: 'get_history', limit },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.imports;
    },
    refetchInterval: 10000,
  });
};

export const useCRApolloSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      criteria: CRApolloSearchCriteria; 
      import_id?: string;
    }): Promise<{ people: CRApolloPersonResult[]; pagination: any }> => {
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
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

export const useCreateCRApolloImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (criteria: CRApolloSearchCriteria): Promise<string> => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
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
      queryClient.invalidateQueries({ queryKey: ['cr-apollo-import-history'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creando import: ${error.message}`);
    },
  });
};

export const useImportCRApolloSelected = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      import_id: string;
      people: CRApolloPersonResult[];
      enrich?: boolean;
    }): Promise<CRImportResults> => {
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
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
      queryClient.invalidateQueries({ queryKey: ['cr-apollo-import-history'] });
      queryClient.invalidateQueries({ queryKey: ['cr_people'] });
      queryClient.invalidateQueries({ queryKey: ['cr_funds'] });
      
      toast.success(
        `Importación completada: ${results.imported} nuevos, ${results.updated} actualizados`
      );
    },
    onError: (error: Error) => {
      toast.error(`Error en importación: ${error.message}`);
    },
  });
};

export const useCRSearchFromList = () => {
  return useMutation({
    mutationFn: async (params: { 
      list_id: string; 
      max_pages?: number; // Max pages to fetch (default 20 = 2000 contacts)
    }): Promise<{ people: CRApolloPersonResult[]; pagination: any; list_name: string }> => {
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
        body: { 
          action: 'search_from_list', 
          list_id: params.list_id,
          max_pages: params.max_pages || 20,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return { people: data.people, pagination: data.pagination, list_name: data.list_name };
    },
    onSuccess: (data) => {
      const pagesInfo = data.pagination?.pages_fetched > 1 
        ? ` (${data.pagination.pages_fetched} páginas)` 
        : '';
      toast.success(`Cargados ${data.people.length} contactos de "${data.list_name}"${pagesInfo}`);
    },
    onError: (error: Error) => {
      toast.error(`Error cargando lista: ${error.message}`);
    },
  });
};

// ============= COMBINED HOOK =============

export const useCRApolloSearchImport = () => {
  const presets = useCRApolloPresets();
  const history = useCRApolloImportHistory();
  const search = useCRApolloSearch();
  const createImport = useCreateCRApolloImport();
  const importSelected = useImportCRApolloSelected();
  const searchFromList = useCRSearchFromList();

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

    searchFromList: searchFromList.mutateAsync,
    isSearchingFromList: searchFromList.isPending,
    listResults: searchFromList.data,
  };
};
