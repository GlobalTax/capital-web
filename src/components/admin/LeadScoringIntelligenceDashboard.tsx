
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProspectsDashboard from './dashboard/ProspectsDashboard';
import LeadScoringRulesManager from './dashboard/LeadScoringRulesManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { TrendingUp, Users, Target, Star, AlertCircle, Settings, BarChart3, Lightbulb, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const LeadScoringIntelligenceDashboard = () => {
  const { unreadAlerts, getLeadStats, allLeads, hotLeads } = useAdvancedLeadScoring();
  const stats = getLeadStats();

  // Calcular distribución de scores
  const scoreDistribution = React.useMemo(() => {
    if (!allLeads) return { cold: 0, warm: 0, hot: 0 };
    
    return {
      cold: allLeads.filter(lead => lead.total_score <= 40).length,
      warm: allLeads.filter(lead => lead.total_score > 40 && lead.total_score <= 70).length,
      hot: allLeads.filter(lead => lead.total_score > 70).length,
    };
  }, [allLeads]);

  // Calcular score promedio por industria
  const averageScoreByIndustry = React.useMemo(() => {
    if (!allLeads) return {};
    
    const industriesMap: Record<string, number[]> = {};
    allLeads.forEach(lead => {
      if (lead.industry) {
        if (!industriesMap[lead.industry]) {
          industriesMap[lead.industry] = [];
        }
        industriesMap[lead.industry].push(lead.total_score);
      }
    });

    const result: Record<string, number> = {};
    Object.keys(industriesMap).forEach(industry => {
      const scores = industriesMap[industry];
      result[industry] = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      );
    });

    return result;
  }, [allLeads]);

  // Preparar datos para gráficos
  const distributionData = [
    { name: 'Cold (0-40)', value: scoreDistribution.cold, color: '#3b82f6' },
    { name: 'Warm (41-70)', value: scoreDistribution.warm, color: '#f59e0b' },
    { name: 'Hot (71-100)', value: scoreDistribution.hot, color: '#ef4444' }
  ];

  const industryData = Object.entries(averageScoreByIndustry).map(([industry, score]) => ({
    industry: industry.length > 15 ? industry.substring(0, 15) + '...' : industry,
    score
  }));

  // Generar tendencias simuladas para los últimos 30 días
  const scoringTrends = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        average_score: Math.floor(Math.random() * 20) + 50 + (stats?.averageScore || 0) / 2,
        hot_leads: Math.floor(Math.random() * 5) + (stats?.hotLeadsCount || 0) / 6
      };
    });
  }, [stats]);

  // Generar insights inteligentes
  const insights = React.useMemo(() => {
    const insights = [];
    
    if (stats?.hotLeadsCount && stats.hotLeadsCount > 0) {
      insights.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Oportunidad Inmediata',
        message: `Tienes ${stats.hotLeadsCount} hot prospects que requieren contacto inmediato del equipo comercial.`,
        priority: 'high'
      });
    }

    if (scoreDistribution.warm > 0) {
      insights.push({
        type: 'warning',
        icon: '⚡',
        title: 'Nurturing Priority',
        message: `${scoreDistribution.warm} leads en zona warm necesitan nurturing específico para convertir.`,
        priority: 'medium'
      });
    }

    const topIndustry = Object.entries(averageScoreByIndustry)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topIndustry) {
      insights.push({
        type: 'success',
        icon: '🎯',
        title: 'Mejor Industria',
        message: `${topIndustry[0]} tiene el score promedio más alto (${topIndustry[1]} puntos).`,
        priority: 'low'
      });
    }

    return insights;
  }, [stats, scoreDistribution, averageScoreByIndustry]);

  // Generar recomendaciones de acciones
  const recommendations = React.useMemo(() => {
    const actions = [];

    if (stats?.hotLeadsCount && stats.hotLeadsCount > 0) {
      actions.push({
        priority: 'URGENT',
        color: 'bg-red-100 text-red-800',
        title: 'Contactar Hot Prospects',
        description: `${stats.hotLeadsCount} leads con score > 80 necesitan contacto inmediato`,
        action: 'Ir a Hot Prospects'
      });
    }

    if (scoreDistribution.warm > 0) {
      actions.push({
        priority: 'HIGH',
        color: 'bg-orange-100 text-orange-800',
        title: 'Secuencias de Nurturing',
        description: `Activar campañas específicas para ${scoreDistribution.warm} warm leads`,
        action: 'Configurar Nurturing'
      });
    }

    actions.push({
      priority: 'MEDIUM',
      color: 'bg-blue-100 text-blue-800',
      title: 'Optimizar Reglas',
      description: 'Revisar reglas de scoring para industrias con bajo rendimiento',
      action: 'Gestionar Reglas'
    });

    actions.push({
      priority: 'LOW',
      color: 'bg-green-100 text-green-800',
      title: 'Contenido Específico',
      description: 'Crear contenido para cold leads en industrias específicas',
      action: 'Crear Contenido'
    });

    return actions;
  }, [stats, scoreDistribution]);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prospects" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard de Prospectos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Avanzados
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights & Acciones
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Reglas de Scoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6">
          <ProspectsDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de Scores */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Distribución de Lead Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {scoreDistribution.cold}
                    </div>
                    <div className="text-xs text-gray-500">Cold Leads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {scoreDistribution.warm}
                    </div>
                    <div className="text-xs text-gray-500">Warm Leads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {scoreDistribution.hot}
                    </div>
                    <div className="text-xs text-gray-500">Hot Leads</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score por Industria */}
            <Card>
              <CardHeader>
                <CardTitle>🏭 Score Promedio por Industria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="industry" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tendencias de Scoring */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Tendencias de Lead Scoring (Últimos 30 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={scoringTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="score" orientation="left" />
                  <YAxis yAxisId="leads" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="score"
                    type="monotone" 
                    dataKey="average_score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Score Promedio"
                  />
                  <Line 
                    yAxisId="leads"
                    type="monotone" 
                    dataKey="hot_leads" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Hot Leads"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Embudo de Conversión */}
          <Card>
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
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights Inteligentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Lead Scoring Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className={`p-3 border-l-4 ${
                      insight.priority === 'high' ? 'border-red-400 bg-red-50' :
                      insight.priority === 'medium' ? 'border-orange-400 bg-orange-50' :
                      'border-blue-400 bg-blue-50'
                    }`}>
                      <p className={`text-sm ${
                        insight.priority === 'high' ? 'text-red-800' :
                        insight.priority === 'medium' ? 'text-orange-800' :
                        'text-blue-800'
                      }`}>
                        <strong>{insight.icon} {insight.title}:</strong> {insight.message}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Acciones Recomendadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Acciones Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge className={rec.color}>{rec.priority}</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                        <Button size="sm" variant="outline" className="text-xs">
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Lead Sources */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Top Fuentes de Leads & Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Fuentes Principales</h3>
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
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Distribución por Estado</h3>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <LeadScoringRulesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadScoringIntelligenceDashboard;
