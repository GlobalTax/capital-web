
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMarketingIntelligence } from '@/hooks/useMarketingIntelligence';
import { useAttributionAnalytics } from '@/hooks/useAttributionAnalytics';
import PredictiveDashboard from './dashboard/PredictiveDashboard';
import { 
  Users, TrendingUp, AlertTriangle, Target, 
  BarChart3, Clock, Brain, Zap, Eye, 
  Building2, Mail, Phone, Download 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

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
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
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
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas Identificadas</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companies.length}</div>
                <p className="text-xs text-gray-600">
                  {companies.filter(c => c.visitCount > 1).length} visitantes recurrentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Calientes</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summary?.leadScore?.high || 0}
                </div>
                <p className="text-xs text-gray-600">
                  Score ≥ 70 puntos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-gray-600">
                  Últimos 30 días
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.attribution?.totalConversions || 0}
                </div>
                <p className="text-xs text-gray-600">
                  Tasa: {summary?.attribution?.conversionRate?.toFixed(1) || 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel de Conversión */}
            <Card>
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.conversionFunnel && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summary.conversionFunnel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Canales de Attribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Canales de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.attribution?.topChannels && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summary.attribution.topChannels}
                        dataKey="attributedValue"
                        nameKey="channel"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ channel, attributedValue }) => `${channel}: €${attributedValue.toFixed(0)}`}
                      >
                        {summary.attribution.topChannels.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`€${value}`, 'Valor Atribuido']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actividad Reciente y Top Empresas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Empresas por Score */}
            <Card>
              <CardHeader>
                <CardTitle>Top Empresas por Lead Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companies
                    .sort((a, b) => b.engagementScore - a.engagementScore)
                    .slice(0, 5)
                    .map((company, index) => (
                    <div key={company.domain} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{company.name}</h4>
                          <p className="text-sm text-gray-600">{company.industry} • {company.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{company.engagementScore}</div>
                        <div className="text-xs text-gray-500">{company.visitCount} visitas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas Recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Alertas Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="border-l-4 border-red-400 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{alert.priority.toUpperCase()}</Badge>
                        <span className="text-xs text-gray-500">{alert.type}</span>
                      </div>
                      <h4 className="font-semibold text-sm mt-1">{alert.title}</h4>
                      <p className="text-xs text-gray-600">{alert.description}</p>
                      {!alert.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => markAlertAsRead(alert.id)}
                        >
                          Marcar como leída
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Predictivo */}
        <TabsContent value="predictive">
          <PredictiveDashboard />
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-4">
          {attributionLoading ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos de atribución...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Métricas de Attribution */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Conversiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attributionReport?.totalConversions || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Valor Total</CardTitle>  
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{attributionReport?.totalValue?.toFixed(0) || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Path Length Promedio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attributionReport?.averagePathLength?.toFixed(1) || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tiempo a Conversión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attributionReport?.averageTimeToConversion?.toFixed(0) || 0}h</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance por Canal */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Canal</th>
                          <th className="text-left p-2">Valor Atribuido</th>
                          <th className="text-left p-2">Conversiones</th>
                          <th className="text-left p-2">Touchpoints</th>
                          <th className="text-left p-2">Valor/Conversión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributionReport?.channelPerformance?.map((channel: any) => (
                          <tr key={channel.channel} className="border-b">
                            <td className="p-2 font-medium">{channel.channel}</td>
                            <td className="p-2">€{channel.attributedValue.toFixed(0)}</td>
                            <td className="p-2">{channel.conversions}</td>
                            <td className="p-2">{channel.touchPoints}</td>
                            <td className="p-2">€{channel.valuePerConversion.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Empresas Identificadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-left p-2">Industria</th>
                      <th className="text-left p-2">Ubicación</th>
                      <th className="text-left p-2">Visitas</th>
                      <th className="text-left p-2">Engagement</th>
                      <th className="text-left p-2">Última Visita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.domain} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-xs text-gray-500">{company.domain}</div>
                          </div>
                        </td>
                        <td className="p-2">{company.industry}</td>
                        <td className="p-2">{company.location}</td>
                        <td className="p-2">{company.visitCount}</td>
                        <td className="p-2">
                          <Badge variant={company.engagementScore > 70 ? 'default' : 'secondary'}>
                            {company.engagementScore}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs text-gray-600">
                          {new Date(company.lastVisit).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Todas las Alertas
                {unreadAlerts > 0 && (
                  <Badge variant="destructive">{unreadAlerts} nuevas</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${!alert.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.priority === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">{alert.type}</span>
                        {!alert.isRead && <Badge variant="outline">NUEVA</Badge>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-2">{alert.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                    
                    {alert.actionItems && alert.actionItems.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-800 mb-1">Acciones recomendadas:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {alert.actionItems.map((action, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Confianza: {alert.confidence}%
                      </span>
                      {!alert.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAlertAsRead(alert.id)}
                        >
                          Marcar como leída
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingIntelligenceDashboard;
