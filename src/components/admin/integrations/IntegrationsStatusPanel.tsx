
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';
import { IntegrationLog, IntegrationConfig } from '@/types/integrations';

interface IntegrationsStatusPanelProps {
  integrationLogs: IntegrationLog[];
  integrationConfigs: IntegrationConfig[];
  onUpdateConfig: (configId: string, updates: Partial<IntegrationConfig>) => Promise<void>;
}

const IntegrationsStatusPanel = ({ 
  integrationLogs, 
  integrationConfigs, 
  onUpdateConfig 
}: IntegrationsStatusPanelProps) => {
  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'apollo': return '🚀';
      case 'google_ads': return '📊';
      case 'linkedin': return '💼';
      case 'slack': return '💬';
      case 'hubspot': return '🔄';
      default: return '⚡';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Éxito</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'pending': return <Badge variant="secondary">Pendiente</Badge>;
      default: return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const recentLogs = integrationLogs.slice(0, 10);
  const logsByType = integrationLogs.reduce((acc, log) => {
    acc[log.integration_type] = (acc[log.integration_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleToggleIntegration = async (config: IntegrationConfig) => {
    await onUpdateConfig(config.id, { is_active: !config.is_active });
  };

  return (
    <div className="space-y-6">
      {/* Integration Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Control de Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrationConfigs.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getIntegrationIcon(config.integration_name)}</span>
                  <div>
                    <h4 className="font-medium capitalize">{config.integration_name.replace('_', ' ')}</h4>
                    <p className="text-sm text-muted-foreground">
                      Sincronización cada {config.sync_frequency_minutes} minutos
                    </p>
                    {config.last_sync && (
                      <p className="text-xs text-muted-foreground">
                        Última sincronización: {new Date(config.last_sync).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={config.is_active ? "default" : "secondary"}>
                    {config.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={() => handleToggleIntegration(config)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad por Integración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(logsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getIntegrationIcon(type)}</span>
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="outline">{count} operaciones</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationConfigs.map((config) => {
                const configLogs = integrationLogs.filter(log => 
                  log.integration_type === config.integration_name
                );
                const successRate = configLogs.length > 0 ? 
                  (configLogs.filter(log => log.status === 'success').length / configLogs.length) * 100 : 0;
                
                return (
                  <div key={config.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{config.integration_name.replace('_', ' ')}</span>
                      <span>{successRate.toFixed(1)}% éxito</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Log de Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getIntegrationIcon(log.integration_type)}</span>
                    <span className="font-medium text-sm capitalize">
                      {log.integration_type.replace('_', ' ')} - {log.operation}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                  {log.company_domain && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Empresa: {log.company_domain}
                    </p>
                  )}
                  {log.error_message && (
                    <p className="text-sm text-red-600 mb-1">
                      Error: {log.error_message}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(log.created_at).toLocaleString('es-ES')}</span>
                    {log.execution_time_ms && (
                      <span>{log.execution_time_ms}ms</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {recentLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay actividad reciente</p>
                <p className="text-sm">Las operaciones de integración aparecerán aquí</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsStatusPanel;
