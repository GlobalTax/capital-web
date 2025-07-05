
import React from 'react';
import { useIntegrationsData } from '@/hooks/useIntegrationsData';
import { useToast } from '@/hooks/use-toast';
import IntegrationsHeader from './integrations/IntegrationsHeader';
import IntegrationsSimpleTabs from './integrations/IntegrationsSimpleTabs';
import IntegrationsStatusList from './integrations/IntegrationsStatusList';

const IntegrationsManager = () => {
  const {
    integrationConfigs,
    metrics,
    isLoading,
    updateIntegrationConfig
  } = useIntegrationsData();
  
  const { toast } = useToast();

  const handleTestConnection = async (configId: string) => {
    toast({
      title: "Test de Conexión",
      description: "Probando conexión... Esta funcionalidad estará disponible próximamente.",
    });
  };

  const handleConfigure = async (configId: string) => {
    toast({
      title: "Configuración",
      description: "Panel de configuración próximamente disponible.",
    });
  };

  return (
    <div className="space-y-8">
      <IntegrationsHeader isLoading={isLoading} />

      <IntegrationsSimpleTabs>
        <IntegrationsStatusList
          integrationConfigs={integrationConfigs}
          metrics={metrics}
          onTestConnection={handleTestConnection}
          onConfigure={handleConfigure}
        />
      </IntegrationsSimpleTabs>
    </div>
  );
};

export default IntegrationsManager;
