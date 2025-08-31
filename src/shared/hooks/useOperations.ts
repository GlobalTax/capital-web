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

// SINGLETON GLOBAL DEFINITIVO - Evita múltiples instancias del hook
class OperationsManager {
  private static instance: OperationsManager;
  private globalRequestLock = false;
  private globalCacheData: { operations: Operation[]; sectors: string[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 30000; // 30 segundos
  private readonly REQUEST_THROTTLE_MS = 1000; // 1 segundo entre requests
  private lastRequestTime = 0;
  private activeRequests = new Set<string>();
  private subscribers = new Map<string, Array<(data: any) => void>>();

  static getInstance(): OperationsManager {
    if (!OperationsManager.instance) {
      OperationsManager.instance = new OperationsManager();
    }
    return OperationsManager.instance;
  }

  getCachedData() {
    if (this.globalCacheData && (Date.now() - this.globalCacheData.timestamp) < this.CACHE_TTL) {
      return this.globalCacheData;
    }
    return null;
  }

  isRequestInProgress(filtersKey: string): boolean {
    return this.activeRequests.has(filtersKey) || this.globalRequestLock;
  }

  async fetchOperations(filters: OperationsFilters): Promise<{ operations: Operation[]; sectors: string[]; error?: string }> {
    const filtersKey = JSON.stringify(filters);
    
    // Verificar cache válido
    const cached = this.getCachedData();
    if (cached) {
      console.log('📦 Usando datos del cache global');
      return { operations: cached.operations, sectors: cached.sectors };
    }

    // Verificar si ya hay una petición en progreso para estos filtros
    if (this.isRequestInProgress(filtersKey)) {
      console.log('🚫 Request ya en progreso, esperando...');
      return new Promise((resolve) => {
        if (!this.subscribers.has(filtersKey)) {
          this.subscribers.set(filtersKey, []);
        }
        this.subscribers.get(filtersKey)!.push(resolve);
      });
    }

    // Throttling global
    const now = Date.now();
    if (now - this.lastRequestTime < this.REQUEST_THROTTLE_MS) {
      console.log('⏰ Request throttleado globalmente');
      return { operations: [], sectors: [], error: 'Request throttleado' };
    }

    // Iniciar request
    this.globalRequestLock = true;
    this.lastRequestTime = now;
    this.activeRequests.add(filtersKey);

    try {
      console.log('🔄 Iniciando fetch global con filtros:', filters);

      // Construir query
      let operationsQuery = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true);

      // Aplicar filtros
      if (filters.featured !== undefined) {
        operationsQuery = operationsQuery.eq('is_featured', filters.featured);
      }
      if (filters.displayLocation) {
        operationsQuery = operationsQuery.contains('display_locations', [filters.displayLocation]);
      }
      if (filters.sector) {
        operationsQuery = operationsQuery.eq('sector', filters.sector);
      }
      if (filters.searchTerm) {
        operationsQuery = operationsQuery.or(
          `company_name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }

      // Aplicar sorting
      switch (filters.sortBy) {
        case 'valuation':
          operationsQuery = operationsQuery.order('valuation_amount', { ascending: false });
          break;
        case 'featured':
          operationsQuery = operationsQuery.order('is_featured', { ascending: false }).order('year', { ascending: false });
          break;
        default:
          operationsQuery = operationsQuery.order('year', { ascending: false });
      }

      if (filters.limit) {
        operationsQuery = operationsQuery.limit(filters.limit);
      }

      // Fetch paralelo
      const [operationsResult, sectorsResult] = await Promise.all([
        operationsQuery,
        supabase
          .from('company_operations')
          .select('sector')
          .eq('is_active', true)
          .not('sector', 'is', null)
      ]);

      if (operationsResult.error) {
        throw new Error(operationsResult.error.message);
      }

      const operations = operationsResult.data || [];
      const sectors = [...new Set(sectorsResult.data?.map(item => item.sector).filter(Boolean) || [])];

      // Actualizar cache global
      this.globalCacheData = {
        operations,
        sectors,
        timestamp: Date.now()
      };

      console.log('✅ Datos cargados globalmente:', operations.length, 'operaciones,', sectors.length, 'sectores');

      const result = { operations, sectors };

      // Notificar a todos los subscribers
      const subscribers = this.subscribers.get(filtersKey) || [];
      subscribers.forEach(callback => callback(result));
      this.subscribers.delete(filtersKey);

      return result;

    } catch (error: any) {
      console.error('❌ Error en fetch global:', error.message);
      
      const result = { 
        operations: this.globalCacheData?.operations || [], 
        sectors: this.globalCacheData?.sectors || [], 
        error: error.message 
      };

      // Notificar error a subscribers
      const subscribers = this.subscribers.get(filtersKey) || [];
      subscribers.forEach(callback => callback(result));
      this.subscribers.delete(filtersKey);

      return result;

    } finally {
      // Liberar locks
      setTimeout(() => {
        this.globalRequestLock = false;
        this.activeRequests.delete(filtersKey);
      }, 500);
    }
  }

  clearCache() {
    this.globalCacheData = null;
    this.activeRequests.clear();
    this.subscribers.clear();
  }
}

const operationsManager = OperationsManager.getInstance();

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
  
  const mountedRef = useRef(true);
  const currentFiltersRef = useRef<string>('');
  const { logError } = useCentralizedErrorHandler();

  // Crear string estable de filtros SIN recrear fetchData
  const filtersString = useMemo(() => JSON.stringify({
    searchTerm: filters.searchTerm || '',
    sector: filters.sector || '',
    displayLocation: filters.displayLocation || '',
    featured: filters.featured,
    limit: filters.limit,
    sortBy: filters.sortBy || 'year'
  }), [filters.searchTerm, filters.sector, filters.displayLocation, filters.featured, filters.limit, filters.sortBy]);

  // Función de fetch ESTABLE - SIN dependencias que cambien
  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await operationsManager.fetchOperations(filters);
      
      if (!mountedRef.current) return;

      if (result.error) {
        setError(result.error);
        logError(new Error(result.error), {
          component: 'useOperations',
          action: 'loadData'
        });
      } else {
        setOperations(result.operations);
        setSectors(result.sectors);
        setError(null);
      }

    } catch (err: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      logError(err, {
        component: 'useOperations',
        action: 'loadData'
      });
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filters, logError]); // Solo depende de filters y logError

  // Effect ÚNICO - solo cuando cambien los filtros REALES
  useEffect(() => {
    if (currentFiltersRef.current !== filtersString) {
      currentFiltersRef.current = filtersString;
      console.log('🔄 Filtros cambiaron, cargando datos:', filters);
      loadData();
    }
  }, [filtersString]); // SOLO filtersString, NO loadData

  // Effect de montaje/desmontaje
  useEffect(() => {
    mountedRef.current = true;
    
    // Cargar datos iniciales solo si no hay cache
    const cached = operationsManager.getCachedData();
    if (cached) {
      console.log('📦 Usando cache inicial');
      setOperations(cached.operations);
      setSectors(cached.sectors);
      setIsLoading(false);
    } else {
      console.log('🚀 Cargando datos iniciales');
      loadData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, []); // Solo al montar/desmontar

  const refresh = useCallback(() => {
    operationsManager.clearCache();
    currentFiltersRef.current = ''; // Forzar recarga
    setError(null);
    loadData();
  }, [loadData]);

  return {
    operations,
    sectors,
    stats,
    isLoading,
    error,
    refresh
  };
};