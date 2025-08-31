import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Simple, clear types
export interface Operation {
  id: string;
  company_name: string;
  sector: string;
  year: number;
  valuation_amount: number;
  valuation_currency: string;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  status: string;
  deal_type: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  ebitda_multiple?: number;
  growth_percentage?: number;
  company_size_employees?: string;
  highlights?: string[];
  logo_url?: string;
  featured_image_url?: string;
  display_locations?: string[];
}

export interface OperationsFilters {
  searchTerm?: string;
  sector?: string;
  sortBy?: string;
  limit?: number;
  displayLocation?: string;
  featured?: boolean;
}

export interface OperationsStats {
  totalOperations: number;
  avgMultiple: number;
  avgValuation: number;
  offMarketDeals: number;
}

// Ultra-simple hook - no cache, no singleton, just direct fetch
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

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simple query builder
      let query = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters.sector && filters.sector !== 'all') {
        query = query.eq('sector', filters.sector);
      }

      if (filters.displayLocation) {
        query = query.contains('display_locations', [filters.displayLocation]);
      }

      if (filters.searchTerm && filters.searchTerm.trim()) {
        query = query.or(
          `company_name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }

      // Simple sorting
      if (filters.sortBy === 'valuation') {
        query = query.order('valuation_amount', { ascending: false });
      } else if (filters.sortBy === 'year') {
        query = query.order('year', { ascending: false });
      } else {
        // Default: featured first, then by year
        query = query.order('is_featured', { ascending: false }).order('year', { ascending: false });
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const operations = data || [];
      
      // Get unique sectors for filter dropdown
      const uniqueSectors = [...new Set(operations.map(op => op.sector))].sort();

      setOperations(operations);
      setSectors(uniqueSectors);

      // Update stats
      if (operations.length > 0) {
        setStats({
          totalOperations: operations.length,
          avgMultiple: 6.8, // Static for now
          avgValuation: operations.reduce((sum, op) => sum + (op.valuation_amount || 0), 0) / operations.length / 1000000,
          offMarketDeals: 85 // Static for now
        });
      }

    } catch (err) {
      console.error('Error fetching operations:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setOperations([]);
      setSectors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple effect - refetch when filters change
  useEffect(() => {
    fetchOperations();
  }, [JSON.stringify(filters)]); // Simple dependency

  const refresh = () => {
    fetchOperations();
  };

  return {
    operations,
    sectors,
    stats,
    isLoading,
    error,
    refresh
  };
};