
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import IntegrationsOverviewTab from '../IntegrationsOverviewTab';
import { IntegrationsMetrics, IntegrationConfig } from '@/types/integrations';

interface OverviewTabContentProps {
  metrics: IntegrationsMetrics | null;
  integrationConfigs: IntegrationConfig[];
}

const OverviewTabContent = ({ metrics, integrationConfigs }: OverviewTabContentProps) => {
  return (
    <TabsContent value="overview" className="space-y-6">
      <IntegrationsOverviewTab 
        metrics={metrics}
        integrationConfigs={integrationConfigs}
      />
    </TabsContent>
  );
};

export default OverviewTabContent;
