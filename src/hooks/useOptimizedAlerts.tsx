import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { DatabaseError, NetworkError, RateLimitError } from '@/types/errorTypes';
import { useOptimizedQuery, useSmartInvalidation } from '@/shared/services/optimized-queries.service';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

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

export const useOptimizedAlerts = (params: AlertsParams = {}) => {
  const { invalidateRelatedQueries } = useSmartInvalidation();
  const { page = 0, pageSize = 20, priority, unreadOnly } = params;

  // Memoized query key para React Query
  const queryKey = useMemo(() => [
    QUERY_KEYS.LEAD_ALERTS,
    page,
    pageSize,
    priority || 'all',
    unreadOnly ? 'unread' : 'all'
  ], [page, pageSize, priority, unreadOnly]);

  // React Query optimizado para fetch de alertas
  const { data: alertsData, isLoading, error } = useOptimizedQuery<{
    alerts: Alert[];
    totalCount: number;
  }>(
    queryKey,
    async () => {
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

      logger.info('Alerts fetched successfully', {
        alertCount: data?.length || 0,
        totalCount: count || 0,
        page
      }, { context: 'marketing', component: 'useOptimizedAlerts' });

      return {
        alerts: data || [],
        totalCount: count || 0
      };
    },
    'critical' // Datos críticos que cambian frecuentemente
  );

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('lead_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) {
        throw new DatabaseError('Failed to mark alert as read', 'UPDATE', { alertId });
      }

      // Invalidar queries relacionadas después de la actualización
      invalidateRelatedQueries('alerts');

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
      const currentAlerts = alertsData?.alerts || [];
      const unreadIds = currentAlerts.filter(alert => !alert.is_read).map(alert => alert.id);
      
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

      // Invalidar queries relacionadas después de la actualización
      invalidateRelatedQueries('alerts');

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
  }, [alertsData, invalidateRelatedQueries]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const currentAlerts = alertsData?.alerts || [];
    const unreadCount = currentAlerts.filter(alert => !alert.is_read).length;
    const criticalCount = currentAlerts.filter(alert => alert.priority === 'critical').length;
    
    return {
      totalAlerts: currentAlerts.length,
      unreadCount,
      criticalCount,
      cacheAge: 0, // React Query maneja el cache automáticamente
      isCached: true
    };
  }, [alertsData]);

  return {
    alerts: alertsData?.alerts || [],
    totalCount: alertsData?.totalCount || 0,
    isLoading,
    error: error?.message || null,
    markAsRead,
    markAllAsRead,
    refetch: () => invalidateRelatedQueries('alerts'),
    getPerformanceMetrics
  };
};