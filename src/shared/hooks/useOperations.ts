import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs para cancelar requests pendientes
  const abortControllerRef = useRef<AbortController | null>(null);
  const sectorsLoadedRef = useRef(false);
  
  // Memoize filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [
    filters.searchTerm,
    filters.sector,
    filters.displayLocation,
    filters.featured,
    filters.limit,
    filters.sortBy
  ]);

  const fetchOperations = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (memoizedFilters.featured !== undefined) {
        query = query.eq('is_featured', memoizedFilters.featured);
      }

      if (memoizedFilters.displayLocation) {
        query = query.contains('display_locations', [memoizedFilters.displayLocation]);
      }

      if (memoizedFilters.sector) {
        query = query.eq('sector', memoizedFilters.sector);
      }

      if (memoizedFilters.searchTerm) {
        query = query.or(
          `company_name.ilike.%${memoizedFilters.searchTerm}%,description.ilike.%${memoizedFilters.searchTerm}%`
        );
      }

      // Apply sorting
      switch (memoizedFilters.sortBy) {
        case 'valuation':
          query = query.order('valuation_amount', { ascending: false });
          break;
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('year', { ascending: false });
          break;
        default:
          query = query.order('year', { ascending: false });
      }

      if (memoizedFilters.limit) {
        query = query.limit(memoizedFilters.limit);
      }

      const { data, error } = await query;

      // Verificar si el request fue cancelado
      if (abortController.signal.aborted) {
        return;
      }

      if (error) {
        const errorMessage = error.message || 'Error desconocido';
        console.error('❌ Error fetching operations:', errorMessage, error);
        setError(`Error al cargar las operaciones: ${errorMessage}`);
        setOperations([]);
        setRetryCount(prev => prev + 1);
      } else {
        console.log('✅ Operations loaded successfully:', data?.length || 0, 'operations');
        setOperations(data || []);
        setRetryCount(0); // Reset retry count on success
        
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
    } catch (err: any) {
      // No mostrar error si fue cancelado
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      const errorMessage = err.message || 'Error inesperado';
      console.error('❌ Unexpected error:', errorMessage, err);
      setError(`Error inesperado: ${errorMessage}`);
      setOperations([]);
      setRetryCount(prev => prev + 1);
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [memoizedFilters]);

  const fetchSectors = useCallback(async () => {
    // Solo cargar sectores una vez
    if (sectorsLoadedRef.current) {
      return;
    }
    
    try {
      console.log('📊 Loading sectors...');
      const { data, error } = await supabase
        .from('company_operations')
        .select('sector')
        .eq('is_active', true)
        .not('sector', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching sectors:', error);
        return;
      }
      
      const uniqueSectors = [...new Set(data?.map(item => item.sector) || [])];
      setSectors(uniqueSectors);
      sectorsLoadedRef.current = true;
      console.log('✅ Sectors loaded:', uniqueSectors.length, 'sectors');
    } catch (error) {
      console.error('❌ Unexpected error fetching sectors:', error);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);
  
  useEffect(() => {
    fetchSectors();
  }, []); // Solo cargar sectores al montar el componente

  // Cleanup: cancelar requests pendientes al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refresh = useCallback(() => {
    setRetryCount(0);
    sectorsLoadedRef.current = false; // Permitir reload de sectores
    fetchOperations();
    fetchSectors();
  }, [fetchOperations, fetchSectors]);

  return {
    operations,
    sectors,
    stats,
    isLoading,
    error,
    refresh,
    retryCount
  };
};