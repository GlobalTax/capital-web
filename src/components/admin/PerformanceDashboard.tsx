// ============= PERFORMANCE DASHBOARD =============
// Dashboard completo de monitoreo de rendimiento

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { useWebVitals } from '@/hooks/useWebVitals';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Gauge,
  Wifi,
  RefreshCw
} from 'lucide-react';

export const PerformanceDashboard = () => {
  const { 
    stats,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    refresh,
    getTrendIcon,
    getTrendColor
  } = usePerformanceAnalytics();
  
  const { 
    vitals,
    score,
    scoreLabel,
    scoreColor,
    alerts: vitalAlerts
  } = useWebVitals();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    refresh();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'bg-green-500';
    if (value <= thresholds[1]) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatMs = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dashboard de Rendimiento</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del rendimiento de la aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            variant={isMonitoring ? "destructive" : "default"} 
            size="sm" 
            onClick={toggleMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Pausar' : 'Iniciar'} Monitoreo
          </Button>
          <Button variant="outline" size="sm" onClick={clearAlerts}>
            Limpiar Alertas
          </Button>
        </div>
      </div>

      {/* Web Vitals Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Web Vitals Score
            <span className={`text-2xl font-bold ${scoreColor}`}>
              {getTrendIcon(stats.recentTrend)} {score}
            </span>
          </CardTitle>
          <CardDescription>
            Puntuación general de rendimiento: {scoreLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(vitals).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-sm font-medium text-muted-foreground">{key}</div>
                <div className="text-lg font-bold">
                  {value ? formatMs(value) : '-'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageResponseTime.toFixed(0)}ms
            </div>
            <div className="flex items-center mt-2">
              <div 
                className={`h-2 w-2 rounded-full mr-2 ${
                  getPerformanceColor(stats.averageResponseTime, [200, 500])
                }`} 
              />
              <p className="text-xs text-muted-foreground">
                {stats.totalOperations} operaciones registradas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operaciones Lentas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.slowOperations}</div>
            <Badge 
              variant={stats.slowOperations > 5 ? "destructive" : "secondary"}
              className="mt-2"
            >
              {stats.slowOperations > 5 ? 'Crítico' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor(stats.recentTrend)}`}>
              {getTrendIcon(stats.recentTrend)}
            </div>
            <Badge className="mt-2">
              {stats.recentTrend === 'improving' ? 'Mejorando' : 
               stats.recentTrend === 'degrading' ? 'Degradando' : 'Estable'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length + vitalAlerts.length}</div>
            <Badge 
              variant={alerts.length > 0 ? "destructive" : "default"}
              className="mt-2"
            >
              {alerts.length > 0 ? 'Requiere atención' : 'Todo bien'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de detalles */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métricas por Categoría</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Categoría</CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento por tipo de operación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <Badge variant="outline">{data.count} operaciones</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Promedio: </span>
                        <span className="font-medium">{data.average}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P95: </span>
                        <span className="font-medium">{data.p95}ms</span>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min((data.average / 1000) * 100, 100)} 
                      className="mt-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Rendimiento</CardTitle>
              <CardDescription>
                Problemas detectados que requieren atención
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Alertas de performance */}
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-500' : 
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Alertas de Web Vitals */}
                {vitalAlerts.map((alert, index) => (
                  <div key={`vital-${index}`} className="flex items-start gap-3 p-3 bg-muted rounded">
                    <Database className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'poor' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Métrica: {alert.metric}
                      </p>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && vitalAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-lg">¡Todo funcionando bien!</h3>
                    <p className="text-muted-foreground">
                      No se detectaron problemas de rendimiento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Vitals Detalladas</CardTitle>
              <CardDescription>
                Métricas de rendimiento de carga de la página
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(vitals).map(([key, value]) => {
                  const getVitalStatus = (metric: string, val: number) => {
                    const thresholds: Record<string, [number, number]> = {
                      FCP: [1800, 3000],
                      LCP: [2500, 4000],
                      FID: [100, 300],
                      CLS: [0.1, 0.25]
                    };
                    const [good, poor] = thresholds[metric] || [0, 0];
                    if (val <= good) return { label: 'Bueno', color: 'text-green-600' };
                    if (val <= poor) return { label: 'Necesita mejora', color: 'text-yellow-600' };
                    return { label: 'Pobre', color: 'text-red-600' };
                  };

                  if (!value) return null;
                  
                  const status = getVitalStatus(key, value);
                  
                  return (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{key}</h4>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatMs(value)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {key === 'FCP' && 'First Contentful Paint'}
                        {key === 'LCP' && 'Largest Contentful Paint'}
                        {key === 'FID' && 'First Input Delay'}
                        {key === 'CLS' && 'Cumulative Layout Shift'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};