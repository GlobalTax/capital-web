import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCentralizedErrorHandler } from '@/hooks/useCentralizedErrorHandler';

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
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Refs para cancelar requests pendientes
  const abortControllerRef = useRef<AbortController | null>(null);
  const sectorsLoadedRef = useRef(false);
  const lastSuccessfulDataRef = useRef<Operation[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { handleAsyncError, logError } = useCentralizedErrorHandler();
  
  // Memoize filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [
    filters.searchTerm,
    filters.sector,
    filters.displayLocation,
    filters.featured,
    filters.limit,
    filters.sortBy
  ]);

  // Función para serializar errores correctamente
  const serializeError = (error: any): string => {
    if (!error) return 'Error desconocido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };

  // Función para determinar si es un error temporal
  const isTemporaryError = (error: any): boolean => {
    const errorMsg = serializeError(error).toLowerCase();
    return errorMsg.includes('network') || 
           errorMsg.includes('timeout') || 
           errorMsg.includes('fetch') ||
           errorMsg.includes('connection') ||
           error?.status >= 500 ||
           error?.name === 'NetworkError';
  };

  // Función para calcular delay de retry con backoff exponencial
  const getRetryDelay = (attempt: number): number => {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 segundos
  };

  const fetchOperationsWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
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
      
      if (attempt > 0) {
        setIsRetrying(true);
      }

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
        const serializedError = serializeError(error);
        
        // Log del error con contexto mejorado
        logError(new Error(serializedError), {
          component: 'useOperations',
          action: 'fetchOperations',
          metadata: { 
            attempt: attempt + 1, 
            filters: memoizedFilters,
            errorCode: error.code,
            errorDetails: error.details
          }
        });

        // Si es error temporal y no hemos alcanzado el máximo de reintentos
        if (isTemporaryError(error) && attempt < 3) {
          const delay = getRetryDelay(attempt);
          setRetryCount(attempt + 1);
          
          retryTimeoutRef.current = setTimeout(() => {
            fetchOperationsWithRetry(attempt + 1);
          }, delay);
          return;
        }

        // Error permanente o máximo de reintentos alcanzado
        setError(`Error al cargar las operaciones: ${serializedError}`);
        
        // Si tenemos datos previos exitosos, mostrarlos
        if (lastSuccessfulDataRef.current.length > 0) {
          setOperations(lastSuccessfulDataRef.current);
        } else {
          setOperations([]);
        }
        
        setRetryCount(attempt + 1);
      } else {
        console.log('✅ Operations loaded successfully:', data?.length || 0, 'operations');
        const loadedOperations = data || [];
        setOperations(loadedOperations);
        lastSuccessfulDataRef.current = loadedOperations; // Guardar datos exitosos
        setRetryCount(0);
        
        // Update stats if we have data
        if (data && data.length > 0) {
          try {
            const totalCount = await supabase
              .from('company_operations')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true);
            
            setStats(prev => ({
              ...prev,
              totalOperations: totalCount.count || data.length
            }));
          } catch (statsError) {
            // Si falla la estadística, no es crítico
            logError(new Error(serializeError(statsError)), {
              component: 'useOperations',
              action: 'fetchStats'
            });
          }
        }
      }
    } catch (err: any) {
      // No mostrar error si fue cancelado
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      const serializedError = serializeError(err);
      
      logError(err, {
        component: 'useOperations',
        action: 'fetchOperations',
        metadata: { attempt: attempt + 1, filters: memoizedFilters }
      });

      // Si es error temporal y no hemos alcanzado el máximo de reintentos
      if (isTemporaryError(err) && attempt < 3) {
        const delay = getRetryDelay(attempt);
        setRetryCount(attempt + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchOperationsWithRetry(attempt + 1);
        }, delay);
        return;
      }

      // Error permanente o máximo de reintentos alcanzado
      setError(`Error inesperado: ${serializedError}`);
      
      // Si tenemos datos previos exitosos, mostrarlos
      if (lastSuccessfulDataRef.current.length > 0) {
        setOperations(lastSuccessfulDataRef.current);
      } else {
        setOperations([]);
      }
      
      setRetryCount(attempt + 1);
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
  }, [memoizedFilters, logError]);

  const fetchOperations = useCallback(() => {
    // Limpiar timeout anterior si existe
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    fetchOperationsWithRetry(0);
  }, [fetchOperationsWithRetry]);

  const fetchSectors = useCallback(async () => {
    // Solo cargar sectores una vez
    if (sectorsLoadedRef.current) {
      return;
    }
    
    await handleAsyncError(async () => {
      console.log('📊 Loading sectors...');
      const { data, error } = await supabase
        .from('company_operations')
        .select('sector')
        .eq('is_active', true)
        .not('sector', 'is', null);
      
      if (error) {
        throw new Error(serializeError(error));
      }
      
      const uniqueSectors = [...new Set(data?.map(item => item.sector) || [])];
      setSectors(uniqueSectors);
      sectorsLoadedRef.current = true;
      console.log('✅ Sectors loaded:', uniqueSectors.length, 'sectors');
    }, {
      component: 'useOperations',
      action: 'fetchSectors'
    });
  }, [handleAsyncError]);

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
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const refresh = useCallback(() => {
    // Limpiar timeouts y estados
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setRetryCount(0);
    setError(null);
    setIsRetrying(false);
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
    retryCount,
    isRetrying
  };
};