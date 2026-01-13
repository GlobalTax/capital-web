import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= TYPES =============

export interface MNAApolloSearchCriteria {
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

export interface MNAApolloPersonResult {
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
  _is_organization?: boolean;
}

export interface MNAApolloSearchPreset {
  id: string;
  name: string;
  description: string;
  criteria: MNAApolloSearchCriteria;
}

export interface MNAApolloImportJob {
  id: string;
  search_criteria: MNAApolloSearchCriteria;
  total_results: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  credits_used: number;
  status: 'pending' | 'searching' | 'previewing' | 'importing' | 'completed' | 'failed' | 'cancelled';
  import_type?: 'contacts' | 'organizations';
  preview_data?: MNAApolloPersonResult[];
  import_results?: any[];
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface MNAImportResults {
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  details: Array<{
    name: string;
    success: boolean;
    action: 'created' | 'updated' | 'skipped';
    personId?: string;
    boutiqueId?: string;
    error?: string;
  }>;
}

export type MNAListType = 'contacts' | 'organizations';

// ============= HOOKS =============

export const useMNAApolloPresets = () => {
  return useQuery({
    queryKey: ['mna-apollo-presets'],
    queryFn: async (): Promise<MNAApolloSearchPreset[]> => {
      const { data, error } = await supabase.functions.invoke('mna-apollo-search-import', {
        body: { action: 'get_presets' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.presets;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useMNAApolloImportHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ['mna-apollo-import-history', limit],
    queryFn: async (): Promise<MNAApolloImportJob[]> => {
      const { data, error } = await supabase.functions.invoke('mna-apollo-search-import', {
        body: { action: 'get_history', limit },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.imports;
    },
    refetchInterval: 10000,
  });
};

export const useCreateMNAApolloImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { criteria: MNAApolloSearchCriteria; import_type?: MNAListType }): Promise<string> => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('mna-apollo-search-import', {
        body: { 
          action: 'create_import', 
          criteria: params.criteria,
          import_type: params.import_type || 'contacts',
          user_id: userData?.user?.id,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.import_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mna-apollo-import-history'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creando import: ${error.message}`);
    },
  });
};

export const useMNASearchFromList = () => {
  return useMutation({
    mutationFn: async (params: { 
      list_id: string; 
      list_type?: MNAListType;
      max_pages?: number;
    }): Promise<{ people: MNAApolloPersonResult[]; pagination: any; list_name: string; list_type?: string }> => {
      const action = params.list_type === 'organizations' 
        ? 'search_organizations_from_list' 
        : 'search_from_list';
      
      console.log(`[useMNASearchFromList] Calling action: ${action} for list: ${params.list_id}`);
      
      const { data, error } = await supabase.functions.invoke('mna-apollo-search-import', {
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
      const typeLabel = data.list_type === 'organizations' ? 'empresas' : 'contactos';
      toast.success(`Cargados ${data.people.length} ${typeLabel} de "${data.list_name}"`);
    },
    onError: (error: Error) => {
      toast.error(`Error cargando lista: ${error.message}`);
    },
  });
};

interface BatchImportProgress {
  currentBatch: number;
  totalBatches: number;
  accumulated: MNAImportResults;
  isComplete: boolean;
}

export const useImportMNAApolloInBatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      import_id: string;
      people: MNAApolloPersonResult[];
      enrich?: boolean;
      import_type?: 'people' | 'organizations';
      onProgress?: (progress: BatchImportProgress) => void;
    }): Promise<MNAImportResults> => {
      const { import_id, people, enrich = false, import_type = 'people', onProgress } = params;
      const BATCH_SIZE = 50;
      const totalBatches = Math.ceil(people.length / BATCH_SIZE);
      
      const action = import_type === 'organizations' ? 'import_organizations_batch' : 'import_batch';
      console.log(`[MNA Batch Import] Using action: ${action} for ${people.length} items`);
      
      let accumulated: MNAImportResults = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [],
      };

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        console.log(`[MNA Batch Import] Processing batch ${batchIndex + 1}/${totalBatches}`);
        
        const { data, error } = await supabase.functions.invoke('mna-apollo-search-import', {
          body: { 
            action,
            import_id,
            people,
            enrich,
            batch_index: batchIndex,
            batch_size: BATCH_SIZE,
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        accumulated = {
          imported: data.accumulated.imported,
          updated: data.accumulated.updated,
          skipped: data.accumulated.skipped,
          errors: data.accumulated.errors,
          details: [...accumulated.details, ...data.batch_results.details],
        };

        onProgress?.({
          currentBatch: batchIndex + 1,
          totalBatches,
          accumulated,
          isComplete: data.is_last_batch,
        });

        if (!data.is_last_batch) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      return accumulated;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['mna-apollo-import-history'] });
      queryClient.invalidateQueries({ queryKey: ['mna_boutiques'] });
      queryClient.invalidateQueries({ queryKey: ['mna_boutique_people'] });
      
      toast.success(
        `Importación completada: ${results.imported} nuevos, ${results.updated} actualizados`
      );
    },
    onError: (error: Error) => {
      toast.error(`Error en importación: ${error.message}`);
    },
  });
};

export const useDeleteMNAApolloImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: string): Promise<void> => {
      const { data, error } = await supabase.functions.invoke('mna-apollo-search-import', {
        body: { action: 'delete_import', import_id: importId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error eliminando importación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mna-apollo-import-history'] });
      toast.success('Importación eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error eliminando: ${error.message}`);
    },
  });
};

// ============= COMBINED HOOK =============

export const useMNAApolloSearchImport = () => {
  const presets = useMNAApolloPresets();
  const history = useMNAApolloImportHistory();
  const createImport = useCreateMNAApolloImport();
  const importInBatches = useImportMNAApolloInBatches();
  const searchFromList = useMNASearchFromList();
  const deleteImport = useDeleteMNAApolloImport();

  return {
    presets: presets.data || [],
    presetsLoading: presets.isLoading,
    
    history: history.data || [],
    historyLoading: history.isLoading,
    refetchHistory: history.refetch,
    
    createImport: createImport.mutateAsync,
    isCreatingImport: createImport.isPending,
    
    importInBatches: importInBatches.mutateAsync,
    isImporting: importInBatches.isPending,
    importResults: importInBatches.data,

    searchFromList: searchFromList.mutateAsync,
    isSearchingFromList: searchFromList.isPending,
    listResults: searchFromList.data,

    deleteImport: deleteImport.mutateAsync,
    isDeleting: deleteImport.isPending,
  };
};
