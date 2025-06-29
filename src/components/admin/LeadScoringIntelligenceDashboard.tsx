
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProspectsDashboard from './dashboard/ProspectsDashboard';
import LeadScoringRulesManager from './dashboard/LeadScoringRulesManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, Star, AlertCircle, Settings } from 'lucide-react';

const LeadScoringIntelligenceDashboard = () => {
  const { unreadAlerts, getLeadStats } = useAdvancedLeadScoring();
  const stats = getLeadStats();

  return (
    <div className="space-y-6">
      {/* Header con stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Activos</p>
                <p className="text-2xl font-bold">{stats?.totalLeads || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Calientes</p>
                <p className="text-2xl font-bold text-red-600">{stats?.hotLeadsCount || 0}</p>
              </div>
              <Star className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.averageScore || 0}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                <p className="text-2xl font-bold text-purple-600">{unreadAlerts?.length || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="prospects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prospects" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard de Prospectos
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Reglas de Scoring
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Analytics Avanzados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6">
          <ProspectsDashboard />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <LeadScoringRulesManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Top Fuentes de Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topSources?.slice(0, 5).map(({ domain, count }, index) => (
                    <div key={domain} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{domain}</span>
                      </div>
                      <Badge>{count} leads</Badge>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No hay datos de fuentes disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lead Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.leadsByStatus && Object.entries(stats.leadsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="font-medium capitalize">{status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / (stats.totalLeads || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No hay datos de distribución disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🔄 Embudo de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.totalLeads || 0}</div>
                    <div className="text-sm text-gray-600">Visitantes Registrados</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats?.hotLeadsCount || 0}</div>
                    <div className="text-sm text-gray-600">Leads Calientes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.leadsByStatus?.contacted || 0}
                    </div>
                    <div className="text-sm text-gray-600">Contactados</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.leadsByStatus?.converted || 0}
                    </div>
                    <div className="text-sm text-gray-600">Convertidos</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Tasa de Conversión: {stats?.conversionRate || '0'}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadScoringIntelligenceDashboard;
