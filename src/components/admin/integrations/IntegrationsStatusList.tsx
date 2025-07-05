import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mail,
  Building2,
  Target,
  Zap,
  Calendar,
  Settings
} from 'lucide-react';
import { IntegrationConfig, IntegrationsMetrics } from '@/types/integrations';

interface IntegrationsStatusListProps {
  integrationConfigs: IntegrationConfig[];
  metrics: IntegrationsMetrics | null;
  onTestConnection: (configId: string) => void;
  onConfigure: (configId: string) => void;
}

const IntegrationsStatusList = ({ 
  integrationConfigs, 
  metrics, 
  onTestConnection, 
  onConfigure 
}: IntegrationsStatusListProps) => {
  
  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'resend':
      case 'email':
        return Mail;
      case 'apollo':
        return Building2;
      case 'google_ads':
        return Target;
      case 'webhooks':
        return Zap;
      case 'calendar':
        return Calendar;
      default:
        return Settings;
    }
  };

  const getStatusIcon = (isActive: boolean, hasError?: boolean) => {
    if (hasError) return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (isActive) return <CheckCircle className="w-4 h-4 text-success" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  const getStatusBadge = (isActive: boolean, hasError?: boolean) => {
    if (hasError) return <Badge variant="destructive">Error</Badge>;
    if (isActive) return <Badge variant="success">Activo</Badge>;
    return <Badge variant="secondary">Inactivo</Badge>;
  };

  const getDescription = (type: string) => {
    switch (type) {
      case 'resend':
      case 'email':
        return 'Para envío de emails e invitaciones';
      case 'apollo':
        return 'Para consulta de datos empresariales';
      case 'google_ads':
        return 'Para sincronización de anuncios y métricas';
      case 'webhooks':
        return 'Para notificaciones automáticas a sistemas externos';
      case 'calendar':
        return 'Para integración con calendario';
      default:
        return 'Configuración de integración';
    }
  };

  // Integraciones predefinidas que siempre mostramos
  const defaultIntegrations = [
    {
      id: 'resend',
      integration_name: 'resend',
      is_active: false,
      last_sync: null,
      sync_frequency_minutes: 60
    },
    {
      id: 'apollo',
      integration_name: 'apollo',
      is_active: true,
      last_sync: new Date().toISOString(),
      sync_frequency_minutes: 30
    },
    {
      id: 'google_ads',
      integration_name: 'google_ads',
      is_active: true,
      last_sync: new Date(Date.now() - 3600000).toISOString(),
      sync_frequency_minutes: 60
    },
    {
      id: 'webhooks',
      integration_name: 'webhooks',
      is_active: false,
      last_sync: null,
      sync_frequency_minutes: 0
    }
  ];

  // Combinar integraciones por defecto con las de la base de datos
  const allIntegrations = [...defaultIntegrations, ...integrationConfigs.filter(
    config => !defaultIntegrations.some(def => def.integration_name === config.integration_name)
  )];

  return (
    <div className="space-y-[var(--space-md)] animate-fade-in">
      {allIntegrations.map((integration, index) => {
        const IconComponent = getIntegrationIcon(integration.integration_name);
        const hasError = false; // TODO: Implement error detection
        
        return (
          <Card 
            key={integration.id} 
            className="border border-border rounded-lg transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-[var(--space-lg)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-[var(--space-md)]">
                  <div className="flex items-center space-x-[var(--space-sm)]">
                    <div className="p-[var(--space-sm)] rounded-lg bg-accent transition-colors duration-200 hover:bg-accent/80">
                      <IconComponent className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground capitalize">
                          {integration.integration_name.replace('_', ' ')}
                        </h3>
                        {getStatusIcon(integration.is_active, hasError)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getDescription(integration.integration_name)}
                      </p>
                      {integration.last_sync && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Última sincronización: {new Date(integration.last_sync).toLocaleString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-[var(--space-sm)]">
                  {getStatusBadge(integration.is_active, hasError)}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                      onClick={() => onTestConnection(integration.id)}
                    >
                      Test Connection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                      onClick={() => onConfigure(integration.id)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IntegrationsStatusList;