
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardFilters, FilterOptions } from '@/types/filters';
import { getDefaultFilters } from '@/types/filters';

// Hook para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  });

  return debouncedValue;
};

export const useAdvancedDashboardFilters = () => {
  const [filters, setFilters] = useState<DashboardFilters>(getDefaultFilters());
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  // Obtener sectores disponibles de la base de datos
  const { data: filterOptions } = useQuery({
    queryKey: ['dashboard-filter-options'],
    queryFn: async (): Promise<FilterOptions> => {
      const [caseStudiesResult, operationsResult] = await Promise.all([
        supabase.from('case_studies').select('sector').eq('is_active', true),
        supabase.from('company_operations').select('sector').eq('is_active', true)
      ]);

      const allSectors = [
        ...(caseStudiesResult.data?.map(item => item.sector) || []),
        ...(operationsResult.data?.map(item => item.sector) || [])
      ];

      const uniqueSectors = Array.from(new Set(allSectors)).sort();

      return {
        availableSectors: uniqueSectors
      };
    }
  });

  const updateDateRange = useCallback((start: Date, end: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  }, []);

  const updateSectors = useCallback((sectors: string[]) => {
    setFilters(prev => ({
      ...prev,
      sectors
    }));
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  const hasActiveFilters = useMemo(() => {
    const defaultFilters = getDefaultFilters();
    return (
      filters.sectors.length > 0 ||
      filters.searchQuery.trim() !== '' ||
      filters.dateRange.start.getTime() !== defaultFilters.dateRange.start.getTime() ||
      filters.dateRange.end.getTime() !== defaultFilters.dateRange.end.getTime()
    );
  }, [filters]);

  return {
    filters,
    debouncedSearchQuery,
    filterOptions: filterOptions || { availableSectors: [] },
    updateDateRange,
    updateSectors,
    updateSearchQuery,
    resetFilters,
    hasActiveFilters
  };
};
