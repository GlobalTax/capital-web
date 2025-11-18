import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '../types/operations';
import { AdvancedSearchFilters, SavedSearch } from '../types/history';
import { useToast } from '@/hooks/use-toast';

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Construir query dinámica
  const buildQuery = (filters: AdvancedSearchFilters) => {
    let query = supabase
      .from('company_operations')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    // Full-text search
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Filters
    if (filters.sector && filters.sector.length > 0) {
      query = query.in('sector', filters.sector);
    }
    if (filters.subsector && filters.subsector.length > 0) {
      query = query.in('subsector', filters.subsector);
    }
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.deal_type && filters.deal_type.length > 0) {
      query = query.in('deal_type', filters.deal_type);
    }
    if (filters.assigned_to && filters.assigned_to.length > 0) {
      query = query.in('assigned_to', filters.assigned_to);
    }
    if (filters.company_size_employees && filters.company_size_employees.length > 0) {
      query = query.in('company_size_employees', filters.company_size_employees);
    }

    // Valuation range
    if (filters.valuation_min !== undefined) {
      query = query.gte('valuation_amount', filters.valuation_min);
    }
    if (filters.valuation_max !== undefined) {
      query = query.lte('valuation_amount', filters.valuation_max);
    }

    // Revenue range
    if (filters.revenue_min !== undefined) {
      query = query.gte('revenue_amount', filters.revenue_min);
    }
    if (filters.revenue_max !== undefined) {
      query = query.lte('revenue_amount', filters.revenue_max);
    }

    // EBITDA range
    if (filters.ebitda_min !== undefined) {
      query = query.gte('ebitda_amount', filters.ebitda_min);
    }
    if (filters.ebitda_max !== undefined) {
      query = query.lte('ebitda_amount', filters.ebitda_max);
    }

    // Year
    if (filters.year && filters.year.length > 0) {
      query = query.in('year', filters.year);
    }

    // Boolean filters
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    // Date ranges
    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after);
    }
    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before);
    }
    if (filters.updated_after) {
      query = query.gte('updated_at', filters.updated_after);
    }
    if (filters.updated_before) {
      query = query.lte('updated_at', filters.updated_before);
    }

    return query.order('updated_at', { ascending: false });
  };

  // Search results
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['operations-advanced-search', filters],
    queryFn: async () => {
      const query = buildQuery(filters);
      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: Object.keys(filters).length > 0,
  });

  // Saved searches
  const { data: savedSearches } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: async (): Promise<SavedSearch[]> => {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: async ({ name, isShared }: { name: string; isShared: boolean }) => {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!adminUser) throw new Error('Usuario no autorizado');

      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{
          user_id: adminUser.user_id,
          name,
          filters: filters as any,
          is_shared: isShared,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({
        title: 'Búsqueda guardada',
        description: 'La búsqueda se ha guardado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la búsqueda',
        variant: 'destructive',
      });
    },
  });

  // Delete search mutation
  const deleteSearchMutation = useMutation({
    mutationFn: async (searchId: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({
        title: 'Búsqueda eliminada',
        description: 'La búsqueda se ha eliminado correctamente',
      });
    },
  });

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    filters,
    setFilters,
    results: results?.data || [],
    totalCount: results?.count || 0,
    isLoading,
    error,
    hasActiveFilters,
    savedSearches: savedSearches || [],
    saveSearch: saveSearchMutation.mutate,
    deleteSearch: deleteSearchMutation.mutate,
    isSaving: saveSearchMutation.isPending,
    isDeleting: deleteSearchMutation.isPending,
    clearFilters: () => setFilters({}),
    applySearch: (search: SavedSearch) => setFilters(search.filters),
  };
};
