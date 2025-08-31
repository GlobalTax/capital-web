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

// Circuit Breaker y singleton request management
let globalRequestLock = false;
let globalCacheData: { operations: Operation[]; sectors: string[]; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 segundos
const REQUEST_THROTTLE_MS = 1000; // 1 segundo entre requests

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
  
  // Refs para control de requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const filtersStringRef = useRef<string>('');
  
  const { logError } = useCentralizedErrorHandler();

  // Crear string estable de filtros para evitar loops
  const filtersString = JSON.stringify({
    searchTerm: filters.searchTerm || '',
    sector: filters.sector || '',
    displayLocation: filters.displayLocation || '',
    featured: filters.featured,
    limit: filters.limit,
    sortBy: filters.sortBy || 'year'
  });

  // Circuit breaker: verificar cache válido
  const getCachedData = useCallback(() => {
    if (globalCacheData && (Date.now() - globalCacheData.timestamp) < CACHE_TTL) {
      return globalCacheData;
    }
    return null;
  }, []);

  // Función para serializar errores
  const serializeError = useCallback((error: any): string => {
    if (!error) return 'Error desconocido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    return 'Error de conexión';
  }, []);

  // Circuit breaker: función principal de fetch con protección
  const fetchData = useCallback(async () => {
    // Prevenir loop infinito - verificar si ya hay request en curso
    if (globalRequestLock) {
      console.log('🚫 Request bloqueado por Circuit Breaker');
      return;
    }

    // Verificar throttling
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_THROTTLE_MS) {
      console.log('⏰ Request throttleado');
      return;
    }

    // Verificar cache válido
    const cached = getCachedData();
    if (cached) {
      console.log('📦 Usando datos del cache');
      setOperations(cached.operations);
      setSectors(cached.sectors);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Solo proceder si el componente está montado
    if (!mountedRef.current) return;

    // Activar circuit breaker
    globalRequestLock = true;
    lastRequestTimeRef.current = now;

    try {
      // Cancelar request anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      setIsLoading(true);
      setError(null);

      // Construir query con timeout
      const signal = AbortSignal.timeout ? AbortSignal.timeout(10000) : abortController.signal;
      
      let operationsQuery = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true)
        .abortSignal(signal);

      // Aplicar filtros solo si existen
      const parsedFilters = JSON.parse(filtersString);
      
      if (parsedFilters.featured !== undefined) {
        operationsQuery = operationsQuery.eq('is_featured', parsedFilters.featured);
      }

      if (parsedFilters.displayLocation) {
        operationsQuery = operationsQuery.contains('display_locations', [parsedFilters.displayLocation]);
      }

      if (parsedFilters.sector) {
        operationsQuery = operationsQuery.eq('sector', parsedFilters.sector);
      }

      if (parsedFilters.searchTerm) {
        operationsQuery = operationsQuery.or(
          `company_name.ilike.%${parsedFilters.searchTerm}%,description.ilike.%${parsedFilters.searchTerm}%`
        );
      }

      // Aplicar sorting
      switch (parsedFilters.sortBy) {
        case 'valuation':
          operationsQuery = operationsQuery.order('valuation_amount', { ascending: false });
          break;
        case 'featured':
          operationsQuery = operationsQuery.order('is_featured', { ascending: false }).order('year', { ascending: false });
          break;
        default:
          operationsQuery = operationsQuery.order('year', { ascending: false });
      }

      if (parsedFilters.limit) {
        operationsQuery = operationsQuery.limit(parsedFilters.limit);
      }

      // Fetch paralelo de operaciones y sectores
      const [operationsResult, sectorsResult] = await Promise.all([
        operationsQuery,
        supabase
          .from('company_operations')
          .select('sector')
          .eq('is_active', true)
          .not('sector', 'is', null)
          .abortSignal(signal)
      ]);

      // Verificar cancelación
      if (abortController.signal.aborted || !mountedRef.current) {
        return;
      }

      if (operationsResult.error) {
        throw new Error(serializeError(operationsResult.error));
      }

      if (sectorsResult.error) {
        console.warn('Error cargando sectores:', serializeError(sectorsResult.error));
      }

      const loadedOperations = operationsResult.data || [];
      const uniqueSectors = [...new Set(sectorsResult.data?.map(item => item.sector).filter(Boolean) || [])];

      // Actualizar cache global
      globalCacheData = {
        operations: loadedOperations,
        sectors: uniqueSectors,
        timestamp: Date.now()
      };

      console.log('✅ Datos cargados exitosamente:', loadedOperations.length, 'operaciones,', uniqueSectors.length, 'sectores');
      
      if (mountedRef.current) {
        setOperations(loadedOperations);
        setSectors(uniqueSectors);
        setError(null);
        setRetryCount(0);
      }

    } catch (err: any) {
      if (err.name === 'AbortError' || !mountedRef.current) {
        return;
      }

      const errorMessage = serializeError(err);
      console.error('❌ Error fetching data:', errorMessage);
      
      logError(err, {
        component: 'useOperations',
        action: 'fetchData'
      });

      if (mountedRef.current) {
        setError(`Error de conexión: ${errorMessage}`);
        
        // Usar cache si está disponible aunque sea viejo
        if (globalCacheData) {
          setOperations(globalCacheData.operations);
          setSectors(globalCacheData.sectors);
        }
      }
    } finally {
      // Liberar circuit breaker después de un delay
      setTimeout(() => {
        globalRequestLock = false;
      }, 500);
      
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
  }, [filtersString, getCachedData, serializeError, logError]);

  // Effect principal - solo ejecutar cuando cambien los filtros
  useEffect(() => {
    if (filtersStringRef.current !== filtersString) {
      filtersStringRef.current = filtersString;
      fetchData();
    }
  }, [filtersString, fetchData]);

  // Effect de montaje - ejecutar solo una vez
  useEffect(() => {
    mountedRef.current = true;
    
    // Cargar datos inmediatamente si no hay cache
    if (!getCachedData()) {
      fetchData();
    } else {
      const cached = getCachedData()!;
      setOperations(cached.operations);
      setSectors(cached.sectors);
      setIsLoading(false);
    }

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refresh = useCallback(() => {
    globalCacheData = null; // Limpiar cache
    filtersStringRef.current = ''; // Forzar recarga
    setRetryCount(0);
    setError(null);
    setIsRetrying(false);
    fetchData();
  }, [fetchData]);

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