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

// ============= BATCH IMPORT HOOK (FOR LARGE IMPORTS) =============

interface BatchImportProgress {
  currentBatch: number;
  totalBatches: number;
  accumulated: CRImportResults;
  isComplete: boolean;
}

export const useImportCRApolloInBatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      import_id: string;
      people: CRApolloPersonResult[];
      enrich?: boolean;
      onProgress?: (progress: BatchImportProgress) => void;
    }): Promise<CRImportResults> => {
      const { import_id, people, enrich = false, onProgress } = params;
      const BATCH_SIZE = 50;
      const totalBatches = Math.ceil(people.length / BATCH_SIZE);
      
      let accumulated: CRImportResults = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [],
      };

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        console.log(`[CR Batch Import] Processing batch ${batchIndex + 1}/${totalBatches}`);
        
        const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
          body: { 
            action: 'import_batch',
            import_id,
            people,
            enrich,
            batch_index: batchIndex,
            batch_size: BATCH_SIZE,
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        // Update accumulated results
        accumulated = {
          imported: data.accumulated.imported,
          updated: data.accumulated.updated,
          skipped: data.accumulated.skipped,
          errors: data.accumulated.errors,
          details: [...accumulated.details, ...data.batch_results.details],
        };

        // Report progress
        onProgress?.({
          currentBatch: batchIndex + 1,
          totalBatches,
          accumulated,
          isComplete: data.is_last_batch,
        });

        // Small delay between batches to not overwhelm the server
        if (!data.is_last_batch) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      return accumulated;
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
      list_type?: 'contacts' | 'organizations';
      max_pages?: number; // Max pages to fetch (default 20 = 2000 contacts)
    }): Promise<{ people: CRApolloPersonResult[]; pagination: any; list_name: string; list_type?: string }> => {
      const action = params.list_type === 'organizations' 
        ? 'search_organizations_from_list' 
        : 'search_from_list';
      
      console.log(`[useCRSearchFromList] Calling action: ${action} for list: ${params.list_id}`);
      
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
        body: { 
          action,
          list_id: params.list_id,
          max_pages: params.max_pages || 20,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return { 
        people: data.people, 
        pagination: data.pagination, 
        list_name: data.list_name,
        list_type: data.list_type,
      };
    },
    onSuccess: (data) => {
      const pagesInfo = data.pagination?.pages_fetched > 1 
        ? ` (${data.pagination.pages_fetched} páginas)` 
        : '';
      const typeLabel = data.list_type === 'organizations' ? 'empresas' : 'contactos';
      toast.success(`Cargados ${data.people.length} ${typeLabel} de "${data.list_name}"${pagesInfo}`);
    },
    onError: (error: Error) => {
      toast.error(`Error cargando lista: ${error.message}`);
    },
  });
};

// ============= DELETE IMPORT HOOK =============

export const useDeleteCRApolloImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: string): Promise<void> => {
      const { data, error } = await supabase.functions.invoke('cr-apollo-search-import', {
        body: { action: 'delete_import', import_id: importId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error eliminando importación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-apollo-import-history'] });
      toast.success('Importación eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error eliminando: ${error.message}`);
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
  const importInBatches = useImportCRApolloInBatches();
  const searchFromList = useCRSearchFromList();
  const deleteImport = useDeleteCRApolloImport();

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
    isImporting: importSelected.isPending || importInBatches.isPending,
    importResults: importSelected.data || importInBatches.data,

    // Batch import for large imports
    importInBatches: importInBatches.mutateAsync,
    isImportingInBatches: importInBatches.isPending,

    searchFromList: searchFromList.mutateAsync,
    isSearchingFromList: searchFromList.isPending,
    listResults: searchFromList.data,

    deleteImport: deleteImport.mutateAsync,
    isDeleting: deleteImport.isPending,
  };
};
