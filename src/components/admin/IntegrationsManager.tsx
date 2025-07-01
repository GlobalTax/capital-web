import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useIntegrationsData } from '@/hooks/useIntegrationsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Building2, Target, Users, TrendingUp, UserCheck } from 'lucide-react';
import IntegrationsOverviewTab from './integrations/IntegrationsOverviewTab';
import ApolloIntelligenceTab from './integrations/ApolloIntelligenceTab';
import ApolloContactsTab from './integrations/ApolloContactsTab';
import GoogleAdsAttributionTab from './integrations/GoogleAdsAttributionTab';
import IntegrationsStatusPanel from './integrations/IntegrationsStatusPanel';
import IntegrationsHealthDashboard from './integrations/IntegrationsHealthDashboard';
import ApolloTestingPanel from './integrations/ApolloTestingPanel';

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Integraciones Estratégicas</h1>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Cargando integraciones...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            Integraciones Estratégicas
          </h1>
          <p className="text-gray-600 mt-1">
            Apollo, Google Ads, LinkedIn y más - Todo conectado en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apollo Companies</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apolloCompanies.length}</div>
            <p className="text-xs text-gray-600">Empresas enriquecidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apollo Contacts</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apolloContacts.length}</div>
            <p className="text-xs text-gray-600">Contactos identificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Ads</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adConversions.length}</div>
            <p className="text-xs text-gray-600">Conversiones trackeadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LinkedIn Intel</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkedinData.length}</div>
            <p className="text-xs text-gray-600">Señales sociales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-gray-600">Integraciones exitosas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview General
            </button>
            <button
              onClick={() => setActiveTab('apollo')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'apollo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚀 Apollo Companies
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Apollo Contacts
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Google Ads Attribution
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧪 Testing & Health
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Status & Logs
            </button>
          </nav>
        </div>

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
      </Tabs>
    </div>
  );
};

export default IntegrationsManager;
