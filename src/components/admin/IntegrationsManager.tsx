
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useIntegrationsData } from '@/hooks/useIntegrationsData';
import IntegrationsHeader from './integrations/IntegrationsHeader';
import IntegrationsQuickStats from './integrations/IntegrationsQuickStats';
import IntegrationsTabsNavigation from './integrations/IntegrationsTabsNavigation';
import IntegrationsTabsContent from './integrations/IntegrationsTabsContent';

const IntegrationsManager = () => {
  const {
    apolloCompanies,
    apolloContacts,
    adConversions,
    linkedinData,
    touchpoints,
    integrationLogs,
    integrationConfigs,
    metrics,
    isLoading,
    enrichCompanyWithApollo,
    enrichContactsForCompany,
    updateIntegrationConfig
  } = useIntegrationsData();

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <IntegrationsHeader isLoading={isLoading} />

      <IntegrationsQuickStats
        apolloCompanies={apolloCompanies}
        apolloContacts={apolloContacts}
        adConversions={adConversions}
        linkedinData={linkedinData}
        metrics={metrics}
        isLoading={isLoading}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <IntegrationsTabsNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <IntegrationsTabsContent
          activeTab={activeTab}
          apolloCompanies={apolloCompanies}
          apolloContacts={apolloContacts}
          adConversions={adConversions}
          touchpoints={touchpoints}
          integrationLogs={integrationLogs}
          integrationConfigs={integrationConfigs}
          metrics={metrics}
          isLoading={isLoading}
          enrichCompanyWithApollo={enrichCompanyWithApollo}
          enrichContactsForCompany={enrichContactsForCompany}
          updateIntegrationConfig={updateIntegrationConfig}
        />
      </Tabs>
    </div>
  );
};

export default IntegrationsManager;
