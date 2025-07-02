import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { DatabaseError, NetworkError, RateLimitError } from '@/types/errorTypes';

interface Alert {
  id: string;
  message: string;
  priority: string;
  alert_type: string;
  created_at: string;
  is_read: boolean;
  lead_score?: {
    id: string;
    company_name?: string;
    company_domain?: string;
  };
  threshold_reached?: number;
  lead_score_id?: string;
}

interface AlertsParams {
  page?: number;
  pageSize?: number;
  priority?: string;
  unreadOnly?: boolean;
}

const CACHE_DURATION = 30000; // 30 seconds

export const useOptimizedAlerts = (params: AlertsParams = {}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const { page = 0, pageSize = 20, priority, unreadOnly } = params;

  // Memoized cache key for intelligent caching
  const cacheKey = useMemo(() => 
    `alerts_${page}_${pageSize}_${priority || 'all'}_${unreadOnly ? 'unread' : 'all'}`,
    [page, pageSize, priority, unreadOnly]
  );

  const fetchAlerts = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Intelligent caching - skip if recent data exists
    if (!forceRefresh && now - lastFetch < CACHE_DURATION) {
      logger.debug('Using cached alerts data', { cacheKey }, {
        context: 'performance',
        component: 'useOptimizedAlerts'
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('lead_alerts')
        .select(`
          *,
          lead_score:lead_scores(id, company_name, company_domain)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (priority) {
        query = query.eq('priority', priority);
      }
      
      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      // Apply pagination
      const start = page * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw new DatabaseError('Failed to fetch alerts', 'SELECT', {
          filters: { priority, unreadOnly },
          pagination: { page, pageSize }
        });
      }

      setAlerts(data || []);
      setTotalCount(count || 0);
      setLastFetch(now);

      logger.info('Alerts fetched successfully', {
        alertCount: data?.length || 0,
        totalCount: count || 0,
        page,
        cacheKey
      }, { context: 'marketing', component: 'useOptimizedAlerts' });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching alerts');
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        const networkError = new NetworkError('Failed to fetch alerts data', undefined, { cacheKey });
        logger.error('Network error fetching alerts', networkError, {
          context: 'marketing',
          component: 'useOptimizedAlerts'
        });
        setError('Error de conexión al cargar alertas');
      } else if (error.message.includes('rate') || error.message.includes('limit')) {
        const rateLimitError = new RateLimitError('Alerts API rate limit exceeded');
        logger.warn('Rate limit hit for alerts API', rateLimitError, {
          context: 'marketing',
          component: 'useOptimizedAlerts'
        });
        setError('Demasiadas solicitudes. Inténtalo en unos minutos.');
      } else {
        logger.error('Error fetching alerts', error, {
          context: 'marketing',
          component: 'useOptimizedAlerts',
          data: { cacheKey }
        });
        setError('Error al cargar las alertas');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, priority, unreadOnly, cacheKey]);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('lead_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) {
        throw new DatabaseError('Failed to mark alert as read', 'UPDATE', { alertId });
      }

      // Optimistic update
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));

      logger.info('Alert marked as read', { alertId }, {
        context: 'marketing',
        component: 'useOptimizedAlerts'
      });

    } catch (error) {
      logger.error('Failed to mark alert as read', error as Error, {
        context: 'marketing',
        component: 'useOptimizedAlerts',
        data: { alertId }
      });
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = alerts.filter(alert => !alert.is_read).map(alert => alert.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('lead_alerts')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        throw new DatabaseError('Failed to mark all alerts as read', 'UPDATE', { 
          unreadCount: unreadIds.length 
        });
      }

      // Optimistic update
      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));

      logger.info('All alerts marked as read', { unreadCount: unreadIds.length }, {
        context: 'marketing',
        component: 'useOptimizedAlerts'
      });

    } catch (error) {
      logger.error('Failed to mark all alerts as read', error as Error, {
        context: 'marketing',
        component: 'useOptimizedAlerts'
      });
      throw error;
    }
  }, [alerts]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const unreadCount = alerts.filter(alert => !alert.is_read).length;
    const criticalCount = alerts.filter(alert => alert.priority === 'critical').length;
    const cacheAge = Date.now() - lastFetch;
    
    return {
      totalAlerts: alerts.length,
      unreadCount,
      criticalCount,
      cacheAge,
      isCached: cacheAge < CACHE_DURATION
    };
  }, [alerts, lastFetch]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    totalCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchAlerts(true),
    getPerformanceMetrics
  };
};