import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  highlights?: string[];
  ebitda_multiple?: number;
  growth_percentage?: number;
  revenue_amount?: number;
  ebitda_amount?: number;
  status?: string;
  deal_type?: string;
  logo_url?: string;
  featured_image_url?: string;
  display_locations?: string[];
  company_size_employees?: string;
}

export interface OperationsFilters {
  searchTerm?: string;
  sector?: string;
  displayLocation?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: 'year' | 'valuation' | 'featured';
}

export interface OperationsStats {
  totalOperations: number;
  avgMultiple: number;
  avgValuation: number;
  offMarketDeals: number;
}

export const useOperations = (filters: OperationsFilters = {}) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [stats, setStats] = useState<OperationsStats>({
    totalOperations: 0,
    avgMultiple: 6.8,
    avgValuation: 8.5,
    offMarketDeals: 85
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters.displayLocation) {
        query = query.contains('display_locations', [filters.displayLocation]);
      }

      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters.searchTerm) {
        query = query.or(
          `company_name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'valuation':
          query = query.order('valuation_amount', { ascending: false });
          break;
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('year', { ascending: false });
          break;
        default:
          query = query.order('year', { ascending: false });
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching operations:', error);
        setError('Error al cargar las operaciones');
        setOperations([]);
      } else {
        setOperations(data || []);
        
        // Update stats if we have data
        if (data && data.length > 0) {
          const totalCount = await supabase
            .from('company_operations')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
          
          setStats(prev => ({
            ...prev,
            totalOperations: totalCount.count || data.length
          }));
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error inesperado al cargar las operaciones');
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchSectors = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('company_operations')
        .select('sector')
        .eq('is_active', true)
        .not('sector', 'is', null);
      
      const uniqueSectors = [...new Set(data?.map(item => item.sector) || [])];
      setSectors(uniqueSectors);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
    fetchSectors();
  }, [fetchOperations, fetchSectors]);

  const refresh = useCallback(() => {
    fetchOperations();
    fetchSectors();
  }, [fetchOperations, fetchSectors]);

  return {
    operations,
    sectors,
    stats,
    isLoading,
    error,
    refresh
  };
};