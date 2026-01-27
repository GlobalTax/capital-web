import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface TopBarConfig {
  id: string;
  phone_number: string;
  phone_link: string;
  show_search: boolean;
  show_language_selector: boolean;
  updated_at: string;
}

export interface TopBarLink {
  id: string;
  label: string;
  href: string;
  is_external: boolean;
  position: number;
  is_active: boolean;
}

export interface GroupCompany {
  id: string;
  name: string;
  url: string;
  logo_url: string | null;
  is_current: boolean;
  position: number;
  is_active: boolean;
}

// Default values for fallback
const DEFAULT_CONFIG: Omit<TopBarConfig, 'id' | 'updated_at'> = {
  phone_number: '695 717 490',
  phone_link: '+34695717490',
  show_search: true,
  show_language_selector: true,
};

const DEFAULT_LINKS: Omit<TopBarLink, 'id'>[] = [
  { label: 'Calculadora', href: '/lp/calculadora-web', is_external: false, position: 1, is_active: true },
  { label: 'Blog', href: '/blog', is_external: false, position: 2, is_active: true },
  { label: 'Casos de Éxito', href: '/casos-exito', is_external: false, position: 3, is_active: true },
  { label: 'Partners', href: '/colaboradores', is_external: false, position: 4, is_active: true },
];

// Query keys
const QUERY_KEYS = {
  config: ['topbar', 'config'] as const,
  links: ['topbar', 'links'] as const,
  companies: ['topbar', 'companies'] as const,
};

/**
 * Hook for reading TopBar configuration (public use)
 */
export const useTopBarConfig = () => {
  // Fetch config
  const configQuery = useQuery({
    queryKey: QUERY_KEYS.config,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topbar_config')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.warn('TopBar config fetch error, using defaults:', error);
        return null;
      }
      return data as TopBarConfig;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch links
  const linksQuery = useQuery({
    queryKey: QUERY_KEYS.links,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topbar_links')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) {
        console.warn('TopBar links fetch error, using defaults:', error);
        return [];
      }
      return data as TopBarLink[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch companies
  const companiesQuery = useQuery({
    queryKey: QUERY_KEYS.companies,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topbar_group_companies')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) {
        console.warn('TopBar companies fetch error:', error);
        return [];
      }
      return data as GroupCompany[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Merge with defaults
  const config = configQuery.data || DEFAULT_CONFIG;
  const links = linksQuery.data?.length ? linksQuery.data : DEFAULT_LINKS.map((l, i) => ({ ...l, id: `default-${i}` }));
  const companies = companiesQuery.data || [];

  return {
    config,
    links,
    companies,
    isLoading: configQuery.isLoading || linksQuery.isLoading || companiesQuery.isLoading,
    isError: configQuery.isError && linksQuery.isError,
  };
};

/**
 * Hook for managing TopBar configuration (admin use)
 */
export const useTopBarAdmin = () => {
  const queryClient = useQueryClient();

  // Fetch all links (including inactive)
  const allLinksQuery = useQuery({
    queryKey: [...QUERY_KEYS.links, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topbar_links')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as TopBarLink[];
    },
  });

  // Fetch all companies (including inactive)
  const allCompaniesQuery = useQuery({
    queryKey: [...QUERY_KEYS.companies, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topbar_group_companies')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as GroupCompany[];
    },
  });

  // Fetch config
  const configQuery = useQuery({
    queryKey: QUERY_KEYS.config,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topbar_config')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as TopBarConfig;
    },
  });

  // Invalidate all queries
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['topbar'] });
  };

  // Update config
  const updateConfig = useMutation({
    mutationFn: async (data: Partial<TopBarConfig>) => {
      const currentConfig = configQuery.data;
      if (!currentConfig?.id) throw new Error('No config found');
      
      const { error } = await supabase
        .from('topbar_config')
        .update(data)
        .eq('id', currentConfig.id);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  // Link mutations
  const createLink = useMutation({
    mutationFn: async (data: Omit<TopBarLink, 'id'>) => {
      const { error } = await supabase
        .from('topbar_links')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TopBarLink> }) => {
      const { error } = await supabase
        .from('topbar_links')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('topbar_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const reorderLinks = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase.from('topbar_links').update({ position: index + 1 }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: invalidateAll,
  });

  // Company mutations
  const createCompany = useMutation({
    mutationFn: async (data: Omit<GroupCompany, 'id'>) => {
      const { error } = await supabase
        .from('topbar_group_companies')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GroupCompany> }) => {
      const { error } = await supabase
        .from('topbar_group_companies')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('topbar_group_companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const reorderCompanies = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase.from('topbar_group_companies').update({ position: index + 1 }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: invalidateAll,
  });

  return {
    // Data
    config: configQuery.data,
    links: allLinksQuery.data || [],
    companies: allCompaniesQuery.data || [],
    isLoading: configQuery.isLoading || allLinksQuery.isLoading || allCompaniesQuery.isLoading,
    
    // Config mutations
    updateConfig,
    
    // Link mutations
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    
    // Company mutations
    createCompany,
    updateCompany,
    deleteCompany,
    reorderCompanies,
  };
};
