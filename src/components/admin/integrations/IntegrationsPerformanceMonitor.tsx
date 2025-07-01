
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PerformanceMonitorHeader from './performance/PerformanceMonitorHeader';
import PerformanceMonitoringStatus from './performance/PerformanceMonitoringStatus';
import PerformanceMetricsCards from './performance/PerformanceMetricsCards';
import PerformanceAlertsPanel from './performance/PerformanceAlertsPanel';
import { calculatePerformanceMetrics } from './performance/performanceUtils';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target: number;
  history: Array<{ timestamp: string; value: number }>;
}

const IntegrationsPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchPerformanceMetrics = async () => {
    try {
      // Obtener logs recientes para calcular métricas
      const { data: recentLogs } = await supabase
        .from('integration_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      // Obtener métricas de Apollo
      const { data: apolloCompanies } = await supabase
        .from('apollo_companies')
        .select('count');

      const { data: apolloContacts } = await supabase
        .from('apollo_contacts')
        .select('count');

      const performanceMetrics = calculatePerformanceMetrics(
        recentLogs || [], 
        apolloCompanies || [], 
        apolloContacts || []
      );

      setMetrics(performanceMetrics);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    fetchPerformanceMetrics();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchPerformanceMetrics, 30000);
    
    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <PerformanceMonitorHeader
        isMonitoring={isMonitoring}
        lastUpdate={lastUpdate}
        onStartMonitoring={startMonitoring}
        onStopMonitoring={stopMonitoring}
      />

      <PerformanceMonitoringStatus isMonitoring={isMonitoring} />

      <PerformanceMetricsCards metrics={metrics} />

      <PerformanceAlertsPanel metrics={metrics} />
    </div>
  );
};

export default IntegrationsPerformanceMonitor;
