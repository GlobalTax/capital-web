
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

      if (!recentLogs) return;

      // Calcular métricas de rendimiento
      const successfulOperations = recentLogs.filter(log => log.status === 'success');
      const failedOperations = recentLogs.filter(log => log.status === 'error');
      
      const avgResponseTime = successfulOperations.length > 0 
        ? successfulOperations.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / successfulOperations.length
        : 0;

      const successRate = recentLogs.length > 0 
        ? (successfulOperations.length / recentLogs.length) * 100
        : 100;

      const operationsPerHour = recentLogs.length;
      const errorRate = recentLogs.length > 0 
        ? (failedOperations.length / recentLogs.length) * 100
        : 0;

      // Obtener métricas de Apollo
      const { data: apolloCompanies } = await supabase
        .from('apollo_companies')
        .select('count');

      const { data: apolloContacts } = await supabase
        .from('apollo_contacts')
        .select('count');

      const enrichmentRate = (apolloCompanies?.length || 0) + (apolloContacts?.length || 0);
      
      // Generar historial simulado para los gráficos
      const generateHistory = (baseValue: number, variance: number = 0.1) => {
        return Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 60 * 1000).toISOString(),
          value: baseValue + (Math.random() - 0.5) * baseValue * variance
        }));
      };

      const performanceMetrics: PerformanceMetric[] = [
        {
          name: 'Tiempo de Respuesta Promedio',
          value: Math.round(avgResponseTime),
          unit: 'ms',
          status: avgResponseTime < 2000 ? 'good' : avgResponseTime < 5000 ? 'warning' : 'critical',
          trend: 'stable',
          target: 2000,
          history: generateHistory(avgResponseTime)
        },
        {
          name: 'Tasa de Éxito',
          value: Math.round(successRate),
          unit: '%',
          status: successRate > 95 ? 'good' : successRate > 85 ? 'warning' : 'critical',
          trend: 'up',
          target: 95,
          history: generateHistory(successRate, 0.05)
        },
        {
          name: 'Operaciones por Hora',
          value: operationsPerHour,
          unit: 'ops/h',
          status: operationsPerHour > 10 ? 'good' : operationsPerHour > 5 ? 'warning' : 'critical',
          trend: 'up',
          target: 15,
          history: generateHistory(operationsPerHour, 0.3)
        },
        {
          name: 'Tasa de Error',
          value: Math.round(errorRate * 100) / 100,
          unit: '%',
          status: errorRate < 2 ? 'good' : errorRate < 5 ? 'warning' : 'critical',
          trend: 'down',
          target: 2,
          history: generateHistory(errorRate, 0.2)
        },
        {
          name: 'Rate de Enriquecimiento',
          value: enrichmentRate,
          unit: 'registros',
          status: enrichmentRate > 100 ? 'good' : enrichmentRate > 50 ? 'warning' : 'critical',
          trend: 'up',
          target: 100,
          history: generateHistory(enrichmentRate, 0.15)
        }
      ];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de Control */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Monitor de Rendimiento
          </h2>
          <p className="text-gray-600">
            Monitoreo en tiempo real del rendimiento de las integraciones
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
          </span>
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isMonitoring ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Detener Monitor
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Iniciar Monitor
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estado del Monitoreo */}
      {isMonitoring && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Monitoreo activo - Actualizando cada 30 segundos
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {getStatusIcon(metric.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Valor principal */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {metric.value}{metric.unit}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Progreso hacia objetivo */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Objetivo: {metric.target}{metric.unit}</span>
                  <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                </div>
                <Progress 
                  value={Math.min((metric.value / metric.target) * 100, 100)} 
                  className="h-2"
                />
              </div>

              {/* Mini gráfico de tendencia */}
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.history}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={
                        metric.status === 'good' ? '#22c55e' : 
                        metric.status === 'warning' ? '#f59e0b' : 
                        '#ef4444'
                      }
                      strokeWidth={2}
                      dot={false}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleTimeString('es-ES')}
                      formatter={(value: any) => [`${Math.round(value)}${metric.unit}`, metric.name]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas de Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.filter(m => m.status !== 'good').map((metric, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(metric.status)}
                <div className="flex-1">
                  <p className="font-medium">{metric.name}</p>
                  <p className="text-sm text-gray-600">
                    Valor actual: {metric.value}{metric.unit} | 
                    Objetivo: {metric.target}{metric.unit}
                  </p>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
            ))}
            
            {metrics.every(m => m.status === 'good') && (
              <div className="text-center text-green-600 py-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">¡Todo funcionando correctamente!</p>
                <p className="text-sm">Todas las métricas están dentro de los parámetros normales.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPerformanceMonitor;
