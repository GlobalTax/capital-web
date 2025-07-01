
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import IntegrationsStatusPanel from '../IntegrationsStatusPanel';
import { IntegrationLog, IntegrationConfig } from '@/types/integrations';

interface StatusTabContentProps {
  integrationLogs: IntegrationLog[];
  integrationConfigs: IntegrationConfig[];
  onUpdateConfig: (configId: string, updates: Partial<IntegrationConfig>) => Promise<void>;
}

const StatusTabContent = ({ 
  integrationLogs, 
  integrationConfigs, 
  onUpdateConfig 
}: StatusTabContentProps) => {
  return (
    <TabsContent value="status">
      <IntegrationsStatusPanel 
        integrationLogs={integrationLogs}
        integrationConfigs={integrationConfigs}
        onUpdateConfig={onUpdateConfig}
      />
    </TabsContent>
  );
};

export default StatusTabContent;
