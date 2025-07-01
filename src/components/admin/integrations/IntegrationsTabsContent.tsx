
import React from 'react';
import OverviewTabContent from './tabs/OverviewTabContent';
import ApolloTabContent from './tabs/ApolloTabContent';
import ContactsTabContent from './tabs/ContactsTabContent';
import AdsTabContent from './tabs/AdsTabContent';
import AnalyticsTabContent from './tabs/AnalyticsTabContent';
import PerformanceTabContent from './tabs/PerformanceTabContent';
import TestingTabContent from './tabs/TestingTabContent';
import StatusTabContent from './tabs/StatusTabContent';
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
      <OverviewTabContent 
        metrics={metrics}
        integrationConfigs={integrationConfigs}
      />

      <ApolloTabContent 
        apolloCompanies={apolloCompanies}
        onEnrichCompany={enrichCompanyWithApollo}
        isLoading={isLoading}
      />

      <ContactsTabContent 
        apolloContacts={apolloContacts}
        apolloCompanies={apolloCompanies}
        onEnrichContacts={enrichContactsForCompany}
        isLoading={isLoading}
      />

      <AdsTabContent 
        adConversions={adConversions}
        touchpoints={touchpoints}
      />

      <AnalyticsTabContent />

      <PerformanceTabContent />

      <TestingTabContent />

      <StatusTabContent 
        integrationLogs={integrationLogs}
        integrationConfigs={integrationConfigs}
        onUpdateConfig={updateIntegrationConfig}
      />
    </>
  );
};

export default IntegrationsTabsContent;
