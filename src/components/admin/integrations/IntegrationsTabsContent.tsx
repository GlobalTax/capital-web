
import React from 'react';
import { Activity } from 'lucide-react';
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
    <div className="space-y-6">
      {activeTab === 'overview' && (
        <OverviewTabContent 
          metrics={metrics}
          integrationConfigs={integrationConfigs}
        />
      )}

      {activeTab === 'apollo' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Apollo Intelligence</h3>
            <div className="text-sm text-muted-foreground">
              Companies + Contacts unificado
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        </div>
      )}

      {activeTab === 'marketing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Marketing Attribution</h3>
            <div className="text-sm text-muted-foreground">
              Google Ads + LinkedIn + Touchpoints
            </div>
          </div>
          
          <AdsTabContent 
            adConversions={adConversions}
            touchpoints={touchpoints}
          />
        </div>
      )}

      {activeTab === 'analytics' && <AnalyticsTabContent />}

      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Automatización</h3>
            <div className="text-sm text-muted-foreground">
              Workflows y triggers automáticos
            </div>
          </div>
          
          <div className="admin-card">
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <p>Configuración de automatizaciones próximamente</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Configuración</h3>
            <div className="text-sm text-muted-foreground">
              API Keys y configuraciones
            </div>
          </div>
          
          <StatusTabContent 
            integrationLogs={integrationLogs}
            integrationConfigs={integrationConfigs}
            onUpdateConfig={updateIntegrationConfig}
          />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Logs & Testing</h3>
            <div className="text-sm text-muted-foreground">
              Debugging y monitoreo
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TestingTabContent />
            <div className="admin-card">
              <h4 className="font-medium mb-4">Logs Recientes</h4>
              <div className="space-y-2">
                {integrationLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{log.operation}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' :
                      log.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsTabsContent;
