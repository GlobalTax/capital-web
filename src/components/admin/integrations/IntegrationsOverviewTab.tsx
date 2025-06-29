
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import { IntegrationsMetrics, IntegrationConfig } from '@/types/integrations';

interface IntegrationsOverviewTabProps {
  metrics: IntegrationsMetrics | null;
  integrationConfigs: IntegrationConfig[];
}

const IntegrationsOverviewTab = ({ metrics, integrationConfigs }: IntegrationsOverviewTabProps) => {
  const getIntegrationStatus = (name: string) => {
    const config = integrationConfigs.find(c => c.integration_name === name);
    return config?.is_active ? 'active' : 'inactive';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge> : 
      <Badge variant="destructive">Inactivo</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Enriquecidas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.apolloEnrichments || 0}</div>
            <p className="text-xs text-muted-foreground">Con datos de Apollo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones Ads</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.adConversions || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Señales LinkedIn</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.linkedinSignals || 0}</div>
            <p className="text-xs text-muted-foreground">Inteligencia social</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Integraciones exitosas</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Estado de Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Apollo Integration */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getIntegrationStatus('apollo'))}
                <div>
                  <h4 className="font-medium">Apollo Intelligence</h4>
                  <p className="text-sm text-muted-foreground">
                    Enriquecimiento automático de empresas visitantes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(getIntegrationStatus('apollo'))}
              </div>
            </div>

            {/* Google Ads Integration */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getIntegrationStatus('google_ads'))}
                <div>
                  <h4 className="font-medium">Google Ads Attribution</h4>
                  <p className="text-sm text-muted-foreground">
                    Tracking avanzado de conversiones y ROI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(getIntegrationStatus('google_ads'))}
              </div>
            </div>

            {/* LinkedIn Integration */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getIntegrationStatus('linkedin'))}
                <div>
                  <h4 className="font-medium">LinkedIn Sales Navigator</h4>
                  <p className="text-sm text-muted-foreground">
                    Inteligencia social y timing de outreach
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(getIntegrationStatus('linkedin'))}
              </div>
            </div>

            {/* Slack Integration */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getIntegrationStatus('slack'))}
                <div>
                  <h4 className="font-medium">Slack Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Alertas en tiempo real de hot prospects
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(getIntegrationStatus('slack'))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
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
    </div>
  );
};

export default IntegrationsOverviewTab;
