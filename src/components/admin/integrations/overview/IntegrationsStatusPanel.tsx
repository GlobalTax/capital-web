
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { IntegrationConfig } from '@/types/integrations';
import { getIntegrationStatus, getStatusIcon, getStatusBadge } from '../utils/integrationsOverviewUtils';

interface IntegrationsStatusPanelProps {
  integrationConfigs: IntegrationConfig[];
}

const IntegrationsStatusPanel = ({ integrationConfigs }: IntegrationsStatusPanelProps) => {
  return (
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
              {getStatusIcon(getIntegrationStatus(integrationConfigs, 'apollo'))}
              <div>
                <h4 className="font-medium">Apollo Intelligence</h4>
                <p className="text-sm text-muted-foreground">
                  Enriquecimiento automático de empresas visitantes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(getIntegrationStatus(integrationConfigs, 'apollo'))}
            </div>
          </div>

          {/* Google Ads Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(getIntegrationStatus(integrationConfigs, 'google_ads'))}
              <div>
                <h4 className="font-medium">Google Ads Attribution</h4>
                <p className="text-sm text-muted-foreground">
                  Tracking avanzado de conversiones y ROI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(getIntegrationStatus(integrationConfigs, 'google_ads'))}
            </div>
          </div>

          {/* LinkedIn Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(getIntegrationStatus(integrationConfigs, 'linkedin'))}
              <div>
                <h4 className="font-medium">LinkedIn Sales Navigator</h4>
                <p className="text-sm text-muted-foreground">
                  Inteligencia social y timing de outreach
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(getIntegrationStatus(integrationConfigs, 'linkedin'))}
            </div>
          </div>

          {/* Slack Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(getIntegrationStatus(integrationConfigs, 'slack'))}
              <div>
                <h4 className="font-medium">Slack Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Alertas en tiempo real de hot prospects
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(getIntegrationStatus(integrationConfigs, 'slack'))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationsStatusPanel;
