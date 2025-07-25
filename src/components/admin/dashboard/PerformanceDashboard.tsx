import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
  Database,
  Wifi
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useCachePersistence } from '@/shared/services/cache-persistence.service';

const PerformanceDashboard = () => {
  const { 
    getPerformanceMetrics, 
    getPerformanceAlerts, 
    clearMetrics 
  } = usePerformanceMonitoring();
  
  const { 
    persistCriticalData, 
    restoreCriticalData, 
    clearExpiredCache 
  } = useCachePersistence();

  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [alerts, setAlerts] = useState(getPerformanceAlerts());
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Actualizar métricas cada 5 segundos
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
      setAlerts(getPerformanceAlerts());
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring, getPerformanceMetrics, getPerformanceAlerts]);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value > thresholds.critical) return 'destructive';
    if (value > thresholds.warning) return 'secondary';
    return 'default';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toFixed(0);
  };

  const handleClearMetrics = () => {
    clearMetrics();
    setMetrics(getPerformanceMetrics());
    setAlerts(getPerformanceAlerts());
  };

  const handlePersistCache = () => {
    persistCriticalData();
  };

  const handleRestoreCache = () => {
    restoreCriticalData();
  };

  const handleClearExpiredCache = () => {
    clearExpiredCache();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Performance</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del rendimiento del sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? 'text-green-600' : 'text-red-600'}
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-1" />
                Monitoreando
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-1" />
                Pausado
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleClearMetrics}>
            Limpiar Métricas
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResponseTime.toFixed(0)}ms
            </div>
            <Badge 
              variant={getStatusColor(metrics.avgResponseTime, { warning: 1000, critical: 2000 })}
              className="mt-1"
            >
              {metrics.avgResponseTime < 500 ? 'Excelente' : 
               metrics.avgResponseTime < 1000 ? 'Bueno' : 
               metrics.avgResponseTime < 2000 ? 'Lento' : 'Crítico'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.errorRate.toFixed(1)}%
            </div>
            <Badge 
              variant={getStatusColor(metrics.errorRate, { warning: 5, critical: 10 })}
              className="mt-1"
            >
              {metrics.errorRate < 2 ? 'Excelente' : 
               metrics.errorRate < 5 ? 'Aceptable' : 
               metrics.errorRate < 10 ? 'Alto' : 'Crítico'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.rateLimitHits)}
            </div>
            <Badge 
              variant={getStatusColor(metrics.rateLimitHits, { warning: 50, critical: 100 })}
              className="mt-1"
            >
              {metrics.rateLimitHits < 10 ? 'Normal' : 
               metrics.rateLimitHits < 50 ? 'Moderado' : 
               metrics.rateLimitHits < 100 ? 'Alto' : 'Crítico'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
            <Progress 
              value={metrics.cacheHitRate} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>No hay alertas activas</span>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.type === 'error_spike' ? 'text-red-500' :
                      alert.type === 'slow_query' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {alert.current.toFixed(alert.type === 'slow_query' ? 0 : 1)}
                    {alert.type === 'slow_query' ? 'ms' : 
                     alert.type === 'error_spike' ? '%' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestión de Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={handlePersistCache}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Persistir Cache
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRestoreCache}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Restaurar Cache
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClearExpiredCache}
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" />
              Limpiar Expirado
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Persistir Cache:</strong> Guarda datos críticos en localStorage<br />
              <strong>Restaurar Cache:</strong> Recupera datos desde localStorage<br />
              <strong>Limpiar Expirado:</strong> Elimina cache antiguo para liberar espacio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;