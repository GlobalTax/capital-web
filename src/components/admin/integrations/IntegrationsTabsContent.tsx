
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import IntegrationsOverviewTab from './IntegrationsOverviewTab';
import ApolloIntelligenceTab from './ApolloIntelligenceTab';
import ApolloContactsTab from './ApolloContactsTab';
import GoogleAdsAttributionTab from './GoogleAdsAttributionTab';
import IntegrationsStatusPanel from './IntegrationsStatusPanel';
import IntegrationsHealthDashboard from './IntegrationsHealthDashboard';
import ApolloTestingPanel from './ApolloTestingPanel';
import IntegrationsAnalyticsDashboard from './IntegrationsAnalyticsDashboard';
import IntegrationsPerformanceMonitor from './IntegrationsPerformanceMonitor';
import { 
  ApolloCompany, 
  ApolloContact, 
  AdConversion,
  AttributionTouchpoint,
  IntegrationLog,
  IntegrationConfig,
  IntegrationsMetrics 
} from '@/types/integrations';

interface IntegrationsTabsContentProps {
  activeTab: string;
  apolloCompanies: ApolloCompany[];
  apolloContacts: ApolloContact[];
  adConversions: AdConversion[];
  touchpoints: AttributionTouchpoint[];
  integrationLogs: IntegrationLog[];
  integrationConfigs: IntegrationConfig[];
  metrics: IntegrationsMetrics | null;
  isLoading: boolean;
  enrichCompanyWithApollo: (domain: string) => Promise<any>;
  enrichContactsForCompany: (companyDomain: string) => Promise<any>;
  updateIntegrationConfig: (configId: string, updates: Partial<IntegrationConfig>) => Promise<void>;
}

const IntegrationsTabsContent = ({
  activeTab,
  apolloCompanies,
  apolloContacts,
  adConversions,
  touchpoints,
  integrationLogs,
  integrationConfigs,
  metrics,
  isLoading,
  enrichCompanyWithApollo,
  enrichContactsForCompany,
  updateIntegrationConfig
}: IntegrationsTabsContentProps) => {
  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <IntegrationsOverviewTab 
          metrics={metrics}
          integrationConfigs={integrationConfigs}
        />
      </TabsContent>

      <TabsContent value="apollo">
        <ApolloIntelligenceTab 
          apolloCompanies={apolloCompanies}
          onEnrichCompany={enrichCompanyWithApollo}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="contacts">
        <ApolloContactsTab 
          apolloContacts={apolloContacts}
          apolloCompanies={apolloCompanies}
          onEnrichContacts={enrichContactsForCompany}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="ads">
        <GoogleAdsAttributionTab 
          adConversions={adConversions}
          touchpoints={touchpoints}
        />
      </TabsContent>

      <TabsContent value="analytics">
        <IntegrationsAnalyticsDashboard />
      </TabsContent>

      <TabsContent value="performance">
        <IntegrationsPerformanceMonitor />
      </TabsContent>

      <TabsContent value="testing">
        <div className="space-y-6">
          <IntegrationsHealthDashboard />
          <ApolloTestingPanel />
        </div>
      </TabsContent>

      <TabsContent value="status">
        <IntegrationsStatusPanel 
          integrationLogs={integrationLogs}
          integrationConfigs={integrationConfigs}
          onUpdateConfig={updateIntegrationConfig}
        />
      </TabsContent>
    </>
  );
};

export default IntegrationsTabsContent;
