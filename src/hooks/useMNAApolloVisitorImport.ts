import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= TYPES =============

export interface MNAApolloOrganization {
  id: string;
  name: string;
  website_url?: string;
  primary_domain?: string;
  linkedin_url?: string;
  industry?: string;
  estimated_num_employees?: number;
  city?: string;
  state?: string;
  country?: string;
  intent_level?: string;
  account_score?: number;
  short_description?: string;
  existsInBoutiques?: boolean;
  existingBoutiqueId?: string;
}

export interface MNAVisitorImport {
  id: string;
  status: 'pending' | 'previewing' | 'importing' | 'completed' | 'failed';
  list_id: string;
  list_type: string;
  list_name?: string;
  total_found: number;
  total_imported: number;
  total_updated: number;
  total_skipped: number;
  total_errors: number;
  imported_boutique_ids?: string[];
  imported_data: any;
  error_log: any;
  created_at: string;
  updated_at: string;
}

export interface MNAImportedBoutique {
  id: string;
  name: string;
  website: string | null;
  city: string | null;
  country: string | null;
  specialization: string | null;
  tier: string | null;
  status: string;
  apollo_org_id: string;
  apollo_last_synced_at: string;
}

export interface MNAImportResults {
  imported: number;
  updated: number;
  skipped: number;
  enriched?: number;
  errors: string[];
  boutiques: { id: string; name: string; apollo_org_id: string }[];
}

export interface WebsiteVisitorSearchParams {
  dateFrom: string;
  dateTo: string;
  intentLevels: string[];
  onlyNew: boolean;
}

// ============= HOOKS =============

export function useMNAApolloVisitorImport() {
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Create import job
  const createImport = async (listId: string, listType: string = 'website_visitors') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
      body: {
        action: 'create_import',
        list_id: listId,
        list_type: listType,
        user_id: user?.id,
      },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data.import as MNAVisitorImport;
  };

  // Search website visitors
  const searchWebsiteVisitors = async (
    params: WebsiteVisitorSearchParams,
    importId?: string,
    page: number = 1,
    perPage: number = 25
  ) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
        body: {
          action: 'search_website_visitors',
          date_from: params.dateFrom,
          date_to: params.dateTo,
          intent_levels: params.intentLevels,
          only_new: params.onlyNew,
          import_id: importId,
          page,
          per_page: perPage,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return {
        organizations: data.organizations as MNAApolloOrganization[],
        total: data.total as number,
        pagination: data.pagination,
        warning: data.warning,
      };
    } finally {
      setIsSearching(false);
    }
  };

  // Import selected organizations as boutiques
  const importOrganizations = async (
    organizations: MNAApolloOrganization[],
    importId?: string
  ): Promise<MNAImportResults> => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
        body: {
          action: 'import_organizations',
          organizations,
          import_id: importId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      queryClient.invalidateQueries({ queryKey: ['mna-visitor-imports'] });
      queryClient.invalidateQueries({ queryKey: ['mna-imported-boutiques'] });
      queryClient.invalidateQueries({ queryKey: ['mna-boutiques'] });
      
      const results = data.results as MNAImportResults;
      
      toast.success(`Importación completada: ${results.imported} nuevas, ${results.updated} actualizadas`);
      
      return results;
    } finally {
      setIsImporting(false);
    }
  };

  // Enrich and import in one step
  const enrichAndImport = async (
    params: WebsiteVisitorSearchParams,
    importId?: string
  ): Promise<MNAImportResults> => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
        body: {
          action: 'enrich_and_import',
          date_from: params.dateFrom,
          date_to: params.dateTo,
          intent_levels: params.intentLevels,
          only_new: params.onlyNew,
          import_id: importId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      queryClient.invalidateQueries({ queryKey: ['mna-visitor-imports'] });
      queryClient.invalidateQueries({ queryKey: ['mna-imported-boutiques'] });
      queryClient.invalidateQueries({ queryKey: ['mna-boutiques'] });
      
      const results = data.results as MNAImportResults;
      
      toast.success(
        `✅ Importación completada: ${results.imported} nuevas, ${results.updated} actualizadas, ${results.enriched || 0} enriquecidas.`
      );
      
      return results;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isSearching,
    isImporting,
    createImport,
    searchWebsiteVisitors,
    importOrganizations,
    enrichAndImport,
  };
}

// Get import history
export function useMNAVisitorImportHistory(limit: number = 20) {
  return useQuery({
    queryKey: ['mna-visitor-imports', limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
        body: {
          action: 'get_history',
          limit,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.imports as MNAVisitorImport[];
    },
  });
}

// Get imported boutiques
export function useMNAImportedBoutiques() {
  return useQuery({
    queryKey: ['mna-imported-boutiques'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
        body: { action: 'get_imported_boutiques' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return {
        boutiques: data.boutiques as MNAImportedBoutique[],
        total: data.total as number,
      };
    },
  });
}

// Delete import from history
export function useDeleteMNAVisitorImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: string): Promise<void> => {
      const { data, error } = await supabase.functions.invoke('mna-apollo-visitor-import', {
        body: { action: 'delete_import', import_id: importId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error eliminando importación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mna-visitor-imports'] });
      toast.success('Importación eliminada del historial');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}