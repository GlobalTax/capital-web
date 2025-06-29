
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketingHub } from '@/hooks/useMarketingHub';
import MarketingHubKPIs from './hub/MarketingHubKPIs';
import ContentPerformanceTab from './hub/ContentPerformanceTab';
import LeadScoringHubTab from './hub/LeadScoringHubTab';
import EmailMarketingTab from './hub/EmailMarketingTab';
import ROIAnalyticsTab from './hub/ROIAnalyticsTab';
import { BarChart3, Users, Mail, TrendingUp, Target, FileText } from 'lucide-react';

const MarketingHubDashboard = () => {
  const {
    marketingMetrics,
    contentPerformance,
    leadScoringAnalytics,
    emailMetrics,
    roiAnalytics,
    isLoadingMetrics
  } = useMarketingHub();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoadingMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Marketing Hub</h1>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Cargando métricas...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Marketing Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Dashboard completo de métricas de marketing y análisis de ROI
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>

      {/* KPIs Principales */}
      <MarketingHubKPIs metrics={marketingMetrics} />

      {/* Tabs Principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Target className="h-4 w-4 mr-2" />
            Lead Scoring
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Marketing
          </TabsTrigger>
          <TabsTrigger value="roi">
            <TrendingUp className="h-4 w-4 mr-2" />
            ROI Analytics
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <Users className="h-4 w-4 mr-2" />
            Traffic Intel
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen de ROI */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 ROI General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {roiAnalytics?.overallROI}%
                  </div>
                  <p className="text-gray-600">Retorno de Inversión Global</p>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold">€{roiAnalytics?.totalInvestment.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Inversión Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">€{roiAnalytics?.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Ingresos Generados</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Canales */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Top Canales por ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roiAnalytics?.channelROI.slice(0, 4).map((channel, index) => (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="font-medium">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{channel.roi}%</div>
                        <div className="text-xs text-gray-500">{channel.leads} leads</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🔥 Leads Calientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {marketingMetrics?.hotProspects}
                </div>
                <p className="text-gray-600">Score > 80 puntos</p>
                <div className="mt-2 text-sm text-green-600">
                  +{Math.floor(Math.random() * 10 + 5)} esta semana
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📧 Email Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Open Rate:</span>
                    <span className="font-bold">{marketingMetrics?.emailOpenRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Click Rate:</span>
                    <span className="font-bold">{marketingMetrics?.emailClickRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion:</span>
                    <span className="font-bold">{marketingMetrics?.sequenceCompletionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Conversión Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {marketingMetrics?.leadConversionRate.toFixed(1)}%
                </div>
                <p className="text-gray-600">Visitante → Lead</p>
                <div className="mt-2 text-sm">
                  {marketingMetrics?.totalLeads} leads de {marketingMetrics?.totalVisitors} visitantes
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content">
          <ContentPerformanceTab contentPerformance={contentPerformance} />
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="leads">
          <LeadScoringHubTab 
            leadScoringAnalytics={leadScoringAnalytics} 
            marketingMetrics={marketingMetrics}
          />
        </TabsContent>

        {/* Email Marketing Tab */}
        <TabsContent value="email">
          <EmailMarketingTab emailMetrics={emailMetrics} />
        </TabsContent>

        {/* ROI Analytics Tab */}
        <TabsContent value="roi">
          <ROIAnalyticsTab roiAnalytics={roiAnalytics} />
        </TabsContent>

        {/* Traffic Intelligence Tab */}
        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>🌐 Traffic Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {marketingMetrics?.totalVisitors}
                  </div>
                  <div className="text-gray-600 mt-2">Visitantes Totales</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {marketingMetrics?.companyVisitors}
                  </div>
                  <div className="text-gray-600 mt-2">Visitantes Empresa</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {marketingMetrics?.identifiedCompanies}
                  </div>
                  <div className="text-gray-600 mt-2">Empresas Identificadas</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> Las empresas identificadas representan el {
                    marketingMetrics?.totalVisitors ? 
                    ((marketingMetrics.identifiedCompanies / marketingMetrics.totalVisitors) * 100).toFixed(1) 
                    : 0
                  }% de tu tráfico total. 
                  Considera implementar más herramientas de identificación para aumentar este porcentaje.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingHubDashboard;
