
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMarketingIntelligence } from '@/hooks/useMarketingIntelligence';
import { useAttributionAnalytics } from '@/hooks/useAttributionAnalytics';
import PredictiveDashboard from './dashboard/PredictiveDashboard';
import CompanyIntelligence from './dashboard/CompanyIntelligence';
import MarketingOverviewTab from './dashboard/components/MarketingOverviewTab';
import MarketingAttributionTab from './dashboard/components/MarketingAttributionTab';
import MarketingAlertsTab from './dashboard/components/MarketingAlertsTab';
import { Brain, AlertTriangle } from 'lucide-react';

const MarketingIntelligenceDashboard = () => {
  const { 
    companies, 
    events, 
    leadIntelligence, 
    alerts, 
    summary, 
    isLoading,
    getUnreadAlertsCount,
    markAlertAsRead 
  } = useMarketingIntelligence();

  const {
    attributionReport,
    funnelAnalysis,
    customerJourney,
    isLoading: attributionLoading
  } = useAttributionAnalytics();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Marketing Intelligence</h1>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Cargando datos...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg border p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unreadAlerts = getUnreadAlertsCount();

  return (
    <div className="space-y-6">
      {/* Header con Alertas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Marketing Intelligence Platform
          </h1>
          <p className="text-gray-600 mt-1">
            Plataforma avanzada de inteligencia comercial con IA y análisis predictivo
          </p>
        </div>
        
        {unreadAlerts > 0 && (
          <Alert className="w-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {unreadAlerts} alertas nuevas requieren atención
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Tabs Principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictive">
            <Brain className="h-4 w-4 mr-2" />
            IA Predictivo
          </TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {unreadAlerts > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadAlerts}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <MarketingOverviewTab
            companies={companies}
            events={events}
            summary={summary}
            alerts={alerts}
            markAlertAsRead={markAlertAsRead}
          />
        </TabsContent>

        {/* Dashboard Predictivo */}
        <TabsContent value="predictive">
          <PredictiveDashboard />
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-4">
          <MarketingAttributionTab
            attributionLoading={attributionLoading}
            attributionReport={attributionReport}
          />
        </TabsContent>

        {/* Companies Tab - Versión Completa */}
        <TabsContent value="companies" className="space-y-4">
          <CompanyIntelligence />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <MarketingAlertsTab
            alerts={alerts}
            unreadAlerts={unreadAlerts}
            markAlertAsRead={markAlertAsRead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingIntelligenceDashboard;
