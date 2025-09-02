import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { getEventSynchronizer } from '@/utils/analytics/EventSynchronizer';
import { generateEventMappingReport } from '@/utils/analytics/OptimizedEventMapping';

interface SyncStats {
  totalEvents: number;
  successfulSyncs: number;
  failedSyncs: number;
  facebookEvents: number;
  ga4Events: number;
  successRate: number;
  recentEvents: Array<{
    eventName: string;
    properties: Record<string, any>;
    timestamp: Date;
  }>;
}

interface HealthStatus {
  healthy: boolean;
  successRate: number;
  totalEvents: number;
  issues: string[];
  recommendations: string[];
}

export const EventSyncMonitor: React.FC = () => {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const synchronizer = getEventSynchronizer();
      const syncStats = synchronizer.getSyncStats();
      const healthStatus = synchronizer.getHealthStatus();
      
      setStats(syncStats);
      setHealth(healthStatus);
    } catch (error) {
      console.error('Error refreshing sync data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetStats = () => {
    const synchronizer = getEventSynchronizer();
    synchronizer.resetStats();
    refreshData();
  };

  const downloadReport = () => {
    const report = generateEventMappingReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-mapping-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testEvent = async () => {
    const synchronizer = getEventSynchronizer();
    await synchronizer.syncEvent('calculator_used', {
      testEvent: true,
      timestamp: new Date().toISOString()
    });
    refreshData();
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitor de Sincronización de Eventos</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de la sincronización entre Facebook Pixel y Google Analytics 4
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {health.healthy ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Evaluación general de la salud del sistema de sincronización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Tasa de Éxito</span>
              <div className="flex items-center gap-2">
                <Progress value={health.successRate} className="w-32" />
                <span className="font-mono text-sm">{health.successRate.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Total de Eventos</span>
              <Badge variant="secondary">{health.totalEvents}</Badge>
            </div>

            {health.issues.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Problemas detectados:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {health.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {health.recommendations.length > 0 && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendaciones:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {health.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizaciones Exitosas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulSyncs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Facebook Pixel</CardTitle>
              <Badge variant="outline">FB</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.facebookEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Google Analytics</CardTitle>
              <Badge variant="outline">GA4</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.ga4Events}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Events */}
      {stats && stats.recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
            <CardDescription>
              Últimos eventos sincronizados entre plataformas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{event.eventName}</span>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {Object.keys(event.properties).length} params
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Prueba</CardTitle>
          <CardDescription>
            Herramientas para probar y mantener el sistema de sincronización
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={testEvent} variant="outline">
            Enviar Evento de Prueba
          </Button>
          <Button onClick={resetStats} variant="outline">
            Reiniciar Estadísticas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSyncMonitor;