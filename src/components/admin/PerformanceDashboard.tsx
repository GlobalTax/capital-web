// ============= PERFORMANCE DASHBOARD =============
// Dashboard completo de monitoreo de rendimiento

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { performanceOptimizer } from '@/utils/performanceOptimizer';
import { backgroundSync } from '@/utils/backgroundSync';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  HardDrive,
  Wifi,
  RefreshCw
} from 'lucide-react';

interface PerformanceStats {
  totalMetrics: number;
  averageResponseTime: number;
  slowOperations: number;
  cacheHitRate: number;
  bundleSize: number;
  pendingTasks: number;
}

export const PerformanceDashboard = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    totalMetrics: 0,
    averageResponseTime: 0,
    slowOperations: 0,
    cacheHitRate: 0,
    bundleSize: 0,
    pendingTasks: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [cacheSize, setCacheSize] = useState({ total: 0, breakdown: {} });
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener métricas del monitor
      const metrics = performanceMonitor.getMetrics();
      const slowQueries = metrics.filter(m => m.value > 1000);
      
      // Generar reporte de optimización
      const optimizationReport = performanceOptimizer.generateReport();
      
      // Obtener tareas pendientes
      const pendingTasksCount = await backgroundSync.getTaskCount();
      
      setStats({
        totalMetrics: metrics.length,
        averageResponseTime: metrics.length > 0 
          ? metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length 
          : 0,
        slowOperations: slowQueries.length,
        cacheHitRate: optimizationReport.cacheHitRate,
        bundleSize: optimizationReport.bundleSize,
        pendingTasks: pendingTasksCount
      });
      
      setCacheSize({ total: 0, breakdown: {} });
      setReport(optimizationReport);
      
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    // Cache management handled by browser
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    await loadPerformanceData();
  };

  const clearMetrics = () => {
    performanceMonitor.clear();
    loadPerformanceData();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'bg-green-500';
    if (value <= thresholds[1]) return 'bg-yellow-500';
    return 'bg-red-500';
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
            onClick={loadPerformanceData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={clearMetrics}>
            <Activity className="h-4 w-4 mr-2" />
            Limpiar Métricas
          </Button>
        </div>
      </div>

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
                {stats.totalMetrics} operaciones registradas
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
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cacheHitRate.toFixed(1)}%
            </div>
            <Progress value={stats.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <Badge 
              variant={stats.pendingTasks > 0 ? "secondary" : "default"}
              className="mt-2"
            >
              {stats.pendingTasks > 0 ? 'Sincronizando' : 'Sincronizado'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de detalles */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métricas Detalladas</TabsTrigger>
          <TabsTrigger value="cache">Gestión de Cache</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
              <CardDescription>
                Análisis detallado de las operaciones de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Bundle Size</label>
                    <p className="text-2xl font-bold">{formatBytes(stats.bundleSize)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Cache</label>
                    <p className="text-2xl font-bold">{formatBytes(cacheSize.total)}</p>
                  </div>
                </div>
                
                {report?.slowQueries && report.slowQueries.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Operaciones Lentas</h4>
                    <div className="space-y-2">
                      {report.slowQueries.slice(0, 5).map((query: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{query.name}</span>
                          <Badge variant="secondary">{query.duration}ms</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Cache</CardTitle>
              <CardDescription>
                Control y optimización del sistema de cache
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Cache Total</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(cacheSize.total)} almacenados
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearCache}>
                    <HardDrive className="h-4 w-4 mr-2" />
                    Limpiar Cache
                  </Button>
                </div>
                
                {Object.entries(cacheSize.breakdown).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Desglose por Tipo</h4>
                    <div className="space-y-2">
                      {Object.entries(cacheSize.breakdown).map(([name, size]) => (
                        <div key={name} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{name}</span>
                          <span className="text-sm font-medium">{formatBytes(size as number)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de Optimización</CardTitle>
              <CardDescription>
                Sugerencias basadas en el análisis de rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report?.recommendations && report.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">¡Excelente Rendimiento!</h3>
                  <p className="text-muted-foreground">
                    No se detectaron problemas de rendimiento significativos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};