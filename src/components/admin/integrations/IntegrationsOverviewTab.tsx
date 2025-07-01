
import React from 'react';
import { IntegrationsMetrics, IntegrationConfig } from '@/types/integrations';
import IntegrationsKPICards from './overview/IntegrationsKPICards';
import IntegrationsStatusPanel from './overview/IntegrationsStatusPanel';
import IntegrationsPerformanceOverview from './overview/IntegrationsPerformanceOverview';

interface IntegrationsOverviewTabProps {
  metrics: IntegrationsMetrics | null;
  integrationConfigs: IntegrationConfig[];
}

const IntegrationsOverviewTab = ({ metrics, integrationConfigs }: IntegrationsOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <IntegrationsKPICards metrics={metrics} />
      <IntegrationsStatusPanel integrationConfigs={integrationConfigs} />
      <IntegrationsPerformanceOverview 
        metrics={metrics} 
        integrationConfigs={integrationConfigs} 
      />
    </div>
  );
};

export default IntegrationsOverviewTab;
