import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= TYPES =============

export interface ApolloOrganization {
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
  existsInEmpresas?: boolean;
  existingEmpresaId?: string;
}

export interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title?: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  phone_numbers?: Array<{ raw_number: string; sanitized_number: string; type: string }>;
  organization_id?: string;
  organization?: ApolloOrganization;
}

export interface VisitorImport {
  id: string;
  status: 'pending' | 'searching' | 'importing' | 'completed' | 'failed';
  list_id: string;
  list_type: 'static' | 'dynamic';
  import_type: 'organizations' | 'contacts';
  total_found: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  error_message: string | null;
  results: any;
  created_at: string;
  updated_at: string;
}

export interface ImportedEmpresa {
  id: string;
  nombre: string;
  sitio_web: string | null;
  sector: string | null;
  ubicacion: string | null;
  empleados: string | null;
  apollo_org_id: string;
  apollo_intent_level: string | null;
  apollo_score: number | null;
  apollo_last_synced_at: string;
}

export interface ImportResults {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
  empresas: { id: string; name: string; apollo_org_id: string }[];
  contacts: {
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
}

export interface ImportOptions {
  autoImportContacts?: boolean;
  maxContactsPerCompany?: number;
}

export interface WebsiteVisitorSearchParams {
  dateFrom: string;
  dateTo: string;
  intentLevels: string[];
  onlyNew: boolean;
}

export interface EnrichAndImportParams extends WebsiteVisitorSearchParams {
  autoImportContacts?: boolean;
  maxContactsPerCompany?: number;
}

export interface EnrichAndImportResults extends ImportResults {
  enriched: number;
}

// ============= HOOKS =============

export function useApolloVisitorImport() {
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Create import job
  const createImport = async (listId: string, listType: 'contacts' | 'accounts' | 'static' | 'dynamic' = 'contacts') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
      body: {
        action: 'create_import',
        list_id: listId,
        list_type: listType,
        user_id: user?.id,
      },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data.import as VisitorImport;
  };

  // Search organizations from Apollo list
  const searchOrganizations = async (
    listId: string, 
    listType: 'contacts' | 'accounts' = 'contacts',
    importId?: string,
    page: number = 1,
    perPage: number = 25
  ) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
        body: {
          action: 'search_organizations',
          list_id: listId,
          list_type: listType,
          import_id: importId,
          page,
          per_page: perPage,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return {
        organizations: data.organizations as ApolloOrganization[],
        total: data.total as number,
        pagination: data.pagination,
      };
    } finally {
      setIsSearching(false);
    }
  };

  // Search website visitors with native Apollo filters (date range + intent)
  const searchWebsiteVisitors = async (
    params: WebsiteVisitorSearchParams,
    importId?: string,
    page: number = 1,
    perPage: number = 25
  ) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
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
        organizations: data.organizations as ApolloOrganization[],
        total: data.total as number,
        pagination: data.pagination,
      };
    } finally {
      setIsSearching(false);
    }
  };

  // Import selected organizations with optional auto-import contacts
  const importOrganizations = async (
    organizations: ApolloOrganization[],
    importId?: string,
    options: ImportOptions = {}
  ): Promise<ImportResults> => {
    const { autoImportContacts = false, maxContactsPerCompany = 5 } = options;
    
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
        body: {
          action: 'import_organizations',
          organizations,
          import_id: importId,
          auto_import_contacts: autoImportContacts,
          max_contacts_per_company: maxContactsPerCompany,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      queryClient.invalidateQueries({ queryKey: ['apollo-visitor-imports'] });
      queryClient.invalidateQueries({ queryKey: ['apollo-imported-empresas'] });
      queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
      
      const results = data.results as ImportResults;
      
      // Show toast with combined results
      if (autoImportContacts) {
        toast.success(
          `Importación completada: ${results.imported} empresas nuevas, ${results.updated} actualizadas. ` +
          `Contactos: ${results.contacts.imported} nuevos, ${results.contacts.updated} actualizados.`
        );
      } else {
        toast.success(`Importación completada: ${results.imported} nuevas, ${results.updated} actualizadas`);
      }
      
      return results;
    } finally {
      setIsImporting(false);
    }
  };

  // Search contacts for a company
  const searchContacts = async (
    apolloOrgId: string,
    page: number = 1,
    perPage: number = 25
  ) => {
    const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
      body: {
        action: 'search_contacts',
        apollo_org_id: apolloOrgId,
        page,
        per_page: perPage,
      },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return {
      contacts: data.contacts as ApolloPerson[],
      total: data.total as number,
      pagination: data.pagination,
    };
  };

  // Import contacts to contact_leads
  const importContacts = async (
    contacts: ApolloPerson[],
    empresaId: string
  ) => {
    const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
      body: {
        action: 'import_contacts',
        contacts,
        empresa_id: empresaId,
      },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
    
    const results = data.results;
    toast.success(`Contactos importados: ${results.imported} nuevos, ${results.updated} actualizados`);
    
    return results;
  };

  // NEW: Enrich and import in one step (Camino A)
  const enrichAndImport = async (
    params: EnrichAndImportParams,
    importId?: string
  ): Promise<EnrichAndImportResults> => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
        body: {
          action: 'enrich_and_import',
          date_from: params.dateFrom,
          date_to: params.dateTo,
          intent_levels: params.intentLevels,
          only_new: params.onlyNew,
          auto_import_contacts: params.autoImportContacts ?? false,
          max_contacts_per_company: params.maxContactsPerCompany ?? 5,
          import_id: importId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      queryClient.invalidateQueries({ queryKey: ['apollo-visitor-imports'] });
      queryClient.invalidateQueries({ queryKey: ['apollo-imported-empresas'] });
      queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
      
      const results = data.results as EnrichAndImportResults;
      
      toast.success(
        `✅ Importación completada: ${results.imported} nuevas, ${results.updated} actualizadas, ${results.enriched} enriquecidas. ` +
        (params.autoImportContacts ? `Contactos: ${results.contacts.imported} nuevos.` : '')
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
    searchOrganizations,
    searchWebsiteVisitors,
    importOrganizations,
    searchContacts,
    importContacts,
    enrichAndImport,
  };
}

// Get import history
export function useVisitorImportHistory(limit: number = 20) {
  return useQuery({
    queryKey: ['apollo-visitor-imports', limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
        body: {
          action: 'get_history',
          limit,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.imports as VisitorImport[];
    },
  });
}

// Get imported empresas (all, no limit)
export function useImportedEmpresas() {
  return useQuery({
    queryKey: ['apollo-imported-empresas'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
        body: { action: 'get_imported_empresas' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return {
        empresas: data.empresas as ImportedEmpresa[],
        total: data.total as number,
      };
    },
  });
}

// Delete import from history
export function useDeleteVisitorImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: string): Promise<void> => {
      const { data, error } = await supabase.functions.invoke('apollo-visitor-import', {
        body: { action: 'delete_import', import_id: importId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error eliminando importación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apollo-visitor-imports'] });
      toast.success('Importación eliminada del historial');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
