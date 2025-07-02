import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bell, Target, TrendingUp, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useOptimizedAlerts } from '@/hooks/useOptimizedAlerts';
import SimplifiedErrorBoundary from './SimplifiedErrorBoundary';

// Memoized Alert Item Component for performance
const AlertItem = memo(({ alert, onMarkAsRead }: { alert: any; onMarkAsRead: (id: string) => void }) => (
  <div className={`border rounded-lg p-4 ${!alert.is_read ? 'bg-blue-50 border-blue-200' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <Badge variant={alert.priority === 'critical' ? 'destructive' : 'secondary'}>
          {alert.priority.toUpperCase()}
        </Badge>
        <span className="text-sm text-gray-600">{alert.alert_type}</span>
        {!alert.is_read && <Badge variant="outline">NUEVA</Badge>}
      </div>
      <span className="text-xs text-gray-500">
        {new Date(alert.created_at).toLocaleString()}
      </span>
    </div>
    
    <p className="font-medium mb-2">{alert.message}</p>
    
    {alert.lead_score && (
      <p className="text-sm text-gray-600 mb-3">
        Empresa: {alert.lead_score.company_name || alert.lead_score.company_domain}
      </p>
    )}
    
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">
        Prioridad: {alert.priority}
      </span>
      {!alert.is_read && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onMarkAsRead(alert.id)}
        >
          <Check className="h-4 w-4 mr-1" />
          Marcar Leída
        </Button>
      )}
    </div>
  </div>
));

AlertItem.displayName = 'AlertItem';

const AlertsManager = memo(() => {
  const [page, setPage] = useState(0);
  const [priority, setPriority] = useState<string>('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  
  const { 
    alerts, 
    totalCount, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    refetch,
    getPerformanceMetrics 
  } = useOptimizedAlerts({ page, pageSize: 20, priority, unreadOnly });

  const metrics = getPerformanceMetrics();
  const totalPages = Math.ceil(totalCount / 20);
  return (
    <SimplifiedErrorBoundary fallbackTitle="Sistema de Alertas" onRetry={refetch}>
      <div className="space-y-6">
        {/* Header con métricas de rendimiento */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alertas del Sistema</h1>
            <p className="text-gray-600 mt-2">
              Centro de alertas y notificaciones críticas ({totalCount} total)
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Badge variant={metrics.isCached ? 'secondary' : 'outline'}>
              Cache: {metrics.isCached ? 'Activo' : 'Cargando'}
            </Badge>
            <span>• {metrics.unreadCount} no leídas</span>
            <span>• {metrics.criticalCount} críticas</span>
          </div>
        </div>

        {/* Controles y filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros de Alertas</span>
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                disabled={metrics.unreadCount === 0}
              >
                Marcar Todas Leídas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Prioridad:</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                />
                <span className="text-sm">Solo no leídas</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Lista de alertas con paginación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Alertas Recientes
              {metrics.unreadCount > 0 && (
                <Badge variant="destructive">{metrics.unreadCount} nuevas</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Cargando alertas...</p>
                </div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay alertas que mostrar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <AlertItem 
                    key={alert.id} 
                    alert={alert} 
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Página {page + 1} de {totalPages} ({totalCount} alertas total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-700 mt-1">Lead Scoring</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-700 mt-1">Marketing Hub</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-700 mt-1">Alertas Sistema</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(metrics.cacheAge / 1000)}s</div>
                <div className="text-sm text-blue-700 mt-1">Cache Age</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimplifiedErrorBoundary>
  );
});

AlertsManager.displayName = 'AlertsManager';

export default AlertsManager;