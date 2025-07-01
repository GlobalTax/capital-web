
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { IntegrationsMetrics, IntegrationConfig } from '@/types/integrations';

interface IntegrationsPerformanceOverviewProps {
  metrics: IntegrationsMetrics | null;
  integrationConfigs: IntegrationConfig[];
}

const IntegrationsPerformanceOverview = ({ metrics, integrationConfigs }: IntegrationsPerformanceOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasa de Éxito</span>
              <span>{metrics?.successRate.toFixed(1) || 0}%</span>
            </div>
            <Progress value={metrics?.successRate || 0} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tiempo Promedio</span>
              <span>{metrics?.avgEnrichmentTime.toFixed(0) || 0}ms</span>
            </div>
            <Progress value={Math.min((metrics?.avgEnrichmentTime || 0) / 10, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sincronización Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrationConfigs.slice(0, 4).map((config) => (
              <div key={config.id} className="flex justify-between items-center">
                <span className="text-sm font-medium">{config.integration_name}</span>
                <span className="text-xs text-muted-foreground">
                  {config.last_sync ? 
                    new Date(config.last_sync).toLocaleString('es-ES') : 
                    'No sincronizado'
                  }
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPerformanceOverview;
